import { Button, Modal } from 'antd';
import { get } from 'lodash';
import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import { PRESET_COLOR } from '../../../shared/constant-values';

function ThemeBackgroundColor({ setSectionValues, sectionValues }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bgColor, setBgColor] = useState(
    get(sectionValues, '[0].section_style.backgroundColor')
  );
  return (
    <div>
      <Button
        style={{ backgroundColor: bgColor, borderRadius: '5px' }}
        className="color-picker"
        placeholder="#000000"
        value={bgColor}
        onClick={() => {
          setIsModalVisible(true);
        }}
        size="small"
      >
        Background Color
      </Button>
      <Modal
        title="Color Picker"
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => {
          setIsModalVisible(false);
          setBgColor('');
          setSectionValues(
            sectionValues.map((index) => {
              index.section_style.backgroundColor = '';
              return index;
            })
          );
        }}
        width="269px"
        destroyOnClose
      >
        <SketchPicker
          color={bgColor}
          onChange={(event) => {
            setSectionValues(
              sectionValues.map((index) => {
                index.section_style.backgroundColor = get(event, 'hex', '');
                return index;
              })
            );
            setBgColor(get(event, 'hex', ''));
          }}
          presetColors={PRESET_COLOR}
        />
      </Modal>
    </div>
  );
}

export default ThemeBackgroundColor;
