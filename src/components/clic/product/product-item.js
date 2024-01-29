import React, { useState, useContext } from 'react';
import { Card, List, Skeleton, Switch, Tooltip, Row, Col } from 'antd';
import { get, isEmpty } from 'lodash';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { Link } from 'react-router-dom';
import { UpCircleOutlined, DownCircleOutlined } from '@ant-design/icons';
import imagePath, { defaultImage } from '../../../shared/image-helper';
import { ReactComponent as EditIcon } from '../../../assets/icons/clic/noun-edit.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/clic/noun-delete.svg';
import InputField from './input-field-list';
import { TenantContext } from '../../context/tenant-context';

const ProductItem = ({
  product,
  onStatusChange,
  handleDelete,
  enquiryFeilds,
}) => {
  const [tenantDetails, ,] = useContext(TenantContext);
  const [isShowEnquiry, setIsShowEnquiry] = useState(false);

  return (
    <Card className="clic-product-list-card" bordered={false}>
      <Skeleton avatar title={false} loading={product?.loading} active>
        <List.Item.Meta
          avatar={
            <div className="product-image-container">
              <img
                role="presentation"
                className="product-image"
                src={
                  imagePath(get(product, 'product_image', [])) || defaultImage
                }
                alt={get(product, 'product_name', '')}
              />
            </div>
          }
          title={
            <div>
              <div className="flex-bwn">
                <div className="product-name">
                  <Tooltip
                    placement="topLeft"
                    title={
                      product?.product_name?.length > 24 &&
                      product?.product_name
                    }
                  >
                    {product?.product_name}
                  </Tooltip>
                </div>
              </div>
              <div className="flex-bwn" style={{ marginTop: '8px' }}>
                <div className="product-price">
                  <CurrencyFormatter
                    value={get(product, 'price', '')}
                    language={
                      get(tenantDetails, 'setting.currency_locale', false) ||
                      'en-US'
                    }
                    type={
                      get(tenantDetails, 'setting.currency', false) || 'USD'
                    }
                  />
                </div>
              </div>
            </div>
          }
          description={
            <Row style={{ marginTop: '16px' }} align="middle">
              <Col span={9}>
                <div className="flex">
                  <Switch
                    checked={get(product, 'product_status', false)}
                    onClick={(value) => onStatusChange(value, product)}
                  />
                  <div className="live-text">Live</div>
                </div>
              </Col>
              <Col span={4}>
                <div className="product-list-icon">
                  <Link to={`/products/edit-product/${product?.product_uid}`}>
                    <EditIcon />
                  </Link>
                </div>
              </Col>
              <Col span={3}>
                <div className="product-list-icon sync-product-modal">
                  <DeleteIcon onClick={() => handleDelete(product)} />
                </div>
              </Col>
              {!isEmpty(enquiryFeilds) && (
                <Col span={7}>
                  <div className="enquiry-toggle">
                    <span
                      role="button"
                      tabIndex="0"
                      onKeyPress={() => setIsShowEnquiry(!isShowEnquiry)}
                      onClick={() => setIsShowEnquiry(!isShowEnquiry)}
                    >
                      {isShowEnquiry ? (
                        <UpCircleOutlined />
                      ) : (
                        <DownCircleOutlined />
                      )}
                    </span>
                  </div>
                </Col>
              )}
            </Row>
          }
        />
      </Skeleton>
      {isShowEnquiry && (
        <div className="enquiry-section">
          <h4>Enquiry</h4>
          <div className="add-product-container add-product-wrapper">
            <InputField enquiryFeilds={enquiryFeilds} />
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProductItem;
