import { Col, Form, Input, notification, Row, Spin } from 'antd';
import { get } from 'lodash';
import React, { useState } from 'react';
import { FAILED_TO_LOAD } from '../../../../shared/constant-values';
import getFormItemRules from '../../../../shared/form-helpers';
import { getLocationByPincode } from '../../../../utils/api/url-helper';

function CustomerDetails(parameters) {
  const { form, customerDetails, setCustomerDetails } = parameters;
  const [loading, setLoading] = useState(false);

  const fetchLocationByPincode = (pincode) => {
    setLoading(true);
    getLocationByPincode(pincode)
      .then((resp) => {
        setCustomerDetails({
          ...customerDetails,
          pin: get(resp, 'data.pincode', ''),
          city: get(resp, 'data.district', ''),
          state: get(resp, 'data.state', ''),
        });
        form.setFieldsValue({ pin: get(resp, 'data.pincode', '') });
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
    const { value, name } = event.target;
    if (value && value.toString().length === 6 && name === 'pin') {
      fetchLocationByPincode(value);
    } else {
      setCustomerDetails({ ...customerDetails, [name]: value });
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="customer-details-container">
        <div className="customer-details-title">Add Customer Details</div>
        <div className="customer-info-details">
          <Row>
            <Col md={24} xs={24} className="header-main">
              <Form.Item
                name="add"
                label="Address"
                initialValue={get(customerDetails, 'add', '')}
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
                  name="add"
                  placeholder="Enter address"
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                name="name"
                label="Contact person"
                initialValue={get(customerDetails, 'name', '')}
                rules={[
                  {
                    required: true,
                    message: 'Please enter a contact name',
                  },
                  ...getFormItemRules({
                    whitespace: true,
                  }),
                ]}
              >
                <Input
                  name="name"
                  readOnly
                  placeholder="Enter contact person name"
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
                <Input
                  readOnly
                  addonBefore="+91"
                  placeholder="Enter phone number"
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                name="alternate_phone"
                label="Alternate Phone Number"
                initialValue={get(customerDetails, 'alternate_phone', '')}
                rules={[
                  {
                    validator(_, value) {
                      const pattern = /^(\+\d{1,3}[ -]?)?\d{10}$/;
                      if (value && !pattern.test(value)) {
                        return Promise.reject(
                          new Error(
                            'Please enter a valid alternate phone number'
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  type="number"
                  addonBefore="+91"
                  placeholder="Enter alternate phone number"
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={12}>
              <Form.Item
                name="pin"
                label="Pincode"
                initialValue={get(customerDetails, 'pin', '')}
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
                  type="number"
                  name="pin"
                  onChange={(event) => {
                    handleOnChange(event);
                  }}
                  placeholder="Enter pincode"
                />
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
                <Input readOnly placeholder="Enter city" />
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
                  readOnly
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
          </Row>
        </div>
      </div>
    </Spin>
  );
}
export default CustomerDetails;
