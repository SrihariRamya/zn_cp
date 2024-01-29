import React, { useState, useEffect, useCallback, useRef } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { isValidPhoneNumber } from 'libphonenumber-js';
import {
  Form,
  Input,
  Button,
  Table,
  Select,
  Drawer,
  notification,
  Breadcrumb,
  Tag,
  Space,
  Spin,
  Tooltip,
} from 'antd';
import _, { get, isNaN } from 'lodash';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  createUser,
  editUser,
  getUser,
  deleteUser,
  getTenant,
  getRole,
  getStore,
} from '../../utils/api/url-helper';
import getFormItemRules, {
  trimPayloadFields,
  validatePhoneNumber,
} from '../../shared/form-helpers';
import { ReactComponent as User } from '../../assets/icons/user.svg';
import {
  USER_DELETE_SUCCESS,
  USER_DELETE_FAILED,
  FAILED_TO_LOAD,
  USER_ADD_FAILED,
  USER_ADD_SUCCESS,
  USER_UPDATE_FAILED,
  USER_UPDATE_SUCCESS,
} from '../../shared/constant-values';
import { handleUrlChanges } from '../../shared/common-url-helper';
import {
  DeleteAlert,
  DeleteAlertImage,
  DeleteAlertMessage,
} from '../../shared/sweetalert-helper';
import { paginationstyler } from '../../shared/attributes-helper';
import { getFilterData } from '../../shared/table-helper';

