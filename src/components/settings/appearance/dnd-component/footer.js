import React, { useEffect, useState, useContext } from 'react';
import { Col, Row, Layout } from 'antd';
import { get, find } from 'lodash';
import {
  FacebookOutlined,
  TwitterOutlined,
  LinkedinFilled,
  InstagramOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { getAllfooterDetails } from '../../../../utils/api/url-helper';
import { parseJSONSafely } from '../../../../shared/function-helper';
import { TenantContext } from '../../../context/tenant-context';
import { footerNavigation } from '../../../../shared/constant-values';

const FooterDetails = ({ settingProperties, webLayout, preview }) => {
  const [address, setAddress] = useState({});
  const [social, setSocial] = useState({});
  const [links, setLinks] = useState([]);
  const [addressList, setAddressList] = useState(false);
  const [active, setActive] = useState(false);
  const [stateData, setSateData] = useState({});
  const [tenantDetails] = useContext(TenantContext);

  const logo = get(tenantDetails, 'setting.brand_logo', '');
  const footerAddress = get(tenantDetails, 'setting.address', '');
  const quickLinks = get(tenantDetails, 'setting.quick_links', '');
  const logoDescription = get(tenantDetails, 'setting.logo_tag_link', '');
  const [isHover, setHover] = useState(false);

  const handleGetValues = (variableName, value) => {
    return get(
      find(settingProperties, (item) => item.variable_name === variableName),
      'variable_value',
      value
    );
  };
  const setbackgroundColor = handleGetValues(
    '--layout-footer-background',
    '#FFFFFF'
  );
  const setTextColor = handleGetValues('--footer-text-color', '#ffffff');
  const setHoverColor = handleGetValues('--footer-text-hover-color', '#026d39');

  useEffect(() => {
    getAllfooterDetails().then((response) => {
      const data = get(response, 'data.data', []);
      setAddressList(get(data, '[1]is_active', false));
      setActive(get(data, '[2]is_active', false));
      setAddress(parseJSONSafely(get(data, '[1].data_list', '')));
      if (get(data, '[2]is_active', true) === true) {
        setLinks(
          get(parseJSONSafely(get(data, '[2].data_list', {})), 'quickLinks', [])
        );
      }
      if (get(data, '[0]is_active', true) === true) {
        setSocial(parseJSONSafely(get(data, '[0].data_list', {})));
      }
      const stateList = get(data, '[3]', {});
      setSateData(stateList);
    });
  }, []);

  return (
    <Layout style={{ backgroundColor: setbackgroundColor }}>
      {webLayout ? (
        <Row className={preview ? 'footer-preview' : 'footer'}>
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={24}
            xl={24}
            style={{ color: setTextColor }}
          >
            <footer>
              <Row style={{ justifyContent: 'center' }}>
                <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                  <div className="img-container">
                    <img src={logo} className="logo-img" alt="logo" />
                  </div>
                  <div>
                    <p>{logoDescription}</p>
                  </div>
                  <div
                    className="social-icons"
                    onMouseEnter={() => {
                      setHover(true);
                    }}
                    onMouseLeave={() => {
                      setHover(false);
                    }}
                    style={{ color: isHover ? setHoverColor : setTextColor }}
                  >
                    {get(social, 'fb_is_active', false) && (
                      <span>
                        <FacebookOutlined style={{ fontSize: '20px' }} />
                      </span>
                    )}
                    {get(social, 'twiter_is_active', false) && (
                      <span>
                        <TwitterOutlined style={{ fontSize: '20px' }} />
                      </span>
                    )}
                    {get(social, 'insta_is_active', false) && (
                      <span>
                        <InstagramOutlined style={{ fontSize: '20px' }} />
                      </span>
                    )}
                    {get(social, 'linkedin_is_active', false) && (
                      <span>
                        <LinkedinFilled style={{ fontSize: '20px' }} />
                      </span>
                    )}
                    {get(social, 'whatsapp_is_active', false) && (
                      <span>
                        <WhatsAppOutlined style={{ fontSize: '20px' }} />
                      </span>
                    )}
                  </div>
                </Col>
                <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                  <div>
                    {addressList && (
                      <>
                        <div className="main-text">{footerAddress}</div>
                        <div className="address-text">
                          {get(address, 'address_1', '')}
                          ,&nbsp;
                          {get(address, 'address_2', '')},
                        </div>
                        <div className="address-text">
                          {get(stateData, 'district.district_name', '')}
                          ,&nbsp;
                          {get(address, 'pincode', '')},
                        </div>

                        <div className="address-text">
                          {get(stateData, 'state_name', '')}
                          ,&nbsp;
                          {get(address, 'country', '')}
                        </div>
                      </>
                    )}
                  </div>
                </Col>
                <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                  <div>
                    {active && <div className="main-text">{quickLinks}</div>}
                    {links.map((item) => {
                      const itemId = get(item, 'id', '');
                      return (
                        <div
                          onMouseEnter={() => {
                            setHover(true);
                          }}
                          onMouseLeave={() => {
                            setHover(false);
                          }}
                          style={{
                            color: isHover ? setHoverColor : setTextColor,
                            cursor: 'pointer',
                          }}
                        >
                          {get(item, `quickLink_active_${itemId}`, false) && (
                            <div className="address-text">
                              {get(item, `quickLink_listName_${itemId}`, '')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Col>
              </Row>
            </footer>
          </Col>
        </Row>
      ) : (
        <div
          className={`navigation-layout ${preview ? 'preview' : ''}`}
          onMouseEnter={() => {
            setHover(true);
          }}
          onMouseLeave={() => {
            setHover(false);
          }}
        >
          {footerNavigation.map((value) => {
            return (
              <Row className="navigation-footer-button">
                <Col>
                  <span
                    className={`${
                      preview ? 'button-change-preview' : 'button-change'
                    }`}
                  >
                    <div className="mobile-icon-align">
                      <value.icon />
                    </div>
                    <span>{value.name}</span>
                  </span>
                </Col>
              </Row>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default FooterDetails;
