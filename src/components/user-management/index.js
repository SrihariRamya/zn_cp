import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spin, Tabs } from 'antd';
import { get } from 'lodash';
import UserLayout from './user-layout';
import RoleAccess from './roles-access';

const { TabPane } = Tabs;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Users = (properties) => {
  const [loading] = useState(false);
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('users');
  const [roleInfo] = useState(localStorage.getItem('roleName'));
  const query = useQuery();
  const currentPage = query.get('page');

  const fetchData = () => {
    if (currentPage) {
      setActiveTab(currentPage);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleActiveTab = (event) => {
    setActiveTab(event);
    const parameters = new URLSearchParams();
    parameters.append('page', event);
    navigate({
      pathname: '/users',
      search: parameters.toString(),
    });
  };

  return (
    <Spin spinning={loading}>
      <div className="search-container">
        <div />
      </div>
      <div className="users-header-tab">
        <Tabs
          type="card"
          activeKey={activeTab}
          onChange={handleActiveTab}
          className="theme-tabs"
          // className="theme-radio"
        >
          <TabPane tab="Users" key="users">
            <UserLayout properties={properties} />
          </TabPane>
          {roleInfo === 'tenant_admin' ? (
            <TabPane tab="Roles" key="roles">
              <RoleAccess properties={properties} />
            </TabPane>
          ) : null}
        </Tabs>
      </div>
    </Spin>
  );
};

export default Users;
