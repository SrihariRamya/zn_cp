import React, { useState, useContext, useEffect } from 'react';
import {
  Form,
  Drawer,
  Spin,
  Button,
  Input,
  Row,
  Alert,
  Select,
  Modal,
  Space,
  notification,
  Table,
  Typography,
  Avatar,
  Tag,
  Tooltip,
} from 'antd';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import SerpPreview from 'react-serp-preview';
import {
  get,
  isEmpty,
  map,
  forEach,
  flatten,
  merge,
  uniqBy,
  filter,
  compact,
} from 'lodash';
import { TenantContext } from '../../context/tenant-context';
import { CustomUpload } from '../../../shared/form-helpers';
import { getBase64 } from '../../../shared/attributes-helper';
import {
  getB2cCategory,
  getProducts,
  createCollection,
  getSelectedProduct,
  deleteSelectedProduct,
} from '../../../utils/api/url-helper';
import imagePath, {
  collectionDefaultImage,
} from '../../../shared/image-helper';
import {
  COLLECTION_ADD_SUCCESS,
  COLLECTION_UPDATE_SUCCESS,
  COLLECTION_CREATE_UPDATE_FAILED,
  COLLECTION_PRODUCT_DELETED_FAILED,
  COLLECTION_PRODUCT_DELETED_SUCCESS,
} from '../../../shared/constant-values';
import { seoImageCompressor } from '../../../shared/function-helper';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

