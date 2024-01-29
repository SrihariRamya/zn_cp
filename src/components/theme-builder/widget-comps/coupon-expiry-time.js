import React from 'react';
import { Tag } from 'antd';
import { get, isEmpty, filter } from 'lodash';
import CountDownTimer from './count-down-timer';

const CouponExpiryTime = ({ data }) => {
  const couponData = get(data, 'coupon', []);

  const filterCouponProduct = filter(
    couponData,
    (item) =>
      item?.coupon_products?.coupon_type === 'coupon-on-specific' &&
      item?.coupon_products?.target_selection === 'Product'
  );

  return (
    <div>
      {!isEmpty(filterCouponProduct) && (
        <Tag className="product-coupon-expiry">
          <CountDownTimer
            data={get(filterCouponProduct, '0.coupon_products')}
            isProductCoupon
          />
        </Tag>
      )}
    </div>
  );
};

export default CouponExpiryTime;
