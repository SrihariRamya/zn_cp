import { notification, Spin } from 'antd';
import { get, isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import Shiprocket from './shiprocket';
import {
  FAILED_TO_LOAD,
  SHIPMENT_METHOD_SLUG_DELHIVERY,
  SHIPMENT_METHOD_SLUG_SHIPPO,
} from '../../../shared/constant-values';
import { getOrder } from '../../../utils/api/url-helper';
import Delhivery from './delhivery';
import Shippo from './shippo';

function Shipment(properties) {
  const {
    refreshList,
    formOrders,
    shipmentMethod,
    orderId,
    onClose,
    refresh,
    fetchShipmentMethod,
  } = properties;
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState({});

  const getOrderDetail = () => {
    setLoading(true);
    getOrder(orderId)
      .then((response) => {
        setOrder(get(response, 'data', {}));
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };

  useEffect(() => {
    getOrderDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Spin spinning={loading}>
      <div className="shipment-container">
        {get(shipmentMethod, 'slug', '') === 'shiprocket' &&
          !isEmpty(order) && (
            <Shiprocket
              formOrders={formOrders}
              onClose={onClose}
              refreshList={refreshList}
              order={order}
              shipmentMethod={shipmentMethod}
            />
          )}
        {get(shipmentMethod, 'slug', '') === SHIPMENT_METHOD_SLUG_DELHIVERY &&
          !isEmpty(order) && (
            <Delhivery
              formOrders={formOrders}
              onClose={onClose}
              refresh={refresh}
              order={order}
              shipmentMethod={shipmentMethod}
            />
          )}
        {get(shipmentMethod, 'slug', '') === SHIPMENT_METHOD_SLUG_SHIPPO &&
          !isEmpty(order) && (
            <Shippo
              formOrders={formOrders}
              onClose={onClose}
              refresh={refresh}
              order={order}
              shipmentMethod={shipmentMethod}
              fetchShipmentMethod={fetchShipmentMethod}
            />
          )}
      </div>
    </Spin>
  );
}
export default Shipment;
