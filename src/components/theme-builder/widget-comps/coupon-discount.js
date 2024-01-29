import React, { useEffect, useState } from 'react';
import { get, isEmpty, isNull } from 'lodash';
import { Card, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import moment from 'moment';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { getCoupons } from '../../../utils/api/url-helper';

const FreeShipIcon =
  'https://zupain-image.s3.ap-south-1.amazonaws.com/free-ship.svg';
const DiscountIcon =
  'https://zupain-image.s3.ap-south-1.amazonaws.com/discount-icon.svg';
const CouponIcon =
  'https://zupain-image.s3.ap-south-1.amazonaws.com/coupon-icon.svg';

const COUPON_ON_SPECIFIC = 'coupon-on-specific';

const { Paragraph, Title } = Typography;

const CouponDiscount = ({ data }) => {
  const [freeShipCoupon, setFreeShipCoupon] = useState({});
  const tenantInfo = {};
  const coupon = get(data, 'coupon.coupon_items', []);

  useEffect(() => {
    getCoupons({
      couponType: 'free-shipping',
      user_uid: false,
    }).then((response) => {
      const dateSource = get(response, 'data', {});
      setFreeShipCoupon(dateSource);
    });
  }, []);

  const couponRender = (item) => {
    return (
      <>
        {get(item, 'coupon_type', '') === COUPON_ON_SPECIFIC && (
          <>
            {get(item, 'coupon_percentage', '') !== 0 &&
            !isNull(get(item, 'coupon_percentage', '')) ? (
              <p className="coupon-percentage">
                {get(item, 'coupon_discount_type', '') === 'Percentage'
                  ? `${get(item, 'coupon_percentage', '')}% OFF`
                  : `${CurrencyFormatter({
                      value: get(item, 'coupon_percentage', ''),
                      type: get(tenantInfo, 'currency', 'INR'),
                      language: get(tenantInfo, 'currency_locale', ''),
                    }).toString()} OFF`}
              </p>
            ) : (
              `${CurrencyFormatter({
                value: get(item, 'maximum_discount_amount', ''),
                type: get(tenantInfo, 'currency', 'INR'),
                language: get(tenantInfo, 'currency_locale', ''),
              }).toString()} OFF`
            )}
          </>
        )}
        <Paragraph
          className="coupon-card-text"
          copyable={{
            text: `${get(item, 'coupon_code')}`,
            tooltips: get(item, 'coupon_code'),
            icon: [<CopyOutlined key="copy" className="copy-coupon-icon" />],
          }}
        >
          <span>{`Apply Code:   ${get(item, 'coupon_code', '')}`}</span>
        </Paragraph>
        <p />
        <p>
          Coupon limitation:{' '}
          {get(item, 'coupon_validity', '') === 'Unlimited' ||
          get(item, 'coupon_validity', '') === 'One Time'
            ? get(item, 'coupon_validity', '')
            : get(item, 'number_of_times', '') -
              get(item, 'order_coupon_count', '')}
        </p>
        <p>
          {`Valid Till: ${moment(get(item, 'expiry_date', '')).format(
            'MMMM Do YYYY'
          )}`}
        </p>
      </>
    );
  };

  return (
    <>
      <>
        {(!isEmpty(coupon) || !isEmpty(freeShipCoupon)) && (
          <Title level={4}>
            <img
              style={{ width: '25px', marginRight: '4px', marginBottom: '4px' }}
              src={DiscountIcon}
              alt="free-shipping-icon"
            />
            Discounts
          </Title>
        )}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <>
            {!isEmpty(coupon) &&
              get(coupon, 'coupon_type', '') === COUPON_ON_SPECIFIC && (
                <Card className="coupon-card">
                  <div className="coupon-card-text">
                    <Title level={5}>
                      <img
                        style={{ width: '25px', marginRight: '4px' }}
                        src={CouponIcon}
                        alt="free-shipping-icon"
                      />
                      Coupon
                    </Title>
                    {couponRender(coupon)}
                  </div>
                </Card>
              )}
            {!isEmpty(freeShipCoupon) && (
              <Card className="coupon-free-ship-card ml-15p">
                <>
                  {get(freeShipCoupon, 'coupon_type', '') ===
                    'free-shipping' && (
                    <div className="coupon-card-text">
                      <Title level={5}>
                        <img
                          style={{ width: '25px' }}
                          src={FreeShipIcon}
                          alt="free-shipping-icon"
                        />
                        Free Shipping
                      </Title>
                      {couponRender(freeShipCoupon)}
                    </div>
                  )}
                </>
              </Card>
            )}
          </>
        </div>
      </>
    </>
  );
};

export default CouponDiscount;
