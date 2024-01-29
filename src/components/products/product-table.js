import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Table, Avatar, Tag, Switch, Tooltip, Popover, Rate } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { get, isEmpty, isNull } from 'lodash';
import ProductStoreDetails from './product-store-details';
import './product.less';
import {
  VIDEO_TYPES,
  CURRENCY_LANGUAGE,
  CURRENCY_TYPE,
} from '../../shared/constant-values';
import imagePath from '../../shared/image-helper';
import { getFilterData } from '../../shared/table-helper';
import RelatedProducts from './related-products';
import SocialShare from '../social-share';
import { TenantContext } from '../context/tenant-context';
import { eventTrack, productRatingCount } from '../../shared/function-helper';
import { ReactComponent as FacebookLogo } from '../../assets/icons/facebook-logo.svg';
import { ReactComponent as Instagram } from '../../assets/icons/instagram-icon.svg';
import { withRouter } from '../../utils/react-router/index';
import { ReactComponent as EditIcon } from '../../assets/images/edit-icon.svg';
import { ReactComponent as RelatedProductsIcon } from '../../assets/icons/related-products-icon.svg';
import { ReactComponent as DeleteIcon } from '../../assets/images/delete-icon.svg';
import { ReactComponent as ShareIcon } from '../../assets/images/share-icon.svg';
import ProductTableMobileView from './mobile-product-table-view';
import ShareOnSocialMedia from './share-on-social-media';

const adminEvent = (text) => {
  const parameter = {
    value: text,
  };
  eventTrack(`${text} Click`, parameter);
};

