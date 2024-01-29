import {
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  notification,
  Radio,
  Row,
  Space,
  Switch,
} from 'antd';
import { get, map } from 'lodash';
import React, { useState, useEffect } from 'react';
import {
  FAILED_TO_LOAD,
  CHECKOUT_CONDITION_UPDATED_SUCCESS,
  CHECKOUT_CONDITION_UPDATED_FAILED,
} from '../../shared/constant-values';
import {
  updateMinimumOrderValue,
  getMinimumOrderValue,
} from '../../utils/api/url-helper';

const MinimumValue = () => {
  const [form] = Form.useForm();
  const [minOrderData, setMinOrderData] = useState([]);
  const [valueStatus, setValueStatus] = useState(false);
  const [quantityStatus, setQuantityStatus] = useState(false);
  const onStatusChange = (value, name) => {
    if (name === 'Value') {
      setValueStatus(value);
    } else {
      setQuantityStatus(value);
    }
  };
  const validatePositiveNumber = (rules, value, callback) => {
    if (value < 0) {
      callback('Value should not be a negative number');
    } else {
      callback();
    }
  };

  const getValues = () => {
    getMinimumOrderValue()
      .then((response) => {
        const dataArray = map(response.data, (item) => item);
        map(dataArray, (item) => {
          setValueStatus(item[0].minimum_value_status);
          setQuantityStatus(item[0].minimum_quantity_status);
        });
        setMinOrderData(dataArray);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };
  const handleSave = (values) => {
    const parameter = {
      minimum_value: values.minimumValue,
      minimum_value_status: values.isEnableMinValue,
      minimum_quantity: values.minimumQuantity,
      minimum_quantity_status: values.isEnableMinQuantity,
      condition_key: values.condition,
    };
    updateMinimumOrderValue(parameter)
      .then(() => {
        notification.success({ message: CHECKOUT_CONDITION_UPDATED_SUCCESS });
        getValues();
      })
      .catch(() => {
        notification.error({ message: CHECKOUT_CONDITION_UPDATED_FAILED });
      });
  };
  useEffect(() => {
    getValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      {map(minOrderData, (item) => {
        return (
          <div>
            <Form
              form={form}
              className="user-form user-add-form delivery-form"
              layout="vertical"
              initialValues={{
                isEnableMinValue: get(item[0], 'minimum_value_status', ''),
                minimumValue: get(item[0], 'minimum_value', ''),
                isEnableMinQuantity: get(
                  item[0],
                  'minimum_quantity_status',
                  ''
                ),
                minimumQuantity: get(item[0], 'minimum_quantity', ''),
                condition: get(item[0], 'condition_key', ''),
              }}
              onFinish={handleSave}
            >
              <Row className="row-tittle">
                <span className=" m-10 text-green-dark">
                  Minimum Order Value
                </span>
              </Row>
              <Row style={{ margin: '10px' }}>
                <Col span={2}>
                  <Form.Item name="isEnableMinValue">
                    <Switch
                      size="large"
                      checked={valueStatus}
                      onClick={(value) => onStatusChange(value, 'Value')}
                    />
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item
                    name="minimumValue"
                    rules={[{ validator: validatePositiveNumber }]}
                  >
                    <InputNumber
                      type="number"
                      disabled={!valueStatus}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row className="row-tittle">
                <span className=" m-10 text-green-dark">
                  Minimum Order Quantity
                </span>
              </Row>
              <Row style={{ margin: '10px' }}>
                <Col span={2}>
                  <Form.Item name="isEnableMinQuantity">
                    <Switch
                      size="large"
                      checked={quantityStatus}
                      onClick={(value) => onStatusChange(value, 'Quantity')}
                    />
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item
                    name="minimumQuantity"
                    rules={[{ validator: validatePositiveNumber }]}
                  >
                    <InputNumber
                      type="number"
                      disabled={!quantityStatus}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                {quantityStatus && valueStatus && (
                  <Form.Item name="condition">
                    <Radio.Group className="theme-radio radio-theme-delivery">
                      <Radio value={0}>
                        Accept order even if one of the conditions is met
                      </Radio>
                      <Radio value={1}>
                        Accept order only if both the conditions are met
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                )}
              </Row>
              <div style={{ marginTop: '25px' }}>
                <Form.Item>
                  <Space className="f_btns">
                    <Button htmlType="submit" type="primary">
                      Save
                    </Button>
                  </Space>
                </Form.Item>
              </div>
            </Form>
          </div>
        );
      })}
    </Card>
  );
};

export default MinimumValue;
