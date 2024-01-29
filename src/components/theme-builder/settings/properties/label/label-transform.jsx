import { Select } from 'antd';
import React, { useState, useEffect } from 'react';

const LabelFonstTransform = ({ activeElement, setChangeType, setValue }) => {
  const {
    textTransform = '',
  } = activeElement.element.column_properties.label.labelStyle;
  const [style, setStyle] = useState(textTransform);
  const handleChange = (value) => {
    setStyle(value);
  };

  useEffect(() => {
    setChangeType('textTransform');
    setValue(style);
  }, [style]);

  return (
    <div>
      <Select
        style={{ width: '100%' }}
        virtual={false}
        value={style}
        onChange={handleChange}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        options={[
          {
            value: 'capitalize',
            label: 'Capitalize',
          },
          {
            value: 'uppercase',
            label: 'Uppercase',
          },
          {
            value: 'lowercase',
            label: 'Lowercase',
          },
        ]}
      />
    </div>
  );
};

export default LabelFonstTransform;
