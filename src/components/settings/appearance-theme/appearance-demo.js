import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Breadcrumb } from 'antd';
import {
  appearanceThemeMobile,
  appearanceThemeWeb,
} from '../../../shared/image-helper';
import {
  APPEARANCE_DEMO_TITLE,
  APPEARANCE_TITLE,
} from '../../../shared/constant-values';

const AppearanceDemo = () => {
  return (
    <div className="appearance-theme-container">
      <div className="search-container">
        <div>
          <Breadcrumb separator=">">
            <Breadcrumb.Item>
              <Link to="/appearance">{APPEARANCE_TITLE}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{APPEARANCE_DEMO_TITLE}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      <Row>
        <Col span={16}>
          <div className="smart-web">
            <div className="content">
              <img
                className="image-web"
                src={appearanceThemeWeb}
                alt="img.jpg"
              />
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div className="smart-phone">
            <div className="image-container-mobile">
              <img
                className="image-mobile"
                src={appearanceThemeMobile}
                alt="img.jpg"
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AppearanceDemo;
