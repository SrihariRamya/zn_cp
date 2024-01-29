/* eslint-disable jsx-a11y/media-has-caption */
import { InboxOutlined } from '@ant-design/icons';
import { notification, Upload } from 'antd';
import { get, has, isEmpty, map } from 'lodash';
import React, { useEffect, useState } from 'react';
import { getBase64 } from '../../../../shared/attributes-helper';

const { Dragger } = Upload;

function VideoItem({ data, editorContext, setEditorContext, render }) {
  const [videoAction, setVideoAction] = useState(false);
  useEffect(() => {}, [
    data,
    data.section_video_content,
    data.preview,
    data.image,
  ]);

  const onChangeHandler = async (info) => {
    const { status } = info.file;
    if (status !== ('uploading' || 'error')) {
      await setEditorContext(
        map(editorContext, (item) => {
          map(item.column, async (element) => {
            if (
              get(element, 'section.appearance_section_uid') ===
              get(data, 'appearance_section_uid')
            ) {
              const returnFile = info.fileList;
              let preview;
              if (has(info, 'fileList[0].originFileObj')) {
                preview = await getBase64(
                  get(info, 'fileList[0].originFileObj', '')
                );
              }
              element.section.fileList = returnFile;
              element.section.preview = preview;
              element.section.width = 100;
            }
            return element;
          });
          return item;
        })
      );
    }
  };

  const properties = {
    name: 'file',
    multiple: false,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    onChange: (info) => onChangeHandler(info),
  };
  const checkVideoWH = (file) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        if (video.videoWidth / video.videoHeight > 1.7777777777777777) {
          reject();
        } else {
          resolve();
        }
      };
      video.src = url;
      video.load();
    });
  };
  const beforeUpload = async (file) => {
    const isVideo = file.type === 'video/mp4';
    if (!isVideo) {
      notification.error({ message: 'You can only upload video/mp4 file!' });
      return Upload.LIST_IGNORE;
    }
    try {
      await checkVideoWH(file);
    } catch (error) {
      notification.error({
        message: 'The aspect ratio of the video should be less than 16:9',
      });
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  if (
    isEmpty(get(data, 'section_video_content', {})) &&
    isEmpty(get(data, 'preview'))
  ) {
    return (
      <Dragger beforeUpload={beforeUpload} {...properties}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">Support video files </p>
      </Dragger>
    );
  }
  return (
    <div style={{ textAlign: 'center' }}>
      {render === 'editor' && <h1>Video Component</h1>}
      <video
        width={`${get(data, 'width', '50')}%`}
        muted={!videoAction && render === 'preview'}
        controls={videoAction}
        loop={render === 'preview'}
        autoPlay={render === 'preview'}
        preload="auto"
        onMouseOver={() => setVideoAction(true)}
        onMouseOut={() => setVideoAction(false)}
        onFocus={() => {}}
        onBlur={() => {}}
      >
        <source
          kind="captions"
          src={get(
            data,
            'preview',
            get(data, 'section_video_content.Location', '')
          )}
          type="video/mp4"
        />
      </video>
    </div>
  );
}

export default VideoItem;
