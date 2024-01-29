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

function ProductDescriptionProperty(properties) {
  const { componentProperties, setComponentProperties, color, setColor } =
    properties;
  const [colorModal, setColorModal] = useState(false);
  const insertEditorContext = (value, name) => {
    switch (name) {
      case `desc_size_`: {
        setComponentProperties({
          ...componentProperties,
          body_style: {
            ...get(componentProperties, 'body_style'),
            product_description_style: {
              ...get(
                componentProperties,
                'body_style.product_description_style'
              ),
              fontSize: `${value}px`,
            },
          },
        });
        break;
      }
      case `desc_align_`: {
        setComponentProperties({
          ...componentProperties,
          body_style: {
            ...get(componentProperties, 'body_style'),
            product_description_style: {
              ...get(
                componentProperties,
                'body_style.product_description_style'
              ),
              textAlign: value,
            },
          },
        });
        break;
      }
      case `desc_weight_`: {
        setComponentProperties({
          ...componentProperties,
          body_style: {
            ...get(componentProperties, 'body_style'),
            product_description_style: {
              ...get(
                componentProperties,
                'body_style.product_description_style'
              ),
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
            product_description_style: {
              ...get(
                componentProperties,
                'body_style.product_description_style'
              ),
              color,
            },
          },
        });
        setColorModal(false);
      }
    }
  };

  const productDesTextColor = get(
    componentProperties,
    'body_style.product_description_style.color',
    ''
  );
  const productDesTextAlign = get(
    componentProperties,
    'body_style.product_description_style.textAlign',
    ''
  );
  const productDesFontSize = get(
    componentProperties,
    'body_style.product_description_style.fontSize',
    ''
  );
  const productDesFontWeight = get(
    componentProperties,
    'body_style.product_description_style.fontWeight',
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
        name="desc_size_"
        initialValue={Number.parseInt(productDesFontSize.replace('px', ''), 10)}
        label="Size"
      >
        <Input
          type="number"
          name="desc_size_"
          onChange={(event) => {
            const { value, name } = get(event, 'target', {});
            insertEditorContext(value, name);
          }}
        />
      </Form.Item>
      <Form.Item
        name="desc_align_"
        initialValue={productDesTextAlign}
        label="Alignment"
      >
        <Radio.Group
          name="desc_align_"
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
        name="desc_weight_"
        initialValue={productDesFontWeight}
        label="Text Thickness"
      >
        <Select
          placeholder="Select a alignment"
          virtual={false}
          optionFilterProp="children"
          onChange={(value) => {
            insertEditorContext(value, `desc_weight_`);
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
        }, [color, componentProperties, setComponentProperties])}
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
