import React, { useEffect, useContext, useState } from 'react';
import { notification, Result } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { get } from 'lodash';
import { getApiUrl } from '../../utils/api/environment';
import { getCampaignToken } from '../../utils/api/url-helper';
import { TenantContext } from '../context/tenant-context';
import { FAILED_TO_LOAD } from '../../shared/constant-values';

const Campaign = () => {
  const [, , , tenantConfig] = useContext(TenantContext);
  const [apiurl, setApiUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [userID] = useState(localStorage.getItem('userID'));

  useEffect(() => {
    const baseUrl = getApiUrl();
    const formData = {
      apiUrl: baseUrl,
      userID,
    };
    setLoading(true);
    getCampaignToken(formData)
      .then((data) => {
        const campaignUrl = get(tenantConfig, 'klAppUrl', '');
        if (data.success) {
          setApiUrl(`${campaignUrl}?id=${data.data}`);
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'error', FAILED_TO_LOAD),
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {loading && (
        <div className="heading-campaign">
          <Result
            status="success"
            icon={<SmileOutlined />}
            title="Please wait campaign is loading"
          />
        </div>
      )}
      {!loading && (
        <iframe className="iframe-kl-N" src={apiurl} title="Iframe Example" />
      )}
    </>
  );
};

export default Campaign;
