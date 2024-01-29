import { notification, Spin } from 'antd';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { getGoogleFormUrl } from '../../utils/api/url-helper';

const ZupainSelect = () => {
  const [loading, setLoading] = useState(true);
  const [formUrl, setFormUrl] = useState('');
  useEffect(() => {
    getGoogleFormUrl()
      .then((response) => {
        if (response.success) {
          const url = get(response, 'data', '');
          setFormUrl(url);
          setLoading(false);
        } else {
          setLoading(true);
        }
      })
      .catch((error) => {
        setLoading(true);
        notification.error({ message: error });
      });
  }, []);

  return (
    <>
      <Spin className="mt-20" spinning={loading}>
        <iframe className="iframe-kl-N" src={formUrl} title="Google Form" />
      </Spin>
    </>
  );
};

export default ZupainSelect;
