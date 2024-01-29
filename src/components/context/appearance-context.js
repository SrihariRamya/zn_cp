import { filter, forEach, get, isEmpty } from 'lodash';
import React, { useState, createContext, useEffect } from 'react';
import {
  getAppearanceAttributeFontFamily,
  getAppearanceAttributeFontSize,
} from '../../utils/api/url-helper';

export const AppearanceContext = createContext();

export const AppearanceProvider = (properties) => {
  const [fontSize, setFontSize] = useState([]);
  const [fontFamily, setFontFamily] = useState([]);
  const fetchData = async () => {
    const appearanceAttribute = await Promise.all([
      getAppearanceAttributeFontSize(),
      getAppearanceAttributeFontFamily(),
    ]);
    setFontSize(
      get(appearanceAttribute, '[0].data', []).map(
        (item) => `${get(item, 'font_size')}px`
      )
    );
    setFontFamily(
      get(appearanceAttribute, '[1].data', []).map(
        (item) => `${get(item, 'font_family')}`
      )
    );
    const getFontFamilyUrl = filter(
      get(appearanceAttribute, '[1].data'),
      (index) => !isEmpty(index.font_family_url)
    );
    forEach(getFontFamilyUrl, (index) => {
      const fontFamilyLoad = new FontFace(
        index.font_family,
        `url(${index.font_family_url})`
      );
      fontFamilyLoad
        .load()
        .then((load) => {
          document.fonts.add(load);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(
            'error in font loading -',
            get(index, 'font_family', ''),
            ':',
            error
          );
        });
    });
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AppearanceContext.Provider value={[fontSize, fontFamily]}>
      {properties.children}
    </AppearanceContext.Provider>
  );
};
