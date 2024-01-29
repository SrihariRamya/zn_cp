import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { map, set } from 'lodash';
import { useLocation } from 'react-router-dom';
import { SETTINGS_TABS } from '../../shared/constant-values';
import { ReactComponent as RightIcon } from '../../assets/icons/right-icon.svg';
import Profile from './profile';
import Documentaions from './documentations';
import FooterManagement from './footer-management';
import DeliverySlot from './delivery-slot';
import DeliveryCharges from './deliveryCharges/delivery-charges';
import Integration from './integration/index';
import Appfeature from './app-feature';

function SettingsMobile(settingsProperties) {
  const { properties, navigate, adminEvent, mobileView } = settingsProperties;
  const [screenState, setScreenState] = useState('');
  const location = useLocation();
  const handleClickRow = (list) => {
    setScreenState(list.route);
    if (list === 'Profile') {
      adminEvent('Profile');
    }
    set(properties, 'location.aboutProps.value', '');
    const parameters = new URLSearchParams();
    parameters.append('page', list.route);

    navigate({
      pathname: '/settings',
      search: parameters.toString(),
    });
  };

  const handleComponent = () => {
    switch (screenState) {
      case 'profile': {
        return (
          <Profile mobileView={mobileView} setScreenState={setScreenState} />
        );
      }
      case 'storeFeature': {
        return (
          <Appfeature mobileView={mobileView} setScreenState={setScreenState} />
        );
      }
      case 'documentations': {
        return (
          <Documentaions
            mobileView={mobileView}
            setScreenState={setScreenState}
          />
        );
      }
      case 'charges': {
        return (
          <DeliveryCharges
            mobileView={mobileView}
            setScreenState={setScreenState}
          />
        );
      }
      case 'slots': {
        return (
          <DeliverySlot
            mobileView={mobileView}
            setScreenState={setScreenState}
          />
        );
      }
      case 'footer': {
        return (
          <FooterManagement
            mobileView={mobileView}
            setScreenState={setScreenState}
            {...properties}
          />
        );
      }
      case 'integration': {
        return (
          <Integration
            mobileView={mobileView}
            setScreenState={setScreenState}
          />
        );
      }
      default: {
        return map(SETTINGS_TABS, (list) => (
          <Row
            key={list.title}
            className="settings-mob-main"
            onClick={() => handleClickRow(list)}
          >
            <Col span={22}>
              <p className="settings-mob-heading">{list.title}</p>
              <p className="settings-mob-description">{list.subTitle}</p>
            </Col>
            <Col span={2} className="flex-end">
              <RightIcon />
            </Col>
          </Row>
        ));
      }
    }
  };

  useEffect(() => {
    setScreenState(location.search.split('=')[1]);
  }, []);

  return handleComponent();
}

export default SettingsMobile;
