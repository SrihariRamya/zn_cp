import React, { useState } from 'react';
import { cloneDeep, find, findIndex, get } from 'lodash';
import { ColumnWidthOutlined } from '@ant-design/icons';
import { v4 as uuid } from 'uuid';
import { useComponentContext } from '../context/components';
import Component from './component';
import {
  handleDragEnd,
  handleOnDragOver,
  handleOnDragStart,
  handleOnDrop,
  addClass,
  removeClass,
  handleResizeEnd,
  handleDragLeave,
  ColumnJson,
  getColumnDetail,
  convertPercentageToPx,
} from '../helper';
import EditorPopoverComponent from './editor-popover-component';

function moveAt(columnDom, pageX, pageY) {
  if (columnDom?.style) {
    columnDom.style.left = `${pageX}px`;
    columnDom.style.top = `${pageY}px`;
  }
}

const ColumnComponent = ({ column }) => {
  const {
    updateComponentJsonAfterDND,
    componentSource,
    updateComponentState,
    setComponentSource,
    setComponentType,
    componentType,
    setDraggingDirection,
    draggingDirection,
    componentValues,
    resizeComponent,
    isDragging,
    setIsDragging,
    productModalVisible,
    categoryModalVisible,
    modalVisible,
    buttonModalVisible,
    embedModalVisible,
    videoModalVisible,
    imageActionModal,
    imageModal,
    editCarousel,
  } = useComponentContext();

  const type = 'column';

  const [initialPos, setInitialPos] = useState(0);
  const [initialSize, setInitialSize] = useState(0);
  const [columnDom, setColumnDom] = useState();
  const [resizeColumn, setResizeColumn] = useState(false);

  const resizeColumn1 = false;

  const escapeColumnUid = CSS.escape(componentSource);
  const columnIndex = findIndex(
    column,
    (col) => get(col, 'columnUid') === componentSource
  );
  const escapeParentUid = CSS.escape(get(column, `[${columnIndex}].parentUid`));

  const nextSiblingColumn = get(column, `[${columnIndex + 1}]`);
  const escapeNextSiblingColumnUid = CSS.escape(
    get(nextSiblingColumn, 'columnUid')
  );
  const previousSiblingColumn = get(column, `[${columnIndex - 1}]`);
  const escapePreviousSiblingColumnUid = CSS.escape(
    get(previousSiblingColumn, 'columnUid')
  );

  const onDragStartHandlerColumn = ({ event, isFor }) => {
    event.stopPropagation();
    const resizable = document.querySelector(`#${escapeColumnUid}`);
    setIsDragging(true);
    setResizeColumn(true);
    switch (isFor) {
      case 'column': {
        const values = handleOnDragStart({ event });
        if (values) {
          const { componentType: colType, id } = values;
          setComponentType(colType);
          setComponentSource(id);
        }
        if (resizeColumn1) {
          event.dataTransfer.clearData();
          const a = document.querySelector(`#${escapeColumnUid}`);
          const ball = event.target.cloneNode(true);
          ball.id = 'drag-ball';
          ball.style.width = '200px';
          ball.style.height = '200px';
          ball.style.overflow = 'hidden';
          ball.style.padding = 'none';
          ball.style.position = 'absolute';
          ball.style.zIndex = 50;
          document.body.append(ball);
          setColumnDom(ball);
          const baseDiv = document.createElement('div');
          baseDiv.style.width = `${a?.offsetWidth}px`;
          baseDiv.style.height = `${a?.offsetHeight}px`;
          baseDiv.style.backgroundColor = 'blue';
          baseDiv.style.position = 'relative';
          baseDiv.style.opacity = '0.4';
          baseDiv.style.zIndex = 20;
          baseDiv.id = 'baseColumnDiv';
          event.target.parentNode.insertBefore(baseDiv, event.nextSibling);
        }
        break;
      }
      case 'right': {
        setInitialPos(event.clientX);
        setInitialSize(resizable?.offsetWidth);
        if (get(nextSiblingColumn, 'component[0].componentType') === 'dummy') {
          document.querySelector(`#${escapeNextSiblingColumnUid}`)?.remove();
          const wrapper = document.createElement('div');
          wrapper.setAttribute('id', get(nextSiblingColumn, 'columnUid'));
          wrapper.style.width = get(nextSiblingColumn, 'columnStyle.width');
          resizable.after(wrapper);
          break;
        } else {
          const uid = uuid();
          const wrapper = document.createElement('div');
          wrapper.setAttribute('id', uid);
          resizable.after(wrapper);
          break;
        }
      }
      case 'left': {
        setInitialPos(event.clientX);
        setInitialSize(resizable?.offsetWidth);
        if (
          get(previousSiblingColumn, 'component[0].componentType') === 'dummy'
        ) {
          document
            .querySelector(`#${escapePreviousSiblingColumnUid}`)
            ?.remove();
          const wrapper = document.createElement('div');
          wrapper.setAttribute('id', get(previousSiblingColumn, 'columnUid'));
          wrapper.style.width = get(previousSiblingColumn, 'columnStyle.width');
          resizable.before(wrapper);
          break;
        } else {
          const uid = uuid();
          const wrapper = document.createElement('div');
          wrapper.setAttribute('id', uid);
          resizable.before(wrapper);
          break;
        }
      }
      default: {
        break;
      }
    }
  };
  const onDragHandlerColumn = ({ event, isFor }) => {
    event.stopPropagation();
    const columnSize = getColumnDetail(escapeParentUid);
    const singleColumnInPx = get(columnSize, '[0].inPx');
    const rightDivPoint = document.querySelector('#right-div');
    const bottomDivPoint = document.querySelector('#bottom-div');
    switch (isFor) {
      case 'column': {
        if (!resizeColumn1) break;
        if (resizeColumn) {
          moveAt(columnDom, event.pageX, event.pageY);
          const columnDom1 = document
            ?.querySelector(`#${componentSource}`)
            ?.getBoundingClientRect();
          const rowIndex = componentValues.row.findIndex((r) => {
            return !!r.column.some((c) => c.columnUid === componentSource);
          });
          const rowGridId = `${get(
            componentValues,
            `row[${rowIndex}].rowUid`
          )}-grid-row`;
          const RowDiv1 = document
            // eslint-disable-next-line unicorn/prefer-query-selector
            .getElementById(rowGridId)
            ?.getBoundingClientRect();
          const baseDiv = document.querySelector('#baseColumnDiv');
          if (
            get(event, 'pageX') - get(RowDiv1, 'left') > 0 &&
            get(event, 'pageX') +
              get(columnDom1, 'width') -
              get(RowDiv1, 'left') -
              get(RowDiv1, 'width') <
              0 &&
            baseDiv
          ) {
            baseDiv.style.left = `${
              event.pageX -
              RowDiv1.left -
              (columnDom1.left - RowDiv1.left) -
              get(columnDom1, 'width')
            }px`;
          }
        }
        break;
      }
      case 'left': {
        const resizeWidth = initialSize - (get(event, 'clientX') - initialPos);
        const resizable = document.querySelector(`#${escapeColumnUid}`);
        const leftDiv = resizable.previousElementSibling;
        if (resizeWidth < singleColumnInPx) break;
        if (
          resizeWidth > initialSize &&
          get(previousSiblingColumn, 'component[0].componentType') !== 'dummy'
        )
          break;
        if (
          get(previousSiblingColumn, 'component[0].componentType') ===
            'dummy' &&
          resizeWidth > initialSize &&
          get(previousSiblingColumn, 'columnStyle.width') === '0%'
        ) {
          break;
        }
        const leftDivWidth =
          get(previousSiblingColumn, 'component[0].componentType') === 'dummy'
            ? convertPercentageToPx(
                get(previousSiblingColumn, 'parentUid'),
                get(previousSiblingColumn, 'columnStyle.width'),
                'number'
              ) +
              event.clientX -
              initialPos
            : event.clientX - initialPos;
        if (
          get(previousSiblingColumn, 'component[0].componentType') ===
            'dummy' &&
          leftDivWidth < 0
        ) {
          break;
        }
        if (
          resizable &&
          initialSize &&
          initialPos &&
          leftDiv &&
          event.clientX !== 0 &&
          resizeWidth > singleColumnInPx
        ) {
          leftDiv.style.width = `${leftDivWidth}px`;
          resizable.style.width = `${resizeWidth}px`;
          resizable.style.background = '#abed87';
          rightDivPoint.style.left = `${resizeWidth - 10}px`;
          if (bottomDivPoint?.style?.left)
            bottomDivPoint.style.left = `${resizeWidth / 2 - 10}px`;
        }
        break;
      }
      case 'right': {
        const getParentRowSize = document
          // eslint-disable-next-line unicorn/prefer-query-selector
          .getElementById(
            `${`${get(column, `[${columnIndex}].parentUid`)}-grid-row`}`
          )
          ?.getBoundingClientRect();
        if (
          get(event, 'clientX') >
          get(getParentRowSize, 'width') + get(getParentRowSize, 'x')
        )
          break;
        const resizeWidth = initialSize + (get(event, 'clientX') - initialPos);
        const resizable = document.querySelector(`#${escapeColumnUid}`);
        const rightDiv = resizable.nextElementSibling;
        if (resizeWidth < singleColumnInPx) break;
        if (
          resizeWidth > initialSize &&
          get(nextSiblingColumn, 'component[0].componentType') !== 'dummy' &&
          get(nextSiblingColumn, 'component[0].componentType') !== undefined
        )
          break;
        if (
          get(nextSiblingColumn, 'component[0].componentType') === 'dummy' &&
          resizeWidth > initialSize &&
          get(nextSiblingColumn, 'columnStyle.width') === '0%'
        ) {
          break;
        }
        const rightDivWidth =
          get(nextSiblingColumn, 'component[0].componentType') === 'dummy'
            ? convertPercentageToPx(
                get(nextSiblingColumn, 'parentUid'),
                get(nextSiblingColumn, 'columnStyle.width'),
                'number'
              ) +
              initialPos -
              event.clientX
            : initialPos - event.clientX;
        if (
          get(nextSiblingColumn, 'component[0].componentType') === 'dummy' &&
          rightDivWidth < 0
        ) {
          break;
        }
        if (
          resizable &&
          initialSize &&
          initialPos &&
          event.clientX !== 0 &&
          resizeWidth > singleColumnInPx
        ) {
          if (rightDiv) rightDiv.style.width = `${rightDivWidth}px`;
          resizable.style.width = `${resizeWidth}px`;
          resizable.style.background = '#abed87';
          rightDivPoint.style.left = `${resizeWidth - 10}px`;
          if (bottomDivPoint?.style?.left)
            bottomDivPoint.style.left = `${resizeWidth / 2 - 10}px`;
        }
        break;
      }
      default: {
        break;
      }
    }
  };
  const onDragEndHandlerColumn = ({ event, isFor }) => {
    event.stopPropagation();
    switch (isFor) {
      case 'column': {
        if (!resizeColumn1) break;
        handleDragEnd(event);
        setIsDragging(false);
        setComponentSource();
        setColumnDom();
        const element = document.querySelector('#drag-ball');
        const abc = document.querySelector('#baseColumnDiv');
        element?.remove();
        const rowIndex = componentValues.row.findIndex((r) => {
          return !!r.column.some((c) => c.columnUid === componentSource);
        });
        const rowDivBounding = document
          ?.getElementById(get(componentValues, `row[${rowIndex}].rowUid`))
          ?.getBoundingClientRect();
        const baseDivBounding = document
          ?.querySelector('#baseColumnDiv')
          ?.getBoundingClientRect();
        const leftDivWidthInPx =
          Number(baseDivBounding?.left) - Number(rowDivBounding?.left);
        const elementWidthPercentage = `${
          Math.round(Number(leftDivWidthInPx) / 100) * (100 / 12)
        }%`;
        const newComponentValues = cloneDeep(componentValues);
        newComponentValues.row?.map((row) => {
          row.column?.map((col, colIndex) => {
            if (col.columnUid === componentSource && elementWidthPercentage) {
              const newColumn = ColumnJson();
              newColumn.columnStyle.width = elementWidthPercentage;
              if (colIndex === 0) {
                row.column.unshift(newColumn);
              } else {
                row.column.splice(colIndex - 1, 0, newColumn);
              }
            }
            return col;
          });
          return row;
        });
        updateComponentState(newComponentValues);
        abc?.remove();
        break;
      }
      case 'left': {
        const size = handleResizeEnd(
          componentSource,
          'left',
          column[columnIndex],
          previousSiblingColumn
        );
        resizeComponent(size);
        break;
      }
      case 'right': {
        const size = handleResizeEnd(
          componentSource,
          'right',
          column[columnIndex],
          nextSiblingColumn
        );
        resizeComponent(size);
        break;
      }
      default: {
        break;
      }
    }
    setResizeColumn(false);
  };
  const onDragOver = (event) => {
    if (
      !componentSource ||
      !componentType ||
      !componentValues ||
      !draggingDirection ||
      resizeColumn
    )
      return;
    const position = handleOnDragOver({
      event,
      componentSource,
      componentValues,
      draggingDirection,
    });
    if (position) {
      setDraggingDirection({ ...draggingDirection, current: position });
    }
  };

  const onDrop = (event) => {
    if (!componentSource || !componentType || !componentValues || resizeColumn)
      return;
    const id = handleOnDrop({
      event,
      componentType,
      componentSource,
      componentValues,
    });
    if (!id || id === componentSource) return;
    const values = {
      source: componentSource,
      target: id,
    };
    updateComponentJsonAfterDND({ ...values });
  };

  const onDragLeave = (event) => {
    handleDragLeave({ event, componentSource });
  };

  const onClick = (event, clickedColumn) => {
    event.stopPropagation();

    if (get(clickedColumn, 'component[0].componentType') === 'dummy') return;
    removeClass({ classNames: 'resize-container,mouse,active,dragging' });
    if (clickedColumn.component && clickedColumn.component.length > 0) {
      const { columnUid } = clickedColumn;
      addClass({ id: columnUid, classNames: 'resize-container' });
      setComponentSource(columnUid);
    }
  };

  const onMouseOver = (event, clickedColumn) => {
    event.stopPropagation();
    if (get(clickedColumn, 'component[0].componentType') === 'dummy') return;
    removeClass({ classNames: 'resize-container,mouse,active,dragging' });
    if (clickedColumn.component && clickedColumn.component.length > 0) {
      const { columnUid } = clickedColumn;
      addClass({ id: columnUid, classNames: 'resize-container' });
    }
  };

  const onMouseDown = (event) => {
    event.stopPropagation();
    const { clientX, clientY } = event;
    const original = {
      clientX,
      clientY,
    };
    setDraggingDirection({ ...draggingDirection, original });
  };

  return column.map((col) => {
    const { component = [], columnStyle, columnUid } = col;
    const escapeId = CSS.escape(columnUid);
    return (
      <EditorPopoverComponent
        id={columnUid}
        open={
          columnUid === componentSource &&
          !isDragging &&
          !productModalVisible &&
          !categoryModalVisible &&
          !modalVisible &&
          !buttonModalVisible &&
          !embedModalVisible &&
          !videoModalVisible &&
          !imageActionModal &&
          !imageModal &&
          !editCarousel &&
          get(component, '[0].componentType') !== 'dummy'
        }
        key={`editor-popover-column-${columnUid}`}
        componentType="column"
      >
        <div
          style={{
            border:
              componentSource === columnUid
                ? '2px solid blue'
                : '2px solid transparent',
            ...columnStyle,
            zIndex: find(
              component,
              (comp) => comp.componentUid === componentSource
            )
              ? 4
              : 3,
          }}
          draggable
          onDragStart={(event) =>
            onDragStartHandlerColumn({ event, isFor: 'column' })
          }
          key={columnUid}
          onDrag={(event) => onDragHandlerColumn({ event, isFor: 'column' })}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={(event) =>
            onDragEndHandlerColumn({ event, isFor: 'column' })
          }
          onDragLeave={onDragLeave}
          onMouseEnter={(event) => onMouseOver(event, col)}
          onClick={(event) => onClick(event, col)}
          onMouseDown={onMouseDown}
          id={columnUid}
          className={`draggable ${
            columnUid === componentSource ? 'resize-container click' : ''
          }`}
          data-component-type={type}
          aria-hidden="true"
        >
          {component.length > 0 && (
            <div
              style={{
                width: '100%',
              }}
            >
              <Component
                component={component}
                key={`component--column-${columnUid}`}
              />
            </div>
          )}
          {componentSource === columnUid &&
            get(component, '[0].componentType') !== 'dummy' && (
              <>
                <div
                  className="drag"
                  draggable="true"
                  id="right-div"
                  key="right-div"
                  onDragStart={(event) =>
                    onDragStartHandlerColumn({ event, isFor: 'right' })
                  }
                  onDrag={(event) =>
                    onDragHandlerColumn({ event, isFor: 'right' })
                  }
                  onDragEnd={(event) => {
                    onDragEndHandlerColumn({ event, isFor: 'right' });
                  }}
                  style={{
                    position: 'absolute',
                    borderRadius: '50%',
                    top: `${
                      document.querySelector(`#${escapeId}`).offsetHeight / 2 -
                      10
                    }px`,
                    left: `${
                      -13 + document.querySelector(`#${escapeId}`).offsetWidth
                    }px`,
                    zIndex: 6,
                    cursor: 'ew-resize',
                    width: '10px',
                    height: '10px',
                  }}
                >
                  <ColumnWidthOutlined style={{ fontSize: '23px' }} />
                </div>
                <div
                  className="drag"
                  draggable="true"
                  key="left-div"
                  id="left-div"
                  onDragStart={(event) =>
                    onDragStartHandlerColumn({ event, isFor: 'left' })
                  }
                  onDrag={(event) =>
                    onDragHandlerColumn({ event, isFor: 'left' })
                  }
                  onDragEnd={(event) =>
                    onDragEndHandlerColumn({ event, isFor: 'left' })
                  }
                  style={{
                    position: 'absolute',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    cursor: 'ew-resize',
                    top: `${
                      document.querySelector(`#${escapeId}`).offsetHeight / 2 -
                      10
                    }px`,
                    left: '-13px',
                    zIndex: 6,
                  }}
                >
                  <ColumnWidthOutlined style={{ fontSize: '23px' }} />
                </div>
              </>
            )}
        </div>
      </EditorPopoverComponent>
    );
  });
};
export default ColumnComponent;
