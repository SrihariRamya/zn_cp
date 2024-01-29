import React from 'react';
import { Modal } from 'antd';

function InfoModal(properties) {
  const { infoModalCancel, infoModal, infoImg } = properties;
  return (
    <div>
      <Modal
        width={850}
        footer={false}
        open={infoModal}
        destroyOnClose
        title=" "
        closeIcon={
          <button className="modal-close" type="button">
            Close
          </button>
        }
        onCancel={infoModalCancel}
      >
        <img width="100%" src={infoImg} alt="info-img" />
      </Modal>
    </div>
  );
}

export default InfoModal;
