import React from 'react';
import { Result } from 'antd';
import './not-found.less';

const AccessDenied = () => {
  return (
    <div className="box">
      <Result
        status="403"
        title="401"
        subTitle={
          <b className="sub-title">
            Sorry, you are not authorized to access this page.
          </b>
        }
      />
    </div>
  );
};

export default AccessDenied;
