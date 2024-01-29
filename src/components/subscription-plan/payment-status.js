import React from 'react';
import { Row, Col, Card, Button, Tooltip } from 'antd';
import {
  DownloadOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from '@ant-design/icons';
import { get } from 'lodash';
import './subscription.less';
import moment from 'moment';
import { CURRENCYSYMBOLS } from '../../shared/constant-values';

function PaymentStatus(properties) {
  const { paymentDetails, status } = properties;

  return (
    <Row className="payment-status-container">
      <Col
        xxl={{ span: 6, offset: 9 }}
        xl={{ span: 6, offset: 9 }}
        lg={{ span: 6, offset: 9 }}
        md={{ span: 6, offset: 9 }}
        sm={24}
        xs={24}
      >
        <Card>
          {status ? (
            <div className="payment-success payment-notification">
              <CheckCircleFilled />
              <h2>Payment Success!</h2>
              <span className="notify-text">
                Your payment has been successfully done
              </span>
            </div>
          ) : (
            <div className="payment-failed payment-notification">
              <CloseCircleFilled />
              <h2>Payment Failed!</h2>
              <span className="notify-text">Your payment has been failed</span>
            </div>
          )}
          <div className="payment-details">
            <div className="flex-bwn">
              <span>Amount</span>
              <span>
                {CURRENCYSYMBOLS.INR}
                {get(paymentDetails, 'pay_amount', '').toFixed(2)}
              </span>
            </div>
            <div className="flex-bwn">
              <span>Payment Status</span>
              {status ? (
                <span className="success-text status-text">Success</span>
              ) : (
                <span className="failure-text status-text">Failed</span>
              )}
            </div>
            <div className="flex-bwn">
              <span className="w-50">Ref Number</span>
              <span className="w-50 ref-number-text">
                <Tooltip title={get(paymentDetails, 'plan_purchase_uid', '')}>
                  <div>{get(paymentDetails, 'plan_purchase_uid', '')}</div>
                </Tooltip>
              </span>
            </div>
            <div className="flex-bwn">
              <span>Merchant Name</span>
              <span>{get(paymentDetails, 'merchant_name', '')}</span>
            </div>
            <div className="flex-bwn">
              <span>Payment Method</span>
              <span>{get(paymentDetails, 'purchase_mode', '')}</span>
            </div>
            <div className="flex-bwn">
              <span>Payment Time</span>
              <span>{moment().format('LLL')}</span>
            </div>
          </div>
        </Card>
        {status === 'Success' && (
          <Button className="w-100 mb-20">
            <DownloadOutlined disabled />
            Get PDF receipt
          </Button>
        )}
        <Button
          type="primary"
          className="w-100"
          onClick={() => window.location.reload()}
        >
          Back to Home
        </Button>
      </Col>
    </Row>
  );
}

export default PaymentStatus;
