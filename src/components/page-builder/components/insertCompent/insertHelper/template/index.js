import { Col, notification } from 'antd';
import React, { useState, useEffect } from 'react';
import { get, isEmpty } from 'lodash';
import {
  APPEARANCE_TEMPLATE_TYPE_PRODUCT,
  APPEARANCE_TEMPLATE_TYPE_CLIC,
  FAILED_TO_LOAD,
} from '../../../../../../shared/constant-values';
import ProductTemplateItem from './product/product-template-item';
import './template.less';
import { getAppearanceTemplates } from '../../../../../../utils/api/url-helper';

function Template(properties) {
  const { componentProperties, setComponentProperties } = properties;
  const [selectedTemplate, setSelectedTemplate] = useState({});
  const [templates, setTemplates] = useState([]);

  const fetchAppranceTemplate = () => {
    getAppearanceTemplates()
      .then((resp) => {
        setTemplates(get(resp, 'data', []));
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  useEffect(() => {
    const productTemplate = isEmpty(get(componentProperties, 'template', {}))
      ? {}
      : get(componentProperties, 'template', {});
    setSelectedTemplate(productTemplate);
    fetchAppranceTemplate();
  }, [componentProperties.template]);

  const handleTemplate = (value) => {
    setComponentProperties({ ...componentProperties, template: value });
    setSelectedTemplate(value);
  };
  return (
    <div className="template-list">
      <div className="template-list-container">
        {templates.map((template) => {
          return (
            <div key={get(template, 'id')}>
              {[
                APPEARANCE_TEMPLATE_TYPE_PRODUCT,
                APPEARANCE_TEMPLATE_TYPE_CLIC,
              ].includes(get(template, 'template_type', '')) && (
                <Col span={16} className="product-list">
                  <ProductTemplateItem
                    template={template}
                    spanCount={19}
                    selectedTemplate={selectedTemplate}
                    handleTemplate={(value) => {
                      handleTemplate(value);
                    }}
                    isTemplate
                    webLayout
                  />
                </Col>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Template;
