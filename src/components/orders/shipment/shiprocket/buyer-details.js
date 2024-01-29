import { Col, Form, Input, notification, Row, Spin } from 'antd';
import { get } from 'lodash';
import React, { useState } from 'react';
import { FAILED_TO_LOAD } from '../../../../shared/constant-values';
import getFormItemRules from '../../../../shared/form-helpers';
import { getLocationByPincode } from '../../../../utils/api/url-helper';

function BuyerDetails(parameters) {
  const { form, buyerDetails, setBuyerDetails } = parameters;
  const [loading, setLoading] = useState(false);
  const fetchLocationByPincode = (pincode) => {
    setLoading(true);
    getLocationByPincode(pincode)
      .then((resp) => {
        setBuyerDetails({
          ...buyerDetails,
          billing_pincode: get(resp, 'data.pincode', ''),
          billing_city: get(resp, 'data.district', ''),
          billing_state: get(resp, 'data.state', ''),
        });
        form.setFieldsValue({ billing_pincode: get(resp, 'data.pincode', '') });
        form.setFieldsValue({ billing_city: get(resp, 'data.district', '') });
        form.setFieldsValue({ billing_state: get(resp, 'data.state', '') });
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
    if (name === 'billing_address') {
      setBuyerDetails({ ...buyerDetails, billing_address: value });
    } else if (name === 'billing_address_2') {
      setBuyerDetails({ ...buyerDetails, billing_address_2: value });
    } else if (value && value.toString().length === 6) {
      fetchLocationByPincode(value);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="buyer-details-container">
        <Row>
          <Col>
            <div className="buyer-details-title">Buyer Information</div>
          </Col>
          <Col>
            <div className="buyer-details-info">
              (To whom is the order being delivered)
            </div>
          </Col>
        </Row>
        <div className="buyer-info-details">
          <Row>
            <Col xl={10} xs={24}>
              <Form.Item
                name="billing_customer_name"
                label="Full Name"
                initialValue={get(buyerDetails, 'billing_customer_name', '')}
                rules={[
                  {
                    required: true,
                    message: 'Please enter a full name',
                  },
                ]}
              >
                <Input placeholder="Full Name" />
              </Form.Item>
            </Col>
            <Col xl={10} xs={24}>
              <Form.Item
                name="billing_phone"
                label="Mobile Number"
                initialValue={get(buyerDetails, 'billing_phone', '')}
                rules={[
                  {
                    required: true,
                    message: 'Please enter a mobile phone',
                  },
                ]}
              >
                <Input placeholder="Mobile" addonBefore="+91" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xl={10} xs={24}>
              <Form.Item
                name="billing_email"
                initialValue={get(buyerDetails, 'billing_email', '')}
                label="Email Address"
                rules={[
                  {
                    required: true,
                    message: 'Please enter a email address',
                  },
                ]}
              >
                <Input placeholder="Email Address" />
              </Form.Item>
            </Col>
          </Row>
          <div className="buyer-details-title">
            Buyer Address{' '}
            <span className="buyer-details-info">
              (Where is the order being delivered to ?)
            </span>
          </div>
          <div>
            <Row>
              <Col md={24} xs={24}>
                <Form.Item
                  name="billing_address"
                  label="Complete Address"
                  initialValue={get(buyerDetails, 'billing_address', '')}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter a complete address',
                    },
                    {
                      min: 3,
                      message:
                        'Complete address should have minimum 3 characters',
                    },
                    ...getFormItemRules({
                      whitespace: true,
                    }),
                  ]}
                >
                  <Input
                    name="billing_address"
                    onChange={(event) => {
                      handleOnChange(event);
                    }}
                    placeholder="House/Floor No., Building Name or Street, Locality"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Row>
                <Col xs={11} md={10}>
                  <Form.Item
                    name="billing_pincode"
                    label="Pincode"
                    initialValue={get(buyerDetails, 'billing_pincode', '')}
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
                      type="number"
                      name="billing_pincode"
                      onChange={(event) => {
                        handleOnChange(event);
                      }}
                      placeholder="Pincode"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={10}>
                  <Form.Item
                    name="billing_city"
                    label="City"
                    initialValue={get(buyerDetails, 'billing_city', '')}
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a city',
                      },
                    ]}
                  >
                    <Input readOnly placeholder="City" />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col xs={11} md={10}>
                  <Form.Item
                    name="billing_state"
                    label="State"
                    initialValue={get(buyerDetails, 'billing_state', '')}
                  >
                    <Input
                      value={get(buyerDetails, 'billing_state', '')}
                      readOnly
                      placeholder="Please select State"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={10}>
                  <Form.Item
                    name="billing_country"
                    label="Country"
                    initialValue={get(buyerDetails, 'billing_country', '')}
                    rules={[
                      {
                        required: true,
                        message: 'Please select a country',
                      },
                    ]}
                  >
                    <Input readOnly placeholder="Please select country" />
                  </Form.Item>
                </Col>
              </Row>
            </Row>
          </div>
        </div>
      </div>
    </Spin>
  );
}
export default BuyerDetails;
