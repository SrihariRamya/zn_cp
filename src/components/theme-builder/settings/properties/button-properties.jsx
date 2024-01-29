import { Col, Input, InputNumber, Modal, Row, Select, Switch } from 'antd';
import React, {
  useState,
  useEffect,
} from 'react';
import { get, isEmpty } from 'lodash';
import { SketchPicker } from 'react-color';
import { Icons } from '../../icons/icons-list';
import Icon from '../../icons/get-icon';
import { widget_type } from '../../properties-obj/widget-properties-obj';

const ButtonProperties = ({
  setSectionValues,
  activeElement,
  sectionValues,
}) => {
  const { button } = activeElement.element.column_properties;
  const {
    type,
    size,
    shape,
    icon,
    title,
    block,
    icon_position,
    width = '',
    color = '',
    backgroundColor = '',
    is_submit_button = false,
    is_downlaod_button = false,
    btn_align: button_align = '',
  } = button;
  const [buttonType, setButtonType] = useState(type);
  const [buttonSize, setButtonSize] = useState(size);
  const [buttonShape, setButtonShape] = useState(shape);
  const [buttonIcon, setButtonIcon] = useState(icon);
  const [buttonTitle, setButtonTitle] = useState(title);
  const [buttonBlock, setButtonBlock] = useState(block);
  const [changeType, setChangeType] = useState('');
  const [iconPositon, setIconPosition] = useState(icon_position);
  const [buttonWidth, setButtonWidth] = useState(width);
  const [buttonContentColor, setButtonContentColor] = useState(color);
  const [isSubmitButton, setISubmitButton] = useState(is_submit_button);
  const [isDownloadButton, setIsDownloadButton] = useState(is_downlaod_button);
  const [buttonAlign, setButtonAlign] = useState(button_align);
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState(
    backgroundColor
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const handleButtonType = (type)=> {
    setButtonType(type);
    setChangeType('type');
  };

  const handleButtonSize = (size)=> {
    setButtonSize(size);
    setChangeType('size');
  };

  const handleButtonWidth = (width)=> {
    if (width) {
      setButtonWidth(width);
      setChangeType('width');
    }
  };

  const handleButtonAlign = (value)=> {
    setButtonAlign(value);
    setChangeType('btn_align');
  };

  const handleButtonIcon = (icon)=> {
    setButtonIcon(icon);
    setChangeType('icon');
  };

  const handleButtonShape = (shape)=> {
    setButtonShape(shape);
    setChangeType('shape');
  };

  const handleButtonTitleChange = (
    e
  )=> {
    setButtonTitle(e.target.value);
    setChangeType('title');
  };

  const handleBlockButton = (checked)=> {
    setButtonBlock(checked);
    setChangeType('block');
  };

  const handleIconPosition = (value)=> {
    setIconPosition(value);
    setChangeType('icon_position');
  };

  const handleIsSubmitButton = (value)=> {
    setISubmitButton(value);
    setChangeType('is_submit_button');
  };

  const handleIsDownloadButton = (value)=> {
    setIsDownloadButton(value);
    setChangeType('is_downlaod_button');
  };

  useEffect(() => {
    if (changeType) {
      setSectionValues(
        sectionValues.map((sec: { section_uid; row: [] }) => {
          const rowRecursion = (row)=> {
            row.forEach((row) => {
              row.column.forEach((col) => {
                // eslint-disable-next-line max-len
                if (col.column_uid === activeElement.element.column_uid) {
                  const object = {
                    type: buttonType,
                    shape: buttonShape,
                    size: buttonSize,
                    title: buttonTitle,
                    block: buttonBlock,
                    icon: buttonIcon,
                    icon_position: iconPositon,
                    width: `${buttonWidth}px`,
                    color: buttonContentColor,
                    backgroundColor: buttonBackgroundColor,
                    is_submit_button: isSubmitButton,
                    is_downlaod_button: isDownloadButton,
                    btn_align: buttonAlign,
                  };
                  const value = object[changeType];
                  if (changeType.includes('action')) {
                    // eslint-disable-next-line max-len
                    col.column_properties.button.action[changeType] = value;
                  } else {
                    // eslint-disable-next-line max-len
                    col.column_properties.button[changeType] = value;
                  }
                } else if (widget_type.includes(col.widget_type)) {
                  // eslint-disable-next-line max-len
                  if (col.column_properties[col.widget_type].row) {
                    // eslint-disable-next-line max-len
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
    }
  }, [
    buttonShape,
    buttonIcon,
    buttonSize,
    buttonTitle,
    buttonType,
    buttonBlock,
    iconPositon,
    buttonWidth,
    buttonContentColor,
    buttonBackgroundColor,
    isSubmitButton,
    isDownloadButton,
    buttonAlign,
  ]);

  return (
    <div>
      <Row>
        <Col span={24}>
          <table>
            <thead>
              <tr>
                <th colSpan={2}>Button</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Name</td>
                <td>
                  <Input
                    placeholder="Button name"
                    value={buttonTitle}
                    onChange={handleButtonTitleChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Submit Button</td>
                <td>
                  <Switch
                    onChange={handleIsSubmitButton}
                    checked={isSubmitButton}
                  />
                </td>
              </tr>
              <tr>
                <td>Download Button</td>
                <td>
                  <Switch
                    onChange={handleIsDownloadButton}
                    checked={isDownloadButton}
                  />
                </td>
              </tr>
              <tr>
                <td>Button Type</td>
                <td>
                  <Select
                    style={{ width: '100%' }}
                    virtual={false}
                    onChange={handleButtonType}
                    value={buttonType || 'default'}
                    options={[
                      {
                        value: 'default',
                        label: 'Default',
                      },
                      {
                        value: 'primary',
                        label: 'Primary',
                      },
                      {
                        value: 'dashed',
                        label: 'Dashed',
                      },
                      {
                        value: 'link',
                        label: 'Link',
                      },
                      {
                        value: 'text',
                        label: 'Text',
                      },
                    ]}
                  />
                </td>
              </tr>
              <tr>
                <td>Size</td>
                <td>
                  <Select
                    style={{ width: '100%' }}
                    value={buttonSize || 'default'}
                    virtual={false}
                    onChange={handleButtonSize}
                    options={[
                      {
                        value: 'default',
                        label: 'Default',
                      },
                      {
                        value: 'large',
                        label: 'Large',
                      },
                      {
                        value: 'small',
                        label: 'Small',
                      },
                    ]}
                  />
                </td>
              </tr>
              <tr>
                <td>Shape</td>
                <td>
                  <Select
                    style={{ width: '100%' }}
                    value={buttonShape || 'default'}
                    virtual={false}
                    onChange={handleButtonShape}
                    options={[
                      {
                        value: 'default',
                        label: 'Default',
                      },
                      {
                        value: 'circle',
                        label: 'Circle',
                      },
                      {
                        value: 'round',
                        label: 'Round',
                      },
                    ]}
                  />
                </td>
              </tr>
              <tr>
                <td>Icons</td>
                <td>
                  <Select
                    style={{ width: '100%' }}
                    onChange={handleButtonIcon}
                    virtual={false}
                    value={icon}
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
              <tr>
                <td>Button Width</td>
                <td>
                  <InputNumber
                    value={buttonWidth}
                    onChange={handleButtonWidth}
                  />
                </td>
              </tr>
              <tr>
                <td>Button Color</td>
                <td>
                  <Input
                    className="color-picker"
                    placeholder="#000000"
                    value={buttonBackgroundColor}
                    onClick={() => {
                      setIsModalVisible(true);
                      setChangeType('backgroundColor');
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td>Content Color</td>
                <td>
                  <Input
                    className="color-picker"
                    placeholder="#000000"
                    value={buttonContentColor}
                    onClick={() => {
                      setIsModalVisible(true);
                      setChangeType('color');
                    }}
                  />
                </td>
              </tr>
              {!isEmpty(buttonIcon) && !isEmpty(buttonTitle) && (
                <tr>
                  <td>Icons Position</td>
                  <td>
                    <Select
                      style={{ width: '100%' }}
                      virtual={false}
                      value={iconPositon}
                      onChange={handleIconPosition}
                      options={[
                        {
                          value: 'left',
                          label: 'Left',
                        },
                        {
                          value: 'right',
                          label: 'Right',
                        },
                      ]}
                    />
                  </td>
                </tr>
              )}
              <tr>
                <td>Button Align</td>
                <td>
                  <Select
                    style={{ width: '100%' }}
                    virtual={false}
                    options={[
                      {
                        label: 'Center',
                        value: 'center',
                      },
                      {
                        label: 'Left',
                        value: 'left',
                      },
                      {
                        label: 'Right',
                        value: 'right',
                      },
                    ]}
                    value={buttonAlign}
                    onChange={handleButtonAlign}
                  />
                </td>
              </tr>
              <tr>
                <td>Block Button</td>
                <td>
                  <Switch checked={buttonBlock} onChange={handleBlockButton} />
                </td>
              </tr>
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
            changeType === 'color' ? buttonContentColor : buttonBackgroundColor
          }
          onChange={(event) => {
            if (changeType === 'color') {
              setButtonContentColor(get(event, 'hex', ''));
            } else if (changeType === 'backgroundColor') {
              setButtonBackgroundColor(get(event, 'hex', ''));
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default ButtonProperties;
