/* eslint-disable camelcase */
import { Collapse } from 'antd';
import React, { useEffect, useState } from 'react';
import { get } from 'lodash';
import { widget_type } from '../../../properties-obj/widget-properties-obj';
import {
  common_styles,
  title_style,
} from '../../../properties-obj/properties-obj';
import ColorChange from './button-color-change';
import ButtonBoxChange from './button-box';
import ButtonFontFamily from './button-font-family';

function ButtonStyle({ setSectionValues, activeElement, sectionValues }) {
  const [changeType, setChangeType] = useState('');
  const [value, setValue] = useState(null);
  useEffect(() => {
    if (changeType) {
      setSectionValues(
        sectionValues.map((sec) => {
          const rowRecursion = (row) => {
            row.forEach((row1) => {
              row1.column.forEach((col) => {
                const { button } = col.column_properties;
                // eslint-disable-next-line max-len
                if (col.column_uid === activeElement.element.column_uid) {
                  // eslint-disable-next-line max-len
                  if (['show_label', 'label_name'].includes(changeType)) {
                    if (changeType === 'show_label') {
                      button[changeType] = value;
                      // eslint-disable-next-line max-len
                      button.labelStyle = {
                        ...button.labelStyle,
                        ...title_style,
                        ...common_styles,
                      };
                    } else {
                      button[changeType] = value;
                    }
                  } else {
                    button[changeType] = value;
                  }
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
        <Collapse.Panel header="Button Background Color">
          <ColorChange
            key={activeElement.element.column_uid}
            activeElement={activeElement}
            setChangeType={setChangeType}
            setValue={setValue}
            ColorChangeFor="backgroundColor"
          />
        </Collapse.Panel>
        <Collapse.Panel header="Text Background Color">
          <ColorChange
            key={activeElement.element.column_uid}
            activeElement={activeElement}
            setChangeType={setChangeType}
            setValue={setValue}
            ColorChangeFor="color"
          />
        </Collapse.Panel>
        <Collapse.Panel header="Button Border Radius">
          <ButtonBoxChange
            key={activeElement.element.column_uid}
            activeElement={activeElement}
            setChangeType={setChangeType}
            setValue={setValue}
            ChangeFor="borderRadius"
            type="button"
            isFor="borderRadius"
          />
        </Collapse.Panel>
        <Collapse.Panel header="Button Border width">
          <ButtonBoxChange
            key={activeElement.element.column_uid}
            activeElement={activeElement}
            setChangeType={setChangeType}
            setValue={setValue}
            ChangeFor="borderWidth"
            type="button"
            isFor="borderWidth"
          />
        </Collapse.Panel>
        <Collapse.Panel header="Border Color">
          <ColorChange
            key={activeElement.element.column_uid}
            activeElement={activeElement}
            setChangeType={setChangeType}
            setValue={setValue}
            ColorChangeFor="borderColor"
          />
        </Collapse.Panel>
        <Collapse.Panel header="Button Font Family">
          <ButtonFontFamily
            key={activeElement.element.column_uid}
            activeElement={activeElement}
            setChangeType={setChangeType}
            setValue={setValue}
            ChangeFor="borderRadius"
            type="button"
            isFor="borderWidth"
          />
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}

export default ButtonStyle;
