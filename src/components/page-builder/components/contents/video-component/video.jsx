import React, { useState } from 'react';
import { Modal } from 'antd';
import { isEmpty } from 'lodash';
import { PlusOutlined } from '@ant-design/icons';
import { useComponentContext } from '../../../context/components';
import { getComponent } from '../../../helper';

function VideoUploadPreviewModal(properties) {
  const { videoModalVisible, onCancel } = properties;
  const {
    componentValues,
    updateComponentState,
    setComponentProperties,
    setScrollToBottom,
  } = useComponentContext();
  const [videoFile, setVideoFile] = useState();
  const [fileUrl, setFileUrl] = useState();

  const handleOk = () => {
    const videoData = getComponent('video');
    videoData.column[0].component[0].componentProperties = {
      value: fileUrl,
      file: videoFile,
    };
    updateComponentState({
      ...componentValues,
      row: [...componentValues.row, { ...videoData }],
    });
    setScrollToBottom(true);
    setComponentProperties({});
    setFileUrl();
    onCancel();
  };

  const onModalCancel = () => {
    onCancel();
    setFileUrl();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setVideoFile(file);
    setFileUrl(URL.createObjectURL(file));
  };

  const uploadButton = (
    <div className="video-upload-button" style={{ cursor: 'pointer' }}>
      <div className="video-upload-icon">
        <PlusOutlined />
      </div>
      <div className="video-upload-text">
        <input type="file" accept="video/*" onChange={handleFileChange} />
        <span>Video Upload</span>
      </div>
    </div>
  );

  return (
    <div>
      <Modal
        onCancel={onModalCancel}
        open={videoModalVisible}
        onOk={handleOk}
        destroyOnClose
      >
        <p className="ant-upload-hint">Support video files </p>
        {isEmpty(fileUrl) ? (
          uploadButton
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video controls src={fileUrl} style={{ width: '100%' }} />
        )}
      </Modal>
    </div>
  );
}

export default VideoUploadPreviewModal;
