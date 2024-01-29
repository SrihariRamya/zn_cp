import { Tabs } from 'antd';
import React, { useState } from 'react';
import Collections from './collections/index';
import MenuTheme from './navigation/menu-theme';
import Navigation from './navigation/navigations';

const Menu = () => {
  const [activeTab, setActiveTab] = useState('navigation');
  const handleActiveTab = (event) => {
    setActiveTab(event);
  };
  return (
    <div style={{ margin: '5px' }} className="navigation-tab">
      <Tabs
        type="card"
        activeKey={activeTab}
        onChange={handleActiveTab}
        className="theme-tabs"
      >
        <Tabs.TabPane tab="Collections" key="collection">
          {activeTab === 'collection' && <Collections />}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Menu" key="navigation">
          {activeTab === 'navigation' && <Navigation />}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Menu Theme" key="menuTheme">
          {activeTab === 'menuTheme' && <MenuTheme />}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Menu;
