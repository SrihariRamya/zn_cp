import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { Button, Col, Row } from 'antd';
import { get } from 'lodash';
import React, { useState } from 'react';
import Icon from '../icons/get-icon';

const APPEARANCE_TEMPLATE_NAME_1 = 'ONE';
const PRODUCT_TEMPLATE_VARIANT_BUTTON = 'BUTTON';

const AddCartActionButton = ({
  template,
  buttonStyle,
  buttonHoverStyle,
  count,
  product,
  removeFromCart,
  addToCart,
  buttonText,
  icon,
}) => {
  const [addButtonhover, setAddButtonHover] = useState(false);
  const buttonStyles = {
    color: get(buttonStyle, 'backgroundColor', ''),
    borderRadius: get(buttonStyle, 'borderRadius'),
    fontFamily: get(buttonStyle, 'fontFamily', ''),
    borderColor: get(buttonStyle, 'borderColor'),
    borderWidth: get(buttonStyle, 'borderWidth'),
  };
  const addButtonStyles = {
    ...buttonStyle,
    ...(addButtonhover ? buttonHoverStyle : {}),
  };
  const styles = {
    color: get(buttonStyle, 'backgroundColor', ''),
    boxShadow: `0 0 0 1px ${get(buttonStyle, 'backgroundColor', '')}`,
  };
  const disabled = product.track_inventory ? Number(product.stock) <= 0 : false;
  return (
    <div>
      {get(template, 'template_name', '') === APPEARANCE_TEMPLATE_NAME_1 ? (
        <div>
          {count >= 1 ? (
            <div className="template-product-add" style={buttonStyles}>
              <div className="product-add-icon">
                <Button
                  style={buttonStyles}
                  onClick={(event) => removeFromCart(product, event)}
                  disabled={disabled}
                  icon={<MinusOutlined />}
                />
                <span style={buttonStyles}>{count}</span>
                <Button
                  style={buttonStyles}
                  disabled={disabled}
                  onClick={(event) => addToCart(product, event, false)}
                  icon={<PlusOutlined />}
                />
              </div>
            </div>
          ) : (
            <Button
              disabled={disabled}
              onMouseEnter={() => setAddButtonHover(true)}
              onMouseLeave={() => setAddButtonHover(false)}
              style={
                disabled
                  ? { backgroundColor: 'rgba(0,0,0,.25)' }
                  : addButtonStyles
              }
              onClick={(event) => addToCart(product, event, false)}
              icon={icon ? <Icon type={icon} /> : undefined}
              type={icon ? 'text' : 'default'}
              className="page-creator-button"
            >
              {buttonText}
            </Button>
          )}
        </div>
      ) : (
        <Row>
          <Col xl={8} lg={8} md={24} sm={24} xs={24}>
            {get(template, 'template_variant_type', '') ===
            PRODUCT_TEMPLATE_VARIANT_BUTTON ? (
              <div className="template-product-add" style={buttonStyles}>
                <div className="product-add-icon">
                  <Button
                    style={buttonStyles}
                    disabled={disabled || count === 1}
                    onClick={(event) => removeFromCart(product, event)}
                    icon={<MinusOutlined />}
                  />
                  <span style={buttonStyles}>{count}</span>
                  <Button
                    style={buttonStyles}
                    disabled={disabled}
                    onClick={(event) => addToCart(product, event)}
                    icon={<PlusOutlined />}
                  />
                </div>
              </div>
            ) : (
              <div className="quantity">
                <input readOnly style={styles} value={count} />
                <div className="quantity-nav">
                  <button
                    type="button"
                    className="quantity-button quantity-up"
                    style={styles}
                    disabled={disabled}
                    onClick={(event) => addToCart(product, event)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="quantity-button quantity-down"
                    style={styles}
                    disabled={disabled || count === 1}
                    onClick={(event) => removeFromCart(product, event)}
                  >
                    -
                  </button>
                </div>
              </div>
            )}
          </Col>
          <Col xl={16} lg={16} md={24} sm={24} xs={24}>
            <div className="product-add-button">
              <Button
                onMouseEnter={() => setAddButtonHover(true)}
                onMouseLeave={() => setAddButtonHover(false)}
                style={
                  disabled
                    ? { backgroundColor: 'rgba(0,0,0,.25)' }
                    : addButtonStyles
                }
                disabled={disabled}
                onClick={(event) => addToCart(product, event, true, true)}
              >
                {buttonText}
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default AddCartActionButton;
