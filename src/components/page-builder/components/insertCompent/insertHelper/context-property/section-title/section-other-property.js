import { HighlightOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Switch } from 'antd';
import { get } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';

function SectionOtherProperty(properties) {
  const { componentProperties, noButtonProps, from, setComponentProperties } =
    properties;
  const [colorModal, setColorModal] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [textColor, setTextColor] = useState('');
  const [buttonColor, setButtonColor] = useState('');
  const [buttonTextColor, setButtonTextColor] = useState('');
  const [scroll, setScroll] = useState(true);
  useEffect(() => {
    setScroll(
      get(componentProperties, 'body_style.scroll', 'false') === 'true'
    );
    setTextColor(get(componentProperties, 'body_style.text_style.color'));
    setButtonColor(
      get(componentProperties, 'body_style.button_style.backgroundColor')
    );
    setButtonTextColor(
      get(componentProperties, 'body_style.button_style.color')
    );
  }, [componentProperties]);
  const handleOnClick = (event) => {
    const { name } = get(event, 'target', '');
    setFieldName(name);
    setColorModal(true);
  };
  const handleOnchange = (value) => {
    if (fieldName === 'TextColor') {
      setTextColor(value);
    } else if (fieldName === 'ButtonColor') {
      setButtonColor(value);
    } else {
      setButtonTextColor(value);
    }
  };
  const currentField = (value) => {
    if (value === 'TextColor') {
      return textColor;
    }
    if (value === 'ButtonColor') {
      return buttonColor;
    }
    return buttonTextColor;
  };
  const insertToSectionData = () => {
    if (fieldName === 'TextColor') {
      setComponentProperties({
        ...componentProperties,
        body_style: {
          ...componentProperties.body_style,
          text_style: {
            ...componentProperties?.body_style?.text_style,
            color: textColor,
          },
        },
      });
    } else if (fieldName === 'ButtonColor') {
      setComponentProperties({
        ...componentProperties,
        body_style: {
          ...componentProperties?.body_style,
          backgroundColor: buttonColor,
          button_style: {
            ...componentProperties?.body_style?.button_style,
            backgroundColor: buttonColor,
          },
          button_hover_style: {
            ...componentProperties?.body_style?.button_hover_style,
            color: buttonColor,
            borderColor: buttonColor,
          },
        },
      });
    } else {
      setComponentProperties({
        ...componentProperties,
        body_style: {
          ...componentProperties?.body_style,
          backgroundColor: buttonColor,
          button_style: {
            ...componentProperties?.body_style?.button_style,
            color: buttonTextColor,
            borderColor: buttonTextColor,
          },
          button_hover_style: {
            ...componentProperties?.body_style?.button_hover_style,
            backgroundColor: buttonTextColor,
          },
        },
      });
    }
  };
  const insertEditorContext = (value, name) => {
    if (name === 'scroll') {
      setScroll(value);
    } else {
      insertToSectionData();
      setColorModal(false);
    }
  };
  return (
    <>
      {from !== 'View' && (
        <div>
          <Form.Item
            initialValue={get(
              componentProperties,
              'body_style.text_style.color'
            )}
            label="Text Color"
          >
            <Input
              onClick={(event) => {
                handleOnClick(event);
              }}
              name="TextColor"
              placeholder={get(
                componentProperties,
                'body_style.text_style.color'
              )}
              suffix={
                <HighlightOutlined
                  style={{
                    color: get(
                      componentProperties,
                      'body_style.text_style.color'
                    ),
                    fontSize: '20px',
                  }}
                />
              }
            />
          </Form.Item>
          {!noButtonProps && (
            <>
              <Form.Item
                initialValue={get(
                  componentProperties,
                  'body_style.button_style.backgroundColor'
                )}
                label="Button color"
              >
                <Input
                  onClick={(event) => {
                    handleOnClick(event);
                  }}
                  name="ButtonColor"
                  placeholder={get(
                    componentProperties,
                    'body_style.button_style.backgroundColor'
                  )}
                  suffix={
                    <HighlightOutlined
                      style={{
                        color: get(
                          componentProperties,
                          'body_style.button_style.backgroundColor'
                        ),
                        fontSize: '20px',
                      }}
                    />
                  }
                />
              </Form.Item>
              <Form.Item
                initialValue={get(
                  componentProperties,
                  'body_style.button_style.color'
                )}
                label="Button Text"
              >
                <Input
                  onClick={(event) => {
                    handleOnClick(event);
                  }}
                  name="ButtonTextColor"
                  placeholder={get(
                    componentProperties,
                    'body_style.button_style.color'
                  )}
                  suffix={
                    <HighlightOutlined
                      style={{
                        color: get(
                          componentProperties,
                          'body_style.button_style.color'
                        ),
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
        <div>
          <Form.Item label="Scroll">
            <Switch
              checked={scroll}
              onChange={(value) => {
                setComponentProperties({
                  ...componentProperties,
                  body_style: {
                    ...componentProperties?.body_style,
                    scroll: `${value}`,
                  },
                });
                setScroll(value);
              }}
            />
          </Form.Item>
        </div>
      )}
      <Modal
        title="Color Picker"
        visible={colorModal}
        open={colorModal}
        onOk={useCallback(() => {
          insertEditorContext();
        }, [textColor, buttonColor, buttonTextColor, componentProperties])}
        onCancel={() => setColorModal(false)}
        width="269px"
        destroyOnClose
      >
        <SketchPicker
          color={currentField(fieldName)}
          onChange={(event) => {
            handleOnchange(get(event, 'hex', ''));
          }}
        />
      </Modal>
    </>
  );
}

export default SectionOtherProperty;
