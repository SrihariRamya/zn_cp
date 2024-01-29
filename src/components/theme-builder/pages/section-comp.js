/* eslint-disable no-shadow */
/* eslint-disable camelcase */
import { Col, Row } from 'antd';
import * as React from 'react';
import { isEmpty, map } from 'lodash';
import RowComponent from './row-component';
import { widget_type } from '../properties-obj/widget-properties-obj';

const SectionComponent = ({
  section,
  dataSource,
  setActiveElement,
  activeElement,
  setPropertiesType,
  propertiesType,
}) => {
  const getActiveRowColumn = (element_uid, type) => {
    const {
      section_uid,
      section_properties: { data_source },
    } = section;
    const activeRow = (row) => {
      if (type === 'row') {
        row.forEach((row) => {
          if (row.row_uid === element_uid) {
            setActiveElement({
              section_uid,
              element: row,
              element_type: 'row',
              data_source,
            });
            setPropertiesType('row');
          } else if (row.column && !isEmpty(row.column)) {
            row.column.forEach((col) => {
              if (widget_type.includes(col.widget_type)) {
                if (col?.column_properties[col?.widget_type]?.row) {
                  activeRow(col.column_properties[col.widget_type].row);
                }
              } else if (col.row && !isEmpty(col.row)) {
                activeRow(col.row);
              }
            });
          }
        });
      }
    };

    const activeColumn = (rows) => {
      rows.forEach((row) => {
        row.column.forEach((col) => {
          if (col.column_uid === element_uid) {
            setActiveElement({
              section_uid,
              element: col,
              element_type: 'column',
              data_source,
            });
            setPropertiesType('column');
          } else if (widget_type.includes(col.widget_type)) {
            if (col?.column_properties[col?.widget_type]?.row) {
              activeColumn(col.column_properties[col.widget_type].row);
            }
          } else if (col?.row && !isEmpty(col.row)) {
            activeColumn(col.row);
          }
        });
      });
    };

    if (type === 'row') {
      activeRow(section.row);
    } else if (type === 'column') {
      activeColumn(section.row);
    }
  };

  const { row } = section;
  const {
    className = '',
    margin = '',
    padding = '',
    borderRadius = '',
    backgroundColor = '',
    width = '',
    borderWidth = '',
    borderColor = '',
    borderStyle = '',
    height = null,
  } = section.section_style;
  const style = {
    className,
    margin,
    padding,
    borderRadius,
    backgroundColor,
    borderWidth,
    borderColor,
    borderStyle,
    height,
  };
  return (
    <Col span={width || 24}>
      <Row style={{ height: '100%' }}>
        <Col span={24} style={{ ...style }} className={className || undefined}>
          <Col span={24}>
            {map(row, (row, indexRow) => (
              <RowComponent
                row={row}
                key={row.row_uid}
                dataSource={dataSource}
                getActiveRowColumn={getActiveRowColumn}
                setPropertiesType={setPropertiesType}
                activeElement={activeElement}
                propertiesType={propertiesType}
                indexRow={indexRow}
              />
            ))}
          </Col>
        </Col>
      </Row>
    </Col>
  );
};

export default SectionComponent;
