import { ExclamationCircleOutlined } from '@ant-design/icons';
import { InputNumber, Popover } from 'antd';
import React, { useEffect, useState } from 'react';

const PaddingImg =
  'https://dev-profile-tracker.kaaylabs.com/static/media/padding.ea650eea2f553b7c84b0.png';

const Padding = ({ setChangeType, setValue, activeElement, type }) => {
  const { padding = '0px 0px 0px 0px' } = activeElement.element[
    `${type}_style`
  ];
  const colPadd = padding.split(' ');
  const [paddingTop, setPaddingTop] = useState(
    parseInt(colPadd[0].replace('px', ''), 10)
  );
  const [paddingRight, setPaddingRight] = useState(
    parseInt(colPadd[1].replace('px', ''), 10)
  );
  const [paddingBottom, setPaddingBottom] = useState(
    parseInt(colPadd[2].replace('px', ''), 10)
  );
  const [paddingLeft, setPaddingLeft] = useState(
    parseInt(colPadd[3].replace('px', ''), 10)
  );
  const handlePadding = (value, position) => {
    if (value === null || value === undefined) value = 0;
    if (position) {
      // eslint-disable-next-line default-case
      switch (position) {
        case 'top':
          setPaddingTop(value);
          break;
        case 'right':
          setPaddingRight(value);
          break;
        case 'bottom':
          setPaddingBottom(value);
          break;
        case 'left':
          setPaddingLeft(value);
          break;
      }
    }
    return null;
  };

  useEffect(() => {
    // eslint-disable-next-line max-len
    const paddingData = `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`;
    setChangeType('padding');
    setValue(paddingData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paddingTop, paddingRight, paddingBottom, paddingLeft]);

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
              <p>Padding</p>
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
              min={0}
              value={paddingTop}
              onChange={(event) => handlePadding(event, 'top')}
            />
          </td>
        </tr>
        <tr>
          <td>Right</td>
          <td>
            <InputNumber
              min={0}
              value={paddingRight}
              onChange={(event) => handlePadding(event, 'right')}
            />
          </td>
        </tr>
        <tr>
          <td>Bottom</td>
          <td>
            <InputNumber
              min={0}
              value={paddingBottom}
              onChange={(event) => handlePadding(event, 'bottom')}
            />
          </td>
        </tr>
        <tr>
          <td>Left</td>
          <td>
            <InputNumber
              min={0}
              value={paddingLeft}
              onChange={(event) => handlePadding(event, 'left')}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default Padding;
