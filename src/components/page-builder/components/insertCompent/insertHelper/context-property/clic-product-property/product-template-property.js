import { HighlightOutlined } from '@ant-design/icons';
import { Form, Input, Modal } from 'antd';
import { get } from 'lodash';
import React, { useCallback, useState } from 'react';
import { SketchPicker } from 'react-color';

function ProductTemplateProperty(properties) {
  const {
    componentProperties,
    setComponentProperties,
    setEditorContext,
    editorContext,
    color,
    setColor,
  } = properties;
  const [colorModal, setColorModal] = useState(false);
  const insertEditorContext = () => {
    setComponentProperties({
      ...componentProperties,
      body_style: {
        ...get(componentProperties, 'body_style'),
        product_template_style: {
          ...get(componentProperties, 'body_style.product_template_style'),
          backgroundColor: color,
        },
      },
    });
    setColorModal(false);
  };

  const productTemplateBg = get(
    componentProperties,
    'body_style.product_template_style.backgroundColor',
    ''
  );

  return (
    <>
      <Form.Item initialValue={productTemplateBg} label="Background">
        <Input
          onClick={() => {
            setColorModal(true);
          }}
          placeholder={productTemplateBg}
          suffix={
            <HighlightOutlined
              style={{
                color: productTemplateBg,
                fontSize: '20px',
              }}
            />
          }
        />
      </Form.Item>
      <Modal
        title="Color Picker"
        visible={colorModal}
        onOk={useCallback(() => {
          insertEditorContext();
        }, [color, componentProperties, editorContext, setEditorContext])}
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

export default ProductTemplateProperty;
