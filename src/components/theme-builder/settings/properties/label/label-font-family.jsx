import { Select } from 'antd';
import { get, map } from 'lodash';
import React, { useState, useEffect, useContext } from 'react';
import { AppearanceContext } from '../../../../context/appearance-context';

const LabelFontFamily = ({ activeElement, setChangeType, setValue }) => {
  const fontFamily = get(
    activeElement,
    'element.column_properties.label.labelStyle.fontFamily',
    ''
  );
  const [, fontFamilyList] = useContext(AppearanceContext);
  const [labelFontFamily, setLabelFontFamily] = useState(fontFamily);
  useEffect(() => {
    setChangeType('fontFamily');
    setValue(labelFontFamily);
  }, [labelFontFamily, setChangeType, setValue]);

  return (
    <div>
      <Select
        style={{ width: 250 }}
        placement="bottomRight"
        defaultValue={fontFamily}
        virtual={false}
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

export default LabelFontFamily;
