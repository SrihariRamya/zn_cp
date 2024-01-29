import { Input, Modal, Switch } from 'antd';
import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import { get } from 'lodash';

const ColumnIterableProperties = ({
  setChangeType,
  setValue,
  activeElement,
  type,
}) => {
  const {
    iterable = {
      columnIterable: false,
      oddBg: '',
      evenBg: '',
    },
  } = activeElement.element[`${type}_properties`];
  const { columnIterable = false, oddBg = '', evenBg = '' } = iterable;
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [propertyType, setPropertyType] = useState('');
  const handleChange = (value) => {
    setValue(value);
    setChangeType('columnIterable');
  };

  return (
    <table>
      <tbody>
        <tr>
          <td>Iterable</td>
          <td>
            <Switch checked={columnIterable} onChange={handleChange} />
          </td>
        </tr>
        {columnIterable && (
          <tr>
            <td>Odd Bg</td>
            <td>
              <Input
                onClick={() => {
                  setIsModalVisible(true);
                  setPropertyType('oddBg');
                }}
                value={oddBg}
              />
            </td>
          </tr>
        )}
        {columnIterable && (
          <tr>
            <td>Even Bg</td>
            <td>
              <Input
                onClick={() => {
                  setIsModalVisible(true);
                  setPropertyType('evenBg');
                }}
                value={evenBg}
              />
            </td>
          </tr>
        )}
      </tbody>
      <Modal
        title="Color Picker"
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => {
          setIsModalVisible(false);
          setValue('');
          setChangeType(propertyType);
        }}
        width="269px"
        destroyOnClose
      >
        <SketchPicker
          // eslint-disable-next-line max-len
          color={propertyType && propertyType === 'oddBg' ? oddBg : evenBg}
          onChange={(event) => {
            setValue(get(event, 'hex', ''));
            setChangeType(propertyType);
          }}
        />
      </Modal>
    </table>
  );
};

export default ColumnIterableProperties;
