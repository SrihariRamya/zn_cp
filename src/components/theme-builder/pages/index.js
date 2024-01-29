import * as React from 'react';
import { map } from 'lodash';
import SectionComponent from './section-comp';

const ProductLandingPage = ({
  dataSource,
  activeElement,
  setActiveElement,
  sectionValues,
  setSectionValues,
  setPropertiesType,
  propertiesType,
}) => {
  return map(sectionValues, (section) => (
    <SectionComponent
      key={section.section_uid}
      section={section}
      dataSource={dataSource}
      setActiveElement={setActiveElement}
      sectionValues={sectionValues}
      setSectionValues={setSectionValues}
      setPropertiesType={setPropertiesType}
      activeElement={activeElement}
      propertiesType={propertiesType}
    />
  ));
};

export default ProductLandingPage;
