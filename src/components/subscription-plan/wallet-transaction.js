/* eslint-disable camelcase */
import { EyeOutlined } from '@ant-design/icons';
import { notification, Table, Popover } from 'antd';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { userPaymentTransactionDetails } from '../../utils/api/url-helper';
import {
  DATE_WITH_TIME_FORMAT,
  FAILED_TO_LOAD,
} from '../../shared/constant-values';
import { paginationstyler } from '../../shared/attributes-helper';

const WalletTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [tablechange, setTableChange] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [userID] = useState(localStorage.getItem('userID'));
  const [paymentDetails, setPaymentDetails] = useState({});

  const fetchData = () => {
    setLoading(true);
    const { pageSize, current } = pagination;
    const body = {
      user_id: userID,
      limit: pageSize,
      offset: current,
      sort: 'desc',
      type: 'debited',
    };
    userPaymentTransactionDetails(body)
      .then((data) => {
        setTableData(get(data, 'data.rows', []));
        setPagination({
          total: get(data, 'data.count', []),
        });
        setLoading(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tablechange]);

  useEffect(() => {
    paginationstyler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);

  const content = (
    <div className="wallet-pop-over">
      <p className="mt-10">
        Payment Channel :
        {get(paymentDetails, 'payment_option.payment_channel', '')}
      </p>
      <p className="mt-10">Status : {paymentDetails.transaction_status}</p>
    </div>
  );

  const column = [
    {
      title: 'Transaction Id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Transaction status',
      key: 'transaction_status',
      dataIndex: 'transaction_status',
    },
    {
      title: 'Payment mode',
      key: 'payment_option.payment_channel',
      dataIndex: 'payment_option.payment_channel',
    },
    {
      title: 'Transaction reason',
      key: 'transaction_reason',
      dataIndex: 'transaction_reason',
    },
    {
      title: 'Amount',
      key: 'transaction_amount',
      dataIndex: 'transaction_amount',
      render: (text) => (
        <span>
          <CurrencyFormatter value={text} type="INR" language="en-IN" />
        </span>
      ),
    },
    {
      title: 'Date',
      key: 'creation_date',
      dataIndex: 'creation_date',
      render: (a) => (
        <span className="text-grey-light">
          {moment(a).format(DATE_WITH_TIME_FORMAT)}
        </span>
      ),
    },
    {
      title: 'Action',
      align: 'center',
      render: (record) => (
        <span className="edit-box">
          <Popover
            content={content}
            placement="left"
            title="Payment Details"
            trigger="hover"
          >
            <EyeOutlined
              style={{ color: '#08c' }}
              onMouseOver={() => setPaymentDetails(record)}
            />
          </Popover>
        </span>
      ),
    },
  ];

  const handleTableChange = (paginationAlias) => {
    setPagination(paginationAlias);
    const { current } = paginationAlias;
    setTableChange(current);
    setLoading(true);
  };

  return (
    <Table
      className="grid-table box"
      columns={column}
      loading={loading}
      dataSource={tableData}
      onChange={handleTableChange}
      pagination={pagination}
      showSizeChanger={false}
    />
  );
};

export default WalletTransaction;
