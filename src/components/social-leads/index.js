import React, { useState, useEffect, useContext } from 'react';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import {
  Button,
  Modal,
  Input,
  Form,
  Spin,
  notification,
  Skeleton,
  Image,
  Row,
  Col,
  Typography,
  Select,
  Tabs,
  Alert,
} from 'antd';
import axios from 'axios';
import { filter, get, isEmpty } from 'lodash';
import Icon from '@ant-design/icons/lib/components/Icon';
// import io from 'socket.io-client';
import { ReloadOutlined } from '@ant-design/icons';
import { FAILED_TO_LOAD_SOCIAL_LEADS } from '../../shared/constant-values';
import List from './list';
import CardItem from './card';
import MetaCard from './meta';
import {
  getTenantWhatsappNumbers,
  getSocialLeads,
  cardTabChange,
  createSocialLeadsTab,
  insertWhatsappNumber,
  storeChatHistoryMessage,
  logoutWhatsappNumber,
  getMessengerConversation,
  getFbLongLivedToken,
  getFbPageDetails,
  disconnectAuth,
  manualLogin,
} from '../../utils/api/url-helper';
import {
  getParticularTabCardData,
  isValidUrl,
} from '../../shared/function-helper';
import { ReactComponent as Whatsapp } from '../../assets/icons/WhatsApp-Logo.wine.svg';
import { TenantContext } from '../context/tenant-context';
import socket from '../../utils/api/socket-helper';
import { withRouter } from '../../utils/react-router/index';

const { Title } = Typography;
const { TabPane } = Tabs;

