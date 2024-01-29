import React, { useState, useEffect, useContext } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  Select,
  Button,
  Upload,
  notification,
  Radio,
} from 'antd';
import {
  map,
  get,
  isEmpty,
  flatten,
  uniqBy,
  compact,
  concat,
  filter,
} from 'lodash';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ExcelUpload } from '../../shared/excel';
import { getCustomer } from '../../utils/api/url-helper';
import UserTemplate from '../../assets/user-template.xlsx';
import { TenantContext } from '../context/tenant-context';
import {
  TENANT_MODE_NORMAL,
  WHATSAPP_USERS_EMPTY,
} from '../../shared/constant-values';

const { Option } = Select;
const dummyRequest = ({ onSuccess }) => {
  setTimeout(() => {
    onSuccess('error');
  }, 0);
};

function Compose(properties) {
  const { account, handleRefresh } = properties;
  const [form] = Form.useForm();
  const history = useNavigate();
  const [tenantDetails] = useContext(TenantContext);
  const isNormalTenantMode =
    get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL;
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [selectedUser, setSelectedUser] = useState();
  const [users, setUsers] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState('');

  const fileResponse = (response) => {
    const errorData = [];
    if (isEmpty(flatten(response))) {
      setFileList([]);
      return notification.error({
        message: `please upload valid excel`,
      });
    }
    const validate = flatten(response).every((excel) => {
      if (get(excel, 'Phone_number', '') && get(excel, 'Country_code', ''))
        return true;
      if (!get(excel, 'Phone_number', '')) errorData.push('phone number');
      if (!get(excel, 'Country_code', '')) errorData.push('Country code');
      return false;
    });
    if (!validate) {
      setFileList([]);
      return notification.error({
        message: `please check the ${errorData.join(',')} field`,
      });
    }
    return setExcelData(...response);
  };

  const getUserData = () => {
    const parameters = {
      roleName: 'customer',
      firstTableParams: 'zm_user',
    };
    setLoading(true);
    getCustomer(parameters)
      .then((response) => {
        const data = get(response, 'data.rows', []);
        const uniqNumber = uniqBy(data, 'phone_number');
        const removeNullValue = filter(
          uniqNumber,
          (v) => v.phone_number !== null
        );
        setUsers(removeNullValue);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({ message: get(error, 'message', '') });
      });
  };

  useEffect(() => {
    getUserData();
  }, []);

  const handleUpload = (file) => {
    ExcelUpload(file, fileResponse);
  };
  const onRemove = () => {
    setExcelData([]);
  };

  const handleFileList = ({ fileList: fileListName }) => {
    setFileList(fileListName);
  };

  const onValuesChange = (changedValues) => {
    if (changedValues) {
      setSaveDisabled(false);
    }
  };
  const handleChangeUser = (value) => {
    setSelectedUser(value);
  };
  const handleSelectUser = (event_) => {
    const { value } = event_.target;
    setSelectedUserType(value);
    setSelectedUser([]);
  };

  const onFinish = async (values) => {
    const tenantUid = localStorage.getItem('tenantUid');
    const whatsAppApiUrl = get(tenantDetails, 'WhatsAppAPI', '');
    const excelDataPhoneNumber = map(
      excelData,
      (item) => `${item.Country_code || ''}${item.Phone_number}`
    );
    const userData =
      selectedUserType === 'allUsers'
        ? map(users, (item) => `${item.country_code || ''}${item.phone_number}`)
        : selectedUser;
    const uniq = concat(userData || [], excelDataPhoneNumber);
    if (isEmpty(uniq)) {
      return notification.error({
        message: WHATSAPP_USERS_EMPTY,
      });
    }
    setConfirmLoading(true);
    const payload = {
      referenceId: tenantUid,
      jobName: values.campaign_name,
      Message: values.whatsapp_message,
      to: compact(uniq),
      mobileNumber: values.account,
    };
    return axios({
      method: 'POST',
      url: `${whatsAppApiUrl}/users/bulk-sendMessage`,
      data: payload,
    })
      .then(() => {
        setConfirmLoading(false);
        notification.success({
          message: 'Message sent  successfully',
        }); // As per ranjeeth consent accepted current(master) changes
        const parameters = new URLSearchParams();
        parameters.append('page', 'messages');
        history({
          pathname: '/whatsapp',
          search: parameters.toString(),
          state: {
            refresh: true,
          },
        });
        handleRefresh();
        form.resetFields();
        setExcelData([]);
        setFileList([]);
      })
      .catch((error) => {
        setConfirmLoading(false);
        notification.error({
          message:
            get(error?.response, 'data.message', '') ||
            'Failed to create Job for Bulk Message',
        });
      });
  };

  return (
    <div className="box">
      <div className="box__header bg-gray-lighter">
        <h3 className="box-title">Compose</h3>
      </div>
      <div className="box-content-background">
        <div className="card-container report">
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col span={10} offset={1}>
              <Form
                form={form}
                className="user-form"
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ coverage_list: [] }}
                onValuesChange={onValuesChange}
                scrollToFirstError
              >
                <Form.Item
                  label="Campaign Name"
                  name="campaign_name"
                  className="one"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter campaign Name',
                    },
                  ]}
                >
                  <Input placeholder="Enter campaign Name" />
                </Form.Item>

                <Form.Item
                  label="Whatsapp Message"
                  name="whatsapp_message"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter whatsapp message',
                    },
                  ]}
                >
                  <Input.TextArea
                    className="template-textarea"
                    rows={5}
                    maxLength={1024}
                  />
                </Form.Item>
                <Form.Item
                  label="Select Account"
                  name="account"
                  rules={[
                    {
                      required: true,
                      message: 'Please Select a account!',
                    },
                  ]}
                >
                  <Select
                    className="location-select search-location-select"
                    virtual={false}
                    maxTagCount="responsive"
                    placeholder="please select a account"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase()) === true
                    }
                    allowClear
                    getPopupContainer={(triggerNode) =>
                      triggerNode.parentElement
                    }
                  >
                    {account &&
                      map(account, (item) => (
                        <Option key={item.id} value={item.mobile}>
                          {item.mobile}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
                {isNormalTenantMode && (
                  <Form.Item label="Select User Type" name="Select User Type">
                    <Radio.Group
                      onChange={(event_) => handleSelectUser(event_)}
                      name="selectedUserType"
                    >
                      <Radio value="allUsers">All users</Radio>
                      <Radio value="filterByUsers">Filter users by</Radio>
                    </Radio.Group>
                  </Form.Item>
                )}
                {selectedUserType === 'filterByUsers' && (
                  <Form.Item
                    label="Select Users"
                    name="users"
                    rules={[
                      {
                        required: true,
                        message: 'Please Select a Users!',
                      },
                    ]}
                  >
                    <Select
                      onChange={handleChangeUser}
                      virtual={false}
                      mode="multiple"
                      maxTagCount="responsive"
                      className="location-select search-location-select"
                      value={selectedUser}
                      loading={loading}
                      placeholder="please select a user"
                      filterOption={(input, option) =>
                        option.label
                          .toLowerCase()
                          .includes(input.toLowerCase()) === true
                      }
                      allowClear
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentElement
                      }
                    >
                      {users &&
                        map(users, (item) => (
                          <Option
                            label={item.user_name}
                            key={item.user_uid}
                            value={`${item.country_code || ''}${
                              item.phone_number
                            }`}
                          >
                            {`${item.user_name}-(${item.phone_number})`}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                )}

                <Row>
                  <Col span={12}>
                    <Form.Item label="Upload Users">
                      <Upload
                        customRequest={dummyRequest}
                        beforeUpload={handleUpload}
                        accept=".xlsx, .xls, .csv"
                        onChange={handleFileList}
                        fileList={fileList}
                        maxCount={1}
                        onRemove={onRemove}
                      >
                        <Button type="primary" icon={<UploadOutlined />}>
                          Click to Upload
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: '28px',
                      }}
                    >
                      <Button type="secondary" icon={<DownloadOutlined />}>
                        &nbsp;<a href={UserTemplate}>Download Template</a>
                      </Button>
                    </div>
                  </Col>
                </Row>
                <div
                  className="text-right ml-10"
                  style={{ marginBottom: '16px' }}
                >
                  <Button
                    size="large"
                    type="primary"
                    htmlType="submit"
                    style={{ marginRight: '8px' }}
                    disabled={saveDisabled}
                    className="eight"
                    loading={confirmLoading}
                  >
                    Send
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default Compose;
