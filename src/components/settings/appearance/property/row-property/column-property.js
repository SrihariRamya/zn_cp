import { HighlightOutlined } from '@ant-design/icons';
import { Col, Collapse, Input, InputNumber, Row, Space } from 'antd';
import { debounce, get, map } from 'lodash';
import React from 'react';
import BorderRadiusProperty from './border-radius-property';

const { Panel } = Collapse;

const ColumnProperty = ({
  editorContext,
  setEditorContext,
  columnMenu,
  setModelType,
  setIsModalVisible,
  setColumnColor,
  rowProperties,
}) => {
  let padding = get(columnMenu, 'style.padding', '');
  let columnPaddingArray = padding.split(' ');
  if (columnPaddingArray.length < 2) {
    padding = `${padding} ${padding} ${padding} ${padding}`;
    columnPaddingArray = padding.split(' ');
  }

  const setPadding = debounce((event, parameters) => {
    const topPad =
      parameters === 'top'
        ? event || 0
        : parseInt(columnPaddingArray[0].replace('px', ''), 10);
    const rightPad =
      parameters === 'right'
        ? event || 0
        : parseInt(columnPaddingArray[1].replace('px', ''), 10);
    const bottomPad =
      parameters === 'bottom'
        ? event || 0
        : parseInt(columnPaddingArray[2].replace('px', ''), 10);
    const leftPad =
      parameters === 'left'
        ? event || 0
        : parseInt(columnPaddingArray[3].replace('px', ''), 10);
    setEditorContext(
      map(editorContext, (item, index_) => {
        if (index_ === rowProperties.index) {
          get(item, 'column', []).map((column) => {
            if (
              get(column, 'appearance_column_uid') ===
              get(columnMenu, 'appearance_column_uid')
            ) {
              column.style.padding = `${topPad || 0}px ${rightPad || 0}px ${
                bottomPad || 0
              }px ${leftPad || 0}px`;
            }
            return column;
          });
        }
        return item;
      })
    );
  }, 100);
  return (
    <Row>
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
                    setModelType('column');
                    setIsModalVisible(true);
                    setColumnColor(
                      get(columnMenu, 'style.backgroundColor', '')
                    );
                  }}
                  placeholder={get(
                    columnMenu,
                    'style.backgroundColor',
                    '#FFFFF'
                  )}
                  suffix={
                    <HighlightOutlined
                      style={{
                        color: get(columnMenu, 'style.backgroundColor'),
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
          <Panel header="Padding" key="1">
            <Row justify="space-between">
              <div className="mtb-auto">Padding</div>
              <Space>
                <InputNumber
                  placeholder="T"
                  type="number"
                  min={0}
                  value={parseInt(columnPaddingArray[0].replace('px', ''), 10)}
                  onChange={(event) => setPadding(event, 'top')}
                />
                <InputNumber
                  placeholder="R"
                  type="number"
                  min={0}
                  value={parseInt(columnPaddingArray[1].replace('px', ''), 10)}
                  onChange={(event) => setPadding(event, 'right')}
                />
                <InputNumber
                  placeholder="B"
                  type="number"
                  min={0}
                  value={parseInt(columnPaddingArray[2].replace('px', ''), 10)}
                  onChange={(event) => setPadding(event, 'bottom')}
                />
                <InputNumber
                  placeholder="L"
                  type="number"
                  min={0}
                  value={parseInt(columnPaddingArray[3].replace('px', ''), 10)}
                  onChange={(event) => setPadding(event, 'left')}
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
              renderArea="column"
              columnMenu={columnMenu}
              setEditorContext={setEditorContext}
            />
          </Panel>
        </Collapse>
      </Space>
    </Row>
  );
};

export default ColumnProperty;
