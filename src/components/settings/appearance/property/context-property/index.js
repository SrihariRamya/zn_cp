import React from 'react';
import { get } from 'lodash';
import ProductContextProperty from './product-context-property';
import CategoryContextProperty from './category-context-property';
import TextContextProperty from './text-context-property';
import ImageContextProperty from './image-context-property';
import VideoContextProperty from './video-context-property';
import BannerContextPropery from './banner-context-property';

function ContextProperty({
  contextProperties,
  setContextProperties,
  editorContext,
  setEditorContext,
  webLayout,
}) {
  return (
    <>
      {get(contextProperties, 'appearance_widget.widget_type', '') ===
        'product' && (
        <ProductContextProperty
          setContextProperties={setContextProperties}
          contextProperties={contextProperties}
          editorContext={editorContext}
          setEditorContext={setEditorContext}
          webLayout={webLayout}
        />
      )}
      {get(contextProperties, 'appearance_widget.widget_type', '') ===
        'category' && (
        <CategoryContextProperty
          contextProperties={contextProperties}
          setContextProperties={setContextProperties}
          editorContext={editorContext}
          setEditorContext={setEditorContext}
          webLayout={webLayout}
        />
      )}
      {get(contextProperties, 'appearance_widget.widget_type', '') ===
        'text' && (
        <>
          <TextContextProperty
            contextProperties={contextProperties}
            setContextProperties={setContextProperties}
            editorContext={editorContext}
            setEditorContext={setEditorContext}
          />
        </>
      )}
      {get(contextProperties, 'appearance_widget.widget_type', '') ===
        'image' && (
        <>
          <ImageContextProperty
            contextProperties={contextProperties}
            setContextProperties={setContextProperties}
            editorContext={editorContext}
            setEditorContext={setEditorContext}
          />
        </>
      )}
      {get(contextProperties, 'appearance_widget.widget_type', '') ===
        'video' && (
        <>
          <VideoContextProperty
            contextProperties={contextProperties}
            setContextProperties={setContextProperties}
            editorContext={editorContext}
            setEditorContext={setEditorContext}
          />
        </>
      )}
      {get(contextProperties, 'appearance_widget.widget_type', '') ===
        'banner' && (
        <BannerContextPropery
          contextProperties={contextProperties}
          setContextProperties={setContextProperties}
          editorContext={editorContext}
          setEditorContext={setEditorContext}
          webLayout={webLayout}
        />
      )}
    </>
  );
}

export default ContextProperty;
