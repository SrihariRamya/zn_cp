import React, { useState, useCallback, useEffect } from 'react';
import { Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { filter, get, isEmpty, map } from 'lodash';
import { showAppearanceOrNot } from '../../../utils/api/url-helper';
import clicMenuData from './clic-menu-list';
import { eventTrack } from '../../../shared/function-helper';

function ClicMenu(properties) {
  const { handleCollapse } = properties;
  const [menuDetails, setMenuDetails] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = useCallback(() => {
    showAppearanceOrNot()
      .then((data) => {
        if (isEmpty(get(data, 'showVariable'))) {
          setMenuDetails(
            filter(clicMenuData, (item) => item.name !== 'Appearance')
          );
        } else {
          setMenuDetails(clicMenuData);
        }
      })
      .catch(() => {
        setMenuDetails(clicMenuData);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const adminEvent = (events, text) => {
    handleCollapse();
    const parameters = {
      value: text,
    };
    eventTrack(events, parameters);
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname.split('/')[1]]}
      className="side-menu"
    >
      {map(menuDetails, (value) => {
        return (
          <Menu.Item
            onClick={() =>
              navigate(value.linkURL) && adminEvent('side_menu', value.name)
            }
            icon={<value.icon />}
            key={value?.key}
            label={value?.name}
          >
            <span>{value?.name}</span>
          </Menu.Item>
        );
      })}
    </Menu>
  );
}
export default ClicMenu;
