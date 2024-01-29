/* eslint-disable camelcase */
import React, { useState, useEffect, useContext } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Drawer,
  Radio,
  notification,
  Spin,
} from 'antd';
import { withRouter } from 'react-router-dom';
import { get, filter, isEmpty } from 'lodash';
import { getBase64 } from '../../shared/attributes-helper';
import { CustomUpload } from '../../shared/form-helpers';
import ProductMapping from '../products/product-mapping';
import {
  createStories,
  createMediaProduct,
  deletePromoteProducts,
} from '../../utils/api/url-helper';
import './promote-products.less';
import { ReactComponent as Instagram } from '../../assets/icons/instagram-icon.svg';
import { ReactComponent as Facebook } from '../../assets/icons/facebook-icon.svg';
import { defaultImage } from '../../shared/image-helper';
import { DeleteAlert, DeleteAlertImage } from '../../shared/sweetalert-helper';
import { DELETE_PROMOTE_PRODUCT } from '../../shared/constant-values';
import { TenantContext } from '../context/tenant-context';

const { TextArea } = Input;

function SocialMediaProductsForm(properties) {
  const {
    isMediaDrawer,
    closeMediaDrawer,
    isEditPromoteProduct,
    promoteProduct,
    setIsMediaDrawer,
    fetchPromoteProducts,
    pagination,
  } = properties;
  const tenantDetails = useContext(TenantContext)[0];
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [promoteMediaType, setPromoteMediaType] = useState('');
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [isSelectedPrdts, setIsSelectedPrdts] = useState(false);
  const [promoteFormList, setPromoteFormList] = useState([]);
  const [promoteMedia, setPromoteMediaData] = useState([]);
  const [productUid, setProductUid] = useState('');
  const [categoryUid, setCategoryUid] = useState('');
  const [promoteproductId, setPromoteProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');

  const tailLayout = {
    wrapperCol: {
      offset: 4,
      span: 16,
    },
  };

  // useEffect(() => {
  //   return new Promise((resolve) => {
  //     window.fbAsyncInit = () => {
  //       window.FB.init({
  //         appId: '643565580901008',
  //         // autoLogAppEvents: true,
  //         cookie: false,
  //         xfbml: true,
  //         version: 'v15.0',
  //       });
  //       window.FB.getLoginStatus((response) => {
  //         checkLoginState(response);
  //       });
  //     };
  //     ((d, s, id) => {
  //       const fjs = d.getElementsByTagName(s)[0];
  //       if (d.getElementById(id)) return;
  //       const js = d.createElement(s);
  //       js.id = id;
  //       js.src = '//connect.facebook.net/en_US/sdk.js';
  //       fjs.parentNode.insertBefore(js, fjs);
  //     })(document, 'script', 'facebook-jssdk');
  //     resolve();
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const getParsedTitle = (name) => {
    const title = name.toString().replaceAll(' ', '-');
    const regex = /[^\d()A-Za-z-]+/g;
    return title.replaceAll(regex, '');
  };

  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  const showMediaModal = () => {
    setIsModalVisible(true);
  };

  const closeMediaModal = () => {
    setIsModalVisible(false);
    setPromoteMediaType('');
  };

  const onResetFields = () => {
    setIsModalVisible(false);
    form.setFieldsValue({
      product_name: '',
      description: '',
      targetURL: '',
    });
    setFileList([]);
  };

  const deletePromoteProduct = async () => {
    if (isEmpty(promoteproductId)) {
      const text =
        'Are you sure you want to delete this promote product from the list?';
      const result = await DeleteAlert(text);
      if (result.isConfirmed) {
        deletePromoteProducts(promoteproductId)
          .then((response) => {
            if (response.success) {
              DeleteAlertImage(DELETE_PROMOTE_PRODUCT);
            }
            onResetFields();
            closeMediaDrawer();
            fetchPromoteProducts({ pagination });
          })
          .catch((error) => {
            notification.error({
              message: error.message,
            });
          });
      }
    }
  };
  const getPromoteProducts = (data) => {
    const promotedProduct = get(data, '[0]', []);

    // eslint-disable-next-line camelcase
    const {
      product_name,
      description,
      product_image,
      product_uid,
      product_variants,
      category_uid,
    } = promotedProduct;
    const targetUrl = `${get(tenantDetails, 'customer_url')}/${getParsedTitle(
      product_name
    )}/pd/${product_uid}/${get(product_variants, '[0].id')}`;
    const filterImage = filter(
      product_image,
      (item) => item.image_source === 'Web'
    );
    const getImage = get(filterImage, '[0]');
    const promotedImage = [
      {
        url: getImage?.product_image || defaultImage,
        status: 'done',
        name: getImage?.name || 'NO IMAGE',
      },
    ];
    closeDrawer();
    form.setFieldsValue({
      product_name,
      description,
      targetURL: targetUrl,
      image_url: getImage?.product_image || defaultImage,
    });
    setFileList(promotedImage);
    setProductUid(product_uid);
    setCategoryUid(category_uid);
    setPromoteFormList(data);
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setImgUrl(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url.slice(Math.max(0, file.url.lastIndexOf('/') + 1))
    );
  };

  const handleMediaPublish = async (event) => {
    setLoading(true);
    const { value } = event.target;
    setPromoteMediaType(value);
    const mediaParameters = {
      ...promoteMedia,
      media_type: value,
      product_uid: productUid,
      promote_product_type: 'PUBLISHED',
      promote_product_id: promoteproductId,
    };
    const file = {
      files: fileList.map((item) => item.originFileObj),
    };
    await createStories(
      mediaParameters,
      promoteMedia.image_url ? [] : file
    ).then((response) => {
      try {
        notification.success({
          message:
            response?.data?.message ||
            'Social Media Products Published Successfully',
        });
        closeMediaModal();
        onResetFields();
        setLoading(false);
        closeMediaDrawer();
      } catch (error) {
        notification.error({
          message: error.message,
        });
        setLoading(false);
      }
    });
  };

  const addMediaProducts = (data) => {
    const parameters = {
      ...data,
      product_uid: productUid,
      category_uid: categoryUid,
      promote_product_type: 'SAVED',
    };
    const file = {
      files: fileList.map((item) => item.originFileObj),
    };
    createMediaProduct(parameters, data.image_url ? [] : file)
      .then((response) => {
        const message = get(response, 'data.message', 'Created Successfully');
        notification.success({ message });
        onResetFields();
        closeMediaDrawer();
        fetchPromoteProducts({ pagination });
      })
      .catch((error) => {
        notification.error({
          message: error.message,
        });
      });
  };

  const createPromoteProduct = async (event, key) => {
    event.preventDefault();
    const getImageUrl = get(fileList, '[0].url');
    form.validateFields().then((value) => {
      const parameters = {
        image_url: getImageUrl,
        product_name: value.product_name,
        description: value.description,
        target_url: value.targetURL,
      };
      setPromoteMediaData(parameters);
      if (key === 'save') {
        addMediaProducts(parameters);
      } else {
        showMediaModal();
      }
    });
  };

  useEffect(() => {
    if (isEditPromoteProduct) {
      const {
        product_name,
        description,
        target_url,
        image_url,
        promote_product_id,
      } = promoteProduct;
      const promotedImage = [
        {
          url: image_url || defaultImage,
          status: 'done',
          name: 'IMAGE' || 'NO IMAGE',
        },
      ];
      form.setFieldsValue({
        product_name,
        description,
        targetURL: target_url,
        image_url: image_url || defaultImage,
      });
      setPromoteProductId(promote_product_id);
      setFileList(promotedImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoteProduct, isMediaDrawer]);

  const onCloseMediaDrawer = () => {
    setIsMediaDrawer(false);
    setFileList([]);
  };

  return (
    <>
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => {
          setPreviewVisible(false);
        }}
      >
        <img alt={previewTitle} style={{ width: '100%' }} src={imgUrl} />
      </Modal>
      <Drawer
        title={
          isEditPromoteProduct ? 'Edit Promote Product' : 'Add Promote Product'
        }
        width={750}
        visible={isMediaDrawer}
        onClose={onCloseMediaDrawer}
        closable={onCloseMediaDrawer}
        destroyOnClose
        className="related-prdt-drawer"
      >
        <div id="status" />
        <div className="import-btn">
          <Button type="primary" onClick={() => showDrawer()}>
            Import from Zupain
          </Button>
        </div>
        <Form
          form={form}
          name="promote_form"
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 12,
          }}
          initialValues={promoteFormList}
          autoComplete="off"
        >
          <Form.Item
            label="Title"
            name="product_name"
            rules={[
              {
                required: true,
                message: 'Please input your title!',
              },
            ]}
          >
            <Input placeholder="Title of the shoutout" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: 'Please input your Description!',
              },
            ]}
          >
            <TextArea
              rows={6}
              placeholder="This will be shown in shoutout details page(Large)"
            />
          </Form.Item>
          <Form.Item
            name="image_url"
            label="Upload Creative"
            rules={[
              {
                required: true,
                message: 'Please upload image',
              },
            ]}
          >
            <CustomUpload
              className="img_uploader store-image-uploader"
              width={291}
              height={291}
              maxItem={1}
              setFileList={setFileList}
              handlePreview={handlePreview}
              fileListState={fileList}
            />
          </Form.Item>
          <Form.Item
            label="Target URL"
            name="targetURL"
            rules={[
              {
                required: true,
                message: 'Please enter url',
              },
              {
                type: 'url',
                warningOnly: true,
                message: 'Please enter valid url',
              },
            ]}
          >
            <Input placeholder="Enter the URL" />
          </Form.Item>
          <Form.Item {...tailLayout} className="mt-3rem">
            <Button
              type="primary"
              size="small"
              className="save-prdt-btn mr-30"
              htmlType="submit"
              onClick={(event) => createPromoteProduct(event, 'save')}
            >
              {isEditPromoteProduct ? 'Update' : 'Save'}
            </Button>
            <Button
              type="primary"
              size="small"
              className="save-prdt-btn mr-30"
              onClick={(event) => createPromoteProduct(event, 'publish')}
            >
              Publish
            </Button>
            {isEditPromoteProduct && (
              <Button
                htmlType="button"
                className="cancel-prdt-btn"
                onClick={deletePromoteProduct}
              >
                Delete
              </Button>
            )}
          </Form.Item>
        </Form>
        <>
          <Modal
            title="Choose where to publish"
            visible={isModalVisible}
            footer={null}
            onCancel={closeMediaModal}
            maskClosable={false}
            centered
          >
            <Spin spinning={loading}>
              <Radio.Group
                onChange={handleMediaPublish}
                value={promoteMediaType}
              >
                <Radio value="instagram" className="promote-radio">
                  <Instagram className="promote-icon" />
                </Radio>
                <Radio value="facebook" className="promote-radio">
                  <Facebook className="promote-icon" />
                </Radio>
              </Radio.Group>
            </Spin>
          </Modal>
        </>
        {/* <> */}
        <Drawer
          title="Add Promote Products"
          width={750}
          visible={isDrawerVisible}
          onClose={closeDrawer}
          closable={closeDrawer}
          destroyOnClose
        >
          <ProductMapping
            onCancel={closeDrawer}
            isPromoteProduct
            getPromoteProduct={getPromoteProducts}
            setIsSelectedPrdts={setIsSelectedPrdts}
            isSelectedPrdts={isSelectedPrdts}
          />
        </Drawer>
      </Drawer>
    </>
  );
}
export default withRouter(SocialMediaProductsForm);
