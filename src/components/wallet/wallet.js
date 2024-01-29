import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Table, Tabs, Col, Row, Space, List } from 'antd';
import { get } from 'lodash';
import React, { useContext } from 'react';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import moment from 'moment';
import {
  WALLET_TAB_VALUES,
  AVAILABLE_BALANCE,
  DATE_WITH_TIME_FORMAT,
} from '../../shared/constant-values';
import { ReactComponent as AreditArrow } from '../../assets/icons/credit-arrow.svg';
import { ReactComponent as DebitArrow } from '../../assets/icons/debit-arrow.svg';
import WalletBalance from '../../assets/images/wallet-balance.svg';
import WalletBalancePlan from '../../assets/images/wallet-balance-plan.svg';
import { TenantContext } from '../context/tenant-context';

function Wallet(properties) {
  const {
    walletBalance,
    column,
    loading,
    tableData,
    handleTableChange,
    pagination,
    onRechargeModal,
    handleTab,
    activeTab,
    rowSelection,
    handleWalletDownload,
  } = properties;
  const mobileView = useContext(TenantContext)[4];
  const { TabPane } = Tabs;

  const handleActiveTab = (value) => {
    handleTab(value);
  };

  return (
    <div className="wallet-container">
      <div className="wallet-balance-container mt-10">
        <div>
          <img src={WalletBalance} alt="" />
        </div>
        <div className="wallet-balance-plan">
          <img src={WalletBalancePlan} alt="" />
        </div>
        <div className="balance-content">
          <Col>
            <Space direction="vertical">
              <Row>Wallet</Row>
              <Row>
                {AVAILABLE_BALANCE}:&nbsp;&nbsp;
                <CurrencyFormatter
                  value={walletBalance}
                  type="INR"
                  language="en-IN"
                />
              </Row>
            </Space>
          </Col>
        </div>
        <Button
          type="primary"
          block
          className="add-money-button"
          onClick={onRechargeModal}
        >
          <Space>
            <PlusOutlined /> Add Money
          </Space>
        </Button>
      </div>
      <Row justify="space-between">
        <Col>
          <Tabs
            activeKey={activeTab}
            onChange={handleActiveTab}
            className="methods-tabs"
          >
            {WALLET_TAB_VALUES.map((value) => (
              <TabPane tab={value} key={value} />
            ))}
          </Tabs>
        </Col>
        <Col>
          <Button type="primary" className="wallet-dwn-btn">
            <Space>
              <DownloadOutlined style={{ color: '#ffff' }} />
              Download
            </Space>
          </Button>
        </Col>
      </Row>
      {mobileView ? (
        <div className="wallet-mobile-view-container">
          <List
            dataSource={tableData}
            pagination={
              tableData?.length && {
                onChange: (current) => handleTableChange({ current }, ''),
                ...pagination,
              }
            }
            rowKey="id"
            renderItem={(data) => (
              <List.Item>
                <Row className="wallet-mobile-content">
                  <Col span={16}>
                    <Space direction="vertical" size={2}>
                      <Row>
                        <Space>
                          <span className="wallet-details">Txn ID:</span>
                          {get(data, 'id', '')}
                        </Space>
                      </Row>
                      <Row>
                        <Space>
                          <span className="wallet-details">
                            Payment method:
                          </span>
                          {get(data, 'payment_option.payment_channel', '')}
                        </Space>
                      </Row>
                      <Row>
                        {moment(get(data, 'creation_date', '')).format(
                          DATE_WITH_TIME_FORMAT
                        )}
                      </Row>
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Row justify="end">{handleWalletDownload()}</Row>
                    <Row className="mt-10">
                      <Space>
                        <CurrencyFormatter
                          value={get(data, 'transaction_amount', 0)}
                          type="INR"
                          language="en-IN"
                        />
                        {activeTab === 'Credit' ? (
                          <AreditArrow />
                        ) : (
                          <DebitArrow />
                        )}
                      </Space>
                    </Row>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </div>
      ) : (
        <div>
          <Table
            className="grid-table box"
            columns={column}
            loading={loading}
            dataSource={tableData}
            onChange={handleTableChange}
            pagination={pagination}
            rowSelection={rowSelection}
            rowKey="id"
          />
        </div>
      )}
    </div>
  );
}

export default Wallet;
