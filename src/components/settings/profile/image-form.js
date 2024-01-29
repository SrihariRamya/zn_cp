import { Col, Form, Modal, Row } from 'antd';
import React, { useState } from 'react';
import { get } from 'lodash';
import { InfoCircleOutlined } from '@ant-design/icons';
import ImageUploadModal from '../../products/image-modal';
import { CustomUpload } from '../../../shared/form-helpers';
import { getBase64 } from '../../../shared/attributes-helper';
import {
  CLIC_UPLOAD_FILE_FORM_SETTINGS,
  TENANT_MODE_CLIC,
} from '../../../shared/constant-values';
import InfoModal from './info-modal';
import brandLogo from '../../../assets/images/brand-logo.jpg';
import adminPanelLogo from '../../../assets/images/admin-panel-logo.jpg';
import logInImg from '../../../assets/images/log-in-image.jpg';
import otpImg from '../../../assets/images/otp-image.jpg';
import favIcon from '../../../assets/images/favicon.jpg';

function ImageForm(properties) {
  const {
    tenantDetails,
    backGroundListState,
    adminfileListState,
    fileListState,
    faviconListState,
    setFileList,
    setbackGroundFileList,
    setfaviconList,
    setAdminFileList,
    setOtpFileList,
    setLoginFileList,
    loginListState,
    otpListState,
    imageProps,
  } = properties;

  const {
    uploadObjectBrandLogo,
    uploadObjectAdminLogo,
    uploadObjectLoginImg,
    uploadObjectOtpImg,
    uploadObjectAdminLoginImg,
    uploadObjectFavIcon,
    setUploadObjectBrandLogo,
    setUploadObjectAdminLogo,
    setUploadObjectLoginImg,
    setUploadObjectOtpImg,
    setUploadObjectAdminLoginImg,
    setUploadObjectFavIcon,
  } = imageProps;

  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [metaArrayBrandLogo, setMetaArrayBrandLogo] = useState([]);
  const [metaArrayAdminLogo, setMetaArrayAdminLogo] = useState([]);
  const [metaArrayLoginImg, setMetaArrayLoginImg] = useState([]);
  const [metaArrayOtpImg, setMetaArrayOtpImg] = useState([]);
  const [metaArrayAdminLoginImg, setMetaArrayAdminLoginImg] = useState([]);
  const [metaArrayFavIcon, setMetaArrayFavIcon] = useState([]);
  const [infoModal, setInfoModal] = useState(false);
  const [infoImg, setInfoImg] = useState('');
  const [, setFileUploadCount] = useState(0);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url.slice(Math.max(0, file.url.lastIndexOf('/') + 1))
    );
  };
  const handleCancel = () => {
    setPreviewVisible(false);
  };

  const infoModalCancel = () => {
    setInfoModal(false);
    setInfoImg('');
  };

  const handleInfoImg = (img) => {
    setInfoModal(true);
    setInfoImg(img);
  };

  return (
    <>
      {get(tenantDetails, 'tenant_mode') === TENANT_MODE_CLIC ? (
        <div className="image-form-container">
          <Row>
            <Col span={12}>
              <Form.Item name="brand_logo">
                <CustomUpload
                  width={700}
                  height={378}
                  maxItem={1}
                  setFileList={setFileList}
                  handlePreview={handlePreview}
                  fileListState={fileListState}
                  fileformat="PNG"
                  skipResize
                  from={CLIC_UPLOAD_FILE_FORM_SETTINGS}
                  title="Brand Logo"
                  setFileUploadCount={setFileUploadCount}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="admin_logo">
                <CustomUpload
                  width={120}
                  height={37}
                  maxItem={1}
                  setFileList={setAdminFileList}
                  handlePreview={handlePreview}
                  fileListState={adminfileListState}
                  from={CLIC_UPLOAD_FILE_FORM_SETTINGS}
                  title="Admin Logo"
                  setFileUploadCount={setFileUploadCount}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="back_logo">
                <CustomUpload
                  width={1366}
                  height={768}
                  maxItem={1}
                  setFileList={setbackGroundFileList}
                  handlePreview={handlePreview}
                  fileListState={backGroundListState}
                  from={CLIC_UPLOAD_FILE_FORM_SETTINGS}
                  title="Admin Login Image"
                  setFileUploadCount={setFileUploadCount}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fav_icon">
                <CustomUpload
                  filetype="x-icon"
                  width={128}
                  height={128}
                  maxItem={1}
                  setFileList={setfaviconList}
                  handlePreview={handlePreview}
                  fileListState={faviconListState}
                  from={CLIC_UPLOAD_FILE_FORM_SETTINGS}
                  title="Favicon Image"
                  setFileUploadCount={setFileUploadCount}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      ) : (
        <Row>
          <Col xs={12} sm={12} md={8} xl={8} span={8}>
            <Form.Item
              label={
                <span>
                  {' '}
                  Brand Logo{' '}
                  <InfoCircleOutlined
                    onClick={() => handleInfoImg(brandLogo)}
                  />{' '}
                </span>
              }
              name="brand_logo"
              className="two"
            >
              <ImageUploadModal
                item={uploadObjectBrandLogo}
                uploadObject={uploadObjectBrandLogo}
                setUploadObject={setUploadObjectBrandLogo}
                metaArray={metaArrayBrandLogo}
                setMetaArray={setMetaArrayBrandLogo}
                mobileView={false}
                visibility="image-only"
                setFileList={setFileList}
                handlePreview={handlePreview}
                setFileUploadCount={setFileUploadCount}
                fileListState={fileListState}
                width={155}
                height={160}
                resolution="200 x 80"
                editType={
                  uploadObjectBrandLogo[0]?.url?.length > 0 ||
                  uploadObjectBrandLogo[0]?.productImageInfo?.product_image
                    ?.length > 0
                }
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={8} xl={8} span={8}>
            <Form.Item
              label={
                <span>
                  Admin logo{' '}
                  <InfoCircleOutlined
                    onClick={() => handleInfoImg(adminPanelLogo)}
                  />{' '}
                </span>
              }
              name="admin_logo"
            >
              <ImageUploadModal
                item={uploadObjectAdminLogo}
                uploadObject={uploadObjectAdminLogo}
                setUploadObject={setUploadObjectAdminLogo}
                metaArray={metaArrayAdminLogo}
                setMetaArray={setMetaArrayAdminLogo}
                mobileView={false}
                visibility="image-only"
                setFileList={setAdminFileList}
                handlePreview={handlePreview}
                setFileUploadCount={setFileUploadCount}
                fileListState={adminfileListState}
                width={155}
                height={160}
                resolution="200 x 80"
                editType={
                  uploadObjectAdminLogo[0]?.url?.length > 0 ||
                  uploadObjectAdminLogo[0]?.productImageInfo?.product_image
                    ?.length > 0
                }
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={8} xl={8} span={8}>
            <Form.Item
              label={
                <span>
                  Login Image{' '}
                  <InfoCircleOutlined onClick={() => handleInfoImg(logInImg)} />{' '}
                </span>
              }
              name="login_logo"
            >
              <ImageUploadModal
                item={uploadObjectLoginImg}
                uploadObject={uploadObjectLoginImg}
                setUploadObject={setUploadObjectLoginImg}
                metaArray={metaArrayLoginImg}
                setMetaArray={setMetaArrayLoginImg}
                mobileView={false}
                visibility="image-only"
                setFileList={setLoginFileList}
                handlePreview={handlePreview}
                setFileUploadCount={setFileUploadCount}
                fileListState={loginListState}
                width={155}
                height={160}
                resolution="1920 x 1080"
                editType={
                  uploadObjectLoginImg[0]?.url?.length > 0 ||
                  uploadObjectLoginImg[0]?.productImageInfo?.product_image
                    ?.length > 0
                }
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={8} xl={8} span={8}>
            <Form.Item
              label={
                <span>
                  {' '}
                  OTP Image{' '}
                  <InfoCircleOutlined
                    onClick={() => handleInfoImg(otpImg)}
                  />{' '}
                </span>
              }
              name="otp_logo"
            >
              <ImageUploadModal
                item={uploadObjectOtpImg}
                uploadObject={uploadObjectOtpImg}
                setUploadObject={setUploadObjectOtpImg}
                metaArray={metaArrayOtpImg}
                setMetaArray={setMetaArrayOtpImg}
                mobileView={false}
                visibility="image-only"
                setFileList={setOtpFileList}
                handlePreview={handlePreview}
                setFileUploadCount={setFileUploadCount}
                fileListState={otpListState}
                width={155}
                height={160}
                resolution="1920 x 1080"
                editType={
                  uploadObjectOtpImg[0]?.url?.length > 0 ||
                  uploadObjectOtpImg[0]?.productImageInfo?.product_image
                    ?.length > 0
                }
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={8} xl={8} span={8}>
            <Form.Item label="Admin login Image" name="back_logo">
              <ImageUploadModal
                item={uploadObjectAdminLoginImg}
                uploadObject={uploadObjectAdminLoginImg}
                setUploadObject={setUploadObjectAdminLoginImg}
                metaArray={metaArrayAdminLoginImg}
                setMetaArray={setMetaArrayAdminLoginImg}
                mobileView={false}
                visibility="image-only"
                setFileList={setbackGroundFileList}
                handlePreview={handlePreview}
                setFileUploadCount={setFileUploadCount}
                fileListState={backGroundListState}
                width={155}
                height={160}
                resolution="1920 x 1080"
                editType={
                  uploadObjectAdminLoginImg[0]?.url?.length > 0 ||
                  uploadObjectAdminLoginImg[0]?.productImageInfo?.product_image
                    ?.length > 0
                }
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={8} xl={8} span={8}>
            <Form.Item
              label={
                <span>
                  Favicon Image{' '}
                  <InfoCircleOutlined onClick={() => handleInfoImg(favIcon)} />
                </span>
              }
              name="fav_icon"
            >
              <ImageUploadModal
                item={uploadObjectFavIcon}
                uploadObject={uploadObjectFavIcon}
                setUploadObject={setUploadObjectFavIcon}
                metaArray={metaArrayFavIcon}
                setMetaArray={setMetaArrayFavIcon}
                mobileView={false}
                visibility="image-only"
                setFileList={setfaviconList}
                handlePreview={handlePreview}
                setFileUploadCount={setFileUploadCount}
                fileListState={faviconListState}
                width={155}
                height={160}
                resolution="34 x 34"
                editType={
                  uploadObjectFavIcon[0]?.url?.length > 0 ||
                  uploadObjectFavIcon[0]?.productImageInfo?.product_image
                    ?.length > 0
                }
              />
            </Form.Item>
          </Col>
        </Row>
      )}
      <Modal
        title={previewTitle}
        open={previewVisible}
        footer={undefined}
        onCancel={handleCancel}
      >
        <img alt={previewImage} style={{ width: '100%' }} src={previewImage} />
      </Modal>
      <InfoModal
        infoModalCancel={infoModalCancel}
        infoModal={infoModal}
        infoImg={infoImg}
      />
    </>
  );
}
export default ImageForm;
