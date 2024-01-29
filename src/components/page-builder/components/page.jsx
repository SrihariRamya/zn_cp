import React from 'react';
import { Col, List } from 'antd';

import {
  HomeOutlined,
  AppstoreOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';

function PageComponent() {
  const listData = [
    <p key="home">
      <HomeOutlined /> Home
    </p>,
    <p key="category">
      <AppstoreOutlined /> Category
    </p>,
    <p key="documentation">
      <FileDoneOutlined /> Documentation
    </p>,
  ];

  return (
    <Col span={4} className="drawer-content">
      <h2
        style={{ color: '#6E56EC', background: '#F5F7FD', padding: '20px' }}
        className="text-center"
      >
        Page
      </h2>
      <List
        size="small"
        bordered
        dataSource={listData}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />
    </Col>
  );
}
export default PageComponent;
