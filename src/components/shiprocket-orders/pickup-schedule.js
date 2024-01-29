import { Button, Divider, Row } from 'antd';
import { get, isEmpty } from 'lodash';
import React from 'react';
import calendarDateIcon from '../../assets/icons/calendarDateIcon.svg';
import NounAddress from '../../assets/icons/nounAddress.svg';

function PickupSchedule({
  order,
  dateList,
  selectedDate,
  setSelectedDate,
  handleCancel,
  pickupSchedule,
}) {
  const disableCurrentDate = (date) => {
    const time = new Date().getHours();
    return time >= 12 && get(date, 'day', '') === 'Today';
  };

  return (
    <div className="pickup-schedule-container">
      <div className="pickup-address-container">
        <div className="flex">
          <img
            src={NounAddress}
            style={{
              width: '32px',
              height: '32px',
              margin: '8px',
            }}
            alt="address logo"
          />
          <div>
            <div className="pickup-address-title">Pick Up Address</div>
            <div className="pickup-address-value">
              {get(order, 'pickup_address_detail.address')},{' '}
              {get(order, 'pickup_address_detail.city')},{' '}
              {get(order, 'pickup_address_detail.state')},{' '}
              {get(order, 'pickup_address_detail.pin_code')}
            </div>
          </div>
        </div>
      </div>
      <div className="pickup-schedule-container">
        <div className="flex">
          <img
            src={calendarDateIcon}
            style={{
              width: '28px',
              height: '28px',
              margin: '0px 8px 0px 10px',
            }}
            alt="address logo"
          />
          <div className="pickup-schedule-title">
            Please select a suitable date for your order to be picked up
          </div>
        </div>
        <Row className="date-button-container">
          {dateList.map((date) => (
            <div>
              <button
                onClick={() => setSelectedDate(get(date, 'keyDate', ''))}
                type="button"
                className={
                  selectedDate === get(date, 'keyDate', '')
                    ? 'select-date-button'
                    : 'date-button'
                }
                disabled={disableCurrentDate(date)}
              >
                {get(date, 'day', '')}
              </button>
            </div>
          ))}
        </Row>
        <div className="pickup-info-text">
          In case you schedule the pick up for Today, You will not be able to
          reschedule this pick up.
        </div>
      </div>
      <div className="pickup-info-text">
        Note: Please ensure that your invoice is in the package, and your label
        is visible on the package to be delivered.
      </div>
      <Divider />
      <span className="courier-modal-button">
        <Button type="default" style={{ color: 'red' }} onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          onClick={pickupSchedule}
          type="primary"
          disabled={isEmpty(selectedDate)}
          style={{ marginLeft: '10px' }}
        >
          Schedule
        </Button>
      </span>
    </div>
  );
}
export default PickupSchedule;
