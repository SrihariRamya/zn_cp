import { ArrowLeftOutlined } from '@ant-design/icons';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { Button, Col, Form, Input, InputNumber, Row, Space, Table } from 'antd';
import { get } from 'lodash';
import React, { useEffect, useContext } from 'react';
import { CURRENCYSYMBOLS } from '../../../../shared/constant-values';
import { TenantContext } from '../../../context/tenant-context';
import { currencyFormat } from '../../../../shared/function-helper';

const SummaryDetails = ({
  order,
  orderDetails,
  packageDetails,
  buyerDetails,
  pickupDetails,
  handleCreateOrder,
  courierDetails,
  hanldlePrevious,
}) => {
  const [tenantDetails] = useContext(TenantContext);
  const { currency, currency_locale: currencyLocale } = get(
    tenantDetails,
    'setting',
    {}
  );
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <div>{text}</div>,
      ellipsis: true,
      width: 150,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 200,
    },
    {
      title: 'Qty',
      dataIndex: 'units',
      key: 'units',
      width: 80,
    },
    {
      title: 'Unit Price',
      key: 'selling_price',
      dataIndex: 'selling_price',
      width: 80,
      render: (_, record) => (
        <CurrencyFormatter
          value={get(record, 'selling_price', 0)}
          type={get(tenantDetails, 'setting.currency', '')}
          language={get(tenantDetails, 'setting.currency_locale', '')}
        />
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 80,
      render: (_, record) => (
        <CurrencyFormatter
          value={get(record, 'units', 1) * get(record, 'selling_price', 0)}
          type={get(tenantDetails, 'setting.currency', '')}
          language={get(tenantDetails, 'setting.currency_locale', '')}
        />
      ),
    },
  ];

  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({
      orderDetails,
      courierDetails,
      buyerDetails,
      pickupDetails,
    });
  });
  return (
    <div className="summary-details-container">
      <div className="box__header">
        <Space>
          <ArrowLeftOutlined onClick={hanldlePrevious} />
          <h3 className="text-primary">#{get(order, 'order_id', '')}</h3>
        </Space>
        <Button type="primary" onClick={handleCreateOrder}>
          Create Order
        </Button>
      </div>
      <div className="summary-details-card-container">
        <Form form={form} layout="vertical">
          <div className="summary-order-details-container">
            <div className="order-details-title">Order Details</div>
            <Row>
              <Col span={6}>
                <Form.Item
                  name="pickup_location"
                  label="Pickup Address"
                  initialValue={get(pickupDetails, 'pickup_location', '')}
                >
                  <Input readOnly placeholder="Pickup Address" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  initialValue={get(orderDetails, 'payment_method', '')}
                  name="payment_method"
                  label="Payment Method"
                >
                  <Input readOnly placeholder="Payment Method" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  initialValue={get(orderDetails, 'total_price', '')}
                  name="total_price"
                  label={`Payment (in ${CURRENCYSYMBOLS[currency]})`}
                >
                  <InputNumber
                    readOnly
                    formatter={(value) => {
                      return currencyFormat(value, currencyLocale, currency);
                    }}
                    placeholder="Payment"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <div className="shipping-details-container">
            <div className="shipping-details-title">Shipping Details</div>
            <Row>
              <Col span={6}>
                <Form.Item
                  name="courier_name"
                  label="Courier Name"
                  initialValue={get(courierDetails, 'courier_name', '')}
                >
                  <Input
                    value={get(courierDetails, 'courier_name', '')}
                    readOnly
                    placeholder="Courier Name"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  initialValue={
                    get(courierDetails, 'is_surface', false) === true
                      ? 'Surface'
                      : 'Air'
                  }
                  name="is_surface"
                  label="Mode"
                >
                  <Input readOnly placeholder="Mode" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="etd"
                  initialValue={get(courierDetails, 'etd', '')}
                  label="Estimated Delivery"
                >
                  <Input readOnly placeholder="Estimated Delivery" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  initialValue={
                    get(courierDetails, 'freight_charge', 0) +
                    get(courierDetails, 'cod_charges', 0)
                  }
                  name="freight_charge"
                  label="Charges"
                >
                  <InputNumber
                    readOnly
                    formatter={(value) => {
                      return currencyFormat(value, currencyLocale, currency);
                    }}
                    placeholder="Charges"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <div className="package-details-container">
            <div className="package-details-title">Package Details</div>
            <Row>
              <Col span={6}>
                <Form.Item
                  name="weight"
                  label="Dead Weight (in kg)"
                  initialValue={get(packageDetails, 'weight', 0)}
                >
                  <Input readOnly placeholder="Dead Weight" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  initialValue={`${get(packageDetails, 'height', 0)}*${get(
                    packageDetails,
                    'width',
                    0
                  )}*${get(packageDetails, 'length', 0)}`}
                  name="dimensions"
                  label="Dimensions (in cm)"
                >
                  <Input readOnly placeholder="Dimensions" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  initialValue={get(packageDetails, 'volumetricWeight', 0)}
                  name="volumetricWeight"
                  label="Volumetric Weight (in kg)"
                >
                  <Input readOnly placeholder="Volumetric Weight" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  initialValue={get(packageDetails, 'applicableWeight', 0)}
                  name="applicableWeight"
                  label="Applicable Weight (in kg)"
                >
                  <Input readOnly placeholder="Applicable Weight" />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <div className="customer-details-container">
            <div className="customer-details-title">Customer Details</div>
            <Row>
              <Col span={6}>
                <Form.Item
                  name="billing_customer_name"
                  label="Name"
                  initialValue={get(buyerDetails, 'billing_customer_name', '')}
                >
                  <Input readOnly placeholder="Name" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  initialValue={get(buyerDetails, 'billing_phone', '')}
                  name="billing_phone"
                  label="Mobile Number"
                >
                  <Input
                    readOnly
                    addonBefore="+91"
                    placeholder="Mobile Number"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  initialValue={get(buyerDetails, 'billing_email', '')}
                  name="billing_email"
                  label="Email"
                >
                  <Input readOnly placeholder="Email" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  initialValue={get(buyerDetails, 'billing_address', '')}
                  name="billing_address"
                  label="Address"
                >
                  <Input.TextArea rows={4} readOnly placeholder="Address" />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <div className="product-details-container">
            <div className="product-details-title">Product Details</div>
            <Table
              columns={columns}
              dataSource={get(orderDetails, 'order_items', [])}
              summary={() => {
                return (
                  <>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={4} index={0}>
                        <div className="summary-col-product-lable">
                          Product Total (
                          {get(orderDetails, 'order_items', []).length}
                          {get(orderDetails, 'order_items', []).length === 1
                            ? ' Item'
                            : ' Items'}
                          )
                        </div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <div className="summary-col-product-value">
                          <CurrencyFormatter
                            value={get(order, 'order_price', 0)}
                            type={get(tenantDetails, 'setting.currency', '')}
                            language={get(
                              tenantDetails,
                              'setting.currency_locale',
                              ''
                            )}
                          />
                        </div>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={4} index={0}>
                        <div className="summary-col-order-lable">
                          Order Total
                        </div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <div className="summary-col-order-value">
                          <CurrencyFormatter
                            value={get(order, 'order_price', 0)}
                            type={get(tenantDetails, 'setting.currency', '')}
                            language={get(
                              tenantDetails,
                              'setting.currency_locale',
                              ''
                            )}
                          />
                        </div>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </>
                );
              }}
            />
          </div>
        </Form>
      </div>
      <div />
    </div>
  );
};

export default SummaryDetails;
