/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useContext } from 'react';
import { Col, Divider, Form, Input, InputNumber, Row } from 'antd';
import { get } from 'lodash';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { TenantContext } from '../../../../context/tenant-context';
import { currencyFormat } from '../../../../../shared/function-helper';

function OrderProductItem(parameters) {
  const { requiredField, product, handleOnchange } = parameters;
  const [tenantDetails] = useContext(TenantContext);
  const { currency, currency_locale: currencyLocale } = get(
    tenantDetails,
    'setting',
    {}
  );
  const [optionalField, setOptionalField] = useState(false);

  useEffect(() => {
    setOptionalField(requiredField);
  }, [requiredField]);
  const keyboardEvents = (event) => {
    if (
      get(event, 'key', '') === 'ArrowUp' ||
      get(event, 'key', ' ') === 'ArrowDown'
    ) {
      event.preventDefault();
    }
  };
  return (
    <div>
      <Row>
        <Col xs={12} md={12}>
          <Form.Item
            name={`${get(product, 'sku', '')}-name`}
            label="Product Name"
            initialValue={get(product, 'name', '')}
          >
            <Input readOnly placeholder="Product Name" />
          </Form.Item>
        </Col>
        <Col xs={12} md={12}>
          <Form.Item
            name={`${get(product, 'sku', '')}-selling_price`}
            label="Unit Price"
            initialValue={get(product, 'selling_price', 0)}
          >
            <InputNumber
              formatter={(value) => {
                return currencyFormat(value, currencyLocale, currency);
              }}
              readOnly
              placeholder="Unit Price"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={12}>
          <Form.Item
            initialValue={get(product, 'units', 0)}
            name={`${get(product, 'sku', '')}-units`}
            label="Quantity"
          >
            <InputNumber readOnly placeholder="Quantity" />
          </Form.Item>
        </Col>
        <Col xs={12} md={12}>
          <Form.Item
            initialValue={get(product, 'sku', '')}
            name={get(product, 'sku', '')}
            label="SKU"
          >
            <Input readOnly placeholder="SKU" />
          </Form.Item>
        </Col>
      </Row>
      <div
        className="optional-text"
        role="button"
        onClick={() => setOptionalField(requiredField || !optionalField)}
      >
        + Add HSN Code, Tax Rate and Discount{' '}
        {optionalField ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
      </div>
      {optionalField && (
        <Row>
          <Col xs={12} md={12}>
            <Form.Item
              initialValue={get(product, 'hsn', '')}
              name={`${get(product, 'sku', '')}-hsn`}
              label="HSN Code"
              rules={[
                {
                  required: requiredField,
                  message: 'Please enter a HSN Code',
                },
                {
                  pattern: /^\d{8}$/,
                  message: 'HSN code must be exactly 8 digits!',
                },
              ]}
            >
              <Input
                type="number"
                onKeyDown={(event) => {
                  keyboardEvents(event);
                }}
                onChange={(event) => {
                  const { value } = event.target;
                  handleOnchange(value, get(product, 'sku', ''), 'hsn');
                }}
                placeholder="HSN Code"
              />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item
              initialValue={get(product, 'tax', '')}
              name={`${get(product, 'sku', '')}-tax`}
              label="Tax Rate"
              rules={[
                {
                  required: requiredField,
                  message: 'Please enter a tax rate',
                },
                {
                  max: 2,
                  message: 'Tax rate must be exactly 2 digits!',
                },
              ]}
            >
              <Input
                onChange={(event) => {
                  const { value } = event.target;
                  handleOnchange(value, get(product, 'sku', ''), 'tax');
                }}
                type="number"
                placeholder="%"
              />
            </Form.Item>
          </Col>
        </Row>
      )}

      <Divider />
    </div>
  );
}
export default OrderProductItem;
