/* eslint-disable camelcase */
import React, { useState, useEffect, useContext } from 'react';
import {
  Spin,
  Row,
  Col,
  Card,
  Input,
  Checkbox,
  Space,
  Button,
  notification,
} from 'antd';
import {
  CheckCircleFilled,
  LeftOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { get, isEmpty, map } from 'lodash';
import { TenantContext } from '../context/tenant-context';
import {
  CURRENCYSYMBOLS,
  FAILED_TO_LOAD,
  PAYMENT_UPDATE_FAILED,
  PLAN_TAX_PERCENT,
} from '../../shared/constant-values';
import { ReactComponent as CouponIcon } from '../../assets/icons/coupon-icon.svg';
import PaymentStatus from './payment-status';
import {
  validateCoupon,
  userWalletBalance,
  createPayment,
  subscriptionDebitWallet,
  paymentSuccess,
  createSubscriber,
} from '../../utils/api/url-helper';

function PlanSubscriptionPayment(properties) {
  const { setVisiblePlan, makePaymentDetails, setMakePayment, isRepeatPlan } =
    properties;
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [showCouponSuccess, setShowCouponSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [walletBalance, setWalletBalance] = useState();
  const [walletPayment, setWalletPayment] = useState(false);
  const [discountAmount, setDiscountAmount] = useState('0.00');
  const [taxAmount, setTaxAmount] = useState('0.00');
  const [totalCost, setTotalCost] = useState();
  const [detuctableWalletAmt, setDetuctableWalletAmt] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [couponApplyButton, setCouponApplyButton] = useState(true);
  const [tenantDetails] = useContext(TenantContext);
  const mobileView = useContext(TenantContext)[4];
  const userID = localStorage.getItem('userID');
  useEffect(() => {
    setLoading(true);
    userWalletBalance({ user_id: userID })
      .then((data) => {
        if (data.success) {
          setWalletBalance(
            Math.trunc(get(data, 'data.wallet_balance', []) * 100) / 100
          );
          setLoading(false);
        } else {
          setWalletBalance('0.00');
          setLoading(false);
          notification.error({ message: FAILED_TO_LOAD });
        }
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
        setLoading(false);
      });
  }, [userID]);

  const handleCouponValueChange = (event) => {
    const { value } = event.target;
    if (isEmpty(value) || value !== couponCode) {
      setCouponApplyButton(true);
      setShowCouponSuccess(false);
      setDiscountAmount('0.00');
    }
    setCouponCode(value);
  };

  const validateCouponCode = () => {
    validateCoupon({ price: makePaymentDetails.plan_price, couponCode })
      .then((resp) => {
        const { message, success, finalDiscount } = resp;
        if (success) {
          setShowCouponSuccess(true);
          setDiscountAmount(Number(finalDiscount).toFixed(2));
          setCouponApplyButton(false);
        } else {
          setShowCouponSuccess(false);
          notification.error({ message });
          setCouponApplyButton(false);
        }
      })
      .catch((error) => {
        setShowCouponSuccess(false);
        notification.error({
          message: get(error, 'message', '') || FAILED_TO_LOAD,
        });
      });
  };

  useEffect(() => {
    const planPrice = get(makePaymentDetails, 'plan_price', '');
    const gstInValue = 1 + PLAN_TAX_PERCENT / 100;
    const taxValue = planPrice - planPrice / gstInValue;
    const totalTax = taxValue ? Number.parseFloat(taxValue).toFixed(2) : '0.00';
    const walletAmt = (
      Number(planPrice) +
      Number(totalTax) -
      Number(discountAmount)
    ).toFixed(2);
    setTaxAmount(Number(totalTax));
    if (Number(walletBalance) > Number(walletAmt))
      setDetuctableWalletAmt(Number(walletAmt));
    else setDetuctableWalletAmt(Number(walletBalance));
    if (walletPayment) {
      setTotalCost(
        (
          Number(planPrice) -
          Number(discountAmount) +
          Number(totalTax) -
          detuctableWalletAmt
        ).toFixed(2)
      );
    } else {
      setTotalCost(
        (Number(planPrice) - Number(discountAmount) + Number(totalTax)).toFixed(
          2
        )
      );
    }
  }, [
    discountAmount,
    walletBalance,
    makePaymentDetails,
    taxAmount,
    walletPayment,
    detuctableWalletAmt,
  ]);

  const createSubscribe = (payMode) => {
    setLoading(true);
    const payload = {
      user_id: userID,
      payMode,
      couponCode,
      ...makePaymentDetails,
      pay_amount:
        payMode === 'wallet'
          ? detuctableWalletAmt
          : Number(get(makePaymentDetails, 'plan_price', 0)) +
            taxAmount -
            Number(discountAmount),
    };
    createSubscriber(payload)
      .then((data) => {
        if (data.success) {
          notification.success({ message: data.message });
          setPaymentStatus(true);
          setPaymentDetails(get(data, 'data', []));
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        setPaymentStatus(false);
        notification.error({ message: error.message });
      });
  };

  const payViaWallet = () => {
    setLoading(true);
    const transactionData = {
      user_id: userID,
      amount: Number(detuctableWalletAmt),
      transaction_reason: 'subscription_plan',
    };
    subscriptionDebitWallet(transactionData)
      .then((data) => {
        if (data.success) {
          notification.success({
            message: get(data, 'message', 'Wallet amount debited successfully'),
          });
          if (Number(totalCost) === 0) createSubscribe('wallet');
        } else {
          notification.error({
            message: get(data, 'message', PAYMENT_UPDATE_FAILED),
          });
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', FAILED_TO_LOAD),
        });
      });
  };

  const payViaRazorpay = () => {
    setLoading(true);
    const userDetails = get(tenantDetails, 'setting', {});
    const payableAmount =
      Number(get(makePaymentDetails, 'plan_price', 0)) -
      Number(discountAmount) +
      taxAmount -
      (walletPayment ? Number(detuctableWalletAmt) : 0);
    const order = {
      amount: Math.floor(Number(payableAmount) * 100),
      notes: {
        user_id: userID,
        transaction_reason: 'subscription_plan',
      },
    };
    createPayment({ order })
      .then((value) => {
        const data = get(value, 'data', []);
        const options = {
          key: value.razorpay_public_token,
          amount: value.amount,
          description: 'Recharge for subscription',
          currency: 'INR',
          order_id: data.id,
          // eslint-disable-next-line consistent-return
          handler: async (response) => {
            const {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
            } = response;
            const body = {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
            };
            await paymentSuccess(body).then((item) => {
              if (get(item, 'success', false)) {
                if (walletPayment) payViaWallet();
                createSubscribe('razorpay');
              } else {
                notification.error(
                  get(item, 'data.message', 'Signature does not match')
                );
                setLoading(false);
              }
            });
          },
          modal: {
            ondismiss() {
              setLoading(false);
            },
          },
          prefill: {
            name: tenantDetails.tenant_name,
            contact: userDetails.phone,
            email: userDetails.email_address,
          },
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
        rzp1.on('payment.failed', () => {
          notification.error({
            message:
              'Payment failed. Try different Payment method. If money deducted it will be auto refunded.',
          });
          setLoading(false);
        });
      })
      .catch(() => {
        setLoading(false);
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const handlePayment = () => {
    if (walletPayment && Number(totalCost) === 0) payViaWallet();
    else payViaRazorpay();
  };

  const removeCouponCode = () => {
    setShowCouponSuccess(false);
    setCouponApplyButton(true);
    setDiscountAmount('0.00');
    setCouponCode();
  };

  const backToPreviousPage = () => {
    if (isRepeatPlan) setVisiblePlan(false);
    else {
      setMakePayment(false);
      setVisiblePlan(true);
    }
  };

  const handleWalletPayment = () => {
    setWalletPayment(!walletPayment);
  };

  return (
    <Spin spinning={loading}>
      {paymentStatus ? (
        <PaymentStatus
          setVisiblePlan={setVisiblePlan}
          paymentDetails={paymentDetails}
          status={paymentStatus}
        />
      ) : (
        <Row gutter={[24, 24]} className="make-payment-container">
          <Col xl={16} sm={24} xs={24} md={16} lg={16} xxl={16}>
            <h2>
              <LeftOutlined
                onClick={backToPreviousPage}
                className="back-icon mr-10"
              />
              {!mobileView && <br />}
              <span>Your Order (1 item)</span>
            </h2>
            {mobileView ? (
              <Card bordered={false} className="mt-10">
                <div className="flex-bwn">
                  <div>
                    <h3>{get(makePaymentDetails, 'subscription_plan', '')}</h3>
                    <span>
                      {get(makePaymentDetails, 'plan_description', '')}
                    </span>
                  </div>
                  <h2>
                    {CURRENCYSYMBOLS.INR}
                    {get(makePaymentDetails, 'plan_price', '')} /
                    {get(
                      makePaymentDetails,
                      'plan_duration.duration_cycle',
                      ''
                    )}
                  </h2>
                </div>
                <div className="mt-10">
                  <p>Features</p>
                  <Row>
                    {map(
                      get(makePaymentDetails, 'plan_feature.features', ''),
                      (features) => {
                        return (
                          features.access && (
                            <Col span={12} key={get(features, 'label', '')}>
                              <CheckOutlined />
                              <span className="ml-10">
                                {get(features, 'label', '')}
                              </span>
                            </Col>
                          )
                        );
                      }
                    )}
                  </Row>
                </div>
              </Card>
            ) : (
              <>
                <Row className="order-details-header">
                  <Col span={16}>Product</Col>
                  <Col span={4} className="text-right">
                    Price
                  </Col>
                  <Col span={4} className="text-center">
                    Grand Total
                  </Col>
                </Row>
                <Row align="middle">
                  <Col span={16}>
                    <Card style={{ width: '60%' }}>
                      <h3>
                        {get(makePaymentDetails, 'subscription_plan', '')}
                      </h3>
                      <h3>
                        {CURRENCYSYMBOLS.INR}
                        {get(makePaymentDetails, 'plan_price', '')} /
                        {get(
                          makePaymentDetails,
                          'plan_duration.duration_cycle',
                          ''
                        )}
                      </h3>
                    </Card>
                  </Col>
                  <Col span={4} className="text-right">
                    {CURRENCYSYMBOLS.INR}
                    {get(makePaymentDetails, 'plan_price', '')}
                  </Col>
                  <Col span={4} className="text-center">
                    {CURRENCYSYMBOLS.INR}
                    {(
                      Number(get(makePaymentDetails, 'plan_price', 0)) +
                      taxAmount -
                      Number(discountAmount)
                    ).toFixed(2)}
                  </Col>
                </Row>
              </>
            )}
          </Col>
          <Col xl={8} sm={24} xs={24} md={8} lg={8} xxl={8}>
            <div>
              <div className="order-summary-details">
                <h4 className="order-summary">Order Summary</h4>
                <div className="flex-bwn">
                  <span>Price</span>
                  <span>
                    {CURRENCYSYMBOLS.INR}
                    {get(makePaymentDetails, 'plan_price', '')}
                  </span>
                </div>
                <div className="flex-bwn">
                  <span>Discount</span>
                  <span style={{ color: '#32C770' }}>
                    -{CURRENCYSYMBOLS.INR}
                    {discountAmount}
                  </span>
                </div>
                <div className="flex-bwn">
                  <span>Subtotal</span>
                  <span>
                    {CURRENCYSYMBOLS.INR}
                    {Number(get(makePaymentDetails, 'plan_price', '')) -
                      Number(discountAmount)}
                  </span>
                </div>
                <div className="flex-bwn">
                  <span>Tax & Charges</span>
                  <span>
                    {CURRENCYSYMBOLS.INR}
                    {taxAmount}
                  </span>
                </div>
                {walletPayment && (
                  <div className="flex-bwn">
                    <span>Wallet</span>
                    <span style={{ color: '#FFB400' }}>
                      -{CURRENCYSYMBOLS.INR}
                      {detuctableWalletAmt}
                    </span>
                  </div>
                )}
                <div className="flex-bwn estimated-total">
                  <h4>Grand Total</h4>
                  <h4>
                    {CURRENCYSYMBOLS.INR}
                    {totalCost}
                  </h4>
                </div>
              </div>
              <div className="coupon">
                <h4>
                  <CouponIcon className="mr-10" />
                  Coupon
                </h4>
                <Space.Compact className="w-100">
                  <Input
                    placeholder="Enter Coupon Code"
                    onChange={handleCouponValueChange}
                    value={couponCode}
                  />
                  {showCouponSuccess || !couponApplyButton ? (
                    <span
                      className="coupon-remove-text"
                      onClick={removeCouponCode}
                      role="button"
                      tabIndex={0}
                      onKeyUp={() => {}}
                    >
                      Remove
                    </span>
                  ) : (
                    <Button
                      type="primary"
                      onClick={validateCouponCode}
                      disabled={isEmpty(couponCode)}
                    >
                      Apply
                    </Button>
                  )}
                </Space.Compact>
                {showCouponSuccess && (
                  <p className="coupon-code-notification">
                    <CheckCircleFilled />
                    Your Coupon code was successfully applied.
                  </p>
                )}
              </div>
              <div className="mb-20">
                <div className="flex-bwn wallet-payment">
                  <div>
                    <Checkbox
                      onChange={handleWalletPayment}
                      checked={walletPayment}
                      disabled={walletBalance === 0}
                    />
                    <span className="ml-10">Pay via wallet</span>
                  </div>
                  {walletPayment ? (
                    <span
                      onClick={handleWalletPayment}
                      onKeyUp={() => {}}
                      tabIndex={0}
                      role="button"
                      className="cursor-pointer"
                    >
                      Remove
                    </span>
                  ) : (
                    <span>
                      {CURRENCYSYMBOLS.INR}
                      {walletBalance}
                    </span>
                  )}
                </div>
                {walletPayment && (
                  <p className="wallet-money">
                    <CheckCircleFilled />
                    Your wallet money was successfully applied.
                  </p>
                )}
              </div>
              <Button type="primary" className="w-100" onClick={handlePayment}>
                Make Payment
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </Spin>
  );
}

export default PlanSubscriptionPayment;
