import React, { useContext, useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { get } from 'lodash';
import PaymentsList from '../payments';
import Shipment from '../shipment';
import SettingsMobileHeading from '../setting-mobile-heading';
import Analytics from '../analytics';
import { MilestoneContext } from '../../context/milestone-context';

function Integration(properties) {
  const { fetchTourData } = useContext(MilestoneContext);
  const { mobileView, setScreenState } = properties;
  const [activeTab, setActiveTab] = useState();
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  const fetchData = async () => {
    const tourDataValues = await fetchTourData();
    const tourData = get(tourDataValues, 'data.[4]');
    const shipmentTour = get(tourData, 'subGuide.[0]');
    const paymentTour = get(tourData, 'subGuide.[1]');
    const isOneShipmentCreated = get(shipmentTour, 'completed', false);
    const isOnePaymentCreated = get(paymentTour, 'completed', false);
    if (isOneShipmentCreated === false && !mobileView) {
      setActiveTab('shipment');
    } else if (isOnePaymentCreated === false && !mobileView) {
      setActiveTab('payments');
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {mobileView && (
        <SettingsMobileHeading
          heading="Integration"
          Tooltip="false"
          setScreenState={setScreenState}
        />
      )}
      <Tabs
        className="custom-settings-tab"
        defaultActiveKey="integration"
        onChange={handleTabChange}
        activeKey={activeTab}
      >
        <Tabs.TabPane key="payments" tab="Payments">
          <PaymentsList mobileView={mobileView} />
        </Tabs.TabPane>
        <Tabs.TabPane key="shipment" tab="Shipment">
          <Shipment mobileView={mobileView} />
        </Tabs.TabPane>
        <Tabs.TabPane key="analytics" tab="Analytics">
          <Analytics mobileView={mobileView} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default Integration;
