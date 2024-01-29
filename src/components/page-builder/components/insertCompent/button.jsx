import React from 'react';
import { Button } from 'antd';
import { get } from 'lodash';

function ButtonComponent(properties) {
  const { comp } = properties;
  const buttonObject = get(comp, 'componentProperties.value[0]', '');
  const { btnText, btnLink } = buttonObject;
  const onButtonLinkClick = () => {
    if (btnLink) {
      window.open(btnLink, '_blank');
    }
  };
  return (
    <div style={{ textAlign: 'center' }}>
      <Button onClick={() => onButtonLinkClick()}>{btnText}</Button>
    </div>
  );
}

export default ButtonComponent;
