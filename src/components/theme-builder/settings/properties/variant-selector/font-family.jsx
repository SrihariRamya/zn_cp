import { Select } from 'antd';
import { get, map } from 'lodash';
import React, { useState, useEffect, useContext } from 'react';
import { AppearanceContext } from '../../../../context/appearance-context';

const FontFamily = ({ activeElement, setChangeType, setValue, isFor }) => {
  const fontFamily = get(
    activeElement,
    `element.column_properties.variant_style[${isFor}]`,
    ''
  );
  const [, fontFamilyList] = useContext(AppearanceContext);
  const [labelFontFamily, setLabelFontFamily] = useState(fontFamily);
  useEffect(() => {
    setChangeType(isFor);
    setValue(labelFontFamily);
  }, [labelFontFamily, setChangeType, setValue]);

  return (
    <div>
      <Select
        style={{ width: 250 }}
        placement="bottomRight"
        virtual={false}
        defaultValue={fontFamily}
        onChange={(element) => {
          setLabelFontFamily(element);
        }}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
      >
        {map(fontFamilyList, (element) => (
          <Select.Option value={element}>{element}</Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default FontFamily;
