/* eslint-disable camelcase */
import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, notification, Skeleton } from 'antd';
import { capitalize, isEmpty, get } from 'lodash';
import Cookies from 'js-cookie';
import './login.less';
import { userAuthenticate, getTenant } from '../../utils/api/url-helper';
import { RoleContext } from '../context/role-access-context';
import { parseJwt } from '../../shared/function-helper';
import { FROM_LOGIN, FROM_TOKEN } from '../../shared/constant-values';
import { TenantContext } from '../context/tenant-context';

export function LoginContainer(properties) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [activeSkeleton, setActiveSkeleton] = useState(false);
  const [, setReloadstate] = useContext(RoleContext);
  const [tenantDetails, , setTenantDetails] = useContext(TenantContext);

  const redirectToHome = () => {
    if (localStorage.getItem('userName') && localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  };

  const setLocalStoreValue = async (data, from) => {
    const {
      user_name,
      token,
      uuid,
      tenant_name,
      role_name,
      role_id,
      store_uid,
      store_name,
    } = data;
    localStorage.setItem('userName', user_name || '');
    localStorage.setItem('token', token || '');
    localStorage.setItem('userID', uuid || '');
    localStorage.setItem('tenantName', tenant_name || '');
    localStorage.setItem('roleName', role_name || '');
    localStorage.setItem('roleID', role_id || '');
    localStorage.setItem('storeID', store_uid || '');
    localStorage.setItem('storeName', store_name || '');
    setReloadstate(localStorage.getItem('roleID'));
    await getTenant()
      .then((resp) => {
        setTenantDetails((previous) => {
          return previous === get(resp, 'data', {})
            ? tenantDetails
            : get(resp, 'data', {});
        });
      })
      .catch((error) => {
        notification.error({ message: error || 'error' });
        setLoading(false);
      });
    if (from === FROM_LOGIN) {
      const previousPath = Cookies.get('PreviousPath');
      if (previousPath === '/') {
        navigate('/dashboard');
      } else {
        navigate(previousPath || '/dashboard');
      }
      notification.success({ message: 'Login successfully' });
      Cookies.remove('PreviousPath');
    } else {
      redirectToHome();
    }
  };

  useEffect(() => {
    const queryParameters = new URLSearchParams(window?.location?.search);
    const parseJwtToken = parseJwt(queryParameters.get('token'));
    if (isEmpty(parseJwtToken)) {
      redirectToHome();
    } else if (!isEmpty(parseJwtToken)) {
      localStorage.clear();
      parseJwtToken.token = queryParameters.get('token');
      setLocalStoreValue(parseJwtToken, FROM_TOKEN);
    } else if (localStorage.getItem('token')) {
      navigate('/dashboard');
    } else {
      redirectToHome();
    }
  }, [navigate]);

  useEffect(() => {
    if (properties.tenantName) {
      setActiveSkeleton(false);
    }
  }, [properties.tenantName]);

  const onFinish = async (values) => {
    localStorage.setItem('sessionStartTime', new Date());
    setLoading(true);
    userAuthenticate(values)
      .then(async (response) => {
        setLoading(false);
        if (response.success === true) {
          const {
            UserName,
            token,
            user_uid: userUid,
            tenant,
            Role,
            store,
          } = response.data;
          const parameters = {
            user_name: UserName,
            token,
            uuid: userUid,
            tenant_name: tenant?.tenant_name,
            role_name: Role?.slug,
            role_id: Role?.id,
            store_uid: store?.store_uid,
            store_name: store?.store_name,
          };
          await setLocalStoreValue(parameters, FROM_LOGIN);
          localStorage.setItem('userName', UserName || '');
          localStorage.setItem('token', token || '');
          localStorage.setItem('userID', userUid || '');
          localStorage.setItem('tenantName', tenant?.tenant_name || '');
          localStorage.setItem('roleName', Role?.slug || '');
          localStorage.setItem('roleID', Role?.id || '');
          localStorage.setItem('storeID', store?.store_uid || '');
          localStorage.setItem('storeName', store?.store_name || '');
          localStorage.setItem(
            'tenant_mode',
            response?.data?.tenant?.tenant_mode || ''
          );
          localStorage.setItem(
            'tenant_uid',
            response?.data?.tenant?.tenant_uid || ''
          );
          setReloadstate(localStorage.getItem('roleID'));
          const previousPath = Cookies.get('PreviousPath');
          navigate(previousPath || '/dashboard');
          notification.success({ message: 'Login successfully' });
          Cookies.remove('PreviousPath');
        }
      })
      .catch((error) => {
        notification.error({
          message: Object.hasOwn(error, 'error')
            ? error.error
            : 'Failed to login',
        });
        setLoading(false);
      });
  };
  const style = {
    backgroundImage: `url(${properties.tenantBgImage} )`,
  };
  return (
    <div className="block" style={style}>
      <div className="block_admin login-container-block-admin">
        <p>
          <strong className="text-dark-grey">
            {capitalize(properties.tenantName)}{' '}
          </strong>
          <span className="light">Admin</span>
        </p>
      </div>
      <div className="block__container login-container-box">
        <div className="block-content">
          <div>
            <Skeleton active loading={activeSkeleton}>
              <p>
                <h2 className="text-primary login-admin-title">
                  {capitalize(properties.tenantName)}
                  <span className="light"> Admin</span>
                </h2>
              </p>
              <h2 className="text-dark-grey mb-3">Login</h2>
              <Form
                className="placeholder-color"
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
              >
                <div>
                  <Form.Item
                    name="email_address"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter your Email!',
                      },
                      {
                        type: 'email',
                        message: 'Please enter a valid email address',
                      },
                    ]}
                  >
                    <Input placeholder="Email address" />
                  </Form.Item>
                </div>
                <div>
                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter your password!',
                      },
                    ]}
                  >
                    <Input.Password placeholder="Password" />
                  </Form.Item>
                </div>
                <div className="flex-bwn-end">
                  <Form.Item>
                    <Link to="/forget-password">Forgot Password?</Link>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" disabled={loading}>
                      {loading ? 'Loading...' : 'Login'}
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </Skeleton>
          </div>
        </div>
      </div>
    </div>
  );
}
export default LoginContainer;
