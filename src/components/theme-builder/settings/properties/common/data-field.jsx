/* eslint-disable camelcase */
import { Select } from 'antd';
import { filter, get, map, toPairs } from 'lodash';
import React, { useState } from 'react';

const DataFieldComponent = ({
  setChangeType,
  setValue,
  activeElement,
  type,
  dataSource,
}) => {
  const { dataField = '', data_source = '' } = activeElement.element[
    `${type}_properties`
  ];
  const [dataFieldData, setDataField] = useState(dataField);
  // eslint-disable-next-line no-unused-vars
  const [, setDataSource] = useState(data_source);
  const handleChange = (value, type) => {
    if (type) {
      // eslint-disable-next-line default-case
      switch (type) {
        case 'data_source':
          setDataSource(value);
          break;
        case 'dataField':
          setDataField(value);
          break;
      }

      setValue(value);
      setChangeType(type);
    }
  };

  return (
    <>
      <table>
        <tbody>
          <tr>
            <td colSpan={2} style={{ padding: '0' }}>
              <thead>
                <tr>
                  <th colSpan={2}>
                    <p>Data Field</p>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={2}>
                    <Select
                      style={{ width: 250 }}
                      virtual={false}
                      placement="bottomRight"
                      defaultValue={dataFieldData}
                      onChange={(element) => {
                        handleChange(element, 'dataField');
                      }}
                    >
                      <Select.Option value={null} />
                      {map(
                        filter(
                          toPairs(dataSource),
                          (item) =>
                            (typeof get(item, '[1]') === 'string' ||
                              typeof get(item, '[1]') === 'number') &&
                            get(activeElement, 'element.widget_type') ===
                              'label'
                        ),
                        (item) => {
                          return (
                            <Select.Option value={get(item, '[0]')}>
                              {get(item, '[0]')}
                            </Select.Option>
                          );
                        }
                      )}
                    </Select>
                  </td>
                </tr>
              </tbody>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default DataFieldComponent;
