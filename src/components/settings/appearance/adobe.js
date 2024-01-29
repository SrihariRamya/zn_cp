import React, { useEffect, useState } from 'react';
import { Button, notification, Dropdown, Menu } from 'antd';
import { get, isArray } from 'lodash';
import {
  BANNER_CREATE_FAILED,
  PAGE_BUILDER_UPLOAD,
} from '../../../shared/constant-values';

function AdobeExpress(properties) {
  const { openModal, adobeParam, constantValue, setIsModalOpen } = properties;
  const [designSet, SetDesign] = useState({});

  useEffect(() => {
    SetDesign(window.ccEverywhere);
  }, []);

  const createDesign = (values) => {
    if (constantValue === PAGE_BUILDER_UPLOAD) {
      setIsModalOpen(false);
    }
    const filterParameters = isArray(adobeParam)
      ? adobeParam.filter((item) => item.key === values.key)
      : '';
    designSet.createDesign({
      callbacks: {
        onCancel: () => {
          openModal();
        },
        onPublish: (publishParameters) => {
          openModal(publishParameters, designSet, filterParameters);
        },
        onError: (error) => {
          notification.error({ message: BANNER_CREATE_FAILED || error });
        },
      },
      outputParams: {
        outputType: 'base64',
      },
      inputParams: {
        canvasSize: get(filterParameters, '0.canvasSize', adobeParam),
      },
    });
  };

  return (
    <Dropdown
      placement="topRight"
      trigger="click"
      overlay={
        <Menu onClick={createDesign}>
          {isArray(adobeParam) ? (
            adobeParam.map((result) => (
              <Menu.Item key={result.key}>{result.lable}</Menu.Item>
            ))
          ) : (
            <Menu.Item>Banner size {adobeParam}</Menu.Item>
          )}
        </Menu>
      }
    >
      <Button
        id="create-project-button"
        className={constantValue === PAGE_BUILDER_UPLOAD ? 'pg-adobe-btn' : ''}
      >
        Design with Adobe
      </Button>
    </Dropdown>
  );
}

export default AdobeExpress;
