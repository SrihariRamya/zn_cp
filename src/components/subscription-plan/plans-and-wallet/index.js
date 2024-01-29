import React from 'react';
import { Button, Space, Tabs } from 'antd';

function PlansAndWallet(properties) {
  const { plansAndWalletSlug, setPlansAndWalletSlug, mobileView } = properties;
  const methodTitle = [
    {
      key: '1',
      label: 'Plans',
    },
    {
      key: '2',
      label: 'Wallet',
    },
  ];

  const handleByMethod = () => {
    setPlansAndWalletSlug(!plansAndWalletSlug);
  };

  return (
    <div>
      <div className="plan-wallet-container">
        {mobileView ? (
          <Tabs
            defaultActiveKey="1"
            items={methodTitle}
            onTabClick={handleByMethod}
          />
        ) : (
          <Space>
            <Button
              type="primary"
              className={`plans-wallet-btn ${
                plansAndWalletSlug && 'active-btn'
              }`}
              onClick={handleByMethod}
            >
              Plans
            </Button>
            <Button
              type="primary"
              className={`plans-wallet-btn ${
                !plansAndWalletSlug && 'active-btn'
              }`}
              onClick={handleByMethod}
            >
              Wallet
            </Button>
          </Space>
        )}
      </div>
    </div>
  );
}

export default PlansAndWallet;
