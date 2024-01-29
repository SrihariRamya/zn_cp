import { Col, DatePicker, Form, Input, InputNumber, Radio, Row } from 'antd';
import { get } from 'lodash';
import React, { useState, useContext } from 'react';
import {
  DELHIVERY_ORDER_DETAILS_ERROR_TEXT,
  TOTAL_MAX_AMOUNT,
} from '../../../../shared/constant-values';
import { TenantContext } from '../../../context/tenant-context';
import {
  currencyFormat,
  currencyParser,
} from '../../../../shared/function-helper';

function DelhiveryOrderDetails(parameters) {
  const { form, orderDetails, setOrderDetails } = parameters;
  const [paymentMode, setPaymentMode] = useState('');
  const [tenantDetails] = useContext(TenantContext);
  const { currency, currency_locale: currencyLocale } = get(
    tenantDetails,
    'setting',
    {}
  );
  const handleOnChange = (event) => {
    const { value, name } = event.target;
    setOrderDetails({ ...orderDetails, [name]: value });
  };
  const handleTaxOnChange = (value) => {
    form.setFieldsValue({
      total_amount: Number(value) + get(orderDetails, 'commodity_value', ''),
      cod_amount:
        paymentMode === 'COD' &&
        Number(value) + get(orderDetails, 'commodity_value', ''),
    });
    setOrderDetails({ ...orderDetails, tax_value: value });
  };
  const onChange = (event) => {
    const { value } = event.target;
    if (value === 'COD') {
      setOrderDetails({
        ...orderDetails,
        cod_amount:
          Number(get(orderDetails, 'tax_value', '')) +
          get(orderDetails, 'commodity_value', ''),
      });
      form.setFieldsValue({
        cod_amount:
          Number(get(orderDetails, 'tax_value', '')) +
          get(orderDetails, 'commodity_value', ''),
      });
    } else {
      form.setFieldsValue({
        cod_amount: '',
      });
    }
    setOrderDetails({ ...orderDetails, payment_mode: value });
    setPaymentMode(value);
  };
  return (
    <div className="order-details-container">
      <div className="order-details-title">Add Order Details</div>
      <div className="order-info-details">
        <Row>
          <Col md={12} xs={24}>
            <Form.Item
              name="order_id"
              label="Reference Number"
              initialValue={get(orderDetails, 'order_id', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a reference number',
                },
              ]}
            >
              <Input readOnly placeholder="Enter Reference Number" />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              name="commodity_value"
              label="Commodity Value"
              initialValue={get(orderDetails, 'commodity_value', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a commodity value',
                },
              ]}
            >
              <InputNumber
                formatter={(value) => {
                  return currencyFormat(value, currencyLocale, currency);
                }}
                readOnly
                placeholder="Enter commodity value"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="order_date"
              label="Order date"
              initialValue={get(orderDetails, 'order_date', '')}
              rules={[
                {
                  required: true,
                  message: 'Please select order date',
                },
              ]}
            >
              <DatePicker
                allowClear={false}
                open={false}
                inputReadOnly
                defaultValue={get(orderDetails, 'order_date', '')}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="tax_value"
              label="Tax Value"
              initialValue={get(orderDetails, 'tax_value', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a tax value',
                },
              ]}
            >
              <InputNumber
                name="tax_value"
                type="number"
                onChange={(value) => {
                  handleTaxOnChange(value);
                }}
                min={0}
                placeholder="Enter tax value"
                onKeyPress={(value) => currencyParser(value, currencyLocale)}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              name="product_description"
              label="Product Description"
              initialValue={get(orderDetails, 'product_description', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a product description',
                },
              ]}
            >
              <Input
                onChange={(event) => {
                  handleOnChange(event);
                }}
                name="product_description"
                placeholder="Enter product description"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              name="category_of_goods"
              label="Category of goods"
              initialValue={get(orderDetails, 'category_of_goods', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a category of goods',
                },
              ]}
            >
              <Input
                onChange={(event) => {
                  handleOnChange(event);
                }}
                name="category_of_goods"
                placeholder="Enter goods category"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="shipment_height"
              label="Height"
              initialValue={get(orderDetails, 'shipment_height', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a height',
                },
                {
                  validator: async (__, value) => {
                    if (value && value > 0) {
                      return;
                    }
                    throw new Error(DELHIVERY_ORDER_DETAILS_ERROR_TEXT);
                  },
                },
              ]}
            >
              <Input
                onChange={(event) => {
                  handleOnChange(event);
                }}
                name="shipment_height"
                type="number"
                placeholder="Enter height in cm"
                addonAfter="cm"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="weight"
              label="Weight"
              initialValue={get(orderDetails, 'weight', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a weight',
                },
                {
                  validator: async (__, value) => {
                    if (value && value > 0) {
                      return;
                    }
                    throw new Error(DELHIVERY_ORDER_DETAILS_ERROR_TEXT);
                  },
                },
              ]}
            >
              <Input
                onChange={(event) => {
                  handleOnChange(event);
                }}
                name="weight"
                type="number"
                placeholder="Enter weight in gms"
                addonAfter="gm"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="shipment_length"
              label="Length"
              initialValue={get(orderDetails, 'shipment_length', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a length',
                },
                {
                  validator: async (__, value) => {
                    if (value && value > 0) {
                      return;
                    }
                    throw new Error(DELHIVERY_ORDER_DETAILS_ERROR_TEXT);
                  },
                },
              ]}
            >
              <Input
                onChange={(event) => {
                  handleOnChange(event);
                }}
                name="shipment_length"
                type="number"
                placeholder="Enter length in cm"
                addonAfter="cm"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="shipment_width"
              label="Width"
              initialValue={get(orderDetails, 'shipment_width', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a width',
                },
                {
                  validator: async (__, value) => {
                    if (value && value > 0) {
                      return;
                    }
                    throw new Error(DELHIVERY_ORDER_DETAILS_ERROR_TEXT);
                  },
                },
              ]}
            >
              <Input
                onChange={(event) => {
                  handleOnChange(event);
                }}
                name="shipment_width"
                type="number"
                placeholder="Enter width in cm"
                addonAfter="cm"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="hsn_code"
              label="HSN Code"
              initialValue={get(orderDetails, 'hsn_code', '')}
              rules={[
                {
                  pattern: /^\d{8}$/,
                  message: 'HSN code must be exactly 8 digits!',
                },
              ]}
            >
              <Input
                name="hsn_code"
                onChange={(event) => {
                  handleOnChange(event);
                }}
                placeholder="Enter HSN code"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="ewaybill"
              label="E-Way Bill Number"
              initialValue={get(orderDetails, 'ewaybill', '')}
              rules={[
                {
                  required:
                    get(orderDetails, 'total_amount', 0) +
                      Number(get(orderDetails, 'tax_value', 0)) >=
                    TOTAL_MAX_AMOUNT,
                  message: 'Please enter a E-way bill number',
                },
                {
                  pattern: /^\d{12}$/,
                  message: 'E-way bill number must be exactly 12 digits!',
                },
              ]}
            >
              <Input
                type="number"
                name="ewaybill"
                onChange={(event) => {
                  handleOnChange(event);
                }}
                placeholder="Enter E-Way Bill Number"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              name="total_amount"
              label="Total Package Amount"
              initialValue={
                Number(get(orderDetails, 'commodity_value', 0)) +
                Number(get(orderDetails, 'tax_value', 0))
              }
              rules={[
                {
                  required: true,
                  message: 'Please enter a total package amount',
                },
              ]}
            >
              <InputNumber
                formatter={(value) => {
                  return currencyFormat(value, currencyLocale, currency);
                }}
                readOnly
                placeholder="Enter total package amount"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="payment_mode"
              label="Payment mode"
              rules={[
                {
                  required: true,
                  message: 'Please select payment method',
                },
              ]}
            >
              <Radio.Group onChange={onChange}>
                <Radio value="PRE-PAID">Prepaid</Radio>
                <Radio value="COD">COD</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          {get(orderDetails, 'payment_mode', '') === 'COD' && (
            <Col span={24}>
              <Form.Item
                name="cod_amount"
                label="COD Amount"
                initialValue={
                  Number(get(orderDetails, 'commodity_value', '')) +
                  Number(get(orderDetails, 'tax_value', ''))
                }
                rules={[
                  {
                    required: true,
                    message: 'Please enter a cod amount',
                  },
                ]}
              >
                <InputNumber
                  onChange={(event) => {
                    handleOnChange(event);
                  }}
                  formatter={(value) => {
                    return currencyFormat(value, currencyLocale, currency);
                  }}
                  readOnly
                  name="cod_amount"
                  placeholder="COD Amount"
                />
              </Form.Item>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
}
export default DelhiveryOrderDetails;
