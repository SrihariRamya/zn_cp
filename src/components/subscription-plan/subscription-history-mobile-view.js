import React, { useState, useEffect } from 'react';
import { Button, Card, notification, List, Spin } from 'antd';
import { get } from 'lodash';
import { LeftOutlined, DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getPlanTransaction } from '../../utils/api/url-helper';
import { CURRENCYSYMBOLS } from '../../shared/constant-values';

function SubscriptionHistoryMobileView(properties) {
  const { setVisiblePlan, setSubscriptionMobileView } = properties;
  const userID = localStorage.getItem('userID');
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [tableChange, setTableChange] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    setLoading(true);
    const { pageSize, current } = pagination;
    const payload = {
      user_id: userID,
      limit: pageSize,
      offset: current,
    };
    getPlanTransaction(payload)
      .then((resp) => {
        setTableData(get(resp, 'data.rows', []));
        setPagination({
          total: get(resp, 'data.count', []),
        });
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({ message: error.message });
      });
  }, [tableChange]);

  const handleTableChange = (paginationAlias) => {
    setPagination(paginationAlias);
    const { current } = paginationAlias;
    setTableChange(current);
    setLoading(true);
  };

  const backToPreviousPage = () => {
    setVisiblePlan(false);
    setSubscriptionMobileView(false);
  };

  return (
    <Spin spinning={loading}>
      <div className="flex-bwn">
        <h3 className="flex">
          <LeftOutlined onClick={backToPreviousPage} />
          Subscription History
        </h3>
        <Button icon={<DownloadOutlined />} type="primary">
          Download
        </Button>
      </div>
      <div className="plans-container p-0">
        <List
          pagination={{
            position: 'bottom',
            align: 'center',
            onChange: handleTableChange,
            pageSize: 3,
          }}
          dataSource={tableData}
          renderItem={(data) => {
            const isPlanActive = get(data, 'is_active', '') === 1;
            return (
              <List.Item>
                <Card
                  bordered={false}
                  className="subscription-card w-100 mt-20"
                >
                  <div className="flex-bwn plan-details">
                    <h3>
                      {get(data, 'subscription_plan.subscription_plan', '')}
                    </h3>
                    <span
                      className={`plan-status ${
                        isPlanActive ? 'plan-active' : 'plan-expired'
                      }`}
                    >
                      {isPlanActive ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  <div className="subscription-details">
                    <p>
                      <span>
                        {CURRENCYSYMBOLS.INR}
                        {get(data, 'pay_amount', '')}
                      </span>
                    </p>
                    <p>
                      <span>
                        Purchased date:{' '}
                        {moment(get(data, 'creation_date', '')).format(
                          'DD/MM/YY, hh:mm a'
                        )}
                      </span>
                    </p>
                    <p>Payment method: {get(data, 'purchase_mode', '')}</p>
                    <p>Ref ID: {get(data, 'plan_purchase_uid', '')}</p>
                    <div className="text-center">
                      <Button className="download-invoice-btn">
                        Download Invoice
                      </Button>
                    </div>
                  </div>
                </Card>
              </List.Item>
            );
          }}
        />
      </div>
    </Spin>
  );
}
export default SubscriptionHistoryMobileView;
