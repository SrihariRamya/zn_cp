import { HighlightOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Row, Switch } from 'antd';
import { get, map } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import {
  BUTTON_COLOR,
  TEXT_COLOR,
} from '../../../../../../shared/constant-values';

function ProductButtonProperty({
  contextProperties,
  setEditorContext,
  editorContext,
  noButtonProps,
  from,
}) {
  const [colorModal, setColorModal] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [textColor, setTextColor] = useState('');
  const [buttonColor, setButtonColor] = useState('');
  const [buttonTextColor, setButtonTextColor] = useState('');
  const [scroll, setScroll] = useState(true);

  const textStyleColor = get(
    contextProperties,
    'section_body_style.text_style.color'
  );
  const buttonBgColor = get(
    contextProperties,
    'section_body_style.product_button_style.backgroundColor'
  );
  const productButtonColor = get(
    contextProperties,
    'section_body_style.product_button_style.color'
  );

  useEffect(() => {
    setButtonColor(buttonBgColor);
    setButtonTextColor(productButtonColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextProperties]);

  const handleOnClick = (event) => {
    const { name } = get(event, 'target', '');
    setFieldName(name);
    setColorModal(true);
  };
  const handleOnchange = (value) => {
    if (fieldName === TEXT_COLOR) {
      setTextColor(value);
    } else if (fieldName === BUTTON_COLOR) {
      setButtonColor(value);
    } else {
      setButtonTextColor(value);
    }
  };
  const cuurentField = (value) => {
    if (value === TEXT_COLOR) {
      return textColor;
    }
    if (value === BUTTON_COLOR) {
      return buttonColor;
    }
    return buttonTextColor;
  };
  const insertToSectionData = (column) => {
    if (fieldName === TEXT_COLOR) {
      column.section.section_body_style = {
        ...column.section.section_body_style,
        text_style: {
          ...column.section.section_body_style.text_style,
          color: textColor,
        },
      };
    } else if (fieldName === BUTTON_COLOR) {
      column.section.section_body_style = {
        ...column.section.section_body_style,
        product_button_style: {
          ...column.section.section_body_style.product_button_style,
          backgroundColor: buttonColor,
        },
        button_hover_style: {
          ...column.section.section_body_style.button_hover_style,
          color: buttonColor,
          borderColor: buttonColor,
        },
      };
    } else {
      column.section.section_body_style = {
        ...column.section.section_body_style,
        product_button_style: {
          ...column.section.section_body_style.product_button_style,
          color: buttonTextColor,
          borderColor: buttonTextColor,
        },
        button_hover_style: {
          ...column.section.section_body_style.button_hover_style,
          backgroundColor: buttonTextColor,
        },
      };
    }
  };
  const insertEditorContext = (value, name) => {
    setEditorContext(
      map(editorContext, (item) => {
        map(item.column, (column) => {
          if (
            get(column, 'section.appearance_section_uid') ===
            get(contextProperties, 'appearance_section_uid')
          ) {
            if (name === 'scroll') {
              setScroll(value);
              column.section.section_body_style = {
                ...column.section.section_body_style,
                scroll: `${value}`,
              };
            } else {
              insertToSectionData(column);
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
      {from !== 'View' && (
        <div>
          <Form.Item initialValue={textStyleColor} label="Text Color">
            <Input
              onClick={(event) => {
                handleOnClick(event);
              }}
              name={TEXT_COLOR}
              placeholder={textStyleColor}
              suffix={
                <HighlightOutlined
                  style={{
                    color: textStyleColor,
                    fontSize: '20px',
                  }}
                />
              }
            />
          </Form.Item>
          {!noButtonProps && (
            <>
              <Form.Item initialValue={buttonBgColor} label="Button color">
                <Input
                  onClick={(event) => {
                    handleOnClick(event);
                  }}
                  name={BUTTON_COLOR}
                  placeholder={buttonBgColor}
                  suffix={
                    <HighlightOutlined
                      style={{
                        color: buttonBgColor,
                        fontSize: '20px',
                      }}
                    />
                  }
                />
              </Form.Item>
              <Form.Item initialValue={productButtonColor} label="Button Text">
                <Input
                  onClick={(event) => {
                    handleOnClick(event);
                  }}
                  name="ButtonTextColor"
                  placeholder={productButtonColor}
                  suffix={
                    <HighlightOutlined
                      style={{
                        color: productButtonColor,
                        fontSize: '20px',
                      }}
                    />
                  }
                />
              </Form.Item>
            </>
          )}
        </div>
      )}
      {from === 'View' && (
        <Form.Item>
          <Row>
            <div className="section-scroll">Scroll</div>
            <Switch
              checked={scroll}
              onChange={(value) => {
                insertEditorContext(value, 'scroll');
              }}
            />
          </Row>
        </Form.Item>
      )}
      <Modal
        title="Color Picker"
        visible={colorModal}
        onOk={useCallback(() => {
          insertEditorContext();
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [
          textColor,
          buttonColor,
          buttonTextColor,
          contextProperties,
          editorContext,
          setEditorContext,
        ])}
        onCancel={() => setColorModal(false)}
        width="269px"
        destroyOnClose
      >
        <SketchPicker
          color={cuurentField(fieldName)}
          onChange={(event) => {
            handleOnchange(get(event, 'hex', ''));
          }}
        />
      </Modal>
    </>
  );
}

export default ProductButtonProperty;
