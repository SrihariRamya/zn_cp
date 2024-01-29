import { DownloadOutlined } from '@ant-design/icons';
import { notification, Popover, Space, Spin } from 'antd';
import { get } from 'lodash';
import React, { useEffect, useState, useContext } from 'react';
import './wallet.less';
import moment from 'moment';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import WalletModal from './wallet-modal';
import {
  userPaymentTransactionDetails,
  userWalletBalance,
} from '../../utils/api/url-helper';
import {
  DATE_WITH_TIME_FORMAT,
  WALLET_CREDIT,
  WALLET_DEBIT,
  FAILED_TO_LOAD,
  FAILED_TO_LOAD_WALLET,
  TENANT_MODE_CLIC,
  TENANT_MODE_NORMAL,
  ORDER_BY_DESC,
  INITIAL_PAGE,
  PAGE_LIMIT,
} from '../../shared/constant-values';
import { paginationstyler } from '../../shared/attributes-helper';
import { TenantContext } from '../context/tenant-context';
import ClicWallet from '../clic/wallet';
import Wallet from './wallet';
import { ReactComponent as PdfDownload } from '../../assets/icons/pdf.svg';

function WalletCharge() {
  const [tenantDetails] = useContext(TenantContext);
  const [isModal, setIsModal] = useState(false);
  const [loading, setloading] = useState(false);
  const [activeTab, setActiveTab] = useState('Credit');
  const [tableData, setTableData] = useState([]);
  const [walletBalance, setWalletBalance] = useState('');
  const [tablechange, setTableChange] = useState({});
  const [pagination, setPagination] = useState({
    current: INITIAL_PAGE,
    pageSize: PAGE_LIMIT,
  });
  const [tenantUid] = useState(localStorage.getItem('tenantUid'));
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const fetchAvailableBalance = () => {
    const WalletBody = { user_id: tenantUid };
    userWalletBalance(WalletBody)
      .then((data) => {
        if (data.success) {
          setWalletBalance(get(data, 'data.wallet_balance', []));
        }
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD_WALLET });
      });
  };

  const fetchData = async () => {
    setloading(true);
    const { pageSize, current } = pagination;
    const body = {
      user_id: tenantUid,
      limit: pageSize,
      offset: current,
      sort: ORDER_BY_DESC,
      type: activeTab === WALLET_CREDIT ? 'credited' : 'debited',
    };
    await userPaymentTransactionDetails(body)
      .then((data) => {
        setTableData(get(data, 'data.rows', []));
        setPagination({
          total: get(data, 'data.count', []),
        });
        fetchAvailableBalance();
        setloading(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
        setloading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, tablechange]);

  useEffect(() => {
    fetchAvailableBalance();
  }, []);

  const onRechargeModal = () => {
    setIsModal(true);
  };

  useEffect(() => {
    paginationstyler();
  }, [tableData]);

  const content = (
    <div className="wallet-pop-over">
      <Space>
        <PdfDownload /> Download PDF
      </Space>
    </div>
  );

  const handleWalletDownload = () => {
    return (
      <Popover content={content} placement="top" trigger="hover">
        <DownloadOutlined />
      </Popover>
    );
  };

  const column = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Transaction status',
      dataIndex: 'transaction_status',
      key: 'transaction_status',
    },
    {
      title: 'Payment mode',
      dataIndex: 'payment_option.payment_channel',
      key: 'payment_option.payment_channel',
    },
    {
      title: 'Date & Time',
      dataIndex: 'creation_date',
      key: 'creation_date',
      render: (a) => <span>{moment(a).format(DATE_WITH_TIME_FORMAT)}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'transaction_amount',
      key: 'transaction_amount',
      render: (text) => (
        <span>
          <CurrencyFormatter value={text} type="INR" language="en-IN" />
        </span>
      ),
    },
    {
      title: 'Action',
      align: 'center',
      render: () => <span className="edit-box"> {handleWalletDownload()}</span>,
    },
  ];

  const handleTab = (event) => {
    setPagination({ current: INITIAL_PAGE, pageSize: PAGE_LIMIT });
    setActiveTab(event);
    setloading(true);
  };

  const handleTableChange = (paginationAlias) => {
    setPagination(paginationAlias);
    const { current } = paginationAlias;
    setTableChange(current);
    setloading(true);
  };

  if (activeTab === WALLET_DEBIT) {
    const reasonColumn = {
      title: 'Transaction reason',
      dataIndex: 'transaction_reason',
      key: 'transaction_reason',
    };
    column.splice(3, 0, reasonColumn);
  }

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <Spin spinning={loading}>
      <div className="wallet-main-container">
        {get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC && (
          <ClicWallet
            walletBalance={walletBalance}
            column={column}
            tableData={tableData}
            handleTableChange={handleTableChange}
            pagination={pagination}
            onRechargeModal={onRechargeModal}
            handleTab={handleTab}
            activeTab={activeTab}
          />
        )}
        {get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL && (
          <Wallet
            walletBalance={walletBalance}
            column={column}
            tableData={tableData}
            handleTableChange={handleTableChange}
            pagination={pagination}
            onRechargeModal={onRechargeModal}
            handleTab={handleTab}
            activeTab={activeTab}
            rowSelection={rowSelection}
            handleWalletDownload={handleWalletDownload}
          />
        )}
        {isModal && (
          <WalletModal
            isModal={isModal}
            setIsModal={setIsModal}
            fetchData={fetchData}
          />
        )}
      </div>
    </Spin>
  );
}

export default WalletCharge;
