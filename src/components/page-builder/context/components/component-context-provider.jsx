import React, { useEffect, useState, useMemo } from 'react';
import { message, notification } from 'antd';
import { useParams } from 'react-router-dom';
import {
  cloneDeep,
  drop,
  dropRight,
  filter,
  find,
  findIndex,
  get,
  includes,
  isEmpty,
  isObject,
  map,
  remove,
} from 'lodash';
import { toJpeg } from 'html-to-image';
import { parseJSONSafely } from '../../../../shared/function-helper';
import {
  FAILED_TO_LOAD,
  PAGE_BULIDER_PATH,
} from '../../../../shared/constant-values';
import {
  getPageBuilder,
  createPageBuilder,
  updatePageBuilder,
} from '../../../../utils/api/url-helper';
import {
  ColumnJson,
  RowJson,
  addClass,
  checkComponentType,
  checkTotalWidth,
  removeClass,
} from '../../helper';
import ComponentContext from './component-context';
import UseUndoAbleState from './undo-rodo-component';

function dataURItoBlob(dataURI) {
  const binary = atob(dataURI.split(',')[1]);
  const array = [];
  for (let index = 0; index < binary.length; index += 1) {
    array.push(binary.codePointAt(index));
  }
  return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
}

// eslint-disable-next-line no-unused-vars
const maxWidthSet100 = (calculatedWidth) => {
  const replacePercentageInString = calculatedWidth.replace('%', '');
  const replacePercentage = Number(replacePercentageInString);
  if (replacePercentage > 100 && !includes(calculatedWidth, 'NaN')) {
    return '100%';
  }
  return calculatedWidth;
};

