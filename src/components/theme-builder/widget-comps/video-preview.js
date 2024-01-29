import React from 'react';
import { get } from 'lodash';

const VideoPreview = (properties) => {
  const { videoSrc, data } = properties;
  return (
    <div>
      <>
        <video
          className="video-preview-modal"
          width="100%"
          height="80%"
          preload="auto"
          autoPlay
          loop
          controls
          kind="captions"
        >
          <track kind="captions" />
          <source
            kind="captions"
            src={videoSrc}
            type="video/mp4"
            className="main-image"
          />
        </video>
      </>
      <h2>{get(data, 'product_name', '')}</h2>
    </div>
  );
};
export default VideoPreview;
