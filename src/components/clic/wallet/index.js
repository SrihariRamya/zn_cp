import { Breadcrumb, Button, Col, Collapse, Table } from 'antd';
import { get } from 'lodash';
import React, { useContext } from 'react';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import {
  CURRENCY_TYPE,
  CURRENCY_LANGUAGE,
  WALLET_TAB_VALUES,
  WALLET_MANAGEMENT_TIITLE,
} from '../../../shared/constant-values';
import { TenantContext } from '../../context/tenant-context';
import { ReactComponent as WalletIcon } from '../../../assets/icons/clic/noun-wallet.svg';
import '../../wallet/wallet.less';

const { Panel } = Collapse;

const Wallet = (properties) => {
  const {
    walletBalance,
    column,
    tableData,
    handleTableChange,
    pagination,
    onRechargeModal,
    handleTab,
    activeTab,
  } = properties;

  const [tenantDetails] = useContext(TenantContext);
  const currency =
    get(tenantDetails, 'setting.currency', false) || CURRENCY_TYPE;
  const currencyLocale =
    get(tenantDetails, 'setting.currency_locale', false) || CURRENCY_LANGUAGE;

  const handleActiveTab = (value) => {
    handleTab(value);
  };

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>{WALLET_MANAGEMENT_TIITLE}</Breadcrumb.Item>
      </Breadcrumb>
      <div className="clic-wallet-container">
        <div className="available-balance-container">
          <Col style={{ padding: '8px 32px 8px 8px' }}>
            <div className="available-balance-text">Available Balance</div>
          </Col>
          <Col style={{ padding: '8px 16px 8px 8px' }}>
            <div className="value-text">
              <CurrencyFormatter
                value={walletBalance}
                type={currency}
                language={currencyLocale}
              />
            </div>
          </Col>
          <Col>
            <WalletIcon />
          </Col>
        </div>
        <Button
          className="top-up-button"
          onClick={onRechargeModal}
          type="primary"
        >
          Topup
        </Button>
      </div>
      <div className="mt-20">
        <div className="billing-history">
          <Collapse
            accordion
            expandIconPosition="right"
            activeKey={activeTab}
            onChange={handleActiveTab}
          >
            {WALLET_TAB_VALUES.map((value) => (
              <Panel header={`Wallet ${value} Details`} key={value}>
                <Table
                  columns={column}
                  dataSource={tableData}
                  onChange={handleTableChange}
                  pagination={pagination}
                />
              </Panel>
            ))}
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
