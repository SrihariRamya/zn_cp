import React, { useEffect, useState } from 'react';
import {
  Breadcrumb,
  Spin,
  Space,
  Form,
  Input,
  Checkbox,
  Button,
  Row,
  Col,
  notification,
} from 'antd';
import { get } from 'lodash';

import {
  getCustomerContactForm,
  createOrUpdateContactForm,
} from '../utils/api/url-helper';
import getFormItemRules from '../shared/form-helpers';
import { CUSTOMER_ENQUIRY_FORM } from '../shared/constant-values';

const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

const CustomerEngagement = () => {
  const [loading, setLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [contactFormData, setContactFormData] = useState({
    form_title: '',
    timeout: '',
    mandatory_fields: [],
  });
  const [form] = Form.useForm();

  const getFormDetails = () => {
    getCustomerContactForm({ form_name: CUSTOMER_ENQUIRY_FORM })
      .then((response) => {
        const formData = get(response, 'data', {});
        setContactFormData(formData);
        form.setFieldsValue(response.data);
        setLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error.message });
      });
  };

  useEffect(() => {
    setLoading(true);
    getFormDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onValuesChange = (changedValues) => {
    if (changedValues) {
      setSaveDisabled(false);
    }
  };

  const handleOnFinish = (values) => {
    setIsSaveLoading(true);
    createOrUpdateContactForm({ ...values, form_name: CUSTOMER_ENQUIRY_FORM })
      .then(() => {
        notification.success({
          message: 'The customer enquiry form has been updated',
        });
        setIsSaveLoading(false);
        setSaveDisabled(true);
      })
      .catch((error) => {
        setIsSaveLoading(false);
        notification.error({ message: error.message });
      });
  };

  return (
    <Spin spinning={loading}>
      <div className="search-container">
        <div>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>Customer Engagement</Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      <div className="box mobile-side-padding">
        <div className="box__header bg-gray-lighter">
          <h3 className="box-title">Contact / Enquiry Form Information</h3>
        </div>
        <div className="box__content box-content-background">
          <Form
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 12,
            }}
            autoComplete="off"
            onFinish={handleOnFinish}
            form={form}
            initialValues={contactFormData}
            onValuesChange={onValuesChange}
          >
            <Form.Item
              label="Enter Content"
              name="form_title"
              rules={[
                {
                  required: true,
                  message: 'Please enter form content!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Enter Trigger Timeout (in mins)"
              name="timeout"
              rules={[
                {
                  required: true,
                  message: 'Please enter trigger timeout in minutes!',
                },
                ...getFormItemRules({
                  onlyNumber: true,
                }),
              ]}
            >
              <Input />
            </Form.Item>
            <Row style={{ width: '100%' }}>
              <Col span={8} style={{ color: '#8993A0' }}>
                Mandatory Fields:
              </Col>
              <Col span={8}>
                <Form.Item name="is_name_mandatory" valuePropName="checked">
                  <Checkbox>Name</Checkbox>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="is_number_mandatory" valuePropName="checked">
                  <Checkbox>Mobile Number</Checkbox>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item {...tailLayout} className="mt-3rem">
              <Button
                type="primary"
                size="small"
                className="save-prdt-btn mr-30"
                htmlType="submit"
                loading={isSaveLoading}
                disabled={saveDisabled}
              >
                save
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Spin>
  );
};

export default CustomerEngagement;
