import React, { useState, createContext, useEffect, useMemo } from 'react';
import _, { isEmpty } from 'lodash';
import { notification } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { getTenant } from '../../utils/api/url-helper';
import { getTenantConfig } from '../../utils/api/tenant-config-helper';

export const TenantContext = createContext();

export function TenantProvider(properties) {
  const navigate = useNavigate();
  const [tenantDetails, setTenantDetails] = useState({});
  const [defaultImageData, setDefaultImageData] = useState({});
  const [tenantConfig, setTenantConfig] = useState({});
  const location = useLocation();
  const [mobileView, setMobileView] = useState(false);

  const fetchData = async () => {
    const configDetails = await getTenantConfig();
    if (isEmpty(configDetails))
      notification.error({
        message: 'Internal Server Error. Please Contact Support Team.',
      });
    setTenantConfig(configDetails);
    if (localStorage.getItem('token')) {
      await getTenant()
        .then((response) => {
          const data = _.get(response, 'data', {});
          setTenantDetails(data);
          const imageData = _.get(response, 'defaultImageData', {});
          setDefaultImageData(imageData);
        })
        .catch(() => {
          notification.error({ message: 'Failed to get tenant details.' });
        });
    } else if (
      location?.pathname !== '/forget-password' &&
      !location?.pathname.includes('GeneratePassword')
    ) {
      navigate('/');
    }
  };
  useEffect(() => {
    fetchData();
    const windoWidth = _.get(window, 'innerWidth', 0);
    if (windoWidth < 576) {
      setMobileView(true);
    } else {
      setMobileView(false);
    }
  }, []);

  const contextValues = useMemo(
    () => [
      tenantDetails,
      defaultImageData,
      setTenantDetails,
      tenantConfig,
      mobileView,
      setMobileView,
    ],
    [tenantDetails, mobileView]
  );

  return (
    <TenantContext.Provider value={contextValues}>
      {properties.children}
    </TenantContext.Provider>
  );
}
