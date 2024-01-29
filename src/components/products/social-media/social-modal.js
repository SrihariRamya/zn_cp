import React, { useEffect, useState } from 'react';
import {
  Modal,
  Layout,
  Button,
  notification,
  Spin,
  Col,
  Row,
  Drawer,
  Tabs,
} from 'antd';
import { CloseOutlined, LeftOutlined } from '@ant-design/icons';
import { isEmpty, map, differenceBy, filter, includes, get } from 'lodash';
import { PAGE_BUILDER_UPLOAD } from '../../../shared/constant-values';
import {
  dataURLtoFile,
  uploadObjectInOrder,
} from '../../../shared/function-helper';
import {
  disconnectAuth,
  getFbLongLivedToken,
  getFbPageDetails,
  getFbPagePosts,
  getIgMediaPost,
} from '../../../utils/api/url-helper';
import NoImage from '../../../assets/images/no-image.png';
import { ReactComponent as FacebookLogo } from '../../../assets/icons/facebook-logo.svg';
import { ReactComponent as Facebook } from '../../../assets/icons/fb-logo.svg';
import { ReactComponent as Instagram } from '../../../assets/icons/instagram-icon.svg';
import { ReactComponent as InstagramLogo } from '../../../assets/icons/insta-logo.svg';
import { ReactComponent as Google } from '../../../assets/icons/google-icon.svg';
import InstagramImage from './instagram';
import FacebookImage from './facebook';

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
};

const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;

const sideDiv = { display: 'flex', marginTop: '12px' };
const sideDivElse = { display: 'contents' };

const sideSvgDiv = { width: '75px' };
const sideSvgDivElse = { width: 'auto', marginTop: '12px' };

const handleFacebookList = (duplicateFbList, duplicateCheckedArray) => {
  map(duplicateFbList, (fb) => {
    map(duplicateCheckedArray, (list) => {
      if (fb.url === list.url) {
        fb.isCheck = false;
      }
    });
  });
};

const handleInstagramList = (duplicateIgList, duplicateCheckedArray) => {
  map(duplicateIgList, (ig) => {
    map(duplicateCheckedArray, (list) => {
      if (ig.url === list.url) {
        ig.isCheck = false;
      }
    });
  });
};

const handleConnectInstagram = () => {
  notification.error({
    message: 'Login facebook to get instagram posts',
  });
};

