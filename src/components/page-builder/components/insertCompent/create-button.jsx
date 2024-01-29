import React, { useState } from 'react';
import { Modal, Input, Button } from 'antd';

function CreateButtonComponent(properties) {
  const { visible, onCancel, onOk } = properties;
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');

  const handleOk = () => {
    onCancel();
    onOk(buttonText, buttonLink);
    setButtonText('');
    setButtonLink('');
  };

  return (
    <div>
      <Modal
        title="Insert Button"
        className="custom-modal"
        open={visible}
        footer={[
          <Button
            key="back"
            onClick={() => {
              onCancel();
              setButtonText('');
              setButtonLink('');
            }}
          >
            Cancel
          </Button>,
          <Button key="upload" type="primary" onClick={handleOk}>
            Insert
          </Button>,
        ]}
        onOk={handleOk}
        onCancel={onCancel}
      >
        <Input
          className="modal-input"
          placeholder="Button Text"
          value={buttonText}
          onChange={(event) => setButtonText(event.target.value)}
        />
        <br />
        <Input
          className="modal-input"
          placeholder="Button Link"
          value={buttonLink}
          onChange={(event) => setButtonLink(event.target.value)}
        />
      </Modal>
    </div>
  );
}

export default CreateButtonComponent;
