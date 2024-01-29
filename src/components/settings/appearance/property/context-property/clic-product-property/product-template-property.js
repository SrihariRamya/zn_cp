import { HighlightOutlined } from '@ant-design/icons';
import { Form, Input, Modal } from 'antd';
import { get, map } from 'lodash';
import React, { useCallback, useState } from 'react';
import { SketchPicker } from 'react-color';

function ProductTemplateProperty({
  contextProperties,
  setEditorContext,
  editorContext,
  color,
  setColor,
}) {
  const [colorModal, setColorModal] = useState(false);
  const insertEditorContext = () => {
    setEditorContext(
      map(editorContext, (item) => {
        map(item.column, (column) => {
          if (
            get(column, 'section.appearance_section_uid') ===
            get(contextProperties, 'appearance_section_uid')
          ) {
            column.section.section_body_style.product_template_style = {
              backgroundColor: color,
            };
            setColorModal(false);
          }
          return column;
        });
        return item;
      })
    );
  };

  const productTemplateBg = get(
    contextProperties,
    'section_body_style.product_template_style.backgroundColor',
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

export default ProductTemplateProperty;
