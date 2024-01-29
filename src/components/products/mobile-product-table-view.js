import React, { useContext } from 'react';
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
  Tooltip,
  Popover,
  Rate,
} from 'antd';
import './product.less';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import imagePath from '../../shared/image-helper';
import { withRouter } from '../../utils/react-router/index';
import { TenantContext } from '../context/tenant-context';
import { ReactComponent as RelatedProductsIcon } from '../../assets/icons/related-products-icon.svg';
import { ReactComponent as DeleteIcon } from '../../assets/images/delete-icon.svg';
import { ReactComponent as ShareIcon } from '../../assets/images/share-icon.svg';
import SocialShare from '../social-share';
import { ReactComponent as FacebookLogo } from '../../assets/icons/facebook-logo.svg';
import { ReactComponent as Instagram } from '../../assets/icons/instagram-icon.svg';
import { ReactComponent as MenuIcon } from '../../assets/icons/menu-icon.svg';
import { ReactComponent as InfoIcon } from '../../assets/icons/info-icon.svg';

function ProductTableMobileView(properties) {
  const [tenantDetails] = useContext(TenantContext);
  const {
    data,
    handleDelete,
    loading,
    onStatusChange,
    showSocialMediaModal,
    productRatingCount,
    onRelatedIconClick,
    handleStoreDetails,
    handleTableOnChange,
    pagination,
    mobileView,
  } = properties;

  const menuContent = (product) => {
    return (
      <>
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

        <div>
          <Popover
            overlayClassName={`${
              mobileView && 'social-share-title'
            } share-popover `}
            trigger="click"
            title={mobileView && 'Social Share'}
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
            <Tag color="white" className="share-tag grid-share-icon l-0p">
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
            <DeleteIcon
              twoToneColor="#d9363e"
              onClick={(event_) => handleDelete(event_, 'single', product)}
            />
            <span className="menu-items-align b-12p l-0p">Delete</span>
          </Tag>
        </div>
      </>
    );
  };

  return (
    <>
      <List
        loading={loading}
        itemLayout="horizontal"
        grid={{
          xs: 1,
          sm: 1,
          md: 1,
          lg: 1,
        }}
        dataSource={data}
        renderItem={(product) => {
          const averageRatings = productRatingCount(product);
          const variantCount = get(product, 'variant_count', '');
          return (
            <List.Item className="product-list-item">
              <Card className="mobile-view-product-table-card">
                <Row>
                  <Col span={7}>
                    <div className="product-image">
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
                  </Col>
                  <Col span={16} className="prdt-details-col">
                    <Tooltip title={get(product, 'product_name', '')}>
                      <p className="product-ellipse product-name">
                        {get(product, 'product_name', '')}
                      </p>
                    </Tooltip>
                    <Row>
                      <Col span={24} className="varient-count">
                        {variantCount !== 0 && `${variantCount} variants`}
                      </Col>
                      <Col span={24} className="mt-6p">
                        {!isNull(get(product, 'price', '')) && (
                          <span className="seller-price-text">
                            <Tooltip title={get(product, 'price', '')}>
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
                            </Tooltip>
                          </span>
                        )}
                      </Col>
                      <Col span={24}>
                        <Rate
                          disabled
                          allowHalf
                          value={averageRatings}
                          className="product-ratings"
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col span={1} className="menu-icon">
                    <Popover
                      arrow={false}
                      overlayClassName="popover-menu popover-menu-item"
                      content={menuContent(product)}
                      placement="leftTop"
                      trigger="click"
                    >
                      <MenuIcon />
                    </Popover>
                  </Col>
                </Row>
                <Row className="mt-6p">
                  <Col span={6}>
                    <div className="product-grid-switch-container status-col">
                      <h6 className="product-status product-text">Status</h6>
                      <Switch
                        className="switch-container"
                        checked={get(product, 'product_status', '')}
                        onClick={(value) =>
                          onStatusChange(value, product, 'product_status')
                        }
                      />
                    </div>
                  </Col>
                  <Col span={12} className="mt-2p track-inventory-col">
                    <Tag
                      color="white"
                      onClick={() => handleStoreDetails(product)}
                    >
                      <InfoIcon />
                      <span className="product-text track-inventory">
                        Track Inventory
                      </span>
                    </Tag>
                  </Col>
                  <Col span={6} className="social-btns-align">
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
                  </Col>
                </Row>
              </Card>
            </List.Item>
          );
        }}
      />
      {data && (
        <div className="grid-view-pagination-long">
          <Pagination {...pagination} onChange={handleTableOnChange} />
        </div>
      )}
    </>
  );
}

export default withRouter(ProductTableMobileView);
