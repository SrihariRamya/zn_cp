import { Button, Col, Form, Input, Row, Space } from 'antd';
import { get } from 'lodash';
import React from 'react';
import { trimPayloadFields } from '../../../../shared/form-helpers';

function AddShippoPickupAddress(properties) {
  const { onClose, mode, address, addButtonloading, handleAddAddress } =
    properties;
  const [form] = Form.useForm();

  const onFinish = (values) => {
    const trimFormValues = {};
    trimPayloadFields(values, trimFormValues);
    handleAddAddress(trimFormValues);
  };

  return (
    <div className="add-new-address-container">
      <Form form={form} onFinish={onFinish} layout="vertical">
        <div>
          <div className="delhivery-delivery-address-details">
            <div className="delivery-information-text">
              Pickup address details
            </div>
            <Row>
              <Col md={12} xs={24}>
                <Form.Item
                  name="name"
                  label="Name"
                  initialValue={get(address, 'name', '')}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter a seller name',
                    },
                  ]}
                >
                  <Input name="name" placeholder="Seller Name" />
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
                  ]}
                >
                  <Input placeholder="Phone Number" />
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
                    name="address"
                    placeholder="House/Floor No., Building Name or Street, Locality"
                  />
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
                  ]}
                >
                  <Input name="pin" type="number" placeholder="Pincode" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="city"
                  label="City"
                  initialValue={get(address, 'city', '')}
                  rules={[
                    {
                      required: true,
                      message: 'Please select the city',
                    },
                  ]}
                >
                  <Input name="city" placeholder="City" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="state"
                  label="State"
                  initialValue={get(address, 'state', '')}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter the state',
                    },
                  ]}
                >
                  <Input name="state" placeholder="State" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="country" label="Country" initialValue="US">
                  <Input placeholder="Country" />
                </Form.Item>
              </Col>
            </Row>
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
  );
}
export default AddShippoPickupAddress;
