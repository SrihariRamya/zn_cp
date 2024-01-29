import { Card, Col } from 'antd';
import { get, isEmpty } from 'lodash';
import React from 'react';
import { ReactComponent as Verified } from './icons/Verified.svg';
import { ReactComponent as Unverified } from './icons/Unverified.svg';

function PickupAddressItem(parameters) {
  const { address, handlePickupDetails, pickupDetails } = parameters;
  const handleAddress = () => {
    handlePickupDetails(address);
  };
  return (
    <Col>
      <Card
        hoverable
        style={{
          width: 250,
        }}
        onClick={handleAddress}
        className={`pickup-address-list-item ${
          !isEmpty(pickupDetails) &&
          get(pickupDetails, 'id', '') === address.id &&
          'pickup-address-item-select'
        }`}
      >
        <div className="address-details">
          <div className="verify-container" style={{ display: 'flex' }}>
            {get(address, 'phone_verified', 0) === 1 ? (
              <div className="displayclass">
                <div>
                  <Verified />
                </div>
                <div className="verify-span">Verified</div>
              </div>
            ) : (
              <div className="displayclass">
                <div>
                  <Unverified />
                </div>
                <div className="not-verify-span">Unverified</div>
              </div>
            )}

            <div className="pickup-address-title">
              {get(address, 'pickup_location', '')}
            </div>
          </div>
          <div className="pickup-address">{get(address, 'address', '')}</div>
          <div className="pickup-phone-number">
            Mobile: {get(address, 'phone', '')}
          </div>
        </div>
      </Card>
    </Col>
  );
}
export default PickupAddressItem;
