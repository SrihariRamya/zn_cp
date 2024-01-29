import React, { useState } from 'react';
import { ColumnHeightOutlined } from '@ant-design/icons';
import { get } from 'lodash';
import TextComponent from './contents/text';
import ImageComponent from './contents/image-component/image';
import {
  addClass,
  handleDragEnd,
  handleDragLeave,
  handleOnDragOver,
  handleOnDragStart,
  handleOnDrop,
  removeClass,
} from '../helper';
import { useComponentContext } from '../context/components';
import EditorPopoverComponent from './editor-popover-component';
import ImageCarouselComponent from './insertCompent/image-carousel';
import ButtonComponent from './insertCompent/button';
import EmbedComponent from './contents/embed';
import ProductItemSlider from './insertCompent/viewHelper/product-item-slider';
import CategoryItem from './insertCompent/viewHelper/category-item';
import VideoPreview from './contents/video-component/video-preview';
import YoutubePlayer from './contents/video-component/youtube-player-video';

function SelectComponent(properties) {
  const { componentItem, componentSource, isDragging } = properties;
  const { componentType: compType, componentUid } = componentItem;
  const comp = componentItem;
  if (compType === 'product') {
    return <ProductItemSlider component={comp} />;
  }
  if (compType === 'category') {
    return <CategoryItem component={comp} />;
  }
  if (compType === 'text') {
    return (
      <TextComponent
        comp={comp}
        open={componentUid === componentSource && !isDragging}
      />
    );
  }
  if (compType === 'dummy') {
    return <div style={{ width: '100%' }} />;
  }
  if (compType === 'image') {
    return <ImageComponent comp={comp} />;
  }
  if (compType === 'embed') {
    return <EmbedComponent comp={comp} />;
  }
  if (compType === 'imageCarousel') {
    return <ImageCarouselComponent comp={comp} />;
  }
  if (compType === 'button') {
    return <ButtonComponent comp={comp} />;
  }
  if (compType === 'video') {
    return <VideoPreview comp={comp} />;
  }
  if (compType === 'youTubeVideo') {
    return <YoutubePlayer comp={comp} />;
  }
}

