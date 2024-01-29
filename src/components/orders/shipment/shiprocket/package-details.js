import { Col, Divider, Form, Input, Row } from 'antd';
import { get } from 'lodash';
import React from 'react';
import {
  SHIPROCKET_PACKAGE_DETAILS_ERROR_TEXT,
  SHIPROCKET_PACKAGE_DETAILS_INFO_2,
  SHIPROCKET_PACKAGE_DETAILS_INFO_3,
  SHIPROCKET_PACKAGE_DETAILS_NOTES_1,
  SHIPROCKET_PACKAGE_DETAILS_WEIGHT_ERROR_TEXT,
} from '../../../../shared/constant-values';
import getFormItemRules from '../../../../shared/form-helpers';

function PackageDetails(parameters) {
  const { packageDetails, form, setPackageDetails } = parameters;
  const calculate = () => {
    const weight = form.getFieldValue('weight');
    const length = form.getFieldValue('length');
    const width = form.getFieldValue('width');
    const height = form.getFieldValue('height');
    if (length && width && height) {
      const value = (Number(length) * Number(width) * Number(height)) / 5000;
      setPackageDetails({
        ...packageDetails,
        volumetricWeight: Number(value),
        applicableWeight: Number(weight > value ? weight : value),
        height,
        width,
        length,
        weight,
      });
    }
  };

  return (
    <div className="package-details-container">
      <div className="package-details-title">Pickup Details</div>
      <div className="package-details-form-container">
        {/* <Form form={form} onFinish={onFinish} layout="vertical"> */}
        <div className="dead-weight-title">Dead Weight</div>
        <Col xs={24}>
          <Form.Item
            name="weight"
            initialValue={get(packageDetails, 'weight', '')}
            rules={[
              {
                validator: async (__, value) => {
                  if (value && value >= 0.5) {
                    return;
                  }
                  throw new Error(SHIPROCKET_PACKAGE_DETAILS_WEIGHT_ERROR_TEXT);
                },
              },
              ...getFormItemRules({
                whitespace: true,
                special: true,
              }),
            ]}
          >
            <Input onChange={calculate} placeholder="weight" addonAfter="Kg" />
          </Form.Item>
        </Col>
        <div className="note-text mt-10">
          {SHIPROCKET_PACKAGE_DETAILS_NOTES_1}
        </div>
        <div className="volumetric-weight-title">Volumetric Weight</div>
        <Row className="volumetric-weight-container">
          <Col md={18} xs={12} className="m-15">
            <Form.Item
              name="length"
              initialValue={get(packageDetails, 'length', '')}
              rules={[
                {
                  validator: async (__, value) => {
                    if (value && value >= 0.5) {
                      return;
                    }
                    throw new Error(SHIPROCKET_PACKAGE_DETAILS_ERROR_TEXT);
                  },
                },
                ...getFormItemRules({
                  whitespace: true,
                  special: true,
                }),
              ]}
            >
              <Input
                onChange={calculate}
                placeholder="Length"
                addonAfter="CM"
              />
            </Form.Item>
          </Col>
          <Col md={18} xs={12} className="m-15">
            <Form.Item
              name="width"
              initialValue={get(packageDetails, 'width', '')}
              rules={[
                {
                  validator: async (__, value) => {
                    if (value && value >= 0.5) {
                      return;
                    }
                    throw new Error(SHIPROCKET_PACKAGE_DETAILS_ERROR_TEXT);
                  },
                },
                ...getFormItemRules({
                  whitespace: true,
                  special: true,
                }),
              ]}
            >
              <Input onChange={calculate} placeholder="Width" addonAfter="CM" />
            </Form.Item>
          </Col>
          <Col md={18} xs={12} className="m-15">
            <Form.Item
              name="height"
              initialValue={get(packageDetails, 'height', '')}
              rules={[
                {
                  validator: async (__, value) => {
                    if (value && value >= 0.5) {
                      return;
                    }
                    throw new Error(SHIPROCKET_PACKAGE_DETAILS_ERROR_TEXT);
                  },
                },
                ...getFormItemRules({
                  whitespace: true,
                  special: true,
                }),
              ]}
            >
              <Input
                placeholder="Height"
                addonAfter="CM"
                onChange={calculate}
              />
            </Form.Item>
          </Col>
          <div className="note-text">
            Note: Dimensions should be in centimeters only & values should be
            greater than 0.50 cm .
          </div>
        </Row>
        <div className="volumetric-weight-value-container">
          <div className="volumetric-weight-value-title">Volumetric Weight</div>
          <div className="volumetric-weight-value-text">
            <span style={{ color: '#0B3D60' }}>
              {get(packageDetails, 'volumetricWeight', 0)}
            </span>{' '}
            kg
          </div>
        </div>
        <Divider />
        <div className="applicable-weight-value-container">
          <div className="flex">
            <div className="applicable-weight-value-title">
              Applicable Weight :
            </div>
            <div className="applicable-weight-value-text">
              {get(packageDetails, 'applicableWeight', 0)} kg
            </div>
          </div>
          <div className="mt-10">{SHIPROCKET_PACKAGE_DETAILS_INFO_2}</div>
          <div className="mt-10">{SHIPROCKET_PACKAGE_DETAILS_INFO_3}</div>
        </div>
      </div>
    </div>
  );
}
export default PackageDetails;
