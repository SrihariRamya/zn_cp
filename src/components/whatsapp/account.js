import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  Image,
  Row,
  Col,
  notification,
  Spin,
  Input,
  Skeleton,
  Button,
  Form,
  Divider,
  Select,
  Space,
  Alert,
  // Modal,
} from 'antd';
import { filter, get, isEmpty, map } from 'lodash';
import axios from 'axios';
import {
  // DeleteOutlined,
  PlusOutlined,
  // ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  FAILED_TO_LOAD,
  // WHATSAPP_NUMBER_STATUS,
  WHATSAPP_NUMBER_EXITS,
} from '../../shared/constant-values';
import getFormItemRules from '../../shared/form-helpers';
import { TenantContext } from '../context/tenant-context';
import socket from '../../utils/api/socket-helper';
import {
  getTenantWhatsappNumbers,
  logoutWhatsappNumber,
} from '../../utils/api/url-helper';
import {
  handleInsertWhatsappNumber,
  isValidUrl,
} from '../../shared/function-helper';

const { Option } = Select;
// const { confirm } = Modal;

function Account(properties) {
  const { account, handleRefresh, accountLoading } = properties;
  const [form] = Form.useForm();
  const inputReference = useRef(null);
  const [loading, setLoading] = useState(false);
  const [active] = useState(true);
  const [tenantDetails] = useContext(TenantContext);
  const [qrImage, setQrImage] = useState('');
  const [qrButtonText, setQrButtonText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selectedMobile, setSelectedMobile] = useState('');
  const [refreshEnable, setRefreshEnable] = useState(false);
  const tenantUid = localStorage.getItem('tenantUid');
  const [whatsappData, setWhatsappData] = useState({});
  const whatsAppApiUrl = get(tenantDetails, 'WhatsAppAPI', '');

  const handleSocketConnect = () => {
    if (!socket) {
      const socketData = {
        tenant_uid: tenantUid,
      };
      socket.connect();
      socket.emit('join', socketData);
    }
  };

  const handleAddMobile = (event) => {
    const { value } = event.target;
    setInputValue(value);
    setSelectedMobile('');
    handleSocketConnect();
    form.setFieldsValue({ whatsapp_number: value });
  };

  const handleSelectMobile = async (value) => {
    setInputValue('');
    form.setFieldsValue({ whatsapp_number: '' });
    setSelectedMobile(value);
    const filteredAccount = filter(account, ['mobile', value], []);
    const isLogged = get(filteredAccount, '[0].is_logged', false);
    const buttonText = isLogged ? 'Logout' : 'Login';
    setQrButtonText(buttonText);
  };

  const handleFetchWhatsappData = async () => {
    const tenantData = await getTenantWhatsappNumbers();
    setWhatsappData(tenantData?.data);
  };

  useEffect(() => {
    handleFetchWhatsappData();
  }, []);

  useEffect(() => {
    socket.on('error', (error) => {
      notification.error({
        message: error.message || 'Socket connection error',
      });
      socket.connect();
    });
    if (socket) {
      const socketData = {
        tenant_uid: tenantUid,
      };
      socket.emit('join', socketData);
      socket.on('qr_code_status', async (data) => {
        const { code, error } = data;
        if (error?.message) {
          notification.warning({
            message: error?.message || 'Login Failed please try again',
          });
        }
        if (code === 'LOGIN_SUCCESSFUL') {
          notification.success({ message: 'Login Successfully' });
          setQrButtonText('');
          setRefreshEnable(false);
          setSelectedMobile('');
          form.resetFields();
          setQrImage('');
          setInputValue('');
          handleRefresh();
        }
      });
      socket.on('on_stream_change', async (data) => {
        const {
          tenant_uid: tenantUID,
          streamData,
          whatsapp_uid: whatsappUId,
          error,
        } = data;
        if (error?.message) {
          notification.warning({
            message: error?.message || 'Failed to get on stream event',
          });
        }
        if (tenantUid === tenantUID && streamData === 'DISCONNECTED') {
          const formData = {
            whatsapp_uid: whatsappData?.whatsapp_uid || whatsappUId,
          };
          logoutWhatsappNumber(formData)
            .then(async () => {
              setLoading(false);
              setInputValue('');
              setSelectedMobile('');
              setQrButtonText('');
              notification.success({
                message: 'Account logged out successfully',
              });
              handleRefresh();
            })
            .catch((error_) => {
              notification.error({
                message:
                  error_.message ||
                  'Some error occurred while delete logout number chats',
              });
            });
        }
      });
    }
    return () => {
      socket.off();
    };
  }, [socket]);

  const handleLogin = async () => {
    const loginStatus = await axios.get(
      `${whatsAppApiUrl}/users/get-account-login-status`,
      {
        params: {
          mobileNumber: inputValue || selectedMobile,
          referenceId: tenantUid,
        },
      }
    );
    const {
      data: {
        data: { code = '', message = '' },
      },
    } = loginStatus;
    if (code === 'LOGGED_IN' && message === 'Account is active') {
      setQrImage('');
      setQrButtonText('');
      setRefreshEnable(true);
      setSelectedMobile(inputValue);
      setLoading(false);
      return notification.error({
        message: 'Account is already logged in',
      });
    }
    const value = isValidUrl(get(tenantDetails, 'customer_url', ''));
    const callbackUrl = value
      ? `${get(tenantDetails, 'customer_url', '')}`
      : `https://${get(tenantDetails, 'customer_url', '')}`;

    axios
      .get(`${whatsAppApiUrl}/users/qrCode`, {
        params: {
          mobileNumber: inputValue || selectedMobile,
          reference_id: tenantUid,
          callback_url: callbackUrl,
        },
        responseType: 'blob',
      })
      .then((responseContent) => {
        const respContentType = responseContent.headers['content-type'];
        if (respContentType === 'image/png') {
          const blobUrl = URL.createObjectURL(responseContent.data);
          setQrImage(blobUrl);
          setQrButtonText('');
          setRefreshEnable(true);
          setSelectedMobile(inputValue);
          handleInsertWhatsappNumber(inputValue || selectedMobile);
        } else if (respContentType === 'application/json') {
          let messageData;
          try {
            messageData = JSON.parse(
              Buffer.from(responseContent.data).toString('utf8')
            );
          } catch {
            messageData = {};
          }
          notification.error({
            message: get(messageData, 'message', FAILED_TO_LOAD),
          });
          setQrImage('');
          setInputValue('');
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setQrImage('');
        setRefreshEnable(false);
        notification.error({
          message: get(error, 'response.data.message', FAILED_TO_LOAD),
        });
      });
    return '';
  };

  const onFinish = async () => {
    setLoading(true);
    handleSocketConnect();
    if (qrButtonText === 'Logout') {
      axios
        .get(`${whatsAppApiUrl}/users/logout`, {
          params: {
            mobileNumber: selectedMobile,
            referenceId: tenantUid,
          },
        })
        .then(() => {})
        .catch((error) => {
          notification.error({
            message: get(error, 'response.data.message', FAILED_TO_LOAD),
          });
          setQrButtonText('Login');
        });
      setLoading(false);
      setInputValue('');
      setQrButtonText('');
      setRefreshEnable(false);
    }
    if (qrButtonText === 'Login') {
      return handleLogin();
    }
    return '';
  };
  const addItem = () => {
    if (inputValue) {
      const filteredAccount = filter(account, ['mobile', inputValue], []);
      if (isEmpty(filteredAccount)) {
        setLoading(true);
        return handleLogin();
      }
      return notification.error({
        message: WHATSAPP_NUMBER_EXITS,
      });
    }
    return '';
  };
  // const showConfirm = (value) => {
  //   confirm({
  //     title: `Are you sure want to delete your mobile number ${value}?`,
  //     icon: <ExclamationCircleOutlined />,
  //     content:
  //       'The jobs associated with your mobile number will be deleted as well.',
  //     onOk() {
  //       return axios
  //         .delete(`${whatsAppApiUrl}/delete-account`, {
  //           params: {
  //             referenceId: tenantUid,
  //             mobile: value,
  //           },
  //         })
  //         .then((responseContent) => {
  //           notification.success({
  //             message:
  //               responseContent?.data?.message ||
  //               'Account number has been deleted successfully.',
  //           });
  //           setLoading(false);
  //           form.setFieldsValue({ whatsapp_number: '' });
  //           setSelectedMobile('');
  //           setQrButtonText('');
  //           handleRefresh();
  //         })
  //         .catch((error) => {
  //           setLoading(false);
  //           notification.error({
  //             message: get(error, 'error', FAILED_TO_LOAD),
  //           });
  //         });
  //     },
  //     onCancel() {},
  //   });
  // };

  // const handleDeleteNumber = (value) => {
  //   const filteredAccount = filter(account, ['mobile', value], []);
  //   const isLogged = get(filteredAccount, '[0].is_logged', false);
  //   if (isLogged) {
  //     return notification.error({
  //       message: WHATSAPP_NUMBER_STATUS,
  //     });
  //   }
  //   return showConfirm(value);
  // };

  const dropDownRenderFunction = (menu) => {
    return (
      <>
        {menu}
        <Divider
          style={{
            margin: '8px 0',
          }}
        />
        <Space
          style={{
            padding: '0 8px 4px',
          }}
        >
          <Form.Item
            name="whatsapp_number"
            className="account-input"
            rules={[
              {
                required: true,
                message: 'Enter whatsapp phone number!',
              },
              ...getFormItemRules({ mobile: true }),
            ]}
          >
            <Input
              style={{
                marginTop: '12px',
              }}
              placeholder="Add whatsapp number"
              ref={inputReference}
              value={inputValue}
              type="number"
              onChange={(event) => {
                handleAddMobile(event);
              }}
            />
          </Form.Item>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={loading}
            onClick={addItem}
          >
            Add
          </Button>
        </Space>
      </>
    );
  };

  return (
    <Spin spinning={loading}>
      <div className="box">
        <div className="box__header bg-gray-lighter">
          <h3 className="box-title">Whatsapp bulk message</h3>
        </div>
        <div className="box-content-background">
          <div className="card-container report">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col span={12} offset={8}>
                <Form
                  name="customized_form_controls"
                  form={form}
                  layout="inline"
                  onFinish={onFinish}
                >
                  <Form.Item label="Select whatsapp number">
                    <Select
                      virtual={false}
                      style={{
                        width: 300,
                      }}
                      className="account-select"
                      value={selectedMobile || 'Choose whatsapp number'}
                      placeholder="Select Whatsapp Number"
                      onChange={handleSelectMobile}
                      loading={accountLoading}
                      dropdownRender={(menu) => dropDownRenderFunction(menu)}
                    >
                      {' '}
                      {account &&
                        map(account, (item) => (
                          <Option key={item.id} value={item.mobile}>
                            <Space>
                              {item.mobile}
                              {/* {
                                <div className="delete-icon">
                                  <DeleteOutlined
                                    onClick={() => {
                                      handleDeleteNumber(item.mobile);
                                    }}
                                  />
                                </div>
                              } */}
                            </Space>
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                  {qrButtonText && (
                    <Form.Item>
                      <Button type="primary" onClick={onFinish}>
                        {qrButtonText}
                      </Button>
                    </Form.Item>
                  )}
                  <Form.Item>
                    {refreshEnable && (
                      <Button
                        type="primary"
                        onClick={() => window.location.reload()}
                      >
                        Refresh
                      </Button>
                    )}
                  </Form.Item>
                </Form>
              </Col>
            </Row>
            <br />
            <Row>
              <Col span={12} offset={6} style={{ textAlign: 'center' }}>
                {qrImage ? (
                  <Image
                    style={{ width: '50%' }}
                    src={qrImage}
                    preview={false}
                  />
                ) : (
                  <Skeleton.Image
                    size="large"
                    // style={{ width: 250, height: 250 }}
                    active={active}
                  />
                )}
              </Col>
            </Row>
            {refreshEnable && (
              <Row className="alert-show">
                <Alert
                  className="text-mb7"
                  message="After scanning the QR code, if the screen is not refreshing automatically, please click the refresh button."
                  type="warning"
                  showIcon
                />
              </Row>
            )}
          </div>
        </div>
      </div>
    </Spin>
  );
}

export default Account;
