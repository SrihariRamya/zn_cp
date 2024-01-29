/* eslint-disable camelcase */
import { Input } from 'antd';
import React, { useEffect, useState } from 'react';

const LabelName = ({ activeElement, setChangeType, setValue }) => {
  const { label_name = '' } = activeElement.element.column_properties.label;
  const [labelName, setLabelName] = useState(label_name);
  const handleLabelName = (e) => {
    setLabelName(e.target.value);
  };

  useEffect(() => {
    setChangeType('label_name');
    setValue(labelName);
  }, [labelName]);

  return (
    <div>
      <Input
        value={labelName}
        placeholder="Enter label...."
        onChange={handleLabelName}
      />
    </div>
  );
};

export default LabelName;
