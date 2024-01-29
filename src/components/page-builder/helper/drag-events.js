/* eslint-disable consistent-return */
// eslint-disable-next-line import/no-cycle
import { get, has, reduce } from 'lodash';
// eslint-disable-next-line import/no-cycle
import {
  addClass,
  elementPlacingIndicator,
  removeClass,
  removeElementPlacingIndicator,
} from './index';

export const handleOnDragStart = ({ event }) => {
  event.stopPropagation();
  removeClass({ classNames: 'dragging' });
  const { target } = event;
  const {
    id: targetId,
    dataset: { componentType },
  } = target;
  const id = targetId.split('_')[0];

  if (!id || !componentType) return;
  addClass({ id, classNames: 'resize-container,mouse' });
  return {
    id,
    componentType,
  };
};

// eslint-disable-next-line no-unused-vars
export const handleDragEnd = ({ _event }) => {
  removeClass({ classNames: 'dragging,resize-container,mouse' });
};

const isSameParent = (componentValues, id, componentSource) => {
  const found = componentValues.row.some((row) => {
    if (row.column || []) {
      return row.column.some((column) => {
        if (
          row.rowUid === id &&
          (row.column.length === 1 || column.component.length === 1) &&
          (row.column.some((col) => col.columnUid === componentSource) ||
            column.component.some(
              (component) => component.componentUid === componentSource
            ))
        ) {
          return true;
        }

        return (
          (column.component || []).some((component) => {
            return (
              (component.componentUid === id &&
                component.parentUid === componentSource) ||
              (component.componentUid === componentSource &&
                component.parentUid === id &&
                column.component.length === 1)
            );
          }) || false
        );
      });
    }
    return false;
  });
  return !!found;
};

const findClosesElement = (element) => {
  let currentElement = element;
  while (currentElement) {
    if (Object.hasOwn(currentElement.dataset, 'componentType')) {
      return currentElement;
    }
    currentElement = currentElement.parentElement;
  }
};

export const handleOnDragOver = ({
  event,
  componentSource,
  componentValues,
  draggingDirection = '',
}) => {
  event.preventDefault();
  event.stopPropagation();
  const { clientX, clientY } = event;

  const { target } = event;
  if (!target) return;
  let {
    id: targetId,
    dataset: { componentType },
  } = target;
  if (!targetId && target) {
    const closest = findClosesElement(target);
    const {
      id: closestId,
      dataset: { componentType: type },
    } = closest;
    targetId = closestId;
    componentType = type;
  }

  const id = targetId.split('_')[0];
  if (
    !componentSource ||
    !componentType ||
    !componentValues.row ||
    id === componentSource
  )
    return;
  addClass({ id, classNames: 'resize-container,mouse' });
  if (componentValues && isSameParent(componentValues, id, componentSource))
    return;
  if (draggingDirection?.current) {
    const {
      current: { x, y },
    } = draggingDirection;
    if (x === clientX && y === clientY) return;
  }

  removeClass({ classNames: 'active,dragging' });
  const escapeSource = CSS.escape(componentSource);
  const sourceElement = document.querySelector(`#${escapeSource}`);
  if (!sourceElement) return;
  const {
    dataset: { componentType: sourceComponentType },
  } = sourceElement;
  if (
    !sourceComponentType ||
    (sourceComponentType === 'row' && componentType !== 'row')
  ) {
    removeClass({ classNames: 'active,dragging' });
    return;
  }
  const escapeTarget = CSS.escape(id);
  const targetElement = document.querySelector(`#${escapeTarget}`);
  const closest = findClosesElement(targetElement);

  if (closest) {
    const {
      dataset: { componentType: type = '' },
    } = closest;
    const boundingRect = closest.getBoundingClientRect();
    const itemCenterX = boundingRect.left + boundingRect.width / 2;
    const itemCenterY = boundingRect.top + boundingRect.height / 2;
    const isCursorAboveHalfWidth = event.clientX >= itemCenterX;
    const isCursorAboveHalfHeight = event.clientY >= itemCenterY;
    if (type === 'row') {
      if (isCursorAboveHalfHeight) {
        elementPlacingIndicator(id, 'down');
        return {
          x: clientX,
          y: clientY,
          d: 'down',
        };
      }
      elementPlacingIndicator(id, 'up');
      return {
        x: clientX,
        y: clientY,
        d: 'up',
      };
    }
    if (type === 'column' && draggingDirection && draggingDirection.current) {
      let direction = '';
      const {
        current: { x, y },
      } = draggingDirection;

      if (clientX < x) {
        direction = 'left';
      } else if (clientX > x) {
        direction = 'right';
      } else if (clientY < y) {
        direction = 'down';
      } else if (clientY > y) {
        direction = 'up';
      }

      if (direction === 'right' || direction === 'left') {
        if (isCursorAboveHalfWidth) {
          elementPlacingIndicator(id, 'right');
          return {
            x: clientX,
            y: clientY,
            d: 'right',
          };
        }
        elementPlacingIndicator(id, 'left');
        return {
          x: clientX,
          y: clientY,
          d: 'left',
        };
      }
      if (direction === 'up' || direction === 'down') {
        if (isCursorAboveHalfHeight) {
          elementPlacingIndicator(id, 'down');
          return {
            x: clientX,
            y: clientY,
            d: 'down',
          };
        }
        elementPlacingIndicator(id, 'up');
        return {
          x: clientX,
          y: clientY,
          d: 'up',
        };
      }
    } else if (type === 'component') {
      elementPlacingIndicator(id, 'down');
      return {
        x: clientX,
        y: clientY,
        d: 'down',
      };
    }
  }
  removeClass({ classNames: 'active,dragging' });
};

