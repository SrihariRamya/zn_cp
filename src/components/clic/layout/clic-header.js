import React, { useContext } from 'react';
import { LeftOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu, Dropdown, Tag, Switch, Button, Space } from 'antd';
import { get } from 'lodash';
import { Link, useNavigate } from 'react-router-dom';
import { ReactComponent as CheckIcon } from '../../../assets/icons/clic/clic-awesome-moon.svg';
import { ReactComponent as UnCheckIcon } from '../../../assets/icons/clic/clic-ionic-ios-sunny.svg';
import { ReactComponent as VisitMySite } from '../../../assets/icons/clic/visit-my-site.svg';
import Log from '../../../assets/log.svg';
import { TenantContext } from '../../context/tenant-context';

const { Header } = Layout;

function ClicHeader(properties) {
  const { collapsed, handleCollapse } = properties;
  const [tenantDetails] = useContext(TenantContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const helperFunction = () => (
    <Menu.Item>
      <Link to="/" onClick={handleLogout}>
        <Space size={33}>
          <span className="text-grey-light">Logout</span>
          <span>
            <img src={Log} alt="logout" />
          </span>
        </Space>
      </Link>
    </Menu.Item>
  );

  return (
    <Header
      className="site-layout-background clic-top-header content-layout-container"
      style={{ width: `calc(100% - ${collapsed ? '80px' : '200px'})` }}
    >
      <div className="flex-bwn header-container">
        <div>
          <span className="header-back">
            <Button
              type="primary"
              onClick={handleCollapse}
              icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
            />
          </span>
        </div>
        <div className="flex-bwn mr-10">
          <div className="dark-mode-container" style={{ display: 'none' }}>
            <Switch
              disabled
              checkedChildren={<CheckIcon />}
              unCheckedChildren={<UnCheckIcon />}
            />
          </div>
          <div>
            <Button
              type="primary"
              className="visit-my-site-btn book-demo-btn"
              onClick={() =>
                window.open(
                  'https://calendly.com/demo-dashcx/1hour',
                  '_blank',
                  'noopener'
                )
              }
            >
              Book Your Demo
            </Button>
            <Button
              type="primary"
              icon={<VisitMySite />}
              className="visit-my-site-btn"
              onClick={() =>
                window.open(get(tenantDetails, 'customer_url'), '_blank')
              }
            >
              Visit My Site
            </Button>
            <Tag className="profile-icon">
              <Dropdown
                trigger="click"
                overlay={
                  <Menu
                    style={{
                      borderStyle: 'groove',
                      borderRadius: '8px',
                    }}
                  >
                    {helperFunction()}
                  </Menu>
                }
                arrow
              >
                <span>
                  <UserOutlined />
                </span>
              </Dropdown>
            </Tag>
          </div>
        </div>
      </div>
    </Header>
  );
}
export default ClicHeader;
