import React from 'react';
import { map } from 'lodash';
import ColumnComponent from './column-component';
import { useComponentContext } from '../context/components';
import {
  addClass,
  handleDragEnd,
  handleDragLeave,
  handleOnDragOver,
  handleOnDragStart,
  handleOnDrop,
  removeClass,
} from '../helper';
import EditorPopoverComponent from './editor-popover-component';

const RowComponent = ({ row }) => {
  const {
    setDraggingDirection,
    draggingDirection,
    updateComponentJsonAfterDND,
    componentSource,
    setComponentSource,
    setComponentType,
    componentType,
    componentValues,
    isDragging,
    setIsDragging,
    productModalVisible,
    modalVisible,
    buttonModalVisible,
    embedModalVisible,
    videoModalVisible,
    imageActionModal,
    imageModal,
    categoryModalVisible,
    editCarousel,
  } = useComponentContext();

  const onDragStart = (event) => {
    setIsDragging(true);
    const values = handleOnDragStart({ event });
    if (values) {
      const { id, componentType: rowType } = values;
      setComponentSource(id);
      setComponentType(rowType);
    }
  };

  const onDragOver = (event) => {
    if (
      !componentSource ||
      !componentType ||
      !componentValues ||
      !draggingDirection
    )
      return;
    const position = handleOnDragOver({
      event,
      componentSource,
      componentValues,
    });
    if (position) {
      setDraggingDirection({ ...draggingDirection, current: position });
    }
  };

  const onDrop = (event) => {
    if (!componentSource || !componentType || !draggingDirection) return;
    const id = handleOnDrop({ event, componentType, componentSource });
    if (!id) return;
    const values = {
      source: componentSource,
      target: id,
    };
    updateComponentJsonAfterDND({ ...values });
  };

  const onDragEnd = (event) => {
    handleDragEnd(event);
    setIsDragging(false);
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const onDragLeave = (event) => {
    handleDragLeave({ event, componentSource });
  };

  const onClick = (event, clickedRow) => {
    event.preventDefault();
    event.stopPropagation();
    removeClass({ classNames: 'resize-container,mouse,active,dragging' });
    const { rowUid } = clickedRow;
    setComponentSource(rowUid);
    addClass({ id: rowUid, classNames: 'resize-container' });
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

  return map(row, (rowItem, index) => {
    const { rowUid, rowStyle, column = [], rowProperties } = rowItem;
    const rowIndex = `${rowUid}_${index}`;
    const getQuerySelectorWidth = document.querySelector(
      `#${CSS.escape(`${rowUid}_${index}`)}`
    )?.offsetWidth;
    const rowWidth = getQuerySelectorWidth / 12;
    return (
      <EditorPopoverComponent
        id={rowUid}
        componentType="row"
        key={`edit-popover-row-${rowUid}`}
        open={
          rowUid === componentSource &&
          !isDragging &&
          !productModalVisible &&
          !modalVisible &&
          !buttonModalVisible &&
          !embedModalVisible &&
          !videoModalVisible &&
          !imageActionModal &&
          !imageModal &&
          !categoryModalVisible &&
          !editCarousel
        }
      >
        <div
          style={{
            display: 'flex',
            alignContent: 'center',
            justifyContent: 'center',
            border: '2px solid violet',
            padding: rowProperties.padding,
            ...rowStyle,
            width: '100%',
          }}
          id={rowUid}
          className={`draggable ${
            rowUid === componentSource ? 'resize-container click' : ''
          }`}
          draggable
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          onDragLeave={onDragLeave}
          onClick={(event) => onClick(event, rowItem)}
          onMouseDown={onMouseDown}
          data-component-type="row"
          aria-hidden="true"
        >
          <div
            id={`${rowUid}_${index}`}
            style={{
              width: rowProperties.width,
              margin: rowProperties.margin,
              display: 'flex',
              border: '2px solid transparent',
            }}
          >
            {column.length > 0 && (
              <ColumnComponent
                column={column}
                row={row}
                key={`column-${rowUid}`}
              />
            )}
          </div>
          {isDragging && (
            <div
              id={`${rowUid}-grid-row`}
              key={`${rowUid}-grid-row`}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(12, ${
                  rowProperties.columnGap ? rowWidth - 9.16 : rowWidth
                }px)`,
                columnGap: (rowProperties.columnGap || false) && '10px',
                position: 'absolute',
              }}
            >
              {Array.from({ length: 12 }, (_, index_) => index_).map((item) => {
                return (
                  <div
                    key={`${rowIndex}_${item}`}
                    style={{
                      border: '1px dotted green',
                      height: `${
                        document.querySelector(`#${CSS.escape(rowIndex)}`)
                          ?.offsetHeight
                      }px`,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </EditorPopoverComponent>
    );
  });
};

export default RowComponent;
