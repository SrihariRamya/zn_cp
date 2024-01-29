import { Card, Col, Row, Select } from 'antd';
import { get } from 'lodash';
import React from 'react';
import {
  BOOKING_STATUS_TABS_VALUES,
  BOOKING_STATUS_WAITING,
} from '../../../shared/constant-values';
import { defaultImage } from '../../../shared/image-helper';

const BookingListItem = ({
  bookingID,
  data,
  tabStatus,
  handleSelectChange,
  handleSelectedBooking,
}) => {
  return (
    <Card hoverable onClick={() => handleSelectedBooking(data)}>
      <Row align="middle" style={{ width: '100%' }}>
        <Col span={2}>
          <div>
            <img
              className="product-image-container"
              alt={get(data, 'product_name', '')}
              src={get(data, 'product_image', false) || defaultImage}
            />
          </div>
        </Col>
        <Col span={tabStatus === BOOKING_STATUS_WAITING ? 16 : 22}>
          <div className="product-name">{get(data, 'product_name', '')}</div>
        </Col>
        {tabStatus === BOOKING_STATUS_WAITING && (
          <Col span={6}>
            <Select
              onChange={(value) => handleSelectChange(value, bookingID)}
              virtual={false}
              onClick={(event) => {
                event.stopPropagation();
              }}
              value={tabStatus}
            >
              {BOOKING_STATUS_TABS_VALUES.map((item) => (
                <Select.Option key={item?.key} value={item.value}>
                  {item.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        )}
      </Row>
    </Card>
  );
};
export default BookingListItem;
