import React, { useState, useContext, useEffect } from 'react';
import { Button, notification } from 'antd';
import { Link } from 'react-router-dom';
import { get } from 'lodash';
import NotFound from '../../assets/icons/NotFound.svg';
import './not-found.less';
import { getStatus } from '../../shared/role-access-helper';
import menuData from '../layout/menu';
import { FAILED_TO_LOAD } from '../../shared/constant-values';
import { RoleContext } from '../context/role-access-context';
import { getAllModulesRoles } from '../../utils/api/url-helper';

const NotFoundPage = () => {
  const [roleInfo] = useState(localStorage.getItem('roleName'));
  const [roleDetails] = useContext(RoleContext);
  const [roleData, setRoleData] = useState([]);
  useEffect(() => {
    getAllModulesRoles(roleDetails)
      .then((response) => {
        const data = get(response, 'data', []);
        setRoleData(data);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, [roleDetails]);
  const getRoleStatus = () => {
    let flag;
    const menuInfo =
      roleInfo === 'tenant_admin'
        ? menuData.filter(
            (response) => get(response, 'role', '') !== 'store_admin'
          )
        : menuData.filter(
            (response) => get(response, 'role', '') !== 'tenant_admin'
          );
    for (let index = 1; index < menuInfo.length; index += 1) {
      const result = getStatus(roleData, get(menuInfo[index], 'key', ''));
      if (get(result, 'can_read', false)) {
        flag = get(menuInfo[index], 'linkURL', '');
        break;
      }
    }
    return flag;
  };

  return (
    <>
      <div className="blockContent">
        <div className="leftBlock">
          <div>
            <div className="text"> Oopss..we have</div>
            <div className="text flex">
              <div className="text_green "> a problem </div>
              <div> here</div>
            </div>
          </div>
          <div className="number ">404</div>

          <Link
            to={
              get(getStatus(roleData, 'Dashboard'), 'module_view', false)
                ? '/dashboard'
                : getRoleStatus()
            }
          >
            <Button type="primary" className="buttonContainer">
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="rightBlock">
          <img
            src={NotFound}
            style={{
              width: '100%',
            }}
            alt="React Logo"
          />
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
