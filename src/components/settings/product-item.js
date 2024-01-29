import React, { useState, useContext } from 'react';
import { Col, Card, Tooltip, Checkbox, Row } from 'antd';
import { get, findIndex } from 'lodash';
import { DeleteTwoTone } from '@ant-design/icons';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import imagePath from '../../shared/image-helper';
import { TenantContext } from '../context/tenant-context';

const ProductItem = ({
  data,
  handleDeleteProps,
  product,
  fromSections,
  noDeleteProps,
  spanCount,
  textStyle,
  buttonStyle,
  buttonHoverStyle,
}) => {
  const [tenantDetails] = useContext(TenantContext);
  const { currency } = get(tenantDetails, 'setting', {});
  const getAttributeByName = (value, attribute, checkid) => {
    if (
      value && attribute && attribute === 'Units' ? value.id === checkid : true
    ) {
      return (
        value &&
        value.variant_attributes.filter(
          (item) => item?.zm_attribute?.name === attribute
        )
      );
    }
    return '';
  };
  const [hover, setHover] = useState(false);
  const calculatedStyle = {
    ...buttonStyle,
    ...(hover ? buttonHoverStyle : {}),
  };
  return (
    <Col
      style={{ minWidth: 280 }}
      key={get(data, 'product_uid', '')}
      span={spanCount}
    >
      <Card className="sell-container">
        <div className="sell-img-container">
          <img
            draggable={false}
            className="sell-img"
            alt={get(data, 'product_name', '')}
            src={imagePath(get(data, 'product_image', []))}
          />
        </div>
        {fromSections && (
          <div className="sliderbox-product-checkbox">
            <Checkbox className="checkbox" value={product} />
          </div>
        )}
        {!noDeleteProps && (
          <div className="best-offer-detail">
            <DeleteTwoTone
              twoToneColor="#d9363e"
              onClick={() =>
                handleDeleteProps(fromSections ? [product] : product)
              }
            />
          </div>
        )}
        <div className="sell-details-contaniner">
          <div className="offer-name" style={textStyle}>
            <span>
              <Tooltip
                placement="topLeft"
                title={
                  get(data, 'product_name', '') > 24 &&
                  get(data, 'product_name', '')
                }
              >
                {get(data, 'product_name', '')}
              </Tooltip>
            </span>
          </div>
          <div className="offer-gm">
            {get(data, 'product_variants', []).map((value) => (
              <span className="text-grey-light" key={get(value, 'id')}>
                {get(
                  getAttributeByName(
                    get(
                      get(data, 'product_variants', ''),
                      `[${findIndex(get(data, 'product_variants', ''))}]`,
                      ''
                    ),
                    'Selling Price'
                  ),
                  '[0].attribute_value',
                  ''
                )}
              </span>
            ))}
          </div>
          <Row>
            <Col span={12} className="discount-column">
              <Row>
                <span
                  className="discount-amount"
                  style={{
                    color: get(buttonStyle, 'backgroundColor', ''),
                  }}
                >
                  <CurrencyFormatter
                    value={get(
                      getAttributeByName(
                        get(
                          get(data, 'product_variants', ''),
                          `[${findIndex(get(data, 'product_variants', ''))}]`,
                          ''
                        ),
                        'Selling Price'
                      ),
                      '[0].attribute_value',
                      ''
                    )}
                    type={currency}
                  />
                </span>
              </Row>
              <Row>
                <span className="discount-cut">
                  <CurrencyFormatter
                    value={get(
                      getAttributeByName(
                        get(
                          get(data, 'product_variants', ''),
                          `[${findIndex(get(data, 'product_variants', ''))}]`,
                          ''
                        ),
                        'MRP Price'
                      ),
                      '[0].attribute_value',
                      ''
                    )}
                    type={currency}
                  />
                </span>
              </Row>
            </Col>
            <Col span={12}>
              <button
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                type="button"
                className="offer-button"
                style={calculatedStyle}
              >
                Add to cart
              </button>
            </Col>
          </Row>
        </div>
      </Card>
    </Col>
  );
};
export default ProductItem;
