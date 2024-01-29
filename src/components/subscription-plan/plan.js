import React, { useContext } from 'react';
import { Button, Card, Row, Tabs, Col } from 'antd';
import { get, map } from 'lodash';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import './subscription.less';
import { TenantContext } from '../context/tenant-context';
import { CURRENCY_LANGUAGE, CURRENCY_TYPE } from '../../shared/constant-values';

const BillingPlan = (properties) => {
  const {
    handleOpenChange,
    onChange,
    period,
    selectedPeriod,
    selectedSubscription,
  } = properties;

  const { TabPane } = Tabs;

  const [tenantDetails] = useContext(TenantContext);
  const currency =
    get(tenantDetails, 'setting.currency', false) || CURRENCY_TYPE;
  const currencyLocale =
    get(tenantDetails, 'setting.currency_locale', false) || CURRENCY_LANGUAGE;

  return (
    <div className="plan-container">
      <Row className="period-tabs">
        <Tabs type="card" activeKey={selectedPeriod} onChange={onChange}>
          {period.map((item) => (
            <TabPane tab={item} key={item} />
          ))}
        </Tabs>
      </Row>
      &nbsp;
      <div className="subscription-details">
        <Row gutter={16}>
          {map(selectedSubscription, (value) => {
            return (
              <Col span={8} key={value?.id}>
                <Card
                  size="small"
                  key={value?.name}
                  title={
                    <>
                      <h4>Subscription Name</h4>
                      <h3>{value?.name}</h3>
                    </>
                  }
                >
                  <div>
                    <h4>Amount</h4>
                    <div className="subscription-amount">
                      {value?.base_price !== value?.price && (
                        <h4 className="base-price">
                          <CurrencyFormatter
                            value={value?.base_price}
                            type={currency}
                            language={currencyLocale}
                          />
                        </h4>
                      )}
                      &nbsp;
                      <h4 className="offer-price">
                        <CurrencyFormatter
                          value={value?.price}
                          type={currency}
                          language={currencyLocale}
                        />
                      </h4>
                    </div>
                  </div>
                  <div>
                    <h4>Description</h4>
                    <h4>{value?.description}</h4>
                  </div>
                  <div className="mt-10">
                    <Button
                      onClick={() => handleOpenChange(value)}
                      type="primary"
                      className="subscribe-btn"
                    >
                      Subscribe
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};

export default BillingPlan;
