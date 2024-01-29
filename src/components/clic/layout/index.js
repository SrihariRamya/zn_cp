import React, { useState, useEffect, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import { get } from 'lodash';
import LogoPlaceHolder from '../../../assets/images/logo-placeholder.png';
import { TenantContext } from '../../context/tenant-context';
import { eventTrack } from '../../../shared/function-helper';
import ClicHeader from './clic-header';
import ClicMenu from './clic-menu';
import './clic-layout.less';

const { Sider, Content } = Layout;

function ClicLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [tenantDetails, defaultImageData, ,] = useContext(TenantContext);
  const [adminLogo, setAdminLogo] = useState('');

  useEffect(() => {
    const adminLogoImage =
      get(tenantDetails, 'setting.admin_logo', false) ||
      get(defaultImageData, 'admin_logo', '');
    setAdminLogo(adminLogoImage);
  }, [tenantDetails, defaultImageData]);

  const showHeader = !(
    location.pathname.includes('/appearance/') ||
    location.pathname.includes('/page-builder/')
  );

  useEffect(() => {
    if (
      location.pathname.includes('/appearance/') ||
      location.pathname.includes('/page-builder/')
    ) {
      setCollapsed(true);
    }
  }, [location.pathname]);

  const adminEvent = (events, text) => {
    setCollapsed(!collapsed);
    const parameters = {
      value: text,
    };
    eventTrack(events, parameters);
  };

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout
      className="notify-layout clic-layout"
      style={{ minHeight: '100vh' }}
    >
      <div>
        <Sider
          className="clic-sidebar"
          // eslint-disable-next-line unicorn/no-null
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          <div className={collapsed ? '' : 'collapsible-side-bar'}>
            <div className="logo">
              <img
                width="100%"
                className="adminLogo"
                src={get(adminLogo, '[0].url', adminLogo) || LogoPlaceHolder}
                onClick={() => adminEvent('admin_logo', 'Admin Logo')}
                aria-hidden="true"
                alt="logo"
              />
              {!collapsed && (
                <div className="text">{tenantDetails?.tenant_name}</div>
              )}
            </div>
            <ClicMenu handleCollapse={handleCollapse} />
          </div>
        </Sider>
      </div>
      <Layout
        className={
          collapsed
            ? 'site-layout collapsed-content-layout-pl'
            : 'site-layout collapse-content-layout-pl'
        }
      >
        {' '}
        {showHeader && (
          <ClicHeader collapsed={collapsed} handleCollapse={handleCollapse} />
        )}
        <Content className={`${showHeader && 'clic-page-content'}`}>
          <div className="content-layout-container">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
export default ClicLayout;
