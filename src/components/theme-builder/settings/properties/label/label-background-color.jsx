import { Input, Modal } from 'antd';
import { get } from 'lodash';
import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import { PRESET_COLOR } from '../../../../../shared/constant-values';

const LabelBackgroundColorPicker = ({
  activeElement,
  setChangeType,
  setValue,
}) => {
  const {
    backgroundColor = '',
  } = activeElement.element.column_properties.label.labelStyle;
  const [labelBackgroundColor, setLabelBackgroundColor] = useState(
    backgroundColor
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  useEffect(() => {
    setChangeType('backgroundColor');
    setValue(labelBackgroundColor);
  }, [labelBackgroundColor, setChangeType, setValue]);

  return (
    <div>
      <Input
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
          presetColors={PRESET_COLOR}
          onChange={(event) => {
            setLabelBackgroundColor(get(event, 'hex', ''));
          }}
        />
      </Modal>
    </div>
  );
};

export default LabelBackgroundColorPicker;
