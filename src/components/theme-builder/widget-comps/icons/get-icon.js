import React from 'react';

const Icon = ({ type, ...rest }) => {
  // eslint-disable-next-line global-require
  const icons = require('@ant-design/icons');
  const Component = icons[type];
  return <Component {...rest} />;
};

export default Icon;
