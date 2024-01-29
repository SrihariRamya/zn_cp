import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  HighlightOutlined,
} from '@ant-design/icons';
import { Form, Input, Modal, Radio, Select } from 'antd';
import { get } from 'lodash';
import React, { useCallback, useState } from 'react';
import { SketchPicker } from 'react-color';

function SectionTitleProperty(properties) {
  const { componentProperties, setComponentProperties, color, setColor } =
    properties;
  const [colorModal, setColorModal] = useState(false);
  const insertEditorContext = (value, name) => {
    switch (name) {
      case 'size': {
        setComponentProperties({
          ...componentProperties,
          title_style: {
            ...get(componentProperties, 'title_style'),
            fontSize: `${value}px`,
          },
        });
        break;
      }
      case 'textAlign': {
        setComponentProperties({
          ...componentProperties,
          title_style: {
            ...get(componentProperties, 'title_style'),
            textAlign: value,
          },
        });
        break;
      }
      case 'fontWeight': {
        setComponentProperties({
          ...componentProperties,
          title_style: {
            ...get(componentProperties, 'title_style'),
            fontWeight: value,
          },
        });
        break;
      }
      default: {
        setComponentProperties({
          ...componentProperties,
          title_style: {
            ...get(componentProperties, 'title_style'),
            color,
          },
        });
        setColorModal(false);
      }
    }
  };
  return (
    <>
      <Form.Item
        initialValue={get(componentProperties, 'title_style.color')}
        label="Color"
      >
        <Input
          onClick={() => {
            setColorModal(true);
          }}
          placeholder={get(componentProperties, 'title_style.color')}
          suffix={
            <HighlightOutlined
              style={{
                color: get(componentProperties, 'title_style.color'),
                fontSize: '20px',
              }}
            />
          }
        />
      </Form.Item>
      <Form.Item
        name={`title_size_${get(componentProperties, 'id')}`}
        initialValue={Number.parseInt(
          get(componentProperties, 'title_style.fontSize', '').replace(
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
        name={`title_align_${get(componentProperties, 'id')}`}
        initialValue={get(componentProperties, 'title_style.textAlign', '')}
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
        name={`title_weight_${get(componentProperties, 'id')}`}
        initialValue={get(componentProperties, 'title_style.fontWeight', '')}
        label="Text Thickness"
      >
        <Select
          placeholder="Select a alignment"
          optionFilterProp="children"
          name="fontWeight"
          virtual={false}
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
        open={colorModal}
        onOk={useCallback(() => {
          insertEditorContext();
        }, [color, componentProperties])}
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