function Component(properties) {
  const { component } = properties;
  const [initialPos, setInitialPos] = useState(0);
  const [initialSize, setInitialSize] = useState(0);
  const {
    updateComponentJsonAfterDND,
    componentValues,
    componentSource,
    setComponentSource,
    componentType,
    setComponentType,
    setDraggingDirection,
    draggingDirection,
    isDragging,
    setIsDragging,
    productModalVisible,
    modalVisible,
    buttonModalVisible,
    embedModalVisible,
    videoModalVisible,
    imageActionModal,
    imageModal,
    categoryModalVisible,
    editCarousel,
    updateComponentStyle,
  } = useComponentContext();

  const type = 'component';

  const onDragStart = (event) => {
    setIsDragging(true);
    const values = handleOnDragStart({ event });
    if (values) {
      const { componentType: compType, id } = values;
      setComponentType(compType);
      setComponentSource(id);
    }
  };

  const onDragOver = (event) => {
    if (
      !componentSource ||
      !componentType ||
      !componentValues ||
      !draggingDirection
    )
      return;
    const position = handleOnDragOver({
      event,
      componentSource,
      componentValues,
      draggingDirection,
    });
    if (position) {
      setDraggingDirection({ ...draggingDirection, current: position });
    }
  };

  const onDrop = (event) => {
    if (
      !componentSource ||
      !componentType ||
      !draggingDirection ||
      !componentValues
    )
      return;
    const id = handleOnDrop({
      event,
      componentType,
      componentSource,
      componentValues,
    });
    if (!id) return;
    const values = {
      source: componentSource,
      target: id,
    };
    updateComponentJsonAfterDND({ ...values });
  };

  const onDragEnd = (event) => {
    handleDragEnd(event);
    setIsDragging(false);
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const onDragLeave = (event) => {
    handleDragLeave({ event, componentSource });
  };

  const onDoubleClick = (componentUid) => {
    setComponentSource(componentUid);
    removeClass({ classNames: 'resize-container,active,dragging,click' });
    addClass({ id: componentUid, classNames: 'resize-container,click' });
  };

  const onClick = (event, comp) => {
    event.preventDefault();
    event.stopPropagation();
    removeClass({ classNames: 'resize-container,click,mouse,active,dragging' });
    const { componentUid } = comp;
    setComponentSource(componentUid);
    addClass({ id: componentUid, classNames: 'resize-container' });
  };

  const onMouseDown = (event) => {
    event.stopPropagation();
    const { clientX, clientY } = event;
    const original = {
      clientX,
      clientY,
    };
    setDraggingDirection({ ...draggingDirection, original });
  };

  return (
    <>
      {component.map((componentItem) => {
        const {
          componentType: compType,
          componentUid,
          componentStyle,
          parentUid,
        } = componentItem;
        return (
          <EditorPopoverComponent
            id={componentUid}
            componentType={`${compType}_component`}
            key={componentUid}
            open={
              componentUid === componentSource &&
              !isDragging &&
              !productModalVisible &&
              !modalVisible &&
              !buttonModalVisible &&
              !embedModalVisible &&
              !videoModalVisible &&
              !imageActionModal &&
              !imageModal &&
              !categoryModalVisible &&
              !editCarousel
            }
          >
            <div
              style={{
                width: '100%',
                position: 'relative',
                height: '100%',
                border: '2px solid transparent',
                ...componentStyle,
              }}
              key={componentUid}
              id={componentUid}
              draggable
              className="draggable"
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDoubleClick={() => onDoubleClick(componentUid)}
              onClick={(event) => onClick(event, componentItem)}
              onMouseDown={onMouseDown}
              onDrop={onDrop}
              data-component-type={type}
              aria-hidden="true"
            >
              {compType &&
                SelectComponent({ componentItem, componentSource, isDragging })}
              {(compType === 'image' || compType === 'youTubeVideo') &&
                parentUid === componentSource && (
                  <>
                    <div
                      style={{
                        border: '1px solid #664BEB',
                        width: '100%',
                        position: 'absolute',
                        bottom: '0px',
                      }}
                    />
                    <div
                      className="drag"
                      draggable="true"
                      key="bottom-div"
                      id="bottom-div"
                      onDragStart={(event) => {
                        event.stopPropagation();
                        const resizable = document.querySelector(
                          `#${CSS.escape(componentUid)}`
                        );
                        setInitialPos(event.clientY);
                        setInitialSize(resizable?.offsetHeight);
                        setIsDragging(true);
                      }}
                      onDrag={(event) => {
                        event.stopPropagation();
                        const resizable = document.querySelector(
                          `#${CSS.escape(componentUid)}`
                        );
                        const resizeHeigh =
                          initialSize + event.clientY - initialPos;
                        resizable.style.height = `${resizeHeigh}px`;
                      }}
                      onDragEnd={(event) => {
                        event.stopPropagation();
                        const resizedHeight =
                          initialSize - initialPos + event.clientY;
                        updateComponentStyle({
                          id: componentUid,
                          key: 'height',
                          value: `${resizedHeight}px`,
                        });
                        setIsDragging(false);
                      }}
                      style={{
                        position: 'absolute',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        left: `${
                          get(
                            document.querySelector(
                              `#${CSS.escape(componentUid)}`
                            ),
                            'offsetWidth'
                          ) /
                            2 -
                          10
                        }px`,
                        bottom: '-8px',
                        cursor: 'n-resize',
                        zIndex: 6,
                      }}
                    >
                      <ColumnHeightOutlined style={{ fontSize: '23px' }} />
                    </div>
                  </>
                )}
            </div>
          </EditorPopoverComponent>
        );
      })}
    </>
  );
}

export default Component;