function ComponentContextProvider(properties) {
  const { id } = useParams();
  const children = get(properties, 'children');
  const {
    state: componentValues,
    setState: updateComponentState,
    resetState: resetComponentState,
    index: componentStateIndex,
    lastIndex: componentStateLastIndex,
    goBack: undoComponent,
    goForward: redoComponent,
  } = UseUndoAbleState();
  const [pageBuilderLoader, setPageBuilderLoader] = useState(true);
  const [componentSource, setComponentSource] = useState();
  const [componentType, setComponentType] = useState();
  const [draggingDirection, setDraggingDirection] = useState();
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [textEditorComponentId, setTextEditorComponentId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const [componentProperties, setComponentProperties] = useState({});
  const [productModalVisible, setProductModalVisible] = useState();
  const [categoryModalVisible, setCategoryModalVisible] = useState();
  const [isNewProductComponent, setIsNewProductComponent] = useState(false);
  const [defaultTemplate, setDefaultTemplate] = useState([]);
  const [pageList, setPageList] = useState([]);
  const [templateLoader, setTemplateLoader] = useState(false);
  const templateType = localStorage.getItem('templateType');
  const [modalVisible, setModalVisible] = useState(false);
  const [buttonModalVisible, setButtonModalVisible] = useState(false);
  const [embedModalVisible, setEmbedModalVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [editCarousel, setEditCarousel] = useState(false);
  const [imageActionModal, setImageActionModal] = useState(false);
  const [seoProperties, setSeoProperties] = useState({});
  const [imageModal, setImageModal] = useState(false);
  const [youTubeModalVisible, setYouTubeModalVisible] = useState(false);

  const fetchData = async () => {
    try {
      setPageBuilderLoader(true);
      const pageBuilderUidInRouter = id;
      if (pageBuilderUidInRouter) {
        const response = await getPageBuilder({
          page_uid: pageBuilderUidInRouter,
          document_path: PAGE_BULIDER_PATH,
        });
        const findPageBuilder = find(
          get(response, 'data.pages'),
          (item) => item.page_uid === pageBuilderUidInRouter
        );
        setSeoProperties(get(response, 'data.seoData', {}));
        if (findPageBuilder) {
          updateComponentState(get(findPageBuilder, 'page_json', ''));
        } else {
          const getPageBuilderDataFromJson =
            localStorage.getItem('templateJson');
          updateComponentState(
            await parseJSONSafely(getPageBuilderDataFromJson)
          );
        }
      } else {
        const response = await getPageBuilder({
          page_uid: '',
          document_path: PAGE_BULIDER_PATH,
        });
        const data = get(response, 'data.pages', []);
        const filterPageTemplate = filter(
          data,
          (item) => item.is_default !== 1
        );
        const filterDefaultTemplate = filter(
          data,
          (item) => item.is_default === 1
        );
        setDefaultTemplate(filterDefaultTemplate);
        setPageList(filterPageTemplate);
        setSeoProperties(get(response, 'data.seoData', {}));
      }
      setPageBuilderLoader(false);
    } catch (error) {
      notification.error({ message: get(error, message, FAILED_TO_LOAD) });
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (scrollToBottom) {
      window.scrollTo(0, document.body.scrollHeight);
      setScrollToBottom(false);
    }
  }, [componentValues, scrollToBottom]);

  const createOrUpdateContext = async (pageUid, publish) => {
    try {
      setPageBuilderLoader(true);
      const fileList = [];
      const captureDiv = document.querySelector('#capture');
      const elementsToHide = [
        '#save-div',
        '#right-div',
        '#left-div',
        '#bottom-div',
        '#youtube-video',
      ];

      map(elementsToHide, (selector) => {
        const element = captureDiv.querySelector(selector);
        if (element) {
          element.style.display = 'none';
        }
      });

      const screenShotBlob = await toJpeg(captureDiv, {
        quality: 0.95,
      })
        .then((dataUrl) => {
          return dataURItoBlob(dataUrl);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log('html to canvas screenshot error--->', error);
        });
      map(elementsToHide, (selector) => {
        const element = captureDiv.querySelector(selector);
        if (element && selector === '#save-div') {
          element.style.display = 'flex';
        } else if (element) {
          element.style.display = 'block';
        }
      });
      const screenShotFile =
        screenShotBlob &&
        new File([screenShotBlob], `screenshots`, {
          type: get(screenShotBlob, 'file.type', 'image/jpeg'),
        });
      fileList.push(screenShotFile);
      map(get(componentValues, 'row', []), (item, rowIndex) => {
        map(get(item, 'column', []), async (object, columnIndex) =>
          Promise.all(
            map(get(object, 'component', []), async (value, componentIndex) => {
              const returnItem = [];
              switch (value.componentType) {
                case 'image': {
                  const imageComponent = document.querySelector(
                    `#${CSS.escape(get(value, 'componentUid'))}_image`
                  );
                  const imageComponentOffsetWidth = get(
                    imageComponent,
                    'offsetWidth'
                  );
                  const imageComponentOffsetHeight = get(
                    imageComponent,
                    'offsetHeight'
                  );
                  value.componentProperties.offsetWidth =
                    imageComponentOffsetWidth;
                  value.componentProperties.offsetHeight =
                    imageComponentOffsetHeight;
                  if (value.componentProperties.file) {
                    returnItem.push(
                      new File(
                        [value.componentProperties.file],
                        `images|${rowIndex}-${columnIndex}-${componentIndex}`,
                        {
                          type: get(
                            value,
                            'componentProperties.file.type',
                            'image/jpeg'
                          ),
                        }
                      )
                    );
                    value.componentProperties.file = '';
                  }
                  break;
                }
                case 'video': {
                  if (value.componentProperties.file) {
                    returnItem.push(
                      new File(
                        [value.componentProperties.file],
                        `video|${rowIndex}-${columnIndex}-${componentIndex}`,
                        {
                          type: get(
                            value,
                            'componentProperties.file.type',
                            'video/mp4'
                          ),
                        }
                      )
                    );
                    value.componentProperties.file = '';
                  }
                  break;
                }
                case 'imageCarousel': {
                  const filterObject = filter(
                    get(value, 'componentProperties.value'),
                    (file) => isObject(file.file)
                  );
                  map(filterObject, (file, fileIndex) => {
                    returnItem.push(
                      new File(
                        [file?.file],
                        `image-carousel|${rowIndex}-${columnIndex}-${componentIndex}-${fileIndex}`,
                        {
                          type: get(value, 'item.type', 'image/jpeg'),
                        }
                      )
                    );
                    return file;
                  });
                  break;
                }
                default: {
                  break;
                }
              }
              fileList.push(...returnItem);
              return value;
            })
          )
        );
      });
      if (!isEmpty(get(seoProperties, 'file', []))) {
        const SeoFile = new File(
          [get(seoProperties, 'file[0].originFileObj', {})],
          `seo`,
          {
            type: get(
              seoProperties,
              'file[0].originFileObj.type',
              'image/jpeg'
            ),
          }
        );
        fileList.push(SeoFile || []);
        seoProperties.file = '';
      }
      if (templateType === 'update') {
        await updatePageBuilder(
          {
            page_uid: id,
            page_json: JSON.stringify(componentValues),
            publish,
            seoProperties,
          },
          { files: fileList }
        ).then(() => {
          notification.success({
            message: 'Page Builder Updated Successfully!',
          });
        });
      }
      if (templateType === 'create') {
        await createPageBuilder(
          {
            page: JSON.stringify([
              {
                page_json: JSON.stringify(componentValues),
                page_uid: id,
                publish,
              },
            ]),
            seoProperties,
          },
          {
            files: fileList,
          }
        ).then(() => {
          if (publish) {
            notification.success({
              message: 'Page Builder published successfully!',
            });
            localStorage.setItem('templateType', 'update');
          } else {
            notification.success({
              message: 'Page Builder Created successfully!',
            });
            localStorage.setItem('templateType', 'update');
          }
        });
      }
      await fetchData();
    } catch (error) {
      notification.error({
        message: get(
          error,
          'message',
          `Failed to create or update page builder!`
        ),
      });
      setPageBuilderLoader(false);
    }
  };

  const updateImageSource = ({ componentUid, value, file, action }) => {
    const newComponentValues = cloneDeep(componentValues);
    newComponentValues.row?.map((row) => {
      row.column?.map((column) => {
        column.component.map((component) => {
          if (component.componentUid === componentUid) {
            component.componentProperties.value = value;
            component.componentProperties.file = file;
            component.componentProperties.action = action;
          }
          return component;
        });
        return column;
      });
      return row;
    });
    updateComponentState(newComponentValues);
  };

  const resizeComponent = (size) => {
    setPageBuilderLoader(true);
    const { left = '', right = '' } = size;
    const newComponentValues = cloneDeep(componentValues);
    const findRowIndex = findIndex(get(newComponentValues, 'row'), (row) =>
      find(get(row, 'column'), (column) => column.columnUid === componentSource)
    );
    const getRowDetails = get(newComponentValues, `row[${findRowIndex}]`);
    const findColumnIndex = findIndex(
      get(getRowDetails, 'column'),
      (column) => column.columnUid === componentSource
    );
    const getColumnDetails = find(
      get(getRowDetails, 'column'),
      (column) => column.columnUid === componentSource
    );
    const findNextColumn = get(
      getRowDetails,
      `column[${findColumnIndex + 1}]`,
      {}
    );
    const findPreviousColumn = get(
      getRowDetails,
      `column[${findColumnIndex - 1}]`,
      {}
    );
    const newColumn = ColumnJson('dummy');
    newColumn.parentUid = get(getColumnDetails, 'parentUid');
    const splitRowDetailsLeft = filter(
      getRowDetails.column,
      (_item, index) => index < findColumnIndex
    );
    const splitRowDetailsRight = filter(
      getRowDetails.column,
      (_item, index) => index > findColumnIndex
    );
    if (
      left &&
      get(findPreviousColumn, 'component[0].componentType') !== 'dummy' &&
      left !== '0%'
    ) {
      newColumn.columnStyle.width = left;
      newColumn.columnUid = document.querySelector(
        `#${CSS.escape(get(getColumnDetails, 'columnUid'))}`
      )?.previousElementSibling?.id;
      getColumnDetails.columnStyle.width = get(size, 'width');
      newComponentValues.row[findRowIndex].column = [
        ...splitRowDetailsLeft,
        newColumn,
        getColumnDetails,
        ...splitRowDetailsRight,
      ];
      document
        .querySelector(`#${CSS.escape(get(getColumnDetails, 'columnUid'))}`)
        ?.previousElementSibling?.remove();
    } else if (
      left &&
      get(findPreviousColumn, 'component[0].componentType') === 'dummy'
    ) {
      getColumnDetails.columnStyle.width = get(size, 'width');
      findPreviousColumn.columnStyle.width = get(size, 'left');
      newComponentValues.row[findRowIndex].column = filter(
        [
          ...dropRight(splitRowDetailsLeft),
          findPreviousColumn,
          getColumnDetails,
          ...splitRowDetailsRight,
        ],
        (index) => index !== false
      );
    } else if (
      right &&
      get(findNextColumn, 'component[0].componentType') !== 'dummy' &&
      right !== '0%'
    ) {
      newColumn.columnStyle.width = right;
      newColumn.columnUid = document.querySelector(
        `#${CSS.escape(get(getColumnDetails, 'columnUid'))}`
      )?.nextElementSibling?.id;
      getColumnDetails.columnStyle.width = get(size, 'width');
      newComponentValues.row[findRowIndex].column = [
        ...splitRowDetailsLeft,
        getColumnDetails,
        newColumn,
        ...splitRowDetailsRight,
      ];
      document
        .querySelector(`#${CSS.escape(get(getColumnDetails, 'columnUid'))}`)
        ?.nextElementSibling?.remove();
    } else if (
      right &&
      get(findNextColumn, 'component[0].componentType') === 'dummy'
    ) {
      findNextColumn.columnStyle.width = get(size, 'right');
      getColumnDetails.columnStyle.width = get(size, 'width');
      newComponentValues.row[findRowIndex].column = filter(
        [
          ...splitRowDetailsLeft,
          getColumnDetails,
          findNextColumn,
          ...drop(splitRowDetailsRight),
        ],
        (index) => index !== false
      );
    }
    updateComponentState(newComponentValues);
    const rightDivPoint = document.querySelector('#right-div');
    rightDivPoint.style.left = `${get(size, 'widthInPx') - 10}px`;
    const bottomDivPoint = document.querySelector('#bottom-div');

    if (bottomDivPoint)
      bottomDivPoint.style.left = `${get(size, 'widthInPx') / 2 - 10}px`;
    map(get(newComponentValues, `row[${findRowIndex}].column`), (column) => {
      if (
        !isEmpty(
          document.querySelector(`#${CSS.escape(get(column, 'columnUid'))}`)
            ?.style?.width
        )
      ) {
        document.querySelector(
          `#${CSS.escape(get(column, 'columnUid'))}`
        ).style.width = get(column, 'columnStyle.width');
      }
    });
    setIsDragging(false);
    setPageBuilderLoader(false);
  };

  const roundColumnPercentage = (rowData) => {
    if (!checkTotalWidth(rowData)) {
      rowData = filter(
        rowData,
        (item) => get(item, 'component[0].componentType') !== 'dummy'
      );
      map(rowData, (item) => {
        item.columnStyle.width = `${100 / rowData.length}%`;
        return item;
      });
    }
    return rowData;
  };

  const updateComponent = (values) => {
    const updatedComponentValues = cloneDeep(componentValues);
    const { source, target } = values;
    if (target === source) return;
    if (
      !source ||
      !target ||
      !componentValues ||
      !updatedComponentValues.row ||
      !draggingDirection?.current ||
      source === target
    )
      return;
    const {
      current: { d },
    } = draggingDirection;

    const findComponent = (elementId, type) => {
      if (updatedComponentValues.row && updatedComponentValues.row.length > 0) {
        const matchedRow = updatedComponentValues.row.find(
          (row) => row.rowUid === elementId
        );
        if (matchedRow) {
          if (type === 'source') {
            updatedComponentValues.row = updatedComponentValues.row.filter(
              (row) => row.rowUid !== elementId
            );
          }
          return matchedRow;
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const row of updatedComponentValues.row) {
          if (row.column && row.column.length > 0) {
            const matchedColumn = row.column.find(
              (column) => column.columnUid === elementId
            );
            if (matchedColumn) {
              if (type === 'source') {
                // eslint-disable-next-line no-restricted-syntax
                row.column = row.column.filter(
                  (column) => column.columnUid !== elementId
                );
                if (row.column.length === 0) {
                  updatedComponentValues.row =
                    updatedComponentValues.row.filter(
                      (r) => r.rowUid !== row.rowUid
                    );
                }
              }
              return matchedColumn;
            }

            // eslint-disable-next-line no-restricted-syntax
            for (const column of row.column) {
              if (column.component && column.component.length > 0) {
                const matchedComponent = column.component.find(
                  (component) => component.componentUid === elementId
                );
                if (matchedComponent) {
                  if (type === 'source') {
                    // eslint-disable-next-line no-restricted-syntax
                    for (const rowItem of updatedComponentValues.row) {
                      rowItem.column = rowItem.column || [];
                      // eslint-disable-next-line no-restricted-syntax
                      for (const [
                        index,
                        columnItem,
                      ] of rowItem.column.entries()) {
                        columnItem.component = columnItem.component || [];
                        columnItem.component = columnItem.component.filter(
                          (component) => component.componentUid !== elementId
                        );
                        if (columnItem.component.length === 0) {
                          rowItem.column?.splice(index, 1);
                          if (rowItem.column.length === 0) {
                            updatedComponentValues.row =
                              updatedComponentValues.row.filter(
                                (r) => r.rowUid !== row.rowUid
                              );
                          }
                        }
                      }
                    }
                  }
                  return matchedComponent;
                }
              }
            }
          }
        }
      }
      return 0;
    };

    const targetComponent = findComponent(target, 'target');
    const sourceComponent = findComponent(source, 'source');

    const roughVariable = {
      targetComponent,
      sourceComponent,
      targetType: checkComponentType(targetComponent),
      sourceType: checkComponentType(sourceComponent),
      direction: d,
    };
    const findDragTargetRowIndex = findIndex(
      get(updatedComponentValues, 'row'),
      (item) => item.rowUid === target
    );
    if (
      get(roughVariable, 'targetType') === 'row' &&
      get(roughVariable, 'sourceType') === 'row'
    ) {
      const updatedRow = filter(
        [
          ...filter(
            get(updatedComponentValues, 'row'),
            (item, index) => index < findDragTargetRowIndex
          ),
          get(roughVariable, 'direction') === 'up' &&
            get(roughVariable, 'sourceComponent'),
          get(roughVariable, 'targetComponent'),
          get(roughVariable, 'direction') === 'down' &&
            get(roughVariable, 'sourceComponent'),
          ...filter(
            get(updatedComponentValues, 'row'),
            (item, index) => index > findDragTargetRowIndex
          ),
        ],
        (item) => item !== false
      );
      updatedComponentValues.row = updatedRow;
    }
    if (
      get(roughVariable, 'targetType') === 'column' &&
      get(roughVariable, 'sourceType') === 'column'
    ) {
      const findTargetRowIndex = findIndex(
        get(updatedComponentValues, 'row'),
        (row) =>
          find(
            get(row, 'column'),
            (column) =>
              column.columnUid ===
              get(roughVariable, 'targetComponent.columnUid')
          )
      );
      const findTargetColumnIndex = findIndex(
        get(updatedComponentValues, `row[${findTargetRowIndex}].column`),
        (column) =>
          column.columnUid === get(roughVariable, 'targetComponent.columnUid')
      );
      let rowData = get(
        updatedComponentValues,
        `row[${findTargetRowIndex}].column`
      );
      const getSourceComponent = get(roughVariable, 'sourceComponent');
      getSourceComponent.parentUid = get(
        roughVariable,
        'targetComponent.parentUid'
      );
      rowData = filter(
        [
          ...filter(rowData, (item, index) => index < findTargetColumnIndex),
          (get(roughVariable, 'direction') === 'left' ||
            get(roughVariable, 'direction') === 'up') &&
            getSourceComponent,
          get(roughVariable, 'targetComponent'),
          (get(roughVariable, 'direction') === 'right' ||
            get(roughVariable, 'direction') === 'down') &&
            getSourceComponent,
          ...filter(rowData, (item, index) => index > findTargetColumnIndex),
        ],
        (item) => item !== false
      );
      if (!checkTotalWidth(rowData)) {
        rowData = filter(
          rowData,
          (item) => get(item, 'component[0].componentType') !== 'dummy'
        );
        if (rowData.length === 5) {
          rowData.map((item, index) => {
            item.columnStyle.width =
              index === findTargetColumnIndex ? `${100 / 3}%` : `${100 / 6}%`;
            return item;
          });
        } else {
          rowData.map((item) => {
            item.columnStyle.width = `${100 / rowData.length}%`;
            return item;
          });
        }
      }
      if (get(rowData, 'length') > 6) return;
      updatedComponentValues.row[findTargetRowIndex].column = rowData;
    }
    if (
      get(roughVariable, 'targetType') === 'column' &&
      get(roughVariable, 'sourceType') === 'component'
    ) {
      const findTargetRowIndex = findIndex(
        get(updatedComponentValues, 'row'),
        (row) =>
          find(
            get(row, 'column'),
            (column) =>
              column.columnUid ===
              get(roughVariable, 'targetComponent.columnUid')
          )
      );
      const findTargetColumnIndex = findIndex(
        get(updatedComponentValues, `row[${findTargetRowIndex}].column`),
        (column) =>
          column.columnUid === get(roughVariable, 'targetComponent.columnUid')
      );
      let rowData = get(
        updatedComponentValues,
        `row[${findTargetRowIndex}].column`
      );
      if (
        get(roughVariable, 'direction') === 'left' ||
        get(roughVariable, 'direction') === 'right'
      ) {
        const columnData = ColumnJson();
        columnData.parentUid = get(roughVariable, 'targetComponent.parentUid');
        columnData.component = [get(roughVariable, 'sourceComponent')];
        columnData.component.parentUid = columnData.columnUid;
        rowData = filter(
          [
            ...filter(rowData, (item, index) => index < findTargetColumnIndex),
            get(roughVariable, 'direction') === 'left' && columnData,
            get(roughVariable, 'targetComponent'),
            get(roughVariable, 'direction') === 'right' && columnData,
            ...filter(rowData, (item, index) => index > findTargetColumnIndex),
          ],
          (item) => item !== false
        );
      }
      if (
        get(roughVariable, 'direction') === 'up' ||
        get(roughVariable, 'direction') === 'down'
      ) {
        const componentReturnData = (direction) => {
          if (get(roughVariable, 'direction') === direction)
            return get(roughVariable, 'sourceComponent');
          return false;
        };
        const componentData = filter(
          [
            componentReturnData('up'),
            ...get(roughVariable, 'targetComponent.component'),
            componentReturnData('down'),
          ],
          (item) => item !== false
        );
        map(componentData, (item) => {
          item.parentUid = get(roughVariable, 'targetComponent.columnUid');
          return item;
        });
        rowData[findTargetColumnIndex].component = componentData;
      }
      if (!checkTotalWidth(rowData)) {
        rowData = filter(
          rowData,
          (item) => get(item, 'component[0].componentType') !== 'dummy'
        );
        if (rowData.length === 5) {
          rowData.map((item, index) => {
            item.columnStyle.width =
              index === findTargetColumnIndex ? `${100 / 3}%` : `${100 / 6}%`;
            return item;
          });
        } else {
          rowData.map((item) => {
            item.columnStyle.width = `${100 / rowData.length}%`;
            return item;
          });
        }
      }
      if (get(rowData, 'length') > 6) return;
      updatedComponentValues.row[findTargetRowIndex].column = rowData;
    }
    if (
      get(roughVariable, 'targetType') === 'component' &&
      get(roughVariable, 'sourceType') === 'component'
    ) {
      const findTargetRowIndex = findIndex(
        get(updatedComponentValues, 'row'),
        (row) =>
          find(get(row, 'column'), (column) =>
            find(
              column.component,
              (component) =>
                component.componentUid ===
                get(roughVariable, 'targetComponent.componentUid')
            )
          )
      );
      const findTargetColumnIndex = findIndex(
        get(updatedComponentValues, `row[${findTargetRowIndex}].column`),
        (column) =>
          find(
            column.component,
            (component) =>
              component.componentUid ===
              get(roughVariable, 'targetComponent.componentUid')
          )
      );
      const findTargetComponentIndex = findIndex(
        get(
          updatedComponentValues,
          `row[${findTargetRowIndex}].column[${findTargetColumnIndex}].component`
        ),
        (component) =>
          component.componentUid ===
          get(roughVariable, 'targetComponent.componentUid')
      );
      let componentData = get(
        updatedComponentValues,
        `row[${findTargetRowIndex}].column[${findTargetColumnIndex}].component`
      );
      roughVariable.sourceComponent.parentUid = get(
        roughVariable,
        'targetComponent.parentUid'
      );
      componentData = filter(
        [
          ...filter(
            componentData,
            (item, index) => index < findTargetComponentIndex
          ),
          get(roughVariable, 'direction') === 'up' &&
            get(roughVariable, 'sourceComponent'),
          get(roughVariable, 'targetComponent'),
          get(roughVariable, 'direction') === 'down' &&
            get(roughVariable, 'sourceComponent'),
          ...filter(
            componentData,
            (item, index) => index > findTargetComponentIndex
          ),
        ],
        (item) => item !== false
      );
      let rowData = get(
        updatedComponentValues,
        `row[${findTargetRowIndex}].column`
      );
      if (!checkTotalWidth(rowData)) {
        rowData = filter(
          rowData,
          (item) => get(item, 'component[0].componentType') !== 'dummy'
        );
        if (rowData.length === 5) {
          rowData.map((item, index) => {
            item.columnStyle.width =
              index === findTargetColumnIndex ? `${100 / 3}%` : `${100 / 6}%`;
            return item;
          });
        } else {
          rowData.map((item) => {
            item.columnStyle.width = `${100 / rowData.length}%`;
            return item;
          });
        }
      }
      if (get(rowData, 'length') > 6) return;
      updatedComponentValues.row[findTargetRowIndex].column[
        findTargetColumnIndex
      ].component = componentData;
    }
    if (
      get(roughVariable, 'targetType') === 'component' &&
      get(roughVariable, 'sourceType') === 'column'
    ) {
      const findTargetRowIndex = findIndex(
        get(updatedComponentValues, 'row'),
        (row) =>
          find(get(row, 'column'), (column) =>
            find(
              column.component,
              (component) =>
                component.componentUid ===
                get(roughVariable, 'targetComponent.componentUid')
            )
          )
      );
      const findTargetColumnIndex = findIndex(
        get(updatedComponentValues, `row[${findTargetRowIndex}].column`),
        (column) =>
          find(
            column.component,
            (component) =>
              component.componentUid ===
              get(roughVariable, 'targetComponent.componentUid')
          )
      );
      const findTargetComponentIndex = findIndex(
        get(
          updatedComponentValues,
          `row[${findTargetRowIndex}].column[${findTargetColumnIndex}].component`
        ),
        (component) =>
          component.componentUid ===
          get(roughVariable, 'targetComponent.componentUid')
      );
      let componentData = get(
        updatedComponentValues,
        `row[${findTargetRowIndex}].column[${findTargetColumnIndex}].component`
      );
      roughVariable.sourceComponent.parentUid = get(
        roughVariable,
        'targetComponent.parentUid'
      );
      const getTopSourceComponent =
        get(roughVariable, 'direction') === 'up'
          ? get(roughVariable, 'sourceComponent.component')
          : [];
      const getDownSourceComponent =
        get(roughVariable, 'direction') === 'down'
          ? get(roughVariable, 'sourceComponent.component')
          : [];

      componentData = filter(
        [
          ...filter(
            componentData,
            (item, index) => index < findTargetComponentIndex
          ),
          ...getTopSourceComponent,
          get(roughVariable, 'targetComponent'),
          ...getDownSourceComponent,
          ...filter(
            componentData,
            (item, index) => index > findTargetComponentIndex
          ),
        ],
        (item) => item !== false
      );
      updatedComponentValues.row[findTargetRowIndex].column[
        findTargetColumnIndex
      ].component = componentData;
    }
    if (
      get(roughVariable, 'targetType') === 'row' &&
      get(roughVariable, 'sourceType') === 'component'
    ) {
      const getRowJson = RowJson();
      getRowJson.column[0].columnStyle.width = '100%';
      getRowJson.column[0].component[0] = get(roughVariable, 'sourceComponent');
      const updatedRow = filter(
        [
          ...filter(
            get(updatedComponentValues, 'row'),
            (item, index) => index < findDragTargetRowIndex
          ),
          get(roughVariable, 'direction') === 'up' && getRowJson,
          get(roughVariable, 'targetComponent'),
          get(roughVariable, 'direction') === 'down' && getRowJson,
          ...filter(
            get(updatedComponentValues, 'row'),
            (item, index) => index > findDragTargetRowIndex
          ),
        ],
        (item) => item !== false
      );
      updatedComponentValues.row = updatedRow;
    }
    if (
      get(roughVariable, 'targetType') === 'row' &&
      get(roughVariable, 'sourceType') === 'column'
    ) {
      const getRowJson = RowJson();
      getRowJson.column[0] = get(roughVariable, 'sourceComponent');
      const updatedRow = filter(
        [
          ...filter(
            get(updatedComponentValues, 'row'),
            (item, index) => index < findDragTargetRowIndex
          ),
          get(roughVariable, 'direction') === 'up' && getRowJson,
          get(roughVariable, 'targetComponent'),
          get(roughVariable, 'direction') === 'down' && getRowJson,
          ...filter(
            get(updatedComponentValues, 'row'),
            (item, index) => index > findDragTargetRowIndex
          ),
        ],
        (item) => item !== false
      );
      updatedComponentValues.row = updatedRow;
    }
    if (updatedComponentValues.row && updatedComponentValues.row.length > 0) {
      removeClass({ classNames: 'resize-container,active,dragging' });
      addClass({ id: componentSource, classNames: 'resize-container' });
    }
    map(get(updatedComponentValues, 'row'), (row) =>
      roundColumnPercentage(get(row, 'column'))
    );
    updateComponentState(updatedComponentValues);
    setComponentSource();
    setComponentType();
    setDraggingDirection();
    setIsDragging(false);
  };

  // eslint-disable-next-line no-shadow
  const updatePropertyValues = ({ id, value, key }) => {
    const newComponentValues = cloneDeep(componentValues);
    newComponentValues.row.map((row) => {
      if (row.rowUid === id) {
        row.rowProperties[key] = value;
        return row;
      }
      row.column.map((column) => {
        if (column.columnUid === id) {
          row.rowProperties[key] = value;
          return column;
        }
        column.component.map((component) => {
          if (component.componentUid === id) {
            component.componentProperties[key] = value;
          }
          return component;
        });
        return column;
      });
      return row;
    });
    updateComponentState(newComponentValues);
  };

  const updateComponentStyle = (parameters) => {
    const { id: elementId = '', key, value } = parameters;
    const newComponentValues = cloneDeep(componentValues);
    if (key === 'theme') {
      newComponentValues.globalProperties.theme = value;
    } else if (key === 'width') {
      // eslint-disable-next-line no-restricted-syntax
      for (const row of newComponentValues.row) {
        if (row.rowUid === elementId) {
          row.rowProperties[key] = value;
        }
      }
    } else {
      // eslint-disable-next-line no-restricted-syntax
      for (const row of newComponentValues.row) {
        if (row.rowUid === elementId) {
          row.rowStyle[key] = value;
          break;
        }
        // eslint-disable-next-line no-restricted-syntax
        for (const column of row.column) {
          if (column.columnUid === elementId) {
            column.columnStyle[key] = value;
            break;
          }
          // eslint-disable-next-line no-restricted-syntax
          for (const component of column.component) {
            if (component.componentUid === elementId) {
              component.componentStyle[key] = value;
              break;
            }
          }
        }
      }
    }
    updateComponentState(newComponentValues);
  };

  const updateComponentProperties = (componentUid) => {
    let newComponentProperties;
    const componentValueClone = cloneDeep(componentValues);
    let componetType;
    componentValueClone.row.map((row) =>
      row.column.map((column) =>
        column.component.map((component) => {
          if (component.componentUid === componentUid) {
            componetType = component.componentType;
            newComponentProperties = component.componentProperties;
          }
          return component;
        })
      )
    );
    newComponentProperties.componentUid = componentUid;
    setComponentProperties(newComponentProperties);
    if (componetType === 'product') setProductModalVisible(true);
    if (componetType === 'category') setCategoryModalVisible(true);
    if (componetType === 'image') setImageActionModal(true);
    if (componetType === 'imageCarousel') setEditCarousel(true);
    setIsNewProductComponent(false);
  };

  const contextValue = useMemo(() => {
    return {
      componentValues,
      updateComponentJsonAfterDND: (values) => updateComponent(values),
      componentSource,
      setComponentSource,
      setComponentType,
      componentType,
      setDraggingDirection,
      draggingDirection,
      resizeComponent,
      updatePropertyValues,
      showTextEditor,
      setShowTextEditor,
      textEditorComponentId,
      setTextEditorComponentId,
      updateImageSource,
      updateComponentStyle,
      isDragging,
      setIsDragging,
      setScrollToBottom,
      createOrUpdateContext,
      componentProperties,
      setComponentProperties,
      productModalVisible,
      setProductModalVisible,
      updateComponentProperties,
      setIsNewProductComponent,
      isNewProductComponent,
      categoryModalVisible,
      setCategoryModalVisible,
      pageBuilderLoader,
      setPageBuilderLoader,
      defaultTemplate,
      setDefaultTemplate,
      pageList,
      setPageList,
      templateLoader,
      setTemplateLoader,
      modalVisible,
      setModalVisible,
      buttonModalVisible,
      setButtonModalVisible,
      embedModalVisible,
      setEmbedModalVisible,
      videoModalVisible,
      setVideoModalVisible,
      editCarousel,
      setEditCarousel,
      imageActionModal,
      setImageActionModal,
      imageModal,
      setImageModal,
      seoProperties,
      setSeoProperties,
      undoComponent,
      redoComponent,
      updateComponentState,
      resetComponentState,
      componentStateIndex,
      componentStateLastIndex,
      youTubeModalVisible,
      setYouTubeModalVisible,
    };
  }, [
    // List any dependencies here that affect the context values
    componentValues,
    componentSource,
    componentType,
    draggingDirection,
    showTextEditor,
    textEditorComponentId,
    isDragging,
    setIsDragging,
    resizeComponent,
    scrollToBottom,
    componentProperties,
    setComponentProperties,
    productModalVisible,
    setProductModalVisible,
    categoryModalVisible,
    setCategoryModalVisible,
    defaultTemplate,
    setDefaultTemplate,
    pageList,
    setPageList,
    templateLoader,
    setTemplateLoader,
    modalVisible,
    setModalVisible,
    buttonModalVisible,
    setButtonModalVisible,
    embedModalVisible,
    setEmbedModalVisible,
    videoModalVisible,
    setVideoModalVisible,
    editCarousel,
    setEditCarousel,
    imageActionModal,
    setImageActionModal,
    imageModal,
    setImageModal,
    seoProperties,
    setSeoProperties,
    undoComponent,
    redoComponent,
    updateComponentState,
    resetComponentState,
    componentStateIndex,
    componentStateLastIndex,
    youTubeModalVisible,
    setYouTubeModalVisible,
  ]);

  return (
    <ComponentContext.Provider value={contextValue}>
      {children}
    </ComponentContext.Provider>
  );
}
export default ComponentContextProvider;