const { Option } = Select;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function UserLayout({ properties }) {
  const history = useNavigate();
  let canWrite = get(properties, 'roleData.can_write', false);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRoleData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [tittle, setTittle] = useState('');
  const [hidePassword, setHidePassword] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [storeData, setStoreData] = useState([]);
  const [storeID] = useState(localStorage.getItem('storeID'));
  const [roleInfo] = useState(localStorage.getItem('roleName'));
  const [updateID, setUpdateID] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchWord, setSearchWord] = useState('');
  const [tableChange, setTableChange] = useState(false);
  const [filterData, setFilterData] = useState({});
  const [sorter, setSorter] = useState({});
  const [curentValue, setcurrentValue] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [isError, setIsError] = useState(false);
  const [isEditPhone, setIsEditPhone] = useState(false);
  const [userObject, setUserObject] = useState({});
  const firstUpdate = useRef(true);
  const query = useQuery();
  const currentPageCount = query.get('page');
  const moduleName = 'users';

  if (roleInfo === 'store_user') {
    canWrite = false;
  }
  const fetchUserData = useCallback(
    (parameters = {}, showerrors = false, rejectError = true) => {
      return new Promise((resolve, reject) => {
        setLoading(true);
        const searchParameter = {};
        const {
          pagination: { pageSize, current },
          searchKey,
        } = parameters;

        if (searchKey) {
          searchParameter.searchWord = searchKey;
        }
        searchParameter.firstTableParams = 'zm_user';
        if (_.get(filterData, 'store_name', '')) {
          searchParameter.secondTableParams = true;
        }
        if (_.get(filterData, 'role', '')) {
          searchParameter.thirdTableParams = true;
        }
        getUser(
          roleInfo === 'tenant_admin'
            ? {
                roleName: 'store_admin,store_user',
                limit: pageSize,
                offset: current,
                sorter: JSON.stringify(sorter),
                filters: JSON.stringify(filterData),
                ...searchParameter,
              }
            : {
                roleName: 'store_user',
                limit: pageSize,
                offset: current,
                sorter: JSON.stringify(sorter),
                filters: JSON.stringify(filterData),
                storeID,
                ...searchParameter,
              }
        )
          .then((response) => {
            const userDataSet = _.get(response, 'data', []);
            setUserData(userDataSet.rows);
            setPagination({
              ...parameters.pagination,

              total: userDataSet.count,
            });
            setLoading(false);
            setTableChange(false);
            resolve(response);
          })
          .catch((error_) => {
            setTableChange(false);
            if (showerrors)
              notification.error({
                message: error_.message || FAILED_TO_LOAD,
              });
            if (rejectError) reject(error_);
          });
      });
    }
  );
  const fetchData = useCallback(
    (parameters) => {
      setLoading(true);
      const apiArray = [
        fetchUserData(parameters || { pagination }),
        getRole(),
        getTenant(),
        getStore(),
      ];
      Promise.all(apiArray)
        .then((result) => {
          const roleList = get(result, '[1].data', []).filter((response) => {
            if (
              roleInfo === 'tenant_admin' &&
              response.slug !== 'customer' &&
              response.slug !== 'tenant_admin'
            ) {
              return response;
            }
            if (roleInfo === 'store_admin' && response.slug === 'store_user') {
              return response;
            }
            return false;
          });
          if (roleInfo === 'store_admin') {
            let storeAssigned = get(result, '[3].data.rows', []);
            storeAssigned = storeAssigned.filter(
              (item) => item.store_uid === storeID
            );
            setStoreData(storeAssigned);
          } else {
            setStoreData(get(result, '[3].data.rows', []));
          }
          setRoleData(roleList);
          setLoading(false);
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
        });
    },
    [fetchUserData, pagination, roleInfo, storeID]
  );

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    const current = isNaN(currentPageCount) ? false : Number(currentPageCount);
    const newPagination = {
      ...pagination,
      ...(current && { current }),
    };
    if (!tableChange && !firstUpdate.current) {
      const addPagination = currentPageCount
        ? newPagination
        : { ...pagination, current: 1 };
      fetchUserData({
        pagination: addPagination,
        searchKey: searchWord,
      });
    }

    if (firstUpdate.current) {
      firstUpdate.current = false;
      const parameters = current
        ? { pagination: newPagination, searchKey: searchWord || '' }
        : false;
      fetchData(parameters);
    } else {
      fetchUserData({
        pagination: newPagination,
        searchKey: searchWord,
      });
    }
  }, [currentPageCount]);

  useEffect(() => {
    if (storeData.length > 0) {
      form.setFieldsValue({ store_uid: storeID || undefined });
    }
  }, [form, storeData, storeID]);

  const handleTableChange = (paginationAlias, filters, sorters) => {
    setTableChange(true);
    const { current } = paginationAlias;

    handleUrlChanges('users', history, moduleName);

    if (!_.isEmpty(sorters.order) && sorters) {
      setSorter({
        columnKey: sorters.columnKey,
        order: sorters.order === 'ascend' ? 'ascend' : 'descend',
      });
      setcurrentValue(current);
    } else {
      setSorter({
        columnKey: sorters.columnKey,
        order: sorters.order === '',
      });
      setcurrentValue(current);
    }
  };

  useEffect(() => {
    if (Object.keys(sorter).length > 0) {
      fetchUserData({
        pagination: { pageSize: 10, current: curentValue },
        searchKey: searchWord,
      });
    }
  }, [sorter]);

  const onFinish = (values) => {
    if (isEditPhone && isValidPhoneNumber(`+${phoneNumber}`) === false) {
      form.setFields([
        {
          name: 'phone_number',
          errors: ['Please Enter valid Mobile Number!'],
        },
      ]);
    } else {
      const slugValue = role.find((item) => {
        return item.id === values.role_id;
      });
      const mobileNumber = phoneNumber.slice(countryCode.length);
      const trimFormValues = {};
      trimPayloadFields(values, trimFormValues);
      trimFormValues.phone_number =
        updateID && !isEditPhone
          ? get(userObject, 'phone_number', '').slice(
              get(userObject, 'country_code', '').length
            )
          : mobileNumber;
      trimFormValues.country_code =
        updateID && !isEditPhone
          ? get(userObject, 'country_code', '')
          : `+${countryCode}`;
      const newValue = { ...trimFormValues, type: slugValue.slug };
      trimFormValues.store_uid =
        roleInfo === 'tenant_admin' ? trimFormValues.store_uid : storeID;
      setDisabled(true);
      if (updateID) {
        editUser(trimFormValues, updateID)
          .then((result) => {
            if (result.success === true) {
              notification.success({ message: USER_UPDATE_SUCCESS });
              form.resetFields();
              setVisible(false);
              setDisabled(false);
              setIsEditPhone(false);
              setSearchWord('');
              fetchData();
            } else {
              setDisabled(false);
              notification.error({ message: USER_UPDATE_FAILED });
            }
          })
          .catch((error) => {
            setDisabled(false);
            setIsEditPhone(false);
            notification.error({
              message: get(error, 'error', USER_UPDATE_FAILED),
            });
          });
      } else if (phoneNumber.length < 5 && isEditPhone) {
        form.setFields([
          {
            name: 'phone_number',
            errors: ['Please Enter your Mobile Number!'],
          },
        ]);
      } else {
        createUser(newValue)
          .then((result) => {
            if (result.success === true) {
              notification.success({ message: USER_ADD_SUCCESS });
              form.resetFields();
              setVisible(false);
              setDisabled(false);
              setSearchWord('');
              fetchData();
            } else {
              setDisabled(false);
              notification.error({ message: USER_ADD_FAILED });
            }
          })
          .catch((error) => {
            setDisabled(false);
            notification.error({
              message: get(error, 'error', USER_ADD_FAILED),
            });
          });
      }
    }
  };

  const showDrawer = () => {
    setTittle('Create user');
    setVisible(true);
    setHidePassword(true);
    setUpdateID('');
  };

  const onClose = () => {
    fetchUserData({ pagination });
    setVisible(false);
    setIsError(false);
    form.resetFields();
  };

  const globalSearchDebounce = _.debounce((value) => {
    setTableChange(true);
    handleUrlChanges('users', history, moduleName);
    fetchUserData({
      pagination: { pageSize: 10, current: 1 },
      searchKey: value,
    });
  }, 1000);

  const globalSearch = (value) => {
    setSearchWord(value || '');
    globalSearchDebounce(value);
  };

  const handleEdit = (_event, data) => {
    setUserObject(data);
    data.role_id = data.userRole.role_id;
    data.phone_number = `${get(data, 'country_code', '')}${get(
      data,
      'phone_number',
      ''
    )}`;
    setUpdateID(data.user_uid);
    setVisible(true);
    setHidePassword(false);
    form.setFieldsValue(data);
    setTittle('Edit User');
  };
  const handlePassword = (event) => {
    const { value } = event.target;
    if (updateID && value) {
      setHidePassword(true);
    }
    if (updateID && !value) {
      setHidePassword(false);
    }
  };

  const handleDelete = async (_event, key) => {
    const text = 'Are you sure want to delete this user from the list?';
    const result = await DeleteAlert(text);
    if (result.isConfirmed) {
      setLoading(true);
      deleteUser(key.user_uid)
        .then((response) => {
          if (response.success) {
            const { current } = pagination;
            const currentPage =
              userData.length === 1 && current > 1 ? current - 1 : current;
            DeleteAlertImage(USER_DELETE_SUCCESS);
            setSearchWord('');
            fetchUserData({
              pagination: { ...pagination, current: currentPage },
            });
          } else DeleteAlertMessage(USER_DELETE_FAILED);
          setLoading(false);
        })
        .catch(async (error_) => {
          let responseBody;
          try {
            responseBody = await error_.json();
          } catch {
            responseBody = error_;
          }
          setLoading(false);
          notification.error({
            message: responseBody.message || USER_DELETE_FAILED,
          });
        });
    }
  };

  const columns = [
    // {
    //   title: 'User ID',
    //   dataIndex: 'user_id',
    //   width: 100,
    //   key: 'user_id',
    //   render: (data) => <span className="text-green-dark">{data}</span>,
    //   sorter: true,
    //   ...getFilterData('User ID', 'user_id', 'text', setFilterData, filterData),
    // },
    {
      title: 'Name',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 100,
      render: (data) => <span className="text-green-dark">{data}</span>,
      sorter: true,
      ...getFilterData('Name', 'user_name', 'text', setFilterData, filterData),
    },
    {
      title: 'Email',
      dataIndex: 'email_address',
      key: 'email_address',
      width: 100,
      sorter: true,
      ...getFilterData(
        'Email',
        'email_address',
        'text',
        setFilterData,
        filterData
      ),
    },
    {
      title: 'Mobile Number',
      width: 100,
      key: 'phone_number',
      render: (data) => (
        <span>
          {get(data, 'country_code', '')} {get(data, 'phone_number', '')}
        </span>
      ),
      sorter: true,
      ...getFilterData(
        'Phone',
        'phone_number',
        'text',
        setFilterData,
        filterData
      ),
    },
    {
      title: 'User Role',
      dataIndex: ['userRole', 'zm_role', 'role'],
      key: 'userRole',
      width: 100,
      sorter: true,
      ...getFilterData('User Role', 'role', 'text', setFilterData, filterData),
    },
    {
      title: 'Store',
      dataIndex: ['zm_store', 'store_name'],
      key: 'store_name',
      width: 100,
      sorter: true,
      ...getFilterData(
        'Store',
        'store_name',
        'text',
        setFilterData,
        filterData
      ),
    },
    {
      title: 'Actions',
      width: 100,
      render: (data) => (
        <span>
          <Tag color="green" onClick={(event) => handleEdit(event, data)}>
            <Tooltip title="Edit">
              <EditOutlined />
            </Tooltip>
          </Tag>
          <Tag color="red" onClick={(event) => handleDelete(event, data)}>
            <Tooltip title="Delete">
              <DeleteOutlined />
            </Tooltip>
          </Tag>
        </span>
      ),
    },
  ];

  useEffect(() => {
    paginationstyler();
  }, [userData]);

  const onChangePhoneNumber = (phone, data) => {
    if (phone.length > 5) setIsError(true);
    setIsEditPhone(true);
    setCountryCode(get(data, 'dialCode', ''));
    setPhoneNumber(phone);
  };

  return (
    <Spin spinning={loading}>
      <div className="search-container">
        <div>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <User />
                Users
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="pos-header-search-bar">
          <Input
            allowClear
            placeholder="Search"
            value={searchWord}
            onChange={(event_) => globalSearch(event_.target.value)}
            className="custom-search"
            suffix={<SearchOutlined className="site-form-item-icon" />}
          />
        </div>
        <div className="pos-header-add-btn">
          {roleInfo === 'store_user' ? undefined : (
            <Button type="primary" onClick={showDrawer} hidden={!canWrite}>
              <PlusOutlined />
              Add User
            </Button>
          )}
        </div>
      </div>
      <div className="box" style={{ padding: '0px 10px' }}>
        <div className="box__content p-0">
          <Table
            className="grid-table orders-table-styles"
            columns={
              canWrite
                ? columns
                : columns.filter(
                    (response) => get(response, 'title', '') !== 'Actions'
                  )
            }
            dataSource={userData}
            pagination={pagination}
            fetchUserData={fetchUserData}
            loading={loading}
            onChange={handleTableChange}
            scroll={{ x: 780 }}
          />
        </div>
      </div>
      <Drawer
        title={tittle}
        width={700}
        onClose={onClose}
        visible={visible}
        maskClosable={false}
        className="user-add-drawer-component"
      >
        <Spin spinning={disabled}>
          <Form
            form={form}
            className="user-form user-add-form"
            layout="vertical"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
          >
            <div className="zp_form__grid">
              <Form.Item
                label="Name"
                name="user_name"
                rules={[
                  {
                    required: true,
                    message: 'Please enter the name of the user!',
                  },
                ]}
              >
                <Input autoComplete="new-password" placeholder="Enter Name" />
              </Form.Item>
              <Form.Item
                label="Emp ID"
                name="emp_id"
                rules={[
                  {
                    // required: true,
                    message: 'Please enter the Emp ID!',
                  },
                ]}
              >
                <Input autoComplete="new-password" placeholder="Enter Emp ID" />
              </Form.Item>
              <Form.Item
                name="store_uid"
                label="Store Name"
                hasFeedback
                rules={[
                  { required: true, message: 'Please select the store.' },
                ]}
              >
                <Select
                  virtual={false}
                  placeholder="Please select"
                  disabled={roleInfo === 'store_admin'}
                >
                  {storeData &&
                    storeData.map((store) => (
                      <Option key={store.store_uid} value={store.store_uid}>
                        {store.store_name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Phone"
                name="phone_number"
                rules={[
                  {
                    required: true,
                    message: 'Phone number is required',
                  },
                  ...validatePhoneNumber({ phone: true, isError, phoneNumber }),
                ]}
              >
                <PhoneInput
                  country="in"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={onChangePhoneNumber}
                  countryCodeEditable={false}
                  inputExtraProps={{
                    required: true,
                  }}
                />
              </Form.Item>
              <Form.Item
                label="Email Address"
                name="email_address"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your email address!',
                  },
                  ...getFormItemRules({ email: true }),
                ]}
              >
                <Input placeholder="Email Address" />
              </Form.Item>
              <Form.Item
                name="role_id"
                key="role_id"
                label="User role"
                hasFeedback
                rules={[
                  { required: true, message: 'Please select the user role!' },
                ]}
              >
                <Select virtual={false} placeholder="Please select">
                  {role &&
                    role.map((roleName) => (
                      <Option key={roleName.id} value={roleName.id}>
                        {roleName.role}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: hidePassword,
                    message: 'Please enter your password!',
                  },
                  {
                    min: 5,
                    message: 'Password must conatain at least 5 characters.',
                  },
                ]}
              >
                <Input.Password
                  autoComplete="new-password"
                  onChange={handlePassword}
                  placeholder="Password"
                />
              </Form.Item>
              <Form.Item
                name="confirm"
                label="Confirm Password"
                dependencies={['password']}
                hasFeedback
                rules={[
                  {
                    required: hidePassword,
                    message: 'Please confirm your password!',
                  },
                  ({ getFieldValue }) => ({
                    validator(_rule, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error(
                          'The two passwords that you entered do not match!'
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm Password" />
              </Form.Item>
            </div>
            <Form.Item>
              <Space className="f_btns">
                <Button htmlType="submit" type="primary" disabled={disabled}>
                  {disabled ? 'Submitting' : 'Save'}
                </Button>
                <Button danger onClick={onClose}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Drawer>
    </Spin>
  );
}

export default UserLayout;
