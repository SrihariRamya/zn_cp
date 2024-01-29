import React, { useState, useEffect, useCallback } from 'react';
import {
  Input,
  Table,
  notification,
  Breadcrumb,
  Tag,
  Spin,
  Modal,
  Button,
  Form,
  Select,
} from 'antd';
import _ from 'lodash';
import { SearchOutlined, UserSwitchOutlined } from '@ant-design/icons';
import {
  POSUSER_ADD_FAILED,
  POSUSER_ADD_SUCCESS,
  POSUSER_UPDATE_FAILED,
  POSUSER_UPDATE_SUCCESS,
  POSUSER_DELETE_SUCCESS,
  POSUSER_DELETE_FAILED,
  FAILED_TO_LOAD,
} from '../../shared/constant-values';
import {
  getStorePOS,
  getUser,
  getPOSUsers,
  addPOSUser,
  editPOSUser,
  deletePOSUser,
} from '../../utils/api/url-helper';
import {
  DeleteAlert,
  DeleteAlertImage,
  DeleteAlertMessage,
} from '../../shared/sweetalert-helper';

const { Option } = Select;
const POSUser = (properties) => {
  const canWrite = _.get(properties, 'roleData.can_write', false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [posData, setPosData] = useState([]);
  const [storeID] = useState(localStorage.getItem('storeID'));
  const [storeUser, setStoreUser] = useState([]);
  const [updateID, setUpdateID] = useState('');
  const [storePOSID, setStorePOSID] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchWord, setSearchWord] = useState('');

  const fetchPosData = (parameters = {}) => {
    setLoading(true);
    const searchParameter = {};
    const {
      pagination: { pageSize, current },
      searchKey,
    } = parameters;
    if (searchKey) {
      searchParameter.searchWord = searchKey;
    }
    getStorePOS({
      storeID,
      limit: pageSize,
      offset: current,
      ...searchParameter,
    })
      .then((response) => {
        const posDataSet = _.get(response, 'data', []);
        setPosData(posDataSet.rows);
        setPagination({
          ...parameters.pagination,

          total: posDataSet.count,
        });
        setLoading(false);
      })
      .catch((error_) =>
        notification.error({ message: error_.message || FAILED_TO_LOAD })
      );
  };

  const fetchData = useCallback(() => {
    const parameters = {
      roleName: 'store_user',
      includeAddress: false,
      storeID,
    };
    setLoading(true);
    const apiArray = [getUser(parameters), getPOSUsers()];
    Promise.all(apiArray)
      .then((result) => {
        const availableUser = _.differenceBy(
          _.get(result, '[0].data.rows', []),
          _.get(result, '[1].data', []),
          'user_uid'
        );
        setLoading(false);
        setStoreUser(availableUser);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, [storeID]);

  useEffect(() => {
    fetchData();
    fetchPosData({ pagination });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showModal = (_event, data) => {
    const updateValue = _.get(data, 'userPOS.id', '');
    setStorePOSID(_.get(data, 'store_pos_uid', ''));
    setUpdateID(updateValue);
    setIsModalVisible(true);
  };

  const handleOk = (values) => {
    values.store_pos_uid = storePOSID;
    setLoading(true);
    if (updateID) {
      editPOSUser(values, updateID)
        .then(() => {
          notification.success({ message: POSUSER_UPDATE_SUCCESS });
          setLoading(false);
          setIsModalVisible(false);
          fetchData();
          fetchPosData({ pagination });
          form.resetFields();
        })
        .catch((error) => {
          setLoading(false);
          setIsModalVisible(false);
          notification.error({
            message: _.get(error, 'error', POSUSER_UPDATE_FAILED),
          });
        });
    } else {
      addPOSUser(values)
        .then(() => {
          notification.success({ message: POSUSER_ADD_SUCCESS });
          setLoading(false);
          setIsModalVisible(false);
          form.resetFields();
          fetchData();
          fetchPosData({ pagination });
        })
        .catch((error) => {
          setLoading(false);
          setIsModalVisible(false);
          notification.error({
            message: _.get(error, 'error', POSUSER_ADD_FAILED),
          });
        });
    }
  };

  const globalSearch = (event) => {
    const { value } = event.target;
    setSearchWord(value || '');
    fetchPosData({
      pagination: { pageSize: 10, current: 1 },
      searchKey: value,
    });
  };

  const handleDelete = async (_event, key) => {
    const id = _.get(key, 'userPOS.id', '');
    const text = 'Are you sure want to delete this POS User from the list?';
    const result = await DeleteAlert(text);
    if (result.isConfirmed) {
      deletePOSUser(id)
        .then((response) => {
          if (response.success) {
            DeleteAlertImage(POSUSER_DELETE_SUCCESS);
            fetchData();
            fetchPosData({ pagination });
          } else DeleteAlertMessage(POSUSER_DELETE_FAILED);
        })
        .catch(() => DeleteAlertMessage(POSUSER_DELETE_FAILED));
    }
  };

  const handleCancel = () => {
    setStorePOSID('');
    setUpdateID('');
    setIsModalVisible(false);
  };
  const handleTableChange = (paginationAlias, filters, sorter) => {
    fetchPosData({
      sortField: sorter.field,
      sortOrder: sorter.order,
      pagination: paginationAlias,
      searchKey: searchWord,
      ...filters,
    });
  };
  const columns = [
    {
      title: 'Actions',
      width: 100,
      render: (data) => (
        <span className="edit-boxs">
          <Tag color="green" onClick={(event) => showModal(event, data)}>
            {_.get(data, 'userPOS.user_uid', '')
              ? 'Change User'
              : 'Assign User'}
          </Tag>
          &nbsp;
          {_.get(data, 'userPOS.user_uid', '') && (
            <Tag color="red" onClick={(event) => handleDelete(event, data)}>
              Remove User
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: 'POS Machine name',
      dataIndex: ['posMachine', 'pos_machine_name'],
      width: 250,
      render: (a) => <b>{a}</b>,
    },
    {
      title: 'User name',
      align: 'center',
      dataIndex: ['userPOS'],
      width: 250,
      render: (data) => <b>{_.get(data, 'zm_user.user_name', '')}</b>,
    },
  ];
  return (
    <Spin spinning={loading}>
      <div className="search-container">
        <Breadcrumb>
          <Breadcrumb.Item>
            <h1>
              <UserSwitchOutlined /> POS Users
            </h1>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div>
          <Input
            placeholder="Search"
            onChange={globalSearch}
            className="custom-search"
            suffix={<SearchOutlined className="site-form-item-icon" />}
          />
        </div>
        <div />
      </div>
      <div className="box mobile-side-padding">
        <div className="box__header" />
        <div className="box__content p-0">
          <Table
            className="grid-table"
            columns={
              canWrite
                ? columns
                : columns.filter(
                    (response) => _.get(response, 'title', '') !== 'Actions'
                  )
            }
            dataSource={posData}
            pagination={pagination}
            fetchDeliveryData={fetchPosData}
            loading={loading}
            onChange={handleTableChange}
            scroll={{ x: 780 }}
          />
        </div>
      </div>
      <Modal
        title={updateID ? 'Change POS User' : 'Assign POS User'}
        visible={isModalVisible}
        onCancel={handleCancel}
        maskClosable={false}
        footer={null}
        width={450}
      >
        <Form
          form={form}
          name="pos_user_form"
          onFinish={handleOk}
          layout="vertical"
          style={{ marginBottom: 0 }}
        >
          <Form.Item
            name="user_uid"
            label="Select User"
            rules={[{ required: true }]}
          >
            <Select virtual={false} placeholder="Select a user">
              {storeUser.map((result) => (
                <Option value={result.user_uid} key={result.user_uid}>
                  {result.user_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <div className="flex-end">
              <Button type="primary" htmlType="submit" disabled={loading}>
                {loading ? 'Submitting' : 'Save'}
              </Button>
              <Button danger onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};
export default POSUser;
