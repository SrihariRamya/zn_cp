/* eslint-disable camelcase */
/* eslint-disable max-len */
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  InputNumber,
  Modal,
  Popover,
  Row,
  Select,
  Switch,
} from 'antd';
import { get, map } from 'lodash';
import React, { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import { v4 as uuid } from 'uuid';
import { createRow } from '../../properties-obj/properties-obj';
import { widget_type } from '../../properties-obj/widget-properties-obj';

const CollapseProperties = ({
  setSectionValues,
  activeElement,
  sectionValues,
}) => {
  const {
    collapse: { row, panel, accordion = false },
  } = activeElement.element.column_properties;
  const [collapsePanel, setCollapsePanel] = useState(panel);
  const [panelRow, setPanelRow] = useState(row);
  const [isEdit, setIsEdit] = useState(false);
  const [activePanel, setActivePanel] = useState < any > '';
  const [headerText, setHeaderText] = useState('');
  const [headerFontSize, setHeaderFontSize] = useState(1);
  const [headerTextAlign, setHeaderTextAlign] = useState('');
  const [headerFontWeight, setHeaderFontWeight] = useState('');
  const [headerFontStyle, setHeaderFontStyle] = useState('');
  const [headerFontColor, setHeaderFontColor] = useState('');
  const [headerPadding, setHeaderPadding] = useState('0px 0px 0px 0px');
  const [panelBackGround, setPanelBackGround] = useState('');
  const [panelPadding, setPanelPadding] = useState('0px 0px 0px 0px');
  const [changeType, setChangeType] = useState('');
  const [property, setProperty] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAccordion, setIsAccordion] = useState(accordion);

  const handleHeaderTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderText(e.target.value);
    setChangeType('header_text');
    setProperty('header');
  };

  const handleFontSize = (value: number | null) => {
    if (value) {
      setHeaderFontSize(value);
      setChangeType('fontSize');
      setProperty('header_style');
    }
  };

  const handleFontStyle = (value) => {
    setHeaderFontStyle(value);
    setChangeType('fontStyle');
    setProperty('header_style');
  };

  const handleFontWeight = (value) => {
    setHeaderFontWeight(value);
    setChangeType('fontWeight');
    setProperty('header_style');
  };

  const handleFontAlign = (value) => {
    setHeaderTextAlign(value);
    setChangeType('textAlign');
    setProperty('header_style');
  };

  const handleIsAccordion = (value) => {
    setIsAccordion(value);
    setChangeType('accordion');
    setProperty('collapse');
  };

  const handleClickEditPanel = (panel) => {
    const {
      header: {
        header_text,
        header_style: {
          color = '',
          fontSize = '',
          textAlign = '',
          fontWeight = '',
          padding = '0px 0px 0px 0px',
          fontStyle = '',
        },
      },
      panel_uid,
      panel_style,
    } = panel;
    setHeaderText(header_text);
    setActivePanel(panel_uid);
    setHeaderFontColor(color);
    setHeaderFontSize(fontSize);
    setHeaderTextAlign(textAlign);
    setHeaderFontStyle(fontStyle);
    setHeaderPadding(padding);
    setHeaderFontWeight(fontWeight);
    setPanelBackGround(panel_style.backgroundColor);
    setPanelPadding(panel_style.padding);
  };

  const handleOk = () => {
    setChangeType('add-panel');
    const panel_object = {
      panel_uid: uuid(),
      header: {
        header_text: '',
        header_style: {
          color: '',
          fontSize: '',
          textAlign: '',
          fontWeight: '',
          padding: '',
          fontStyle: '',
        },
      },
      panel_style: {
        backgroundColor: '',
        padding: '0px 0px 0px 0px',
      },
    };
    setCollapsePanel([...collapsePanel, panel_object]);
    setPanelRow([...panelRow, createRow()]);
    setIsEdit(false);
    setProperty('');
    setActivePanel('');
  };

  useEffect(() => {
    setSectionValues(
      sectionValues.map((sec: { section_uid, row: [] }) => {
        const rowRecursion = (row) => {
          row.forEach((row) => {
            row.column.forEach((col) => {
              if (col.column_uid === activeElement.element.column_uid) {
                const object = {
                  color: headerFontColor,
                  fontSize: headerFontSize,
                  textAlign: headerTextAlign,
                  fontWeight: headerFontWeight,
                  padding: headerPadding,
                  fontStyle: headerFontStyle,
                  header_text: headerText,
                  backgroundColor: panelBackGround,
                  accordion: isAccordion,
                };
                if (changeType) {
                  if (changeType === 'accordion') {
                    col.column_properties.collapse[changeType] =
                      object[changeType];
                  } else if (changeType === 'add-panel') {
                    col.column_properties.collapse.panel = collapsePanel;
                    col.column_properties.collapse.row = panelRow;
                  } else if (property) {
                    // eslint-disable-next-line max-nested-callbacks
                    col.column_properties.collapse.panel.forEach((item) => {
                      if (item.panel_uid === activePanel) {
                        if (property === 'header') {
                          item.header[changeType] = object[changeType];
                        } else if (property === 'header_style') {
                          item.header.header_style[changeType] =
                            object[changeType];
                        } else if (property === 'panel_style') {
                          item.panel_style[changeType] = object[changeType];
                        }
                      }
                    });
                  }
                }
              } else if (widget_type.includes(col.widget_type)) {
                if (col.column_properties[col.widget_type].row) {
                  rowRecursion(col.column_properties[col.widget_type].row);
                }
              } else if (col.row) {
                rowRecursion(col.row);
              }
            });
          });
        };

        if (sec.section_uid === activeElement.section_uid) {
          rowRecursion(sec.row);
        }

        return sec;
      })
    );
  }, [
    collapsePanel,
    panelRow,
    headerFontColor,
    headerText,
    headerFontSize,
    headerFontStyle,
    headerFontWeight,
    headerTextAlign,
    headerPadding,
    panelBackGround,
    panelPadding,
    isAccordion,
  ]);

  return (
    <div>
      <Row>
        <Col span={24}>
          <table>
            <thead>
              <tr>
                <th colSpan={2}>Collapse</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Accordion</td>
                <td>
                  <Switch onChange={handleIsAccordion} checked={isAccordion} />
                </td>
              </tr>
              {activePanel && (
                <>
                  <tr>
                    <td>Header Name</td>
                    <td>
                      <Input
                        value={headerText}
                        onChange={handleHeaderTextChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Text Align</td>
                    <td>
                      <Select
                        virtual={false}
                        style={{ width: '100%' }}
                        value={headerTextAlign}
                        onChange={handleFontAlign}
                        options={[
                          {
                            value: 'left',
                            label: 'Left',
                          },
                          {
                            value: 'right',
                            label: 'Right',
                          },
                          {
                            value: 'center',
                            label: 'Center',
                          },
                          {
                            value: 'justify',
                            label: 'Justify',
                          },
                        ]}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Font Size</td>
                    <td>
                      <InputNumber
                        value={headerFontSize}
                        min={1}
                        onChange={handleFontSize}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Font Weight</td>
                    <td>
                      <Select
                        virtual={false}
                        onChange={handleFontWeight}
                        value={headerFontWeight}
                        style={{ width: '100%' }}
                        options={[
                          {
                            value: '300',
                            label: '300',
                          },
                          {
                            value: '400',
                            label: '400',
                          },
                          {
                            value: '500',
                            label: '500',
                          },
                          {
                            value: '600',
                            label: '600',
                          },
                          {
                            value: '700',
                            label: '700',
                          },
                          {
                            value: '800',
                            label: '800',
                          },
                          {
                            value: '900',
                            label: '900',
                          },
                        ]}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Font Style</td>
                    <td>
                      <Select
                        virtual={false}
                        value={headerFontStyle}
                        onChange={handleFontStyle}
                        style={{ width: '100%' }}
                        options={[
                          {
                            value: 'normal',
                            label: 'Normal',
                          },
                          {
                            value: 'italic',
                            label: 'Italic',
                          },
                        ]}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Font Color</td>
                    <td>
                      <Input
                        className="color-picker"
                        placeholder="#000000"
                        value={headerFontColor}
                        onClick={() => {
                          setIsModalVisible(true);
                          setProperty('header_style');
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Background Color</td>
                    <td>
                      <Input
                        className="color-picker"
                        placeholder="#000000"
                        value={panelBackGround}
                        onClick={() => {
                          setIsModalVisible(true);
                          setProperty('panel_style');
                        }}
                      />
                    </td>
                  </tr>
                </>
              )}
              <tr>
                <td colSpan={2}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleOk}
                  >
                    {isEdit ? 'Update ' : 'Add '}Panel
                  </Button>
                </td>
              </tr>
              {map(collapsePanel, (item) => (
                <Popover
                  key={item.panel_uid}
                  trigger="hover"
                  content={
                    <p>Click to edit {item.header.header_text || 'Panel'}</p>
                  }
                  placement="topLeft"
                >
                  <tr
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleClickEditPanel(item)}
                  >
                    <td colSpan={2}>
                      {item.header.header_text || 'Header Name'}
                    </td>
                  </tr>
                </Popover>
              ))}
            </tbody>
          </table>
        </Col>
      </Row>
      <Modal
        title="Color Picker"
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        width="269px"
        destroyOnClose
      >
        <SketchPicker
          color={
            property === 'header_style' ? headerFontColor : panelBackGround
          }
          onChange={(event) => {
            if (property && property === 'header_style') {
              setHeaderFontColor(get(event, 'hex', ''));
              setChangeType('color');
            } else if (property === 'panel_style') {
              setPanelBackGround(get(event, 'hex', ''));
              setChangeType('backgroundColor');
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default CollapseProperties;