function SocialLeads() {
  const [form] = Form.useForm();
  const [active] = useState(true);
  const [socialLeads, setSocialLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tabName, setTabName] = useState('');
  // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
  const [tenantDetails, , , tenantConfig] = useContext(TenantContext);
  const [whatsappLogin, setWhatsappLogin] = useState(false);
  const tenantUid = localStorage.getItem('tenantUid');
  const [qrImage, setQrImage] = useState('');
  const [tenantWhatsappDetail, setTenantWhatsappDetail] = useState({});
  const [wsloginStatus, setWsLoginStatus] = useState(false);
  const [qrCodemodelLoader, setQrCodemodelLoader] = useState(false);
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem('socialLeadTab') || 'whatsapp'
  );
  const [metaMessenger, setMetaMessenger] = useState([]);
  const [fbPageId, setFbPageId] = useState('');
  const [igPageId, setIgPageId] = useState('');
  const [selectedPageId, setSelectedPageId] = useState('');
  const [fbPageData, setFbPageData] = useState([]);

  const [disableSubmit, setDisableSubmit] = useState(false);
  const [refreshState, setRefreshState] = useState(true);
  const fetchMessengerData = async () => {
    setLoading(true);
    getMessengerConversation({ tenantUid, pageId: selectedPageId })
      .then((data) => {
        setLoading(false);
        setMetaMessenger(data?.data);
        setFbPageId(data?.fbPageId);
        setIgPageId(data?.igPageId);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: error.message || 'Some error occurred while fetching data',
        });
      });
  };

  useEffect(() => {
    if (selectedPageId) {
      fetchMessengerData();
    }
  }, [selectedPageId, activeTab]);

  useEffect(() => {
    localStorage.setItem('socialLeadTab', activeTab);
  }, [activeTab]);

  const getFbPages = () => {
    setLoading(true);
    getFbPageDetails(tenantUid)
      .then((response) => {
        if (response?.data) {
          const pageData = response?.data?.data;
          const pageList = pageData?.map((item) => {
            return { value: item.id, label: item.name };
          });
          setLoading(false);
          setSelectedPageId(
            response?.pageId?.toString() || pageList?.[0]?.value
          );
          setFbPageData(pageList);
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message:
            error.message ||
            'some error occcured while getting fb page details',
        });
      });
  };

  useEffect(() => {
    if (activeTab === 'messenger') getFbPages();
  }, [activeTab]);

  const fetchAllWhatsappData = (values) => {
    const whatsAppApiUrl = get(tenantDetails, 'WhatsAppAPI', '');
    if (whatsAppApiUrl) {
      axios
        .get(`${whatsAppApiUrl}/users/get-all-accounts`, {
          params: { reference_id: tenantUid },
        })
        .then(async (responseData) => {
          const data = get(responseData, 'data.data', []);
          if (get(data, 'length') > 0) {
            const filteredData = filter(data, ['is_logged', 1], []);
            if (get(filteredData, 'length') > 0) {
              const filteredMobileNumber = get(filteredData, '[0].mobile');
              const response = await manualLogin({
                phone_number: filteredMobileNumber,
              });
              if (get(response, 'success') && values === 'reload') {
                window.location.reload();
              }
            }
          }
          setLoading(false);
        })
        .catch((error) => {
          notification.error({
            message: get(
              error,
              'response.data.message',
              FAILED_TO_LOAD_SOCIAL_LEADS
            ),
          });
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchAllWhatsappData();
  }, []);

  const whatsAppApiUrl =
    get(tenantDetails, 'WhatsAppAPI', '') ||
    get(tenantConfig, 'WhatsAppAPI', '');
  const fetchData = async () => {
    setLoading(true);
    try {
      const tenantData = await getTenantWhatsappNumbers();
      setTenantWhatsappDetail(tenantData?.data);
      const loginStatus = await axios.get(
        `${whatsAppApiUrl}/users/get-account-login-status`,
        {
          params: {
            mobileNumber: get(tenantData, 'data.mobile_number', ''),
            referenceId: tenantUid,
          },
        }
      );
      const {
        data: {
          data: { code = '', message = '' },
        },
      } = loginStatus;
      const parameter = {
        whatsapp_uid:
          tenantData?.data?.whatsapp_uid || tenantWhatsappDetail?.whatsapp_uid,
        tenant_uid:
          tenantData?.data?.tenant_uid || tenantWhatsappDetail?.whatsapp_uid,
      };
      if (code === 'LOGGED_IN' && message === 'Account is active') {
        setWsLoginStatus(true);
        const getChatHistory = await axios.get(
          `${whatsAppApiUrl}/users/allChatContacts`,
          {
            params: {
              mobileNumber: get(tenantData, 'data.mobile_number', ''),
              referenceId: tenantUid,
            },
          }
        );
        setWsLoginStatus(true);
        const formData = {
          data: getChatHistory?.data?.formedData,
          tenantLoginWsData: tenantData?.data || tenantWhatsappDetail,
        };
        if (Array.isArray(getChatHistory?.data?.formedData)) {
          await storeChatHistoryMessage(formData);
        }
        getSocialLeads(parameter)
          .then((data) => {
            setSocialLeads(data?.data);
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
            notification.error({
              message:
                error.message || 'Some error occurred while getting leads data',
            });
          });
      } else {
        notification.warning({ message: 'Please login your device' });
      }
    } catch (error) {
      notification.error({
        message:
          error.message ||
          'Some error occurred while getting whatsapp chat details',
      });
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    socket.on('error', (error) => {
      // eslint-disable-next-line no-console
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
          setWsLoginStatus(true);
          setWhatsappLogin(false);
          form.resetFields();
          setQrImage('');
          setTimeout(async () => {
            await fetchData();
          }, 800);
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
          setSocialLeads([]);
          const formData = {
            whatsapp_uid: tenantWhatsappDetail?.whatsapp_uid || whatsappUId,
          };
          logoutWhatsappNumber(formData)
            .then(async () => {
              setWsLoginStatus(false);
              setTimeout(async () => {
                await fetchData();
              }, 800);
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
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'whatsapp') fetchData();
  }, []);

  const onDragEnd = (result) => {
    if (result.destination) {
      const {
        source: { droppableId, index },
        destination,
        draggableId,
      } = result;
      let formData = {};
      if (draggableId?.length < 20) {
        formData = {
          cardData: {
            customer_uid: draggableId,
            tenant_uid: tenantUid,
            app_name: 'FB',
          },
          destination,
        };
      } else {
        const cardData = getParticularTabCardData(
          socialLeads,
          droppableId,
          index
        );
        formData = {
          cardData,
          destination,
        };
      }
      setLoading(true);
      cardTabChange(formData)
        .then(() => {
          if (activeTab === 'whatsapp') {
            fetchData();
          } else {
            fetchMessengerData();
          }
        })
        .catch((error) => {
          setLoading(false);
          notification.error({
            message: error.message || 'Some error occurred while add new tab',
          });
        });
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    if (tabName.trim().length > 0) {
      const formData = {
        tab_name: tabName,
        slug: tabName.toLocaleLowerCase().replace(' ', '_'),
      };
      createSocialLeadsTab(formData)
        .then((resp) => {
          if (resp.success) {
            setIsModalOpen(false);
            notification.success({ message: 'New tab created Successfully' });
            fetchData();
            setTabName('');
          } else {
            notification.error({
              message: resp.message || 'Tab count Exists',
            });
            setTabName('');
          }
        })
        .catch((error) => {
          notification.error({
            message:
              error.message || 'Some error occurred while creating new tab',
          });
        });
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setTabName('');
  };

  const onClickRefresh = async () => {
    let tenantData;
    if (wsloginStatus) {
      if (isEmpty(tenantWhatsappDetail)) {
        tenantData = await getTenantWhatsappNumbers();
        setTenantWhatsappDetail(tenantData?.data);
      }
      setLoading(true);
      const getChatHistory = await axios.get(
        `${whatsAppApiUrl}/users/allChatContacts`,
        {
          params: {
            mobileNumber: tenantData
              ? get(tenantData, 'data.mobile_number', '')
              : get(tenantWhatsappDetail, 'mobile_number', ''),
            referenceId: tenantUid,
          },
        }
      );
      const formData = {
        data: getChatHistory?.data?.formedData,
        tenantLoginWsData: tenantData?.data || tenantWhatsappDetail,
      };
      if (Array.isArray(getChatHistory?.data?.formedData)) {
        await storeChatHistoryMessage(formData);
      }
      const parameters = {
        whatsapp_uid:
          tenantData?.data?.whatsapp_uid || tenantWhatsappDetail?.whatsapp_uid,
      };
      getSocialLeads(parameters)
        .then((data) => {
          setSocialLeads(data?.data);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          notification.error({
            message:
              error.message || 'Some error occurred while getting leads data',
          });
        });
    } else {
      notification.warning({ message: 'Please login your device' });
    }
  };

  const onFinish = (values) => {
    if (values?.phone_number) {
      setQrCodemodelLoader(true);
      if (
        (!isEmpty(tenantWhatsappDetail) &&
          tenantWhatsappDetail?.mobile_number === values?.phone_number) ||
        isEmpty(tenantWhatsappDetail)
      ) {
        const value = isValidUrl(get(tenantDetails, 'customer_url', ''));
        const callbackUrl = value
          ? `${get(tenantDetails, 'customer_url', '')}`
          : `https://${get(tenantDetails, 'customer_url', '')}`;

        axios
          .get(`${whatsAppApiUrl}/users/qrCode`, {
            params: {
              mobileNumber: values?.phone_number,
              reference_id: tenantUid,
              callback_url: callbackUrl,
            },
            responseType: 'blob',
          })
          .then((response) => {
            setQrCodemodelLoader(false);
            setRefreshState(false);
            const responseType = response.headers['content-type'];
            // eslint-disable-next-line default-case
            switch (responseType) {
              case 'image/png': {
                const blobUrl = URL.createObjectURL(response.data);
                setQrImage(blobUrl);
                // setWsLoginStatus(true); // As per saravana's consent removed this line
                insertWhatsappNumber({
                  mobile_number: get(values, 'phone_number'),
                })
                  .then(() => {
                    notification.success({
                      message: 'Successfully inserted whatsapp number',
                    });
                    setDisableSubmit(true);
                  })
                  .catch((error) => {
                    notification.error({
                      message:
                        error.message ||
                        'Some error occured to insert whatsapp number',
                    });
                  });
                setLoading(false);

                break;
              }
              case 'application/json': {
                const messageData = JSON.parse(
                  // eslint-disable-next-line unicorn/text-encoding-identifier-case
                  Buffer.from(response?.data).toString('utf-8')
                );
                notification.error({
                  message: get(messageData, 'message', 'something happend qr'),
                });
                setQrImage('');
                setLoading(false);
                setQrCodemodelLoader(false);
                break;
              }
              case 'application/json; charset=utf-8': {
                const messageData = JSON.parse(
                  // eslint-disable-next-line unicorn/text-encoding-identifier-case
                  Buffer.from(response?.data).toString('utf-8')
                );
                if (messageData?.success) {
                  notification.success({
                    message: messageData.message || 'Already login your device',
                  });
                  setWhatsappLogin(false);
                  setQrImage('');
                  setLoading(false);
                }

                break;
              }
              // No default
            }
          });
      } else {
        notification.error({
          message: `You Already login with this ${tenantWhatsappDetail?.mobileNumber} number`,
        });
        setQrCodemodelLoader(false);
      }
    }
  };

  const onLogoutFunction = async () => {
    try {
      if (wsloginStatus) {
        const logoutStatus = await axios.get(`${whatsAppApiUrl}/users/logout`, {
          params: {
            mobileNumber: get(tenantWhatsappDetail, 'mobile_number', ''),
            referenceId: tenantUid,
          },
        });
        if (logoutStatus?.data?.success) {
          setWsLoginStatus(false);
          setTenantWhatsappDetail(() => {});
          logoutWhatsappNumber(tenantWhatsappDetail)
            .then(async () => {
              setSocialLeads([]);
              await fetchData();
            })
            .catch((error) => {
              notification.error({
                message:
                  error.message ||
                  'Some error occurred while delete logout number chats',
              });
            });
        } else {
          notification.warning({
            message:
              logoutStatus?.error?.message ||
              'Your Number is logged out, please login again',
          });
        }
      } else {
        notification.warning({ message: 'Please login first' });
      }
    } catch (error) {
      notification.error({
        message: error.message || 'Some error occurred while logout',
      });
    }
  };

  const handleWsModalCancel = () => {
    setWhatsappLogin(false);
    setQrImage('');
    form.resetFields();
  };

  const onFacebookLogin = () => {
    window.FB.login(
      // eslint-disable-next-line func-names
      function (response) {
        setLoading(true);
        if (response?.status === 'connected') {
          const userID = response?.authResponse?.userID;
          const token = response?.authResponse?.accessToken;
          getFbLongLivedToken({ tenantUid, token, userID })
            .then((result) => {
              if (result.success) {
                getFbPages();
              } else {
                notification.error({ message: `Could'nt get token` });
                setLoading(false);
              }
            })
            .catch(() => {
              setLoading(false);
            });
          notification.success({
            message: 'Successfully logged in your Facebook account.',
          });
        } else {
          notification.error({
            message: 'Some problem occurred while connecting to facebook.',
          });
          setLoading(false);
        }
      },
      {
        scope:
          // eslint-disable-next-line max-len
          'public_profile,email,pages_show_list,read_insights,pages_read_engagement,pages_manage_posts,pages_read_user_content,instagram_basic,instagram_manage_insights,instagram_content_publish,pages_messaging',
        return_scopes: true,
      }
    );
  };

  const refreshWhatsapp = (values) => {
    fetchAllWhatsappData(values);
  };

  const disconnect = () => {
    disconnectAuth(tenantUid)
      .then((data) => {
        setFbPageId('');
        setIgPageId('');
        setFbPageData([]);
        setMetaMessenger([]);
        setSelectedPageId('');
        setLoading(false);
        notification.success({
          message: data.message || 'Disconnected successfully.',
        });
      })
      .catch((error) => {
        notification.error({
          message: error.message || 'some error occcured while disconnecting',
        });
        setLoading(false);
      });
  };

  const onDropDownChange = (value) => {
    setSelectedPageId(value);
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const checkId = (item) => {
    const {
      participants: { data },
    } = item;
    const responseId = data[0]?.name ? data[0]?.id : data[1]?.id;
    return responseId;
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handleActiveTab = (event) => {
    setActiveTab(event);
  };

  return (
    <div>
      <div className="social-leads-container">
        <Spin spinning={loading}>
          <div>
            <Tabs
              type="card"
              activeKey={activeTab}
              onChange={handleActiveTab}
              className="theme-tabs"
            >
              <TabPane tab="WhatsApp" key="whatsapp" />
              <TabPane tab="Facebook Messenger" key="messenger" />
            </Tabs>
          </div>
          {activeTab === 'messenger' && (
            <>
              <div style={{ padding: '0px 10px' }}>
                {isEmpty(fbPageData) ? (
                  <div>
                    <p>
                      Please connect to your Facebook account to connect
                      messenger.
                    </p>
                    <Button type="primary" onClick={onFacebookLogin}>
                      Connect facebook
                    </Button>
                  </div>
                ) : (
                  <>
                    <p>Select a facebook page</p>
                    <div
                      className="page-align"
                      style={{ marginBottom: '18px' }}
                    >
                      <Select
                        className="mt-10"
                        virtual={false}
                        placeholder="Select a Page"
                        optionFilterProp="children"
                        value={selectedPageId}
                        onChange={onDropDownChange}
                        options={fbPageData}
                      />
                      <div>
                        <Button
                          type="primary"
                          onClick={() => fetchMessengerData()}
                        >
                          Refresh
                        </Button>
                        &nbsp;
                        <Button type="primary" onClick={() => disconnect()}>
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {!isEmpty(metaMessenger) && (
                <>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex p-12 drag-container">
                      {metaMessenger.map((list, index) => {
                        if (metaMessenger.length === index + 1) {
                          return (
                            <>
                              <List
                                onDragEnd={onDragEnd}
                                name={list.tab_name}
                                button
                                socialLeads={metaMessenger}
                                setIsModalOpen={setIsModalOpen}
                                fetchData={fetchMessengerData}
                                showModal={showModal}
                                list={list}
                                index={index}
                              />
                              <List
                                onDragEnd={onDragEnd}
                                name={list.tab_name}
                                button={false}
                                socialLeads={metaMessenger}
                                setIsModalOpen={setIsModalOpen}
                                fetchData={fetchMessengerData}
                                showModal={showModal}
                                list={list}
                                index={index}
                              >
                                {get(
                                  list,
                                  'social_leads_tab_to_customer.data',
                                  []
                                ).map((item, itemIndex) => (
                                  <Draggable
                                    draggableId={checkId(item)}
                                    index={itemIndex}
                                    key={checkId(item)}
                                    // isDragDisabled={list.slug === 'discard'}
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        <MetaCard
                                          data={item}
                                          fbPageId={fbPageId}
                                          igPageId={igPageId}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              </List>
                            </>
                          );
                        }
                        return (
                          <List
                            onDragEnd={onDragEnd}
                            name={list.tab_name}
                            button={false}
                            socialLeads={metaMessenger}
                            setIsModalOpen={setIsModalOpen}
                            fetchData={fetchMessengerData}
                            showModal={showModal}
                            index={index}
                            list={list}
                          >
                            {get(
                              list,
                              'social_leads_tab_to_customer.data',
                              []
                            ).map((item, itemIndex) => (
                              <Draggable
                                draggableId={checkId(item)}
                                index={itemIndex}
                                key={checkId(item)}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <MetaCard
                                      data={item}
                                      igPageId={igPageId}
                                      fbPageId={fbPageId}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </List>
                        );
                      })}
                    </div>
                  </DragDropContext>
                  <Modal
                    title="Add Lead Category"
                    visible={isModalOpen}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    className="add-tab-modal"
                    width={360}
                  >
                    <Title level={5}>Add Lead</Title>
                    <Title level={5} style={{ color: '#008080' }}>
                      Create New Lead category
                    </Title>
                    <Input
                      placeholder="Enter Name"
                      value={tabName}
                      onChange={(event) => setTabName(event?.target?.value)}
                    />
                  </Modal>
                </>
              )}
            </>
          )}
          {activeTab === 'whatsapp' && (
            <>
              <Row className="main-row-icon mb-10">
                <Col>
                  {wsloginStatus && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Icon
                        style={{ paddingRight: '5px' }}
                        // eslint-disable-next-line react/no-unstable-nested-components
                        component={() => <Whatsapp />}
                      />{' '}
                      <p>{get(tenantWhatsappDetail, 'mobile_number', '')}</p>
                    </div>
                  )}
                  {!wsloginStatus && (
                    <div className="whatsapp-icon-div">
                      <Button
                        onClick={() => setWhatsappLogin(true)}
                        disabled={wsloginStatus}
                        type="primary"
                      >
                        Connect WhatsApp
                      </Button>
                    </div>
                  )}
                  {wsloginStatus && (
                    <>
                      <div className="mr-10">
                        <Button
                          type="primary"
                          shape="circle"
                          onClick={onClickRefresh}
                          icon={<ReloadOutlined />}
                        />
                      </div>
                      <div>
                        <Button
                          type="primary"
                          onClick={onLogoutFunction}
                          disabled={!wsloginStatus}
                        >
                          Logout
                        </Button>
                      </div>
                    </>
                  )}
                </Col>
              </Row>
              <div className="custom-layout-bg-style" />
              <Modal
                title="Add Lead Category"
                visible={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                className="add-tab-modal"
                width={360}
              >
                <Title level={5}>Add Lead</Title>
                <Title level={5} style={{ color: '#008080' }}>
                  Create New Lead category
                </Title>
                <Input
                  placeholder="Enter Name"
                  value={tabName}
                  onChange={(event) => setTabName(event?.target?.value)}
                />
              </Modal>
              <Modal
                title="Whatsapp Login"
                visible={whatsappLogin}
                footer={false}
                onCancel={handleWsModalCancel}
                maskClosable={false}
              >
                <Spin spinning={qrCodemodelLoader}>
                  <Form form={form} onFinish={onFinish}>
                    <Form.Item
                      label="Phone Number"
                      name="phone_number"
                      rules={[
                        {
                          required: true,
                          message: 'please enter phone number',
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item className="social-leads-button">
                      <Button
                        onClick={() => refreshWhatsapp('reload')}
                        style={{ marginRight: '5px' }}
                        disabled={refreshState}
                      >
                        <ReloadOutlined /> Refresh
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        disabled={disableSubmit}
                      >
                        Submit
                      </Button>
                    </Form.Item>
                  </Form>
                  {qrImage ? (
                    <div className="qr-image-container">
                      <Image
                        style={{ width: '100%' }}
                        src={qrImage}
                        preview={false}
                      />
                    </div>
                  ) : (
                    <Skeleton size="large" active={active} />
                  )}
                  <Alert
                    className="text-mb7"
                    message="After scanning the QR code, if the screen is not refreshing automatically, please click the refresh button."
                    type="warning"
                    showIcon
                    style={{ marginTop: '20px' }}
                  />
                </Spin>
              </Modal>
            </>
          )}
        </Spin>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex p-12 drag-container">
          {socialLeads?.map((list, index) => {
            if (socialLeads?.length === index + 1) {
              return (
                <>
                  <List
                    // title={tabRenderFunction(list, index, true)}
                    onDragEnd={onDragEnd}
                    name={list?.tab_name}
                    index={index}
                    list={list}
                    button
                    socialLeads={socialLeads}
                    fetchData={fetchData}
                    showModal={showModal}
                    setIsModalOpen={setIsModalOpen}
                  />
                  <List
                    // title={tabRenderFunction(list, index, false)}
                    onDragEnd={onDragEnd}
                    name={list?.tab_name}
                    list={list}
                    index={index}
                    button={false}
                    socialLeads={socialLeads}
                    fetchData={fetchData}
                    showModal={showModal}
                    setIsModalOpen={setIsModalOpen}
                  >
                    {get(list, 'social_leads_tab_to_customer', []).map(
                      (item, itemIndex) => (
                        <Draggable
                          draggableId={item.customer_uid}
                          index={itemIndex}
                          key={item.customer_uid}
                          isDragDisabled={list.slug === 'discard'}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <CardItem
                                data={item}
                                tenantWhatsappDetail={tenantWhatsappDetail}
                                setTenantWhatsappDetail={
                                  setTenantWhatsappDetail
                                }
                                setSocialLeads={setSocialLeads}
                                list={list}
                                whatsAppApiUrl={whatsAppApiUrl}
                              />
                            </div>
                          )}
                        </Draggable>
                      )
                    )}
                  </List>
                </>
              );
            }
            return (
              <List
                onDragEnd={onDragEnd}
                name={list?.tab_name}
                list={list}
                index={index}
                button={false}
                socialLeads={socialLeads}
                fetchData={fetchData}
                showModal={showModal}
                setIsModalOpen={setIsModalOpen}
              >
                {get(list, 'social_leads_tab_to_customer', []).map(
                  (item, itemIndex) => (
                    <Draggable
                      draggableId={item?.customer_uid}
                      index={itemIndex}
                      key={item?.customer_uid}
                      isDragDisabled={list?.slug === 'discard'}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <CardItem
                            data={item}
                            tenantWhatsappDetail={tenantWhatsappDetail}
                            setTenantWhatsappDetail={setTenantWhatsappDetail}
                            setSocialLeads={setSocialLeads}
                            list={list}
                            whatsAppApiUrl={whatsAppApiUrl}
                          />
                        </div>
                      )}
                    </Draggable>
                  )
                )}
              </List>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}

export default withRouter(SocialLeads);
