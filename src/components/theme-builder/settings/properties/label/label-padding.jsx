import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Col, InputNumber, Popover } from 'antd';
import React, { useEffect, useState } from 'react';

const PaddingImg = '';

const LabelPadding = ({ activeElement, setChangeType, setValue }) => {
  const {
    padding = '0px 0px 0px 0px',
  } = activeElement.element.column_properties.label.labelStyle;
  const paddingArray =
    padding.split(' ').length !== 4
      ? [padding, padding, padding, padding]
      : padding.split(' ');
  const [paddingTop, setPaddingTop] = useState(
    parseInt(paddingArray[0]?.replace('px', ''), 10)
  );
  const [paddingRight, setPaddingRight] = useState(
    parseInt(paddingArray[1]?.replace('px', ''), 10)
  );
  const [paddingBottom, setPaddingBottom] = useState(
    parseInt(paddingArray[2]?.replace('px', ''), 10)
  );
  const [paddingLeft, setPaddingLeft] = useState(
    parseInt(paddingArray[3]?.replace('px', ''), 10)
  );
  const handlePadding = (paddingValue, paddingPosition) => {
    if (paddingPosition === 'top') {
      setPaddingTop(paddingValue);
    }

    if (paddingPosition === 'right') {
      setPaddingRight(paddingValue);
    }

    if (paddingPosition === 'bottom') {
      setPaddingBottom(paddingValue);
    }

    if (paddingPosition === 'left') {
      setPaddingLeft(paddingValue);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line max-len
    const paddingData = `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`;
    setChangeType('padding');
    setValue(paddingData);
  }, [paddingTop, paddingRight, paddingBottom, paddingLeft]);
  return (
    <Col span={24}>
      <table>
        <thead>
          <tr>
            <th colSpan={2}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'start',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <p>Title Padding</p>
                <Popover
                  content={<img src={PaddingImg} alt="padding" width="300px" />}
                  trigger="hover"
                >
                  <ExclamationCircleOutlined />
                </Popover>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Top</td>
            <td>
              <InputNumber
                value={paddingTop}
                min={0}
                onChange={(e) => handlePadding(e, 'top')}
              />
            </td>
          </tr>
          <tr>
            <td>Right</td>
            <td>
              <InputNumber
                value={paddingRight}
                min={0}
                onChange={(e) => handlePadding(e, 'right')}
              />
            </td>
          </tr>
          <tr>
            <td>Bottom</td>
            <td>
              <InputNumber
                value={paddingBottom}
                min={0}
                onChange={(e) => handlePadding(e, 'bottom')}
              />
            </td>
          </tr>
          <tr>
            <td>Left</td>
            <td>
              <InputNumber
                value={paddingLeft}
                min={0}
                onChange={(e) => handlePadding(e, 'left')}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Col>
  );
};

export default LabelPadding;
