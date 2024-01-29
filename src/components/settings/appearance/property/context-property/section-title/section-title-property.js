import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  HighlightOutlined,
} from '@ant-design/icons';
import { Form, Input, Modal, Radio, Select } from 'antd';
import { get, map } from 'lodash';
import React, { useCallback, useState } from 'react';
import { SketchPicker } from 'react-color';

function SectionTitleProperty({
  contextProperties,
  setEditorContext,
  editorContext,
  color,
  setColor,
}) {
  const [colorModal, setColorModal] = useState(false);
  const insertEditorContext = (value, name) => {
    setEditorContext(
      map(editorContext, (item) => {
        map(item.column, (column) => {
          if (
            get(column, 'section.appearance_section_uid') ===
            get(contextProperties, 'appearance_section_uid')
          ) {
            if (name === 'size') {
              column.section.section_title_style = {
                ...column.section.section_title_style,
                fontSize: `${value}px`,
              };
            } else if (name === 'textAlign') {
              column.section.section_title_style = {
                ...column.section.section_title_style,
                textAlign: value,
              };
            } else if (name === 'fontWeight') {
              column.section.section_title_style = {
                ...column.section.section_title_style,
                fontWeight: value,
              };
            } else {
              column.section.section_title_style = {
                ...column.section.section_title_style,
                color,
              };
              setColorModal(false);
            }
          }
          return column;
        });
        return item;
      })
    );
  };
  return (
    <>
      <Form.Item
        initialValue={get(contextProperties, 'section_title_style.color')}
        label="Color"
      >
        <Input
          onClick={() => {
            setColorModal(true);
          }}
          placeholder={get(contextProperties, 'section_title_style.color')}
          suffix={
            <HighlightOutlined
              style={{
                color: get(contextProperties, 'section_title_style.color'),
                fontSize: '20px',
              }}
            />
          }
        />
      </Form.Item>
      <Form.Item
        name={`title_size_${get(contextProperties, 'id')}`}
        initialValue={parseInt(
          get(contextProperties, 'section_title_style.fontSize', '').replace(
            'px',
            ''
          ),
          10
        )}
        label="Size"
      >
        <Input
          type="number"
          name="size"
          onChange={(event) => {
            const { value, name } = get(event, 'target', {});
            insertEditorContext(value, name);
          }}
        />
      </Form.Item>
      <Form.Item
        name={`title_align_${get(contextProperties, 'id')}`}
        initialValue={get(
          contextProperties,
          'section_title_style.textAlign',
          ''
        )}
        label="Alignment"
      >
        <Radio.Group
          name="textAlign"
          onChange={(event) => {
            const { value, name } = get(event, 'target', {});
            insertEditorContext(value, name);
          }}
        >
          <Radio.Button value="left">
            <AlignLeftOutlined />
          </Radio.Button>
          <Radio.Button value="center">
            <AlignCenterOutlined />
          </Radio.Button>
          <Radio.Button value="right">
            <AlignRightOutlined />
          </Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name={`title_weight_${get(contextProperties, 'id')}`}
        initialValue={get(
          contextProperties,
          'section_title_style.fontWeight',
          ''
        )}
        label="Text Thickness"
      >
        <Select
          placeholder="Select a alignment"
          virtual={false}
          optionFilterProp="children"
          name="fontWeight"
          onChange={(value) => {
            insertEditorContext(value, 'fontWeight');
          }}
        >
          <Select.Option value="normal">Normal</Select.Option>
          <Select.Option value="bold">Bold</Select.Option>
        </Select>
      </Form.Item>
      <Modal
        title="Color Picker"
        visible={colorModal}
        onOk={useCallback(() => {
          insertEditorContext();
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [color, contextProperties, editorContext, setEditorContext])}
        onCancel={() => setColorModal(false)}
        width="269px"
        destroyOnClose
      >
        <SketchPicker
          color={color}
          onChange={(event) => {
            setColor(get(event, 'hex', ''));
          }}
        />
      </Modal>
    </>
  );
}

export default SectionTitleProperty;
