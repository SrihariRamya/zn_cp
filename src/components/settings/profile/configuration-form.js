import { Col, Form, Input, InputNumber, Row, Select } from 'antd';
import React from 'react';
import moment from 'moment';
import { get } from 'lodash';
import {
  CURRENCYSYMBOLS,
  CURRENCY_TYPE,
  TENANT_MODE_NORMAL,
} from '../../../shared/constant-values';

const { Option } = Select;
function ConfigurationForm(properties) {
  const { tenantDetails, currencyList, dateList, handleCurrencyChange } =
    properties;
  return (
    <div className="profile-container">
      <Row>
        <Col xs={24} sm={24} md={12} xl={6} span={6}>
          <Form.Item
            label="Currency"
            name="currency"
            rules={[{ required: true, message: 'Please Select Currency!' }]}
          >
            <Select
              className="select-height"
              virtual={false}
              onChange={handleCurrencyChange}
            >
              {currencyList &&
                currencyList.map((item) => (
                  <Option value={item?.currency_code} key={item?.currency_id}>
                    {item?.currency_code} ({item?.currency_name})
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} xl={6} span={6}>
          <Form.Item
            label="Date Format"
            name="date_format"
            rules={[{ required: true, message: 'Please Select date' }]}
          >
            <Select
              className="select-height"
              virtual={false}
              showSearch
              allowClear
            >
              {dateList.map((date) => (
                <Option value={date.format_type} key={date?.id}>
                  {moment().format(date.format_type)}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        {get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL && (
          <>
            <Col xs={24} sm={24} md={12} xl={6} span={6}>
              <Form.Item
                label={`Delivery Charge (in ${
                  CURRENCYSYMBOLS[
                    get(tenantDetails, 'setting.currency', '') || CURRENCY_TYPE
                  ]
                })`}
                name="delivery_charge"
              >
                <InputNumber type="number" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Form.Item
              label={`COD Charge (in ${
                CURRENCYSYMBOLS[
                  get(tenantDetails, 'setting.currency', '') || CURRENCY_TYPE
                ]
              })`}
              name="cod_charge"
            >
              <InputNumber type="number" style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Col xs={24} sm={24} md={12} xl={6} span={6}>
              <Form.Item
                label="Product Reservation Timeout"
                name="product_reservation_timeout"
                rules={[
                  {
                    required: true,
                    message: 'Please Select Reservation Timeout !',
                  },
                ]}
              >
                <Input addonAfter="mins" />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
}
export default ConfigurationForm;
