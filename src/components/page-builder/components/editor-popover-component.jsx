import { v4 as uuid } from 'uuid';
import React, { useEffect, useState } from 'react';
import { Button, Popover, Slider } from 'antd';
import { cloneDeep, filter, find, get, map } from 'lodash';
import {
  SettingOutlined,
  CompressOutlined,
  ColumnWidthOutlined,
} from '@ant-design/icons';
import { useComponentContext } from '../context/components';
import { addClass } from '../helper';
import Copy from '../assets/svg/Copy.svg';
import Delete from '../assets/svg/Delete.svg';
import Color from '../assets/svg/Color.svg';

const placement = (type) => {
  if (type === 'row') {
    return 'topLeft';
  }
  if (type === 'column') {
    return 'top';
  }
  const componentTypeParts = type.split('_');
  if (
    componentTypeParts[0] === 'text' ||
    componentTypeParts[0] === 'product' ||
    componentTypeParts[0] === 'category' ||
    componentTypeParts[0] === 'image'
  ) {
    return 'left';
  }
  return '';
};

const cloneComponent = (component, parentUid) => {
  const newComponent = cloneDeep(component);
  newComponent.componentUid = uuid();
  newComponent.parentUid = parentUid;
  return newComponent;
};

const cloneColumn = (column, parentUid) => {
  const newColumn = cloneDeep(column);
  newColumn.columnUid = uuid();
  newColumn.parentUid = parentUid;
  if (newColumn.component && newColumn.component.length > 0) {
    newColumn.component = newColumn.component.map((component) =>
      cloneComponent(component, newColumn.columnUid)
    );
  }
  return newColumn;
};

const cloneRow = (row) => {
  const newRow = cloneDeep(row);
  newRow.rowUid = uuid();
  if (newRow.column && newRow.column.length > 0) {
    newRow.column = newRow.column.map((column) =>
      cloneColumn(column, newRow.rowUid)
    );
  }
  return newRow;
};

const copyComponentIfMatch = (component, id) => {
  if (component.componentUid === id) {
    return [component, cloneComponent(component, component.parentUid)];
  }
  return component;
};

const copyColumnIfMatch = (column, id) => {
  if (column.columnUid === id) {
    return cloneColumn(column, column.parentUid);
  }

  if (column.component && column.component.length > 0) {
    const changedComponents = column.component.map((component) =>
      copyComponentIfMatch(component, id)
    );
    column.component = changedComponents.flat();
  }

  return column;
};

const copyRowIfMatch = (row, id) => {
  if (row.rowUid === id) {
    return [cloneRow(row), row];
  }

  if (row.column && row.column.length > 0) {
    const changedColumns = row.column.map((column) =>
      copyColumnIfMatch(column, id)
    );
    row.column = changedColumns;
  }

  return row;
};

