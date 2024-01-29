import { Select } from 'antd';
import React, { useState, useEffect } from 'react';

const LabelAlign = ({ activeElement, setChangeType, setValue }) => {
  const {
    textAlign = '',
  } = activeElement.element.column_properties.label.labelStyle;
  const [align, setAlign] = useState(textAlign);

  const handleLabelAlign = (value) => {
    setAlign(value);
  };

  useEffect(() => {
    setChangeType('textAlign');
    setValue(align);
  }, [align]);

  return (
    <div>
      <Select
        style={{ width: '100%' }}
        value={textAlign}
        virtual={false}
        onChange={handleLabelAlign}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        options={[
          {
            value: 'left',
            label: 'Left',
          },
          {
            value: 'right',
            label: 'Right',
          },
          {
            value: 'center',
            label: 'Center',
          },
          {
            value: 'justify',
            label: 'Justify',
          },
        ]}
      />
    </div>
  );
};

export default LabelAlign;
