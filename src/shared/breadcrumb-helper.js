import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { get } from 'lodash';

const BreadcrumbComponent = (properties) => {
  const { breadCrumbDetails } = properties;

  return (
    <Breadcrumb separator=">">
      {breadCrumbDetails.map((item) => {
        if (get(item, 'pathname')) {
          return (
            <Breadcrumb.Item className="table-tax">
              <Link to={`${get(item, 'pathname', '')}`}>
                {get(item, 'name', '')}
              </Link>
            </Breadcrumb.Item>
          );
        }
        return (
          <Breadcrumb.Item className="table-tax">
            {get(item, 'name', '')}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default BreadcrumbComponent;
