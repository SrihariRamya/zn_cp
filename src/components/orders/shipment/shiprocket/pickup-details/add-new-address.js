import { Button, Col, Form, Input, notification, Row, Space, Spin } from 'antd';
import { get } from 'lodash';
import React, { useState } from 'react';
import { FAILED_TO_LOAD } from '../../../../../shared/constant-values';
import getFormItemRules from '../../../../../shared/form-helpers';
import { getLocationByPincode } from '../../../../../utils/api/url-helper';

function AddNewAddress({
  onClose,
  mode,
  address,
  addButtonloading,
  handleAddAddress,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const onFinish = (values) => {
    handleAddAddress(values);
  };
  const fetchLocationByPincode = (pincode) => {
    setLoading(true);
    getLocationByPincode(pincode)
      .then((resp) => {
        form.setFieldsValue({ pin_code: get(resp, 'data.pincode', '') });
        form.setFieldsValue({ city: get(resp, 'data.district', '') });
        form.setFieldsValue({ state: get(resp, 'data.state', '') });
        form.setFieldsValue({ country: 'India' });
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };
  const handleOnChange = (event) => {
    const { value } = event.target;
    if (value && value.toString().length === 6) {
      fetchLocationByPincode(value);
    }
  };
  return (
    <Spin spinning={loading}>
      <div className="add-new-address-container">
        <Form form={form} onFinish={onFinish} layout="vertical">
          <div>
            <div className="address-tag-details">
              <Col span={24}>
                <Form.Item
                  initialValue={get(address, 'pickup_location')}
                  name="pickup_location"
                  label="Address Tag"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter a address tag',
                    },
                    ...getFormItemRules({
                      whitespace: true,
                    }),
                  ]}
                >
                  <Input placeholder="Address Tag" />
                </Form.Item>
              </Col>
            </div>
            <div className="contact-information-details">
              <div className="contact-information-text">
                Contact information for this location
              </div>
              <Row>
                <Col span={12}>
                  <Form.Item
                    initialValue={get(address, 'name')}
                    name="name"
                    label="Contact Person"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a contact person',
                      },
                      ...getFormItemRules({
                        whitespace: true,
                      }),
                    ]}
                  >
                    <Input placeholder="Contact Person" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    initialValue={get(address, 'phone')}
                    name="phone"
                    label="Contact Number"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a contact number',
                      },
                      {
                        validator(_, value) {
                          const pattern = /^(\+\d{1,3}[ -]?)?\d{10}$/;
                          if (value && !pattern.test(value)) {
                            // eslint-disable-next-line prefer-promise-reject-errors
                            return Promise.reject(
                              'Please enter a valid phone number'
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      readOnly={mode === 'Edit'}
                      placeholder="Contact Number"
                      addonBefore="+91"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    initialValue={get(address, 'email')}
                    name="email"
                    label="Email Address"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a email address',
                      },
                      {
                        type: 'email',
                        message: 'Please enter a valid email address',
                      },
                    ]}
                  >
                    <Input placeholder="Email Address" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    initialValue={get(address, 'alternate_phone_number')}
                    name="alternate_phone_number"
                    label="Alternate Phone Number"
                    rules={[
                      {
                        validator(_, value) {
                          const pattern = /^(\+\d{1,3}[ -]?)?\d{10}$/;
                          if (value && !pattern.test(value)) {
                            // eslint-disable-next-line prefer-promise-reject-errors
                            return Promise.reject(
                              'Please enter a valid phone number'
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      placeholder="Alternate Phone Number"
                      addonBefore="+91"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div className="delivery-address-details">
              <div className="delivery-information-text">
                How can the delivery person reach the address?
              </div>
              <Row>
                <Col span={24}>
                  <Form.Item
                    name="address"
                    label="Complete Address"
                    initialValue={get(address, 'address')}
                    rules={[
                      {
                        required: true,
                        message:
                          'Please provide complete address in complete address field',
                      },
                      ...getFormItemRules({
                        whitespace: true,
                      }),
                    ]}
                  >
                    <Input placeholder="House/Floor No., Building Name or Street, Locality" />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Form.Item
                    name="pin_code"
                    label="Pincode"
                    initialValue={get(address, 'pin_code')}
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a pincode',
                      },
                      ...getFormItemRules({
                        whitespace: true,
                        pincode: true,
                      }),
                    ]}
                  >
                    <Input
                      onChange={(event) => {
                        handleOnChange(event);
                      }}
                      type="number"
                      placeholder="Pincode"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="city"
                    label="City"
                    initialValue={get(address, 'city')}
                  >
                    <Input readOnly placeholder="City" />
                  </Form.Item>
                </Col>
              </Row>
              <div className="notes-text">
                Note: Verify the address in your shiprocket account
              </div>
            </div>
            <div className="flex-end mt-20">
              <Form.Item>
                <Space className="f_btns">
                  <Button onClick={onClose}>Cancel</Button>
                  <Button
                    loading={addButtonloading}
                    type="primary"
                    htmlType="submit"
                  >
                    {mode === 'Add' ? 'Add Address' : 'Save Address'}
                  </Button>
                </Space>
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </Spin>
  );
}
export default AddNewAddress;
