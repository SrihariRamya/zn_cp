import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useParams } from 'react-router-dom';
import EditorComponent from './components/editor-component';
import ComponentContextProvider from './context/components/component-context-provider';
import './index.less';
import { ReactComponent as Insert } from './Icon/insert.svg';
import { ReactComponent as Page } from './Icon/page.svg';
import { ReactComponent as Theme } from './Icon/theme.svg';
import { ReactComponent as Seo } from './Icon/seo.svg';
import Templates from './template/template';

const { Sider, Content } = Layout;

const menuItems = [
  { key: 'insert', icon: <Insert />, text: 'Insert' },
  { key: 'page', icon: <Page />, text: 'Page' },
  { key: 'theme', icon: <Theme />, text: 'Theme' },
  { key: 'seo', icon: <Seo />, text: 'SEO' },
];

function PageBuilder() {
  const { id } = useParams();
  const [activeMenuItem, setActiveMenuItem] = useState('insert');
  const handleMenuClick = (key) => {
    setActiveMenuItem(key);
  };

  return (
    <Layout.Content>
      <ComponentContextProvider>
        {id ? (
          <Layout
            className="page-builder-layout"
            style={{ minHeight: '100vh', overflowY: 'auto', marginTop: '0px' }}
          >
            <Sider
              style={{
                overflow: 'auto',
                height: '100vh',
                boxShadow: '2px 0px 4px rgba(0, 0, 0, 0.1)',
              }}
              id="pg-sidebar"
            >
              <Menu
                theme="light"
                mode="inline"
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
              >
                {menuItems.map((item) => (
                  <Menu.Item
                    key={item.key}
                    onClick={() => handleMenuClick(item.key)}
                    className={activeMenuItem === item.key ? 'active-menu' : ''}
                  >
                    <div className="insert-menu">
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                  </Menu.Item>
                ))}
              </Menu>
            </Sider>
            <Layout className="site-layout" style={{ marginLeft: 98 }}>
              <Content style={{ overflow: 'initial' }}>
                <EditorComponent
                  activeMenu={activeMenuItem}
                  setActiveMenuItem={setActiveMenuItem}
                />
              </Content>
            </Layout>
          </Layout>
        ) : (
          <Templates
            activeMenu={activeMenuItem}
            setActiveMenuItem={setActiveMenuItem}
          />
        )}
      </ComponentContextProvider>
    </Layout.Content>
  );
}

export default PageBuilder;
