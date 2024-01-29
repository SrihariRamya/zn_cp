import { Button, Form, Input, Space, Switch } from 'antd';
import { get, isEmpty } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import ModalHeader from '../../../shared/modal-header-helper';

function PaymentBankDetails({
  onClose,
  loading,
  updatePaymentBankDetails,
  paymentMethod,
}) {
  const [form] = Form.useForm();
  const [enableBankDetails, setEnableBankDetails] = useState(false);
  const [enablePaymentProof, setEnablePaymentProof] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const onChanged = () => {
    setEnableBankDetails(!enableBankDetails);
    if (isEmpty(get(paymentMethod, 'account_number', ''))) {
      form.setFieldsValue({
        account_name: '',
        account_number: '',
        bank_branch: '',
        ifsc_code: '',
      });
    }
  };

  const onChangeProof = () => {
    setEnablePaymentProof(!enablePaymentProof);
  };

  useEffect(() => {
    form.setFieldsValue(paymentMethod);
    if (get(paymentMethod, 'account_number', '')) {
      setEnableBankDetails(true);
    }
    if (get(paymentMethod, 'is_proof', '')) {
      setEnablePaymentProof(get(paymentMethod, 'is_proof', false));
    }
  }, []);

  const onFinish = useCallback((values) => {
    updatePaymentBankDetails(values, paymentMethod);
  }, []);
  return (
    <div className="payment-bank-details-contaniner">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div>
          <ModalHeader title="Enter UPI Details" />
          <div className="mt-10">
            <Form.Item
              name="is_proof"
              label="Do you need payment proof?"
              className="payment-details-switch"
              labelCol={{ span: 12 }}
              wrapperCol={{ span: 12 }}
            >
              <Switch
                onChange={onChangeProof}
                checked={enablePaymentProof}
                className="switch-container"
                size="small"
              />
            </Form.Item>
            <Form.Item
              name="merchant_name"
              label="Merchant Name"
              rules={[
                {
                  required: true,
                  message: 'Please enter a Merchant Name',
                },
              ]}
              className="payment-details-form"
            >
              <Input placeholder="Merchant Name" />
            </Form.Item>
            <Form.Item
              name="upi_id"
              label="UPI ID"
              rules={[
                {
                  required: true,
                  message: 'Please enter a UPI ID',
                },
              ]}
              className="payment-details-form"
            >
              <Input placeholder="UPI ID" />
            </Form.Item>
          </div>
        </div>
        <div className="mt-10">
          {/* <div className="flex">
            <div className="label-text">Enter Bank Details</div>
            <div className="ml-10">
              <Switch
                checked={enableBankDetails}
                onChange={onChanged}
                size="small"
              />
            </div>
          </div> */}
          {/* {enableBankDetails && (
            <div className="mt-10">
              <Row>
                <Col span={12}>
                  <Form.Item
                    name="account_name"
                    label="Account Name"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a Account Name',
                      },
                    ]}
                  >
                    <Input placeholder="Account Name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="account_number"
                    label="Account Number"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a Account Number',
                      },
                    ]}
                  >
                    <Input placeholder="Account Number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="bank_branch"
                    label="Bank Branch"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a Bank Branch',
                      },
                    ]}
                  >
                    <Input placeholder="Bank Branch" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="ifsc_code"
                    label="IFSC Code"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a IFSC Code',
                      },
                      {
                        pattern: new RegExp(/^[A-Z]{4}0[A-Z0-9]{6}$/),
                        message: 'Please enter valid IFSC Code',
                      },
                    ]}
                  >
                    <Input placeholder="IFSC Code" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )} */}
        </div>
        <div className="flex-end mt-20">
          <Form.Item>
            <Space className="f_btns">
              <Button onClick={onClose}>Cancel</Button>
              <Button loading={loading} type="primary" htmlType="submit">
                {isEmpty(get(paymentMethod, 'merchant_name'))
                  ? 'Create'
                  : 'Save'}
              </Button>
            </Space>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
export default PaymentBankDetails;
