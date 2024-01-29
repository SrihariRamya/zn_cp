import { Select } from 'antd';
import React, { useState, useEffect } from 'react';

const LabelFontWeight = ({
  activeElement,
  setChangeType,
  setValue,
}: LabelFontWeightProps) => {
  const {
    fontWeight = '',
  } = activeElement.element.column_properties.label.labelStyle;
  const [weight, setWeight] = useState(fontWeight);
  const handleLabelFontWeight = (value) => {
    setWeight(value);
  };

  useEffect(() => {
    setChangeType('fontWeight');
    setValue(weight);
  }, [weight]);
  return (
    <div>
      <Select
        style={{ width: '100%' }}
        virtual={false}
        value={fontWeight}
        onChange={handleLabelFontWeight}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        options={[
          {
            value: '300',
            label: '300',
          },
          {
            value: '400',
            label: '400',
          },
          {
            value: '500',
            label: '500',
          },
          {
            value: '600',
            label: '600',
          },
          {
            value: '700',
            label: '700',
          },
          {
            value: '800',
            label: '800',
          },
          {
            value: '900',
            label: '900',
          },
        ]}
      />
    </div>
  );
};

export default LabelFontWeight;
