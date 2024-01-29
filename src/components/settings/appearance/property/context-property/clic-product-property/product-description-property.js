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
import { fontWeightOptions } from '../../../../../../shared/constant-values';

const { Option } = Select;

function ProductDescriptionProperty({
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
            if (name === `desc_size_${get(contextProperties, 'id')}`) {
              column.section.section_body_style.product_description_style = {
                ...column.section.section_body_style.product_description_style,
                fontSize: `${value}px`,
              };
            } else if (name === `desc_align_${get(contextProperties, 'id')}`) {
              column.section.section_body_style.product_description_style = {
                ...column.section.section_body_style.product_description_style,
                textAlign: value,
              };
            } else if (name === `desc_weight_${get(contextProperties, 'id')}`) {
              column.section.section_body_style.product_description_style = {
                ...column.section.section_body_style.product_description_style,
                fontWeight: value,
              };
            } else {
              column.section.section_body_style.product_description_style = {
                ...column.section.section_body_style.product_description_style,
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

  const productDesTextColor = get(
    contextProperties,
    'section_body_style.product_description_style.color',
    ''
  );
  const productDesTextAlign = get(
    contextProperties,
    'section_body_style.product_description_style.textAlign',
    ''
  );
  const productDesFontSize = get(
    contextProperties,
    'section_body_style.product_description_style.fontSize',
    ''
  );
  const productDesFontWeight = get(
    contextProperties,
    'section_body_style.product_description_style.fontWeight',
    ''
  );

  return (
    <>
      <Form.Item initialValue={productDesTextColor} label="Color">
        <Input
          onClick={() => {
            setColorModal(true);
          }}
          placeholder={productDesTextColor}
          suffix={
            <HighlightOutlined
              style={{
                color: productDesTextColor,
                fontSize: '20px',
              }}
            />
          }
        />
      </Form.Item>
      <Form.Item
        name={`desc_size_${get(contextProperties, 'id')}`}
        initialValue={parseInt(productDesFontSize.replace('px', ''), 10)}
        label="Size"
      >
        <Input
          type="number"
          name={`desc_size_${get(contextProperties, 'id')}`}
          onChange={(event) => {
            const { value, name } = get(event, 'target', {});
            insertEditorContext(value, name);
          }}
        />
      </Form.Item>
      <Form.Item
        name={`desc_align_${get(contextProperties, 'id')}`}
        initialValue={productDesTextAlign}
        label="Alignment"
      >
        <Radio.Group
          name={`desc_align_${get(contextProperties, 'id')}`}
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
        name={`desc_weight_${get(contextProperties, 'id')}`}
        initialValue={productDesFontWeight}
        label="Text Thickness"
      >
        <Select
          placeholder="Select a alignment"
          virtual={false}
          optionFilterProp="children"
          onChange={(value) => {
            insertEditorContext(
              value,
              `desc_weight_${get(contextProperties, 'id')}`
            );
          }}
        >
          {fontWeightOptions.map((item) => (
            <Option value={item.value} key={item.value}>
              {item.text}
            </Option>
          ))}
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

export default ProductDescriptionProperty;
