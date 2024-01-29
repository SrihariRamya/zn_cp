/* eslint-disable unicorn/prefer-query-selector */
/* eslint-disable no-use-before-define */
import { v4 as uuid } from 'uuid';

export const defaultThemes = [
  {
    themeName: 'Level',
    primaryColor: '#0000006D',
    colors: [
      '#0000006D',
      '#FFE0CF',
      '#E7E7E7AF',
      '#C3E3FF',
      '#FFFFFF',
      '#FF9999',
      '#C3FFC7',
    ],
    fonts: {
      fonstFamily: 'Euclid Circular A',
      weight: 'medium',
      size: '26px',
    },
  },
  {
    themeName: 'Classy',
    primaryColor: '#FFE0CF',
    colors: [
      '#0000006D',
      '#E7E7E7AF',
      '#FFE0CF',
      '#FFFFFF',
      '#C3E3FF',
      '#FF9999',
      '#C3FFC7',
    ],
    fonts: {
      fonstFamily: 'Euclid Circular A',
      weight: 'medium',
      size: '26px',
    },
  },
  {
    themeName: 'Magnificent',
    primaryColor: '#E7E7E7AF',
    colors: [
      '#0000006D',
      '#FFE0CF',
      '#E7E7E7AF',
      '#C3E3FF',
      '#FFFFFF',
      '#FF9999',
      '#C3FFC7',
    ],
    fonts: {
      fonstFamily: 'Euclid Circular A',
      weight: 'medium',
      size: '26px',
    },
  },
  {
    themeName: 'Peaceful',
    primaryColor: '#C3E3FF',
    colors: [
      '#0000006D',
      '#FFE0CF',
      '#E7E7E7AF',
      '#C3E3FF',
      '#FFFFFF',
      '#FF9999',
      '#C3FFC7',
    ],
    fonts: {
      fonstFamily: 'Euclid Circular A',
      weight: 'medium',
      size: '26px',
    },
  },
  {
    themeName: 'OPTIMISTIC',
    primaryColor: '#FFFFFF',
    colors: [
      '#0000006D',
      '#FFE0CF',
      '#E7E7E7AF',
      '#C3E3FF',
      '#FFFFFF',
      '#FF9999',
      '#C3FFC7',
    ],
    fonts: {
      fonstFamily: 'Euclid Circular A',
      weight: 'medium',
      size: '26px',
    },
  },
  {
    themeName: 'Pleasant',
    primaryColor: '#FF9999',
    colors: [
      '#0000006D',
      '#FFE0CF',
      '#E7E7E7AF',
      '#C3E3FF',
      '#FFFFFF',
      '#FF9999',
      '#C3FFC7',
    ],
    fonts: {
      fonstFamily: 'Euclid Circular A',
      weight: 'medium',
      size: '26px',
    },
  },
  {
    themeName: 'Excellent',
    primaryColor: '#C3FFC7',
    colors: [
      '#0000006D',
      '#FFE0CF',
      '#E7E7E7AF',
      '#C3E3FF',
      '#FFFFFF',
      '#FF9999',
      '#C3FFC7',
    ],
    fonts: {
      fonstFamily: 'Euclid Circular A',
      weight: 'medium',
      size: '26px',
    },
  },
];
export const ComponentJson = (type) => {
  return {
    componentType: type,
    componentStyle: {
      width: '100%',
      padding: '1% 3%',
    },
    componentUid: uuid(),
    componentProperties: {},
  };
};

export const ColumnJson = (type) => {
  const columnUid = uuid();
  const componentData = ComponentJson(type);
  componentData.parentUid = uuid();
  return {
    columnUid,
    columnStyle: {
      width: '100%',
      padding: '1% 3%',
    },
    columnProperties: {},
    component: type ? [componentData] : [],
  };
};

export const componentInitialJson = () => {
  const rowUid = uuid();
  const rowJsonText = RowJson('text');
  rowJsonText.parentUid = rowUid;
  return {
    globalProperties: {
      theme: defaultThemes[0],
    },
    globalStyles: {
      width: '100%',
      margin: '0 auto',
      background: 'white',
    },
    row: [RowJson('text')],
  };
};

export const removeClass = ({ id = '', classNames }) => {
  if (classNames) {
    const classes = classNames.split(',').filter(Boolean);
    // eslint-disable-next-line no-restricted-syntax
    for (const className of classes) {
      const cls = className.trim();
      if (id) {
        const escapeId = CSS.escape(id);
        const element = document.querySelector(`#${escapeId}`);
        element.classList.remove(cls);
      } else {
        const activeClasses = document.querySelectorAll(`.${cls}`);
        // eslint-disable-next-line no-restricted-syntax
        for (const activeClass of activeClasses)
          activeClass.classList.remove(cls);
      }
    }
  }
};

export const addClass = ({ id, classNames }) => {
  if (id && classNames) {
    const elemnent = document.getElementById(id);
    const classes = classNames.split(',').filter(Boolean);
    if (elemnent && classes.length > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const className of classes) {
        const cls = className.trim();
        if (!elemnent.classList.contains(cls)) {
          elemnent.classList.add(cls);
        }
      }
    }
  }
};

export const RowJson = (type) => {
  const rowUid = uuid();
  const columnJsonWithType = ColumnJson(type);
  columnJsonWithType.parentUid = rowUid;
  const columnJsonWithoutType = ColumnJson();
  columnJsonWithoutType.parentUid = rowUid;
  return {
    rowUid,
    rowStyle: {
      display: 'flex',
      position: 'relative',
      padding: '10px',
      margin: '8px 0',
    },
    rowProperties: {
      width: '100%',
      columnGap: false,
      margin: '0 auto',
    },
    column: [type ? columnJsonWithType : columnJsonWithoutType],
  };
};

export const initialPosition = {
  x: 0,
  y: 0,
  d: 'down',
};

export const setParentId = (row) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const column of row.column) {
    column.parentUid = row.rowUid;
    if (column.component && column.component.length > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const component of column.component) {
        component.parentUid = column.columnUid;
        if (component.componentType === 'image') {
          component.componentStyle.height = '300px';
        }
      }
    }
  }
  return row;
};

export const removeElementPlacingIndicator = () => {
  const elements = document.querySelectorAll('.position');
  if (elements.length > 0) {
    // eslint-disable-next-line no-restricted-syntax
    for (const element of elements) {
      if (element) {
        element.remove();
      }
    }
  }
};

export const elementPlacingIndicator = (id, position) => {
  removeElementPlacingIndicator();
  const targetElement = document.getElementById(id);
  if (targetElement) {
    targetElement.insertAdjacentHTML(
      'beforeend',
      `<div id="${id}_placement" class="position ${position} active"></div>`
    );
  }
};
