import React from 'react';
import { get } from 'lodash';
import { getStatus } from 'shared/role-access-helper';
import AccessDenied from 'components/not-found/access-denied';

const ProtectedRoute = ({ roleData, moduleName, element }) => {
  const roleDataAlias = getStatus(roleData, moduleName);
  const moduleViewPermission = get(roleDataAlias, 'module_view', false);
  const Component = element;
  return moduleViewPermission ? <Component roleData={roleDataAlias} /> : <AccessDenied />;
};

export default ProtectedRoute;
