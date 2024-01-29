import React, { useContext, useEffect, useState } from 'react';
import { Spin, notification } from 'antd';
import '../zupain-help.less';
import { get, isEmpty } from 'lodash';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { TenantContext } from '../../context/tenant-context';
import HelpHeader from '../help-header';
import FrequentlyAskedQuestions from '../faq';
import { ReactComponent as ByeIcon } from '../../../assets/icons/bye-icon.svg';
import { ReactComponent as SendIcon } from '../../../assets/icons/send-icon.svg';
import HomeMedia from './home-media';

function ZupainHome(properties) {
  const { mobileView } = properties;
  const [loading, setLoading] = useState(false);
  const [blogData, setBlogData] = useState([]);

  const tenantConfig = useContext(TenantContext)[3];

  const adminUrl = get(tenantConfig, 'masterAdmin.master_url', '');
  const token = CryptoJS.AES.encrypt(
    `${get(tenantConfig, 'masterAdmin.MASTER_ADMIN_VALUE', '')}`,
    `${get(tenantConfig, 'masterAdmin.MASTER_ADMIN_SECRET', '')}`
  ).toString();
  const headerValue = {
    headers: {
      masteradminheader: `Bearer ${token}`,
    },
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const getActiveBlogs = await axios.get(
        `${adminUrl}blog/active-blogs`,
        headerValue
      );
      if (getActiveBlogs.data.success) {
        setBlogData(get(getActiveBlogs, 'data.data', []));
      }
      setLoading(false);
    } catch (error) {
      notification.error({
        message:
          error.message || 'Some error occurred while getting the result',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Spin spinning={loading}>
      <div className="home-container">
        <HelpHeader />
        <div className={`home-content ${mobileView && 'h-75-vh'}`}>
          <div className="m-20">
            <h3 className="hello-zupain">
              Hello Zupain <ByeIcon />
            </h3>
            <h3 style={{ color: '#fff' }}>How can I help you?</h3>
          </div>
          <div className="m-20 section-layout p-10 flex-bwn">
            <p>Send us a message</p>
            <SendIcon />
          </div>
          {!isEmpty(get(blogData, '[0]', [])) && (
            <HomeMedia
              blogData={get(blogData, '[0]', [])}
              mobileView={mobileView}
            />
          )}
          <div className="m-20 section-layout">
            <FrequentlyAskedQuestions showHeader={false} showCategory={false} />
          </div>
          {!isEmpty(get(blogData, '[1]', [])) && (
            <HomeMedia
              blogData={get(blogData, '[1]', [])}
              mobileView={mobileView}
            />
          )}
        </div>
      </div>
    </Spin>
  );
}

export default ZupainHome;
