import { notification, Table } from 'antd';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import moment from 'moment';
import { DownloadOutlined } from '@ant-design/icons';
import { DATE_WITH_TIME_FORMAT } from '../../shared/constant-values';
import './subscription.less';
import { getPlanTransaction } from '../../utils/api/url-helper';
import { paginationstyler } from '../../shared/attributes-helper';

function SubscriptionTable() {
  const [userID] = useState(localStorage.getItem('userID'));
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [tableChange, setTableChange] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const getTransaction = () => {
    setLoading(true);
    const { pageSize, current } = pagination;
    const body = {
      user_id: userID,
      limit: pageSize,
      offset: current,
    };
    getPlanTransaction(body)
      .then((data) => {
        setTableData(get(data, 'data.rows', []));
        setPagination({
          total: get(data, 'data.count', []),
        });
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({ message: error.message });
      });
  };

  useEffect(() => {
    getTransaction();
  }, []);

  useEffect(() => {
    getTransaction();
  }, [tableChange]);

  useEffect(() => {
    paginationstyler();
  }, [tableData]);

  const handleTableChange = (paginationAlias) => {
    setPagination(paginationAlias);
    const { current } = paginationAlias;
    setTableChange(current);
    setLoading(true);
  };

  const column = [
    {
      title: 'Ref ID',
      dataIndex: 'plan_purchase_uid',
      key: 'plan_purchase_uid',
    },
    {
      title: 'Plan',
      key: 'subscription_plan.subscription_plan',
      dataIndex: 'subscription_plan.subscription_plan',
    },
    {
      title: 'Payment mode',
      key: 'purchase_mode',
      dataIndex: 'purchase_mode',
    },
    {
      title: 'Date & Time',
      dataIndex: 'creation_date',
      key: 'creation_date',
      render: (a) => <span>{moment(a).format(DATE_WITH_TIME_FORMAT)}</span>,
    },
    {
      title: 'Amount',
      key: 'pay_amount',
      dataIndex: 'pay_amount',
      render: (text) => (
        <span>
          <CurrencyFormatter value={text} type="INR" language="en-IN" />
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'end_date',
      render: (text) => {
        const isActive = moment() < moment(text);
        return (
          <span style={{ color: isActive ? '#23A26D' : '#F84141' }}>
            {isActive ? 'Active' : 'Expired'}
          </span>
        );
      },
    },
    {
      title: 'Action',
      key: '',
      dataIndex: '',
      render: () => (
        <span>
          <DownloadOutlined disabled />
        </span>
      ),
    },
  ];

  return (
    <Table
      className="subscription-table"
      columns={column}
      loading={loading}
      dataSource={tableData}
      onChange={handleTableChange}
      pagination={pagination}
    />
  );
}

export default SubscriptionTable;
