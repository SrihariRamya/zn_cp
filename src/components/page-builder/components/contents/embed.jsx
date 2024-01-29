import React from 'react';

function EmbedComponent(properties) {
  const { comp } = properties;
  const { componentUid, componentProperties, componentType } = comp;

  return (
    <div
      id={componentUid}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html:
          componentProperties.value ||
          `<span>${
            componentType === 'text' ? 'Click to edit text' : ''
          }</span>`,
      }}
    />
  );
}
export default EmbedComponent;