function EditorPopoverComponent(properties) {
  const { children, id, componentType, open } = properties;
  const {
    componentValues,
    updateComponentState,
    updateComponentStyle,
    setScrollToBottom,
    updateComponentProperties,
  } = useComponentContext();
  const [color, setColor] = useState();
  const [widthValue, setWidthValue] = useState(
    get(
      find(componentValues.row, (list) => list.rowUid === id),
      'rowProperties.width'
    )
  );

  const handleCopy = () => {
    const newComponentValues = {
      ...componentValues,
      row: componentValues.row.flatMap((row) => copyRowIfMatch(row, id)),
    };

    updateComponentState(newComponentValues);
    setScrollToBottom(true);
  };

  const handleDelete = () => {
    const newComponentValues = cloneDeep(componentValues);

    newComponentValues.row = newComponentValues.row.filter(
      (row) => row.rowUid !== id
    );

    // eslint-disable-next-line unicorn/no-array-for-each
    newComponentValues.row.forEach((row) => {
      if (row.column && row.column.length > 0) {
        row.column = row.column.filter((column) => column.columnUid !== id);

        // eslint-disable-next-line unicorn/no-array-for-each
        row.column.forEach((column) => {
          if (column.component && column.component.length > 0) {
            const componentArray = get(column, 'component');
            componentArray.map((item) => {
              if (item.componentType === 'image' && item.componentUid === id) {
                item.componentProperties.value = '';
                item.componentProperties.file = '';
                item.componentProperties.action = '';
              }
              return item;
            });
            const filterArray = filter(
              componentArray,
              (item) =>
                item.componentUid !== id || item.componentType === 'image'
            );
            column.component = filterArray;
          }
        });

        row.column = row.column.filter((column) => column.component.length > 0);
        row.column.map((item) => {
          item.columnStyle.width = `${100 / row.column.length}%`;
          return item;
        });
      }
    });

    newComponentValues.row = newComponentValues.row.filter(
      (row) => row.column.length > 0
    );
    updateComponentState(newComponentValues);
  };

  // eslint-disable-next-line consistent-return
  const colorContent = () => {
    const {
      globalProperties: { theme },
    } = componentValues;
    if (theme) {
      const { colors = [] } = theme;
      return (
        <div style={{ width: '100%' }}>
          {colors.map((clr, index) => {
            return (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  height: '48px',
                  position: 'relative',
                  cursor: 'pointer',
                  userSelect: 'none',
                  backgroundColor: color && color === clr ? color : undefined,
                }}
                key={clr}
                onClick={(event) => {
                  event.stopPropagation();
                  setColor(clr);
                }}
              >
                <span
                  style={{
                    display: 'flex',
                  }}
                >
                  <span
                    style={{
                      backgroundColor: clr,
                      color: 'rgba(33,33,33,1)',
                      borderRadius: '3px',
                      border: '1px solid rgba(0,0,0,.12)',
                      display: 'inline-block',
                      height: '24px',
                      position: 'relative',
                      textAlign: 'center',
                      width: '30px',
                      marginRight: '32px',
                    }}
                  >
                    A
                  </span>
                  <span style={{ color: 'rgba(33,33,33,1)' }}>
                    Style {index + 1}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      );
    }
  };

  const handleChangeWidth = (data) => {
    const result = data === '' ? 100 : data;
    setWidthValue(`${result}%`);
  };

  const handlePageWidth = () => {
    return (
      <div>
        Row width
        <div>
          <Slider
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
            value={Number(widthValue?.replace('%', ''))}
            min={80}
            max={100}
            marks={{
              80: '80',
              85: '85',
              90: '90',
              95: '95',
            }}
            onChange={(data) => handleChangeWidth(data)}
          />
        </div>
      </div>
    );
  };

  const handleObjectFit = async () => {
    const newComponentValues = cloneDeep(componentValues);
    const getComponentWidth = document.querySelector(
      `#${CSS.escape(id)}`
    )?.offsetWidth;
    await new Promise((resolve, reject) => {
      try {
        map(newComponentValues.row, (row) => {
          map(row.column, (column) => {
            map(column.component, (component) => {
              if (component.componentUid === id) {
                const img = document.createElement('img');
                img.src = get(component, 'componentProperties.value');
                img.addEventListener('load', () => {
                  const getImageHeight =
                    getComponentWidth /
                    (get(img, 'width', 1) / get(img, 'height', 1));
                  component.componentStyle.height = `${getImageHeight}px`;
                  resolve();
                });
              }
              return component;
            });
            return column;
          });
          return row;
        });
      } catch (error) {
        reject(error);
      }
    });
    updateComponentState(newComponentValues);
  };

  const handleClick = (event, type) => {
    event.stopPropagation();
    switch (type) {
      case 'copy': {
        handleCopy();
        break;
      }
      case 'delete': {
        handleDelete();
        break;
      }
      case 'object-fit': {
        handleObjectFit();
        break;
      }
      default: {
        break;
      }
    }
  };

  useEffect(() => {
    if (open) {
      addClass({ id, classNames: 'resize-container,click' });
    }
  }, [id, open]);

  useEffect(() => {
    if (color) {
      updateComponentStyle({ id, key: 'backgroundColor', value: color });
    }
  }, [color, id]);

  useEffect(() => {
    if (widthValue) {
      updateComponentStyle({ id, key: 'width', value: widthValue });
    }
  }, [widthValue, id]);

  const content = (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        flexDirection:
          (componentType.split('_')[0] === 'product' ||
            componentType.split('_')[0] === 'category') &&
          'column',
      }}
      key={id}
      className="editor-popover"
    >
      <Button onClick={(event) => handleClick(event, 'copy')}>
        <img style={{ height: '100%', width: '100%' }} src={Copy} alt="Copy" />
      </Button>
      <Button onClick={(event) => handleClick(event, 'delete')}>
        <img
          style={{ height: '100%', width: '100%' }}
          src={Delete}
          alt="Delete"
        />
      </Button>
      {componentType.split('_')[0] !== 'image' &&
        componentType.split('_')[0] !== 'text' && (
          <Popover content={colorContent} trigger="click">
            <Button onClick={(event) => handleClick(event, 'color')}>
              <img
                style={{ height: '100%', width: '100%' }}
                src={Color}
                alt="Color"
              />
            </Button>
          </Popover>
        )}
      {componentType === 'row' && (
        <Popover content={handlePageWidth} trigger="click" id="row-width">
          <Button>
            <ColumnWidthOutlined />
          </Button>
        </Popover>
      )}
      {(componentType.split('_')[0] === 'product' ||
        componentType.split('_')[0] === 'category' ||
        componentType.split('_')[0] === 'image' ||
        componentType.split('_')[0] === 'imageCarousel') && (
        <Button
          onClick={() => {
            updateComponentProperties(id);
          }}
        >
          <SettingOutlined />
        </Button>
      )}
      {componentType.split('_')[0] === 'image' && (
        <Button
          onClick={(event) => {
            handleClick(event, 'object-fit');
          }}
        >
          <CompressOutlined />
        </Button>
      )}
    </div>
  );
  return (
    <Popover
      content={content}
      placement={placement(componentType)}
      trigger="click"
      open={open}
    >
      {children}
    </Popover>
  );
}
export default EditorPopoverComponent;
