import React from 'react';
import { Button, Divider, Alert, Card, Col, Row } from 'antd';
import { CloseCircleOutlined, WarningFilled } from '@ant-design/icons';
import moment from 'moment';
import { get } from 'lodash';
import {
  BILLING_DATE_TITLE,
  DATE_WITHOUT_TIME_FORMAT,
  PAYMENT_METHOD_TITLE,
  PLAN_ON_EXPIRY_DAY,
  PLAN_ONE_WEEK_BEFORE_EXPIRY,
  SUBSCRIPTION_PLAN_TITLE,
} from '../../shared/constant-values';
import { ReactComponent as SubscriptionIcon } from '../../assets/icons/clic/noun-subscription.svg';
import { ReactComponent as CalendarIcon } from '../../assets/icons/clic/noun-calendar.svg';
import { ReactComponent as MoneyIcon } from '../../assets/icons/clic/noun-money-donation.svg';

function PlanDetails(properties) {
  const { expiryDaysCount, activePlan, handleSubscribe } = properties;
  return (
    <>
      {expiryDaysCount >= 0 && expiryDaysCount <= 7 && (
        <div className="plan-alert-box">
          <Alert
            className="plan-alert"
            message={
              <>
                <WarningFilled twoToneColor="#634343" />
                {expiryDaysCount === 0
                  ? PLAN_ON_EXPIRY_DAY
                  : PLAN_ONE_WEEK_BEFORE_EXPIRY}
              </>
            }
            closeText={<CloseCircleOutlined />}
            closable
          />
        </div>
      )}
      <div className="plan-card-wrapper plan-alert-box">
        <Row gutter={16}>
          <Col span={8}>
            <Card
              title={SUBSCRIPTION_PLAN_TITLE}
              bordered={false}
              extra={<SubscriptionIcon />}
              className="subscription-plan"
            >
              <div>
                <h4>Name</h4>
                <h3>{get(activePlan, 'subscription_plan.name', '')}</h3>
              </div>
              <div>
                <h4>Description</h4>
                <h3>{get(activePlan, 'subscription_plan.description', '')}</h3>
              </div>
              <div>
                <h4>Amount</h4>
                <h3>₹{get(activePlan, 'amount', '')}</h3>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              title={BILLING_DATE_TITLE}
              bordered={false}
              className="billing-date"
              extra={<CalendarIcon />}
            >
              <div style={{ margin: '8px 0px' }}>
                <h4 className="mt-10">Next Billing Date</h4>
                <h3>
                  {moment(get(activePlan, 'end_date', ''))
                    .add('days', 1)
                    .format(DATE_WITHOUT_TIME_FORMAT)}
                </h3>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              title={PAYMENT_METHOD_TITLE}
              bordered={false}
              className="payment-method"
              extra={<MoneyIcon />}
            >
              <div style={{ margin: '10px 0px' }}>
                <h4>Payment Method</h4>
                <h3>{get(activePlan, 'payment_mode', '')}</h3>
                {!get(activePlan, 'is_active') && (
                  <>
                    <Divider />
                    <div className="plan-align mr-10">
                      <span className="plan-status">Expired</span>
                      {!get(activePlan, 'subscription_plan.deleted_at', '') && (
                        <Button
                          className="plan-button"
                          type="primary"
                          onClick={() => handleSubscribe()}
                        >
                          Subscribe
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default PlanDetails;
