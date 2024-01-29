import React from 'react';
import Countdown from 'react-countdown';
import { get } from 'lodash';
import { Row } from 'antd';

const FlashOn = '';

const CountDownTimer = ({ data, isProductCoupon }) => {
  const renderer = ({ days, hours, minutes, seconds }) => {
    return (
      <Row className="count-down-timer">
        {isProductCoupon ? (
          <>
            <FlashOn />
            <span className="flash-sale"> Flash sale </span>
            <span className="end-in-text"> Ends in </span> {days}d {hours}h{' '}
            {minutes}m {seconds}s
          </>
        ) : (
          <>
            <span className="only-text"> ONLY</span>
            <div className="mr-3p">
              {' '}
              {days} d {hours} h {minutes} m {seconds} s
            </div>
            <span className="left-text"> LEFT</span>
          </>
        )}
      </Row>
    );
  };
  return (
    <>
      <Countdown
        date={new Date(get(data, 'expiry_date', ''))}
        renderer={renderer}
      />
    </>
  );
};

export default CountDownTimer;
