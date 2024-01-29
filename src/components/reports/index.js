import React, { useState, useEffect, useContext } from 'react';
import { Spin, Breadcrumb, Space } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import { get } from 'lodash';
import { TenantContext } from '../context/tenant-context';
import './report.less';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [tenantDetails] = useContext(TenantContext);
  const tenantUid = localStorage.getItem('tenantUid');
  const reportApiUrl = get(
    tenantDetails,
    'report_url',
    'https://dev-reports.zupain.com/'
  );
  useEffect(() => {
    if (tenantDetails) {
      setLoading(false);
    }
  }, [tenantDetails]);
  return (
    <>
      <Spin spinning={loading}>
        <div className="search-container">
          <div>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Space>
                  <FileExcelOutlined />
                  Reports
                </Space>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div />
        </div>
        <div style={{ padding: '0px 10px' }}>
          <iframe
            className="iframe-kl-N"
            src={`${reportApiUrl}${tenantUid}`}
            title="Reports"
          />
        </div>
      </Spin>
    </>
  );
};

export default Reports;
