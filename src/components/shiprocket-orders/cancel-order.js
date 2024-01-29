import { InfoCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { get, isEmpty } from 'lodash';
import React from 'react';
import AlertLightred from '../../assets/icons/alertLightred.svg';
import {
  SHIPROCKET_SHIPMENT_CANCEL_TEXT,
  SHIPROCKET_ORDER_CANCEL_TEXT,
} from '../../shared/constant-values';

function CancelOrder({
  shipmentCancel,
  handleCancel,
  loading,
  shipmentLoading,
  order,
  orderCancel,
}) {
  return (
    <div className="m-t_15">
      <div className="flex mt-10">
        <img
          src={AlertLightred}
          style={{
            width: '62px',
            height: '62px',
            margin: 'auto',
          }}
          alt="address logo"
        />
      </div>
      {isEmpty(get(order, 'shipments[0].awb', '')) ? (
        <div className="cancel-modal" style={{ padding: '0px 15px 15px 0px' }}>
          <h3 className="order-modal-title">
            Are you sure you want to cancel this order?
          </h3>
          <div className="courier-modal-button">
            <Button
              type="default"
              className="cancel-shipment-button"
              onClick={handleCancel}
            >
              {" Don't Cancel"}
            </Button>
            <Button
              className="cancel-order-button"
              loading={loading}
              onClick={() => orderCancel(order)}
              type="default"
            >
              Yes, Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="cancel-modal" style={{ padding: '0px 15px 15px 0px' }}>
          <h3 className="order-modal-title">
            Do you want to cancel the Order or Shipment?
          </h3>
          <div className="cancel-order-message-container">
            <div className="flex">
              <div className="info-button">
                <InfoCircleOutlined />
              </div>
              <div>
                <div className="title-text">
                  In case of shipment cancellation -{' '}
                  <span className="span-text">
                    {SHIPROCKET_SHIPMENT_CANCEL_TEXT}
                  </span>
                </div>
                <div className="title-text">
                  In case of order cancellation -{' '}
                  <span className="span-text">
                    {SHIPROCKET_ORDER_CANCEL_TEXT}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="courier-modal-button">
            <Button
              type="default"
              className="cancel-order-button"
              loading={loading}
              onClick={() => orderCancel(order)}
            >
              Cancel Order
            </Button>
            <Button
              loading={shipmentLoading}
              onClick={() => shipmentCancel(order)}
              type="default"
              className="cancel-shipment-button"
            >
              Cancel Shipment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
export default CancelOrder;
