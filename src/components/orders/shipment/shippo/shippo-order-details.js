import { Col, Form, Input, Row } from 'antd';
import { get } from 'lodash';
import React from 'react';
import { DELHIVERY_ORDER_DETAILS_ERROR_TEXT } from '../../../../shared/constant-values';

function ShippoOrderDetails(properties) {
  const { orderDetails, setOrderDetails } = properties;

  const handleOnChange = (event) => {
    const { value, name } = event.target;
    setOrderDetails({ ...orderDetails, [name]: value });
  };

  return (
    <div className="order-details-container">
      <div className="order-details-title">Add Parcel Details</div>
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
          <Col md={12} xs={12}>
            <Form.Item
              label="Height"
              name="shipment_height"
              rules={[
                {
                  validator: async (__, value) => {
                    if (value && value > 0) {
                      return;
                    }
                    throw new Error(DELHIVERY_ORDER_DETAILS_ERROR_TEXT);
                  },
                },
                {
                  required: true,
                  message: 'Please enter the height',
                },
              ]}
              initialValue={get(orderDetails, 'shipment_height', '')}
            >
              <Input
                placeholder="Enter height in cm"
                onChange={(event) => {
                  handleOnChange(event);
                }}
                addonAfter="cm"
                type="number"
                name="shipment_height"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              initialValue={get(orderDetails, 'weight', '')}
              label="Weight"
              name="weight"
              rules={[
                {
                  validator: async (__, value) => {
                    if (value && value > 0) {
                      return;
                    }
                    throw new Error(DELHIVERY_ORDER_DETAILS_ERROR_TEXT);
                  },
                },
                {
                  required: true,
                  message: 'Please enter a weight',
                },
              ]}
            >
              <Input
                placeholder="Enter weight in gms"
                onChange={(event) => {
                  handleOnChange(event);
                }}
                type="number"
                addonAfter="Kg"
                name="weight"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              initialValue={get(orderDetails, 'shipment_length', '')}
              label="Length"
              name="shipment_length"
              rules={[
                {
                  validator: async (__, value) => {
                    if (value && value > 0) {
                      return;
                    }
                    throw new Error(DELHIVERY_ORDER_DETAILS_ERROR_TEXT);
                  },
                },
                {
                  required: true,
                  message: 'Please enter the length',
                },
              ]}
            >
              <Input
                name="shipment_length"
                onChange={(event) => {
                  handleOnChange(event);
                }}
                addonAfter="cm"
                type="number"
                placeholder="Enter length in cm"
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              initialValue={get(orderDetails, 'shipment_width', '')}
              label="Width"
              name="shipment_width"
              rules={[
                {
                  validator: async (__, value) => {
                    if (value && value > 0) {
                      return;
                    }
                    throw new Error(DELHIVERY_ORDER_DETAILS_ERROR_TEXT);
                  },
                },
                {
                  required: true,
                  message: 'Please enter a width',
                },
              ]}
            >
              <Input
                addonAfter="cm"
                placeholder="Enter width in cm"
                onChange={(event) => {
                  handleOnChange(event);
                }}
                type="number"
                name="shipment_width"
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </div>
  );
}
export default ShippoOrderDetails;
