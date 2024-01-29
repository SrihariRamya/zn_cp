/* eslint-disable camelcase */
import { Col, Collapse, Switch } from 'antd';
import React, { useState, useEffect } from 'react';
import { get } from 'lodash';
import LabelAlign from './label-align';
import LabelColorPicker from './label-color-picker';
import LabelFontSize from './label-font-size';
import LabelFontWeight from './label-font-weight';
import LabelName from './label-name';
import LabelPadding from './label-padding';
import LabelFonstStyle from './label-font-style';
import { widget_type } from '../../../properties-obj/widget-properties-obj';
import LabelBackgroundColor from './label-background-color';
import LabelBorderRadius from './label-border-radius';
import {
  title_style,
  common_styles,
} from '../../../properties-obj/properties-obj';
import LabelFonstTransform from './label-transform';
import LabelFontFamily from './label-font-family';

const LabelStyle = ({ activeElement, sectionValues, setSectionValues }) => {
  const {
    label: { show_label = false },
  } = activeElement.element.column_properties;

  const [changeType, setChangeType] = useState('');
  const [value, setValue] = useState(null);

  const toggeleLabelProperties = (checked) => {
    setChangeType('show_label');
    setValue(checked);
  };

  useEffect(() => {
    if (changeType) {
      setSectionValues(
        sectionValues.map((sec) => {
          const rowRecursion = (row) => {
            row.forEach((row1) => {
              row1.column.forEach((col) => {
                const { label } = col.column_properties;
                // eslint-disable-next-line max-len
                if (col.column_uid === activeElement.element.column_uid) {
                  // eslint-disable-next-line max-len
                  if (['show_label', 'label_name'].includes(changeType)) {
                    if (changeType === 'show_label') {
                      label[changeType] = value;
                      // eslint-disable-next-line max-len
                      label.labelStyle = {
                        ...label.labelStyle,
                        ...title_style,
                        ...common_styles,
                      };
                    } else {
                      label[changeType] = value;
                    }
                  } else {
                    label.labelStyle[changeType] = value;
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
    <Col span={24}>
      {activeElement.element.widget_type !== 'label' && (
        <table>
          <tbody>
            <tr>
              <td>Show Title</td>
              <td>
                <Switch
                  checked={show_label}
                  onChange={toggeleLabelProperties}
                />
              </td>
            </tr>
          </tbody>
        </table>
      )}
      {((activeElement.element.widget_type === 'label' && !show_label) ||
        (activeElement.element.widget_type !== 'label' && show_label)) && (
        <Col span={24}>
          <table>
            <thead>
              <tr>
                <th colSpan={2}>Label</th>
              </tr>
            </thead>
          </table>
          <Collapse>
            <Collapse.Panel header="Label Name">
              <LabelName
                key={activeElement.element.column_uid}
                activeElement={activeElement}
                setChangeType={setChangeType}
                setValue={setValue}
              />
            </Collapse.Panel>
            <Collapse.Panel header="Label Padding">
              <LabelPadding
                key={activeElement.element.column_uid}
                activeElement={activeElement}
                setChangeType={setChangeType}
                setValue={setValue}
              />
            </Collapse.Panel>
            <Collapse.Panel header="Label Border Radius">
              <LabelBorderRadius
                key={activeElement.element.column_uid}
                activeElement={activeElement}
                setChangeType={setChangeType}
                setValue={setValue}
              />
            </Collapse.Panel>
            <Collapse.Panel header="Label Color">
              <LabelColorPicker
                key={activeElement.element.column_uid}
                activeElement={activeElement}
                setChangeType={setChangeType}
                setValue={setValue}
              />
            </Collapse.Panel>
            <Collapse.Panel header="Label Background Color">
              <LabelBackgroundColor
                key={activeElement.element.column_uid}
                activeElement={activeElement}
                setChangeType={setChangeType}
                setValue={setValue}
              />
            </Collapse.Panel>
            <Collapse.Panel header="Label Align">
              <LabelAlign
                key={activeElement.element.column_uid}
                activeElement={activeElement}
                setChangeType={setChangeType}
                setValue={setValue}
              />
            </Collapse.Panel>
            <Collapse.Panel header="Label Font Family">
              <LabelFontFamily
                key={activeElement.element.column_uid}
                activeElement={activeElement}
                setChangeType={setChangeType}
                setValue={setValue}
              />
            </Collapse.Panel>
            <Collapse.Panel header="Label Font Size">
              <LabelFontSize
                key={activeElement.element.column_uid}
                activeElement={activeElement}
                setChangeType={setChangeType}
                setValue={setValue}
              />
            </Collapse.Panel>
            <Collapse.Panel header="Label Font Style">
              <LabelFonstStyle
                key={activeElement.element.column_uid}
                activeElement={activeElement}
                setChangeType={setChangeType}
                setValue={setValue}
              />
            </Collapse.Panel>
            <Collapse.Panel header="Label Font Weight">
              <LabelFontWeight
                key={activeElement.element.column_uid}
                activeElement={activeElement}
                setChangeType={setChangeType}
                setValue={setValue}
              />
            </Collapse.Panel>
            <Collapse.Panel header="Text Transform">
              <LabelFonstTransform
                key={activeElement.element.column_uid}
                activeElement={activeElement}
                setChangeType={setChangeType}
                setValue={setValue}
              />
            </Collapse.Panel>
          </Collapse>
        </Col>
      )}
    </Col>
  );
};

export default LabelStyle;