export const handleOnDrop = ({
  event,
  componentType,
  componentSource = '',
  componentValues = '',
}) => {
  event.preventDefault();
  event.stopPropagation();
  const { target } = event;
  let { id: targetId } = target;
  if (!targetId) {
    const closest = findClosesElement(target);
    const { id } = closest;
    targetId = id;
  }
  const id = targetId.split('_')[0];

  if (
    componentType !== 'row' &&
    componentValues &&
    componentSource &&
    isSameParent(componentValues, id, componentSource)
  )
    return;
  const escapeElement = CSS.escape(id);
  const element = document.querySelector(`#${escapeElement}`);
  const { dataset } = element;

  if (dataset && componentType === 'row' && dataset.componentType !== 'row') {
    return;
  }

  return id;
};

export const handleDragLeave = ({ event, componentSource }) => {
  event.stopPropagation();
  event.preventDefault();
  const { target } = event;
  if (target) {
    const { id } = target;
    if (id && id !== componentSource) {
      removeClass({ id, classNames: 'resize-container' });
    }
    removeElementPlacingIndicator();
  }
};

export const convertPercentageToPx = (rowUid, percentage, type) => {
  // eslint-disable-next-line unicorn/prefer-query-selector
  const totalWidth = document.getElementById(`${rowUid}-grid-row`)?.offsetWidth;
  if (type === 'number')
    return (totalWidth * Number(percentage.replace('%', ''))) / 100;
  return `${(totalWidth * Number(percentage.replace('%', ''))) / 100}px`;
};

export const convertPxToPercentage = (rowUid, px, type) => {
  // eslint-disable-next-line unicorn/prefer-query-selector
  const totalWidth = document.getElementById(`${rowUid}-grid-row`)?.offsetWidth;
  if (type === 'number') return (Math.abs(px) * 100) / totalWidth;
  return `${(Math.abs(px) * 100) / totalWidth}%`;
};

export const checkComponentType = (object) => {
  if (has(object, 'column')) return 'row';
  if (has(object, 'component')) return 'column';
  if (has(object, 'componentType')) return 'component';
  return '';
};

export const checkTotalWidth = (row) => {
  const InitialValue = 0;
  const finalValue = reduce(
    row,
    (previous, current) => {
      return Number(current.columnStyle.width.replace('%', '')) + previous;
    },
    InitialValue
  );
  if (finalValue === 100) return true;
  return false;
};

export const getColumnDetail = (escapeRowUid) => {
  const rowWidth = get(
    document.querySelector(`#${escapeRowUid}-grid-row`),
    'offsetWidth'
  );
  const WidthList = [];
  const arrayList = Array.from({ length: 12 }).fill(0);
  arrayList.map((_item, index) => {
    WidthList.push({
      inPx: (rowWidth / 12) * (index + 1),
      index: index + 1,
      inPercentage: `${(((rowWidth / 12) * (index + 1)) / rowWidth) * 100}%`,
    });
    return _item;
  });
  return WidthList;
};

export const handleResizeEnd = (
  columnUid,
  direction,
  column,
  nextSiblingColumn
) => {
  const previousColumnWidth =
    get(nextSiblingColumn, 'component[0].componentType') === 'dummy'
      ? `${
          Number(get(column, 'columnStyle.width')?.replace('%', '')) +
          Number(get(nextSiblingColumn, 'columnStyle.width')?.replace('%', ''))
        }%`
      : get(column, 'columnStyle.width');
  let element;
  const escapeColumn = CSS.escape(columnUid);
  const escapeRowUid = CSS.escape(get(column, 'parentUid'));
  const resizeWidth = document.querySelector(`#${escapeColumn}`)?.offsetWidth;
  if (direction === 'left') {
    element = document.querySelector(`#${escapeColumn}`).previousElementSibling;
  } else if (direction === 'right') {
    element = document.querySelector(`#${escapeColumn}`).nextElementSibling;
  }
  const rowWidth = document.querySelector(
    `#${escapeRowUid}-grid-row`
  )?.offsetWidth;
  const WidthList = [];
  const arrayList = Array.from({ length: 12 }).fill(0);
  arrayList.map((_item, index) => {
    WidthList.push({
      inPx: (rowWidth / 12) * (index + 1),
      index: index + 1,
      inPercentage: `${(((rowWidth / 12) * (index + 1)) / rowWidth) * 100}%`,
    });
    return _item;
  });
  const optimizedWidth = WidthList.find((item) => {
    const halfWidth = get(WidthList, '[0].inPx') / 2;
    if (resizeWidth < get(item, 'inPx') + halfWidth) return item;
    return false;
  });
  let elementWidthPercentage = `${
    Number(previousColumnWidth.replace('%', '')) -
    Number(optimizedWidth?.inPercentage?.replace('%', ''))
  }%`;
  const getSingleColumnWidth = get(
    getColumnDetail(escapeRowUid),
    '[0].inPercentage'
  );
  if (
    Number(Number(getSingleColumnWidth.replace('%', '')).toFixed(2)) >
    Number(Number(elementWidthPercentage.replace('%', '')).toFixed(2))
  ) {
    elementWidthPercentage = '0%';
  }
  if (elementWidthPercentage === '0%') {
    element?.remove();
    document.querySelector(`#${escapeColumn}`).style.width =
      optimizedWidth?.inPercentage;
  }
  document.querySelector(`#${escapeColumn}`).style.background = get(
    column,
    'columnStyle.background',
    ''
  );
  return {
    width: optimizedWidth?.inPercentage,
    [`${direction}`]: elementWidthPercentage,
    widthInPx: optimizedWidth?.inPx,
  };
};
