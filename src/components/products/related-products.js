import React, { useState, useEffect, useContext } from 'react';
import {
  Table,
  Drawer,
  Button,
  Row,
  Col,
  notification,
  Typography,
  Avatar,
  List,
  Card,
  Pagination,
  Tooltip,
  Tag,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { isEmpty, get, map, isNull } from 'lodash';
import { Link } from 'react-router-dom';
import ProductMapping from './product-mapping';
import {
  RELATED_PRODUCT_RETRIVE_FAILED,
  RELATED_PRODUCT_DELETE_FAILED,
  RELATED_PRODUCT_CREATE_FAILED,
  DELETE_RELATED_PRODUCT,
  VIDEO_TYPES,
} from '../../shared/constant-values';
import {
  createRelatedProducts,
  getAllRelatedProducts,
  deleteRelatedProducts,
} from '../../utils/api/url-helper';
import './product.less';
import { getFilterData } from '../../shared/table-helper';
import { DeleteAlert, DeleteAlertImage } from '../../shared/sweetalert-helper';
import { TenantContext } from '../context/tenant-context';
import { eventTrack } from '../../shared/function-helper';
import { ReactComponent as DeleteIcon } from '../../assets/images/delete-icon.svg';
import imagePath from '../../shared/image-helper';
import { ReactComponent as BackArrow } from '../../assets/icons/back-arrow.svg';
import EmptyData from '../../shared/empty-data';
import { ReactComponent as FilterIcon } from '../../assets/icons/category-filter.svg';

const { Text } = Typography;

function RelatedProducts(properties) {
  const {
    isRelatedDrawer,
    productStatus,
    productName,
    closeRelatedDrawer,
    productId,
    productUid,
    mobileView,
  } = properties;
  const [isAddProducts, setIsAddProducts] = useState(false);
  const [isRelatedProducts] = useState(true);
  const [relatedProductsfilter, setRelatedProductsfilter] = useState([]);
  const [isSaveButtonLoading, setIsSaveButtonLoading] = useState(false);
  const [isLoading, setIsLodaing] = useState(false);
  const [isSelectedPrdts, setIsSelectedPrdts] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [productFilter, setProductFilter] = useState({});
  const [productSorter, setProductSorter] = useState({});
  const [productCurrentValue, setProductCurrentValue] = useState(1);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [tenantDetails] = useContext(TenantContext);
  const { currency, currency_locale: currencyLocale } = get(
    tenantDetails,
    'setting',
    {}
  );

  const showModal = () => {
    const parameter = {
      value: 'Add Product',
    };
    eventTrack('Add Product Click', parameter);
    setIsAddProducts(true);
  };

  const onCancel = () => {
    setIsAddProducts(false);
  };

  const getRelatedProducts = async (parameters = {}) => {
    setIsLodaing(true);
    const {
      pagination: { pageSize, current },
    } = parameters;
    const queryParameter = {
      limit: pageSize,
      offset: current,
      filters: JSON.stringify(productFilter),
      sorter: JSON.stringify(productSorter),
    };
    await getAllRelatedProducts(productUid, queryParameter)
      .then((response) => {
        const dataSource = get(response, 'data.rows', []);
        const relatedItems = map(dataSource, (item) => ({
          ...item,
          product_name: item.zm_product.product_name,
          product_image: item.zm_product.product_image,
        }));
        setRelatedProductsfilter(relatedItems);
        setIsLodaing(false);
        setPagination({
          ...parameters.pagination,
          total: response.data.count,
        });
      })
      .catch((error) => {
        notification.error({
          message: error.message || RELATED_PRODUCT_RETRIVE_FAILED,
        });
        setIsLodaing(false);
      });
  };

  useEffect(() => {
    getRelatedProducts({ pagination });
  }, []);

  const addRelatedProduct = (relatedProductArray) => {
    if (!isEmpty(relatedProductArray)) {
      setIsSaveButtonLoading(true);
      createRelatedProducts({ relatedProductArray })
        .then((response) => {
          setIsAddProducts(false);
          setIsSaveButtonLoading(false);
          getRelatedProducts({ pagination });
          setIsSelectedPrdts(false);
          notification.success({ message: response.message });
        })
        .catch((error) => {
          notification.error({
            message: error.message || RELATED_PRODUCT_CREATE_FAILED,
          });
          setIsAddProducts(false);
          setIsSelectedPrdts(false);
          setIsSaveButtonLoading(false);
        });
    }
  };

  const onDeleteRelatedProducts = async (event, data) => {
    const { related_product_id: relatedProductId } = data;
    const text =
      'Are you sure you want to delete this related product from the list?';
    const result = await DeleteAlert(text, event);
    if (result.isConfirmed) {
      setIsLodaing(true);
      deleteRelatedProducts(relatedProductId)
        .then((response) => {
          if (response.success) {
            setIsLodaing(false);
            getRelatedProducts({ pagination });
            DeleteAlertImage(DELETE_RELATED_PRODUCT);
          }
        })
        .catch((error) => {
          notification.error({
            message: error.message || RELATED_PRODUCT_DELETE_FAILED,
          });
          setIsLodaing(false);
        });
    }
  };

  const columns = [
    {
      hidden: false,
      title: 'Product Name',
      key: 'product_name',
      dataIndex: 'product_name',
      render: (response, product) => (
        <>
          {' '}
          <span>
            {imagePath(get(product, 'product_image', []))
              .split('.')
              .some((type) => VIDEO_TYPES.includes(type)) ? (
              <video kind="captions" className="video-src prdt-video">
                <track kind="captions" />
                <source
                  kind="captions"
                  src={imagePath(get(product, 'product_image', []))}
                  type="video/mp4"
                />
              </video>
            ) : (
              get(product, 'product_image', []) && (
                <Avatar
                  shape="square"
                  size={30}
                  src={imagePath(get(product, 'product_image', []))}
                />
              )
            )}
          </span>
          <Text className="typography-text ml-10 ">{response}</Text>
        </>
      ),
      sorter: true,
      ...getFilterData(
        'Product Name',
        'product_name',
        'text',
        setProductFilter,
        productFilter
      ),
    },
    {
      title: 'Price',
      hidden: false,
      width: '20%',
      dataIndex: ['zm_product'],
      render: (text) => (
        <Text className="typography-text typography-text-align">
          {!isNull(get(text, 'price', '')) && (
            <CurrencyFormatter
              value={get(text, 'price', '')}
              language={currencyLocale}
              type={currency}
            />
          )}
        </Text>
      ),
    },
    {
      title: 'Actions',
      render: (response) => (
        <div className="back-arrow">
          <DeleteIcon
            twoToneColor="#d9363e"
            onClick={(event) => onDeleteRelatedProducts(event, response)}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (Object.keys(productSorter).length > 0) {
      getRelatedProducts({
        pagination: { pageSize: 10, current: productCurrentValue },
      });
    }
  }, [productSorter]);

  const getTableData = (sorter, current) => {
    if (!isEmpty(sorter.order) && sorter) {
      setProductSorter({
        columnKey: sorter.columnKey,
        orders: sorter.order === 'ascend' ? 'ascend' : 'descend',
      });
      setProductCurrentValue(current);
    } else {
      setProductSorter({
        columnKey: sorter.columnKey,
        orders: sorter.order === '',
      });
      setProductCurrentValue(current);
    }
  };

  const handleTableChange = (paginationAlias, filters, sorter) => {
    if (mobileView) {
      getTableData('', paginationAlias);
    } else {
      const { current } = paginationAlias;
      getTableData(sorter, current);
    }
  };

  const addProductButton = () => {
    return (
      <div>
        {!isAddProducts && (
          <Button
            className="related-add-product-btn"
            type="primary"
            onClick={() => showModal()}
            id="addProductBtn"
            disabled={productStatus === false}
            icon={<PlusOutlined />}
          >
            &nbsp;Add Related Products
          </Button>
        )}
      </div>
    );
  };

  const customDrawerStyle = {
    marginTop: '130px',
    zIndex: '99',
  };
  const customMaskStyle = {
    background: 'none',
  };

  const showDrawer = () => {
    setIsOpenDrawer(true);
  };

  const relatedProductsProperties = {
    relatedProductsfilter,
    productId,
    onCancel,
    addRelatedProduct,
    isRelatedProducts,
    productUid,
    isSaveBtnLoading: isSaveButtonLoading,
    setIsSelectedPrdts,
    isSelectedPrdts,
    isAddProducts,
    mobileView,
    isOpenDrawer,
    setIsOpenDrawer,
  };

  return (
    <Drawer
      style={mobileView && customDrawerStyle}
      className={`related-prdt-drawer drawer-heading  ${
        isAddProducts && mobileView
          ? 'mobile-view-prdt-drawer'
          : mobileView && 'mobile-view-drawer'
      }`}
      title={
        <Row className="drawer-title-div">
          <Col span={mobileView ? 2 : 1}>
            <BackArrow onClick={closeRelatedDrawer} />
          </Col>
          <Col span={19}>
            <Text
              className={
                isAddProducts && mobileView
                  ? 'prdt-mapping-title '
                  : 'inventory-heading'
              }
            >
              {isAddProducts && mobileView
                ? 'Add products to category'
                : 'Add Related Products'}
            </Text>
          </Col>
          {isAddProducts && mobileView && (
            <Col span={3}>
              <Tag
                className="filter-tag"
                onClick={showDrawer}
                icon={<FilterIcon className="category-filter" />}
                color="#E9E9E9E9"
              >
                <Text className="add-typography prdt-mapping-title">
                  Filter
                </Text>
              </Tag>
            </Col>
          )}
        </Row>
      }
      width={750}
      maskStyle={mobileView && customMaskStyle}
      closable={false}
      open={isRelatedDrawer}
      onClose={closeRelatedDrawer}
      footer={false}
    >
      {!isAddProducts && (
        <>
          <Row>
            <Col span={17}>
              <Text
                className={`view-type-text ${
                  mobileView ? 'mobile-prdt-text' : 'prdt-text'
                }`}
              >{`Product Name: ${productName}`}</Text>
              <br />
            </Col>
            <Col span={4} className="mb-10p">
              {!mobileView && addProductButton()}
            </Col>
          </Row>
          {!mobileView && (
            <Table
              className="product-table related-prdt-table"
              dataSource={relatedProductsfilter}
              columns={columns}
              loading={isLoading}
              pagination={pagination}
              onChange={handleTableChange}
              locale={{
                emptyText: (
                  <div style={{ textAlign: 'center' }}>
                    <EmptyData />
                  </div>
                ),
              }}
            />
          )}
          {mobileView && (
            <List
              itemLayout="horizontal"
              loading={isLoading}
              grid={{
                xs: 1,
                sm: 1,
                md: 1,
                lg: 1,
              }}
              dataSource={relatedProductsfilter}
              locale={{
                emptyText: (
                  <div style={{ textAlign: 'center' }}>
                    <EmptyData />
                  </div>
                ),
              }}
              renderItem={(product) => {
                return (
                  <List.Item className="product-list-item mobile-view-related-products-list">
                    <Card className="mobile-view-product-table-card">
                      <Row>
                        <Col span={5}>
                          <div className="product-image">
                            <Link
                              to={`/products/product-details/${product.product_uid}`}
                            >
                              <img
                                className="img-cover"
                                width="100%"
                                src={imagePath(
                                  get(product, 'product_image', [])
                                )}
                                alt="img.jpg"
                                placeholder
                              />
                            </Link>
                          </div>
                        </Col>
                        <Col span={19}>
                          <Row>
                            <Col span={18}>
                              <Tooltip title={get(product, 'product_name', '')}>
                                <p className="product-ellipse product-name">
                                  {get(product, 'product_name', '')}
                                </p>
                              </Tooltip>
                            </Col>
                          </Row>
                          <Row className="mt-20">
                            <Col span={19}>
                              {!isNull(
                                get(product, 'zm_product.price', '')
                              ) && (
                                <Text className="typography-text related-prdt-price">
                                  <CurrencyFormatter
                                    value={get(product, 'zm_product.price', '')}
                                    language={currencyLocale}
                                    type={currency}
                                  />
                                </Text>
                              )}
                            </Col>
                            <Col span={5} className="text-align-end">
                              <div>
                                <Button
                                  type="text"
                                  className="delete-text"
                                  onClick={(event) =>
                                    onDeleteRelatedProducts(event, product)
                                  }
                                >
                                  Delete
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Card>
                  </List.Item>
                );
              }}
            />
          )}
        </>
      )}
      {mobileView && !isAddProducts && (
        <>
          {relatedProductsfilter.length > 0 ? (
            <div className="grid-view-pagination-long position-div">
              <Pagination {...pagination} onChange={handleTableChange} />
            </div>
          ) : undefined}
          <div className="mobile-view-product-btns">{addProductButton()}</div>
        </>
      )}
      {isAddProducts && <ProductMapping {...relatedProductsProperties} />}
    </Drawer>
  );
}
export default RelatedProducts;
