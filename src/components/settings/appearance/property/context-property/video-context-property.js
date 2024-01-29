import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Collapse, Input, Row, Slider } from 'antd';
import { get, map } from 'lodash';
import React, { useEffect, useState } from 'react';

const { Panel } = Collapse;

function VideoContextProperty({
  contextProperties,
  editorContext,
  setEditorContext,
}) {
  const [hrefContent, setHrefContent] = useState('');
  useEffect(() => {}, [contextProperties.width, contextProperties.height]);

  const deleteHandler = () => {
    setEditorContext(
      map(editorContext, (item) => {
        map(item.column, (element) => {
          if (
            get(element, 'section.appearance_section_uid') ===
            get(contextProperties, 'appearance_section_uid')
          ) {
            element.section.section_video_content = null;
            element.section.preview = null;
          }
          return element;
        });
        return item;
      })
    );
  };
  return (
    <div className="appearance-properties">
      <div>
        <Row justify="space-between">
          <div className="header-text">Video Content Property</div>
          <Button key="4" danger onClick={deleteHandler} type="danger">
            <DeleteOutlined />
          </Button>
        </Row>
      </div>
      <div className="mt-10">
        <Collapse collapsible defaultActiveKey={['1']}>
          <Panel header="Link" key="1">
            <Row align="center" justify="bottom" gutter={[16, 16]}>
              <Col span={20}>
                <Input
                  defaultValue={get(
                    contextProperties,
                    'section_image_content.Location',
                    ''
                  )}
                  onChange={(event) => {
                    setHrefContent(get(event, 'target.value', ''));
                  }}
                />
              </Col>
              <Col span={4}>
                <Button
                  type="primary"
                  onClick={() => {
                    setEditorContext(
                      map(editorContext, (item) => {
                        map(item.column, (element) => {
                          if (
                            get(element, 'section.appearance_section_uid') ===
                            get(contextProperties, 'appearance_section_uid')
                          ) {
                            element.section.section_video_content.Location =
                              hrefContent;
                            element.section.width = 100;
                            element.section.height = 200;
                          }
                          return element;
                        });
                        return item;
                      })
                    );
                  }}
                >
                  <PlusOutlined />
                </Button>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </div>
      <div className="mt-10">
        <Collapse collapsible defaultActiveKey={['1']}>
          <Panel header="Size" key="1">
            <Row align="center" justify="space-between">
              <Col span={4}>
                <div style={{ margin: '4px 0px' }}>Size</div>
              </Col>
              <Col span={20}>
                <Slider
                  defaultValue={get(contextProperties, 'width', 100)}
                  getPopupContainer={(triggerNode) => triggerNode.parentElement}
                  onAfterChange={(size) => {
                    setEditorContext(
                      map(editorContext, (item) => {
                        map(item.column, (element) => {
                          if (
                            get(element, 'section.appearance_section_uid') ===
                            get(contextProperties, 'appearance_section_uid')
                          ) {
                            element.section.width = size;
                          }
                          return element;
                        });
                        return item;
                      })
                    );
                  }}
                />
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </div>
    </div>
  );
}
export default VideoContextProperty;
