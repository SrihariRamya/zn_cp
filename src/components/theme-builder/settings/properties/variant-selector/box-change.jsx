import { ExclamationCircleOutlined } from '@ant-design/icons';
import { InputNumber, Popover } from 'antd';
import React, { useEffect, useState } from 'react';

const BorderRadiusImg =
  'https://images-zupain.s3.ap-south-1.amazonaws.com/border-radius.png';

const BoxChange = ({ setChangeType, setValue, activeElement, type, isFor }) => {
  const borderRadius =
    activeElement?.element?.column_properties[`${type}_style`][isFor] ||
    '0px 0px 0px 0px';
  const colBorderRadius = borderRadius?.split(' ');
  const [borderRadiusTop, setBorderRadiusTop] = useState(
    colBorderRadius[0].replace('px', '')
  );
  const [borderRadiusRight, setBorderRadiusRight] = useState(
    colBorderRadius[1].replace('px', '')
  );
  const [borderRadiusBottom, setBorderRadiusBottom] = useState(
    colBorderRadius[2].replace('px', '')
  );
  const [borderRadiusLeft, setBorderRadiusLeft] = useState(
    colBorderRadius[3].replace('px', '')
  );
  // eslint-disable-next-line max-len
  const handleBorderRadius = (value, position) => {
    if (value === null || value === undefined) value = 0;
    if (position) {
      // eslint-disable-next-line default-case
      switch (position) {
        case 'top':
          setBorderRadiusTop(value);
          break;
        case 'right':
          setBorderRadiusRight(value);
          break;
        case 'bottom':
          setBorderRadiusBottom(value);
          break;
        case 'left':
          setBorderRadiusLeft(value);
          break;
      }
    }
    return null;
  };

  useEffect(() => {
    // eslint-disable-next-line max-len
    const borderRadiusPx = `${borderRadiusTop}px ${borderRadiusRight}px ${borderRadiusBottom}px ${borderRadiusLeft}px`;
    setChangeType(isFor);
    setValue(borderRadiusPx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    borderRadiusTop,
    borderRadiusRight,
    borderRadiusBottom,
    borderRadiusLeft,
  ]);

  return (
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
              <p>Border Radius</p>
              <Popover
                content={
                  <img src={BorderRadiusImg} alt="padding" width="300px" />
                }
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
              min={0}
              value={borderRadiusTop}
              onChange={(event) => handleBorderRadius(event, 'top')}
            />
          </td>
        </tr>
        <tr>
          <td>Right</td>
          <td>
            <InputNumber
              min={0}
              value={borderRadiusRight}
              onChange={(event) => handleBorderRadius(event, 'right')}
            />
          </td>
        </tr>
        <tr>
          <td>Bottom</td>
          <td>
            <InputNumber
              min={0}
              value={borderRadiusBottom}
              onChange={(event) => handleBorderRadius(event, 'bottom')}
            />
          </td>
        </tr>
        <tr>
          <td>Left</td>
          <td>
            <InputNumber
              min={0}
              value={borderRadiusLeft}
              onChange={(event) => handleBorderRadius(event, 'left')}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default BoxChange;