function SocialModal(properties) {
  const {
    instagramModal,
    setInstagramModal,
    googleModal,
    setGoogleModal,
    facebookModal,
    setFacebookModal,
    uploadModal,
    setUploadModal,
    setFileList,
    fileListState,
    setMetaLogged,
    metaLogged,
    connectFacebook,
    setConnectFacebook,
    connectInstagram,
    setConnectInstagram,
    uploadObject,
    metaArray,
    setMetaArray,
    fbData,
    setFbData,
    mobileView,
    setUploadObject,
    uncheckIndex,
    setUncheckIndex,
    visibility,
    componentUid,
    updateImageSource,
    facebookList,
    setFacebookList,
    instagramList,
    setInstagramList,
    setImageModal,
    openTourModal,
    setOpenTourModal,
    setCurrentStep,
    closeTourModal,
    setCloseTourModal,
  } = properties;

  const [show, setShow] = useState();

  const [loading, setLoading] = useState(false);
  const [tenantUid] = useState(localStorage.getItem('tenantUid'));
  const [selectedPageId, setSelectedPageId] = useState('');
  const [igData, setIgData] = useState([]);
  const [pagination, setPagination] = useState([]);
  const [radioValue, setRadioValue] = useState();
  const [checkedArray, setCheckedArray] = useState([]);
  const [fbPageData, setFbPageData] = useState([]);

  const getPagePosts = (paging) => {
    setLoading(true);
    getFbPagePosts({ tenantUid, pageId: selectedPageId, paging })
      .then((data) => {
        setLoading(false);
        let fbList = data?.data?.data;
        map(fbList, (list, index) => {
          fbList[index].isCheck = false;
        });
        if (visibility === 'image-only' || visibility === PAGE_BUILDER_UPLOAD) {
          fbList = filter(
            data?.data?.data,
            (item) => item?.attachments?.data[0]?.type !== 'video_inline'
          );
        }
        setFbData(fbList);
        setPagination(data?.data?.paging);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message:
            error.message ||
            'some error occcured while getting fb page product',
        });
      });
  };

  useEffect(() => {
    if (selectedPageId) {
      getPagePosts();
    }
  }, [selectedPageId]);

  const getFbPages = (type) => {
    setLoading(true);
    getFbPageDetails(tenantUid)
      .then((response) => {
        if (response?.data) {
          const pageData = response?.data?.data;
          const pageList = pageData?.map((item) => {
            return { value: item.id, label: item.name };
          });
          if (type === 'facebook') setConnectFacebook(true);
          setMetaLogged(true);
          setLoading(false);
          setSelectedPageId(
            response?.pageId?.toString() || pageList?.[0]?.value
          );
          setFbPageData(pageList);
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message:
            error.message ||
            'some error occcured while getting fb page details',
        });
      });
  };

  const getInstaPosts = (page) => {
    setLoading(true);
    getIgMediaPost({ tenantUid, pageId: selectedPageId, page })
      .then((response) => {
        setMetaLogged(true);
        setIgData(response);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message:
            error.message ||
            'some error occcured while getting instagram posts',
        });
      });
  };

  useEffect(() => {
    getFbPages();
  }, []);

  useEffect(() => {
    getInstaPosts();
  }, [instagramModal]);

  const onFacebookLogin = () => {
    window.FB.login(
      // eslint-disable-next-line func-names
      function (response) {
        setLoading(true);
        if (response?.status === 'connected') {
          const token = response?.authResponse?.accessToken;
          const userID = response?.authResponse?.userID;
          getFbLongLivedToken({ tenantUid, token, userID })
            .then((result) => {
              setMetaLogged(true);
              if (result.success) {
                getFbPages('facebook');
              } else {
                setLoading(false);
                notification.error({ message: `'could'nt get token` });
              }
            })
            .catch(() => {
              setLoading(false);
            });
          if (response?.message) {
            notification.error({
              message: response.message,
            });
          } else {
            notification.success({
              message: 'Successfully logged in your Facebook account',
            });
          }
        } else {
          setLoading(false);
          notification.error({
            message: 'Some problem occurred while connecting to facebook',
          });
        }
      },
      {
        scope:
          // eslint-disable-next-line max-len
          'public_profile,email,pages_show_list,read_insights,pages_read_engagement,pages_manage_posts,pages_read_user_content,instagram_basic,instagram_manage_insights,instagram_content_publish',
        return_scopes: true,
      }
    );
  };

  const disconnect = () => {
    disconnectAuth(tenantUid)
      .then((response) => {
        setFbData([]);
        setConnectFacebook(false);
        setIgData([]);
        setSelectedPageId('');
        setFbPageData([]);
        setLoading(false);
        notification.success({
          message: response.message || 'Disconnected successfully',
        });
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message:
            error.message ||
            'some error occcured while getting instagram posts',
        });
      });
  };

  const handleFacebookBody = () => {
    return (
      <div>
        <div className="text-align-center body-content">
          <img src={NoImage} alt="logo" />
          <p>Instantly fetch images and videos from your FaceBook</p>
        </div>
        <div className="d-flex">
          <Button
            icon={<FacebookLogo />}
            className="connect-cls facebook-clr d-flex"
            onClick={onFacebookLogin}
          >
            Connect Facebook
          </Button>
        </div>
        <div className="text-align-center footer-cls">
          This activity won&apos;t affect your faceBook photos library.
        </div>
      </div>
    );
  };
  const handleFacebookImageModal = () => {
    return (
      <FacebookImage
        setFileList={setFileList}
        fileListState={fileListState}
        fbData={fbData}
        fbPageData={fbPageData}
        setSelectedPageId={setSelectedPageId}
        selectedPageId={selectedPageId}
        pagination={pagination}
        getPagePosts={getPagePosts}
        metaArray={metaArray}
        setMetaArray={setMetaArray}
        setShow={setShow}
        show={show}
        uploadObject={uploadObject}
        mobileView={mobileView}
        setUploadObject={setUploadObject}
        uncheckIndex={uncheckIndex}
        setUncheckIndex={setUncheckIndex}
        visibility={visibility}
        setRadioValue={setRadioValue}
        radioValue={radioValue}
        facebookList={facebookList}
        setFacebookList={setFacebookList}
        checkedArray={checkedArray}
        setCheckedArray={setCheckedArray}
      />
    );
  };
  const handleInstagramImageModal = () => {
    return (
      <InstagramImage
        setFileList={setFileList}
        fileListState={fileListState}
        igData={igData}
        getInstaPosts={getInstaPosts}
        metaArray={metaArray}
        setMetaArray={setMetaArray}
        setShow={setShow}
        show={show}
        mobileView={mobileView}
        uncheckIndex={uncheckIndex}
        setUncheckIndex={setUncheckIndex}
        visibility={visibility}
        setRadioValue={setRadioValue}
        radioValue={radioValue}
        uploadObject={uploadObject}
        checkedArray={checkedArray}
        setCheckedArray={setCheckedArray}
        instagramList={instagramList}
        setInstagramList={setInstagramList}
      />
    );
  };

  const notProductModal =
    visibility === PAGE_BUILDER_UPLOAD || visibility === 'image-only';

  const handleInstagramBody = () => {
    return (
      <div>
        <div className="text-align-center body-content">
          <img src={NoImage} alt="logo" />
          <p>Instantly fetch images and videos from your Instagram</p>
        </div>
        <div className="d-flex">
          <Button
            className="connect-cls instagram-clr d-flex"
            icon={notProductModal ? <InstagramLogo /> : <Instagram />}
            onClick={handleConnectInstagram}
          >
            Connect Instagram
          </Button>
        </div>
        <div className="text-align-center footer-cls">
          This activity won&apos;t affect your instagram photos library.
        </div>
      </div>
    );
  };

  const handleGoogleBody = () => {
    return (
      <div>
        <div className="text-align-center body-content">
          <img src={NoImage} alt="logo" />
          <p>
            Instantly fetch images and videos from your Google Photos library
          </p>
        </div>
        <div className="d-flex">
          <Button className="connect-cls google-clr d-flex" icon={<Google />}>
            Connect Google
          </Button>
        </div>
        <div className="text-align-center footer-cls">
          This activity won&apos;t affect your google photos library.
        </div>
      </div>
    );
  };

  const handleUploadModalContent = () => {
    if (facebookModal) {
      return handleFacebookBody();
    }
    if (googleModal) {
      return handleGoogleBody();
    }
    if (instagramModal) {
      return handleInstagramBody();
    }
    return '';
  };

  const showUploadModal = (type) => {
    if (type === 'facebook') {
      getFbPages();
      setFacebookModal(true);
      setGoogleModal(false);
      setInstagramModal(false);
      if (metaLogged) {
        setConnectFacebook(true);
        setConnectInstagram(false);
      } else {
        setConnectFacebook(false);
        setConnectInstagram(false);
      }
    } else if (type === 'google') {
      setGoogleModal(true);
      setFacebookModal(false);
      setInstagramModal(false);
      setConnectFacebook(false);
      setConnectInstagram(false);
    } else {
      getInstaPosts();
      setInstagramModal(true);
      setFacebookModal(false);
      setGoogleModal(false);
      if (metaLogged) {
        setConnectInstagram(true);
        setConnectFacebook(false);
      } else {
        setConnectFacebook(false);
        setConnectInstagram(false);
      }
    }
  };

  const handleClickSideIcon = (type, value) => {
    if (openTourModal) {
      setOpenTourModal(false);
      setCloseTourModal(true);
    }
    if (value === 'main') {
      showUploadModal(type);
      setUploadModal(true);
    } else {
      showUploadModal(type);
    }
    if (type === 'instagram') {
      getInstaPosts();
    }
  };

  const handleUploadOk = () => {
    setUploadModal(false);
  };

  const handleUploadCancel = () => {
    setUploadModal(false);
    if (closeTourModal) {
      setCurrentStep(1);
      setOpenTourModal(true);
    }
    setConnectFacebook(false);
    setConnectInstagram(false);
    const duplicateFbList = [...facebookList];
    const duplicateIgList = [...instagramList];
    const duplicateFileList = [...fileListState];
    const duplicateArrayMeta = [...metaArray];
    const duplicateCheckedArray = [...checkedArray];
    const arrayList = [];
    if (duplicateFileList.length > 0) {
      map(duplicateArrayMeta, (list) => {
        filter(duplicateFileList, (file) => {
          if (list.uploadId === file.uploadId) {
            arrayList.push(list);
          }
        });
      });
      handleFacebookList(duplicateFbList, duplicateCheckedArray);
      handleInstagramList(duplicateIgList, duplicateCheckedArray);
    } else {
      map(duplicateFbList, (initial) => {
        initial.isCheck = false;
      });
      map(duplicateIgList, (initial) => {
        initial.isCheck = false;
      });
    }
    setMetaArray(arrayList);
    setFacebookList(duplicateFbList);
    setInstagramList(duplicateIgList);
    setCheckedArray([]);
    setShow('');
  };

  const handleImageOnly = () => {
    const duplicateArrayMeta = [...metaArray];
    map(uploadObject, (array1) => {
      map(duplicateArrayMeta, (array2) => {
        array1.url = array2?.url;
        array1.isDisable = true;
      });
    });

    setFileList([radioValue]);
    setUploadModal(false);

    if (visibility === PAGE_BUILDER_UPLOAD) {
      const ImageUrl = metaArray[0]?.url;
      const toDataURL = (result) =>
        fetch(result)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to fetch the image');
            }
            return response.blob();
          })
          .then(
            (blob) =>
              new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.addEventListener = reject;
                reader.readAsDataURL(blob);
              })
          );

      toDataURL(ImageUrl)
        .then((dataUrl) => {
          const fileArray = dataURLtoFile(dataUrl, 'imageName.jpg');
          getBase64(fileArray, (url) => {
            updateImageSource({
              componentUid,
              value: url,
              file: fileArray,
            });
          });
        })
        .catch(() => {
          throw new Error('Failed to convert');
        });
      setImageModal(false);
    }
  };

  const handleChangeMetaArray = (uniqueObject) => {
    let mainArrayLength = fileListState;
    const duplicateArrayMeta = [...uniqueObject];
    map(duplicateArrayMeta, (list) => {
      const socialList = list;
      socialList.id = { id: mainArrayLength.length + 1 };
      mainArrayLength = [...mainArrayLength, socialList];
    });
    map(uploadObject, (array1) => {
      if (array1?.url === '') {
        map(duplicateArrayMeta, (array2) => {
          if (array1?.id === array2?.id?.id) {
            if (array1.productImageInfo) {
              array1.productImageInfo = {
                product_image: array2?.url,
              };
              array1.isDisable = true;
              array1.uploadId = array2?.name;
            } else {
              array1.url = array2?.url;
              array1.isDisable = true;
              array1.uploadId = array2?.name;
            }
          }
        });
      }
    });
    const url = window.location.href;
    const searchString = 'edit-product';
    const withUrl = includes(url, searchString)
      ? filter(uploadObject, (object) => !isEmpty(object?.productImageInfo))
          .length
      : filter(uploadObject, (object) => object.url !== '').length;

    map(uploadObject, (value, index) => {
      if (withUrl === index + 1 && withUrl <= uploadObject.length - 1) {
        uploadObject[withUrl].isDisable = true;
      }
    });
    const uploadedList = uploadObject;
    map(uncheckIndex, (uncheck) => {
      map(uploadedList, (list, index_) => {
        if (list?.uploadId === uncheck) {
          uploadedList[index_].url = '';
          delete uploadedList[index_].uploadId;
        }
      });
    });
    const orderedList = uploadObjectInOrder(uploadedList);
    setUploadObject(orderedList);
    const result = filter(fileListState, (list) => {
      return (
        uncheckIndex?.length > 0 && !includes(uncheckIndex, list?.uploadId)
      );
    });
    const concatenatedArray =
      result.length === 0
        ? [...fileListState, ...duplicateArrayMeta]
        : [...result, ...duplicateArrayMeta];

    setFileList(concatenatedArray);
    setUploadModal(false);
    setCheckedArray([]);
    setMetaArray([]);
  };

  const handleClickImport = () => {
    if (closeTourModal) {
      setOpenTourModal(true);
      setCurrentStep(1);
    }
    const uniqueObject = differenceBy(metaArray, uploadObject, 'uploadId');
    if (
      (visibility === 'image-only' || visibility === PAGE_BUILDER_UPLOAD) &&
      metaArray.length > 0
    ) {
      handleImageOnly();
    } else if (metaArray.length > 0) {
      handleChangeMetaArray(uniqueObject);
    } else {
      notification.error({ message: 'Check any one item' });
    }
  };

  useEffect(() => {
    if (!isEmpty(show)) {
      notification.error({ message: show });
    }
  }, [show]);

  const handleLayoutContent = () => {
    if (connectFacebook && get(fbPageData, 'length', 0) > 0) {
      return handleFacebookImageModal();
    }
    if (
      connectInstagram &&
      (get(igData, 'length', 0) !== 0 || !isEmpty(igData?.data))
    ) {
      return handleInstagramImageModal();
    }

    return handleUploadModalContent();
  };

  const fbDataLength = fbPageData.length > 0;

  const handleModalClose = () => {
    return (
      <CloseOutlined
        onClick={handleUploadCancel}
        height="2em"
        style={{
          color: 'red',
          padding: fbDataLength ? '0px 20px' : '0',
        }}
      />
    );
  };
  const getIconProperties = (socialMedia) => ({
    onClick: () => handleClickSideIcon(socialMedia, 'side'),
    cursor: 'pointer',
  });

  const InstagramIcon = notProductModal ? (
    <InstagramLogo {...getIconProperties('instagram')} />
  ) : (
    <Instagram {...getIconProperties('instagram')} />
  );

  const FacebookIcon = notProductModal ? (
    <Facebook {...getIconProperties('facebook')} />
  ) : (
    <FacebookLogo {...getIconProperties('facebook')} />
  );

  const handleChangeMetaModal = () => {
    return (
      <Spin spinning={loading}>
        <Layout>
          <Header>
            <div
              className="coupon-row"
              style={{ padding: fbDataLength ? '0px' : '0px 20px' }}
            >
              <p style={{ paddingLeft: fbDataLength && '20px' }}>
                Upload Media
              </p>
              {fbDataLength ? (
                <div className="coupon-row">
                  <div className="flex-end">
                    <Button onClick={disconnect} type="primary">
                      Logout
                    </Button>
                    {handleModalClose()}
                  </div>
                </div>
              ) : (
                handleModalClose()
              )}
            </div>
          </Header>
          <Layout>
            <Sider
              width={50}
              style={{
                background: 'white',
                height: '446px',
              }}
            >
              {/* <div>
                <Google
                  onClick={() => handleClickSideIcon('google', 'side')}
                  cursor="pointer"
                  className="mt-10"
                />
              </div> */}
              <div style={connectInstagram ? sideDiv : sideDivElse}>
                {connectInstagram && <div className="meta-side-border" />}
                <div
                  className="flex-centric"
                  style={connectInstagram ? sideSvgDiv : sideSvgDivElse}
                >
                  {InstagramIcon}
                </div>
              </div>
              <div style={connectFacebook ? sideDiv : sideDivElse}>
                {connectFacebook && <div className="meta-side-border" />}
                <div
                  className="flex-centric"
                  style={connectFacebook ? sideSvgDiv : sideSvgDivElse}
                >
                  {FacebookIcon}
                </div>
              </div>
            </Sider>
            <Layout>
              <Content
                style={{
                  height: '100px',
                  overflow: 'auto',
                  background: 'white',
                }}
              >
                {handleLayoutContent()}
              </Content>
              {(connectFacebook || connectInstagram) &&
                get(fbData, 'length', 0) > 0 &&
                metaArray.length > 0 && (
                  <div className="flex-end" style={{ background: 'white' }}>
                    <Button
                      onClick={handleClickImport}
                      className="import-btn-meta"
                      disabled={!isEmpty(show)}
                    >
                      Import
                    </Button>
                  </div>
                )}
            </Layout>
          </Layout>
        </Layout>
      </Spin>
    );
  };

  const handleChangeTabPane = (event) => {
    switch (event) {
      case '1': {
        handleClickSideIcon('google', 'side');
        break;
      }
      case '2': {
        handleClickSideIcon('instagram', 'side');
        break;
      }
      case '3': {
        handleClickSideIcon('facebook', 'side');
        break;
      }
      default: {
        handleClickSideIcon('google', 'side');
      }
    }
  };

  const handleChangeMetaTab = () => {
    return (
      <div>
        <div
          className={
            fbDataLength ? 'add-product-mob-logout' : 'add-product-mob-header'
          }
        >
          <div
            className={
              fbDataLength
                ? 'add-product-left-icon-logout'
                : 'add-product-left-icon'
            }
          >
            <LeftOutlined onClick={handleUploadCancel} />
          </div>
          <div>
            <span
              className={
                fbDataLength
                  ? 'add-product-title-logout'
                  : 'add-product-title-mob'
              }
            >
              Import Photos
            </span>
          </div>
          {fbDataLength && (
            <div className="meta-logout-button">
              <Button onClick={disconnect} type="primary">
                Logout
              </Button>
            </div>
          )}
        </div>

        <div>
          <Tabs
            defaultActiveKey="1"
            centered
            onChange={handleChangeTabPane}
            activeKey={facebookModal ? '3' : '2'}
          >
            {/* <TabPane tab="Photos" key="1">
              {handleGoogleBody()}
            </TabPane> */}
            <TabPane tab="Instagram" key="2">
              <Spin spinning={loading}>
                {connectInstagram &&
                (get(igData, 'length', 0) !== 0 || !isEmpty(igData?.data)) ? (
                  <>
                    <div className="meta-mob-img-list">
                      {handleInstagramImageModal()}
                    </div>
                    {metaArray.length > 0 && (
                      <div className="flex-end" style={{ background: 'white' }}>
                        <Button
                          onClick={handleClickImport}
                          className="import-btn-meta"
                          disabled={!isEmpty(show)}
                        >
                          Import
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  handleInstagramBody()
                )}
              </Spin>
            </TabPane>
            <TabPane tab="Facebook" key="3">
              <Spin spinning={loading}>
                {connectFacebook && get(fbData, 'length', 0) > 0 ? (
                  <>
                    <div className="meta-mob-img-list">
                      {handleFacebookImageModal()}
                    </div>
                    {metaArray.length > 0 && (
                      <div className="flex-end" style={{ background: 'white' }}>
                        <Button
                          onClick={handleClickImport}
                          className="import-btn-meta"
                          disabled={!isEmpty(show)}
                        >
                          Import
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  handleFacebookBody()
                )}
              </Spin>
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      {!mobileView &&
        visibility !== 'image-only' &&
        visibility !== PAGE_BUILDER_UPLOAD && (
          <Row>
            <Col style={{ marginRight: '20px' }}>
              <FacebookLogo
                onClick={() => handleClickSideIcon('facebook', 'main')}
                cursor="pointer"
              />
            </Col>
            {/* <Col style={{ marginRight: '20px' }}>
              <Google
                onClick={() => handleClickSideIcon('google', 'main')}
                cursor="pointer"
                className="ml-10"
              />
            </Col> */}
            <Col>
              <Instagram
                onClick={() => handleClickSideIcon('instagram', 'main')}
                cursor="pointer"
                className="ml-10"
              />
            </Col>
          </Row>
        )}
      {mobileView ? (
        <Drawer
          open={uploadModal}
          onClose={handleUploadCancel}
          footer={false}
          className="upload-modal-main-social"
          closable={false}
        >
          {handleChangeMetaTab()}
        </Drawer>
      ) : (
        <Modal
          open={uploadModal}
          onOk={handleUploadOk}
          onCancel={handleUploadCancel}
          footer={false}
          className="upload-modal-main-social"
          width={700}
          closable={false}
          maskClosable={false}
          centered
        >
          {handleChangeMetaModal()}
        </Modal>
      )}
    </div>
  );
}

export default SocialModal;
