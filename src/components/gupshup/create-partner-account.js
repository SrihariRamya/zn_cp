import React, { useState, useEffect, useContext } from 'react';
import { Input, Form, Button, notification } from 'antd';
import { get } from 'lodash';
import { createPartnerApp } from '../../utils/api/url-helper';
import { TenantContext } from '../context/tenant-context';

function CreatePartnerAccount(parameter) {
  const { handlereFreshPage } = parameter;
  const [tenantDetails] = useContext(TenantContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFields([
      {
        name: 'app_name',
        value: get(tenantDetails, 'business_name', ''),
      },
      {
        name: 'email_address',
        value: get(tenantDetails, 'setting.email_address', ''),
      },
      {
        name: 'tenant_name',
        value: get(tenantDetails, 'tenant_name', ''),
      },
      {
        name: 'phone',
        value: get(tenantDetails, 'setting.phone', ''),
      },
    ]);
  }, [tenantDetails]);

  const onFinish = (values) => {
    setLoading(true);
    createPartnerApp(values)
      .then((response) => {
        window.open(get(response, 'data.link'), '_blank');
        setLoading(false);
        handlereFreshPage();
      })
      .catch((error) => {
        notification.error({ message: error.message });
        setLoading(false);
      });
  };

  return (
    <div>
      <div className="box mobile-side-padding create-gushups-app-container">
        <div className="ml-10">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="app_name"
              label="Business name"
              rules={[
                {
                  required: true,
                  message: 'Please enter business name',
                },
              ]}
            >
              <Input className="mt-10" placeholder="Business name" />
            </Form.Item>
            <Form.Item
              name="tenant_name"
              label="Contact Person Name"
              rules={[
                {
                  required: true,
                  message: 'Please enter contact person name',
                },
              ]}
            >
              <Input className="mt-10" placeholder="Contact Person Name" />
            </Form.Item>
            <Form.Item
              name="email_address"
              label="Contact Person Email"
              rules={[
                {
                  required: true,
                  message: 'Please enter contact person email',
                },
                {
                  type: 'email',
                  message: 'Please enter a valid email address',
                },
              ]}
            >
              <Input className="mt-10" placeholder="Contact Person Email" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Whatsapp number"
              rules={[
                {
                  required: true,
                  message: 'Please enter whatsapp number',
                },
              ]}
            >
              <Input className="mt-10" placeholder="Contact number" />
            </Form.Item>
            <Form.Item>
              <div className="flex-end mt-10">
                <Button
                  htmlType="submit"
                  type="primary"
                  className="ten"
                  loading={loading}
                >
                  Verfiy
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default CreatePartnerAccount;
