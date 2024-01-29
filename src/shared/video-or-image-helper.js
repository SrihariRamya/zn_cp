import React from 'react';
import { VIDEO_TYPES } from './constant-values';

const VideoORImage = (properties) => {
  const {
    imageOrVideoSrc,
    imageAltName,
    imageClassName,
    videoClassName,
    preload,
    onClick,
  } = properties;
  return (
    <>
      {imageOrVideoSrc &&
      imageOrVideoSrc.split('.').some((type) => VIDEO_TYPES.includes(type)) ? (
        <video
          className={videoClassName}
          width="100%"
          height="100%"
          preload={preload}
          kind="captions"
          autoPlay
          muted
          loop
          onClick={onClick}
        >
          <track kind="captions" />
          <source kind="captions" src={imageOrVideoSrc} type="video/mp4" />
        </video>
      ) : (
        <img
          draggable={false}
          alt={imageAltName}
          role="presentation"
          onClick={onClick}
          className={imageClassName}
          src={imageOrVideoSrc}
        />
      )}
    </>
  );
};

export default VideoORImage;
