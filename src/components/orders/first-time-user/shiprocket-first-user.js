import { React, useState, useEffect } from 'react';
import {
  Button,
  Card,
  Popconfirm,
  Spin,
  Switch,
  Form,
  Input,
  notification,
} from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import { filter, get, trim } from 'lodash';
import { CopyOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import {
  FAILED_TO_LOAD,
  SHIPMENT_UPDATE_FAILED,
  SHIPMENT_UPDATE_SUCCESS,
} from '../../../shared/constant-values';
import { ReactComponent as ShiprocketTextIcon } from './shiprocket-first.svg';
import {
  getAllShipmentMethods,
  updateShipmentMethod,
  getOnboardGuide,
} from '../../../utils/api/url-helper';

function FirstShipRocketUser(properties) {
  const { handleSave, setHandleBasic } = properties;
  const [loading, setLoading] = useState(false);
  const [updateId, setUpdateId] = useState({ Id: undefined });
  const [shiprocketCredential, setShiprocketCredential] = useState({});
  const [shipRocketToken, setShipRocketToken] = useState('');
  const { hostname } = window.location;
  const [showForm, setShowForm] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const [shipRocketMethod, setShipRocketMethod] = useState('');

  const fetchShipmentMethodData = () => {
    setLoading(true);

    const apiArrays = [getAllShipmentMethods(), getOnboardGuide()];
    Promise.all(apiArrays)
      .then((response) => {
        setShiprocketCredential(response[0].data[1]);
        setShipRocketToken(get(response, '[0].shipRocketToken'));
        const dataValue = get(response, '[0].data', []);
        get(response, '[0].data', []).map((item) => {
          const returnValue = item;
          if (returnValue.password) {
            const bytes = CryptoJS.AES.decrypt(
              get(item, 'password', ''),
              get(response, '[0].shipRocketToken', '')
            );
            returnValue.password = bytes.toString(CryptoJS.enc.Utf8);
          }
          return returnValue;
        });
        const shiprocketValues = filter(
          dataValue,
          (item) => item.slug === 'shiprocket'
        );
        setShipRocketMethod(shiprocketValues[0]);
        setLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error || FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchShipmentMethodData();
  }, []);

  const setButtonCancel = () => {
    setShowButton(true);
    setShowForm(false);
  };
  const submitDelhivey = (data) => {
    setShowButton(false);
    setShowForm(!showForm);
    setUpdateId({
      Id: get(data, 'shipment_method_id'),
      method: get(data, 'method_name'),
      checked: get(data, 'is_active', false),
    });
  };

  const handleButtonClick = () => {
    handleSave();
  };

  const updateShipmentMode = (value) => {
    const { Id, checked, email, password, forceActivate, apiToken } = value;
    setLoading(true);
    updateShipmentMethod(Id, {
      is_active: checked,
      email,
      password,
      force_activate: forceActivate,
      api_token: trim(apiToken),
    })
      .then((resp) => {
        if (get(resp, 'success', false)) {
          notification.success({ message: SHIPMENT_UPDATE_SUCCESS });
          fetchShipmentMethodData();
          handleButtonClick();
          setLoading(false);
          setShowForm(false);
          setHandleBasic(false);
        } else {
          setLoading(false);
          notification.error({ message: 'Email or password is incorrect' });
        }
      })
      .catch((error) => {
        setLoading(false);
        if (
          get(error, 'message', '').includes('Login to activate shiprocket')
        ) {
          setUpdateId({
            Id,
            checked: true,
          });
        } else {
          notification.error({
            message: get(error, 'message', '') || SHIPMENT_UPDATE_FAILED,
          });
        }
      });
  };

  const onFinish = (values) => {
    updateShipmentMode({
      ...values,
      ...updateId,
      checked: true,
      forceActivate: false,
    });
  };

  return (
    <Spin spinning={loading}>
      <div>
        <div className="shiprocket-first-container">
          <Card className="shiprocket-first-user">
            <div className="shiprocket-first-block">
              <div style={{ marginBottom: '5px' }}>
                <ShiprocketTextIcon />
              </div>
              {shipRocketMethod &&
                !shipRocketMethod.is_active &&
                shipRocketMethod.email && (
                  <div>
                    <Popconfirm
                      title="Are you sure to change shipment status?"
                      onConfirm={() => {
                        updateShipmentMode({
                          checked: !get(shipRocketMethod, 'is_active', ''),
                          Id: get(shipRocketMethod, 'shipment_method_id', ''),
                          method: get(shipRocketMethod, 'shipment_method'),
                          forceActivate: true,
                        });
                      }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Switch
                        id="enable-shiprocket"
                        checked={get(shipRocketMethod, 'is_active', '')}
                      />
                    </Popconfirm>
                  </div>
                )}
            </div>

            <span className="shiprocket-text">
              Smart Shipping with Shiprocket - All-in-One Shipping Solution
            </span>
            <div className="shipment-first-button">
              {showButton && !shipRocketMethod.email && (
                <Button
                  id="shipment-btn"
                  htmlType="submit"
                  type="primary"
                  onClick={() => {
                    submitDelhivey(shiprocketCredential);
                  }}
                >
                  Connect
                </Button>
              )}
            </div>
            {showForm && (
              <Form
                className="shiprocket-first-form"
                labelCol={{
                  span: 8,
                }}
                wrapperCol={{
                  span: 16,
                }}
                onFinish={onFinish}
              >
                <Form.Item
                  label="Enter e-mail"
                  name="email"
                  initialValue={get(shiprocketCredential, 'email')}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter your email !',
                    },
                    {
                      type: 'email',
                      message: 'Please enter a valid email address',
                    },
                  ]}
                >
                  <Input id="shipment-email" />
                </Form.Item>
                <Form.Item
                  label="Enter password"
                  name="password"
                  initialValue={get(shiprocketCredential, 'password')}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter your password !',
                    },
                  ]}
                >
                  <Input.Password
                    readOnly
                    id="shipment-password"
                    onFocus={(event) =>
                      event.target.removeAttribute('readonly')
                    }
                  />
                </Form.Item>
                <div id="xtoken-url">
                  <Form.Item label="X-auth-token">
                    <CopyToClipboard
                      text={shipRocketToken}
                      onCopy={() =>
                        notification.success({
                          message: 'x-auth-token is copied!',
                        })
                      }
                    >
                      <Button>
                        <CopyOutlined />
                      </Button>
                    </CopyToClipboard>
                  </Form.Item>
                  <Form.Item label="Webhooks URL">
                    <CopyToClipboard
                      text={`https://${hostname}/api/v1/shipment/ship-rocket/callback`}
                      onCopy={() =>
                        notification.success({
                          message: 'Webhooks url is copied!',
                        })
                      }
                    >
                      <Button>
                        <CopyOutlined />
                      </Button>
                    </CopyToClipboard>
                  </Form.Item>
                </div>
                <div className="notes-text">
                  Note : should add webhooks in your shiprocket account, so that
                  the customer can track their shipment status. <br />{' '}
                  Shiprocket - &gt; Setting - &gt; API - &gt; Webhooks
                </div>
                <div>
                  <Form.Item>
                    <div className="shiprocket-first-button">
                      <Button
                        id="shipment-save-btn"
                        type="primary"
                        htmlType="submit"
                      >
                        Submit
                      </Button>
                      <Button htmlType="button" onClick={setButtonCancel}>
                        Cancel
                      </Button>
                    </div>
                  </Form.Item>
                </div>
              </Form>
            )}
          </Card>
        </div>

        <div className="steps-shiprocket">
          <div>
            <b>Step 1: </b>Log in or sign up at (Shiprocket).
          </div>
          <div>
            <b>Step 2: </b>&quot;Go to Settings&quot; - &gt; API - &gt;
            Configure - &gt; Create an API User.
          </div>
          <div>
            <b>Step 3: </b>Create a new API user with a unique email ID and
            secure password.
          </div>
          <div>
            <b>Step 4: </b>Turn on the Webhooks feature in &quot;Settings&quot;
            - &gt; &quot;API&quot; - &gt; &quot;Webhooks.&quot;
          </div>
          <div>
            <b>Step 5: </b>In Zupain`s admin panel, find and copy the
            X-Auth-Token and Webhooks URL from &quot;Settings&quot; - &gt;
            &quot;Shipment&quot; - &gt; &quot;Shiprocket&quot; - &gt;
            &quot;Connect.&quot;
          </div>
          <div>
            <b>Step 6: </b>Paste the X-Auth-Token and Webhooks URL in the
            Shiprocket admin panel.
          </div>
          <div>
            <b>Step 7: </b>Activate the integration by enabling the toggle
            button.
          </div>
        </div>
      </div>
    </Spin>
  );
}

export default FirstShipRocketUser;