function ProductTable(properties) {
  const {
    data,
    handleDelete,
    rowSelection,
    pagination,
    handleViewChange,
    loading,
    canWrite,
    getTableData,
    productFilter,
    setProductFilter,
    onStatusChange,
    isTenantAdmin,
    setPreviousPath,
    fetchProductData,
    productCurrentValue,
    postOnFacebook,
    postOnInstagram,
    mobileView,
    emptyTableData,
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
  } = properties;
  const [tenantDetails] = useContext(TenantContext);
  const [tableData, setTableData] = useState(data);
  const [productData, setProductData] = useState([]);
  const [productId, setProductId] = useState('');
  const [productUid, setProductUid] = useState('');
  const [relatedPrdtData, setRelatedPrdtData] = useState({});
  const [productStatus, setProductStatus] = useState('');
  const [productName, setProductName] = useState('');
  const [productObject, setProductObject] = useState({});
  const [facebookPostData, setFacebookPostData] = useState({});
  const [mediaType, setMediaType] = useState('');

  useEffect(() => {
    setPreviousPath();
  }, []);

  useEffect(() => {
    if (data) {
      setTableData(data);
    }
  }, [data]);

  const handleTableChange = (paginationAlias, filters, sorters) => {
    const { current } = paginationAlias;
    handleViewChange(undefined, current);
    getTableData(sorters, current);
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

  const showSocialMediaModal = (postItem, type) => {
    setIsSocialMediaModel(true);
    setMediaType(type);
    setFacebookPostData(postItem);
    setSocialMediaCaptionValue(get(postItem, 'product_name', ''));
  };

  const columns = [
    {
      dataIndex: 'product_image',
      hidden: false,
      render: (text) =>
        imagePath(text)
          .split('.')
          .some((type) => VIDEO_TYPES.includes(type)) ? (
          <video kind="captions" className="video-src prdt-video">
            <track kind="captions" />
            <source kind="captions" src={imagePath(text)} type="video/mp4" />
          </video>
        ) : (
          text && <Avatar shape="square" size={30} src={imagePath(text)} />
        ),
    },
    {
      title: 'Product Name',
      hidden: false,
      dataIndex: 'product_name',
      key: 'product_name',
      width: '30%',
      render: (text, product) => (
        <div className="product-name-div">
          <div>
            <Link
              to={`/products/edit-product/${product.product_uid}`}
              className="product-link product-name"
            >
              {text}
            </Link>
          </div>
          <div className="varient-count">
            {get(product, 'variant_count', '') !== 0 &&
              `${get(product, 'variant_count', '')} variants`}
          </div>
        </div>
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
      dataIndex: 'price',
      align: 'center',
      render: (text, product) => (
        <div className="prdt-seller-price">
          {!isNull(get(product, 'price', '')) && (
            <CurrencyFormatter
              value={text}
              language={
                get(tenantDetails, 'setting.currency_locale', false) ||
                CURRENCY_LANGUAGE
              }
              type={
                get(tenantDetails, 'setting.currency', false) || CURRENCY_TYPE
              }
            />
          )}
        </div>
      ),
    },
    // {
    //   title: 'Offers',
    //   hidden: false,
    //   dataIndex: 'product_variants',
    //   render: (text) =>
    //     text.length ? (
    //       <Text className="discount-percent">
    //         {get(
    //           getAttributeByName(text[0], 'Discount in %'),
    //           '[0].attribute_value',
    //           'No offer'
    //         ) === 0 ? (
    //           <tag className="grey">
    //             {' '}
    //             <Space>
    //               <img src={NoOffer} alt="." />
    //               No Offers
    //             </Space>
    //           </tag>
    //         ) : (
    //           <div>
    //             <Space>
    //               <img src={Offer} alt="." />
    //               {get(
    //                 getAttributeByName(text[0], 'Discount in %'),
    //                 '[0].attribute_value',
    //                 'No offer'
    //               )}
    //             </Space>
    //             %
    //           </div>
    //         )}
    //       </Text>
    //     ) : null,
    // },
    {
      title: 'Inventory',
      hidden: false,
      align: 'center',
      render: (text, row) => (
        <Tag
          className="info-icon info-circle-icon mt-10p"
          onClick={() => handleStoreDetails(row)}
        >
          <InfoCircleOutlined />
        </Tag>
      ),
    },
    {
      title: 'Product Status',
      dataIndex: 'product_status',
      hidden: !isTenantAdmin,
      align: 'center',
      render: (text, row) => {
        return (
          <div onClick={() => adminEvent('Product Status')} aria-hidden="true">
            <Switch
              className="switch-container"
              checked={text}
              onClick={(value) => onStatusChange(value, row, 'product_status')}
            />
          </div>
        );
      },
    },
    {
      title: 'Average ratings',
      width: '15%',
      className: 'avg-ratings',
      align: 'center',
      render: (text, row) => {
        const averageRatings = productRatingCount(row);
        return (
          <Rate
            disabled
            allowHalf
            value={averageRatings}
            className="product-ratings"
          />
        );
      },
    },
    {
      title: 'Posts',
      key: 'action',
      hidden: false,
      align: 'center',
      render: (text) => (
        <span className="edit-box">
          <FacebookLogo
            className={
              isEmpty(get(text, 'product_image'))
                ? 'logo-inactive'
                : 'logo-active'
            }
            onClick={() => showSocialMediaModal(text, 'FB')}
          />

          <Instagram
            className={
              isEmpty(get(text, 'product_image'))
                ? 'logo-inactive'
                : 'logo-active'
            }
            onClick={() => showSocialMediaModal(text, 'IG')}
          />
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      hidden: false,
      align: 'center',
      render: (text) => (
        <span className="edit-box">
          <Link to={`/products/edit-product/${text.product_uid}`}>
            <Tooltip title="Edit">
              <EditIcon onClick={() => adminEvent('Product Edit')} />
            </Tooltip>
          </Link>
          <div className="product-svg-icon">
            <Tooltip title="Related Products">
              <RelatedProductsIcon onClick={() => onRelatedIconClick(text)} />
            </Tooltip>
          </div>
          <Popover
            overlayClassName="share-popover"
            trigger="click"
            content={
              <SocialShare
                url={`${get(tenantDetails, 'customer_url', '')}/${get(
                  text,
                  'product_name',
                  ''
                ).replaceAll(' ', '-')}/pd/${get(text, 'product_uid', '')}`}
                name={get(text, 'product_name', '')}
                image_url={get(text, 'product_image[0].product_image', '')}
                description={get(text, 'description', '')}
                adminEvent={adminEvent}
              />
            }
            placement="bottom"
          >
            <Tooltip title="Social Share">
              <Tag color="white" className="share-tag product-svg-icon">
                <ShareIcon />
              </Tag>
            </Tooltip>
          </Popover>
          <Tag
            color="white"
            className="share-tag"
            onClick={(event_) => handleDelete(event_, 'single', text)}
          >
            <Tooltip title="Delete">
              <DeleteIcon onClick={() => adminEvent('Product Delete')} />
            </Tooltip>
          </Tag>
        </span>
      ),
    },
  ].filter((item) => !get(item, 'hidden', false));

  const handleTableOnChange = (page) => {
    handleViewChange(undefined, page);
  };

  const listProperties = {
    data,
    handleDelete,
    loading,
    canWrite,
    onStatusChange,
    isTenantAdmin,
    postOnFacebook,
    postOnInstagram,
    productRatingCount,
    onRelatedIconClick,
    handleStoreDetails,
    handleTableOnChange,
    pagination,
    handleViewChange,
    showSocialMediaModal,
    mobileView,
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
    postOnInstagram,
    mediaType,
    mobileView,
    loading,
  };
  return (
    <>
      {!mobileView && (
        <Table
          className="grid-table product-grid-table product-table"
          rowKey={(record) => record.product_uid}
          columns={
            canWrite
              ? columns
              : columns.filter((response) => response.title !== 'Actions')
          }
          rowSelection={canWrite ? rowSelection : ''}
          dataSource={tableData}
          locale={{
            emptyText: emptyTableData(),
          }}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      )}
      {mobileView && <ProductTableMobileView {...listProperties} />}
      {isInventoryVisible && <ProductStoreDetails {...inventoryProperties} />}
      {isRelatedDrawer && (
        <div className={`${mobileView && 'mobile-view-drawer'}`}>
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
        </div>
      )}
      {isSocialMediaModel && <ShareOnSocialMedia {...socialShareProperties} />}
    </>
  );
}

export default withRouter(ProductTable);
