import React, { useState, useContext } from 'react';
import { Layout, Row, Col, Button } from 'antd';
import { find, get } from 'lodash';
import { defaultImage } from '../../../../shared/image-helper';
import { headerList } from '../../../../shared/constant-values';
import { TenantContext } from '../../../context/tenant-context';
import { LocationIcon } from '../../../../shared/icon-helper';

const HeaderDetails = ({ settingProperties, webLayout, preview }) => {
  const [isHover, setHover] = useState(false);
  const [tenantDetails] = useContext(TenantContext);
  const brandLogo = get(tenantDetails, 'setting.brand_logo', '');
  const tenantName = get(tenantDetails, 'setting.business_name', '');
  const tenantLocation = get(tenantDetails, 'setting.address_1', '');

  const handleGetValues = (variableName, value) => {
    return get(
      find(settingProperties, (item) => item.variable_name === variableName),
      'variable_value',
      value
    );
  };
  const setHeight = handleGetValues('--layout-header-height', '100px');
  const setbackgroundColor = handleGetValues(
    '--layout-header-background',
    '#FFFFFF'
  );
  const setTextColor = handleGetValues('--header-text-color', '#ffffff');
  const setHoverColor = handleGetValues('--header-text-hover-color', '#026d39');

  return (
    <Layout>
      {webLayout ? (
        <Row
          style={{
            height: setHeight,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: setbackgroundColor,
            cursor: 'pointer',
          }}
        >
          <Col style={{ color: isHover ? setHoverColor : setTextColor }}>
            <header className={preview ? 'header-preview' : 'header-container'}>
              <div className="logo-img-container">
                <img src={brandLogo} alt="logo" className="logo-img" />
              </div>
              <div className="select-store-header">
                <div className="store-image-holder">
                  <img src={defaultImage} alt="store" className="store-img" />
                </div>
                <div className="store-name-holder">
                  <span>Store Name</span>
                </div>
              </div>
              {headerList.map((value) => {
                return (
                  <span
                    className="header-align"
                    onMouseEnter={() => {
                      setHover(true);
                    }}
                    onMouseLeave={() => {
                      setHover(false);
                    }}
                  >
                    <span className="icon-align">
                      <value.icon
                        fill={isHover ? setHoverColor : setTextColor}
                        iconLarge={preview}
                      />
                    </span>
                    {value.name}
                  </span>
                );
              })}
            </header>
          </Col>
        </Row>
      ) : (
        <div className={`mobile-header-layout ${preview ? 'preview' : ''}`}>
          <div className="mobile-store-header">
            <div className={`mobile-image-holder ${preview ? 'preview' : ''}`}>
              <img
                src={brandLogo || defaultImage}
                className="store-img"
                alt="store"
              />
            </div>
            <div className={`mobile-name-holder ${preview ? 'preview' : ''}`}>
              <span>{tenantName}</span>
              <div className="store-location">
                <span>{tenantLocation}</span>
              </div>
            </div>
          </div>
          <div className={`mobile-location ${preview ? 'preview' : ''}`}>
            <Button
              className={`mobile-location-button ${preview ? 'preview' : ''}`}
            >
              <span className={`location-btn ${preview ? 'preview' : ''}`}>
                <LocationIcon width={12} height={15} />
                Chennai
              </span>
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HeaderDetails;
