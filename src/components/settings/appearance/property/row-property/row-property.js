import {
  CopyOutlined,
  DeleteFilled,
  HighlightOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  InputNumber,
  Menu,
  Row,
  Modal,
  Input,
  Space,
  Collapse,
  Col,
} from 'antd';
import { get, map, find, remove, forEach, isEmpty, debounce } from 'lodash';
import React, { useState, useEffect, useCallback } from 'react';
import { SketchPicker } from 'react-color';
import { v4 as uuid } from 'uuid';
import BorderRadiusProperty from './border-radius-property';
import ColumnProperty from './column-property';

const { Panel } = Collapse;

export default function RowProperty({
  rowProperties,
  setRowProperties,
  editorContext,
  setEditorContext,
  columnMenu,
  setColumnMenu,
  webLayout,
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modelType, setModelType] = useState('');
  const [rowColor, setRowColor] = useState('');
  const [columnColor, setColumnColor] = useState('');
  const [paddingType, setPaddingType] = useState(false);
  const [, setRowPaddingType] = useState(false);

  useEffect(() => {
    setColumnMenu(get(rowProperties, 'item.column[0]'));
    if (get(rowProperties, 'item.style.padding.length', 0) > 6)
      setRowPaddingType(true);
    if (get(rowProperties, 'item.column[0].style.padding.length', 0) > 6)
      setPaddingType(true);
    else setPaddingType(false);
    return () => {
      setRowProperties({});
      setColumnMenu({});
    };
  }, [rowProperties, setColumnMenu, setRowProperties]);

  const addColumn = useCallback(() => {
    let columnArray = [];
    forEach(editorContext, (item, index_) => {
      if (index_ === rowProperties.index) {
        columnArray = get(item, 'column', []);
      }
    });
    columnArray.push({
      span: Math.round(24 / (get(editorContext, 'item.column.length', 0) + 1)),
      appearance_column_uid: uuid(),
      section: {},
      style: {
        backgroundColor: '#ffffff',
        padding: webLayout ? '20px' : '10px',
      },
    });
    const outputObject = map(editorContext, (item) => {
      item.column.map((element) => {
        element.span = Math.round(24 / item.column.length);
        return element;
      });
      return item;
    });
    setEditorContext(outputObject);
    setColumnMenu(
      get(
        rowProperties,
        `item.column[${get(rowProperties, 'item.column.length', 1) - 1}]`
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorContext, setEditorContext, setColumnMenu, rowProperties]);

  const deleteColumn = useCallback(() => {
    setEditorContext(
      editorContext.map((item) => {
        if (item.appearance_row_uid === rowProperties.item.appearance_row_uid) {
          remove(
            item.column,
            (data) =>
              get(data, 'appearance_column_uid', '') ===
              get(columnMenu, 'appearance_column_uid', '')
          );
          item.column.map((element) => {
            element.span = Math.round(24 / item.column.length);
            return element;
          });
          return item;
        }
        return item;
      })
    );
    setColumnMenu(get(rowProperties, `item.column[0]`));
  }, [
    columnMenu,
    editorContext,
    rowProperties,
    setColumnMenu,
    setEditorContext,
  ]);

  const colorPicker = useCallback(() => {
    if (modelType === 'column') {
      setEditorContext(
        map(editorContext, (item) => {
          get(item, 'column', []).map((element) => {
            if (
              get(element, 'appearance_column_uid', '') ===
              get(columnMenu, 'appearance_column_uid', '')
            ) {
              element.backgroundColor = columnColor;
              element.style.backgroundColor = columnColor;
            }
            return element;
          });
          return item;
        })
      );
    } else if (modelType === 'row') {
      setEditorContext(
        map(editorContext, (item, index_) => {
          if (index_ === rowProperties.index) {
            item.backgroundColor = rowColor;
            item.style.backgroundColor = rowColor;
          }
          return item;
        })
      );
    }
    setIsModalVisible(false);
  }, [
    columnColor,
    columnMenu,
    editorContext,
    modelType,
    rowColor,
    rowProperties.index,
    setEditorContext,
  ]);

  const getPaddingHelper = (paddingFor, parameters) => {
    let padding = '';
    if (paddingFor === 'column') {
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
      padding = get(findColumn, 'style.padding', ' ');
    } else if (paddingFor === 'row') {
      const findRow = find(
        editorContext,
        (row) =>
          get(row, 'appearance_row_uid') ===
          get(rowProperties, 'item.appearance_row_uid')
      );
      padding = get(findRow, 'style.padding', ' ');
    }
    const getIndexTop = padding.indexOf('px');
    const getIndexRight = padding.indexOf('px', getIndexTop + 1);
    const getIndexBottom = padding.indexOf('px', getIndexRight + 1);
    const getIndexLeft = padding.indexOf('px', getIndexBottom + 1);
    if (paddingFor === 'column' && !paddingType) {
      const topPadding = padding.substring(0, getIndexTop);
      return parseInt(topPadding, 10);
    }
    if (parameters === 'top') {
      const topPadding = padding.substring(0, getIndexTop);
      return parseInt(topPadding, 10);
    }
    if (parameters === 'right') {
      const rightPadding = padding.substring(
        getIndexTop + 3,
        getIndexRight + 1
      );
      return parseInt(rightPadding, 10);
    }
    if (parameters === 'bottom') {
      const bottomPadding = padding.substring(
        getIndexRight + 3,
        getIndexBottom + 1
      );
      return parseInt(bottomPadding, 10);
    }
    if (parameters === 'left') {
      const leftPadding = padding.substring(
        getIndexBottom + 3,
        getIndexLeft + 1
      );
      return parseInt(leftPadding, 10);
    }
    return null;
  };

  const getPaddingResult = (padding, event, parameters) => {
    const getIndexTop = padding.indexOf('px');
    const getIndexRight = padding.indexOf('px', getIndexTop + 1);
    const getIndexBottom = padding.indexOf('px', getIndexRight + 1);
    const getIndexLeft = padding.indexOf('px', getIndexBottom + 1);
    if (isEmpty(parameters)) return `${event}px`;
    switch (parameters) {
      case 'top':
        return `${event}${padding.substring(getIndexTop, padding.length)}`;
      case 'right':
        return `${padding.substring(
          0,
          getIndexTop + 3
        )}${event}${padding.substring(getIndexRight, padding.length)}`;
      case 'bottom':
        return `${padding.substring(
          0,
          getIndexRight + 3
        )}${event}${padding.substring(getIndexBottom, padding.length)}`;
      case 'left':
        return `${padding.substring(
          0,
          getIndexBottom + 3
        )}${event}${padding.substring(getIndexLeft, padding.length)}`;
      default:
        return '0px';
    }
  };
  const setRowPadding = debounce((value, parameters) => {
    const padding = get(rowProperties, 'item.style.padding', '');
    setEditorContext(
      map(editorContext, (item, index_) => {
        if (index_ === get(rowProperties, 'index')) {
          item.style.padding = getPaddingResult(
            padding || '0px 0px 0px 0px',
            value,
            parameters
          );
        }
        return item;
      })
    );
  }, 100);

  const marginSet = debounce((value, parameters) => {
    setEditorContext(
      map(editorContext, (item, index_) => {
        if (index_ === get(rowProperties, 'index')) {
          if (parameters === 'top') {
            item.style.marginTop = `${value}px`;
          }
          if (parameters === 'right') {
            item.style.marginRight = `${value}px`;
          }
          if (parameters === 'bottom') {
            item.style.marginBottom = `${value}px`;
          }
          if (parameters === 'left') {
            item.style.marginLeft = `${value}px`;
          }
        }
        return item;
      })
    );
  }, 100);

  return (
    <div className="appearance-properties">
      <div>
        <Row justify="space-between">
          <div className="header-text">Lane Properties</div>
          <Space>
            <Button
              key={1}
              onClick={() => {
                setEditorContext(
                  remove(
                    editorContext,
                    (index) =>
                      get(index, 'appearance_row_uid', '') !==
                      get(rowProperties, 'item.appearance_row_uid', '')
                  )
                );
                setRowProperties({});
              }}
            >
              <DeleteFilled />
            </Button>
            <Button
              key={2}
              onClick={() => {
                const { backgroundColor, column } = rowProperties.item;
                const columnArray = [];
                forEach(column, (index) => {
                  const returnObject = {
                    appearance_column_uid: uuid(),
                    span: index.span,
                    style: {
                      backgroundColor: get(index, 'style.backgroundColor', ''),
                      padding: get(index, 'style.padding', ''),
                    },
                    backgroundColor: index.backgroundColor,
                    padding: index.padding,
                    section: {
                      appearance_section_uid: uuid(),
                      span: index.section.span,
                      contentType: index.section.contentType,
                      section_title: index.section.section_title,
                      section_text_content: index.section.section_text_content,
                      appearance_widget_uid:
                        index.section.appearance_widget_uid,
                      appearance_widget: index.section.appearance_widget,
                      style: {},
                      sectionArray: get(index, 'section.sectionArray', []).map(
                        (secArray) => ({
                          appearance_section_array_uid: uuid(),
                          appearance_section_uid:
                            index.section.appearance_section_uid,
                          category_uid: secArray.category_uid,
                          product_uid: secArray.product_uid,
                          zm_product: secArray.zm_product,
                          zm_category: secArray.zm_category,
                        })
                      ),
                    },
                  };
                  columnArray.push(returnObject);
                });
                setEditorContext([
                  ...editorContext,
                  {
                    appearance_row_uid: uuid(),
                    backgroundColor,
                    style: rowProperties.item.style,
                    column: columnArray,
                  },
                ]);
              }}
            >
              <CopyOutlined />
            </Button>
          </Space>
        </Row>
        <Row className="mt-10">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Collapse collapsible defaultActiveKey={['1']}>
              <Panel header="Color" key="1">
                <Row justify="space-between" align="center">
                  <Col span={8}>
                    <div className="mtb-10">Background</div>
                  </Col>
                  <Col span={16}>
                    <Input
                      onClick={() => {
                        setModelType('row');
                        setIsModalVisible(true);
                        setRowColor(
                          get(rowProperties, 'item.style.backgroundColor', '')
                        );
                      }}
                      placeholder={get(
                        rowProperties,
                        'item.style.backgroundColor',
                        '#FFFFFF'
                      )}
                      suffix={
                        <HighlightOutlined
                          style={{
                            color: get(
                              rowProperties,
                              'item.style.backgroundColor'
                            ),
                            fontSize: '20px',
                          }}
                        />
                      }
                    />
                  </Col>
                </Row>
              </Panel>
            </Collapse>
            <Collapse collapsible defaultActiveKey={['1']}>
              <Panel header="Margin" key="1">
                <Row justify="space-between" align="center">
                  <div className="mtb-auto">Margin</div>
                  <Space>
                    <InputNumber
                      onChange={(value) => marginSet(value, 'top')}
                      placeholder="T"
                      defaultValue={parseInt(
                        get(
                          rowProperties,
                          'item.style.marginTop',
                          '0px'
                        ).replace('px', ''),
                        0
                      )}
                    />
                    <InputNumber
                      disabled
                      placeholder="R"
                      onChange={(value) => marginSet(value, 'right')}
                      defaultValue={parseInt(
                        get(
                          rowProperties,
                          'item.style.marginRight',
                          '0px'
                        ).replace('px', ''),
                        0
                      )}
                    />
                    <InputNumber
                      placeholder="B"
                      onChange={(value) => marginSet(value, 'bottom')}
                      defaultValue={parseInt(
                        get(
                          rowProperties,
                          'item.style.marginBottom',
                          '0px'
                        ).replace('px', ''),
                        0
                      )}
                    />
                    <InputNumber
                      disabled
                      placeholder="L"
                      onChange={(value) => marginSet(value, 'left')}
                      defaultValue={parseInt(
                        get(
                          rowProperties,
                          'item.style.marginLeft',
                          '0px'
                        ).replace('px', ''),
                        0
                      )}
                    />
                  </Space>
                </Row>
              </Panel>
            </Collapse>
            <Collapse collapsible defaultActiveKey={['1']}>
              <Panel header="Padding" key="1">
                <Row align="center" justify="space-between">
                  <div className="mtb-auto">Padding</div>
                  <Space>
                    <InputNumber
                      placeholder="T"
                      value={getPaddingHelper('row', 'top') || 0}
                      onChange={(event) => setRowPadding(event, 'top')}
                    />
                    <InputNumber
                      placeholder="R"
                      value={getPaddingHelper('row', 'right') || 0}
                      onChange={(event) => setRowPadding(event, 'right')}
                    />
                    <InputNumber
                      placeholder="B"
                      value={getPaddingHelper('row', 'bottom') || 0}
                      onChange={(event) => setRowPadding(event, 'bottom')}
                    />
                    <InputNumber
                      placeholder="L"
                      value={getPaddingHelper('row', 'left') || 0}
                      onChange={(event) => setRowPadding(event, 'left')}
                    />
                  </Space>
                </Row>
              </Panel>
            </Collapse>
            <Collapse collapsible defaultActiveKey={['1']}>
              <Panel header="Border Radius" key="1">
                <BorderRadiusProperty
                  editorContext={editorContext}
                  rowProperties={rowProperties}
                  renderArea="row"
                  setEditorContext={setEditorContext}
                  columnMenu={columnMenu}
                />
              </Panel>
            </Collapse>
          </Space>
        </Row>
      </div>
      <div className="mt-10">
        <Row justify="space-between">
          <div className="header-text">Customize Column</div>
          <Space>
            <Button
              key={3}
              type="primary"
              onClick={addColumn}
              disabled={
                get(rowProperties, 'item.column', []).length >=
                (webLayout ? 4 : 2)
              }
            >
              <PlusOutlined />
            </Button>
            <Button
              key={4}
              type="danger"
              danger
              disabled={get(rowProperties, 'item.column', []).length <= 1}
              onClick={deleteColumn}
            >
              <DeleteFilled />
            </Button>
          </Space>
        </Row>
        <Row>
          <Menu
            mode="horizontal"
            selectedKeys={[get(columnMenu, 'appearance_column_uid', '')]}
            defaultSelectedKeys={[get(columnMenu, 'appearance_column_uid', '')]}
            onClick={(event) => {
              const columMenuFind = find(
                get(rowProperties, 'item.column', []),
                (index) =>
                  get(index, 'appearance_column_uid') === get(event, 'key')
              );
              setColumnMenu(columMenuFind);
              if (get(columMenuFind, 'style.padding.length') > 6)
                setPaddingType(true);
              else setPaddingType(false);
            }}
            className="mt-10"
            style={{ width: '100%' }}
          >
            {get(rowProperties, 'item.column', []).map((item, index) => {
              return (
                <Menu.Item key={get(item, 'appearance_column_uid')}>{`Col ${
                  index + 1
                }`}</Menu.Item>
              );
            })}
          </Menu>
        </Row>
        <div className="mt-10">
          <ColumnProperty
            editorContext={editorContext}
            setEditorContext={setEditorContext}
            columnMenu={columnMenu}
            setModelType={setModelType}
            setIsModalVisible={setIsModalVisible}
            setColumnColor={setColumnColor}
            paddingType={paddingType}
            setPaddingType={setPaddingType}
            getPaddingHelper={getPaddingHelper}
            rowProperties={rowProperties}
          />
        </div>
      </div>
      <Modal
        title="Color Picker"
        visible={isModalVisible}
        onOk={colorPicker}
        onCancel={() => setIsModalVisible(false)}
        width="269px"
        destroyOnClose
      >
        <SketchPicker
          color={modelType === 'column' ? columnColor : rowColor}
          onChange={(event) => {
            if (modelType === 'column') setColumnColor(get(event, 'hex', ''));
            if (modelType === 'row') setRowColor(get(event, 'hex', ''));
          }}
        />
      </Modal>
    </div>
  );
}
