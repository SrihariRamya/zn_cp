import { Col, Spin } from 'antd';
import { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useComponentContext } from '../context/components';
import ComponentDND from './component-dnd';
import InsertComponent from './insert';
import PageComponent from './page';
import { getComponent } from '../helper';
import ThemeComponent from './themes';
import SeoComponent from './seo';

function EditorComponent(properties) {
  const { activeMenu, setActiveMenuItem } = properties;
  const {
    componentValues,
    updateComponentState,
    setScrollToBottom,
    pageBuilderLoader,
  } = useComponentContext();
  const [activeComponent, setActiveComponent] = useState();

  const onWidgetChange = (type) => {
    const data = getComponent(type);
    updateComponentState({
      ...componentValues,
      row: [...componentValues.row, { ...data }],
    });
    setScrollToBottom(true);
  };

  const onThemeChange = (type, value) => {
    updateComponentState({
      ...componentValues,
      globalStyles: { ...componentValues.globalStyles, [type]: value },
    });
  };

  const onButton = (text, link) => {
    const data = getComponent('button');
    data.column[0].component[0].componentProperties = {
      value: [
        {
          btnText: text,
          btnLink: link,
        },
      ],
    };

    updateComponentState({
      ...componentValues,
      row: [...componentValues.row, { ...data }],
    });
    setScrollToBottom(true);
  };

  const handleUpload = (value) => {
    const data = getComponent('imageCarousel');
    data.column[0].component[0].componentProperties = {
      value,
    };
    updateComponentState({
      ...componentValues,
      row: [...componentValues.row, { ...data }],
    });
    setScrollToBottom(true);
  };

  const onActiveComponent = (componentName) => {
    switch (componentName) {
      case 'insert': {
        setActiveComponent(
          <InsertComponent
            onWidgetChange={onWidgetChange}
            handleUpload={handleUpload}
            onButton={onButton}
          />
        );
        break;
      }
      case 'page': {
        setActiveComponent(<PageComponent onWidgetChange={onWidgetChange} />);
        break;
      }
      case 'theme': {
        setActiveComponent(
          <ThemeComponent
            componentValues={componentValues}
            onThemeChange={onThemeChange}
          />
        );
        break;
      }
      case 'seo': {
        setActiveComponent(<SeoComponent />);
        break;
      }
      default: {
        setActiveComponent();
      }
    }
  };

  useEffect(() => {
    if (!isEmpty(componentValues)) onActiveComponent(activeMenu);
  }, [activeMenu, componentValues]);

  const componentStyles = isEmpty(activeMenu)
    ? { width: 'calc(100% - 60px)' }
    : { width: 'calc(100% - 288px)' };

  const flexStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const mergedStyles = {
    ...componentStyles,
    ...flexStyles,
  };

  return (
    <Spin spinning={pageBuilderLoader}>
      {componentValues && (
        <Col span={24} style={{ background: '#F6F4EB', display: 'flex' }}>
          <div style={mergedStyles}>
            <ComponentDND
              componentValues={componentValues}
              setActiveMenuItem={setActiveMenuItem}
              key="component-dnd"
            />
          </div>
          {activeComponent}
        </Col>
      )}
    </Spin>
  );
}
export default EditorComponent;
