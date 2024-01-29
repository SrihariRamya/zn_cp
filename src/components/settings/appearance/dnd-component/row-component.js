import { Col, Row } from 'antd';
import { get, isEmpty } from 'lodash';
import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import CategoryItem from '../view-helper/category-item';
import TextItem from '../view-helper/text-item';
import ImageItem from '../view-helper/image-item';
import VideoItem from '../view-helper/video-item';
import ProductItemHelper from '../view-helper/product-item-slider';
import BannerItem from '../view-helper/banner-item';

export default function RowComponent({
  column,
  row,
  rowIndex,
  setRowProperties,
  renderArea,
  setContextProperties,
  setEditorContext,
  editorContext,
  columnMenu,
  rowProperties,
  contextProperties,
  webLayout,
}) {
  return (
    <>
      <Row
        className={renderArea !== 'editor' && 'row'}
        onClick={renderArea === 'editor' ? setRowProperties : undefined}
        style={{
          backgroundColor: get(row, 'style.backgroundColor', ''),
          marginTop: get(row, 'style.marginTop', ''),
          marginBottom: get(row, 'style.marginBottom', ''),
          padding: get(row, 'style.padding'),
          borderRadius: get(row, 'style.borderRadius'),
          overflow: 'hidden',
          border:
            get(rowProperties, 'item.appearance_row_uid', '') ===
              get(row, 'appearance_row_uid', '') &&
            renderArea === 'editor' &&
            'dashed 2px #38523B',
        }}
        align="middle"
        justify="center"
      >
        {column.map((item, index) => {
          return (
            <Col span={item.span} flex="auto" key={item.appearance_column_uid}>
              <div
                className="col-outer"
                key={item.appearance_column_uid}
                style={{
                  backgroundColor:
                    renderArea === 'editor' &&
                    get(
                      item,
                      'style.backgroundColor',
                      get(row, 'style.backgroundColor', '')
                    ),
                  padding: get(item, 'style.padding', ''),
                  borderRadius: get(item, 'style.borderRadius', ''),
                  textAlign: 'center',
                  overflow: 'hidden',
                  border:
                    renderArea === 'editor' &&
                    (get(columnMenu, 'appearance_column_uid', '') ===
                      get(item, 'appearance_column_uid', '') ||
                      get(contextProperties, 'appearance_section_uid', '') ===
                        get(item, 'section.appearance_section_uid', '')) &&
                    'dashed 1px #38523B',
                }}
              >
                <div className="col-inner" key={item.appearance_column_uid}>
                  <Droppable
                    droppableId={item.appearance_column_uid}
                    key={item.appearance_column_uid}
                    type="context"
                    isDropDisabled={!isEmpty(get(item, 'section'))}
                  >
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        <Draggable
                          key={get(item, 'section.appearance_section_uid', '')}
                          draggableId={get(
                            item,
                            'section.appearance_section_uid',
                            'section'
                          )}
                          index={1}
                          isDragDisabled
                        >
                          {(provideds) => (
                            <div
                              key={get(
                                item,
                                'section.appearance_section_uid',
                                ''
                              )}
                              ref={provideds.innerRef}
                              {...provideds.draggableProps}
                              {...provideds.dragHandleProps}
                              style={{
                                backgroundColor: get(
                                  item,
                                  'style.backgroundColor',
                                  'white'
                                ),
                              }}
                            >
                              <div
                                id="appearance-droppable-content"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  event.preventDefault();
                                  setContextProperties(
                                    get(item, 'section', {})
                                  );
                                }}
                                aria-hidden="true"
                              >
                                {renderArea === 'editor' &&
                                  isEmpty(
                                    get(item, 'section.appearance_widget_uid')
                                  ) && (
                                    <Row
                                      style={{
                                        width: '100%',
                                        minHeight: '150px',
                                        backgroundColor: '#bed1bfa',
                                      }}
                                      align="center"
                                      justify="middle"
                                    >
                                      <h1>Drop your content here!</h1>
                                    </Row>
                                  )}
                                {get(
                                  item,
                                  'section.appearance_widget.widget_type',
                                  ''
                                ) === 'text' && (
                                  <TextItem
                                    data={item.section}
                                    section={item}
                                    setEditorContext={setEditorContext}
                                    editorContext={editorContext}
                                  />
                                )}
                                {get(
                                  item,
                                  'section.appearance_widget.widget_type',
                                  ''
                                ) === 'image' && (
                                  <>
                                    <ImageItem
                                      data={item.section}
                                      column={item}
                                      setEditorContext={setEditorContext}
                                      editorContext={editorContext}
                                      rowIndex={rowIndex}
                                      columnIndex={index}
                                    />
                                  </>
                                )}
                                {get(
                                  item,
                                  'section.appearance_widget.widget_type',
                                  ''
                                ) === 'video' && (
                                  <VideoItem
                                    data={item.section}
                                    section={item}
                                    setEditorContext={setEditorContext}
                                    editorContext={editorContext}
                                    rowIndex={rowIndex}
                                    columnIndex={index}
                                    render="editor"
                                  />
                                )}
                                {!isEmpty(item.section) &&
                                  get(
                                    item,
                                    'section.appearance_widget.widget_type',
                                    ''
                                  ) === 'product' && (
                                    <>
                                      <ProductItemHelper
                                        column={item}
                                        columnLength={column.length}
                                        render="row-component"
                                        webLayout={webLayout}
                                      />
                                    </>
                                  )}
                                {!isEmpty(item.section) &&
                                  get(
                                    item,
                                    'section.appearance_widget.widget_type',
                                    ''
                                  ) === 'category' && (
                                    <>
                                      <CategoryItem
                                        column={item}
                                        columnLength={column.length}
                                        render="row-component"
                                        webLayout={webLayout}
                                      />
                                    </>
                                  )}
                                {!isEmpty(item.section) &&
                                  get(
                                    item,
                                    'section.appearance_widget.widget_type',
                                    ''
                                  ) === 'banner' && (
                                    <BannerItem section={item.section} />
                                  )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </>
  );
}
