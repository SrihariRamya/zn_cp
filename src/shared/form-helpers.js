import React, { useState } from 'react';
import ImgCrop from 'antd-img-crop';
import { Upload, Button, Modal, notification } from 'antd';
import Resizer from 'react-image-file-resizer';
import { PlusOutlined, CloseOutlined, CameraOutlined } from '@ant-design/icons';
import { forEach, trim } from 'lodash';
import {
  CLIC_UPLOAD_FILE_FORM_PRODUCT,
  CLIC_UPLOAD_FILE_FORM_SETTINGS,
  NORMAL_UPLOAD_FILE,
  PRODUCT_MEDIA_COUNT,
} from './constant-values';
import { onBeforeUpload, checkVideoWH } from './image-validation';

const dummyRequest = ({ onSuccess }) => {
  setTimeout(() => {
    onSuccess({ success: true });
  }, 10);
};

export default function getFormItemRules(arguments_) {
  const {
    required,
    whitespace,
    mobile,
    ipAddress,
    positiveNumber,
    minMax,
    minLength,
    maxLength,
    number,
    alphanumeric,
    onlyNumber,
    pincode,
    email,
    error,
  } = arguments_;
  const rulesData = [];
  if (required) {
    rulesData.push({ required: true });
  }
  if (whitespace) {
    rulesData.push({
      validator(_, value) {
        if (
          value &&
          (!value.toString().slice(0, 1).trim() ||
            !value.toString().slice(-1).trim())
        ) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Whitespace around the value not allowed');
        }
        return Promise.resolve();
      },
    });
  }
  if (mobile) {
    rulesData.push({
      validator(_, value) {
        if (value) {
          const removespace = value.replaceAll(/\s+/g, '');
          const pattern = /^(\+\d{1,3}[ -]?)?\d{10}$/;
          if (!pattern.test(removespace)) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject('Invalid Phone Number');
          }
          return Promise.resolve();
        }
        return Promise.resolve();
      },
    });
  }
  if (ipAddress) {
    rulesData.push({
      validator(_, value) {
        const pattern = /^(\s*(?:\d{1,3}\.){3}\d{1,4})\s*$/;
        if (value && !pattern.test(value)) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Invalid IP address.');
        }
        return Promise.resolve();
      },
    });
  }
  if (positiveNumber) {
    rulesData.push({
      validator: (_, value) => {
        if (value && value < 0) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Value should not be a negative number');
        }
        return Promise.resolve();
      },
    });
  }
  if (number) {
    rulesData.push({ type: 'number', message: 'Please enter a valid number' });
  }
  if (minMax) {
    rulesData.push({
      validator: (_, value) => {
        if ((!value || value <= 100) && value !== 0) {
          return Promise.resolve();
        }
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('Coupon % value should be between 1 to 100.');
      },
    });
  }
  if (alphanumeric) {
    rulesData.push({
      validator: (_, value) => {
        const regEx = /^(?=.*\d)(?=.*[A-Za-z])([\dA-Za-z]+)$/;
        if (value && !regEx.test(value)) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('coupon code must alphanumeric format');
        }
        return Promise.resolve();
      },
    });
  }
  if (minLength) {
    rulesData.push({
      validator: (_, value) => {
        if (value && value?.length < minLength) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('coupon code must 6 characters');
        }
        return Promise.resolve();
      },
    });
  }
  if (maxLength) {
    rulesData.push({
      validator: (_, value) => {
        if (value && value.toString()?.length > maxLength) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject(`${error} must 6 characters`);
        }
        return Promise.resolve();
      },
    });
  }
  /** this validation input field accept only numbers  */
  if (onlyNumber) {
    rulesData.push({
      validator: (_, value) => {
        const regex = /^\d+$/;
        if (value && !regex.test(value)) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Please enter valid number');
        }
        return Promise.resolve();
      },
    });
  }
  if (pincode) {
    rulesData.push({
      validator: (_, value) => {
        const regex = /^[1-9]\d{5}$/;
        if (value && !regex.test(value)) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Please enter valid pincode');
        }
        return Promise.resolve();
      },
    });
  }
  if (email) {
    rulesData.push({
      validator(_, value) {
        const pattern =
          /^[ .A-Za-z][\d .A-Za-z]+@(?:[\dA-Za-z]+\.)+[A-Za-z]+\s*$/;
        if (value && !pattern.test(value)) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Please enter a valid email address');
        }
        return Promise.resolve();
      },
    });
  }

  return rulesData;
}

