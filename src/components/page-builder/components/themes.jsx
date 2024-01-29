import { Col, Modal, Space, Collapse, Input, Row, Select, Slider } from 'antd';
import { map, get } from 'lodash';
import React, { useState, useContext, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import { HighlightOutlined } from '@ant-design/icons';
import { AppearanceContext } from '../../context/appearance-context';

const { Panel } = Collapse;
const { Option } = Select;

function ThemeComponent(properties) {
  const { onThemeChange, componentValues } = properties;
  const [colorModal, setColorModal] = useState(false);
  const [color, setColor] = useState('');
  const [fontStyle, setFontStyle] = useState('');
  const [, fontFamily] = useContext(AppearanceContext);

  const handleColorModal = () => {
    return (
      <Modal
        title="Color Picker"
        visible={colorModal}
        onOk={() => {
          onThemeChange('background', color);
          setColorModal(false);
        }}
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
    );
  };

  useEffect(() => {
    setFontStyle(get(componentValues, 'globalStyles.fontFamily', false));
    setColor(get(componentValues, 'globalStyles.background', ''));
  }, [componentValues]);

  const handleClickInput = () => {
    const selectedClr = color;
    setColor(selectedClr);
    setColorModal(true);
  };

  const handleChangeWidth = (data) => {
    const value = data;
    const result = value === '' ? 100 : value;
    onThemeChange('width', `${result}%`);
  };

  const handlePageWidth = () => {
    return (
      <div>
        Page width
        <div>
          <Slider
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
            value={Number.parseInt(
              get(componentValues, 'globalStyles.width', 0),
              10
            )}
            min={80}
            max={100}
            marks={{
              80: '80',
              85: '85',
              90: '90',
              95: '95',
            }}
            onChange={(data) => handleChangeWidth(data)}
          />
        </div>
      </div>
    );
  };

  return (
    <Col span={4} className="drawer-content">
      <h2
        style={{ color: '#6E56EC', background: '#F5F7FD', padding: '20px' }}
        className="text-center"
      >
        Theme
      </h2>
      <div className="appearance-properties">
        <div id="settings-properties-page">
          <div className="header-text">Theme Settings</div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Collapse collapsible defaultActiveKey={['1']}>
              <Panel header="Font style" key="1">
                <Row align="center" justify="middle" className="mb-3">
                  <Select
                    value={fontStyle}
                    virtual={false}
                    style={{ width: 200 }}
                    onChange={(value) => {
                      onThemeChange('fontFamily', value);
                    }}
                  >
                    {map(fontFamily, (font) => (
                      <Option key={font} value={font}>
                        <div
                          style={{
                            fontFamily: font,
                            fontSize: '16px',
                          }}
                        >
                          {font}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Row>
              </Panel>
            </Collapse>
          </Space>
        </div>
        <br />
        <div id="settings-properties-header">
          <div className="header-text">Background color</div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Collapse collapsible defaultActiveKey={['1']}>
              <Panel header="Color" key="1">
                {handleColorModal()}
                <Row align="center" justify="middle" className="mb-3">
                  <Input
                    onClick={() => {
                      handleClickInput();
                    }}
                    placeholder={color}
                    suffix={
                      <HighlightOutlined
                        style={{
                          color,
                          fontSize: '20px',
                        }}
                      />
                    }
                  />
                </Row>
              </Panel>
            </Collapse>
          </Space>
        </div>
        <div id="settings-properties-header">
          <div className="header-text">Width</div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Collapse collapsible defaultActiveKey={['1']}>
              <Panel header="Width" key="1">
                {handlePageWidth()}
              </Panel>
            </Collapse>
          </Space>
        </div>
      </div>
    </Col>
  );
}
export default ThemeComponent;
