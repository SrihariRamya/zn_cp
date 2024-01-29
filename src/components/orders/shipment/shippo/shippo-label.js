import { get, map } from 'lodash';
import React, { useContext } from 'react';
import { Row, Col, Spin, Select } from 'antd';
import { TenantContext } from '../../../context/tenant-context';

const { Option } = Select;
function ShippoLabelDetails(properties) {
  const mobileView = useContext(TenantContext)[4];

  const {
    labelLoading,
    orderDetails,
    customerDetails,
    pickupDetails,
    handleLabelDetails,
    labelResponse,
  } = properties;
  const dynamicStyle = mobileView
    ? {
        wordWrap: 'break-word',
        maxWidth: '80px',
        display: 'inline-block',
      }
    : {};
  return (
    <>
      <h2>Shippo Label Creator</h2>
      <Spin spinning={labelLoading}>
        <div className="address-details">
          <Row>
            <Col span={12}>
              <h3 className="mt-10">From Address</h3>
              <div className="pickup-address-title">
                <span>{get(pickupDetails, 'name', '')}</span>
              </div>
              <span className="pickup-address">
                {get(pickupDetails, 'address', '')},&nbsp;
                {get(pickupDetails, 'city', '')},&nbsp;
                {get(pickupDetails, 'state', '')}
              </span>
              <div className="flex-bwn">
                <span className="pickup-phone-number">
                  Mobile: {get(pickupDetails, 'phone', '')}
                </span>
              </div>
              <h3 className="mt-10">To Address</h3>
              <div className="pickup-address-title">
                <span>{get(customerDetails, 'name', '')}</span>
              </div>
              <span className="pickup-address">
                {get(customerDetails, 'street1', '')},&nbsp;
                {get(customerDetails, 'city', '')},&nbsp;
                {get(customerDetails, 'state', '')}
              </span>
              <div className="flex-bwn">
                <span className="pickup-phone-number">
                  Mobile: {get(customerDetails, 'phone', '')}
                </span>
              </div>
            </Col>
            <Col span={12}>
              <h3 className="mt-10">Parcel Details</h3>
              {Object.keys(orderDetails).map((field) => (
                <div style={{ display: 'flex' }} key={field}>
                  <p>{field.replace('shipment_', '')}: </p>&nbsp;
                  <span>
                    <span style={dynamicStyle}>{orderDetails[field]}</span>
                    {field === 'weight'
                      ? 'kg'
                      : field === 'order_id'
                      ? ''
                      : 'cm'}
                  </span>
                </div>
              ))}
            </Col>
          </Row>
          <h3 className="mt-10">Select the shipment carrier</h3>
          <Select
            className="mt-10"
            placeholder="Select the shipment carrier"
            virtual={false}
            style={{ width: mobileView ? 275 : 500 }}
            onChange={(value, option) => handleLabelDetails(value, option)}
          >
            {map(labelResponse, (option) => (
              <Option
                key={get(option, 'object_id', '')}
                value={get(option, 'object_id', '')}
                label={`${get(option, 'provider', '')} ${get(
                  option,
                  'servicelevel.name',
                  ''
                )}`}
              >
                <>
                  <Row justify="space-between">
                    <div>
                      <p>
                        <img
                          src={get(option, 'provider_image_200', '')}
                          alt={get(option, 'servicelevel.name', '')}
                          style={{ width: '15px', marginRight: '8px' }}
                        />
                        {get(option, 'provider', '')}&nbsp;
                        {get(option, 'servicelevel.name', '')}
                      </p>
                    </div>
                    <div>
                      <p>
                        {get(option, 'amount', '')}&nbsp;
                        {get(option, 'currency', '')}
                      </p>
                    </div>
                  </Row>
                  <Row>
                    <text style={{ whiteSpace: 'break-spaces' }}>
                      {get(option, 'duration_terms', '')}
                    </text>
                  </Row>
                </>
              </Option>
            ))}
          </Select>
        </div>
      </Spin>
    </>
  );
}

export default ShippoLabelDetails;
