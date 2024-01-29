import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spin, Tabs, Breadcrumb, Space, notification } from 'antd';
import { get, filter } from 'lodash';
import { FileExcelOutlined } from '@ant-design/icons';
import axios from 'axios';
import Account from './account';
import Message from './message';
import Compose from './compose';
import { FAILED_TO_LOAD, TENANT_MODE_CLIC } from '../../shared/constant-values';
import { TenantContext } from '../context/tenant-context';

const { TabPane } = Tabs;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function WhatsApp() {
  const [loading, setLoading] = useState(false);
  const [tenantDetails] = useContext(TenantContext);
  const [activeTab, setActiveTab] = useState('account');
  const [account, setAccount] = useState([]);
  const [filteredAccount, setFilteredAccount] = useState([]);
  const tenantUid = localStorage.getItem('tenantUid');
  const isclicTenantMode =
    get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC;
  const query = useQuery();
  const currentPage = query.get('page');
  const history = useNavigate();

  const fetchData = () => {
    if (currentPage) {
      setActiveTab(currentPage);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchAccountNumber = () => {
    setLoading(true);
    const whatsAppApiUrl = get(tenantDetails, 'WhatsAppAPI', '');
    if (whatsAppApiUrl) {
      axios
        .get(`${whatsAppApiUrl}/users/get-all-accounts`, {
          params: { reference_id: tenantUid },
        })
        .then((responseData) => {
          const data = get(responseData, 'data.data', []);
          if (data.length > 0) {
            setAccount(data);
            const filteredData = filter(data, ['is_logged', 1], []);
            setFilteredAccount(filteredData);
            setLoading(false);
          } else {
            setFilteredAccount([]);
            setAccount([]);
            setLoading(false);
          }
        })
        .catch((error) => {
          notification.error({
            message: get(error, 'response.data.message', FAILED_TO_LOAD),
          });
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchAccountNumber();
  }, [tenantDetails]);

  const handleActiveTab = (event) => {
    setActiveTab(event);
    const parameters = new URLSearchParams();
    parameters.append('page', event);

    history({
      pathname: '/whatsapp',
      search: parameters.toString(),
    });
  };
  const handleRefresh = () => {
    fetchAccountNumber();
  };

  return (
    <Spin spinning={false}>
      <div className="search-container">
        <div>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <FileExcelOutlined />
                WhatsApp
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div />
      </div>
      <div
        style={{ padding: '0px 10px' }}
        className={isclicTenantMode && 'whatsapp-status-tab-container'}
      >
        <Tabs
          type="card"
          activeKey={activeTab}
          onChange={handleActiveTab}
          className="theme-tabs"
        >
          <TabPane tab="Account" key="account">
            <Account
              account={account}
              accountLoading={loading}
              handleRefresh={handleRefresh}
            />
          </TabPane>
          <TabPane tab="Messages " key="messages">
            <Message account={account} />
          </TabPane>
          <TabPane tab="Compose " key="compose">
            <Compose account={filteredAccount} handleRefresh={handleRefresh} />
          </TabPane>
        </Tabs>
      </div>
    </Spin>
  );
}

export default WhatsApp;
