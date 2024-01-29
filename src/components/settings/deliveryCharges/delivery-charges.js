import React, { useState } from 'react';
import { Card, Spin, Tabs } from 'antd';
import Create from './add-delivery-charge';
import AddChargeByCartPrice from './chargeByCartPrice/charge-by-cart-price';
import AddChargeByWeight from './chargeByWeight/charge-by-weight';
import { ReactComponent as CartActive } from '../../../assets/icons/cart-active.svg';
import { ReactComponent as CartInactive } from '../../../assets/icons/cart-inactive.svg';
import { ReactComponent as LocationActive } from '../../../assets/icons/location-active.svg';
import { ReactComponent as LocationInactive } from '../../../assets/icons/location-inactive.svg';
import { ReactComponent as WeightActive } from '../../../assets/icons/weight-active.svg';
import { ReactComponent as WeightInactive } from '../../../assets/icons/weight-inactive.svg';
import SettingsMobileHeading from '../setting-mobile-heading';

function DeliveryCharges(properties) {
  const { mobileView, setScreenState } = properties;
  const [activeTab, setActiveTab] = useState('cart');

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <Spin spinning={false} tip="Loading">
      <div className="delivery-charge-mob">
        <div className="box-heading-text scrolling-text">
          Delivery Charges will be set to Default currency selected in Store
          feature
        </div>
        <Card className="delivery-charge-card">
          {mobileView && (
            <SettingsMobileHeading
              heading="Delivery charge"
              Tooltip="true"
              setScreenState={setScreenState}
            />
          )}
          <Tabs
            className="custom-settings-tab"
            activeKey={activeTab}
            onChange={handleTabChange}
          >
            <Tabs.TabPane
              key="cart"
              tab={
                <span className="icon-span">
                  {activeTab === 'cart' ? (
                    <CartActive className="icon-styles" />
                  ) : (
                    <CartInactive className="icon-styles" />
                  )}
                  <p className="charges-heading">By Cart Price</p>
                </span>
              }
            >
              <AddChargeByCartPrice mobileView={mobileView} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <span className="icon-span">
                  {activeTab === 'location' ? (
                    <LocationActive className="icon-styles" />
                  ) : (
                    <LocationInactive className="icon-styles" />
                  )}
                  <p className="charges-heading">By Location</p>
                </span>
              }
              key="location"
            >
              <Create mobileView={mobileView} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <span className="icon-span">
                  {activeTab === 'weight' ? (
                    <WeightActive className="icon-styles" />
                  ) : (
                    <WeightInactive className="icon-styles" />
                  )}
                  <p className="charges-heading">By Weight (in Kg)</p>
                </span>
              }
              key="weight"
            >
              <AddChargeByWeight mobileView={mobileView} />
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </div>
    </Spin>
  );
}

export default DeliveryCharges;
