import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { get, capitalize } from 'lodash';
import { TenantContext } from './components/context/tenant-context';
import { TENANT_MODE_CLIC, TENANT_MODE_NORMAL } from './shared/constant-values';
import NormalTenantRoutes from './routes/normal-tenant-routes';
import ClicTenantRoutes from './routes/clic-tenant-routes';
import './style/zp-theme/index.less';
import Login from './components/authentication/login-container';
import ForgetPassword from './components/authentication/forgot-password';
import GeneratePassword from './components/authentication/generate-password';

function AppRoutes() {
  const [tenantDetails, defaultImageData] = useContext(TenantContext);
  const [tenantBusinessName, setTenantBusinessName] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    const tenantBusiness = get(tenantDetails, ['setting', 'business_name'], '');
    const tenantImage =
      get(tenantDetails, 'setting.login_background_image', '') ||
      get(defaultImageData, 'login_background_image', '');
    setBackgroundImage(tenantImage);
    setTenantBusinessName(tenantBusiness);
    document.title = `${capitalize(tenantBusiness)} Admin Panel`;
  }, [tenantDetails]);

  return (
    <>
      {localStorage.getItem('token') &&
        get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC && (
          <ClicTenantRoutes
            tenantBusinessName={tenantBusinessName}
            backgroundImage={backgroundImage}
          />
        )}
      {localStorage.getItem('token') &&
        get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL && (
          <NormalTenantRoutes
            tenantBusinessName={tenantBusinessName}
            backgroundImage={backgroundImage}
          />
        )}
      {!localStorage.getItem('token') && (
        <Routes>
          <Route
            path="/"
            element={
              <Login
                tenantName={tenantBusinessName}
                tenantBgImage={backgroundImage}
              />
            }
          />
          <Route path="forget-password" Component={ForgetPassword} />
          <Route path="GeneratePassword/:token" Component={GeneratePassword} />
        </Routes>
      )}
    </>
  );
}
export default AppRoutes;
