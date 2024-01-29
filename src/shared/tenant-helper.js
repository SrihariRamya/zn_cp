import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';
import get from 'lodash/get';

const validateTenantUid = (history) => {
  let token;
  try {
    token = jwtDecode(localStorage.getItem('token'));
  } catch {
    token = {};
  }

  if (
    !get(token, 'tenant_mode', '') ||
    (!get(token, 'tenant_uid', '') && !localStorage.getItem('tenantUid')) ||
    !(localStorage.getItem('userName') && localStorage.getItem('token'))
  ) {
    localStorage.clear();
    Cookies.set('PreviousPath', get(history, 'location.pathname', '/'));
    return history('/');
  }
  if (!localStorage.getItem('tenantUid') && get(token, 'tenant_uid', '')) {
    localStorage.setItem('tenantUid', get(token, 'tenant_uid', ''));
  }

  return false;
};

export default validateTenantUid;
