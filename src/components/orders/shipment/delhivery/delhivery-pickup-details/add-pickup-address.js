import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  notification,
  Row,
  Space,
  Spin,
} from 'antd';
import { get } from 'lodash';
import React, { useState } from 'react';
import { FAILED_TO_LOAD } from '../../../../../shared/constant-values';
import getFormItemRules, {
  trimPayloadFields,
} from '../../../../../shared/form-helpers';
import { getLocationByPincode } from '../../../../../utils/api/url-helper';

function AddPickupAddress({
  onClose,
  mode,
  address,
  addButtonloading,
  handleAddAddress,
  selectedRetrunAddress,
  setSelectedRetrunAddress,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    const trimFormValues = {};
    trimPayloadFields(values, trimFormValues);
    handleAddAddress(trimFormValues);
  };
  const fetchLocationByPincode = (pincode, id) => {
    setLoading(true);
    getLocationByPincode(pincode)
      .then((resp) => {
        if (id === 'pin') {
          form.setFieldsValue({
            pin: get(resp, 'data.pincode', ''),
            city: get(resp, 'data.district', ''),
            state: get(resp, 'data.state', ''),
            country: 'India',
          });
        } else {
          form.setFieldsValue({
            return_pin: get(resp, 'data.pincode', ''),
            return_city: get(resp, 'data.district', ''),
            return_state: get(resp, 'data.state', ''),
            return_country: 'India',
          });
        }
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
    const { value, id } = event.target;
    if (value && value.toString().length === 6) {
      fetchLocationByPincode(value, id);
    }
  };
  const handleCheckboxOnChange = (event) => {
    setSelectedRetrunAddress(event.target.checked);
  };
  const handleAddressOnchange = (event) => {
    const { value } = event.target;
    form.setFieldsValue({
      address: value,
    });
  };

  return (
    <Spin spinning={loading}>
      <div className="add-new-address-container">
        <Form form={form} onFinish={onFinish} layout="vertical">
          <div>
            <div>
              <div className="contact-delhivery-information-text">
                Contact information details
              </div>
              <Row>
                <Col span={24}>
                  <Form.Item
                    initialValue={get(address, 'name', '')}
                    name="name"
                    label="Pickup Point Name"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a pickup point name',
                      },
                    ]}
                  >
                    <Input
                      disabled={mode === 'Edit'}
                      placeholder="Pickup Point Name"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    initialValue={get(address, 'registered_name', '')}
                    name="registered_name"
                    label="Contact Person"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a contact person',
                      },
                    ]}
                  >
                    <Input placeholder="Contact Person" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    initialValue={get(address, 'email', '')}
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
                    initialValue={get(address, 'phone', '')}
                    name="phone"
                    label="Phone Number"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a phone number',
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
                      placeholder="Phone Number"
                      addonBefore="+91"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    initialValue={get(address, 'alternate_phone_number', '')}
                    name="secondary_phone_number"
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
            <div className="delhivery-delivery-address-details">
              <div className="delivery-information-text">
                Pickup address details
              </div>
              <Row>
                <Col span={24}>
                  <Form.Item
                    name="address"
                    label="Address"
                    initialValue={get(address, 'address', '')}
                    rules={[
                      {
                        required: true,
                        message: 'Please provide address in address field',
                      },
                    ]}
                  >
                    <Input
                      onChange={handleAddressOnchange}
                      placeholder="House/Floor No., Building Name or Street, Locality"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    initialValue={get(address, 'address_2', '')}
                    name="address_2"
                    label="Landmark"
                    rules={[
                      {
                        min: 3,
                        message: 'Landmark should have minimum 3 characters',
                      },
                    ]}
                  >
                    <Input placeholder="Landmark" />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Form.Item
                    name="pin"
                    label="Pincode"
                    initialValue={get(address, 'pin', '')}
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a pincode',
                      },
                      ...getFormItemRules({
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
                    initialValue={get(address, 'city', '')}
                  >
                    <Input readOnly placeholder="City" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="state"
                    label="State"
                    initialValue={get(address, 'state', '')}
                  >
                    <Input readOnly placeholder="State" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="country"
                    label="Country"
                    initialValue={get(address, 'country', '')}
                  >
                    <Input readOnly placeholder="Country" />
                  </Form.Item>
                </Col>
              </Row>
              <Checkbox
                checked={selectedRetrunAddress}
                onChange={handleCheckboxOnChange}
              >
                Return address same as pickup address
              </Checkbox>
            </div>
            {!selectedRetrunAddress && (
              <div className="delhivery-delivery-address-details">
                <div className="delivery-information-text">
                  Return address details
                </div>
                <Row>
                  <Col span={24}>
                    <Form.Item
                      name="return_address"
                      label="Return Address"
                      initialValue={
                        mode === 'Edit'
                          ? get(address, 'return_address', '')
                          : get(address, 'address', '')
                      }
                      rules={[
                        {
                          required: true,
                          message: 'Please provide address in address field',
                        },
                      ]}
                    >
                      <Input placeholder="House/Floor No., Building Name or Street, Locality" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      initialValue={
                        mode === 'Edit'
                          ? get(address, 'return_address_2', '')
                          : get(address, 'address_2', '')
                      }
                      name="return_address_2"
                      label="Return Landmark"
                      rules={[
                        {
                          min: 3,
                          message: 'Landmark should have minimum 3 characters',
                        },
                      ]}
                    >
                      <Input placeholder="Landmark" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Form.Item
                      name="return_pin"
                      label="Return Pincode"
                      initialValue={
                        mode === 'Edit'
                          ? get(address, 'return_pin', '')
                          : get(address, 'pin', '')
                      }
                      rules={[
                        {
                          required: true,
                          message: 'Please enter a pincode',
                        },
                        ...getFormItemRules({
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
                      name="return_city"
                      label="Return City"
                      initialValue={
                        mode === 'Edit'
                          ? get(address, 'return_city', '')
                          : get(address, 'city', '')
                      }
                    >
                      <Input readOnly placeholder="City" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="return_state"
                      label="Return State"
                      initialValue={
                        mode === 'Edit'
                          ? get(address, 'return_state', '')
                          : get(address, 'state', '')
                      }
                    >
                      <Input readOnly placeholder="State" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="return_country"
                      label="Return Country"
                      initialValue={
                        mode === 'Edit'
                          ? get(address, 'return_country', '')
                          : get(address, 'country', '')
                      }
                    >
                      <Input readOnly placeholder="Country" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            )}
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
export default AddPickupAddress;
