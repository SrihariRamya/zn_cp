import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';

function FirstTimeUser(properties) {
  const { title, description, onClick, src, buttonTitle } = properties;
  return (
    <div className="centered-container">
      <div className="align-center">
        <img src={src} alt="logo" />
      </div>
      <br />
      <div className="align-center">
        <p className="empty-title">{title}</p>
        <p className="empty-description">{description}</p>
        <div className="empty-button">
          <Button type="primary" icon={<PlusOutlined />} onClick={onClick}>
            {buttonTitle}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FirstTimeUser;
