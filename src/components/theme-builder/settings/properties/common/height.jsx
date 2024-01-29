/* eslint-disable no-nested-ternary */
import { InputNumber, Select } from 'antd';
import React, { useState } from 'react';

const Height = ({ setChangeType, setValue, activeElement, type }) => {
  const { height = null } = activeElement.element[`${type}_style`];
  const getHeight = () => {
    if (height.toString().includes('px')) return 'px';
    if (height.toString().includes('%')) return '%';
    if (height.toString().includes('vh')) return 'screen';
    return null;
  };

  const [heightType, setHeightType] = useState(height ? getHeight() : null);
  const handleChange = (value, type) => {
    if (value && type) {
      setValue(`${value}${heightType}`);
      setChangeType(type);
    } else {
      setHeightType(value);
    }
  };

  return (
    <table>
      <tbody>
        <tr>
          <td>Height Type</td>
          <td>
            <Select
              style={{ width: '100%' }}
              virtual={false}
              options={[
                {
                  label: 'PX',
                  value: 'px',
                },
                {
                  label: '%',
                  value: '%',
                },
                {
                  label: 'Screen',
                  value: 'vh',
                },
              ]}
              onChange={(value) => handleChange(value, '')}
              value={heightType || undefined}
            />
          </td>
        </tr>
        {heightType && (
          <tr>
            <td>Height</td>
            <td>
              <InputNumber
                value={height ? height.match(/\d+/g)[0] : null}
                onChange={(value) => handleChange(value, 'height')}
                min={0}
                placeholder={heightType}
              />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Height;
