import React, { useState } from 'react';
import { Modal, Input } from 'antd';
import { useComponentContext } from '../../../context/components';
import { getComponent } from '../../../helper';

const { TextArea } = Input;

function YoutubeVideoUploadPreviewModal(properties) {
  const { videoModalVisible, onCancel } = properties;
  const {
    componentValues,
    updateComponentState,
    setComponentProperties,
    setScrollToBottom,
  } = useComponentContext();
  const [youTubeVideoUrl, setYouTubeVideoUrl] = useState('');

  const handleOk = () => {
    const videoData = getComponent('youTubeVideo');
    videoData.column[0].component[0].componentProperties = {
      value: youTubeVideoUrl,
    };
    updateComponentState({
      ...componentValues,
      row: [...componentValues.row, { ...videoData }],
    });
    setScrollToBottom(true);
    setComponentProperties({});
    onCancel();
  };

  const onModalCancel = () => {
    onCancel();
    setYouTubeVideoUrl();
  };

  const handleYouTubePlayer = (event) => {
    const file = event.target.value;
    setYouTubeVideoUrl(file);
  };

  const youTubeIframeEmbeds = (
    <div className="">
      Link
      <TextArea
        name="link"
        placeholder="Please enter the URL for embedding a YouTube player"
        onChange={handleYouTubePlayer}
      />
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
        <p className="ant-upload-hint">Support youtube embed Url </p>
        {youTubeIframeEmbeds}
      </Modal>
    </div>
  );
}

export default YoutubeVideoUploadPreviewModal;
