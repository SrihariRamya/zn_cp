import React, { useEffect, useState, useContext } from 'react';
import { Col, Row, Layout } from 'antd';
import { find, get, isEmpty } from 'lodash';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
} from '@ant-design/icons';
import { getAllfooterDetails } from '../../../../utils/api/url-helper';
import { parseJSONSafely } from '../../../../shared/function-helper';
import { TenantContext } from '../../../context/tenant-context';

const ClicFooter = (properties) => {
  const { isWebLayout, settingProperties } = properties;
  const [address, setAddress] = useState({});
  const [social, setSocial] = useState({});
  const [addressList, setAddressList] = useState(false);
  const [stateData, setSateData] = useState({});
  const [tenantDetails] = useContext(TenantContext);

  const footerAddress = get(tenantDetails, 'setting.address', '');
  const colSpanProperty = isWebLayout ? 12 : 24;

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
      setAddress(parseJSONSafely(get(data, '[1].data_list', '')));
      if (get(data, '[0]is_active', true) === true) {
        setSocial(parseJSONSafely(get(data, '[0].data_list', {})));
      }
      const stateList = get(data, '[3]', {});
      setSateData(stateList);
    });
  }, []);

  return (
    <Layout style={{ backgroundColor: setbackgroundColor }}>
      <Row className="clic-footer">
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
              <Col
                xs={24}
                sm={24}
                md={colSpanProperty}
                lg={colSpanProperty}
                xl={colSpanProperty}
                className="footer-containet-left-col"
              >
                <div className="fc-left-maindiv">
                  {get(social, 'insta_is_active', false) && (
                    <span>
                      <div
                        style={{ backgroundColor: setTextColor }}
                        className="empty-div-footer"
                      >
                        <InstagramOutlined
                          style={{ color: setbackgroundColor }}
                        />
                      </div>
                      <p style={{ color: setTextColor }}>Instagram</p>
                    </span>
                  )}

                  {get(social, 'fb_is_active', false) && (
                    <span>
                      <div
                        style={{ backgroundColor: setTextColor }}
                        className="empty-div-footer"
                      >
                        <FacebookOutlined
                          style={{ color: setbackgroundColor }}
                        />
                      </div>
                      <p style={{ color: setTextColor }}>Facebook</p>
                    </span>
                  )}
                  {get(social, 'twiter_is_active', false) && (
                    <span>
                      <div
                        style={{ backgroundColor: setTextColor }}
                        className="empty-div-footer"
                      >
                        <TwitterOutlined
                          style={{ color: setbackgroundColor }}
                        />
                      </div>
                      <p style={{ color: setTextColor }}>Twitter</p>
                    </span>
                  )}
                </div>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={colSpanProperty}
                lg={colSpanProperty}
                xl={colSpanProperty}
                className="footer-right"
              >
                <div>
                  <h2 style={{ color: setHoverColor }}>Address</h2>
                  {addressList && (
                    <>
                      <p className="main-text">{footerAddress}</p>
                      <p className="address-text">
                        {get(address, 'address_1', '')}
                        ,&nbsp;
                        {get(address, 'address_2', '')}
                        {!isEmpty(get(address, 'address_2', '')) ? ',' : ''}
                      </p>
                      <p className="address-text">
                        {get(stateData, 'district.district_name', '')}
                        ,&nbsp;
                        {get(address, 'pincode', '')},
                      </p>

                      <p className="address-text">
                        {get(stateData, 'state_name', '')}
                        ,&nbsp;
                        {get(address, 'country', '')}
                      </p>
                    </>
                  )}
                </div>
                <div className="mt-20">
                  <h2 style={{ color: setHoverColor }}>Mail us at</h2>
                  <p>{get(tenantDetails, 'setting.email_address', '')}</p>
                </div>
                <div className="mt-20">
                  <h2 style={{ color: setHoverColor }}>Contact Us</h2>
                  <div className="flex-end">
                    <p style={{ marginLeft: '4px' }}>
                      {get(tenantDetails, 'setting.phone', '')}
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </footer>
        </Col>
      </Row>
    </Layout>
  );
};

export default ClicFooter;
