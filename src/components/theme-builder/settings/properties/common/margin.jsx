import { ExclamationCircleOutlined } from '@ant-design/icons';
import { InputNumber, Popover } from 'antd';
import React, { useEffect, useState } from 'react';

const MarginImg = '';

const Margin = ({
  setChangeType,
  setValue,
  activeElement,
  type,
}: MarginProps) => {
  const { margin = '0px 0px 0px 0px' } = activeElement.element[`${type}_style`];
  const colMar = margin.split(' ');
  const [marginTop, setMarginTop] = useState(
    parseInt(colMar[0].replace('px', ''), 10)
  );
  const [marginBottom, setMarginBottom] = useState(
    parseInt(colMar[3].replace('px', ''), 10)
  );
  const handleMargin = (value, position) => {
    if (value === null || value === undefined) value = 0;
    if (position) {
      // eslint-disable-next-line default-case
      switch (position) {
        case 'top':
          setMarginTop(value);
          break;
        case 'bottom':
          setMarginBottom(value);
          break;
      }
    } else {
      return null;
    }
  };

  useEffect(() => {
    const marginData = `${marginTop}px 0px ${marginBottom}px 0px`;
    setChangeType('margin');
    setValue(marginData);
  }, [marginTop, marginBottom]);

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
              <p>Margin</p>
              <Popover
                content={<img src={MarginImg} alt="padding" width="300px" />}
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
              value={marginTop}
              onChange={(e) => handleMargin(e, 'top')}
            />
          </td>
        </tr>
        <tr>
          <td>Bottom</td>
          <td>
            <InputNumber
              min={0}
              value={marginBottom}
              onChange={(e) => handleMargin(e, 'bottom')}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default Margin;
