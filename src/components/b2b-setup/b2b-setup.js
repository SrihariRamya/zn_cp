import React from 'react';
import { Breadcrumb, Space, Spin, Tabs } from 'antd';
import { SettingFilled } from '@ant-design/icons';
import MinimumValue from './minimum-value';
import './b2b-setup.less';

const B2BSetup = () => {
  return (
    <Spin spinning={false}>
      <div className="search-container">
        <div>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <SettingFilled />
                B2B Setup
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      <div>
        <Tabs className="theme-tabs" defaultActiveKey="1">
          <Tabs.TabPane tab="Checkout Condition" key="1">
            <MinimumValue />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Spin>
  );
};

export default B2BSetup;
