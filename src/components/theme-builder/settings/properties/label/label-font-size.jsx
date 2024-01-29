import { InputNumber } from 'antd';
import React, { useState, useEffect } from 'react';

const LabelFontSize = ({ activeElement, setChangeType, setValue }) => {
  const {
    fontSize = '',
  } = activeElement.element.column_properties.label.labelStyle;
  const [size, setSize] = useState(fontSize);
  const handleLabelFontSize = (e) => {
    setSize(e);
  };

  useEffect(() => {
    setChangeType('fontSize');
    setValue(size);
  }, [size]);

  return (
    <div>
      <InputNumber value={size} min={1} onChange={handleLabelFontSize} />
    </div>
  );
};

export default LabelFontSize;
