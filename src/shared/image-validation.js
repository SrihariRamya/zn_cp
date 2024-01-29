import { notification } from 'antd';
import { get, findIndex } from 'lodash';
import { IS_JPG_OR_PNG_OR_WEBP } from './constant-values';
import { checkImageFileType } from './function-helper';

/* eslint-disable import/prefer-default-export */
const validateFile = async (
  file,
  fileListState,
  { filetype, validateBanner, width, height },
  allowVideo
) => {
  const fileIndex = findIndex(
    fileListState,
    (item) =>
      (
        item.name.split('.').slice(0, 1).join('.') ||
        get(item, 'originFileObj.name', '')
      )
        .split('.')
        .slice(0, 1)
        .join('.') === file.name.split('.').slice(0, 1).join('.')
  );
  const isJpgOrPng = checkImageFileType(file.type);
  const isIconOrSvg =
    file.type === 'image/x-icon' || file.type === 'image/svg+xml';
  const isLt2M = file.size / 1024 / 1024 < 2;
  const isDuplicate = !!(fileIndex >= 0 && fileListState.length > 0);
  if (filetype === 'svg' && !isIconOrSvg) {
    notification.error({ description: 'You can only upload ICON/SVG file!' });
  } else if (filetype !== 'svg' && !isJpgOrPng && !allowVideo) {
    notification.error({
      description: IS_JPG_OR_PNG_OR_WEBP,
    });
    return false;
  } else if (!isLt2M && !allowVideo) {
    notification.error({ description: 'Image must be smaller than 2MB' });
    return false;
  } else if (isDuplicate) {
    notification.error({ description: 'Duplicate file.' });
  } else if (
    get(validateBanner, 'width', '') &&
    get(validateBanner, 'height', '') &&
    (get(validateBanner, 'width', '') !== width ||
      get(validateBanner, 'height', '') !== height)
  ) {
    notification.error({
      description: 'Banner image height should be equal to the existing images',
    });
    return false;
  }
  return (
    ((filetype !== 'svg' && isJpgOrPng) ||
      (filetype === 'svg' && isIconOrSvg)) &&
    isLt2M &&
    !isDuplicate
  );
};

export const onBeforeUpload = async (
  file,
  fileListState,
  { filetype, validateBanner },
  allowVideo
) => {
  const uploadValue = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => {
      const img = document.createElement('img');
      img.src = reader.result;
      img.addEventListener('load', () => {
        const { width, height } = img;
        const validationStatus = validateFile(
          file,
          fileListState,
          {
            filetype,
            validateBanner,
            width,
            height,
          },
          allowVideo
        );
        validationStatus
          .then((response) => {
            if (response) {
              resolve(response);
            }
          })
          .catch((error) => {
            reject(new Error(error));
          });
      });
    });
  });
  return uploadValue;
};
export const validateProductImage = async (file) => {
  let imageNameFormat = false;
  const imageName = file.name;
  if (!/^\d+-\d+\.[a-z]+$/.test(imageName)) {
    imageNameFormat = true;
  }
  if (imageNameFormat) {
    notification.error({
      description:
        'Image Name should be in the Format [ImageMapId]-[AnyInteger].[String]',
    });
  }
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isLt2M) {
    notification.error({ description: 'Image must be smaller than 2MB' });
  }

  return true;
};

export const checkVideoWH = (file) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      // eslint-disable-next-line unicorn/numeric-separators-style
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
