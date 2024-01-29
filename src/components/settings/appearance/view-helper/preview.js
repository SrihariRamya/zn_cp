/* eslint-disable jsx-a11y/media-has-caption */
import { Col, Row } from 'antd';
import { find, get } from 'lodash';
import React from 'react';
import BannerItem from './banner-item';
import CategoryItem from './category-item';
import ProductItemSlider from './product-item-slider';
import TextItem from './text-item';
import VideoItem from './video-item';

function AppearancePreview({ editorContext, settingProperties, webLayout }) {
  const settingWidth = get(
    find(
      settingProperties,
      (item) => item.variable_name === '--layout-body-width'
    ),
    'variable_value',
    '100%'
  );
  return (
    <div
      style={{
        width: webLayout ? settingWidth : '100%',
        marginTop: webLayout ? '0px' : '40px',
        marginBottom: webLayout ? '0px' : '50px',
      }}
    >
      {editorContext.map((item) => {
        return (
          <>
            <Row
              align="middle"
              justify="center"
              style={{
                ...get(item, 'style', {}),
                textAlign: 'center',
                overflow: 'hidden',
                marginTop: '10px',
              }}
            >
              {get(item, 'column', []).map((column) => {
                return (
                  <Col
                    span={column.span}
                    style={{
                      ...get(column, 'style'),
                      textAlign: 'center',
                      lineHeight: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {get(
                      column,
                      'section.appearance_widget.widget_type',
                      ''
                    ) === 'text' && <TextItem data={get(column, 'section')} />}
                    {get(
                      column,
                      'section.appearance_widget.widget_type',
                      ''
                    ) === 'image' && (
                      <img
                        src={get(
                          column,
                          'section.preview',
                          get(
                            column,
                            'section.section_image_content.Location',
                            ''
                          )
                        )}
                        alt="content"
                        style={{
                          width: `${get(column, 'section.width', '100')}%`,
                        }}
                      />
                    )}
                    {get(
                      column,
                      'section.appearance_widget.widget_type',
                      ''
                    ) === 'video' && (
                      <div>
                        <VideoItem
                          render="preview"
                          data={get(column, 'section')}
                        />
                      </div>
                    )}
                    {get(
                      column,
                      'section.appearance_widget.widget_type',
                      ''
                    ) === 'category' && (
                      <CategoryItem
                        render="preview"
                        column={column}
                        columnLength={get(item, 'column.length', 0)}
                        webLayout={webLayout}
                      />
                    )}
                    {get(
                      column,
                      'section.appearance_widget.widget_type',
                      ''
                    ) === 'product' && (
                      <ProductItemSlider
                        render="preview"
                        webLayout={webLayout}
                        column={column}
                        columnLength={get(item, 'column.length', 0)}
                      />
                    )}
                    {get(
                      column,
                      'section.appearance_widget.widget_type',
                      ''
                    ) === 'banner' && (
                      <BannerItem
                        render="preview"
                        section={column.section}
                        columnLength={get(item, 'column.length', 0)}
                      />
                    )}
                  </Col>
                );
              })}
            </Row>
          </>
        );
      })}
    </div>
  );
}

export default AppearancePreview;
