import React from 'react';
import { get, map } from 'lodash';
import ImageUploadModal from './image-upload';
import { useComponentContext } from '../../context/components';
import { SCREEN_MODE_EDIT } from '../../../../shared/constant-values';

function ImageCarouselComponentModal() {
  const {
    updateImageSource,
    editCarousel,
    setEditCarousel,
    componentProperties,
  } = useComponentContext();

  const onCancel = () => {
    setEditCarousel(false);
  };

  const handleUpload = (file) => {
    updateImageSource({
      componentUid: get(componentProperties, 'componentUid', ''),
      value: file,
      action: {},
    });
  };
  const carouselArray = get(componentProperties, 'value', '');
  const imageArray = map(carouselArray, (item) => {
    return item;
  });

  return (
    <div>
      {editCarousel && (
        <ImageUploadModal
          visible={editCarousel}
          onCancel={onCancel}
          editFileList={imageArray}
          onUpload={handleUpload}
          from={SCREEN_MODE_EDIT}
        />
      )}
    </div>
  );
}

export default ImageCarouselComponentModal;
