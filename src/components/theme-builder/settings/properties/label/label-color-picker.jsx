import { Input, Modal } from 'antd';
import { get } from 'lodash';
import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';

const LabelColorPicker = ({ activeElement, setChangeType, setValue }) => {
  // eslint-disable-next-line max-len
  const {
    color = '',
  } = activeElement.element.column_properties.label.labelStyle;
  const [labelColor, setLabelColor] = useState(color);
  const [isModalVisible, setIsModalVisible] = useState(false);
  useEffect(() => {
    setChangeType('color');
    setValue(labelColor);
  }, [labelColor, setChangeType, setValue]);

  return (
    <div>
      <Input
        className="color-picker"
        placeholder="#000000"
        value={color}
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
          color={labelColor}
          onChange={(event) => {
            setLabelColor(get(event, 'hex', ''));
          }}
        />
      </Modal>
    </div>
  );
};

export default LabelColorPicker;
