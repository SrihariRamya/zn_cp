import React from 'react';
import { Button, Card, Space, Tag } from 'antd';
import { ReactComponent as EyeIcon } from '../../assets/icons/clic/noun-eye.svg';
import { ReactComponent as EditIcon } from '../../assets/icons/clic/noun-edit.svg';

const { Meta } = Card;

function TemplateItem(properties) {
  const { template, handlePreview, handleRedirectEdit, handleApproveTemplate } =
    properties;
  return (
    <Card className="template-list-card" bordered={false}>
      <Meta
        title={
          <div className="text-align-center">
            <div className="mt-10">
              <img
                src={template?.image}
                alt="template_image"
                className="template-image"
              />
            </div>
            <div className="template-name">{template?.template_name}</div>
            <div className="template-type">
              <Tag>{template?.template_type}</Tag>
            </div>
          </div>
        }
        description={
          <div className="mt-10">
            <div className="template-content">{template?.content}</div>
            <div className="flex-bwn preview-submit-button">
              <Space>
                <EyeIcon
                  onClick={() => handlePreview(template)}
                  style={{ cursor: 'pointer' }}
                />
                <EditIcon
                  onClick={() => handleRedirectEdit(template?.template_uid)}
                  style={{ cursor: 'pointer' }}
                />
              </Space>
              <Button
                type="primary"
                onClick={() => handleApproveTemplate(template)}
              >
                Approve
              </Button>
            </div>
          </div>
        }
      />
    </Card>
  );
}

export default TemplateItem;
