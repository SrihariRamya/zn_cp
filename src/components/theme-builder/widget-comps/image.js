/* eslint-disable no-shadow */
/* eslint-disable camelcase */
import { Col, Image } from 'antd';
import React from 'react';

const ImageComp = ({ properties, dataSource }) => {
  const {
    column_properties: { dataField = '', image, action = { action_type: '' } },
  } = properties;
  const { src, preview, alt, img_style } = image;
  const { action_type = '' } = action;
  const content = (dataSource, isLink) => (
    <Image
      src={dataField ? dataSource[dataField] : src || undefined}
      preview={preview}
      height="100%"
      width="100%"
      alt={alt}
      style={{
        ...img_style,
        height: '100%',
        width: '100%',
        cursor: isLink ? 'pointer' : 'auto',
      }}
    />
  );

  return (
    <Col span={24} className="product_image">
      {action_type && action_type === 'route' ? (
        <>{content(dataSource, action_type)}</>
      ) : (
        content(dataSource, '')
      )}
    </Col>
  );
};

export default ImageComp;
