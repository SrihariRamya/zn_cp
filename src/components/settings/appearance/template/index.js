/* eslint-disable react-hooks/exhaustive-deps */
import { Col, notification } from 'antd';
import React, { useState, useEffect } from 'react';
import { get, isEmpty, map } from 'lodash';
import {
  APPEARANCE_TEMPLATE_TYPE_PRODUCT,
  APPEARANCE_TEMPLATE_TYPE_CLIC,
  FAILED_TO_LOAD,
} from '../../../../shared/constant-values';
import ProductTemplateItem from './product/product-template-item';
import './template.less';
import { getAppearanceTemplates } from '../../../../utils/api/url-helper';

const Template = ({ contextProperties, setEditorContext, editorContext }) => {
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
    const productTemplate = !isEmpty(get(contextProperties, 'template', {}))
      ? get(contextProperties, 'template', {})
      : {};
    setSelectedTemplate(productTemplate);
    fetchAppranceTemplate();
  }, [contextProperties]);

  const handleTemplate = (value) => {
    setEditorContext(
      map(editorContext, (item) => {
        map(item.column, (column) => {
          if (
            get(column, 'section.appearance_section_uid') ===
            get(contextProperties, 'appearance_section_uid')
          ) {
            column.section.template = value;
          }
          return column;
        });
        return item;
      })
    );
    setSelectedTemplate(value);
  };
  return (
    <div className="template-list">
      <div className="template-list-container">
        {templates.map((template) => {
          return (
            <>
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
            </>
          );
        })}
      </div>
    </div>
  );
};
export default Template;
