import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';

function EmptyTable({ title, description, onClick, src }) {
  return (
    <div className="empty-table-maindiv">
      <div className="flexbox-center">
        <div className="empty-table-div">
          <img src={src} alt="logo" />
        </div>
      </div>
      <div>
        <p className="empty-table-heeading">{title}</p>
        <p className="empty-table-description">{description}</p>
        <Button type="primary" icon={<PlusOutlined />} onClick={onClick}>
          Add Product
        </Button>
      </div>
    </div>
  );
}

export default EmptyTable;
