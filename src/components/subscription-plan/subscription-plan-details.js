import React, { useState, useEffect, useContext } from 'react';
import { Button, Card, Col, Row, Spin, Radio, List, notification } from 'antd';
import {
  CheckOutlined,
  PlusOutlined,
  MinusOutlined,
  CheckCircleFilled,
  LeftOutlined,
} from '@ant-design/icons';
import { get, isEmpty, map } from 'lodash';
import { TenantContext } from '../context/tenant-context';
import { getAllPlans } from '../../utils/api/url-helper';
import {
  CURRENCYSYMBOLS,
  FAILED_TO_LOAD,
  TENANT_MODE_NORMAL,
} from '../../shared/constant-values';
import PlanSubscriptionPayment from './plan-subscription-payment';
import './subscription.less';
import planFeatures from './plan-features';
import PlansAndWallet from './plans-and-wallet';
import Wallet from '../wallet';

function SubscriptionPlanDetails(properties) {
  const {
    setVisiblePlan,
    isRepeatPlan,
    activePlan,
    setPlansAndWalletSlug,
    plansAndWalletSlug,
  } = properties;
  const [loading, setLoading] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [makePayment, setMakePayment] = useState(false);
  const [mobilePlanFeatures, setMobilePlanFeatures] = useState(false);
  const [webPlanFeatures, setWebPlanFeatures] = useState(true);
  const [planDetails, setPlanDetails] = useState([]);
  const [makePaymentDetails, setMakePaymentDetails] = useState([]);
  const [mobileViewPaymentDetails, setMobileViewPaymentDetails] = useState([]);
  const [hidePlanFeatures, setHidePlanFeatures] = useState(true);
  const [tenantDetails] = useContext(TenantContext);
  const mobileView = useContext(TenantContext)[4];

  const tenantMode =
    get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL
      ? 'd2c'
      : 'clic';

  useEffect(() => {
    if (mobileView) {
      setShowFeatures(true);
      setMobilePlanFeatures(false);
      setWebPlanFeatures(false);
    } else {
      setShowFeatures(false);
      setMobilePlanFeatures(true);
      setWebPlanFeatures(true);
    }
  }, [mobileView]);

  useEffect(() => {
    setLoading(true);
    setHidePlanFeatures(true);
    getAllPlans({ tenantMode })
      .then((resp) => {
        if (resp.success) {
          setPlanDetails(resp.data);
          setLoading(false);
        }
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
        setLoading(false);
      });
  }, []);

  const renderGetStartedButton = (details) => {
    return (
      <Button
        onClick={() => {
          setMakePayment(true);
          setMakePaymentDetails(details);
        }}
      >
        Get Started
      </Button>
    );
  };

  const renderFeaturesHeader = () => {
    return map(planDetails, (data) => {
      return (
        <Col
          span={6}
          className="text-center"
          key={get(data, 'subscription_plan', '')}
        >
          <h2>{get(data, 'subscription_plan', '')}</h2>
          <h2>
            {CURRENCYSYMBOLS.INR}
            {get(data, 'plan_price', '')}/
            {get(data, 'plan_duration.duration_cycle', '')}
          </h2>
          {renderGetStartedButton(data)}
        </Col>
      );
    });
  };

  const showPlanFeatures = () => {
    setMobilePlanFeatures(true);
    setWebPlanFeatures(false);
  };

  const renderCheckAccess = () => {
    if (mobileView) return <CheckOutlined />;
    return <CheckCircleFilled />;
  };

  const renderPlanDetails = () => {
    return map(planDetails, (details) => {
      return (
        <Col
          span={6}
          className="text-center"
          key={get(details, 'subscription_plan', '')}
        >
          <p>{get(details, 'subscription_plan', '')}</p>
          <p>
            {CURRENCYSYMBOLS.INR}
            {get(details, 'plan_price', '')}/
            {get(details, 'plan_duration.duration_cycle', '')}
          </p>
        </Col>
      );
    });
  };

  const renderPlanAccess = (item, planName) => {
    return item.access[planName] === true ? (
      renderCheckAccess()
    ) : (
      <MinusOutlined />
    );
  };

  const isNewUser = isEmpty(activePlan);

  return (
    <Spin spinning={loading}>
      {makePayment || isRepeatPlan ? (
        <PlanSubscriptionPayment
          setVisiblePlan={setVisiblePlan}
          makePaymentDetails={isRepeatPlan ? activePlan : makePaymentDetails}
          setMakePayment={setMakePayment}
          isRepeatPlan={isRepeatPlan}
        />
      ) : (
        <>
          {isNewUser ? (
            <PlansAndWallet
              setPlansAndWalletSlug={setPlansAndWalletSlug}
              plansAndWalletSlug={plansAndWalletSlug}
              mobileView={mobileView}
            />
          ) : (
            <h3 className="flex">
              <LeftOutlined
                onClick={() => setVisiblePlan(false)}
                className="back-icon mr-5"
              />
              Select subscription plan
            </h3>
          )}
          {plansAndWalletSlug ? (
            <>
              <div className="plan-details-container">
                <span>
                  Select a plan for your business starting as low as ₹27/day.
                </span>
                {mobileView && !mobilePlanFeatures ? (
                  <div className="plan-details-mobile-view">
                    {map(planDetails, (details) => {
                      return (
                        <>
                          <div className="duration-tag">
                            <span>
                              Billed{' '}
                              {get(details, 'plan_duration.duration_cycle', '')}
                            </span>
                          </div>
                          <Card
                            bordered={false}
                            className="mb-20"
                            key={get(details, 'slug', '')}
                            style={{
                              background:
                                mobileViewPaymentDetails.slug === details.slug
                                  ? '#0B3D60'
                                  : '#fff',
                              color:
                                mobileViewPaymentDetails.slug === details.slug
                                  ? '#fff'
                                  : '#000',
                            }}
                          >
                            <Row gutter={[24, 24]}>
                              <Col span={3}>
                                <Radio
                                  onChange={() =>
                                    setMobileViewPaymentDetails(details)
                                  }
                                  checked={
                                    mobileViewPaymentDetails.slug ===
                                    details.slug
                                  }
                                />
                              </Col>
                              <Col span={11} className="text-left">
                                <h3>{get(details, 'subscription_plan', '')}</h3>
                                <span>{get(details, 'plan_description')}</span>
                              </Col>
                              <Col span={10} className="text-right">
                                <div
                                  className="flex-end"
                                  style={{ alignItems: 'baseline' }}
                                >
                                  <h3>
                                    {CURRENCYSYMBOLS.INR}
                                    {get(details, 'plan_price', '')}
                                  </h3>
                                  <span>
                                    {' '}
                                    /
                                    {get(
                                      details,
                                      'plan_duration.duration_cycle',
                                      ''
                                    )}
                                  </span>
                                </div>
                              </Col>
                            </Row>
                            <Row className="text-left mt-10">
                              <Col span={3} />
                              <Col span={21}>
                                <p>Features</p>
                                <div className="plan-features-mobile">
                                  {map(
                                    get(details, 'plan_feature.features', ''),
                                    (features) => {
                                      return (
                                        features.access && (
                                          <p key={get(features, 'label', '')}>
                                            <CheckOutlined />
                                            <span className="ml-10">
                                              {get(features, 'label', '')}
                                            </span>
                                          </p>
                                        )
                                      );
                                    }
                                  )}
                                </div>
                              </Col>
                            </Row>
                          </Card>
                        </>
                      );
                    })}
                    {!hidePlanFeatures && (
                      <h4 onClick={showPlanFeatures} aria-hidden="true">
                        <PlusOutlined /> Show plan features
                      </h4>
                    )}
                    <Button
                      type="primary"
                      className="mt-20 w-100"
                      onClick={() => {
                        setMakePayment(true);
                        setMakePaymentDetails(mobileViewPaymentDetails);
                      }}
                      disabled={isEmpty(mobileViewPaymentDetails)}
                    >
                      Get Started
                    </Button>
                  </div>
                ) : (
                  mobilePlanFeatures &&
                  webPlanFeatures && (
                    <div className="plan-details-card">
                      <Row gutter={[16, 16]}>
                        {map(planDetails, (details) => {
                          return (
                            <Col span={8} key={get(details, 'slug', '')}>
                              <Card bordered>
                                <div className="duration-tag">
                                  <span>
                                    Billed{' '}
                                    {get(
                                      details,
                                      'plan_duration.duration_cycle',
                                      ''
                                    )}
                                  </span>
                                </div>
                                <h2>
                                  {get(
                                    details,
                                    'subscription_plan',
                                    ''
                                  ).toUpperCase()}
                                </h2>
                                <p>{get(details, 'plan_description', '')}</p>
                                <p>{get(details, 'plan_subscription', '')}</p>
                                <div className="plan-price">
                                  <h2>
                                    {CURRENCYSYMBOLS.INR}
                                    {(
                                      get(details, 'plan_price', '') /
                                      get(
                                        details,
                                        'plan_duration.duration_period',
                                        1
                                      )
                                    ).toFixed(2)}
                                  </h2>
                                  <span>&nbsp;/month</span>
                                </div>
                                <div className="plan-features">
                                  <h3>Features</h3>
                                  <div className="plan-features features-div">
                                    {map(
                                      get(details, 'plan_feature.features', ''),
                                      (features) => {
                                        return (
                                          features.access && (
                                            <p key={features.label}>
                                              <CheckOutlined />
                                              <span className="ml-10">
                                                {get(features, 'label', '')}
                                              </span>
                                            </p>
                                          )
                                        );
                                      }
                                    )}
                                  </div>
                                  {renderGetStartedButton(details)}
                                </div>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    </div>
                  )
                )}
              </div>
              <div className="plan-features-container">
                <div className="plan-features-heading text-center">
                  {!showFeatures && !mobileView && !hidePlanFeatures && (
                    <h4
                      onClick={() => setShowFeatures(true)}
                      aria-hidden="true"
                    >
                      <PlusOutlined /> Show Plan features
                    </h4>
                  )}
                  {showFeatures && !mobileView && (
                    <h4
                      onClick={() => setShowFeatures(false)}
                      aria-hidden="true"
                    >
                      <MinusOutlined /> Hide Plan features
                    </h4>
                  )}
                </div>
                {showFeatures && mobilePlanFeatures && (
                  <List
                    header={
                      <div>
                        {!mobileView && (
                          <Row>
                            <Col span={6} />
                            {renderFeaturesHeader()}
                          </Row>
                        )}
                        <Row className="features-heading">
                          <Col span={6}>
                            <span>Features</span>
                          </Col>
                          {mobileView && renderPlanDetails()}
                        </Row>
                      </div>
                    }
                    bordered={false}
                    dataSource={planFeatures}
                    renderItem={(item) => (
                      <List.Item style={{ display: 'block' }}>
                        <Row>
                          <Col span={6}>
                            <span>{get(item, 'featureName', '')}</span>
                          </Col>
                          <Col span={6} className="text-center">
                            {renderPlanAccess(item, 'basic')}
                          </Col>
                          <Col span={6} className="text-center">
                            {renderPlanAccess(item, 'advanced')}
                          </Col>
                          <Col span={6} className="text-center">
                            {renderPlanAccess(item, 'premium')}
                          </Col>
                        </Row>
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </>
          ) : (
            <Wallet />
          )}
        </>
      )}
    </Spin>
  );
}

export default SubscriptionPlanDetails;
