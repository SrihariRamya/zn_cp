import { get } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import Banner from '../../../../banner-management';

function BannerContextPropery({
  editorContext,
  contextProperties,
  setEditorContext,
}) {
  const bannerReference = useRef();
  const [, setShowContainer] = useState(false);
  const [sectionArray, setSectionArray] = useState([]);
  useEffect(() => {
    editorContext.forEach((row) => {
      get(row, 'column', []).forEach((column) => {
        if (
          get(column, 'section.appearance_section_uid') ===
          get(contextProperties, 'appearance_section_uid')
        ) {
          setSectionArray(get(column, 'section.sectionArray', []));
        }
      });
    });
  }, [
    contextProperties,
    contextProperties.sectionArray.length,
    sectionArray,
    editorContext,
  ]);
  const showContent = (value) => {
    setShowContainer(value);
  };
  return (
    <Banner
      ref={bannerReference}
      showContent={showContent}
      editorContext={editorContext}
      contextProperties={contextProperties}
      setEditorContext={setEditorContext}
      BannerId={contextProperties.sectionArray.map((index) => ({
        banner_id: index.banner_id,
      }))}
      tabKey="web"
      renderArea="appearance"
    />
  );
}

export default BannerContextPropery;
