import React, { useState } from 'react';
import { Row, Divider, Col } from 'antd';
import SocialModal from './social-media/social-modal';
import CustomDragUpload from '../../shared/upload-helper';
import { PAGE_BUILDER_UPLOAD } from '../../shared/constant-values';

function ImageUploadModal(properties) {
  const {
    setFileList,
    fileListState,
    setUploadObject,
    uploadObject,
    metaArray,
    setMetaArray,
    mobileView,
    uncheckIndex,
    setUncheckIndex,
    visibility,
    componentUid,
    updateImageSource,
    width,
    height,
    editType,
    setImageModal,
    setOpenTourModal,
    setCurrentStep,
    openTourModal,
    textValue,
    resolution,
  } = properties;

  const [instagramModal, setInstagramModal] = useState(false);
  const [facebookModal, setFacebookModal] = useState(false);
  const [googleModal, setGoogleModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [metaLogged, setMetaLogged] = useState(false);
  const [fbData, setFbData] = useState([]);
  const [connectFacebook, setConnectFacebook] = useState(false);
  const [connectInstagram, setConnectInstagram] = useState(false);
  const [facebookList, setFacebookList] = useState([]);
  const [instagramList, setInstagramList] = useState([]);

  const [closeTourModal, setCloseTourModal] = useState(false);

  const showUploadModal = (type) => {
    if (type === 'facebook') {
      setFacebookModal(true);
      setGoogleModal(false);
      setInstagramModal(false);
      if (metaLogged) {
        setConnectFacebook(true);
      } else {
        setConnectFacebook(false);
        setConnectInstagram(false);
      }
    } else if (type === 'google') {
      setGoogleModal(true);
      setFacebookModal(false);
      setInstagramModal(false);
    } else {
      setInstagramModal(true);
      setFacebookModal(false);
      setGoogleModal(false);
      if (metaLogged) {
        setConnectInstagram(true);
      } else {
        setConnectFacebook(false);
        setConnectInstagram(false);
      }
    }
    setUploadModal(true);
  };

  const renderUploadColumn = (list, indexId) => (
    <Col span={12} key={indexId}>
      <CustomDragUpload
        widthVal={width}
        heightVal={height}
        marginVal="5px"
        setFileList={setFileList}
        fileListState={fileListState}
        accept="video/*, image/*"
        item={list}
        index={indexId + 1}
        setUploadObject={setUploadObject}
        uploadObject={uploadObject}
        showUploadModal={showUploadModal}
        instagramModal={instagramModal}
        setInstagramModal={setInstagramModal}
        googleModal={googleModal}
        setGoogleModal={setGoogleModal}
        facebookModal={facebookModal}
        setFacebookModal={setFacebookModal}
        uploadModal={uploadModal}
        setUploadModal={setUploadModal}
        metaLogged={metaLogged}
        setConnectFacebook={setConnectFacebook}
        setConnectInstagram={setConnectInstagram}
        metaArray={metaArray}
        setMetaArray={setMetaArray}
        fbData={fbData}
        setFbData={setFbData}
        mobileView={mobileView}
        setUncheckIndex={setUncheckIndex}
        componentUid={componentUid}
        facebookList={facebookList}
        setFacebookList={setFacebookList}
        instagramList={instagramList}
        setInstagramList={setInstagramList}
        setOpenTourModal={setOpenTourModal}
        setCurrentStep={setCurrentStep}
        openTourModal={openTourModal}
        closeTourModal={closeTourModal}
        setCloseTourModal={setCloseTourModal}
      />
    </Col>
  );

  const handleLeftCustom = () => {
    return (
      <CustomDragUpload
        widthVal={width}
        heightVal={height}
        marginVal="0px"
        setFileList={setFileList}
        fileListState={fileListState}
        accept="video/*, image/*"
        item={uploadObject[0]}
        index={0}
        setUploadObject={setUploadObject}
        uploadObject={uploadObject}
        showUploadModal={showUploadModal}
        instagramModal={instagramModal}
        setInstagramModal={setInstagramModal}
        googleModal={googleModal}
        setGoogleModal={setGoogleModal}
        facebookModal={facebookModal}
        setFacebookModal={setFacebookModal}
        uploadModal={uploadModal}
        setUploadModal={setUploadModal}
        metaLogged={metaLogged}
        setConnectFacebook={setConnectFacebook}
        setConnectInstagram={setConnectInstagram}
        metaArray={metaArray}
        setMetaArray={setMetaArray}
        fbData={fbData}
        setFbData={setFbData}
        mobileView={mobileView}
        setUncheckIndex={setUncheckIndex}
        visibility={visibility}
        resolution={resolution}
        componentUid={componentUid}
        updateImageSource={updateImageSource}
        facebookList={facebookList}
        setFacebookList={setFacebookList}
        instagramList={instagramList}
        setInstagramList={setInstagramList}
        editType={editType}
        setImageModal={setImageModal}
        setOpenTourModal={setOpenTourModal}
        setCurrentStep={setCurrentStep}
        openTourModal={openTourModal}
        closeTourModal={closeTourModal}
        setCloseTourModal={setCloseTourModal}
        textValue={textValue}
      />
    );
  };

  return (
    <div>
      {visibility !== 'image-only' && visibility !== PAGE_BUILDER_UPLOAD ? (
        <div
          style={
            mobileView ||
            visibility === 'image-only' ||
            visibility === PAGE_BUILDER_UPLOAD
              ? { padding: '0px' }
              : { padding: '20px' }
          }
        >
          <Row gutter={16}>
            <Col xs={13} sm={13} md={13} lg={13} xl={13}>
              {handleLeftCustom()}
            </Col>
            <Col xs={11} sm={11} md={11} lg={11} xl={11}>
              <Row gutter={16}>
                {uploadObject
                  .slice(1, 7)
                  .map((element, indexId) =>
                    renderUploadColumn(element, indexId)
                  )}
              </Row>
            </Col>
          </Row>
          {!mobileView && <Divider>or import from</Divider>}
        </div>
      ) : (
        handleLeftCustom()
      )}

      <SocialModal
        showUploadModal={showUploadModal}
        instagramModal={instagramModal}
        setInstagramModal={setInstagramModal}
        googleModal={googleModal}
        setGoogleModal={setGoogleModal}
        facebookModal={facebookModal}
        setFacebookModal={setFacebookModal}
        uploadModal={uploadModal}
        setUploadModal={setUploadModal}
        setFileList={setFileList}
        fileListState={fileListState}
        metaLogged={metaLogged}
        setMetaLogged={setMetaLogged}
        connectFacebook={connectFacebook}
        setConnectFacebook={setConnectFacebook}
        connectInstagram={connectInstagram}
        setConnectInstagram={setConnectInstagram}
        setUploadObject={setUploadObject}
        uploadObject={uploadObject}
        metaArray={metaArray}
        setMetaArray={setMetaArray}
        fbData={fbData}
        setFbData={setFbData}
        mobileView={mobileView}
        uncheckIndex={uncheckIndex}
        setUncheckIndex={setUncheckIndex}
        visibility={visibility}
        resolution={resolution}
        componentUid={componentUid}
        updateImageSource={updateImageSource}
        facebookList={facebookList}
        setFacebookList={setFacebookList}
        instagramList={instagramList}
        setInstagramList={setInstagramList}
        setImageModal={setImageModal}
        setOpenTourModal={setOpenTourModal}
        setCurrentStep={setCurrentStep}
        openTourModal={openTourModal}
        closeTourModal={closeTourModal}
        setCloseTourModal={setCloseTourModal}
      />
    </div>
  );
}

export default ImageUploadModal;
