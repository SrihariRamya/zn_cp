import React, { useState, useRef, useContext } from 'react';
import {
  Modal,
  Row,
  Divider,
  Upload,
  Drawer,
  Badge,
  Collapse,
  Spin,
  Button,
  Typography,
  Card,
} from 'antd';
import { notification } from 'antd/lib';
import { PlusOutlined } from '@ant-design/icons';
import { filter, get, isEmpty, map, uniqBy, includes } from 'lodash';
import { useLocation } from 'react-router-dom';
import loadImage from 'blueimp-load-image';
import Search from 'antd/es/input/Search';
import { Col } from 'antd/lib/grid';
import {
  changeBackground,
  getCredits,
  subscriptionDebitWallet,
  userWalletBalance,
} from '../utils/api/url-helper';
import AdobeExpress from '../components/settings/appearance/adobe';
import { checkVideoWH } from './image-validation';
import FacebookLogo from '../assets/icons/facebook-logo.svg';
import Instagram from '../assets/icons/instagram-icon.svg';
import { WalletContext } from '../components/context/wallet-context';
import { ReactComponent as AdobeLogo } from '../assets/icons/adobe-logo.svg';
import { ReactComponent as Photo } from '../assets/icons/upload-photo.svg';
import { ReactComponent as Vedio } from '../assets/icons/upload-vedio.svg';
import { ReactComponent as DeleteRounded } from '../assets/icons/delete-rounded.svg';
import { ReactComponent as CancelRounded } from '../assets/icons/cancel-rounded.svg';
import { ReactComponent as CloudIcon } from '../assets/icons/cloud-icon.svg';
import { ReactComponent as InfoIcon } from '../assets/icons/info-icon.svg';
import { dataURLtoFile, uploadObjectInOrder } from './function-helper';
import {
  ADOBE_BANNER,
  FAILED_TO_LOAD,
  PAGE_BUILDER_UPLOAD,
  PAYMENT_UPDATE_FAILED,
  PROMPTS,
} from './constant-values';
import { ReactComponent as VedioBackgroundLeft } from '../assets/images/video-bg-left.svg';
import { ReactComponent as VedioBackgroundRight } from '../assets/images/video-bg-right.svg';
import { ReactComponent as PreviewIcon } from '../assets/icons/preview-icon.svg';

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
};
const userID = localStorage.getItem('userID');

const { Dragger, LIST_IGNORE } = Upload;

const dummyRequest = ({ onSuccess }) => {
  setTimeout(() => {
    onSuccess({ success: true });
  }, 10);
};

const isMp4 = (string_) =>
  typeof string_ === 'string' && string_.includes('mp4');

const urlToObject = async (url, fileName) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], fileName, { type: 'image/jpeg' });
  return file;
};

