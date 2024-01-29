import { Input, Modal } from 'antd';
import { get } from 'lodash';
import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import { PRESET_COLOR } from '../../../../../shared/constant-values';

const ColorChange = ({
  activeElement,
  setChangeType,
  setValue,
  ColorChangeFor,
}) => {
  const backgroundColor =
    activeElement.element.column_properties.button[ColorChangeFor];
  const [labelBackgroundColor, setLabelBackgroundColor] =
    useState(backgroundColor);
  const [isModalVisible, setIsModalVisible] = useState(false);
  useEffect(() => {
    setChangeType(ColorChangeFor);
    setValue(labelBackgroundColor);
  }, [ColorChangeFor, labelBackgroundColor, setChangeType, setValue]);

  return (
    <div>
      <Input
        style={{ backgroundColor }}
        className="color-picker"
        placeholder="#000000"
        value={labelBackgroundColor}
        onClick={() => {
          setIsModalVisible(true);
        }}
      />
      <Modal
        title="Color Picker"
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        width="269px"
        destroyOnClose
      >
        <SketchPicker
          color={labelBackgroundColor}
          onChange={(event) => {
            setLabelBackgroundColor(get(event, 'hex', ''));
          }}
          presetColors={PRESET_COLOR}
        />
      </Modal>
    </div>
  );
};

export default ColorChange;
