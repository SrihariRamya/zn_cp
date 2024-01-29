/* eslint-disable camelcase */
import { Collapse } from 'antd';
import React, { useEffect, useState } from 'react';
import { get } from 'lodash';
import { widget_type } from '../../../properties-obj/widget-properties-obj';
import VariantAlign from './align-variant';
import ButtonStyle from './button-style';

function VariantSelectorStyle({
  setSectionValues,
  activeElement,
  sectionValues,
}) {
  const [changeType, setChangeType] = useState('');
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (changeType) {
      setSectionValues(
        sectionValues.map((sec) => {
          const rowRecursion = (row) => {
            row.forEach((row1) => {
              row1.column.forEach((col) => {
                const variant_style = get(
                  col,
                  'column_properties.variant_style'
                );
                if (col.column_uid === activeElement.element.column_uid) {
                  // eslint-disable-next-line dot-notation
                  col.column_properties['variant_style'] = {
                    ...variant_style,
                    [changeType]: value,
                  };
                } else if (widget_type.includes(col.widget_type)) {
                  if (get(col, 'column_properties[col.widget_type].row')) {
                    rowRecursion(col.column_properties[col.widget_type].row);
                  }
                } else if (col.row) {
                  rowRecursion(col.row);
                }
              });
            });
          };

          if (sec.section_uid === activeElement.section_uid) {
            rowRecursion(sec.row);
          }

          return sec;
        })
      );
    }
  }, [changeType, value]);
  return (
    <div>
      <h1>Button style</h1>
      <Collapse>
        <Collapse.Panel header="Variant Align">
          <VariantAlign
            key={activeElement.element.column_uid}
            activeElement={activeElement}
            setChangeType={setChangeType}
            setValue={setValue}
            ChangeFor="justify-content"
          />
        </Collapse.Panel>
        <Collapse.Panel header="Button Style">
          <ButtonStyle
            key={activeElement.element.column_uid}
            activeElement={activeElement}
            setChangeType={setChangeType}
            setValue={setValue}
          />
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}

export default VariantSelectorStyle;
