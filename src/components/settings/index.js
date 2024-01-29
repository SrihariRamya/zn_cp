import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Breadcrumb, Tabs, Button, Space } from 'antd';
import { SettingFilled } from '@ant-design/icons';
import { get, set } from 'lodash';
import Documentaions from './documentations/index';
import Appfeature from './app-feature';
import FooterManagement from './footer-management';
import DeliveryCharges from './deliveryCharges/delivery-charges';
import { eventTrack } from '../../shared/function-helper';
import DeliverySlot from './delivery-slot';
import { TenantContext } from '../context/tenant-context';
import {
  SETTINGS_BREAD_TITLE,
  TENANT_MODE_CLIC,
  TENANT_MODE_NORMAL,
} from '../../shared/constant-values';
import Profile from './profile';
import SettingsMobile from './settings-mobile';
import Integration from './integration/index';

const { TabPane } = Tabs;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const adminEvent = (events, text) => {
  const parameters = {
    value: text,
  };
  eventTrack(events, parameters);
};

function Settings(properties) {
  const navigate = useNavigate();
  const mobileView = useContext(TenantContext)[4];
  const bannerReference = useRef();
  const [activeTab, setActiveTab] = useState('profile');
  const [showContainer, setShowContainer] = useState(false);
  const [tenantDetails] = useContext(TenantContext);
  const clicTenantMode =
    get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC;

  const query = useQuery();
  const currentPage = query.get('page');
  const fetchData = () => {
    if (currentPage) {
      setActiveTab(currentPage);
    } else
      setActiveTab(get(properties, 'location.aboutProps.value', 'profile'));
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  useEffect(() => {
    if (activeTab === 'Profile') {
      adminEvent('Profile');
    }
  }, []);

  const handleActiveTab = (event) => {
    if (event === 'Profile') {
      adminEvent('Profile');
    }
    set(properties, 'location.aboutProps.value', '');
    setActiveTab(event);
    const parameters = new URLSearchParams();
    parameters.append('page', event);

    navigate({
      pathname: '/settings',
      search: parameters.toString(),
    });
  };

  const showContent = (value) => {
    setShowContainer(value);
  };

  const tabButton = () => {
    if (activeTab === 'banner') {
      return showContainer ? (
        <Space>
          <Button
            type="primary"
            onClick={() => bannerReference.current.handleSubmit()}
          >
            save
          </Button>
          <Button
            className="cancel-btn"
            onClick={() => bannerReference.current.onCancel()}
          >
            Cancel
          </Button>
        </Space>
      ) : (
        ''
      );
    }
    return '';
  };

  return (
    <div>
      <div className={clicTenantMode && 'clic-settings-container'}>
        <div className={!clicTenantMode && 'settings-head'}>
          <Breadcrumb className="box-heading-text">
            <Breadcrumb.Item>
              <Space>
                {get(tenantDetails, 'tenant_mode', '') ===
                  TENANT_MODE_NORMAL && <SettingFilled />}
                {SETTINGS_BREAD_TITLE}
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        {mobileView ? (
          <SettingsMobile
            properties={properties}
            adminEvent={adminEvent}
            navigate={navigate}
            mobileView={mobileView}
          />
        ) : (
          <div className={clicTenantMode && 'settings-tab-container'}>
            <Tabs
              type="card"
              activeKey={activeTab}
              onChange={handleActiveTab}
              className="theme-tabs-settings"
              tabBarExtraContent={tabButton()}
              destroyInactiveTabPane
            >
              <TabPane tab="Profile" key="profile">
                <Profile />
              </TabPane>
              {get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC && (
                <>
                  <TabPane tab="Footer Management" key="footer">
                    <FooterManagement {...properties} />
                  </TabPane>
                  <TabPane tab="Pages" key="documentations">
                    <Documentaions mobileView={mobileView} />
                  </TabPane>
                </>
              )}
              {get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL && (
                <>
                  <TabPane tab="Delivery Charges" key="charges">
                    <DeliveryCharges mobileView={mobileView} />
                  </TabPane>
                  <TabPane tab="Delivery Slots" key="slots">
                    <DeliverySlot mobileView={mobileView} />
                  </TabPane>
                  <TabPane tab="Pages" key="documentations">
                    <Documentaions mobileView={mobileView} />
                  </TabPane>
                  <TabPane tab="Store Feature" key="App-Feature">
                    <Appfeature showContent={showContent} />
                  </TabPane>
                  <TabPane tab="Footer Management" key="footer">
                    <FooterManagement {...properties} />
                  </TabPane>
                  <TabPane tab="Integration" key="integration">
                    <Integration mobileView={mobileView} />
                  </TabPane>
                  {/* unused tab so temporarily commented */}
                  {/* <TabPane tab="Notification" key="Notification">
                  <Notifications />
                </TabPane> */}
                </>
              )}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
