import {
  Button,
  Col,
  Form,
  Input,
  notification,
  Row,
  Space,
  Spin,
  Card,
  Popconfirm,
  Switch,
} from 'antd';
import { get, isEmpty } from 'lodash';
import React, { useState } from 'react';
import {
  SHIPMENT_UPDATE_SUCCESS,
  SHIPMENT_UPDATE_FAILED,
} from '../../../../shared/constant-values';
import {
  createInitialAddress,
  updateShipmentMethod,
} from '../../../../utils/api/url-helper';
import ShippoIcon from '../../../../assets/shippo-land.png';

function CreateInitialAddress(properties) {
  const { onClose, shipmentMethod, fetchShippingMethod } = properties;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    shipmentMethod.api_token = values.api_token;
    const parameters = { values, shipmentMethod };

    createInitialAddress(parameters)
      .then((resp) => {
        if (resp.success) {
          fetchShippingMethod();
          setLoading(false);
          notification.success({
            message: 'Shippo account Created successfully',
          });
        }
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message:
            get(error, 'message.detail', false) ||
            'The data you sent was not accepted as valid',
        });
      });
  };

  const updateShipmentMode = (value) => {
    const { Id, checked, forceActivate } = value;
    setLoading(true);
    updateShipmentMethod(Id, {
      is_active: checked,
      force_activate: forceActivate,
    })
      .then((resp) => {
        if (get(resp, 'success', false)) {
          notification.success({ message: SHIPMENT_UPDATE_SUCCESS });
          fetchShippingMethod();
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', '') || SHIPMENT_UPDATE_FAILED,
        });
      });
  };

  return (
    <Spin spinning={loading}>
      <div className="add-new-address-container">
        {!isEmpty(shipmentMethod) &&
          !get(shipmentMethod, 'is_active', false) && (
            <Form form={form} onFinish={onFinish} layout="vertical">
              <div>
                <div>
                  <div className="contact-delhivery-information-text mt-10">
                    Create a new address in your Shippo account
                  </div>
                  <div className="shiprocket-first-container">
                    <Card className="shiprocket-first-user">
                      <div className="shiprocket-first-block">
                        <div style={{ marginBottom: '15px' }}>
                          <span>
                            <img
                              className="shippo-method-img"
                              src={ShippoIcon}
                              alt="logout"
                            />
                          </span>
                        </div>
                        <div>
                          <Popconfirm
                            title="Are you sure to change shipment status?"
                            onConfirm={() => {
                              updateShipmentMode({
                                Id: get(
                                  shipmentMethod,
                                  'shipment_method_id',
                                  ''
                                ),
                                checked: !get(shipmentMethod, 'is_active', ''),
                                forceActivate: true,
                              });
                            }}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Switch
                              style={{ marginTop: '10px' }}
                              id="enable-shiprocket"
                              checked={get(shipmentMethod, 'is_active', '')}
                              disabled={isEmpty(
                                get(shipmentMethod, 'api_token', '')
                              )}
                            />
                          </Popconfirm>
                        </div>
                      </div>
                      <Form.Item
                        label="API Token"
                        name="api_token"
                        initialValue={get(shipmentMethod, 'api_token', '')}
                        rules={[
                          {
                            required: true,
                            message: 'Please enter your api token!',
                          },
                        ]}
                      >
                        <Input name="api_token" placeholder="API Token" />
                      </Form.Item>
                      <div className="notes-text">
                        Note : Simplify Shipping and Save Everything you need
                        for scalable shipping in one place, plus the best rates
                        from top carriers.
                      </div>
                    </Card>
                  </div>
                  {/* )} */}

                  <div className="steps-shiprocket">
                    <div>
                      <b>Step 1: </b>Log in or sign up at (Shippo).
                    </div>
                    <div>
                      <b>Step 2: </b>Find and navigate to the &quot;API&quot; or
                      &quot;API Settings&quot; section in the Shippo Dashboard.
                    </div>
                    <div>
                      <b>Step 3: </b>Look for an option to generate a new API
                      token. This is usually found in the API settings
                    </div>
                    <div>
                      <b>Step 4: </b>Once generated, copy the API token
                      provided. This token is what you will use to authenticate
                      your requests to the Shippo API.
                    </div>
                    <div>
                      <b>Step 5: </b>Paste the API token on Above field (or) In
                      Zupain&apos;s admin panel, go to Settings {'->'} Shipment{' '}
                      {'->'} Shippo Shipment
                    </div>
                    <div>
                      <b>Step 6: </b>Paste the API token and click submit.
                    </div>
                    <div>
                      <b>Step 7: </b>Enable the toggle button.
                    </div>
                  </div>
                  <Row>
                    <Col span={24}>
                      <Form.Item
                        name="name"
                        label="Name"
                        className="mt-10"
                        initialValue={get(shipmentMethod, 'shippo_name', '')}
                        rules={[
                          {
                            required: true,
                            message: 'Please enter a name',
                          },
                        ]}
                      >
                        <Input name="name" placeholder="Enter the Name" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="company"
                        label="Company"
                        initialValue={get(shipmentMethod, 'shippo_company', '')}
                        rules={[
                          {
                            required: true,
                            message: 'Please enter a company name',
                          },
                        ]}
                      >
                        <Input name="company" placeholder="company name" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="street1"
                        label="Address"
                        initialValue={get(shipmentMethod, 'shippo_street1', '')}
                        rules={[
                          {
                            required: true,
                            message: 'Please provide address in address field',
                          },
                        ]}
                      >
                        <Input
                          name="street1"
                          placeholder="House/Floor No., Building Name or Street, Locality"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="city"
                        label="City"
                        initialValue={get(shipmentMethod, 'shippo_city', '')}
                        rules={[
                          {
                            required: true,
                            message: 'Please enter the city',
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
                        initialValue={get(shipmentMethod, 'shippo_state', '')}
                        rules={[
                          {
                            required: true,
                            message: 'Please Enter the state',
                          },
                        ]}
                      >
                        <Input name="state" placeholder="State" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="pin"
                        label="Pincode"
                        initialValue={get(shipmentMethod, 'shippo_zip', '')}
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
                        name="country"
                        label="Country"
                        initialValue="US"
                        rules={[
                          {
                            required: true,
                            message: 'Please Enter the country',
                          },
                        ]}
                      >
                        <Input readOnly placeholder="Country" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="Email Address"
                        initialValue={get(shipmentMethod, 'shippo_email', '')}
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
                        name="phone"
                        label="Phone Number"
                        initialValue={get(shipmentMethod, 'shippo_phone', '')}
                        rules={[
                          {
                            required: true,
                            message: 'Please enter a phone number',
                          },
                        ]}
                      >
                        <Input
                          name="phone"
                          type="number"
                          placeholder="Phone Number"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                <div className="flex-end mt-20">
                  <Form.Item>
                    <Space className="f_btns">
                      <Button onClick={onClose}>Cancel</Button>
                      <Button type="primary" htmlType="submit">
                        Create Address
                      </Button>
                    </Space>
                  </Form.Item>
                </div>
              </div>
            </Form>
          )}
      </div>
    </Spin>
  );
}
export default CreateInitialAddress;
