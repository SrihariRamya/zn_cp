import { Col, Row } from 'antd';
import React from 'react';
import LabelStyle from './label/label';

const LabelProperties = ({
  sectionValues,
  setSectionValues,
  activeElement,
}) => (
  <Row>
    <Col span={24}>
      <h3
        style={{
          padding: '5px 10px',
          textAlign: 'center',
          textTransform: 'capitalize',
        }}
      >
        Label Properties
      </h3>
    </Col>
    <Col span={24}>
      <LabelStyle
        setSectionValues={setSectionValues}
        activeElement={activeElement}
        sectionValues={sectionValues}
      />
    </Col>
  </Row>
);

export default LabelProperties;
