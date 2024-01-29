import {
  PlusOutlined,
  MinusOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Button, Col, Row } from 'antd';
import { get } from 'lodash';
import React, { useState } from 'react';
import {
  APPEARANCE_TEMPLATE_NAME_1,
  PRODUCT_TEMPLATE_VARIANT_BUTTON,
} from '../../../../../shared/constant-values';

const AddCartActionButton = ({
  template,
  buttonStyle,
  buttonHoverStyle,
  count = 1,
  buttonText,
}) => {
  const [addButtonhover, setAddButtonHover] = useState(false);

  const buttonStyles = {
    color: get(buttonStyle, 'backgroundColor', ''),
  };
  const addButtonStyles = {
    ...buttonStyle,
    ...(addButtonhover ? buttonHoverStyle : {}),
  };
  const styles = {
    color: get(buttonStyle, 'backgroundColor', ''),
    boxShadow: `0 0 0 1px ${get(buttonStyle, 'backgroundColor', '')}`,
  };
  return (
    <div>
      {get(template, 'template_name', '') === APPEARANCE_TEMPLATE_NAME_1 ? (
        <div>
          {count > 1 ? (
            <div className="product-add" style={buttonStyles}>
              <div className="add-icon">
                <Button style={buttonStyles} icon={<MinusOutlined />} />
                <span style={buttonStyles}>{count}</span>
                <Button style={buttonStyles} icon={<PlusOutlined />} />
              </div>
            </div>
          ) : (
            <Button
              onMouseEnter={() => setAddButtonHover(true)}
              onMouseLeave={() => setAddButtonHover(false)}
              style={addButtonStyles}
            >
              {buttonText}
            </Button>
          )}
        </div>
      ) : (
        <Row>
          <Col span={8}>
            {get(template, 'template_variant_type', '') ===
            PRODUCT_TEMPLATE_VARIANT_BUTTON ? (
              <div className="product-add" style={buttonStyles}>
                <div className="add-icon">
                  <Button style={buttonStyles} icon={<MinusOutlined />} />
                  <span style={buttonStyles}>{count}</span>
                  <Button style={buttonStyles} icon={<PlusOutlined />} />
                </div>
              </div>
            ) : (
              <div className="quantity">
                <input readOnly style={styles} value={1} />
                <div className="quantity-nav">
                  <button
                    disabled
                    style={styles}
                    type="button"
                    className="quantity-button quantity-up"
                  >
                    +
                  </button>
                  <button
                    disabled
                    style={styles}
                    type="button"
                    className="quantity-button quantity-down"
                  >
                    -
                  </button>
                </div>
              </div>
            )}
          </Col>
          <Col span={16}>
            <div className="add-button">
              <Button
                onMouseEnter={() => setAddButtonHover(true)}
                onMouseLeave={() => setAddButtonHover(false)}
                style={addButtonStyles}
              >
                <span>Add to&nbsp;</span>
                cart
                <ShoppingCartOutlined />
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default AddCartActionButton;
