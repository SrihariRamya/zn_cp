import { get, isEmpty } from 'lodash';
import React, { useState, useContext, useEffect } from 'react';
import ImageUploadModal from '../../../../products/image-modal';
import { useComponentContext } from '../../../context/components';
import { TenantContext } from '../../../../context/tenant-context';
import { PAGE_BUILDER_UPLOAD } from '../../../../../shared/constant-values';

function ImageComponent(properties) {
  const { comp } = properties;
  const { updateImageSource, imageModal, setImageModal } =
    useComponentContext();

  const { componentProperties, componentUid } = comp;
  const [fileList, setFileList] = useState([]);
  const [metaArray, setMetaArray] = useState([]);
  const [uploadObject, setUploadObject] = useState([
    { id: 1, isDisable: true, url: '' },
  ]);
  const mobileView = useContext(TenantContext)[4];

  useEffect(() => {
    if (get(properties, 'comp.componentProperties.value') === '') {
      setUploadObject([{ id: 1, isDisable: true, url: '' }]);
      setMetaArray([]);
      setFileList([]);
    }
  }, [componentProperties?.value]);

  return (
    <>
      <div />
      {isEmpty(get(componentProperties, 'value')) ? (
        <div
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            alignContent: 'center',
            height: '100%',
          }}
        >
          <ImageUploadModal
            uploadObject={uploadObject}
            setUploadObject={setUploadObject}
            metaArray={metaArray}
            setMetaArray={setMetaArray}
            mobileView={mobileView}
            visibility={PAGE_BUILDER_UPLOAD}
            setFileList={setFileList}
            fileListState={fileList}
            componentUid={componentUid}
            updateImageSource={updateImageSource}
            width={100}
            height={280}
            imageModal={imageModal}
            setImageModal={setImageModal}
          />
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              top: '0px',
              left: '0px',
              width: '100%',
              height: '100%',
              position: 'initial',
            }}
          >
            <div
              className="image-test"
              id={`${componentUid}_image`}
              aria-hidden="true"
              style={{
                backgroundImage: `url(${get(componentProperties, 'value')})`,
                width: '100%',
                height: '100%',
                backgroundSize: 'cover',
                backgroundPosition: '50%',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
export default ImageComponent;
