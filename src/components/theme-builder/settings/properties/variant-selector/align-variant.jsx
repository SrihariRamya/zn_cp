import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
} from '@ant-design/icons';
import { Button, Space } from 'antd';
import React, { useState, useEffect } from 'react';

const VariantAlign = ({
  activeElement,
  setChangeType,
  setValue,
  ChangeFor,
}) => {
  const backgroundColor =
    activeElement.element.column_properties.button[ChangeFor];
  const [labelBackgroundColor, setLabelBackgroundColor] = useState(
    backgroundColor
  );
  useEffect(() => {
    setChangeType(ChangeFor);
    setValue(labelBackgroundColor);
  }, [ChangeFor, labelBackgroundColor, setChangeType, setValue]);

  return (
    <div>
      <Space>
        <Button
          icon={<AlignLeftOutlined />}
          onClick={() => setLabelBackgroundColor('left')}
        />
        <Button
          icon={<AlignCenterOutlined />}
          onClick={() => setLabelBackgroundColor('center')}
        />
        <Button
          icon={<AlignRightOutlined />}
          onClick={() => setLabelBackgroundColor('right')}
        />
      </Space>
    </div>
  );
};

export default VariantAlign;
