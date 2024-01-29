import { Modal } from 'antd';
import { get } from 'lodash';
import React from 'react';
import { SketchPicker } from 'react-color';

const ColorPicker = (properties) => {
  const { openModal, setOpenModal, color, setColor } = properties;
  return (
    <div>
      <Modal
        title="Color Picker"
        visible={openModal}
        onOk={() => {
          setOpenModal(false);
        }}
        onCancel={() => setOpenModal(false)}
        width="269px"
        destroyOnClose
      >
        <SketchPicker
          color={color}
          onChange={(event) => {
            setColor(get(event, 'hex', ''));
          }}
        />
      </Modal>
    </div>
  );
};

export default ColorPicker;
