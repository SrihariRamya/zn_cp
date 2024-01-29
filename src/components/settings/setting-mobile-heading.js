import React from 'react';
import { Col, Space, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as InfoIcon } from '../../assets/icons/info-icon.svg';
import { ReactComponent as BackIcon } from '../../assets/icons/back-icon.svg';
import { DELIVERY_CHARGE_INFO } from '../../shared/constant-values';

function SettingsMobileHeading(properties) {
  const { heading, tooltip, setScreenState } = properties;
  const navigate = useNavigate();

  const handleClickBack = () => {
    navigate('/settings');
    setScreenState('');
  };

  return (
    <div>
      <Col>
        <Space>
          <BackIcon
            cursor="pointer"
            onClick={handleClickBack}
            style={{ height: '20px', width: '20px', marginTop: '4px' }}
          />
          <span className="delivery-slot-heading">{heading}</span>
          {tooltip === 'true' && (
            <Tooltip title={DELIVERY_CHARGE_INFO}>
              <InfoIcon
                className="info-icon-styles"
                style={{ marginTop: '4px' }}
              />
            </Tooltip>
          )}
        </Space>
      </Col>
    </div>
  );
}

export default SettingsMobileHeading;
