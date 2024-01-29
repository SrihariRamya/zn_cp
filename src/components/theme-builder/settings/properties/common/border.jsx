import { Input, InputNumber, Modal, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import { get } from 'lodash';

const Border = ({ setChangeType, setValue, activeElement, type }) => {
  const {
    borderWidth = '0px 0px 0px 0px',
    borderColor = '',
    borderStyle = '',
  } = activeElement.element[`${type}_style`];
  const colBorder = borderWidth.split(' ');
  const [borderTop, setBorderTop] = useState(
    parseInt(colBorder[0].replace('px', ''), 10)
  );
  const [borderRight, setBorderRight] = useState(
    parseInt(colBorder[1].replace('px', ''), 10)
  );
  const [borderBottom, setBorderBottom] = useState(
    parseInt(colBorder[2].replace('px', ''), 10)
  );
  const [borderLeft, setBorderLeft] = useState(
    parseInt(colBorder[3].replace('px', ''), 10)
  );
  const [bStyle, setBStyle] = useState(borderStyle);
  const [bColor, setBColor] = useState(borderColor);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [propertyType, setPropertyType] = useState('');
  const handleBorder = (value, position) => {
    if (value === null || value === undefined) value = 0;
    if (position) {
      setPropertyType('borderWidth');
      // eslint-disable-next-line default-case
      switch (position) {
        case 'top':
          setBorderTop(value);
          break;
        case 'right':
          setBorderRight(value);
          break;
        case 'bottom':
          setBorderBottom(value);
          break;
        case 'left':
          setBorderLeft(value);
          break;
      }
    }
    return null;
  };

  useEffect(() => {
    // eslint-disable-next-line max-len
    const borderData = `${borderTop}px ${borderRight}px ${borderBottom}px ${borderLeft}px`;
    const objectData = {
      borderColor: bColor,
      borderWidth: borderData,
      borderStyle: bStyle,
    };
    setChangeType(propertyType);
    setValue(objectData[propertyType]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borderTop, borderRight, borderBottom, borderLeft, bColor, bStyle]);

  return (
    <table>
      <thead>
        <tr>
          <th colSpan={2}>Border</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Top</td>
          <td>
            <InputNumber
              min={0}
              value={borderTop}
              onChange={(event) => handleBorder(event, 'top')}
            />
          </td>
        </tr>
        <tr>
          <td>Right</td>
          <td>
            <InputNumber
              min={0}
              value={borderRight}
              onChange={(event) => handleBorder(event, 'right')}
            />
          </td>
        </tr>
        <tr>
          <td>Bottom</td>
          <td>
            <InputNumber
              min={0}
              value={borderBottom}
              onChange={(event) => handleBorder(event, 'bottom')}
            />
          </td>
        </tr>
        <tr>
          <td>Left</td>
          <td>
            <InputNumber
              min={0}
              value={borderLeft}
              onChange={(event) => handleBorder(event, 'left')}
            />
          </td>
        </tr>
        <tr>
          <td>Border Color</td>
          <td>
            <Input
              className="color-picker"
              placeholder="#000000"
              value={bColor}
              onClick={() => {
                setIsModalVisible(true);
              }}
            />
          </td>
        </tr>
        <tr>
          <td>Border Style</td>
          <td>
            <Select
              style={{ width: '100%' }}
              virtual={false}
              value={bStyle}
              getPopupContainer={(triggerNode) => triggerNode.parentElement}
              options={[
                {
                  label: 'Dotted',
                  value: 'dotted',
                },
                {
                  label: 'Dashed',
                  value: 'dashed',
                },
                {
                  label: 'Solid',
                  value: 'solid',
                },
                {
                  label: 'Double',
                  value: 'double',
                },
                {
                  label: 'Groove',
                  value: 'groove',
                },
                {
                  label: 'Ridge',
                  value: 'ridge',
                },
                {
                  label: 'Inset',
                  value: 'inset',
                },
                {
                  label: 'Outset',
                  value: 'outset',
                },
              ]}
              onChange={(value) => {
                setBStyle(value);
                setPropertyType('borderStyle');
              }}
            />
          </td>
        </tr>
      </tbody>
      <Modal
        title="Color Picker"
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        width="269px"
        destroyOnClose
      >
        <SketchPicker
          color={bColor}
          onChange={(event) => {
            setPropertyType('borderColor');
            setBColor(get(event, 'hex', ''));
          }}
        />
      </Modal>
    </table>
  );
};

export default Border;
