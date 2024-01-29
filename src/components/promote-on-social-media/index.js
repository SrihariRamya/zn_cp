/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { Spin, Tabs, Breadcrumb, Space, Button, notification } from 'antd';
import { DeploymentUnitOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash';
import FbPostPageDetail from './fb-post-page-detail';
import InstaPostDetails from './insta-post-details';
import {
  disconnectAuth,
  getFbLongLivedToken,
  getFbPageDetails,
  getFbPagePosts,
  getIgMediaPost,
} from '../../utils/api/url-helper';

const { TabPane } = Tabs;

function PromoteMediaProducts() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('facebook');
  const [userAuth, setUserAuth] = useState();
  const [tenantUid] = useState(localStorage.getItem('tenantUid'));
  const [fbPageData, setFbPageData] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [fbData, setFbData] = useState([]);
  const [igData, setIgData] = useState([]);
  const [pagination, setPagination] = useState([]);

  const getPagePosts = (paging) => {
    setLoading(true);
    getFbPagePosts({ tenantUid, pageId: selectedPageId, paging })
      .then((data) => {
        setLoading(false);
        setFbData(data?.data?.data);
        setPagination(data?.data?.paging);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message:
            error.message ||
            'some error occcured while getting fb page product',
        });
      });
  };

  useEffect(() => {
    if (selectedPageId) {
      getPagePosts();
    }
  }, [selectedPageId]);

  const getFbPages = () => {
    setLoading(true);
    getFbPageDetails(tenantUid)
      .then((response) => {
        if (response?.data) {
          const pageData = response?.data?.data;
          const pageList = pageData?.map((item) => {
            return { value: item.id, label: item.name };
          });
          setFbPageData(pageList);
          setLoading(false);
          setSelectedPageId(
            response?.pageId?.toString() || pageList?.[0]?.value
          );
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message:
            error.message ||
            'some error occcured while getting fb page details',
        });
      });
  };

  useEffect(() => {
    getFbPages();
  }, []);

  const getInstaPosts = (page) => {
    setLoading(true);
    getIgMediaPost({ tenantUid, pageId: selectedPageId, page })
      .then((response) => {
        setIgData(response);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message:
            error.message ||
            'some error occcured while getting instagram posts',
        });
      });
  };

  const handleActiveTab = (event) => {
    setActiveTab(event);
    if (event === 'facebook') {
      getFbPages();
    }
    if (event === 'instagram') {
      getInstaPosts();
    }
  };

  const onFacebookLogin = () => {
    window.FB.login(
      // eslint-disable-next-line func-names
      function (response) {
        setLoading(true);
        console.log('onFacebookLogin response', response);
        if (response?.status === 'connected') {
          const token = response?.authResponse?.accessToken;
          const userID = response?.authResponse?.userID;
          getFbLongLivedToken({ tenantUid, token, userID })
            .then((result) => {
              setUserAuth({ ...response?.authResponse });
              console.log(
                'getFbLongLivedToken result +++++++++++++++++++++++++++++++++',
                result
              );
              if (result.success) {
                getFbPages();
              } else {
                setLoading(false);
                notification.error({ message: `'could'nt get token` });
              }
            })
            .catch((error) => {
              setLoading(false);
              console.log(
                'getFbLongLivedToken error +++++++++++++++++++++++++++++++++',
                error
              );
            });
          notification.success({
            message: 'Successfully logged in your Facebook account',
          });
        } else {
          setLoading(false);
          notification.error({
            message: 'Some problem occurred while connecting to facebook',
          });
        }
      },
      {
        scope:
          // eslint-disable-next-line max-len
          'public_profile,email,pages_show_list,read_insights,pages_read_engagement,pages_manage_posts,pages_read_user_content,instagram_basic,instagram_manage_insights,instagram_content_publish,pages_messaging',
        return_scopes: true,
      }
    );
  };

  const disconnect = () => {
    disconnectAuth(tenantUid)
      .then((response) => {
        setFbData([]);
        setFbPageData([]);
        setIgData([]);
        setSelectedPageId('');
        setUserAuth({});
        setLoading(false);
        notification.success({
          message: response.message || 'Disconnected successfully',
        });
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message:
            error.message ||
            'some error occcured while getting instagram posts',
        });
      });
  };

  return (
    <Spin spinning={loading}>
      <>
        <div className="search-container">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <DeploymentUnitOutlined />
                Import from Social Media
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div style={{ padding: '0px 10px' }}>
          <Tabs
            type="card"
            activeKey={activeTab}
            onChange={handleActiveTab}
            className="theme-tabs"
          >
            <TabPane tab="Facebook" key="facebook">
              <FbPostPageDetail
                fbPageData={fbPageData}
                fbData={fbData}
                setSelectedPageId={setSelectedPageId}
                disconnect={disconnect}
                selectedPageId={selectedPageId}
                pagination={pagination}
                getPagePosts={getPagePosts}
              />
            </TabPane>
            {selectedPageId && (
              <TabPane tab="Instagram" key="instagram">
                <InstaPostDetails
                  igData={igData}
                  getInstaPosts={getInstaPosts}
                />
              </TabPane>
            )}
          </Tabs>

          {activeTab === 'facebook' &&
            isEmpty(userAuth) &&
            isEmpty(fbPageData) && (
              <div>
                <p>
                  Please connect to your Facebook account to import media
                  content.
                </p>
                <Button type="primary" onClick={onFacebookLogin}>
                  Connect facebook
                </Button>
              </div>
            )}
        </div>
      </>
    </Spin>
  );
}

export default PromoteMediaProducts;
