import { Card, Col } from 'antd';
import { get, isEmpty } from 'lodash';
import React from 'react';
import { ReactComponent as Edit } from '../edit.svg';

function DelhiveryPickupAddressItem({
  address,
  handlePickupDetails,
  pickupDetails,
  handelEditMode,
}) {
  const handleAddress = () => {
    handlePickupDetails(address);
  };
  const handleEdit = (event) => {
    event.stopPropagation();
    handelEditMode(address);
  };

  const isDelhiverySelected =
    !isEmpty(pickupDetails) &&
    get(pickupDetails, 'delhivery_pickup_address_id', '') ===
      get(address, 'delhivery_pickup_address_id');

  const isShippoSelected =
    !isEmpty(pickupDetails) &&
    get(pickupDetails, 'shippo_pickup_address_id', '') ===
      get(address, 'shippo_pickup_address_id');

  const isSelected =
    isDelhiverySelected || isShippoSelected ? 'pickup-address-item-select' : '';

  return (
    <Col>
      <Card
        style={{
          width: 250,
        }}
        hoverable
        onClick={handleAddress}
        className={`pickup-address-list-item ${isSelected}`}
      >
        <div className="address-details">
          <div className="pickup-address-title">
            <div>{get(address, 'name', '')}</div>
            <span
              style={{
                display: 'flex',
                marginRight: '5px',
                color: '#0B3D60',
                cursor: 'pointer',
              }}
              className="address-title-span"
              onClick={handleEdit}
              onKeyDown={(_event) => {
                if (_event.key === 'Enter' || _event.key === 'Space') {
                  handleEdit();
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div style={{ marginRight: '6px' }}>
                <Edit />
              </div>
              Edit
            </span>
          </div>
          <div className="pickup-address">{get(address, 'address', '')}</div>
          <div className="flex-bwn">
            <div className="pickup-phone-number">
              Mobile: {get(address, 'phone', '')}
            </div>
          </div>
        </div>
      </Card>
    </Col>
  );
}
export default DelhiveryPickupAddressItem;
