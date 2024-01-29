import React from 'react';
import './gupshup.less';
import { TIME_FORMAT_WITH_12HOURS } from '../../shared/constant-values';
import { currentDateWithFormat } from '../../shared/date-helper';
import {
  gupshupTemplateMessage,
  parseJSONSafely,
} from '../../shared/function-helper';

function TemplatePreview(properties) {
  const { template, from } = properties;
  return (
    <div
      className={`template-preview-container ${
        from === 'screen'
          ? 'template-screen-preview-height'
          : 'template-modal-preview-height'
      }`}
    >
      <div className="content">
        {template?.header && (
          <div className="content-header">
            {gupshupTemplateMessage(
              parseJSONSafely(template?.example_header),
              template?.header
            )}
          </div>
        )}
        <div
          className={`content-body ${
            from === 'screen' && 'content-modal-body-height'
          }`}
        >
          {gupshupTemplateMessage(
            parseJSONSafely(template?.example_content || []),
            template?.content
          )}
        </div>
        {template?.footer && (
          <div className="content-footer">{template?.footer}</div>
        )}
        <div className="content-time-stamp">
          {currentDateWithFormat(TIME_FORMAT_WITH_12HOURS)}
        </div>
      </div>
    </div>
  );
}

export default TemplatePreview;
