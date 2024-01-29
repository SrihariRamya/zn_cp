import React from 'react';

function ElementPlacingIndicator(properties) {
  const { id, type, position } = properties;
  return (
    <div
      id={`${id}_${position}`}
      className={`position ${position}`}
      data-component-type={type}
    />
  );
}
export default ElementPlacingIndicator;
