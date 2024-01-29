import { Col, DatePicker, Form, Input, Row } from 'antd';
import { get } from 'lodash';
import React from 'react';
import { disabledPreviousDate } from '../../../../shared/date-helper';

function DelhiverySellerDetails(parameters) {
  const { sellerDetails, setSellerDetails } = parameters;
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handleOnChange = (event) => {
    const { value, name } = event.target;
    setSellerDetails({ ...sellerDetails, [name]: value });
  };
  return (
    <div className="customer-details-container">
      <div className="customer-details-title">Add Seller Details</div>
      <div className="customer-info-details">
        <Row>
          <Col md={12} xs={24}>
            <Form.Item
              name="seller_name"
              label="Seller Name"
              initialValue={get(sellerDetails, 'seller_name', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a seller name',
                },
              ]}
            >
              <Input
                onChange={(event) => {
                  handleOnChange(event);
                }}
                name="seller_name"
                placeholder="Seller Name"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              name="seller_gst_tin"
              label="Seller GSTIN"
              initialValue={get(sellerDetails, 'seller_gst_tin', '')}
            >
              <Input
                onChange={(event) => {
                  handleOnChange(event);
                }}
                name="seller_gst_tin"
                placeholder="Seller GSTIN"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              name="seller_add"
              label="Seller Address"
              initialValue={get(sellerDetails, 'seller_add', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter a seller address',
                },
              ]}
            >
              <Input
                onChange={(event) => {
                  handleOnChange(event);
                }}
                name="seller_add"
                placeholder="Seller Address"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="seller_inv"
              label="Invoice Number"
              initialValue={get(sellerDetails, 'seller_inv', '')}
            >
              <Input
                onChange={(event) => {
                  handleOnChange(event);
                }}
                name="seller_inv"
                placeholder="Invoice Number"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="seller_inv_date"
              label="Select Invoice Date"
              initialValue={get(sellerDetails, 'seller_inv_date', '')}
            >
              <DatePicker
                showTime={false}
                disabledDate={disabledPreviousDate}
                size="large"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </div>
  );
}
export default DelhiverySellerDetails;
