import React, { useState } from 'react';
import { Breadcrumb, Spin, Tabs, Button, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { ReactComponent as User } from '../../assets/icons/user.svg';
import UserProfile from './user-profile';

const { TabPane } = Tabs;

const UserProfileTab = () => {
  const [activeTab, setActiveTab] = useState('user-profile');
  const [loading, setLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const handleActiveTab = (event) => {
    setActiveTab(event);
  };

  const readOnlyMode = () => {
    setReadOnly(false);
    setShowButton(!showButton);
  };

  const editProfile = () => {
    setLoading(true);
    setTimeout(() => {
      setReadOnly(true);
      setShowButton(!showButton);
      setLoading(false);
    }, 1000);
  };

  const operations = (
    <div>
      {!showButton && (
        <Button type="primary" icon={<EditOutlined />} onClick={editProfile}>
          Edit profile
        </Button>
      )}
    </div>
  );

  const tabButton = () => {
    if (activeTab === 'user-profile') {
      return operations;
    }
    return null;
  };

  return (
    <Spin spinning={loading}>
      <div className="search-container">
        <div>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <User />
                User Profile
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      <div style={{ padding: '0px 10px 10px' }}>
        <Tabs
          type="card"
          activeKey={activeTab}
          onChange={handleActiveTab}
          className="theme-tabs"
          destroyInactiveTabPane
          tabBarExtraContent={tabButton()}
        >
          <TabPane tab="Profile" key="user-profile">
            <UserProfile
              readOnly={readOnly}
              showButton={showButton}
              readOnlyMode={readOnlyMode}
            />
          </TabPane>
        </Tabs>
      </div>
    </Spin>
  );
};

export default UserProfileTab;
