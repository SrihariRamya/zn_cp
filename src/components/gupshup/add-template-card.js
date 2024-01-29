import React from 'react';
import { Card } from 'antd';

const { Meta } = Card;

function AddTemplateCard(properties) {
  const { data, handleRedirectEdit } = properties;
  return (
    <Card
      className="template-list-card template-add-new-template-item cursor-pointer"
      bordered={false}
      onClick={() => handleRedirectEdit()}
    >
      <Meta
        title={
          <div className="text-align-center">
            <div>
              <img
                src={data?.image}
                alt="template_image"
                className="template-dummy-image"
              />
            </div>
            <div className="template-dummy-text click-text">{data?.text}</div>
          </div>
        }
        description={undefined}
      />
    </Card>
  );
}

export default AddTemplateCard;
