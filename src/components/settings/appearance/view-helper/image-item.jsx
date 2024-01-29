import { get, has, isEmpty, map } from 'lodash';
import React, { useEffect } from 'react';
import { notification, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { getBase64 } from '../../../../shared/attributes-helper';
import { IS_JPG_OR_PNG_OR_WEBP } from '../../../../shared/constant-values';
import { checkImageFileType } from '../../../../shared/function-helper';

const { Dragger } = Upload;

function ImageItem({
  data,
  editorContext,
  setEditorContext,
  rowIndex,
  columnIndex,
  column,
}) {
  useEffect(() => {}, [
    columnIndex,
    data,
    rowIndex,
    data.section_image_content,
    data.preview,
    data.width,
    data.height,
    column,
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
    return null;
  };

  const properties = {
    name: 'file',
    multiple: false,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    onChange: (info) => onChangeHandler(info),
  };
  const beforeUpload = (file) => {
    const isVideo = checkImageFileType(file.type);
    if (!isVideo) {
      notification.error({ message: IS_JPG_OR_PNG_OR_WEBP });
      return Upload.LIST_IGNORE;
    }
    return false;
  };
  if (
    isEmpty(get(data, 'section_image_content.Location')) &&
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
        <p className="ant-upload-hint">Support image files </p>
      </Dragger>
    );
  }
  return (
    <div style={{ textAlign: 'center' }}>
      <img
        src={get(
          data,
          'preview',
          get(data, 'section_image_content.Location', '')
        )}
        alt="content"
        style={{
          width: `${get(data, 'width', '100')}%`,
        }}
      />
    </div>
  );
}

export default ImageItem;
