import { Collapse } from 'antd';
import React, { useState, useEffect } from 'react';
import ColorChange from './color-change';
import BoxChange from './box-change';
import FontFamily from './font-family';

const ButtonStyle = ({ activeElement, setChangeType, setValue, ChangeFor }) => {
  const [labelBackgroundColor] = useState('');
  useEffect(() => {
    setChangeType(ChangeFor);
    setValue(labelBackgroundColor);
  }, [ChangeFor, labelBackgroundColor, setChangeType, setValue]);
  return (
    <div>
      <Collapse>
        <Collapse>
          <Collapse.Panel header="Non Selected Button">
            <Collapse>
              <Collapse.Panel header="Border Radius">
                <BoxChange
                  setChangeType={setChangeType}
                  setValue={setValue}
                  activeElement={activeElement}
                  type="variant"
                  isFor="borderRadius"
                />
              </Collapse.Panel>
              <Collapse.Panel header="Border Color">
                <ColorChange
                  setChangeType={setChangeType}
                  setValue={setValue}
                  activeElement={activeElement}
                  type="variant"
                  isFor="borderColor"
                  slug="Border Color"
                />
              </Collapse.Panel>
              <Collapse.Panel header="Button Color">
                <ColorChange
                  setChangeType={setChangeType}
                  setValue={setValue}
                  activeElement={activeElement}
                  type="variant"
                  isFor="backgroundColor"
                  slug="Button Color"
                />
              </Collapse.Panel>
              <Collapse.Panel header="Button Text Color">
                <ColorChange
                  setChangeType={setChangeType}
                  setValue={setValue}
                  activeElement={activeElement}
                  type="variant"
                  isFor="color"
                  slug="Button Text Color"
                />
              </Collapse.Panel>
              <Collapse.Panel header="Button Border Width">
                <BoxChange
                  setChangeType={setChangeType}
                  setValue={setValue}
                  activeElement={activeElement}
                  type="variant"
                  isFor="borderWidth"
                  slug="Button Border Width"
                />
              </Collapse.Panel>
              <Collapse.Panel header="Button Font Family">
                <FontFamily
                  setChangeType={setChangeType}
                  setValue={setValue}
                  activeElement={activeElement}
                  isFor="fontFamily"
                />
              </Collapse.Panel>
            </Collapse>
          </Collapse.Panel>
        </Collapse>
        <Collapse>
          <Collapse.Panel header="Selected Button">
            <Collapse>
              <Collapse.Panel header="Selected Button Color">
                <ColorChange
                  setChangeType={setChangeType}
                  setValue={setValue}
                  activeElement={activeElement}
                  type="variant"
                  isFor="selected_backgroundColor"
                  slug="Selected button Color"
                />
              </Collapse.Panel>
              <Collapse.Panel header="Selected Border Radius">
                <BoxChange
                  setChangeType={setChangeType}
                  setValue={setValue}
                  activeElement={activeElement}
                  type="variant"
                  isFor="selected_borderRadius"
                />
              </Collapse.Panel>
              <Collapse.Panel header="Selected Border Color">
                <ColorChange
                  setChangeType={setChangeType}
                  setValue={setValue}
                  activeElement={activeElement}
                  type="variant"
                  isFor="selected_borderColor"
                  slug="Selected Border Color"
                />
              </Collapse.Panel>
              <Collapse.Panel header="Selected Button Text Color">
                <ColorChange
                  setChangeType={setChangeType}
                  setValue={setValue}
                  activeElement={activeElement}
                  type="variant"
                  isFor="selected_color"
                  slug="Selected Button Text Color"
                />
              </Collapse.Panel>
              <Collapse.Panel header="Selected Button Border Width">
                <BoxChange
                  setChangeType={setChangeType}
                  setValue={setValue}
                  activeElement={activeElement}
                  type="variant"
                  isFor="selected_borderWidth"
                  slug="Button Border Width"
                />
              </Collapse.Panel>
              <Collapse.Panel header="Selected Button Font Family">
                <FontFamily
                  setChangeType={setChangeType}
                  setValue={setValue}
                  activeElement={activeElement}
                  isFor="selected_fontFamily"
                />
              </Collapse.Panel>
            </Collapse>
          </Collapse.Panel>
        </Collapse>
      </Collapse>
    </div>
  );
};

export default ButtonStyle;
