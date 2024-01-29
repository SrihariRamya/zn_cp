// import {
//   CheckOutlined,
//   CopyOutlined,
//   DeleteOutlined,
//   MenuOutlined,
//   PlusOutlined,
// } from '@ant-design/icons';
import { Row } from 'antd';
import { get, isEmpty } from 'lodash';
import React, { useState } from 'react';

// eslint-disable-next-line import/no-cycle
import ColumnComponent from './column-component';

const RowComponent = ({
  row,
  getActiveRowColumn,
  deleteColumn,
  deleteRow,
  addRowColumn,
  dataSource,
  setPropertiesType,
  propertiesType,
  activeElement,
}) => {
  const style = row.row_style;
  const { className = undefined } = row.row_style;
  const [showIcon, setShowIcon] = useState(false);
  return (
    <div
      key={row.row_uid}
      id={row.row_uid}
      className={showIcon ? 'editor-row show' : 'editor-row'}
      style={{
        border:
          (showIcon && '2px solid yellow') ||
          (get(activeElement, 'element.row_uid') === get(row, 'row_uid') &&
            '2px dotted green'),
      }}
      onClick={(event) => {
        event.stopPropagation();
        setPropertiesType('row');
        getActiveRowColumn(row.row_uid, 'row');
      }}
      onMouseOver={(event) => {
        event.stopPropagation();
        setShowIcon(true);
      }}
      onMouseOut={(event) => {
        event.stopPropagation();
        setShowIcon(false);
      }}
      onFocus={(event) => {
        event.stopPropagation();
        setShowIcon(true);
      }}
      onBlur={(event) => {
        event.stopPropagation();
        setShowIcon(false);
      }}
      aria-hidden="true"
    >
      <Row
        key={row.row_uid}
        id={row.row_uid}
        style={{
          ...style,
          width: '100%',
        }}
        className={className}
      >
        <div
          className="icon row"
          style={{
            display: showIcon ? 'block' : 'none',
          }}
        >
          {/* <Popover
            placement="top"
            trigger="hover"
            content={
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '15px',
                  cursor: 'pointer',
                }}
              >
                <span>
                  <Tooltip title="Add Column" placement="topLeft">
                    <PlusOutlined
                      onClick={() =>
                        addRowColumn({
                          element_uid: row.row_uid,
                          type: 'add-column',
                        })
                      }
                    />
                  </Tooltip>
                </span>
                <span>
                  <Tooltip title="Delete Row" placement="topLeft">
                    <DeleteOutlined onClick={() => deleteRow(row.row_uid)} />
                  </Tooltip>
                </span>
                <span>
                  <Tooltip title="Select Row" placement="topLeft">
                    <CheckOutlined
                      onClick={() => {
                        setPropertiesType('row');
                        getActiveRowColumn(row.row_uid, 'row');
                      }}
                    />
                  </Tooltip>
                </span>
                <span>
                  <Tooltip title="Copy Row" placement="topLeft">
                    <CopyOutlined
                      onClick={() =>
                        addRowColumn({
                          element_uid: row.row_uid,
                          type: 'copy-row',
                        })
                      }
                    />
                  </Tooltip>
                </span>
              </div>
            }
          >
            <MenuOutlined />
          </Popover> */}
        </div>
        {row.column &&
          !isEmpty(row.column) &&
          row.column.map((col, indexCol) => (
            <ColumnComponent
              col={col}
              // key={indexCol}
              key={col.column_uid}
              indexCol={indexCol}
              colCount={row.column.length}
              getActiveRowColumn={getActiveRowColumn}
              dataSource={dataSource}
              deleteColumn={deleteColumn}
              deleteRow={deleteRow}
              addRowColumn={addRowColumn}
              setPropertiesType={setPropertiesType}
              propertiesType={propertiesType}
              activeElement={activeElement}
            />
          ))}
      </Row>
    </div>
  );
};

export default RowComponent;
