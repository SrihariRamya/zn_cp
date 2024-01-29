import { Col, DatePicker, Divider, Form, Input, Radio, Row } from 'antd';
import { get, isEmpty } from 'lodash';
import React, { useContext } from 'react';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import OrderProductItem from './order-product-item';
import { TenantContext } from '../../../../context/tenant-context';

function OrderDetails(parameters) {
  const { orderDetails, setOrderDetails, requiredField } = parameters;
  const [tenantDetails] = useContext(TenantContext);
  const { currency, currency_locale: currencyLocale } = get(
    tenantDetails,
    'setting',
    {}
  );
  const onChange = (event) => {
    setOrderDetails({ ...orderDetails, payment_method: event.target.value });
  };
  const handleOnchange = (value, sku, name) => {
    const findProductIndex = get(orderDetails, 'order_items', []).findIndex(
      (product) => product?.sku === sku
    );
    if (name === 'hsn') {
      if (isEmpty(value)) {
        delete get(orderDetails, 'order_items', [])[findProductIndex].hsn;
      } else {
        get(orderDetails, 'order_items', [])[findProductIndex].hsn =
          Number(value);
      }
    } else if (name === 'tax') {
      if (value) {
        get(orderDetails, 'order_items', [])[findProductIndex].tax =
          Number(value);
      } else {
        delete get(orderDetails, 'order_items', [])[findProductIndex].tax;
      }
    }
  };
  return (
    <div className="order-details-container">
      <div className="order-details-title">Order Details</div>
      <div className="order-details">
        <Row>
          <Col md={12} xs={12}>
            <Form.Item
              name="order_id"
              label="Order ID"
              initialValue={get(orderDetails, 'order_id', '')}
            >
              <Input readOnly placeholder="Order ID" />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item name="order_date" label="Order Date">
              <DatePicker
                allowClear={false}
                open={false}
                inputReadOnly
                defaultValue={get(orderDetails, 'order_date', '')}
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider />
        <div className="product-details-container">
          <div className="product-details-tittle">Product Details</div>
          <div className="product-list-container">
            {get(orderDetails, 'order_items', []).map((product) => (
              <OrderProductItem
                requiredField={requiredField}
                product={product}
                handleOnchange={handleOnchange}
              />
            ))}
          </div>
        </div>
        <div className="payment-details-container">
          <div className="payment-details-tittle">Payment Details</div>
          <div className="payment-details-info">
            Select a mode of payment that your buyer has chosen for the order
            <div className="mt-10">
              <Form.Item
                name="payment_method"
                rules={[
                  {
                    required: true,
                    message: 'Please select payment method',
                  },
                ]}
              >
                <Radio.Group onChange={onChange}>
                  <Radio value="Prepaid">Prepaid</Radio>
                  <Radio value="Cod">COD</Radio>
                </Radio.Group>
              </Form.Item>
            </div>
          </div>
        </div>
        <div className="payment-price-details-container">
          <div className="flex-end payment-details-price">
            <div>
              Sub Total for{' '}
              {get(orderDetails, 'order_items', []).length > 1
                ? 'Products'
                : 'Product'}
            </div>
            <div>
              <span className="price-display">
                <CurrencyFormatter
                  value={get(orderDetails, 'sub_total', 0)}
                  type={currency}
                  language={currencyLocale}
                />
              </span>
            </div>
          </div>
          <div className="flex-end payment-details-price">
            <div>Delivery Charges</div>

            <span className="price-display">
              <CurrencyFormatter
                value={get(orderDetails, 'delivery_charge', 0)}
                type={currency}
                language={currencyLocale}
              />
            </span>
          </div>
          <div className="flex-end payment-details-price">
            <div>Discount Amount </div>

            <span className="price-display">
              {' '}
              <CurrencyFormatter
                value={Number(get(orderDetails, 'discount_amount', 0))}
                type={currency}
                language={currencyLocale}
              />
            </span>
          </div>
          <div className="flex-end payment-details-price-total">
            <div>Total Order value </div>{' '}
            <span className="price-display">
              <CurrencyFormatter
                value={get(orderDetails, 'total_price', 0)}
                type={currency}
                language={currencyLocale}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default OrderDetails;