export function CustomUpload(properties) {
  const [filechanged, setFilechanged] = useState(0);
  const [uriArray, setUriArray] = useState([]);
  const {
    onChange,
    id: domId,
    className,
    filetype,
    setFileList,
    fileListState,
    handlePreview,
    width,
    height,
    maxItem,
    listType,
    disabled,
    fileformat,
    filequality,
    skipResize,
    buttonUpload,
    validateBanner,
    cropImage = true,
    from = NORMAL_UPLOAD_FILE,
    title = '',
    allowVideo = false,
    fileUploadCount,
    setFileUploadCount,
    accept = 'image/*',
    couponImage,
    showPreview = true,
  } = properties;
  const triggerChange = (changedValue) => {
    if (onChange) {
      onChange(changedValue);
    }
  };

  const croppedFile = async (newFileList) => {
    setUriArray([]);
    return new Promise((resolve) => {
      const uriResolve = () =>
        newFileList?.length === uriArray?.length && resolve(uriArray);
      // eslint-disable-next-line no-restricted-syntax
      for (const [index, list] of newFileList.entries()) {
        if (
          list.originFileObj === undefined &&
          uriArray?.length <= newFileList?.length
        ) {
          uriArray[uriArray?.length] = list;
          uriResolve();
        } else if (uriArray?.length <= newFileList?.length) {
          Resizer.imageFileResizer(
            newFileList[index].originFileObj,
            width,
            height,
            fileformat || 'JPEG',
            filequality || 100,
            0,
            (uri) => {
              uriArray[uriArray?.length] = { originFileObj: uri };
              uriResolve();
            },
            'file',
            width,
            height
          );
        } else {
          setUriArray([...uriArray]);
        }
      }
    });
  };

  const onFileChange = async ({ fileList: newFileList }) => {
    newFileList.map((image) => {
      image.status = 'done';
      return image;
    });
    setFileList(newFileList);
    triggerChange(newFileList);
    if (
      (newFileList?.length === fileListState?.length ||
        newFileList?.length < fileListState?.length) &&
      newFileList?.length > 0 &&
      skipResize === undefined
    ) {
      setFilechanged(filechanged + 1);
      const cropfile = await new Promise((resolve) => {
        const output = croppedFile(newFileList);
        resolve(output);
      });
      const cropmapped = cropfile.map((cropimg, index) => {
        if (cropimg.originFileObj !== undefined) {
          const reader = URL.createObjectURL(cropimg.originFileObj);
          return {
            ...cropimg,
            lastModified: cropimg.originFileObj.lastModified,
            lastModifiedDate: cropimg.originFileObj.lastModifiedDate,
            name: cropimg.originFileObj.name,
            percent: newFileList[index].percent,
            response: newFileList[index].response,
            size: cropimg.originFileObj.size,
            status: newFileList[index].status,
            thumbUrl:
              newFileList[index].thumbUrl === ''
                ? reader
                : newFileList[index].thumbUrl,
            type: cropimg.originFileObj.type,
            uid: newFileList[index].uid,
            xhr: newFileList[index].xhr,
          };
        }
        return cropimg;
      });
      setFileList(cropmapped);
      triggerChange(cropmapped);
    } else if (newFileList?.length > fileListState?.length) {
      setFilechanged(0);
    } else {
      setFilechanged(0);
    }
  };

  const onSvgFileChange = ({ fileList }) => {
    fileList.map((image) => {
      image.status = 'done';
      return image;
    });
    setFileList(fileList);
    triggerChange(fileList);
  };

  const handleBeforeUpload = async (file, isVideoFile) => {
    if (fileUploadCount + 1 > PRODUCT_MEDIA_COUNT) {
      notification.error({
        description: `Only ${PRODUCT_MEDIA_COUNT} media can be uploaded`,
      });
      return Upload.LIST_IGNORE;
    }
    if (isVideoFile) {
      const isVideo = file.type === 'video/mp4';
      const isLt2M = file.size / 1024 / 1024 < 20;
      if (!isVideo && allowVideo) {
        notification.error({ message: 'You can only upload video MP4 files!' });
        return Upload.LIST_IGNORE;
      }
      if (!isLt2M) {
        notification.error({
          description: 'Video must be smaller than 20MB',
        });
        return Upload.LIST_IGNORE;
      }
      try {
        await checkVideoWH(file);
      } catch {
        notification.error({
          message: 'The aspect ratio of the video should be less than 16:9.',
        });
        return Upload.LIST_IGNORE;
      }
      return false;
    }
    if (!file.type.includes('video')) {
      const check = await onBeforeUpload(
        file,
        fileListState,
        {
          filetype,
          validateBanner,
        },
        allowVideo
      );
      if (!check) {
        return Upload.LIST_IGNORE;
      }
    }
    setFileUploadCount(fileUploadCount + 1);
    return true;
  };

  const handleRemove = (file, isVideoFile) => {
    const { confirm } = Modal;
    return new Promise((resolve, reject) => {
      confirm({
        width: '32rem',
        title: (
          <h3>
            {`Are you sure you want to delete this ${
              isVideoFile ? 'Video' : 'image'
            }?`}
          </h3>
        ),
        icon: false,
        okText: 'Delete',
        cancelText: 'Cancel',
        okButtonProps: {
          type: 'default',
          style: {
            backgroundColor: 'red',
            background: '#fc5050',
            color: '#fff',
            borderRadius: '5px',
            height: '45px',
            width: '85px',
            border: 'none',
          },
        },
        cancelButtonProps: {
          style: {
            background: '#f4f4f4',
            borderColor: '#f4f4f4',
            borderRadius: '5px',
            color: '#fc5050',
            height: '45px',
            width: '85px',
          },
        },
        centered: true,
        closeIcon: <CloseOutlined className="close-icon" />,
        closable: true,
        onCancel: () => {
          reject();
        },
        onOk: () => {
          resolve(true);
          const index = fileListState.indexOf(file);
          const newFileList = [...fileListState];
          newFileList.splice(index, 1);
          setFileList(newFileList);
        },
      });
    });
  };

  if (buttonUpload) {
    return (
      <div className={className || ''} id={domId}>
        {/* <ImgCrop
          aspect={width / height}
          shape="rect"
          grid
          // quality={1}
          modalWidth={550}
          fillColor={(fileformat === 'PNG' && 'transparent') || 'white'}
          beforeCrop={(i)=>console.log('img crop=>',i)}
        > */}
        <Upload
          // listType={listType || 'picture-card'}
          onPreview={handlePreview}
          customRequest={dummyRequest}
          fileList={fileListState}
          maxCount={maxItem}
          beforeUpload={(file) => {
            return onBeforeUpload(file, fileListState, { filetype });
          }}
          onChange={onFileChange}
          disabled={disabled}
          onRemove={(event) => handleRemove(event)}
          accept={accept}
        >
          <Button disabled={disabled} type="primary">
            Upload Image
          </Button>
        </Upload>
        {/* </ImgCrop> */}
      </div>
    );
  }
  if (allowVideo) {
    return (
      <Upload
        listType={listType || 'picture-card'}
        onPreview={handlePreview}
        customRequest={dummyRequest}
        fileList={fileListState}
        maxCount={maxItem}
        accept={accept}
        beforeUpload={(file) => handleBeforeUpload(file, allowVideo)}
        onChange={onFileChange}
        disabled={disabled}
        onRemove={(event) => handleRemove(event, allowVideo)}
        showUploadList={{ showPreviewIcon: showPreview }}
      >
        {fileListState?.length >= 2 ||
        fileUploadCount >= maxItem ? undefined : (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        )}
      </Upload>
    );
  }
  return (
    <div className={className || ''} id={domId}>
      {filetype !== 'svg' && cropImage ? (
        <ImgCrop
          aspect={width / height}
          cropShape="rect"
          showGrid
          // quality={1}
          modalWidth={550}
          fillColor={(fileformat === 'PNG' && 'transparent') || 'white'}
          beforeCrop={() => {
            return true;
          }}
        >
          <Upload
            listType={listType || 'picture-card'}
            onPreview={handlePreview}
            customRequest={dummyRequest}
            fileList={fileListState}
            maxCount={maxItem}
            accept={accept}
            beforeUpload={(file) => handleBeforeUpload(file)}
            onChange={onFileChange}
            onRemove={(event) => handleRemove(event)}
            disabled={disabled}
          >
            {fileListState?.length >= maxItem ||
            fileUploadCount >= maxItem ? undefined : (
              <div>
                {from === CLIC_UPLOAD_FILE_FORM_PRODUCT && (
                  <div>
                    <div className="upload-text">
                      Upload Videos and Photos of your Products
                    </div>
                    <div className="upload-icon">
                      <CameraOutlined />
                    </div>
                  </div>
                )}
                {from === CLIC_UPLOAD_FILE_FORM_SETTINGS && (
                  <div className="text-center">
                    <div className="upload-text">{title}</div>
                    <div className="upload-icon">
                      <CameraOutlined />
                    </div>
                    <div className="upoad-info-text">
                      The best fit image resolution is
                    </div>
                    <div className="upoad-resolution-text">
                      {width}x{height}
                    </div>
                  </div>
                )}
                {from === NORMAL_UPLOAD_FILE && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                    {couponImage && (
                      <div className="image-text">
                        {' '}
                        348 x 348 resolution for better fit.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Upload>
        </ImgCrop>
      ) : (
        <Upload
          listType={listType || 'picture-card'}
          onPreview={handlePreview}
          customRequest={dummyRequest}
          fileList={fileListState}
          maxCount={maxItem}
          beforeUpload={(file) =>
            onBeforeUpload(file, fileListState, { filetype, validateBanner })
          }
          onChange={onSvgFileChange}
          disabled={disabled}
        >
          {fileListState?.length >= maxItem ? undefined : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
      )}
    </div>
  );
}

export const trimPayloadFields = (values, trimFormValues) => {
  forEach(values, (value, key) => {
    if (typeof value === 'string' || typeof value === 'number') {
      trimFormValues[key] = trim(value);
    } else if (typeof value === 'object' || typeof value === 'boolean') {
      trimFormValues[key] = value;
    }
    return trimFormValues;
  });
};

export const handleKeyDown = (event) => {
  const key = event.keyCode;
  if (key === 32 || key === 'Space') event.preventDefault();
};

export const validatePhoneNumber = ({ phone, isError, phoneNumber }) => {
  const rulesData = [];
  if (phone && isError) {
    rulesData.push({
      validator() {
        if (phoneNumber?.length > 5) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Please enter your Phone Number'));
      },
    });
  }
  return rulesData;
};
