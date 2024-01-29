import { Button, notification, Spin, Card } from 'antd';
import { get, isEmpty } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import { DownloadOutlined, RightOutlined } from '@ant-design/icons';
import moment from 'moment';
import { TenantContext } from '../context/tenant-context';
import {
  CURRENCYSYMBOLS,
  PLAN_DATE_FORMAT,
} from '../../shared/constant-values';
import Wallet from '../wallet/index';
import './subscription.less';
import { getPlanDetail } from '../../utils/api/url-helper';
import SubscriptionTable from './subscription-table';
import SubscriptionPlanDetails from './subscription-plan-details';
import SubscriptionHistoryMobileView from './subscription-history-mobile-view';
import PlansAndWallet from './plans-and-wallet';

function SubscriptionPlan() {
  const [loading, setLoading] = useState(false);
  const [userID] = useState(localStorage.getItem('userID'));
  const [activePlan, setActivePlan] = useState({});
  const [visiblePlan, setVisiblePlan] = useState(false);
  const [expiryDaysCount, setExpiryDaysCount] = useState('');
  const [subscriptionMobileView, setSubscriptionMobileView] = useState(false);
  const [isRepeatPlan, setIsRepeatPlan] = useState(false);
  const [plansAndWalletSlug, setPlansAndWalletSlug] = useState(true);
  const mobileView = useContext(TenantContext)[4];

  useEffect(() => {
    if (!mobileView) setSubscriptionMobileView(false);
  }, [mobileView, visiblePlan]);

  const fetchData = () => {
    setLoading(true);
    getPlanDetail(userID)
      .then((data) => {
        const plan = get(data, 'data', {});
        if (isEmpty(plan)) {
          setVisiblePlan(true);
        } else {
          setActivePlan(plan);
          const expiration = moment(get(data, 'data.end_date', ''));
          const currentDate = moment();
          const days = expiration.diff(currentDate, 'days');
          setExpiryDaysCount(days);
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({ message: error.message });
      });
  };

  useEffect(() => {
    fetchData();
  }, [visiblePlan]);

  const renderSubscriptionHistory = () => {
    if (mobileView) {
      return (
        <Card size="small mt-20">
          <div
            className="flex-bwn subscription-mobile"
            onClick={() => setSubscriptionMobileView(true)}
            tabIndex={0}
            role="button"
            onKeyUp={() => setSubscriptionMobileView(true)}
          >
            <h3>View subscription history</h3>
            <RightOutlined />
          </div>
        </Card>
      );
    }
    return (
      <div>
        <div className="flex-bwn">
          <h3>Subscription History</h3>
          <Button
            icon={<DownloadOutlined />}
            type="primary"
            className="subscription-table-btn"
            disabled
          >
            Download
          </Button>
        </div>
        <SubscriptionTable />
      </div>
    );
  };

  const isPlanActive =
    get(activePlan, 'is_active', '') === 1 && Math.sign(expiryDaysCount) !== -1;

  const renderSubscriptionHistoryData = () => {
    if (subscriptionMobileView && mobileView) {
      return plansAndWalletSlug ? (
        <SubscriptionHistoryMobileView
          setVisiblePlan={setVisiblePlan}
          setSubscriptionMobileView={setSubscriptionMobileView}
        />
      ) : (
        <Wallet />
      );
    }
    return plansAndWalletSlug ? (
      <>
        <div>
          <h3>Subscriptions</h3>
          <Card
            bordered={false}
            className={
              mobileView ? 'subscription-card w-100' : 'subscription-card'
            }
          >
            <div className="flex-bwn plan-details">
              <h3>
                {get(activePlan, 'subscription_plan.subscription_plan', '')}
              </h3>
              <span
                className={`plan-status ${
                  isPlanActive ? 'plan-active' : 'plan-expired'
                }`}
              >
                {isPlanActive ? 'Active' : 'Expired'}
              </span>
            </div>
            <div className="subscription-details">
              <p>
                <span>
                  {CURRENCYSYMBOLS.INR}
                  {get(activePlan, 'plan_price', '')}
                </span>
                <span>
                  {' '}
                  /
                  {get(
                    activePlan,
                    'subscription_plan.plan_duration.duration_cycle',
                    ''
                  )}
                </span>
              </p>
              <p>
                <span>{isPlanActive ? expiryDaysCount : 0} days left</span>
                <span className="ml-5">|</span>
                <span className="ml-5">
                  Start date:&nbsp;
                  {moment(get(activePlan, 'start_date', '')).format(
                    PLAN_DATE_FORMAT
                  )}
                </span>
                <span className="ml-5">|</span>
                <span className="ml-5">
                  End date:&nbsp;
                  {moment(get(activePlan, 'end_date', '')).format(
                    PLAN_DATE_FORMAT
                  )}
                </span>
              </p>
              <p>Payment method: {get(activePlan, 'purchase_mode', '')}</p>
            </div>
            <div className="upgrade-now-btn">
              <Button type="primary" onClick={() => setVisiblePlan(true)}>
                Change Plan
              </Button>
              {!isPlanActive && (
                <Button
                  className="ml-10"
                  onClick={() => {
                    setVisiblePlan(true);
                    setIsRepeatPlan(true);
                  }}
                >
                  Repeat
                </Button>
              )}
            </div>
          </Card>
        </div>
        {renderSubscriptionHistory()}
      </>
    ) : (
      <Wallet />
    );
  };

  return (
    <Spin spinning={loading}>
      <div className="plans-container">
        {visiblePlan ? (
          <SubscriptionPlanDetails
            setVisiblePlan={setVisiblePlan}
            activePlan={activePlan}
            isRepeatPlan={isRepeatPlan}
            setPlansAndWalletSlug={setPlansAndWalletSlug}
            plansAndWalletSlug={plansAndWalletSlug}
          />
        ) : (
          <>
            <PlansAndWallet
              setPlansAndWalletSlug={setPlansAndWalletSlug}
              plansAndWalletSlug={plansAndWalletSlug}
              mobileView={mobileView}
            />
            {renderSubscriptionHistoryData()}
          </>
        )}
      </div>
    </Spin>
  );
}

export default SubscriptionPlan;
