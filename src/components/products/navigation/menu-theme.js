import { HighlightOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, notification, Row } from 'antd';
import React, { useState, useEffect } from 'react';
import { get, isEmpty } from 'lodash';
import {
  MENU_THEME_ADD_FAILED,
  MENU_THEME_ADD_SUCCESS,
  FAILED_TO_LOAD,
} from '../../../shared/constant-values';

import { createMenuTheme, getMenuTheme } from '../../../utils/api/url-helper';
import ColorPicker from './color-picker-model';

const MenuTheme = () => {
  const [form] = Form.useForm();
  const [bgColor, setBgColor] = useState('');
  const [hoverColor, setHoverColor] = useState('');
  const [menuColor, setMenuColor] = useState('');
  const [colorType, setColorType] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [updateButtonLoding, setUpdateButtonLoding] = useState(false);
  const [menuThemeData, getMenuThemeData] = useState({});

  const fetchMenuTheme = () => {
    getMenuTheme()
      .then((response) => {
        const responseData = get(response, 'data', {});
        const backgroundColor = get(responseData, 'background_color', '');
        const hoverColors = get(responseData, 'hover_color', '');
        const textColor = get(responseData, 'text_color', '');
        setBgColor(backgroundColor);
        setHoverColor(hoverColors);
        setMenuColor(textColor);
        getMenuThemeData(responseData);
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', '') || FAILED_TO_LOAD,
        });
      });
  };
  useEffect(() => {
    fetchMenuTheme();
  }, []);

  const handleColorRow = (variableText, variableName) => {
    return (
      <span>
        <Input
          onClick={() => {
            setOpenModal(true);
            setColorType(variableText);
          }}
          placeholder={variableName}
          suffix={
            <HighlightOutlined
              style={{
                color: variableName,
                fontSize: '20px',
              }}
            />
          }
        />
      </span>
    );
  };

  const handleSave = () => {
    setUpdateButtonLoding(true);
    const parameters = {
      background_color: bgColor,
      text_color: menuColor,
      hover_color: hoverColor,
    };
    createMenuTheme(parameters)
      .then(() => {
        fetchMenuTheme();
        notification.success({ message: MENU_THEME_ADD_SUCCESS });
        setUpdateButtonLoding(false);
      })
      .catch(() => {
        notification.error({ message: MENU_THEME_ADD_FAILED });
      });
  };

  return (
    <div>
      <Form
        form={form}
        className="user-form user-add-form delivery-form"
        layout="vertical"
        onFinish={handleSave}
      >
        <Row gutter={24} style={{ gap: '40px' }}>
          <Col span={21}>
            <Row justify="end">
              <Form.Item>
                <Button
                  loading={updateButtonLoding}
                  htmlType="submit"
                  type="primary"
                >
                  {isEmpty(menuThemeData) ? 'Save' : 'Update'}
                </Button>
              </Form.Item>
            </Row>
          </Col>
          <Col span={10}>
            <Form.Item label="Background Color" name="bgColor">
              {handleColorRow('Background', bgColor)}
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="Menu Category Color" name="menuColor">
              {handleColorRow('Text', menuColor)}
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="Menu Sub Category Color" name="hoverColor">
              {handleColorRow('Hover', hoverColor)}
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {colorType === 'Background' && (
        <ColorPicker
          openModal={openModal}
          setOpenModal={setOpenModal}
          color={bgColor}
          setColor={setBgColor}
        />
      )}
      {colorType === 'Text' && (
        <ColorPicker
          openModal={openModal}
          setOpenModal={setOpenModal}
          color={menuColor}
          setColor={setMenuColor}
        />
      )}
      {colorType === 'Hover' && (
        <ColorPicker
          openModal={openModal}
          setOpenModal={setOpenModal}
          color={hoverColor}
          setColor={setHoverColor}
        />
      )}
    </div>
  );
};

export default MenuTheme;