function AddCollection(properties) {
  const {
    onClose,
    openDrawer,
    heading,
    editData,
    isEdit,
    handleAdd,
    fetchTableData,
  } = properties;
  // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
  const [tenantDetails, , ,] = useContext(TenantContext);
  const [form] = Form.useForm();
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [seoPageTitle, setSeoPageTitle] = useState('');
  const [seoMetaDescription, setSeoMetaDescription] = useState('');
  const [fileLists, setFileListArray] = useState([]);
  const [imgUrl, setImgUrl] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [categoryData, setCategoryData] = useState([]);
  const [subCategoryData, setSubCategoryData] = useState([]);
  // eslint-disable-next-line unicorn/no-null
  const [catId, setCategoryValue] = useState(null);
  // eslint-disable-next-line unicorn/no-null
  const [subCatId, setSubCategoryValue] = useState(null);
  const [catLoading, setCatLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [filteredProductData, setFilteredProductData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedID, setSelectedID] = useState([]);
  const [currentPage, setCurrentPage] = useState('');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [, setFileUploadCount] = useState(0);
  const { currency, currency_locale: currencyLocale } = get(
    tenantDetails,
    'setting',
    {}
  );

  const fetchProductData = () => {
    return new Promise((resolve, reject) => {
      setCatLoading(true);
      const catFilter = {};
      const searchParameter = {};
      const { pageSize, current } = pagination;
      if (subCatId) {
        catFilter.sub_category_uid = subCatId;
      } else if (catId) {
        catFilter.category_uid = catId;
      }
      if (editData) {
        searchParameter.collection_uid = editData?.collection_uid;
      }
      searchParameter.firstTableParams = 'zm_product';
      getProducts({
        limit: pageSize,
        offset: current,
        sorter: JSON.stringify({}),
        filters: JSON.stringify({}),
        isCollection: true,
        ...catFilter,
        ...searchParameter,
      })
        .then((response) => {
          const productDataSet = get(response, ['data'], []);
          setFilteredProductData(productDataSet.rows);
          setPagination({
            ...pagination,
            total: productDataSet.count,
          });
          setCatLoading(false);
          resolve();
        })
        .catch((error_) => reject(error_));
    });
  };

  const fetchData = () => {
    Promise.all([getB2cCategory(), fetchProductData()])
      .then((response) => {
        setCatLoading(false);
        setCategoryData(get(response, '[0].data', []));
      })
      .catch((error_) => {
        setCatLoading(false);
        notification.error({ message: error_.message });
      });
  };

  const fetchSelectedProduct = () => {
    const { collection_uid: collectionUid } = editData;
    setCatLoading(true);
    getSelectedProduct(collectionUid)
      .then((response) => {
        const productDataSet = get(response, 'data.rows', []);
        const productData = map(productDataSet, (data) => data.zm_products);
        const flattenData = flatten(productData);
        setCatLoading(false);
        const collectionProductUid = [];
        if (productDataSet) {
          forEach(productDataSet, (data) => {
            collectionProductUid.push({
              collectionUid: data.collection_product_uid,
            });
          });
        }
        const mergeData = merge(flattenData, collectionProductUid);
        setFilteredProductData(mergeData);
        setPagination({
          ...pagination,
          total: productDataSet.count,
        });
      })
      .catch((error) => {
        setCatLoading(false);
        notification.error({ message: get(error, 'message', '') });
      });
  };

  useEffect(() => {
    if (isEdit) {
      fetchSelectedProduct();
    } else {
      fetchData();
    }
  }, [isEdit]);

  useEffect(() => {
    if (!isEmpty(editData)) {
      const imageData = [
        {
          status: 'done',
          url: editData.image || collectionDefaultImage,
          name: editData.category_name,
        },
      ];
      setFileListArray(imageData);
      form.setFieldsValue({
        ...editData,
        title: editData.title,
        seoTitle: editData?.seo_title,
        seoDescription: editData?.seo_description,
      });
      setSeoPageTitle(editData?.seo_title || '');
      setSeoMetaDescription(editData?.seo_description || '');
    }
  }, [editData]);

  useEffect(() => {
    if (isEdit) {
      fetchSelectedProduct();
    } else {
      fetchProductData();
    }
  }, [catId, subCatId, currentPage]);

  useEffect(() => {
    if (!isEmpty(selectedID)) {
      setSaveDisabled(false);
    }
  }, [selectedID]);

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

  const handleCancel = () => {
    setPreviewVisible(false);
  };

  const handleClose = () => {
    setFileListArray([]);
    form.resetFields();
    onClose();
  };

  const onValuesChange = (changedValues) => {
    if (changedValues) {
      setSaveDisabled(false);
    }
  };

  const handleSubcategoryChange = (value) => {
    setSubCategoryValue(value);
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const resetFilters = () => {
    // eslint-disable-next-line unicorn/no-null
    setCategoryValue(null);
    // eslint-disable-next-line unicorn/no-null
    setSubCategoryValue(null);
    setSubCategoryData([]);
  };

  const handleSelectChange = (value) => {
    if (value) {
      setCategoryValue(value);
      // eslint-disable-next-line unicorn/no-null
      setSubCategoryValue(null);
      const subCategory = categoryData.filter(
        (item) => item.category_uid === value
      );
      setSubCategoryData(get(subCategory, '[0].sub_category', []));
      setPagination({
        ...pagination,
        current: 1,
      });
    } else {
      resetFilters();
    }
  };
  const handleTableChange = (paginationAlias) => {
    const { current } = paginationAlias;
    setPagination({
      ...pagination,
      current,
    });
    setCurrentPage(current);
  };

  const handleDeleteProduct = (data) => {
    const { collectionUid } = data;
    deleteSelectedProduct(collectionUid)
      .then((item) => {
        fetchSelectedProduct();
        notification.success({
          message: get(
            item,
            'message',
            '' || COLLECTION_PRODUCT_DELETED_SUCCESS
          ),
        });
      })
      .catch((error) => {
        notification.error({
          message: `${
            get(error, 'message', '') || COLLECTION_PRODUCT_DELETED_FAILED
          }`,
        });
      });
  };
  const columns = [
    {
      dataIndex: 'product_image',
      hidden: false,
      render: (text) =>
        text && <Avatar shape="square" size={25} src={imagePath(text)} />,
    },
    {
      title: 'Product Name',
      hidden: false,
      dataIndex: 'product_name',
      key: 'product_name',
      width: '20%',
      render: (text, id) => (
        <span className="text-green-dark">
          <Link to={`/products/product-details/${id.product_uid}`}>{text}</Link>
        </span>
      ),
      sorter: true,
    },
    {
      title: 'MRP',
      hidden: false,
      dataIndex: 'mrp',
      render: (text) => (
        <Text className="text-grey-light">
          <CurrencyFormatter value={text} type={currency} />
        </Text>
      ),
    },
    {
      title: 'Selling Price',
      hidden: false,
      dataIndex: 'price',
      render: (text) => (
        <Text className="text-grey-light">
          <CurrencyFormatter
            value={text}
            language={currencyLocale}
            type={currency}
          />
        </Text>
      ),
    },
  ].filter((item) => !get(item, 'hidden', false));

  if (isEdit) {
    columns.push({
      title: 'Action',
      align: 'center',
      render: (data, record) => {
        return (
          <span className="edit-box">
            <Tag
              color="red"
              onClick={() => handleDeleteProduct(record)}
              className="delete-tag"
            >
              <Tooltip title="Delete">
                <DeleteOutlined />
              </Tooltip>
            </Tag>
          </span>
        );
      },
    });
  }

  const handleSelectOneRow = (record, selected, selectedRows) => {
    const { product_uid: productUid } = record;
    if (selected) {
      const arrayProduct = [];
      arrayProduct.push(productUid);
      setSelectedRowKeys([...selectedRowKeys, ...arrayProduct]);
      setSelectedID([...selectedID, ...selectedRows]);
    } else {
      const filtered = filter(selectedRowKeys, (x) => !productUid.includes(x));
      setSelectedRowKeys(filtered);
      const filteredData = filter(
        selectedID,
        (x) => !productUid.includes(x?.product_uid)
      );
      setSelectedID(filteredData);
    }
  };
  const handleSelectALLRow = (selected, selectedRows, changeRows) => {
    const mappedData =
      changeRows && changeRows.map((data) => data?.product_uid);
    if (selected) {
      setSelectedRowKeys([...selectedRowKeys, ...mappedData]);
      setSelectedID([...selectedID, ...changeRows]);
    } else {
      const filtered = filter(selectedRowKeys, (x) => !mappedData.includes(x));
      setSelectedRowKeys(filtered);
      const filteredData = filter(
        selectedID,
        (x) => !mappedData.includes(x?.product_uid)
      );
      setSelectedID(filteredData);
    }
  };
  const rowSelection = {
    selectedRowKeys,
    onSelect: handleSelectOneRow,
    onSelectAll: handleSelectALLRow,
  };
  const onFinish = async (values) => {
    const { title, seoTitle, seoDescription, image } = values;
    const fileImage = fileLists && fileLists.map((item) => item.originFileObj);
    const seoPreviewImage = await seoImageCompressor(fileImage[0]);
    const files = {
      files: fileLists.map((item) => item.originFileObj),
      seo_image: seoPreviewImage,
    };
    const selectedProduct = [];
    const parameters = {
      title,
      seoTitle,
      seoDescription,
      selectedProduct,
      image: typeof image === 'string' ? image : '',
    };
    if (isEmpty(editData)) {
      parameters.collection_default_image = collectionDefaultImage;
    }
    setButtonLoading(true);
    const removeFalselySelectedID = compact(selectedID);
    const uniqSelectedData = uniqBy(removeFalselySelectedID, 'product_uid');
    if (!isEmpty(editData)) {
      if (uniqSelectedData) {
        // eslint-disable-next-line no-restricted-syntax
        for (const item of uniqSelectedData) {
          selectedProduct.push({
            collection_uid: editData.collection_uid,
            product_uid: item.product_uid,
            category_uid: item.category_uid,
            status: 1,
            sub_category_uid: item.sub_category_uid,
          });
        }
      }
      parameters.collection_uid = editData.collection_uid;
      parameters.selectedProduct = selectedProduct;
    } else if (uniqSelectedData) {
      // eslint-disable-next-line no-restricted-syntax
      for (const item of uniqSelectedData) {
        selectedProduct.push({
          product_uid: item.product_uid,
          category_uid: item.category_uid,
          sub_category_uid: item.sub_category_uid,
          status: 1,
        });
      }
    }
    if (isEmpty(editData) && isEmpty(uniqSelectedData)) {
      setButtonLoading(false);
      return notification.error({ message: 'Please select a product' });
    }
    createCollection(parameters, files)
      .then((response) => {
        const responseData = get(response, 'data', {});
        if (get(responseData, 'success', false)) {
          notification.success({
            message: `${
              isEmpty(editData)
                ? COLLECTION_ADD_SUCCESS
                : COLLECTION_UPDATE_SUCCESS
            }`,
          });
          setButtonLoading(false);
          fetchTableData();
          handleClose();
        } else {
          setButtonLoading(false);
          notification.error({
            message: `${
              get(responseData, 'message', '') ||
              COLLECTION_CREATE_UPDATE_FAILED
            }`,
          });
        }
      })
      .catch((error) => {
        notification.error({
          message: `${
            get(error, 'message', '') || COLLECTION_CREATE_UPDATE_FAILED
          }`,
        });
        setButtonLoading(false);
      });
    return '';
  };
  const handleOpenProduct = () => {
    handleAdd();
  };
  return (
    <Drawer
      width={900}
      onClose={handleClose}
      visible={openDrawer}
      maskClosable={false}
      destroyOnClose
      closable={false}
      className="category-adding-drawer"
    >
      <Spin spinning={false}>
        <div>
          <div className="category-title-container">
            <div>
              <ArrowLeftOutlined onClick={handleClose} />
            </div>
            <div className="category-title">{`${heading} Collection`}</div>
          </div>
          <Form
            form={form}
            className="user-form"
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ coverage_list: [] }}
            onValuesChange={onValuesChange}
            scrollToFirstError
          >
            <Alert
              className="text-mb7"
              message="The image should have a resolution of 300 x 300 for a better fit."
              type="warning"
              showIcon
            />
            <Form.Item name="image">
              <CustomUpload
                width={300}
                height={300}
                maxItem={1}
                setFileList={setFileListArray}
                handlePreview={handlePreview}
                fileListState={fileLists}
                setFileUploadCount={setFileUploadCount}
              />
            </Form.Item>
            <Form.Item
              label="Title"
              name="title"
              className="one"
              rules={[
                {
                  required: true,
                  message: 'Please enter collection title',
                },
              ]}
            >
              <Input placeholder="Enter collection Title" />
            </Form.Item>
            {isEdit && (
              <div className="">
                <div className="row-header">
                  <Row className="row-tittle">
                    <span className="m-10 text-green-dark">
                      Selected Product
                    </span>
                  </Row>
                </div>
                <div className="flex-item-end mt-10">
                  <Button type="primary" onClick={handleOpenProduct}>
                    Add More Products
                  </Button>
                </div>
                <div className=" collection-product mt-10">
                  <Table
                    className="grid-table product-grid-table"
                    rowKey={(record) => record.product_uid}
                    scroll={{ x: 780 }}
                    columns={columns}
                    dataSource={filteredProductData}
                    pagination={pagination}
                    loading={catLoading}
                    onChange={handleTableChange}
                  />
                </div>
              </div>
            )}
            {!isEdit && (
              <div className="">
                <div className="row-header">
                  <Row className="row-tittle">
                    <span className="m-10 text-green-dark">Add Product</span>
                  </Row>
                </div>
                <div className="mt-10">
                  <Space>
                    <Select
                      className="dropdown-picker"
                      virtual={false}
                      placeholder="Categories"
                      onChange={handleSelectChange}
                      value={catId}
                      allowClear
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentElement
                      }
                    >
                      {categoryData &&
                        categoryData.map((category) => (
                          <Option value={category.category_uid}>
                            {category.category_name}
                          </Option>
                        ))}
                    </Select>
                    <Select
                      className="dropdown-picker"
                      placeholder="Sub Categories"
                      virtual={false}
                      onChange={handleSubcategoryChange}
                      value={subCatId}
                      allowClear
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentElement
                      }
                    >
                      {subCategoryData &&
                        subCategoryData.map((subcategory) => (
                          <Option value={subcategory.sub_category_uid}>
                            {subcategory.sub_category_name}
                          </Option>
                        ))}
                    </Select>
                  </Space>
                </div>{' '}
                <div className="collection-product mt-10">
                  <Table
                    className="grid-table product-grid-table"
                    rowKey={(record) => record.product_uid}
                    scroll={{ x: 780 }}
                    columns={columns}
                    rowSelection={rowSelection}
                    dataSource={filteredProductData}
                    pagination={pagination}
                    loading={catLoading}
                    onChange={handleTableChange}
                  />
                </div>
              </div>
            )}
            &nbsp;
            <div className="seven">
              <div className="row-header">
                <Row className="row-tittle">
                  <span className="m-10 text-green-dark">SEO</span>
                </Row>
              </div>
              &nbsp;
              <Row className="mt-2">
                <SerpPreview
                  title={seoPageTitle || ''}
                  metaDescription={seoMetaDescription || ''}
                  url={`${get(
                    tenantDetails,
                    'customer_url',
                    ''
                  )}/collection-list?collectionId=${get(
                    editData,
                    'collection_uid',
                    ''
                  )}&viewType=grid`}
                />
              </Row>
              <Form.Item label="Page Title" name="seoTitle">
                <Input
                  onChange={(a) => setSeoPageTitle(a.target.value)}
                  placeholder="Page Title"
                />
              </Form.Item>
              <Form.Item label="Meta Description" name="seoDescription">
                <TextArea
                  style={{ width: '100%' }}
                  rows={4}
                  onChange={(a) => setSeoMetaDescription(a.target.value)}
                  className="p-desc"
                  placeholder="Meta Description"
                />
              </Form.Item>
            </div>
            &nbsp;
            <div className="text-right" style={{ marginBottom: '16px' }}>
              <Button
                size="large"
                type="primary"
                htmlType="submit"
                style={{ marginRight: '8px' }}
                disabled={saveDisabled}
                loading={buttonLoading}
                className="eight"
              >
                {isEmpty(editData) ? 'Save' : 'Update'}
              </Button>
              <Button size="large" danger onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </Spin>
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={undefined}
        onCancel={handleCancel}
      >
        <img alt={previewTitle} style={{ width: '100%' }} src={imgUrl} />
      </Modal>
    </Drawer>
  );
}

export default AddCollection;
