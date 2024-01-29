import React, { useState, useEffect, useContext } from 'react';
import {
  Form,
  Button,
  Select,
  notification,
  Space,
  Spin,
  Modal,
  Row,
} from 'antd';
import './banner.less';
import _, { split, isEmpty, get, map } from 'lodash';
import { v4 as uuid } from 'uuid';
import { createBanner, editBanner } from '../../utils/api/url-helper';
import {
  BANNER_ADD_SUCCESS,
  BANNER_UPDATE_SUCCESS,
  BANNER_ADD_FAILED,
  FAILED_TO_LOAD,
  BANNER_UPDATE_FAILED,
  ADOBE_BANNER,
  TENANT_MODE_NORMAL,
} from '../../shared/constant-values';
import { getBase64 } from '../../shared/attributes-helper';
import { CustomUpload } from '../../shared/form-helpers';
import AdobeExpress from '../settings/appearance/adobe';
import { TenantContext } from '../context/tenant-context';

const { Option } = Select;

const BannerForm = ({
  setEditorContext,
  editorContext,
  contextProperties,
  renderArea,
  handleCancel,
  bannerRecord,
  isModalVisible,
  selectedSubCategory,
  selectedProduct,
  updateTable,
  visibleModal,
  categoriesData,
  tabKey,
  fileList,
  setFileList,
  productsData,
  validateBanner,
  handleOk,
  modalClose,
  bannerImage,
  bannerRatio,
}) => {
  const [form] = Form.useForm();
  const [spinner, setSpinner] = useState(false);
  const [imgUrl, setImgUrl] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [productData, setproductData] = useState([]);
  const [selectedproductDatas, setselectedproductDatas] = useState([]);
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [bannerID, setBannerID] = useState([]);
  const [disabled, setDisabled] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [designImage, setDesignImage] = useState({});
  const [selectedRatio, setSelectedRatio] = useState({});
  const [tenantDetails] = useContext(TenantContext);

  const isNormalTenant =
    get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL;

  useEffect(() => {
    const subcategoryDatas = _.get(selectedSubCategory, '[0].sub_category', []);
    setDesignImage(get(bannerImage, 'asset.data', ''));
    setCategoryData(categoriesData);
    setproductData(productsData);
    setSubCategoryData(
      selectedSubCategory === 'Add Banner' ? [] : subcategoryDatas
    );
    setselectedproductDatas(
      selectedProduct === 'Add Banner' ? productsData : selectedProduct
    );
    if (visibleModal === false || isModalVisible === false) {
      setDisabled(true);
    }
    try {
      if (bannerRecord.banner_id) {
        let fileImage = [];
        if (bannerRecord?.img) {
          const name = split(bannerRecord.img, '/');
          fileImage = [
            {
              name: name[name.length - 1] || '',
              status: 'done',
              url: bannerRecord.img,
            },
          ];
          setFileList(fileImage);
          form.setFieldsValue({
            Image: fileImage,
          });
        }
        form.setFieldsValue({
          product_name:
            bannerRecord.zm_product === null ? '' : bannerRecord.product_name,
        });
        form.setFieldsValue({
          category_uid:
            bannerRecord.category === null ? '' : bannerRecord.category_uid,
        });
        form.setFieldsValue({
          sub_category_uid:
            bannerRecord.subCategory === null
              ? ''
              : bannerRecord.sub_category_uid,
        });
        setImgUrl(bannerRecord.img);
        setBannerID(bannerRecord.banner_id);
      } else {
        form.resetFields();
        setImgUrl();
      }
    } catch {
      notification.error({ message: FAILED_TO_LOAD });
    }
  }, [
    bannerRecord,
    categoriesData,
    productsData,
    form,
    isModalVisible,
    selectedSubCategory,
    setFileList,
    visibleModal,
    productData,
    selectedProduct,
    bannerImage,
  ]);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setImgUrl(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
    );
  };

  let checkFile = {};
  const urlToObject = async () => {
    const response = await fetch(designImage);
    const blob = await response.blob();
    const file = new File([blob], 'banner.jpeg', { type: blob.type });
    checkFile = [file];
  };

  const onFinish = async (values) => {
    setDisabled(true);
    const banner = {
      category_uid: values.category_uid || '',

      sub_category_uid: values.sub_category_uid || '',

      product_name: values.product_name || '',

      web: tabKey === 'Web' ? 1 : 0,
      mobile: tabKey === 'Mobile' ? 1 : 0,
      banner_ratio: get(selectedRatio, '0.canvasSize', ''),
    };

    await urlToObject();
    let files = {};
    if (!isEmpty(bannerImage)) {
      files = {
        files: checkFile,
      };
    } else {
      files = {
        files: map(fileList, (item) => item.originFileObj),
      };
    }
    setSpinner(true);
    createBanner(banner, files)
      .then((response) => {
        if (response.data) {
          if (renderArea === 'appearance') {
            setEditorContext(
              _.map(editorContext, (item) => {
                _.map(_.get(item, 'column', []), async (element) => {
                  if (
                    _.get(element, 'section.appearance_section_uid') ===
                    _.get(contextProperties, 'appearance_section_uid')
                  ) {
                    const addSection = { appearance_section_array_uid: uuid() };
                    addSection.banner_id = _.get(response, 'data.banner_id');
                    addSection.preview = _.get(response, 'data.img');
                    element.section.sectionArray = [
                      ...contextProperties.sectionArray,
                      addSection,
                    ];
                  }
                  return element;
                });
                return item;
              })
            );
            handleCancel();
            setDisabled(false);
            setSpinner(false);
            return;
          }
          notification.success({ message: BANNER_ADD_SUCCESS });
          handleCancel();
          updateTable(response.data);
          setDisabled(true);
          setSpinner(false);
          return;
        }
        notification.error({ message: BANNER_ADD_FAILED });
        handleCancel();
        setDisabled(false);
        setSpinner(false);
      })
      .catch((error) => {
        notification.error({
          message: _.get(error, 'error', BANNER_ADD_FAILED),
        });
        handleCancel();
        setDisabled(false);
        setSpinner(false);
      });
  };

  const updateBanner = async (values) => {
    setDisabled(true);
    const banner = {
      category_uid: values.category_uid,
      sub_category_uid: values.sub_category_uid,
      product_name: values.product_name,
      web: tabKey === 'Web' ? 1 : 0,
      mobile: tabKey === 'Mobile' ? 1 : 0,
      banner_ratio: get(selectedRatio, '0.canvasSize', ''),
    };
    await urlToObject();
    let files = {};
    if (!isEmpty(bannerImage)) {
      files = {
        files: checkFile,
      };
    } else {
      files = {
        files: map(fileList, (item) => item.originFileObj),
      };
    }
    setSpinner(true);
    editBanner(banner, files, bannerID)
      .then(async (response) => {
        if (response.data) {
          if (renderArea === 'appearance' && !isEmpty(files.files[0])) {
            const previewData = await getBase64(files.files[0]);
            setEditorContext(
              _.map(editorContext, (item) => {
                _.map(_.get(item, 'column', []), (element) => {
                  if (
                    _.get(element, 'section.appearance_section_uid') ===
                    _.get(contextProperties, 'appearance_section_uid')
                  ) {
                    _.map(
                      element.section.sectionArray,
                      async (sectionArray) => {
                        if (sectionArray.banner_id === bannerID) {
                          sectionArray.bannerMapped = null;
                          sectionArray.preview = previewData;
                        }
                        return sectionArray;
                      }
                    );
                  }
                  return element;
                });
                return item;
              })
            );
          }
          notification.success({ message: BANNER_UPDATE_SUCCESS });
          handleCancel();
          updateTable(response.data);
          setDisabled(true);
          setSpinner(false);
        } else {
          notification.error({ message: BANNER_UPDATE_FAILED });
          handleCancel();
          setDisabled(false);
          setSpinner(false);
        }
      })
      .catch((error) => {
        setSpinner(false);
        notification.error({
          message: _.get(error, 'error', BANNER_UPDATE_FAILED),
        });
        handleCancel();
        setDisabled(false);
      });
  };

  const handleSelectChange = (value) => {
    if (!value) {
      form.setFieldsValue({ category_uid: '' });
      form.setFieldsValue({ sub_category_uid: '' });
      setselectedproductDatas(productData);
      setSubCategoryData([]);
      setDisabled(false);
    } else {
      form.setFieldsValue({ sub_category_uid: '' });
      form.setFieldsValue({ product_name: '' });
      const subCategory = categoryData.filter(
        (item) => item.category_uid === value
      );
      const productDatas = categoryData.filter(
        (item) => item.category_uid === value
      );
      if (!isEmpty(subCategory)) {
        setSubCategoryData(_.get(subCategory, '[0].sub_category', []));
      } else {
        form.setFieldsValue({ sub_category_uid: '' });
        setSubCategoryData([]);
      }
      if (productDatas) {
        setselectedproductDatas(_.get(productDatas, '[0].productList', []));
      } else {
        form.setFieldsValue({ product_name: '' });
        setselectedproductDatas([]);
      }
      setDisabled(false);
    }
  };

  const handleChange = (value) => {
    if (value) {
      form.setFieldsValue({ product_name: '' });
      const productwithsubcategory = subCategoryData.filter(
        (item) => item.sub_category_uid === value
      );
      if (!isEmpty(productwithsubcategory)) {
        setselectedproductDatas(
          _.get(productwithsubcategory, '[0].productList', [])
        );
      } else {
        form.setFieldsValue({ product_name: '' });
        setselectedproductDatas([]);
      }
      setDisabled(false);
    } else if (form.getFieldValue('category_uid')) {
      form.setFieldsValue({ sub_category_uid: '' });
      form.setFieldsValue({ product_name: '' });
      const productwithcategory = categoryData.filter(
        (item) => item.category_uid === form.getFieldValue('category_uid')
      );
      if (!isEmpty(productwithcategory)) {
        setselectedproductDatas(
          _.get(productwithcategory, '[0].productList', [])
        );
      }
      setDisabled(false);
    } else {
      setselectedproductDatas(productData);
      setDisabled(false);
    }
  };
  const handleproductChange = (value) => {
    if (value) {
      setDisabled(false);
    } else {
      form.setFieldsValue({ product_name: '' });
      setDisabled(false);
    }
  };
  const handleImgChange = (value) => {
    if (value) {
      setDisabled(false);
    }
  };

  const handleClose = () => {
    handleCancel();
    setFileList([]);
  };
  const handleCloseModal = () => {
    setPreviewVisible(false);
  };

  const handleModal = (value) => {
    modalClose(value);
  };
  const openModal = (type, value, ratio) => {
    handleOk(type, value);
    setSelectedRatio(ratio);
  };

  return (
    <>
      <Spin spinning={spinner}>
        <Form
          form={form}
          layout="vertical"
          onFinish={bannerRecord.banner_id ? updateBanner : onFinish}
        >
          <Row>
            <>
              {isEmpty(designImage) && (
                <Form.Item
                  name="Image"
                  label="Add Banner"
                  rules={[{ required: isEmpty(bannerImage) }]}
                >
                  <CustomUpload
                    width={tabKey === 'web' ? 5000 : 360}
                    height={tabKey === 'web' ? 1852 : 150}
                    maxItem={1}
                    setFileList={setFileList}
                    handlePreview={handlePreview}
                    fileListState={fileList}
                    onChange={handleImgChange}
                    skipResize
                    cropImage={false}
                    validateBanner={validateBanner}
                  />
                </Form.Item>
              )}
              {!isEmpty(designImage) && (
                <img
                  src={designImage}
                  style={{ width: '25%', marginBottom: '5%' }}
                  alt="Adobe Express"
                />
              )}
            </>
          </Row>
          <div className="mb-10">
            <AdobeExpress
              handleModal={handleModal}
              openModal={openModal}
              adobeParam={!isEmpty(bannerRatio) ? bannerRatio : ADOBE_BANNER}
            />
          </div>
          {isNormalTenant && (
            <>
              <Form.Item name="category_uid" label="Category">
                <Select
                  placeholder="Select Category"
                  virtual={false}
                  onChange={handleSelectChange}
                  allowClear
                >
                  {map(categoryData, (item) => (
                    <Option value={get(item, 'category_uid')}>
                      {get(item, 'category_name')}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="sub_category_uid" label="Sub Category">
                <Select
                  placeholder="Select Sub Category"
                  onChange={handleChange}
                  virtual={false}
                  allowClear
                >
                  {map(subCategoryData, (subCategory) => (
                    <Option value={get(subCategory, 'sub_category_uid')}>
                      {get(subCategory, 'sub_category_name')}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="product_name" label="Product">
                <Select
                  placeholder="Select Product Name"
                  onChange={handleproductChange}
                  virtual={false}
                  allowClear
                >
                  {map(selectedproductDatas, (products) => (
                    <Option value={get(products, 'product_uid')}>
                      {get(products, 'product_name')}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
          <div className="flex-end">
            <Form.Item>
              <Space className="f_btns">
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={!isEmpty(designImage) ? false : disabled}
                >
                  Save
                </Button>
                <Button onClick={handleClose} danger>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </div>
        </Form>
        <Modal
          title={previewTitle}
          visible={previewVisible}
          footer={null}
          onCancel={handleCloseModal}
        >
          <img alt={imgUrl} style={{ width: '100%' }} src={imgUrl} />
        </Modal>
      </Spin>
    </>
  );
};
export default BannerForm;
