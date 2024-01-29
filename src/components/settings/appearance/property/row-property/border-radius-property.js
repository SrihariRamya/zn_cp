import React from 'react';
import { Row, InputNumber, Space } from 'antd';
import { get, map, isEmpty, debounce, find } from 'lodash';

function BorderRadiusProperty({
  editorContext,
  rowProperties,
  setEditorContext,
  columnMenu,
  renderArea,
}) {
  const getBorderRadiusHelper = (borderRadiusFor, parameters) => {
    let borderRadius = '';
    if (borderRadiusFor === 'column') {
      const findRow = find(editorContext, (row) =>
        find(
          get(row, 'column'),
          (column) =>
            get(column, 'appearance_column_uid') ===
            get(columnMenu, 'appearance_column_uid')
        )
      );
      const findColumn = find(
        get(findRow, 'column', []),
        (column) =>
          get(column, 'appearance_column_uid') ===
          get(columnMenu, 'appearance_column_uid')
      );
      borderRadius = get(findColumn, 'style.borderRadius', ' ');
    } else if (borderRadiusFor === 'row') {
      const findRow = find(
        editorContext,
        (row) =>
          get(row, 'appearance_row_uid') ===
          get(rowProperties, 'item.appearance_row_uid')
      );
      borderRadius = get(findRow, 'style.borderRadius', ' ');
    }
    const getIndexTop = borderRadius.indexOf('px');
    const getIndexRight = borderRadius.indexOf('px', getIndexTop + 1);
    const getIndexBottom = borderRadius.indexOf('px', getIndexRight + 1);
    const getIndexLeft = borderRadius.indexOf('px', getIndexBottom + 1);

    switch (parameters) {
      case 'top':
        return parseInt(borderRadius.substring(0, getIndexTop), 10);
      case 'right':
        return parseInt(
          borderRadius.substring(getIndexTop + 3, getIndexRight + 1),
          10
        );
      case 'bottom':
        return parseInt(
          borderRadius.substring(getIndexRight + 3, getIndexBottom + 1),
          10
        );
      case 'left':
        return parseInt(
          borderRadius.substring(getIndexBottom + 3, getIndexLeft + 1),
          10
        );
      default:
        return 0;
    }
  };

  const getBorderRadiusResult = (borderRadius, event, parameters) => {
    const getIndexTop = borderRadius.indexOf('px');
    const getIndexRight = borderRadius.indexOf('px', getIndexTop + 1);
    const getIndexBottom = borderRadius.indexOf('px', getIndexRight + 1);
    const getIndexLeft = borderRadius.indexOf('px', getIndexBottom + 1);
    if (isEmpty(parameters)) return `${event}px`;
    switch (parameters) {
      case 'top':
        return `${event}${borderRadius.substring(
          getIndexTop,
          borderRadius.length
        )}`;
      case 'right':
        return `${borderRadius.substring(
          0,
          getIndexTop + 3
        )}${event}${borderRadius.substring(
          getIndexRight,
          borderRadius.length
        )}`;
      case 'bottom':
        return `${borderRadius.substring(
          0,
          getIndexRight + 3
        )}${event}${borderRadius.substring(
          getIndexBottom,
          borderRadius.length
        )}`;
      case 'left':
        return `${borderRadius.substring(
          0,
          getIndexBottom + 3
        )}${event}${borderRadius.substring(getIndexLeft, borderRadius.length)}`;
      default:
        return '0px';
    }
  };

  const setBorderRadius = debounce((value, parameters, borderRadiusFor) => {
    let borderRadius = '';
    if (borderRadiusFor === 'column') {
      borderRadius = get(columnMenu, 'style.borderRadius', '');
    } else if (borderRadiusFor === 'row') {
      borderRadius = get(rowProperties, 'item.style.borderRadius', '');
    }
    setEditorContext(
      map(editorContext, (item, index_) => {
        if (index_ === get(rowProperties, 'index')) {
          if (renderArea === 'row') {
            item.style.borderRadius = getBorderRadiusResult(
              borderRadius || '0px 0px 0px 0px',
              value,
              parameters
            );
          } else if (renderArea === 'column') {
            map(get(item, 'column', []), (it) => {
              if (
                get(it, 'appearance_column_uid') ===
                get(columnMenu, 'appearance_column_uid')
              ) {
                it.style.borderRadius = getBorderRadiusResult(
                  borderRadius || '0px 0px 0px 0px',
                  value,
                  parameters
                );
              }
              return it;
            });
          }
        }
        return item;
      })
    );
  }, 100);

  return (
    <>
      <Row justify="space-between">
        <div className="mtb-auto">Radius</div>
        <Space>
          <InputNumber
            placeholder="T"
            type="number"
            min={0}
            value={getBorderRadiusHelper(renderArea, 'top') || 0}
            onChange={(event) => setBorderRadius(event, 'top', renderArea)}
          />
          <InputNumber
            placeholder="R"
            type="number"
            min={0}
            value={getBorderRadiusHelper(renderArea, 'right') || 0}
            onChange={(event) => setBorderRadius(event, 'right', renderArea)}
          />
          <InputNumber
            placeholder="L"
            type="number"
            min={0}
            value={getBorderRadiusHelper(renderArea, 'left') || 0}
            onChange={(event) => setBorderRadius(event, 'left', renderArea)}
          />
          <InputNumber
            placeholder="B"
            type="number"
            min={0}
            value={getBorderRadiusHelper(renderArea, 'bottom') || 0}
            onChange={(event) => setBorderRadius(event, 'bottom', renderArea)}
          />
        </Space>
      </Row>
    </>
  );
}

export default BorderRadiusProperty;
