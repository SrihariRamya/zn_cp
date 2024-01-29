import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Table,
  Drawer,
  notification,
  Breadcrumb,
  Tag,
  Spin,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { createTenant, getTenant } from '../../utils/api/url-helper';

const TenantManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tenantData, setTenantData] = useState([]);
  const [searchTenantData, setSearchTenantData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState(false);

  const fetchData = () => {
    setLoading(true);
    getTenant()
      .then((result) => {
        setTenantData(result.data);
        setSearchTenantData(result.data);
        setLoading(false);
      })
      .catch(() => {
        notification.error({ message: 'Failed to load the data' });
      });
  };
  useEffect(() => {
    fetchData();
  }, []);

  const globalSearch = (event) => {
    let { value } = event.target;
    let filteredData = [];
    value = value.toString().toLowerCase();
    if (!value) {
      filteredData.push(...searchTenantData);
    } else {
      filteredData = searchTenantData.filter((result) =>
        result.tenant_name.toString().toLowerCase().includes(value)
      );
    }
    setTenantData(filteredData);
  };

  const onFinish = (values) => {
    createTenant(values)
      .then((result) => {
        if (result.data) {
          notification.success({ message: 'Tenant Created successfully' });
          fetchData();
        } else notification.error({ message: 'Failed to create the Tenant' });
      })
      .catch((error) => {
        notification.error({
          message: Object.prototype.hasOwnProperty.call(error, 'error')
            ? error.error
            : 'Failed to create the Tenant',
        });
      });
  };

  const showDrawer = () => {
    setTitle('Create Tenant');
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Tenant Name',
      dataIndex: 'tenant_name',
      key: 'tenant_id',
      width: 200,
      fixed: 'left',
    },
    {
      title: 'Action',
      width: 100,
      align: 'right',
      render: () => (
        <span className="edit-box">
          <Tag color="green">
            <EditOutlined />
          </Tag>
          &nbsp;
          <Tag color="red">
            <DeleteOutlined />
          </Tag>
        </span>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div className="search-container">
        <div>
          <Breadcrumb>
            <Breadcrumb.Item> Tenant Management</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div>
          <Input
            placeholder="Search"
            onChange={globalSearch}
            className="custom-search"
            suffix={<SearchOutlined className="site-form-item-icon" />}
          />
        </div>
        <div>
          <Button type="primary" onClick={showDrawer}>
            Add Tenant
          </Button>
        </div>
      </div>
      <div className="box">
        <div className="box__header">
          <h3 className="box-title">Tenant Info</h3>
        </div>
        <div className="box__content p-0">
          <Table
            className="grid-table"
            columns={columns}
            dataSource={[tenantData]}
          />
        </div>
      </div>

      <Drawer
        title={title}
        width={400}
        onClose={onClose}
        visible={visible}
        maskClosable={false}
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            className="tenant-form"
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              label="Tenant Name"
              name="tenant_name"
              rules={[
                {
                  required: true,
                  message: 'Please enter the tenant name!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary" disabled={loading}>
                {loading ? 'Submitting' : 'Submit'}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Drawer>
    </Spin>
  );
};

export default TenantManagement;
