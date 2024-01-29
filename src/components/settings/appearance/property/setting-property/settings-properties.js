import { HighlightOutlined } from '@ant-design/icons';
import { Col, Input, Modal, Row, Slider, Space, Collapse } from 'antd';
import { find, get } from 'lodash';
import React, { useContext, useState } from 'react';
import { SketchPicker } from 'react-color';
import { TenantContext } from '../../../../context/tenant-context';
import { TENANT_MODE_NORMAL } from '../../../../../shared/constant-values';

const { Panel } = Collapse;

function SettingMenu({
  settingProperties,
  setSettingProperties,
  isNormalTenantMode,
}) {
  const width = find(
    settingProperties,
    (item) => item.variable_name === '--layout-body-width'
  );
  const height = find(
    settingProperties,
    (item) => item.variable_name === '--layout-header-height'
  );
  const [color, setColor] = useState('');
  const [variableColorName, setVariableColorName] = useState('');
  const [colorModal, setColorModal] = useState(false);
  const [tenantDetails] = useContext(TenantContext);

  const isNormalTenant =
    get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL;

  const handleGetColor = (variableName) => {
    return get(
      find(settingProperties, (item) => item.variable_name === variableName),
      'variable_value',
      ''
    );
  };

  const handleColorModal = () => {
    return (
      <Modal
        title="Color Picker"
        visible={colorModal}
        onOk={() => {
          setSettingProperties(
            settingProperties.map((item) => {
              if (item.variable_name === variableColorName)
                item.variable_value = color;
              return item;
            })
          );
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

  const handleColorRow = (variableText, variableName) => {
    const variableColor = handleGetColor(variableName);
    return (
      <Row align="center" justify="middle" className="mb-3">
        <Col span={8}>
          <span>{variableText}</span>
        </Col>
        <Col className="color" span={16}>
          <Input
            onClick={() => {
              setColor(variableColor);
              setColorModal(true);
              setVariableColorName(variableName);
            }}
            placeholder={variableColor}
            suffix={
              <HighlightOutlined
                style={{
                  color: variableColor,
                  fontSize: '20px',
                }}
              />
            }
          />
        </Col>
      </Row>
    );
  };

  const handlePageWidth = () => {
    return (
      <div>
        Page width
        <div>
          <Slider
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
            value={parseInt(get(width, 'variable_value', 0), 10)}
            min={80}
            max={100}
            marks={{
              10: '10',
              20: '20',
              30: '30',
              40: '40',
              50: '50',
              60: '60',
              70: '70',
              75: '75',
              80: '80',
              85: '85',
              90: '90',
              95: '95',
            }}
            onChange={(data) => {
              setSettingProperties(
                settingProperties.map((item) => {
                  if (item.variable_name === '--layout-body-width')
                    item.variable_value = `${data}%`;
                  return item;
                })
              );
            }}
          />
        </div>
        <div
          aria-hidden="true"
          onClick={() => {
            setSettingProperties(
              settingProperties.map((item) => {
                if (item.variable_name === '--layout-body-width')
                  item.variable_value = item.default_value;
                return item;
              })
            );
          }}
          style={{ textAlign: 'center', cursor: 'pointer' }}
        >
          <u>Reset to default page width</u>
          &nbsp;(%)
        </div>
      </div>
    );
  };

  const handlePageHeight = () => {
    return (
      <div>
        Header Height
        <div>
          <Slider
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
            value={parseInt(get(height, 'variable_value', 0), 10)}
            min={80}
            max={200}
            marks={{
              80: '80',
              100: '100',
              120: '120',
              140: '140',
              160: '160',
              180: '180',
              200: '200',
            }}
            onChange={(data) => {
              setSettingProperties(
                settingProperties.map((item) => {
                  if (item.variable_name === '--layout-header-height')
                    item.variable_value = `${data}px`;
                  return item;
                })
              );
            }}
          />
        </div>
        <div
          aria-hidden="true"
          onClick={() => {
            setSettingProperties(
              settingProperties.map((item) => {
                if (item.variable_name === '--layout-header-height')
                  item.variable_value = item.default_value;
                return item;
              })
            );
          }}
          style={{ textAlign: 'center', cursor: 'pointer' }}
        >
          <u>Reset to default page height</u>
          &nbsp;(px)
        </div>
      </div>
    );
  };

  return (
    <div className="appearance-properties">
      <div id="settings-properties-page">
        <div className="header-text">Page Settings</div>
        <Space direction="vertical" style={{ width: '100%' }}>
          {isNormalTenant && (
            <Collapse collapsible defaultActiveKey={['1']}>
              <Panel header="Width" key="1">
                {handlePageWidth()}
              </Panel>
            </Collapse>
          )}
          <Collapse collapsible defaultActiveKey={['1']}>
            <Panel header="Color" key="1">
              {handleColorModal()}
              {handleColorRow('Background', '--layout-body-background')}
            </Panel>
          </Collapse>
        </Space>
      </div>
      <br />
      {isNormalTenant && (
        <div id="settings-properties-header">
          <div className="header-text">Header Settings</div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Collapse
              collapsible
              defaultActiveKey={['1']}
              style={{ display: 'none' }}
            >
              <Panel header="Height" key="1">
                {handlePageHeight()}
              </Panel>
            </Collapse>
            <Collapse collapsible defaultActiveKey={['1']}>
              <Panel header="Color" key="1">
                {handleColorRow('Background', '--layout-header-background')}
                {handleColorRow('Text', '--header-text-color')}
                {handleColorRow('Text Hover', '--header-text-hover-color')}
              </Panel>
            </Collapse>
          </Space>
        </div>
      )}
      <br />
      <div id="settings-properties-footer">
        <div className="header-text">Footer Settings</div>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Collapse collapsible defaultActiveKey={['1']}>
            <Panel header="Color" key="1">
              {handleColorRow('Background', '--layout-footer-background')}
              {handleColorRow('Text', '--footer-text-color')}
              {handleColorRow(
                isNormalTenantMode ? 'Text Hover' : 'Text Title',
                '--footer-text-hover-color'
              )}
            </Panel>
          </Collapse>
        </Space>
      </div>
    </div>
  );
}

export default SettingMenu;
