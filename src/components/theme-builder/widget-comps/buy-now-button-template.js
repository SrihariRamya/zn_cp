import { Button } from 'antd';
import React, { useState } from 'react';
import Icon from '../icons/get-icon';

const BuyNowActionButton = ({
  buttonStyle,
  buttonHoverStyle,
  product,
  addToCart,
  buttonText,
  icon,
}) => {
  const [addButtonhover, setAddButtonHover] = useState(false);

  const addButtonStyles = {
    ...buttonStyle,
    ...(addButtonhover ? buttonHoverStyle : {}),
  };
  const disabled = product.track_inventory ? Number(product.stock) <= 0 : false;
  return (
    <div>
      <Button
        disabled={disabled}
        onMouseEnter={() => setAddButtonHover(true)}
        onMouseLeave={() => setAddButtonHover(false)}
        style={
          disabled ? { backgroundColor: 'rgba(0,0,0,.25)' } : addButtonStyles
        }
        onClick={(event) => addToCart(product, event, false)}
        icon={icon ? <Icon type={icon} /> : undefined}
        type={icon ? 'text' : 'default'}
        className="page-creator-button"
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default BuyNowActionButton;
