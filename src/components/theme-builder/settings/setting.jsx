/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable complexity */
import {
  Col,
  Collapse,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Switch,
} from 'antd';
import { get, isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import Icon from '../icons/get-icon';
import { Icons } from '../icons/icons-list';
import CommonProperties from './properties/common/common-properties';
import { title_style as titleStyle } from '../properties-obj/properties-obj';
import './style.css';
import LabelStyle from './properties/label/label';
import ButtonStyle from './properties/button';
import VariantSelectorStyle from './properties/variant-selector';
import ImageViewerStyle from './properties/image-viewer';

const Settings = ({
  value,
  sectionValues,
  activeElement,
  propertiesType,
  isCustomComponent,
  componentName,
  componentIcon,
  setSectionValues,
  setComponentName,
  setComponentIcon,
  dataSource,
}) => {
  const section_propeties = get(value, 'section_properties', {});
  const title = get(section_propeties, 'title', '');
  const data_source = get(section_propeties, 'data_source', '');
  const where = get(section_propeties, 'where');
  const title_style = get(title, 'title_style');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [titleColor, setTitleColor] = useState(get(title_style, 'color'));
  const [changeType, setChangeType] = useState('');
  const [section_title, setSectionTitle] = useState(
    get(title, 'section_title')
  );
  const [fontSize, setFontSize] = useState(get(title_style, 'fontSize'));
  const [textAlign, setTextAlign] = useState(get(title_style, 'textAlign'));
  const [fontWeight, setFontWeight] = useState(get(title_style, 'fontWeight'));
  const [fontStyle, setFontStyle] = useState(get(title_style, 'fontStyle'));
  const [showTitle, setshowTitle] = useState(get(title, 'show_title'));
  const [sectionDataSource, setSectionDataSource] = useState(data_source);
  const [sectionWhere, setSectionWhere] = useState(where);

  const handleChange = (value, type) => {
    setChangeType(type);
    // eslint-disable-next-line default-case
    switch (type) {
      case 'show_title':
        setshowTitle(value);
        break;
      case 'data_source':
        setSectionDataSource(value);
        break;
      case 'where':
        setSectionWhere(value);
        break;
      case 'section_title':
        setSectionTitle(value);
        break;
      case 'fontSize':
        setFontSize(value);
        break;
      case 'fontStyle':
        setFontStyle(value);
        break;
      case 'fontWeight':
        setFontWeight(value);
        break;
      case 'textAlign':
        setTextAlign(value);
        break;
      case 'componentName':
        setComponentName(value);
        break;
      case 'icon':
        setComponentIcon(value);
        break;
    }
  };

  useEffect(() => {
    if (propertiesType === 'section' && isEmpty(activeElement.element.row)) {
      return message.error('Please Add Row');
    }

    const color = titleColor;
    const section_object = {
      color,
      fontSize,
      textAlign,
      fontWeight,
      fontStyle,
      show_title: showTitle,
      section_title,
      data_source: sectionDataSource,
      where: sectionWhere,
    };
    if (changeType) {
      setSectionValues(
        sectionValues.map((sec) => {
          if (sec.section_uid === value.section_uid) {
            if (
              changeType === 'color' ||
              changeType === 'fontSize' ||
              changeType === 'textAlign' ||
              changeType === 'fontWeight' ||
              changeType === 'fontStyle'
            ) {
              sec.section_properties.title.title_style[changeType] =
                section_object[changeType];
            } else if (changeType === 'data_source' || changeType === 'where') {
              sec.section_properties[changeType] = section_object[changeType];
            } else if (
              changeType === 'show_title' ||
              changeType === 'section_title'
            ) {
              if (changeType === 'show_title') {
                sec.section_properties.title[changeType] =
                  section_object[changeType];
                sec.section_properties.title.title_style = {
                  ...sec.section_properties.title.title_style,
                  ...titleStyle,
                };
              } else {
                sec.section_properties.title[changeType] =
                  section_object[changeType];
              }
            }
          }

          return sec;
        })
      );
    }
  }, [
    titleColor,
    fontSize,
    textAlign,
    fontStyle,
    fontWeight,
    fontStyle,
    section_title,
    showTitle,
    sectionDataSource,
    sectionWhere,
  ]);

  return (
    <div>
      {isCustomComponent && (
        <table>
          <thead>
            <tr>
              <th colSpan={2}> Custom Component</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Component Name</td>
              <td>
                <Input
                  value={componentName}
                  onChange={(e) =>
                    handleChange(e.target.value, 'componentName')
                  }
                />
              </td>
            </tr>
            <tr>
              <td>Icons</td>
              <td>
                <Select
                	virtual={false}
                  style={{ width: '100%' }}
                  onChange={(value) => handleChange(value, 'icon')}
                  value={componentIcon}
                  showSearch
                >
                  {Icons.map((item) => (
                    <Select.Option key={item} value={item}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                        }}
                      >
                        <Icon type={item} />
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </td>
            </tr>
          </tbody>
        </table>
      )}
      {propertiesType === 'section' &&
        !isEmpty(activeElement) &&
        activeElement.element.row && (
          <Row>
            <Col span={24} className="elements">
              <Col span={24}>
                <Col span={24}>
                  <Col>
                    <h3
                      style={{
                        padding: '5px 10px',
                        textAlign: 'center',
                        textTransform: 'capitalize',
                      }}
                    >
                      Section Properties
                    </h3>
                  </Col>
                  <Col span={24}>
                    <Col span={24}>
                      <table>
                        <tbody>
                          <tr>
                            <td colSpan={2} style={{ padding: '0' }}>
                              <thead>
                                <tr>
                                  <th colSpan={2}>
                                    <p>Data Source</p>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td colSpan={2}>
                                    <Input
                                      placeholder="Data Source...."
                                      value={sectionDataSource}
                                      onChange={(e) =>
                                        handleChange(
                                          e.target.value,
                                          'data_source'
                                        )
                                      }
                                    />
                                  </td>
                                </tr>
                              </tbody>
                            </td>
                          </tr>
                          <tr>
                            <td>Where</td>
                            <td>
                              <Input
                                placeholder="Condition...."
                                value={sectionWhere}
                                onChange={(e) =>
                                  handleChange(e.target.value, 'where')
                                }
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Show Title</td>
                            <td>
                              <Switch
                                checked={showTitle}
                                onChange={(value) =>
                                  handleChange(value, 'show_title')
                                }
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Col>
                    {showTitle && (
                      <Col span={24}>
                        <table>
                          <thead>
                            <tr>
                              <th colSpan={2}>Section Title</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Title</td>
                              <td>
                                <Input
                                  placeholder="Enter Title.."
                                  value={section_title}
                                  onChange={(e) =>
                                    handleChange(
                                      e.target.value,
                                      'section_title'
                                    )
                                  }
                                />
                              </td>
                            </tr>
                            <tr>
                              <td>Color</td>
                              <td>
                                <Input
                                  className="color-picker"
                                  maxLength={7}
                                  value={titleColor}
                                  style={{ width: '100%' }}
                                  placeholder="#ffffff"
                                  onClick={() => {
                                    setChangeType('color');
                                    setIsModalVisible(true);
                                  }}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td>Align</td>
                              <td>
                                <Select
                                	virtual={false}
                                  style={{ width: '100%' }}
                                  value={textAlign}
                                  onChange={(value) =>
                                    handleChange(value, 'textAlign')
                                  }
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
                                  value={fontSize}
                                  min={1}
                                  onChange={(value) =>
                                    value && handleChange(value, 'fontSize')
                                  }
                                />
                              </td>
                            </tr>
                            <tr>
                              <td>Font Style</td>
                              <td>
                                <Select
                                	virtual={false}
                                  style={{ width: '100%' }}
                                  value={fontStyle}
                                  onChange={(value) =>
                                    handleChange(value, 'fontStyle')
                                  }
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
                              <td>Font Weight</td>
                              <td>
                                <Select
                                	virtual={false}
                                  style={{ width: '100%' }}
                                  value={fontWeight}
                                  onChange={(value) =>
                                    handleChange(value, 'fontWeight')
                                  }
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
                                  ]}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </Col>
                    )}
                  </Col>
                  <Col span={24}>
                    <CommonProperties
                      key={`section_${activeElement.element.column_uid}`}
                      setSectionValues={setSectionValues}
                      activeElement={activeElement}
                      sectionValues={sectionValues}
                      type={propertiesType}
                      dataSource={dataSource}
                    />
                  </Col>
                </Col>
              </Col>
            </Col>
          </Row>
        )}
      {propertiesType === 'row' && activeElement.element_type === 'row' && (
        <div className="elements">
          <Row>
            <Col span={24}>
              <h3
                style={{
                  padding: '5px 10px',
                  textAlign: 'center',
                  textTransform: 'capitalize',
                }}
              >
                Row Properties
              </h3>
            </Col>
            <Col span={24}>
              <CommonProperties
                key={`row_${activeElement.element.column_uid}`}
                setSectionValues={setSectionValues}
                activeElement={activeElement}
                sectionValues={sectionValues}
                type={propertiesType}
                dataSource={dataSource}
              />
            </Col>
          </Row>
        </div>
      )}
      {propertiesType === 'column' &&
        activeElement.element_type === 'column' && (
          <>
            <div className="elements" key={activeElement.element.column_uid}>
              <Row>
                <Col span={24}>
                  <h3
                    style={{
                      padding: '5px 10px',
                      textAlign: 'center',
                      textTransform: 'capitalize',
                    }}
                  >
                    Column Properties
                  </h3>
                </Col>
              </Row>
              <Collapse>
                <Collapse.Panel header="Common Styles">
                  <CommonProperties
                    key={`column_${activeElement.element.column_uid}`}
                    setSectionValues={setSectionValues}
                    activeElement={activeElement}
                    sectionValues={sectionValues}
                    type={propertiesType}
                    dataSource={dataSource}
                  />
                </Collapse.Panel>
                {activeElement.element.widget_type === 'label' && (
                  <Collapse.Panel header="Label Properties">
                    <LabelStyle
                      key={activeElement.element.column_uid}
                      setSectionValues={setSectionValues}
                      activeElement={activeElement}
                      sectionValues={sectionValues}
                    />
                  </Collapse.Panel>
                )}
                {activeElement.element.widget_type === 'button' &&
                  activeElement.element.column_uid !==
                    'd403bf0f-caa9-44d8-ae69-fe2dfd22fd36' && (
                    <Collapse.Panel header="Button Style">
                      <ButtonStyle
                        key={activeElement.element.column_uid}
                        setSectionValues={setSectionValues}
                        activeElement={activeElement}
                        sectionValues={sectionValues}
                      />
                    </Collapse.Panel>
                  )}
                {activeElement.element.widget_type === 'image_viewer' && (
                  <Collapse.Panel header="Image Carousel Align">
                    <ImageViewerStyle
                      key={activeElement.element.column_uid}
                      setSectionValues={setSectionValues}
                      activeElement={activeElement}
                      sectionValues={sectionValues}
                    />
                  </Collapse.Panel>
                )}
                {activeElement.element.widget_type === 'buy_now_button' &&
                  activeElement.element.column_uid !==
                    'd403bf0f-caa9-44d8-ae69-fe2dfd22fd36' && (
                    <Collapse.Panel header="Button Style">
                      <ButtonStyle
                        key={activeElement.element.column_uid}
                        setSectionValues={setSectionValues}
                        activeElement={activeElement}
                        sectionValues={sectionValues}
                      />
                    </Collapse.Panel>
                  )}
                {activeElement.element.widget_type === 'variant_selector' && (
                  <Collapse.Panel header="Variant Selector">
                    <VariantSelectorStyle
                      key={activeElement.element.column_uid}
                      setSectionValues={setSectionValues}
                      activeElement={activeElement}
                      sectionValues={sectionValues}
                    />
                  </Collapse.Panel>
                )}
              </Collapse>
            </div>
          </>
        )}
      <Modal
        title="Color Picker"
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        width="269px"
        destroyOnClose
      >
        <SketchPicker
          color={titleColor}
          onChange={(event) => setTitleColor(get(event, 'hex', ''))}
        />
      </Modal>
    </div>
  );
};

export default Settings;
