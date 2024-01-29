/* eslint-disable camelcase */
/* eslint-disable max-len */
import { Col, Collapse, Row, Switch } from 'antd';
import { isEmpty, get } from 'lodash';
import React, {
  // Dispatch, SetStateAction,
  useEffect,
  useState,
} from 'react';
import BackgroundColor from './background-color';
import Border from './border';
import BorderRadius from './border-radius';
// import ColumnIterableProperties from './column-iterable';
import DataFieldComponent from './data-field';
import Margin from './margin';
import Padding from './padding';
import { common_styles } from '../../../properties-obj/properties-obj';
// import Height from './height';

const CommonProperties = ({
  setSectionValues,
  sectionValues,
  activeElement,
  type,
  dataSource,
}) => {
  const { show_style = false } = activeElement.element[`${type}_style`];
  const [showStyle, setShowStyle] = useState(show_style);
  const [changeType, setChangeType] = useState('');
  const [value, setValue] = useState(null);

  const handleChange = (value) => {
    setShowStyle(value);
    setChangeType('show_style');
    setValue(value);
  };

  useEffect(() => {
    if (changeType) {
      if (type === 'column') {
        setSectionValues(
          sectionValues.map((sec) => {
            const columRecursion = (row) => {
              row.forEach((row) => {
                row.column.forEach((col) => {
                  if (col.column_uid === activeElement.element.column_uid) {
                    const types = [
                      'field_name',
                      'dataField',
                      'columnIterable',
                      'oddBg',
                      'evenBg',
                      'required',
                    ];
                    if (types.includes(changeType)) {
                      if (
                        ['columnIterable', 'oddBg', 'evenBg'].includes(
                          changeType
                        )
                      ) {
                        col.column_properties.iterable[changeType] = value;
                      } else {
                        col.column_properties[changeType] = value;
                      }
                    } else if (changeType === 'show_style') {
                      col.column_style[changeType] = value;
                      col.column_style = {
                        ...col.column_style,
                        // ...common_styles,
                      };
                    } else {
                      col.column_style[changeType] = value;
                    }
                  } else if (
                    // widget_type.includes(
                    col.widget_type
                    // )
                  ) {
                    if (get(col, 'column_properties[col.widget_type].row')) {
                      columRecursion(
                        col.column_properties[col.widget_type].row
                      );
                    }
                  } else if (col.row) {
                    columRecursion(col.row);
                  }
                });
              });
            };

            columRecursion(sec.row);

            return sec;
          })
        );
      } else if (type === 'row') {
        setSectionValues(
          sectionValues.map((sec) => {
            const rowRecursion = (row) => {
              row.forEach((row) => {
                if (row.row_uid === activeElement.element.row_uid) {
                  if (changeType === 'show_style') {
                    row.row_style[changeType] = value;
                    row.row_style = { ...row.row_style, ...common_styles };
                  } else {
                    row.row_style[changeType] = value;
                  }
                } else if (row.column) {
                  row.column.forEach((col) => {
                    if (
                      // widget_type.includes(
                      col.widget_type
                      // )
                    ) {
                      if (get(col, 'column_properties[col.widget_type].row')) {
                        rowRecursion(
                          col.column_properties[col.widget_type].row
                        );
                      }
                    } else if (col.row) {
                      rowRecursion(col.row);
                    }
                  });
                }
              });
            };

            rowRecursion(sec.row);

            return sec;
          })
        );
      } else if (type === 'section') {
        setSectionValues(
          sectionValues.map((sec) => {
            if (sec.section_uid === activeElement.element.section_uid) {
              if (changeType === 'show_style') {
                sec.section_style[changeType] = value;
                sec.section_style = { ...sec.section_style, ...common_styles };
              } else {
                sec.section_style[changeType] = value;
              }
            }

            return sec;
          })
        );
      }
    }
  }, [changeType, value]);
  const getKey = get(activeElement, `element[${type}_uid]`);
  const dataFieldKey = `dataField_${getKey}`;
  const paddingKey = `padding_${getKey}`;
  const marginKey = `margin_${getKey}`;
  const borderRadiusKey = `b_radius_${getKey}`;
  const backgroundColorKey = `bg_color_${getKey}`;
  const borderKey = `border_${getKey}`;
  const heightKey = `border_${getKey}`;

  return (
    <Row>
      {!isEmpty(activeElement.element) && (
        <>
          <Col span={24}>
            {type === 'column' && (
              <>
                {get(activeElement, 'element.widget_type') === 'label' && (
                  <DataFieldComponent
                    key={dataFieldKey}
                    activeElement={activeElement}
                    setChangeType={setChangeType}
                    setValue={setValue}
                    type={type}
                    dataSource={dataSource}
                  />
                )}
                {/* {!activeElement.element.widget_type && (
                  <ColumnIterableProperties
                    key={`columnIterable_${
                      activeElement.element[`${type}_uid`]
                    }`}
                    setChangeType={setChangeType}
                    activeElement={activeElement}
                    setValue={setValue}
                    type={type}
                  />
                )} */}
              </>
            )}
            <table>
              <tbody>
                <tr>
                  <td>
                    <span>Show Styles</span>
                  </td>
                  <td>
                    <Switch onChange={handleChange} checked={showStyle} />
                  </td>
                </tr>
              </tbody>
            </table>
            {showStyle && type && (
              <Col span={24}>
                <Collapse>
                  <Collapse.Panel header="Padding" key="padding">
                    <Col span={24}>
                      <Padding
                        key={paddingKey}
                        setChangeType={setChangeType}
                        activeElement={activeElement}
                        setValue={setValue}
                        type={type}
                      />
                    </Col>
                  </Collapse.Panel>
                  <Collapse.Panel header="Margin" key="margin">
                    <Col span={24}>
                      <Margin
                        key={marginKey}
                        setChangeType={setChangeType}
                        activeElement={activeElement}
                        setValue={setValue}
                        type={type}
                      />
                    </Col>
                  </Collapse.Panel>
                  <Collapse.Panel header="Border Radius" key="border radius">
                    <Col span={24}>
                      <BorderRadius
                        key={borderRadiusKey}
                        setChangeType={setChangeType}
                        activeElement={activeElement}
                        setValue={setValue}
                        type={type}
                      />
                    </Col>
                  </Collapse.Panel>
                  <Collapse.Panel
                    header="Background Color"
                    key="backgroundColor"
                  >
                    <Col span={24}>
                      <BackgroundColor
                        key={backgroundColorKey}
                        setChangeType={setChangeType}
                        activeElement={activeElement}
                        setValue={setValue}
                        type={type}
                      />
                    </Col>
                  </Collapse.Panel>
                  <Collapse.Panel header="Border" key="border">
                    <Col span={24}>
                      <Border
                        key={borderKey}
                        setChangeType={setChangeType}
                        activeElement={activeElement}
                        setValue={setValue}
                        type={type}
                      />
                    </Col>
                  </Collapse.Panel>
                  {/* <Collapse.Panel header="Height" key="height">
                    <Col span={24}>
                      <Height
                        key={heightKey}
                        setChangeType={setChangeType}
                        activeElement={activeElement}
                        setValue={setValue}
                        type={type}
                      />
                    </Col>
                  </Collapse.Panel> */}
                </Collapse>
              </Col>
            )}
          </Col>
        </>
      )}
    </Row>
  );
};

export default CommonProperties;
