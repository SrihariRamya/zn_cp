import React from 'react';
import { Card } from 'antd';

const LeadsCard = ({ data }) => {
  return (
    <Card className="mt-10 lead-card">
      <div>
        <main>
          <h4>{data.title}</h4>
          <span>
            <h4 className="sub-title">{data.subtitle}</h4>
            <h5>{data.updatedAt}</h5>
          </span>
        </main>
      </div>
    </Card>
  );
};

export default LeadsCard;
