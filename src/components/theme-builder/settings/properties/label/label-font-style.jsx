import { Select } from 'antd';
import React, { useState, useEffect } from 'react';

const LabelFonstStyle = ({ activeElement, setChangeType, setValue }) => {
  const {
    fontStyle = '',
  } = activeElement.element.column_properties.label.labelStyle;
  const [style, setStyle] = useState(fontStyle);
  const handleLabelFontStyle = (value) => {
    setStyle(value);
  };

  useEffect(() => {
    setChangeType('fontStyle');
    setValue(style);
  }, [style]);

  return (
    <div>
      <Select
        style={{ width: '100%' }}
        virtual={false}
        value={style}
        onChange={handleLabelFontStyle}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        options={[
          {
            value: 'normal',
            label: 'Normal',
          },
          {
            value: 'italic',
            label: 'Italic',
          },
        ]}
      />
    </div>
  );
};

export default LabelFonstStyle;
