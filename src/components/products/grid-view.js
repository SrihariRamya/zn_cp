import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { get, isEmpty, isNull } from 'lodash';
import {
  Card,
  Tag,
  Switch,
  Row,
  Col,
  List,
  Pagination,
  Checkbox,
  Tooltip,
  Space,
  Popover,
  Rate,
} from 'antd';
import './product.less';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import imagePath from '../../shared/image-helper';
import { withRouter } from '../../utils/react-router/index';
import { eventTrack, productRatingCount } from '../../shared/function-helper';
import { TenantContext } from '../context/tenant-context';
import { ReactComponent as EditIcon } from '../../assets/images/edit-icon.svg';
import { ReactComponent as RelatedProductsIcon } from '../../assets/icons/related-products-icon.svg';
import { ReactComponent as DeleteIcon } from '../../assets/images/delete-icon.svg';
import { ReactComponent as ShareIcon } from '../../assets/images/share-icon.svg';
import SocialShare from '../social-share';
import RelatedProducts from './related-products';
import { ReactComponent as FacebookLogo } from '../../assets/icons/facebook-logo.svg';
import { ReactComponent as Instagram } from '../../assets/icons/instagram-icon.svg';
import { ReactComponent as MenuIcon } from '../../assets/icons/menu-icon.svg';
import { ReactComponent as InfoIcon } from '../../assets/icons/info-icon.svg';
import ProductStoreDetails from './product-store-details';
import ShareOnSocialMedia from './share-on-social-media';
import EmptyData from '../../shared/empty-data';
import { CURRENCY_LANGUAGE, CURRENCY_TYPE } from '../../shared/constant-values';

const CheckboxGroup = Checkbox.Group;

const adminEvent = (text) => {
  const parameter = {
    value: text,
  };
  eventTrack(`${text} Click`, parameter);
};

