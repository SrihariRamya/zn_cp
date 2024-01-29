import { Form, Popconfirm, Spin, Switch } from 'antd';
import { Button, Card, Input, notification } from 'antd/lib';
import { React, useEffect, useState } from 'react';

import { filter, get, trim } from 'lodash';
import { ReactComponent as DelhiveryTextIcon } from './delhivery-first.svg';

import {
  FAILED_TO_LOAD,
  SHIPMENT_UPDATE_FAILED,
  SHIPMENT_UPDATE_SUCCESS,
} from '../../../shared/constant-values';

import {
  getAllShipmentMethods,
  updateShipmentMethod,
  getOnboardGuide,
} from '../../../utils/api/url-helper';

function FirstDelhiveryUser(properties) {
  const { handleSave, setHandleBasic } = properties;
  const [delhiveryMethod, setDelhiveryMethod] = useState('');
  const [shiprocketCredential, setShiprocketCredential] = useState({});
  const [loading, setLoading] = useState(false);
  const [updateId, setUpdateId] = useState({ Id: undefined });
  const [showButton, setShowButton] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [delhiveryApiToken, setDelhiveryApiToken] = useState('');

  const fetchShipmentMethodData = () => {
    setLoading(true);
    setShowButton(true);
    const apiArray = [getAllShipmentMethods(), getOnboardGuide()];
    Promise.all(apiArray)
      .then((response) => {
        setShiprocketCredential(response[0].data[2]);
        const dataSource = get(response, '[0].data', []);
        get(response, '[0].data', []).map((item) => {
          const returnData = item;
          return returnData;
        });
        const shipmentMethodData = filter(
          dataSource,
          (item) => item.slug !== 'self_ship'
        );
        setDelhiveryMethod(shipmentMethodData[1]);
        setDelhiveryApiToken(shipmentMethodData[1].api_token);
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

  const handleButtonClick = () => {
    handleSave();
  };

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
          setLoading(false);
          setShowForm(false);
          handleButtonClick();
          setShowButton(true);
        } else {
          notification.failure({ message: SHIPMENT_UPDATE_FAILED });
          setLoading(false);
          setShowForm(false);
        }
        setHandleBasic(false);
      })
      .catch((error) => {
        setLoading(false);
        if (get(error, 'message', '').includes('Login to activate Delhivery')) {
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
          <Card
            className="shiprocket-first-user"
            style={{
              width: 300,
            }}
          >
            <div className="shiprocket-first-block">
              <div style={{ marginBottom: '5px' }}>
                <DelhiveryTextIcon />
              </div>
              <div>
                {delhiveryMethod &&
                  !delhiveryMethod.is_active &&
                  delhiveryMethod.api_token && (
                    <Popconfirm
                      title="Are you sure to change shipment status?"
                      onConfirm={() => {
                        updateShipmentMode({
                          checked: !get(delhiveryMethod, 'is_active', ''),
                          Id: get(delhiveryMethod, 'shipment_method_id', ''),
                          method: get(delhiveryMethod, 'shipment_method'),
                          forceActivate: true,
                          apiToken: delhiveryApiToken,
                        });
                      }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Switch
                        id="enable-shiprocket"
                        checked={get(delhiveryMethod, 'is_active', '')}
                      />
                    </Popconfirm>
                  )}
              </div>
            </div>

            <span className="shiprocket-text">
              Changing the world, one shipment at a time
            </span>
            <div
              className="shipment-first-button"
              style={{ marginTop: '10px' }}
            >
              {showButton && !get(delhiveryMethod, 'api_token', '') && (
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
                style={{ marginTop: '15px' }}
                labelCol={{
                  span: 6,
                }}
                wrapperCol={{
                  span: 18,
                }}
                onFinish={onFinish}
              >
                <Form.Item
                  label="API Token"
                  name="apiToken"
                  initialValue={get(delhiveryMethod, 'api_token', '')}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter your api token!',
                    },
                  ]}
                >
                  <Input id="shipment-api-token" placeholder="API Token" />
                </Form.Item>
                <div className="notes-text">
                  Note : Follow the steps to get your Delhivery account live API
                  token (Setting - &gt; API setup - &gt; Request live API
                  token), once API token is updated here your Delhivery account
                  will be activated
                </div>
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
              </Form>
            )}
          </Card>
        </div>

        <div className="steps-shiprocket">
          <div>
            <b>Step 1: </b>Log in or sign up at (Delhivery&apos;s admin panel).
          </div>
          <div>
            <b>Step 2: </b>Go to Left Panel {'->'} Settings {'->'} API Setup
            page
          </div>
          <div>
            <b>Step 3: </b> Copy the existing API Token or click &quot;Request
            Live API Token&quot; for a new token.
          </div>
          <div>
            <b>Step 4: </b>In Zupain&apos;s admin panel, go to Settings {'->'}{' '}
            Shipment {'->'} Delhivery {'->'} Login.
          </div>
          <div>
            <b>Step 5: </b>Paste the API token and click submit.
          </div>
          <div>
            <b>Step 6: </b>Enable the toggle button.
          </div>
        </div>
      </div>
    </Spin>
  );
}

export default FirstDelhiveryUser;
