import { Empty } from 'antd';
import React from 'react';
import NoData from '../assets/images/no-data.svg';

function EmptyData({ value }) {
  return (
    <div style={{ padding: value }}>
      <Empty image={NoData} />
    </div>
  );
}

export default EmptyData;
