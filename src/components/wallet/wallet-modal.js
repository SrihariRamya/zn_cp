/* eslint-disable camelcase */
import React, { useState, useContext } from 'react';
import { Button, notification, Modal, Input, Divider, Col, Row } from 'antd';
import { get } from 'lodash';
import './wallet.less';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { TenantContext } from '../context/tenant-context';
import { createPayment, paymentSuccess } from '../../utils/api/url-helper';
import {
  CURRENCY_TYPE,
  FAILED_TO_LOAD,
  TENANT_MODE_CLIC,
} from '../../shared/constant-values';

function WalletModal(properties) {
  const { setIsModal, isModal, fetchData } = properties;
  const [enteredAmount, setEnteredAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [userID] = useState(localStorage.getItem('userID'));
  const [tenantDetails] = useContext(TenantContext);
  const currency =
    get(tenantDetails, 'setting.currency', false) || CURRENCY_TYPE;

  const onClose = () => {
    setIsModal(false);
  };

  const onChangeAmount = (event) => {
    const { value, validity } = event.target;
    if (validity.valid) {
      const gst = value * (18 / 100);
      const amount = Number(gst) + Number(value);
      setEnteredAmount(value);
      setTotalAmount(amount);
    }
  };

  const onRechargeSubmit = async () => {
    setLoading(true);
    const userDetails = get(tenantDetails, 'setting', {});
    if (totalAmount > 0) {
      const order = {
        amount: Math.floor(Number(totalAmount) * 100),
        notes: {
          user_id: userID,
          transaction_reason: 'wallet_recharge',
        },
      };
      createPayment({ order })
        .then((value) => {
          const data = get(value, 'data', []);
          const options = {
            key: value.razorpay_public_token,
            amount: value.amount,
            currency,
            description: 'Recharge for wallet',
            order_id: data.id,
            // eslint-disable-next-line consistent-return
            handler: async (response) => {
              const {
                razorpay_payment_id,
                razorpay_signature,
                razorpay_order_id,
              } = response;
              const body = {
                razorpay_payment_id,
                razorpay_signature,
                razorpay_order_id,
              };
              await paymentSuccess(body).then((item) => {
                if (get(item, 'success', false)) {
                  fetchData();
                  notification.success({
                    message: 'Wallet Top-up successfully',
                  });
                } else {
                  notification.error(
                    get(item, 'data.message', 'Signature does not match')
                  );
                }
              });
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
          });
          setLoading(false);
          setIsModal(false);
          setEnteredAmount('');
          setTotalAmount('');
        })
        .catch(() => {
          setLoading(false);
          notification.error({ message: FAILED_TO_LOAD });
        });
    }
  };
  const gst = totalAmount - totalAmount * (100 / (100 + 18));

  return (
    <Modal
      className={
        get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC
          ? 'clic-recharge-modal add-money-container mt-20'
          : 'recharge-modal add-money-container mt-20'
      }
      width={400}
      visible={isModal}
      footer={false}
      onCancel={onClose}
    >
      <h4 className="add-money-heading">Enter the Recharge amount</h4>
      <Input
        type="number"
        value={enteredAmount}
        pattern="^-?[0-9]\d*\.?\d*$"
        onChange={(event) => onChangeAmount(event)}
        className="recharge-amount mt-10 mb-10"
        placeholder="Enter recharge amount here"
      />
      <Divider />
      <h4 className="add-money-heading mt-20">Payment Summary</h4>
      <Col>
        <Row justify="end">
          <Col className="payment-label" span={18}>
            Top Up Credit
          </Col>
          <Col className="payment-amt" span={6}>
            <CurrencyFormatter
              value={enteredAmount}
              type="INR"
              language="en-IN"
            />
          </Col>
        </Row>
        <Row>
          <Col className="payment-label" span={18}>
            Taxes
          </Col>
          <Col className="payment-amt" span={6}>
            <CurrencyFormatter value={gst} type="INR" language="en-IN" />
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col className="payment-label" span={18}>
            Total Amount
          </Col>
          <Col className="payment-amt" span={6}>
            <CurrencyFormatter
              value={totalAmount}
              type="INR"
              language="en-IN"
            />
          </Col>
        </Row>
      </Col>
      <Button
        type="primary"
        className="patment-btn mt-10"
        onClick={onRechargeSubmit}
        loading={loading}
        disabled={totalAmount < 1}
        block
      >
        Make Payment
      </Button>
    </Modal>
  );
}

export default WalletModal;
