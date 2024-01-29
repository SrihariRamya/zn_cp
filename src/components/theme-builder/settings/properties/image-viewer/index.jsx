import {
  DownOutlined,
  LeftOutlined,
  RightOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { Button, Col, Row, Space, Switch } from 'antd';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';

function ImageViewerStyle({ setSectionValues, activeElement, sectionValues }) {
  const carouselAlign =
    (get(
      activeElement,
      'element.column_properties.image_properties.carouselRequired'
    ) === true ||
      get(
        activeElement,
        'element.column_properties.image_properties.carouselRequired'
      )) === undefined
      ? get(
          activeElement,
          'element.column_properties.image_properties.carouselAlign'
        )
      : true;
  const [changeType, setChangeType] = useState();
  const [value, setValue] = useState(carouselAlign);
  useEffect(() => {
    if (changeType) {
      setSectionValues(
        sectionValues.map((sec) => {
          const rowRecursion = (row) => {
            row.forEach((row1) => {
              row1.column.forEach((col) => {
                const imageProperties = get(
                  col,
                  'column_properties.image_properties',
                  {}
                );
                // eslint-disable-next-line max-len
                if (col.column_uid === activeElement.element.column_uid) {
                  col.column_properties.image_properties = {
                    ...imageProperties,
                    [changeType]: value,
                  };
                } else if (col.row) {
                  rowRecursion(col.row);
                }
              });
            });
          };

          if (sec.section_uid === activeElement.section_uid) {
            rowRecursion(sec.row);
          }

          return sec;
        })
      );
    }
  }, [changeType, value]);

  useEffect(() => {}, [changeType]);

  return (
    <div>
      <Row justify="space-around" align="middle">
        <Col>
          <p>Grid View</p>
        </Col>
        <Col>
          <Switch
            onChange={(event) => {
              setChangeType('carouselRequired');
              setValue(event);
            }}
            defaultChecked={value === true}
          />
        </Col>
      </Row>
      <Row justify="space-around" align="middle" style={{ marginTop: '10px' }}>
        <Col>
          <p>Carousel Align</p>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<LeftOutlined />}
              onClick={() => {
                setChangeType('carouselAlign');
                setValue('left');
              }}
              type={value === 'left' && 'primary'}
            />
            <Button
              icon={<UpOutlined />}
              onClick={() => {
                setChangeType('carouselAlign');
                setValue('top');
              }}
              type={value === 'top' && 'primary'}
            />
            <Button
              icon={<RightOutlined />}
              onClick={() => {
                setChangeType('carouselAlign');
                setValue('right');
              }}
              type={value === 'right' && 'primary'}
            />
            <Button
              icon={<DownOutlined />}
              onClick={() => {
                setChangeType('carouselAlign');
                setValue('bottom');
              }}
              type={value === 'bottom' && 'primary'}
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default ImageViewerStyle;