function GridView(properties) {
  const {
    data,
    handleDelete,
    pagination,
    handleViewChange,
    loading,

    canWrite,
    onStatusChange,
    isTenantAdmin,
    setPreviousPath,
    postOnFacebook,
    postOnInstagram,
    fetchProductData,
    productCurrentValue,
    setPlainOptions,
    mobileView,
    isTrackInventory,
    setIsTrackInventory,
    isSocialMediaModel,
    setIsSocialMediaModel,
    socialMediaCaptionValue,
    setSocialMediaCaptionValue,
    isInventoryloading,
    setIsInventoryloading,
    isRelatedDrawer,
    setIsRelatedDrawer,
    isInventoryVisible,
    setIsInventoryVisible,
    selectedID,
    checkMore,
    checkLess,
  } = properties;
  const [gridData, setGridData] = useState(data);
  const [tenantDetails] = useContext(TenantContext);
  const [productId, setProductId] = useState('');
  const [productUid, setProductUid] = useState('');
  const [relatedPrdtData, setRelatedPrdtData] = useState({});
  const [productStatus, setProductStatus] = useState('');
  const [productName, setProductName] = useState('');
  const [productData, setProductData] = useState([]);
  const [productObject, setProductObject] = useState({});
  const [facebookPostData, setFacebookPostData] = useState({});
  const [mediaType, setMediaType] = useState('');

  useEffect(() => {
    setPreviousPath();
  }, []);

  useEffect(() => {
    if (data) {
      setGridData(data);
      setPlainOptions(data);
    }
  }, [data, pagination]);

  const handleTableChange = (page) => {
    handleViewChange(undefined, page);
  };

  const onRelatedIconClick = (item) => {
    adminEvent('Related Products');
    setIsRelatedDrawer(true);
    setProductId(item.product_id);
    setProductStatus(item.product_status);
    setRelatedPrdtData({ ...item });
    setProductName(get(item, 'product_name', 'Product'));
    setProductUid(item.product_uid);
  };

  const closeRelatedDrawer = () => {
    setIsRelatedDrawer(false);
    fetchProductData({
      pagination: { pageSize: 10, current: productCurrentValue },
    });
  };

  const handleStoreDetails = (item) => {
    adminEvent('Info Inventory');
    setProductData(item);
    setIsInventoryVisible(true);
    setIsTrackInventory(get(item, 'track_inventory', false));
    setProductObject(item);
  };

  const onClose = () => {
    setIsInventoryVisible(false);
  };

  const showSocialMediaModal = (postItem, type) => {
    setIsSocialMediaModel(true);
    setMediaType(type);
    setFacebookPostData(postItem);
    setSocialMediaCaptionValue(get(postItem, 'product_name', ''));
  };

  const inventoryProperties = {
    productData,
    isInventoryVisible,
    onClose,
    onStatusChange,
    isTrackInventory,
    product: productObject,
    mobileView,
    isInventoryloading,
    setIsInventoryloading,
  };

  const socialShareProperties = {
    isSocialMediaModel,
    facebookPostData,
    setIsSocialMediaModel,
    socialMediaCaptionValue,
    setSocialMediaCaptionValue,
    postOnFacebook,
    mobileView,
    postOnInstagram,
    mediaType,
    loading,
  };

  const productActions = (product) => {
    return (
      <div className="div-grid-view-icons">
        <Checkbox
          className={`checkbox check-box-align product-checkbox ${
            !canWrite && 'display-none'
          }`}
          value={product?.product_uid}
          onChange={(event) => {
            if (event.target.checked) {
              checkMore([product?.product_uid]);
            } else {
              checkLess([product?.product_uid]);
            }
          }}
        />
        <Space className="product-actions-icons">
          {isTenantAdmin && (
            <div className="l-3p mb-5p share-icon-svg">
              <Tooltip title="Status">
                <Switch
                  className="switch-container"
                  checked={get(product, 'product_status', '')}
                  onClick={(value) =>
                    onStatusChange(value, product, 'product_status')
                  }
                />
              </Tooltip>
            </div>
          )}
          <Link to={`/products/edit-product/${product.product_uid}`}>
            <Tooltip title="Edit">
              <EditIcon />
            </Tooltip>
          </Link>
          <Tooltip title="Related Products">
            <RelatedProductsIcon
              onClick={() => onRelatedIconClick(product)}
              className="mr-10"
            />
          </Tooltip>
          <Popover
            overlayClassName="share-popover"
            trigger="click"
            content={
              <SocialShare
                url={`${get(tenantDetails, 'customer_url', '')}/${get(
                  product,
                  'product_name',
                  ''
                ).replaceAll(' ', '-')}/pd/${get(product, 'product_uid', '')}`}
                name={get(product, 'product_name', '')}
                image_url={get(product, 'product_image[0].product_image', '')}
                description={get(product, 'description', '')}
                adminEvent={adminEvent}
              />
            }
            placement="bottom"
          >
            <Tooltip title="Social Share">
              <ShareIcon />
            </Tooltip>
          </Popover>
          <Tooltip title="Delete">
            <DeleteIcon
              twoToneColor="#d9363e"
              onClick={(event_) => handleDelete(event_, 'single', product)}
            />
          </Tooltip>
        </Space>
      </div>
    );
  };

  const socialShareButtons = (product) => {
    return (
      <>
        <FacebookLogo
          className={
            isEmpty(get(product, 'product_image'))
              ? 'logo-inactive'
              : 'logo-active'
          }
          onClick={() => showSocialMediaModal(product, 'FB')}
        />
        <Instagram
          className={
            isEmpty(get(product, 'product_image'))
              ? 'logo-inactive'
              : 'logo-active'
          }
          onClick={() => showSocialMediaModal(product, 'IG')}
        />
      </>
    );
  };

  const ratingRender = (averageRatings) => {
    return (
      <Rate
        disabled
        allowHalf
        value={averageRatings}
        className="product-ratings"
      />
    );
  };

  const menuContent = (product) => {
    return (
      <div>
        <div>
          <Tag
            color="white"
            className="share-tag grid-share-icon r-1p"
            onClick={() => onRelatedIconClick(product)}
          >
            <RelatedProductsIcon />
            <span className="menu-items-align">Related Products</span>
          </Tag>
        </div>
        <div className="icon-align-div">
          <Tag color="white" onClick={() => handleStoreDetails(product)}>
            <InfoIcon className="info-svg-icon" />
            <span className="track-inventory">Track Inventory</span>
          </Tag>
        </div>
        <div className="icon-align-div">
          <Popover
            overlayClassName={`${
              mobileView && 'social-share-title'
            } share-popover `}
            title={mobileView && 'Social Share'}
            trigger="click"
            content={
              <SocialShare
                url={`${get(tenantDetails, 'customer_url', '')}/${get(
                  product,
                  'product_name',
                  ''
                ).replaceAll(' ', '-')}/pd/${get(product, 'product_uid', '')}`}
                name={get(product, 'product_name', '')}
                image_url={get(product, 'product_image[0].product_image', '')}
                description={get(product, 'description', '')}
              />
            }
            placement="bottom"
          >
            <Tag color="white" className="share-tag grid-share-icon l-2p">
              <ShareIcon />
              <span className="menu-items-align fs-12p">Social Share</span>
            </Tag>
          </Popover>
        </div>

        <div>
          <Tag
            className="share-tag grid-share-icon"
            onClick={(event_) => handleDelete(event_, 'single', product)}
          >
            <DeleteIcon twoToneColor="#d9363e" />
            <span className="menu-items-align b-12p l-0p">Delete</span>
          </Tag>
        </div>
      </div>
    );
  };

  return (
    <div className={mobileView && 'grid-view-row'}>
      <CheckboxGroup value={selectedID}>
        <List
          loading={loading}
          itemLayout="horizontal"
          grid={{
            gutter: 16,
            xs: 2,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 5,
            xxl: 5,
          }}
          locale={{
            emptyText: (
              <div style={{ textAlign: 'center' }}>
                <EmptyData />
              </div>
            ),
          }}
          dataSource={gridData}
          renderItem={(product) => {
            const averageRatings = productRatingCount(product);
            const variantCount = get(product, 'variant_count', '');
            return (
              <List.Item className={mobileView && 'product-list-item'}>
                {!mobileView && (
                  <Card className="product-grid-view-card common-list-view-card">
                    {productActions(product)}
                    <div className="product-picture">
                      <Link
                        to={`/products/edit-product/${product.product_uid}`}
                      >
                        <img
                          className="img-cover"
                          width="100%"
                          height="100%"
                          src={imagePath(get(product, 'product_image', []))}
                          alt="img.jpg"
                          placeholder
                        />
                      </Link>
                    </div>
                    <div className="display-flex">
                      <Tooltip title="Inventory">
                        <Tag
                          color="white"
                          onClick={() => handleStoreDetails(product)}
                        >
                          <InfoIcon className="info-svg-icon ml-6" />
                        </Tag>
                      </Tooltip>
                      <span className="share-icon-svg mr-10 b-3p">
                        {ratingRender(averageRatings)}
                      </span>
                    </div>
                    <div className="row-content">
                      <Tooltip title={get(product, 'product_name', '')}>
                        <p className="product-ellipse product-name">
                          {get(product, 'product_name', '')}
                        </p>
                      </Tooltip>
                      <div className="varient-count">
                        {variantCount !== 0 && `${variantCount} variants`}
                      </div>
                      <Row className="row-data" justify="space-around">
                        <Col span={isTenantAdmin ? 16 : 24}>
                          <Row>
                            <Col span={10}>
                              {!isNull(get(product, 'price', '')) && (
                                <span className="product-price">
                                  <Tooltip title={get(product, 'price', '')}>
                                    <CurrencyFormatter
                                      value={get(product, 'price', '')}
                                      language={
                                        get(
                                          tenantDetails,
                                          'setting.currency_locale',
                                          false
                                        ) || CURRENCY_LANGUAGE
                                      }
                                      type={
                                        get(
                                          tenantDetails,
                                          'setting.currency',
                                          false
                                        ) || CURRENCY_TYPE
                                      }
                                    />
                                  </Tooltip>
                                </span>
                              )}
                            </Col>
                          </Row>
                        </Col>
                        <Col span={8} className="left-20p b-3p">
                          {socialShareButtons(product)}
                        </Col>
                      </Row>
                    </div>
                  </Card>
                )}
                {mobileView && (
                  <Card className="mobile-list-view-card common-list-view-card">
                    {!mobileView && productActions(product)}
                    <div className="product-picture">
                      <Link
                        to={`/products/edit-product/${product.product_uid}`}
                      >
                        <img
                          className="img-cover"
                          width="100%"
                          height="100%"
                          src={imagePath(get(product, 'product_image', []))}
                          alt="img.jpg"
                          placeholder
                        />
                      </Link>
                    </div>
                    <div className="row-content">
                      <Row>
                        <Col span={23}>
                          <Tooltip title={get(product, 'product_name', '')}>
                            <p className="product-ellipse product-name">
                              {get(product, 'product_name', '')}
                            </p>
                          </Tooltip>
                          <div className="varient-count variant-align">
                            {variantCount !== 0 && `${variantCount} variants`}
                          </div>
                        </Col>
                        <Col span={1} className="b-8p">
                          <Popover
                            arrow={false}
                            style={{
                              border: '1px solid #CCC !important',
                            }}
                            overlayClassName="popover-menu popover-menu-item"
                            content={menuContent(product)}
                            placement="leftTop"
                            trigger="click"
                          >
                            <MenuIcon />
                          </Popover>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={10}>
                          {!isNull(get(product, 'price', '')) && (
                            <span className="seller-price-text ">
                              <Tooltip title={get(product, 'price', '')}>
                                <p>
                                  <CurrencyFormatter
                                    value={get(product, 'price', '')}
                                    language={
                                      get(
                                        tenantDetails,
                                        'setting.currency_locale',
                                        false
                                      ) || 'en-US'
                                    }
                                    type={
                                      get(
                                        tenantDetails,
                                        'setting.currency',
                                        false
                                      ) || 'USD'
                                    }
                                  />
                                </p>
                              </Tooltip>
                            </span>
                          )}
                        </Col>
                      </Row>
                      <div className="varient-count">
                        <span>{ratingRender(averageRatings)}</span>
                      </div>
                      <Row className="row-data" justify="space-around">
                        <Col span={16} className="r-3p">
                          {socialShareButtons(product)}
                        </Col>
                        {isTenantAdmin && (
                          <Col span={8} className="l-4p b-20p">
                            <div className="product-mobile-switch-container flex-end-div">
                              <h6 className="product-status product-text">
                                Status
                              </h6>
                              <Switch
                                className="switch-container"
                                checked={get(product, 'product_status', '')}
                                onClick={(value) =>
                                  onStatusChange(
                                    value,
                                    product,
                                    'product_status'
                                  )
                                }
                              />
                            </div>
                          </Col>
                        )}
                      </Row>
                    </div>
                  </Card>
                )}
              </List.Item>
            );
          }}
        />
      </CheckboxGroup>
      {gridData.length > 0 ? (
        <div className="grid-view-pagination-long">
          <Pagination {...pagination} onChange={handleTableChange} />
        </div>
      ) : undefined}
      {isInventoryVisible && <ProductStoreDetails {...inventoryProperties} />}
      {isRelatedDrawer && (
        <RelatedProducts
          isRelatedDrawer={isRelatedDrawer}
          productStatus={productStatus}
          relatedPrdtData={relatedPrdtData}
          closeRelatedDrawer={closeRelatedDrawer}
          productId={productId}
          productUid={productUid}
          productName={productName}
          fetchProductData={fetchProductData}
          mobileView={mobileView}
        />
      )}
      {isSocialMediaModel && <ShareOnSocialMedia {...socialShareProperties} />}
    </div>
  );
}

export default withRouter(GridView);