function CustomDragUpload(properties) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [fileTypeState, setFileTypeState] = useState('');
  const videoReference = useRef(null);
  const location = useLocation();
  const [creditsCount, setCreditsCount] = useState(0);
  const [apiLoader, setApiLoader] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [photoRoomApiKey, setPhotoRoomApiKey] = useState('');
  const [photoRoomApiUrl, setPhotoRoomApiUrl] = useState('');
  const [photoRoomCosting, setPhotoRoomCosting] = useState(0);
  const [walletBalance, setWalletBalance] = useContext(WalletContext);

  const {
    setFileList,
    fileListState,
    accept,
    item,
    index,
    setUploadObject,
    uploadObject,
    widthVal,
    heightVal,
    marginVal,
    setFacebookModal,
    setGoogleModal,
    setInstagramModal,
    setUploadModal,
    metaLogged,
    setConnectFacebook,
    setConnectInstagram,
    metaArray,
    setMetaArray,
    mobileView,
    setUncheckIndex,
    componentUid,
    updateImageSource,
    facebookList,
    setFacebookList,
    instagramList,
    setInstagramList,
    editType,
    setImageModal,
    setOpenTourModal,
    setCurrentStep,
    openTourModal,
    closeTourModal,
    setCloseTourModal,
    textValue,
    resolution,
  } = properties;
  const visibility = get(properties, 'visibility', '');

  const pageBuilder = visibility === PAGE_BUILDER_UPLOAD;
  const path = window.location.pathname;
  const onFileChange = async ({ fileList: newFileList }) => {
    map(newFileList, (image) => {
      image.status = 'done';
      image.id = item;
      if (closeTourModal) {
        setCurrentStep(1);
        setOpenTourModal(true);
        setCloseTourModal(false);
      }
      return image;
    });
    if (visibility === PAGE_BUILDER_UPLOAD) {
      map(newFileList, (img) => {
        if (img.status === 'uploading') {
          return;
        }
        if (img.status === 'done') {
          getBase64(img.originFileObj, (url) => {
            updateImageSource({
              componentUid,
              value: url,
              file: img.originFileObj,
            });
          });
        }
      });
    }

    const disableUpload = [...uploadObject];
    map(disableUpload, (list, index_) => {
      if (index + 1 === index_) {
        list.isDisable = true;
      }
    });

    const addFiles = [...fileListState];
    addFiles.push(newFileList[0]);
    const uniqArray = uniqBy(addFiles, 'uid');
    setFileList(uniqArray);

    map(disableUpload, (list) => {
      if (list.id === item.id) {
        if (list.productImageInfo) {
          list.productImageInfo = {
            product_image: URL.createObjectURL(
              get(newFileList, '[0]originFileObj', '')
            ),
          };
          list.type = uploadType;
        } else {
          list.url = URL.createObjectURL(
            get(newFileList, '[0]originFileObj', '')
          );
          list.type = uploadType;
        }
      }
    });
    setIsModalOpen(false);
    if (pageBuilder) setImageModal(false);
    setUploadObject(disableUpload);
  };

  const handleBeforeUpload = async (file) => {
    const text = file?.type?.includes('mp4') ? 'video' : 'image';
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    const isSizeValid = file.size <= MAX_IMAGE_SIZE;
    if (!isSizeValid && !get(file, 'type', '').includes('video')) {
      notification.error({
        message: `Image must be smaller than ${
          MAX_IMAGE_SIZE / 1024 / 1024
        }MB!`,
      });
      return LIST_IGNORE;
    }
    setUploadType('');
    if (visibility !== PAGE_BUILDER_UPLOAD) {
      if (file.type.includes('video')) {
        const videoCount = filter(fileListState, (object) =>
          get(object, 'type', '').includes('video')
        ).length;

        if (videoCount === 2) {
          notification.error({
            message: 'Sorry, you can only upload a maximum of two videos.',
          });
          return LIST_IGNORE;
        }
      }
      const existingFileWithName = fileListState.find(
        (exist) => exist.name === file.name
      );
      if (
        existingFileWithName &&
        !(path.includes('edit-product') || path.includes('add-product'))
      ) {
        notification.error({
          message: `This ${text} has already been uploaded`,
        });
        return LIST_IGNORE;
      }
      setUploadType(file.type);

      const existingFile = fileListState.find(
        (exist) => exist.id.id === item.id
      );
      if (existingFile) {
        const duplicateList = [...uploadObject];
        map(duplicateList, (list) => {
          if (list?.id === item?.id) {
            list.url = '';
          }
        });
        setUploadObject(duplicateList);
        const updatedFileList = filter(
          fileListState,
          (update) => update?.id?.id !== item?.id
        );
        setFileList(updatedFileList);
      }
      if (get(file, 'type', '').includes('video')) {
        const isVideo = file.type === 'video/mp4';
        const isLt2M = file.size / 1024 / 1024 < 10;
        if (!isVideo) {
          notification.error({
            message: 'You can only upload video MP4 files!',
          });
          return LIST_IGNORE;
        }
        if (!isLt2M) {
          notification.error({
            description: 'Video must be smaller than 10MB',
          });
          return LIST_IGNORE;
        }
        try {
          await checkVideoWH(file);
        } catch {
          notification.error({
            message: 'The aspect ratio of the video should be less than 16:9.',
          });
          return LIST_IGNORE;
        }
        return false;
      }
    }
    setIsModalOpen(false);
    if (pageBuilder) setImageModal(false);
    return true;
  };

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
    } else if (type === 'instagram') {
      setInstagramModal(true);
      setFacebookModal(false);
      setGoogleModal(false);
      if (metaLogged) {
        setConnectInstagram(true);
      } else {
        setConnectFacebook(false);
        setConnectInstagram(false);
      }
    } else {
      setGoogleModal(true);
      setFacebookModal(false);
      setInstagramModal(false);
    }
    setUploadModal(true);
    setIsModalOpen(false);
    if (pageBuilder) setImageModal(true);
  };

  const handleRemove = (file) => {
    setFileTypeState(
      get(file, 'type', '').includes('video') ? 'Video' : 'Image'
    );
    setIsDeleteModal(true);
  };

  const handleFetchWallet = async () => {
    userWalletBalance({ user_id: userID })
      .then((data) => {
        if (data.success) {
          const wallet =
            Math.trunc(get(data, 'data.wallet_balance', []) * 100) / 100;
          setWalletBalance(wallet);
        } else {
          setWalletBalance('0.00');
          notification.error({ message: FAILED_TO_LOAD });
        }
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };
  const handleDeductWallet = async () => {
    const transactionData = {
      user_id: userID,
      amount: Number(photoRoomCosting),
      transaction_reason: 'Photo room image edit',
    };
    subscriptionDebitWallet(transactionData)
      .then(async (data) => {
        if (data.success) {
          notification.success({
            message: get(data, 'message', 'Wallet amount debited successfully'),
          });
          await handleFetchWallet();
          setApiLoader(false);
          setIsModalOpen(false);
        } else {
          notification.error({
            message: get(data, 'message', PAYMENT_UPDATE_FAILED),
          });
        }
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', FAILED_TO_LOAD),
        });
      });
  };
  const handleGetCredits = async () => {
    await getCredits()
      .then((response) => {
        const { available } = response.data;
        const { apiKey, apiUrl, photoRoomCostingData } = response;
        setPhotoRoomApiKey(apiKey);
        setPhotoRoomApiUrl(apiUrl);
        setCreditsCount(available);
        setPhotoRoomCosting(photoRoomCostingData);
        handleFetchWallet();
      })
      .catch((error) => {
        notification.error({ message: error });
      });
  };

  const handlePreview = () => {
    setPreviewModal(true);
    setIsModalOpen(false);
  };
  const handleChangeBackground = async (prompt) => {
    if (creditsCount <= 0 || walletBalance < photoRoomCosting) {
      notification.error({
        message: 'No more credits, Please recharge your wallet',
      });
    } else {
      setApiLoader(true);
      const file = fileListState[index];
      const fileObject = file?.originFileObj;
      const resizedImage = await loadImage(fileObject, {
        maxWidth: 1500,
        maxHeight: 1500,
        canvas: true,
      });
      resizedImage.image.toBlob(async function handleBlob(inputBlob) {
        const formData = new FormData();
        formData.append('imageFile', inputBlob);
        formData.append('prompt', prompt);
        try {
          await changeBackground(formData, photoRoomApiKey, photoRoomApiUrl)
            .then(async (response) => {
              const outputBlob = URL.createObjectURL(response.data);
              item.url = outputBlob;
              await urlToObject(outputBlob, file.name).then((files) => {
                fileListState[index].originFileObj = files;
                return file;
              });
              await handleDeductWallet();
              setInputPrompt('');
              handleGetCredits();
            })
            .catch((error) => {
              notification.error({ message: error });
            });
        } catch (error) {
          setApiLoader(false);
          notification.error({ message: error });
        }
      });
    }
  };
  const handleDeleteVisibility = () => {
    setIsModalOpen(false);
    setFileList([]);
    setMetaArray([]);
    setUploadObject([{ id: 1, isDisable: true, url: '' }]);
    setIsDeleteModal(false);
  };
  const handleDelete = () => {
    setIsModalOpen(false);
    if (pageBuilder) setImageModal(false);
    const duplicateArrayList = [...fileListState];
    const duplicateArrayMeta = [...metaArray];
    const duplicateArrayFB = [...facebookList];
    const duplicateArrayIG = [...instagramList];
    const removedArray = filter(
      duplicateArrayList,
      (list) => list?.id?.id !== item?.id
    );
    setTimeout(() => {
      map(removedArray, (values, indexId) => {
        values.id.id = indexId + 1;
      });
    }, '1000');
    setFileList(removedArray);
    setMetaArray(
      filter(duplicateArrayMeta, (list) => list?.id?.id !== item?.id)
    );
    map(duplicateArrayFB, (fb) => {
      map(duplicateArrayMeta, (meta) => {
        if (fb?.url === meta?.url && meta?.id?.id === item?.id) {
          fb.isCheck = false;
        }
      });
    });
    map(duplicateArrayIG, (ig) => {
      map(duplicateArrayMeta, (meta) => {
        if (ig?.url === meta?.url && meta?.id?.id === item?.id) {
          ig.isCheck = false;
        }
      });
    });
    setFacebookList(duplicateArrayFB);
    setInstagramList(duplicateArrayIG);
    const duplicateList = [...uploadObject];
    map(duplicateList, (list) => {
      if (list?.id === item?.id) {
        list.url = '';
        delete list.uploadId;
        delete list?.type;
        if (list.productImageInfo) {
          list.productImageInfo = {};
        }
      }
    });
    const url = window.location.href;
    const searchString = 'edit-product';
    const withUrl = includes(url, searchString)
      ? filter(duplicateList, (object) => !isEmpty(object?.productImageInfo))
          .length
      : filter(duplicateList, (object) => object.url !== '').length;

    map(duplicateList, (value, indexValue) => {
      if (withUrl === indexValue + 1 && withUrl < 6) {
        duplicateList[withUrl + 1].isDisable = false;
      }
      if (withUrl === 0) {
        duplicateList[withUrl + 1].isDisable = false;
      }
    });
    const orderedList = uploadObjectInOrder(duplicateList);
    setUploadObject(orderedList);
    setIsDeleteModal(false);
  };
  const handleDeleteCancel = () => {
    setApiLoader(false);
    setIsDeleteModal(false);
  };

  const handleOpenModal = async () => {
    if (item?.isDisable) {
      if (openTourModal) {
        setOpenTourModal(false);
        setCloseTourModal(true);
      }
      setIsModalOpen(true);
      await handleGetCredits();
      if (visibility !== 'image-only' && visibility !== PAGE_BUILDER_UPLOAD) {
        setUncheckIndex([]);
      }
    }
    if (pageBuilder) setImageModal(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
    if (pageBuilder) setImageModal(false);
  };
  const handleCancel = () => {
    if (closeTourModal) {
      setOpenTourModal(true);
      setCloseTourModal(false);
    }
    setApiLoader(false);
    setInputPrompt('');
    setIsModalOpen(false);
    if (pageBuilder) setImageModal(false);
  };

  const openModal = (type) => {
    const fileArray = dataURLtoFile(
      type.asset.data,
      `image.${type.asset.fileType}`
    );
    getBase64(fileArray, (url) => {
      updateImageSource({
        componentUid,
        value: url,
        file: fileArray,
      });
    });
    setImageModal(false);
  };
  const items = [
    {
      key: '1',
      label: 'Change Background',
      children: (
        <>
          <Search
            placeholder="Write the content..."
            allowClear={false}
            value={inputPrompt}
            onChange={(event) => setInputPrompt(event.target.value)}
            enterButton={
              <Button type="primary" disabled={inputPrompt?.length === 0}>
                Change
              </Button>
            }
            size="small"
            onSearch={(event) => handleChangeBackground(event)}
          />
          <Card className="mt-5">
            <div className="prompt-block">
              {map(PROMPTS, (content) => {
                return (
                  <Row className="mt-5 ">
                    <Col span={24}>
                      <Typography.Link onClick={() => setInputPrompt(content)}>
                        {content}
                      </Typography.Link>
                    </Col>
                  </Row>
                );
              })}
            </div>
          </Card>
        </>
      ),
    },
  ];

  const currentPath = location.pathname;
  const isAddPath = includes(currentPath, '/add');

  const handleWithOutUrl = () => {
    if (visibility !== 'image-only' && visibility !== PAGE_BUILDER_UPLOAD) {
      return isAddPath ? item?.url === '' : isEmpty(item?.productImageInfo);
    }
    return item?.url === '' || isEmpty(item?.productImageInfo);
  };
  const handleWithUrl = () => {
    if (visibility !== 'image-only' && visibility !== PAGE_BUILDER_UPLOAD) {
      return isAddPath
        ? item?.url !== ''
        : item?.productImageInfo?.product_image;
    }
    return item?.url !== '' || item?.productImageInfo?.product_image;
  };
  const isPath =
    includes(currentPath, '/categories') ||
    includes(currentPath, '/stores') ||
    includes(currentPath, '/settings');

  const urlWithout = isPath
    ? handleWithOutUrl() && !editType
    : handleWithOutUrl();
  const urlWith = isPath ? handleWithUrl() && editType : handleWithUrl();

  const handleModalFunction = () => {
    return (
      <>
        {urlWithout && (
          <>
            {/* <Row
              style={{ cursor: 'pointer' }}
              onClick={() => showUploadModal('google')}
            >
              <div className="d-flex">
                <Google />
                <span className="sub-title">Google photos</span>
              </div>
            </Row>
            <Divider /> */}
            <Row
              style={{ cursor: 'pointer' }}
              onClick={() => showUploadModal('instagram')}
            >
              <div className="d-flex">
                <img src={Instagram} alt="insta-img" />
                <span className="sub-title">Instagram</span>
              </div>
            </Row>
            <Divider />
            <Row
              style={{ cursor: 'pointer' }}
              onClick={() => showUploadModal('facebook')}
            >
              <div className="d-flex">
                <img src={FacebookLogo} alt="insta-img" />
                <span className="sub-title">FaceBook</span>
              </div>
            </Row>
            {visibility === PAGE_BUILDER_UPLOAD && (
              <>
                <Divider />
                <Row style={{ cursor: 'pointer' }}>
                  <div className="d-flex">
                    <AdobeLogo />
                    <AdobeExpress
                      openModal={openModal}
                      adobeParam={ADOBE_BANNER}
                      constantValue={PAGE_BUILDER_UPLOAD}
                      setIsModalOpen={setIsModalOpen}
                    />
                  </div>
                </Row>
              </>
            )}
            <Divider />
            <Row
              style={{ cursor: 'pointer' }}
              onClick={() => setIsModalOpen(false)}
            >
              <div className="d-flex">
                <Photo />
                <Upload
                  key={index}
                  customRequest={dummyRequest}
                  fileList={fileListState}
                  maxCount={1}
                  beforeUpload={(file) => handleBeforeUpload(file)}
                  onChange={onFileChange}
                  showUploadList={false}
                  headers={{
                    authorization: 'authorization-text',
                  }}
                  accept="image/*"
                >
                  <span className="sub-title">
                    Upload photo
                    {visibility !== PAGE_BUILDER_UPLOAD &&
                      visibility !== 'image-only' && (
                        <span className="sub-title-sub-text">
                          -(1280x1280)px, max 5MB
                        </span>
                      )}
                    {visibility === 'image-only' && (
                      <span className="sub-title-sub-text">
                        -(300x300)px, max 2MB
                      </span>
                    )}
                  </span>
                </Upload>
              </div>
            </Row>

            <Divider />
            {visibility !== 'image-only' &&
              visibility !== PAGE_BUILDER_UPLOAD && (
                <>
                  <Row style={{ cursor: 'pointer' }}>
                    <div className="d-flex">
                      <Vedio />
                      <Upload
                        key={index}
                        customRequest={dummyRequest}
                        fileList={fileListState}
                        maxCount={1}
                        beforeUpload={(file) => handleBeforeUpload(file)}
                        onChange={onFileChange}
                        showUploadList={false}
                        accept="video/*"
                      >
                        <span className="sub-title">
                          Upload video
                          <span className="sub-title-sub-text">
                            -(16:9 aspect ratio), max 10MB
                          </span>
                        </span>
                      </Upload>
                    </div>
                  </Row>
                  <Divider />
                </>
              )}
          </>
        )}
        {urlWith && (
          <Spin spinning={apiLoader}>
            <Row onClick={() => handlePreview()} style={{ cursor: 'pointer' }}>
              <div className="d-flex">
                <PreviewIcon />
                <span className="sub-title">Preview</span>
              </div>
            </Row>
            {!fileListState[index].product_image &&
              fileListState[index]?.type !== 'video/mp4' &&
              (path.includes('edit-product') || path.includes('add-product')) &&
              !mobileView && (
                <>
                  <Divider />
                  <Badge.Ribbon text={`Credits: ${creditsCount}`}>
                    <Collapse items={items} />
                  </Badge.Ribbon>
                </>
              )}
            <Divider />
            <Row
              onClick={(event) => handleRemove(event)}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex">
                <DeleteRounded />
                <span className="sub-title">Delete</span>
              </div>
            </Row>
            <Divider />
          </Spin>
        )}
        <Row onClick={handleCancel} style={{ cursor: 'pointer' }}>
          <div className="d-flex">
            <CancelRounded />
            <span className="sub-title">Cancel</span>
          </div>
        </Row>
      </>
    );
  };

  const handleImageStyles = () => {
    let result;

    if (visibility === 'image-only') {
      result = 'custom-img-upload';
    } else if (visibility === PAGE_BUILDER_UPLOAD) {
      result = 'custom-img-pg';
    } else if (item.id === 1) {
      result = 'custom-image-preview-right';
    } else {
      result = 'custom-image-preview-left';
    }
    return result;
  };

  const imageVideo =
    item?.type?.includes('mp4') ||
    isMp4(item?.url) ||
    isMp4(item?.productImageInfo?.product_image) ||
    item?.uploadId?.includes('mp4');

  const handleVideoIcon = () => {
    if (index + 1 === 1) {
      return <VedioBackgroundLeft />;
    }
    return <VedioBackgroundRight />;
  };

  const handleChangeImage = () => {
    return (
      <div className="custom-dragger">
        {imageVideo ? (
          handleVideoIcon()
        ) : (
          <img
            src={
              (item?.url !== '' && item?.url) ||
              (Object.keys(item?.productImageInfo?.product_image).length > 0 &&
                item?.productImageInfo?.product_image)
            }
            alt="Video"
            className={handleImageStyles()}
            draggable="false"
          />
        )}
        {visibility !== 'image-only' && (
          <p
            className={index + 1 === 1 ? 'number-card main' : 'number-card sub'}
          >
            {index + 1 === 1 ? 'Main' : index + 1}
          </p>
        )}
      </div>
    );
  };

  const handleChangeImageText = () => {
    return (
      <div className="custom-dragger-text">
        <div style={{ textAlign: 'center' }}>
          <CloudIcon />
        </div>
        <p className="black">Drag & drop files or Browse</p>
        <p className="blue mt-10">
          <InfoIcon />
          1280 x 1280
        </p>
        <p className="blue">image aspect ratio for better fit.</p>
        <p className="blue mt-10">
          <InfoIcon />
          16:9
        </p>
        <p className="blue">video aspect ratio for better fit.</p>
        <p className="red mt-10">Max file size: image 5MB / Video 10 MB</p>
      </div>
    );
  };

  const handleImageText = () => {
    return (
      <div className="custom-dragger-text">
        <div style={{ textAlign: 'center' }}>
          <CloudIcon />
        </div>
        <p className="black">Drag & drop files or Browse</p>
        {textValue === 'settings' ? (
          <p className="red mt-10">Upload only icon/svg file</p>
        ) : (
          <>
            <p className="blue mt-10">
              <InfoIcon />
              {resolution || '300 x 300'}
            </p>
            <p className="blue">image aspect ratio for better fit.</p>
            <p className="red mt-10">Max file size: image 2MB</p>
          </>
        )}
      </div>
    );
  };

  const handleImagePreview = () => {
    if (item?.productImageInfo?.product_image || item?.url !== '') {
      return handleChangeImage();
    }
    if (item?.id === 1) {
      if (visibility === PAGE_BUILDER_UPLOAD) {
        return (
          <div>
            <PlusOutlined />
            <div
              style={{
                marginTop: 8,
              }}
            >
              Upload
            </div>
          </div>
        );
      }
      return visibility === 'image-only'
        ? handleImageText()
        : handleChangeImageText();
    }
    return <PlusOutlined style={{ color: '#000000' }} />;
  };

  const mainRowStyles = {
    marginBottom: marginVal,
  };

  const draggerStyles = {
    width: visibility === PAGE_BUILDER_UPLOAD ? '100%' : widthVal,
    marginBottom: marginVal,
  };
  const draggerMouseStyles = item?.isDisable
    ? {
        cursor: 'pointer',
      }
    : {
        cursor: 'not-allowed',
      };

  const draggerBorder =
    item?.url !== '' ||
    (item?.productImageInfo &&
      item.productImageInfo.product_image &&
      Object.keys(item.productImageInfo.product_image).length > 0)
      ? { border: '0px solid transparent' }
      : { border: '1px dashed #222222' };

  const mergedStyles = {
    ...draggerStyles,
    ...draggerMouseStyles,
    ...draggerBorder,
  };

  const Main = visibility === PAGE_BUILDER_UPLOAD ? 'div' : 'Row';

  const handleDraggerHeight = () => {
    if (visibility === 'image-only') {
      return heightVal;
    }
    if (visibility === PAGE_BUILDER_UPLOAD) {
      return heightVal;
    }
    if (item?.id === 1) {
      return 220;
    }
    return 70;
  };

  const handlePreviewCancel = () => {
    setPreviewModal(false);
    if (videoReference.current) {
      videoReference.current.pause();
    }
  };

  return (
    <div>
      <Main className="drag-drop">
        <div onClick={handleOpenModal} style={mainRowStyles} aria-hidden="true">
          <Dragger
            key={index}
            multiple={false}
            maxCount={1}
            accept={accept}
            beforeUpload={(file) => handleBeforeUpload(file)}
            onChange={onFileChange}
            showUploadList={false}
            openFileDialogOnClick={false}
            customRequest={dummyRequest}
            style={mergedStyles}
            disabled={!item.isDisable}
            headers={{
              authorization: 'authorization-text',
            }}
            height={handleDraggerHeight()}
          >
            {handleImagePreview()}
          </Dragger>
        </div>

        {mobileView ? (
          <Drawer
            open={isModalOpen}
            onClose={handleCancel}
            closable={false}
            className={
              item?.productImageInfo?.product_image || item?.url !== ''
                ? 'upload-modal-main'
                : 'upload-modal-no-image'
            }
            footer={false}
            placement="bottom"
            height="auto"
          >
            {handleModalFunction()}
          </Drawer>
        ) : (
          <Modal
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            closable={false}
            className={
              item?.productImageInfo?.product_image || item?.url !== ''
                ? 'upload-modal-main'
                : 'upload-modal-no-image'
            }
            footer={false}
            width={360}
            centered
          >
            {handleModalFunction()}
          </Modal>
        )}
      </Main>
      <Modal
        open={isDeleteModal}
        onOk={
          visibility === 'image-only' ? handleDeleteVisibility : handleDelete
        }
        onCancel={handleDeleteCancel}
        width={340}
        className="upload-delete-modal"
        closable={false}
        okText="Yes"
        cancelText="No"
      >
        <p>{`Are you sure you want to delete this ${fileTypeState}?`}</p>
      </Modal>
      <Modal
        open={previewModal}
        footer={false}
        onCancel={handlePreviewCancel}
        width={400}
        className="upload-preview-modal"
      >
        {(item?.productImageInfo?.product_image || item?.url !== '') && (
          <div className="custom-dragger">
            {imageVideo ? (
              <video
                ref={videoReference}
                controls
                height={mobileView ? '300px' : '360px'}
                width={mobileView ? '250px' : '360px'}
              >
                <source
                  src={
                    (item?.url !== '' && item?.url) ||
                    (Object.keys(item?.productImageInfo?.product_image).length >
                      0 &&
                      item?.productImageInfo?.product_image)
                  }
                  type="video/mp4"
                  kind="captions"
                />
                <track kind="captions" />
              </video>
            ) : (
              <img
                src={
                  (item?.url !== '' && item?.url) ||
                  (Object.keys(item?.productImageInfo?.product_image).length >
                    0 &&
                    item?.productImageInfo?.product_image)
                }
                alt="Video"
                width={mobileView ? '250px' : '360px'}
                height={mobileView ? '330px' : '360px'}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CustomDragUpload;
