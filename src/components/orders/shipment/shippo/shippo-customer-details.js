import { Col, Form, Input, Row } from 'antd';
import { get } from 'lodash';
import React from 'react';

function ShippoCustomerDetails(properties) {
  const { customerDetails, setCustomerDetails } = properties;

  const handleOnChange = (event) => {
    const { value, name } = event.target;
    setCustomerDetails({ ...customerDetails, [name]: value });
  };

  return (
    <div className="customer-details-container">
      <div className="customer-details-title">Add Customer Details</div>
      <div className="customer-info-details">
        <Row>
          <Col md={12} xs={24}>
            <Form.Item
              name="name"
              label="customer Name"
              initialValue={get(customerDetails, 'name', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a customer name',
                },
              ]}
            >
              <Input name="name" readOnly placeholder="Enter customer name" />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              name="phone"
              label="Phone Number"
              initialValue={get(customerDetails, 'phone', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a phone number',
                },
              ]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
          <Col md={24} xs={24} className="header-main">
            <Form.Item
              name="street1"
              label="Address"
              initialValue={get(customerDetails, 'street1', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a address',
                },
              ]}
            >
              <Input
                onChange={(event) => {
                  handleOnChange(event);
                }}
                name="street1"
                placeholder="Enter address"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              name="email"
              label="Email Address"
              initialValue={get(customerDetails, 'email', '')}
            >
              <Input readOnly placeholder="Enter Email" />
            </Form.Item>
          </Col>

          <Col md={12} xs={12}>
            <Form.Item
              name="city"
              label="City"
              initialValue={get(customerDetails, 'city', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a city',
                },
              ]}
            >
              <Input
                name="city"
                onChange={(event) => {
                  handleOnChange(event);
                }}
                placeholder="Enter city"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="state"
              label="State"
              initialValue={get(customerDetails, 'state', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a state',
                },
              ]}
            >
              <Input
                value={get(customerDetails, 'state', '')}
                name="state"
                onChange={(event) => {
                  handleOnChange(event);
                }}
                placeholder="Enter state"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="country"
              label="Country"
              initialValue={get(customerDetails, 'country', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a country',
                },
              ]}
            >
              <Input readOnly placeholder="Enter country" />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="zip"
              label="Pincode"
              initialValue={get(customerDetails, 'zip', '')}
              readOnly
              rules={[
                {
                  required: true,
                  message: 'Please enter a pincode',
                },
              ]}
            >
              <Input
                type="number"
                name="zip"
                onChange={(event) => {
                  handleOnChange(event);
                }}
                placeholder="Enter pincode"
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </div>
  );
}
export default ShippoCustomerDetails;
