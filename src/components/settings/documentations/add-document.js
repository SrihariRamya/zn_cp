import { Button, Form, Input, Modal, Row, Space, notification } from 'antd';
import React, { useState, useContext } from 'react';
import { get } from 'lodash';
import { createDocument } from '../../../utils/api/url-helper';
import {
  ADD_DOCUMENT_TEXT,
  BUTTON_CANCEL_TEXT,
  BUTTON_CREATE_TEXT,
  FAILED_TO_LOAD,
  TENANT_MODE_CLIC,
} from '../../../shared/constant-values';
import { TenantContext } from '../../context/tenant-context';

function AddDocument(properties) {
  const { showModal, refresh, setShowModal } = properties;
  const [tenantDetails] = useContext(TenantContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = (data) => {
    data.document_path = `/${get(data, 'document_path', '')}`;
    setLoading(true);
    createDocument(data)
      .then(() => {
        setLoading(false);
        refresh();
        form.resetFields();
      })
      .catch((error) => {
        notification.error({ message: get(error, 'error', FAILED_TO_LOAD) });
        setLoading(false);
      });
  };

  return (
    <Modal
      title={ADD_DOCUMENT_TEXT}
      open={showModal}
      className={
        get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC
          ? 'add-document-content'
          : 'settings-payment-modal'
      }
      footer={false}
      onCancel={() => {
        setShowModal(false);
        form.resetFields();
      }}
    >
      <Form
        form={form}
        layout="vertical"
        scrollToFirstError
        onFinish={onFinish}
      >
        <Form.Item
          label="Documentation Name"
          name="document_name"
          className="document-name"
          rules={[
            {
              required: true,
              message: 'Please enter your documentation name!',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Documentation Path"
          name="document_path"
          className="document-path"
          rules={[
            {
              required: true,
              message: 'Please enter your documentation path!',
            },
            () => ({
              validator(_, value) {
                const pattern = /[^\w.~\-]+/;
                if (!pattern.test(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(
                    'Documentation path can only include ("-", ".", "_", "~") these special characters'
                  )
                );
              },
            }),
          ]}
        >
          <Input addonBefore="/" />
        </Form.Item>
        <Row justify="end">
          <Form.Item>
            <Space>
              <Button
                type="default"
                style={{ color: 'red' }}
                onClick={() => {
                  setShowModal(false);
                  form.resetFields();
                }}
              >
                {BUTTON_CANCEL_TEXT}
              </Button>
              <Button
                id="document-save"
                htmlType="submit"
                type="primary"
                loading={loading}
              >
                {BUTTON_CREATE_TEXT}
              </Button>
            </Space>
          </Form.Item>
        </Row>
      </Form>
    </Modal>
  );
}
export default AddDocument;
