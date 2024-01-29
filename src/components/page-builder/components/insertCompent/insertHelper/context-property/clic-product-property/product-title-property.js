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
import { fontWeightOptions } from '../../../../../../../shared/constant-values';

const { Option } = Select;

function ProductTitleProperty(properties) {
  const { componentProperties, setComponentProperties, color, setColor } =
    properties;
  const [colorModal, setColorModal] = useState(false);
  const insertEditorContext = (value, name) => {
    switch (name) {
      case `name_size_`: {
        setComponentProperties({
          ...componentProperties,
          body_style: {
            ...get(componentProperties, 'body_style'),
            product_name_style: {
              ...get(componentProperties, 'body_style.product_name_style'),
              fontSize: `${value}px`,
            },
          },
        });
        break;
      }
      case `name_align_`: {
        setComponentProperties({
          ...componentProperties,
          body_style: {
            ...get(componentProperties, 'body_style'),
            product_name_style: {
              ...get(componentProperties, 'body_style.product_name_style'),
              textAlign: value,
            },
          },
        });
        break;
      }
      case `name_weight_`: {
        setComponentProperties({
          ...componentProperties,
          body_style: {
            ...get(componentProperties, 'body_style'),
            product_name_style: {
              ...get(componentProperties, 'body_style.product_name_style'),
              fontWeight: value,
            },
          },
        });
        break;
      }
      default: {
        setComponentProperties({
          ...componentProperties,
          body_style: {
            ...get(componentProperties, 'body_style'),
            product_name_style: {
              ...get(componentProperties, 'body_style.product_name_style'),
              color,
            },
          },
        });
        setColorModal(false);
      }
    }
  };

  const productNameColor = get(
    componentProperties,
    'body_style.product_name_style.color',
    ''
  );
  const productNameFontSize = get(
    componentProperties,
    'body_style.product_name_style.fontSize',
    ''
  );
  const productNameTextAlign = get(
    componentProperties,
    'body_style.product_name_style.textAlign',
    ''
  );
  const productNameFontWeight = get(
    componentProperties,
    'body_style.product_name_style.fontWeight',
    ''
  );

  return (
    <>
      <Form.Item initialValue={productNameColor} label="Color">
        <Input
          onClick={() => {
            setColorModal(true);
          }}
          placeholder={productNameColor}
          suffix={
            <HighlightOutlined
              style={{
                color: productNameColor,
                fontSize: '20px',
              }}
            />
          }
        />
      </Form.Item>
      <Form.Item
        name="name_size_"
        initialValue={Number.parseInt(
          productNameFontSize.replace('px', ''),
          10
        )}
        label="Size"
      >
        <Input
          type="number"
          name="name_size_"
          onChange={(event) => {
            const { value, name } = get(event, 'target', {});
            insertEditorContext(value, name);
          }}
        />
      </Form.Item>
      <Form.Item
        name="name_align_"
        initialValue={productNameTextAlign}
        label="Alignment"
      >
        <Radio.Group
          name="name_align_"
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
        name="name_weight_"
        initialValue={productNameFontWeight}
        label="Text Thickness"
      >
        <Select
          placeholder="Select a alignment"
          optionFilterProp="children"
          virtual={false}
          onChange={(value) => {
            insertEditorContext(value, `name_weight_`);
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

export default ProductTitleProperty;
