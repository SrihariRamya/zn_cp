import { Col, Select } from 'antd';
import React from 'react';

const Position = ({ setChangeType, setValue, activeElement, type }) => {
  const { alignItems = '', justifyContent = '' } = activeElement.element[
    `${type}_style`
  ];
  const handleChange = (value, type) => {
    setValue(value);
    setChangeType(type);
  };

  return (
    <Col span={24}>
      <table>
        <tbody>
          <tr>
            <td>H-Position</td>
            <td>
              <Select
                style={{ width: '100%' }}
                virtual={false}
                options={[
                  {
                    label: 'Left',
                    value: 'left',
                  },
                  {
                    label: 'Center',
                    value: 'center',
                  },
                  {
                    label: 'Right',
                    value: 'right',
                  },
                ]}
                // eslint-disable-next-line max-len
                onChange={(value) => handleChange(value, 'justifyContent')}
                value={justifyContent || undefined}
              />
            </td>
          </tr>
          <tr>
            <td>V-Position</td>
            <td>
              <Select
                style={{ width: '100%' }}
                virtual={false}
                options={[
                  {
                    label: 'Top',
                    value: 'top',
                  },
                  {
                    label: 'Center',
                    value: 'center',
                  },
                  {
                    label: 'Bottom',
                    value: 'bottom',
                  },
                ]}
                onChange={(value) => handleChange(value, 'alignItems')}
                value={alignItems || undefined}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Col>
  );
};

export default Position;
