import { Input, Modal } from 'antd';
import { get } from 'lodash';
import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import { PRESET_COLOR } from '../../../../../shared/constant-values';

const BackgroundColor = ({ setChangeType, setValue, activeElement, type }) => {
  const backgroundColor = get(
    activeElement?.element[`${type}_style`],
    'backgroundColor'
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bgColor, setBgColor] = useState(backgroundColor);
  useEffect(() => {
    setChangeType('backgroundColor');
    setValue(bgColor);
  }, [bgColor, setChangeType, setValue]);

  return (
    <table>
      <tbody>
        <tr>
          <td>Background Color</td>
          <td>
            <Input
              className="color-picker"
              placeholder="#000000"
              value={bgColor}
              onClick={() => {
                setIsModalVisible(true);
              }}
            />
          </td>
        </tr>
      </tbody>
      <Modal
        title="Color Picker"
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => {
          setIsModalVisible(false);
          setBgColor('');
        }}
        width="269px"
        destroyOnClose
      >
        <h1>Hello</h1>
        <SketchPicker
          color={bgColor}
          onChange={(event) => {
            setBgColor(get(event, 'hex', ''));
          }}
          presetColors={PRESET_COLOR}
        />
      </Modal>
    </table>
  );
};

export default BackgroundColor;
