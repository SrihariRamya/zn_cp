/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { Spin, Tabs, Breadcrumb, Space, notification, Button } from 'antd';
import { DeploymentUnitOutlined } from '@ant-design/icons';
import { get, isEmpty } from 'lodash';
import {
  disconnectAuth,
  getFbLongLivedToken,
  getFbPageDetails,
  getFbPagePosts,
  getFbPostInsight,
  getIgMediaPost,
  getIgPostInsight,
} from '../../utils/api/url-helper';
import FacebookPerformance from './fb-performance';
import InstagramPerformance from './ig-performance';

const { TabPane } = Tabs;

function SocialMediaPerformance() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('facebook');
  const [tenantUid] = useState(localStorage.getItem('tenantUid'));
  const [selectedPageId, setSelectedPageId] = useState('');
  const [fbPageData, setFbPageData] = useState([]);
  const [fbData, setFbData] = useState([]);
  const [igData, setIgData] = useState([]);
  const [fbInsight, setfbInsight] = useState([]);
  const [igInsight, setIgInsight] = useState([]);
  const [fbPagination, setFbPagination] = useState([]);
  const [igPagination, setIgPagination] = useState([]);

  const getPagePosts = (paging) => {
    setLoading(true);
    getFbPagePosts({ tenantUid, pageId: selectedPageId, paging })
      .then((data) => {
        setFbData(data?.data?.data);
        setFbPagination(data?.data?.paging);
        setLoading(false);
      })
      .catch((error) => {
        notification.error({
          message:
            error.message ||
            'some error occcured while getting fb page product',
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedPageId) {
      getPagePosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPageId]);

  const getFbPages = () => {
    setLoading(true);
    getFbPageDetails(tenantUid)
      .then((data) => {
        if (data?.data) {
          const pageData = data?.data?.data;
          const pageList = pageData?.map((item) => {
            return { value: item.id, label: item.name };
          });
          setLoading(false);
          setSelectedPageId(data?.pageId?.toString() || pageList?.[0]?.value);
          setFbPageData(pageList);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInstaPosts = (page) => {
    setLoading(true);
    getIgMediaPost({ tenantUid, pageId: selectedPageId, page })
      .then((response) => {
        const instagram = get(
          response,
          'data.business_discovery.media.data',
          []
        );
        const insta = instagram.map(({ children: child, ...rest }) => ({
          child,
          ...rest,
        }));
        setIgData(insta);
        const paging = get(
          response,
          'data.business_discovery.media.paging.cursors',
          []
        );
        setIgPagination(paging);
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
      getPagePosts();
    }
    if (event === 'instagram') {
      getInstaPosts();
    }
  };

  const viewFbPerformance = (id) => {
    setLoading(true);
    const parameters = { tenantUid, imgId: id };
    getFbPostInsight(parameters)
      .then((response) => {
        setfbInsight(response);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message:
            error.message ||
            'some error occcured while getting facebook insights',
        });
      });
  };

  const viewIgPerformance = (id, mediaType) => {
    setLoading(true);
    const parameters = { tenantUid, mediaId: id, mediaType };
    getIgPostInsight(parameters)
      .then((response) => {
        setIgInsight(response);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message:
            error.message ||
            'some error occcured while getting facebook insights',
        });
      });
  };

  const closeInsight = () => {
    setfbInsight([]);
    setIgInsight([]);
  };

  const onFacebookLogin = () => {
    window.FB.login(
      // eslint-disable-next-line func-names
      function (response) {
        setLoading(true);
        if (response?.status === 'connected') {
          const token = response?.authResponse?.accessToken;
          const userID = response?.authResponse?.userID;
          getFbLongLivedToken({ tenantUid, token, userID })
            .then((result) => {
              if (result.success) {
                getFbPages();
              } else {
                notification.error({ message: `'Could'nt get token` });
                setLoading(false);
              }
            })
            .catch((error) => {
              console.log(
                'socialMediaPerformance error ++++++++++++++++++++++++++++++',
                error
              );
              setLoading(false);
            });
          notification.success({
            message: 'Successfully logged in your Facebook account',
          });
        } else {
          notification.error({
            message: 'Some problem occurred while connecting to facebook',
          });
          setLoading(false);
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
      .then((data) => {
        setFbPageData([]);
        setFbData([]);
        setSelectedPageId('');
        setIgData([]);
        setLoading(false);
        notification.success({
          message: data.message || 'Disconnected successfully',
        });
      })
      .catch((error) => {
        notification.error({
          message:
            error.message ||
            'some error occcured while getting instagram posts',
        });
        setLoading(false);
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
                Social Media Performance
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div style={{ padding: '0px 10px' }}>
          {activeTab === 'facebook' && isEmpty(fbPageData) ? (
            <div>
              <p>
                Please connect to your Facebook account to check media
                performance.
              </p>
              <Button type="primary" onClick={onFacebookLogin}>
                Connect facebook
              </Button>
            </div>
          ) : (
            <Tabs
              type="card"
              activeKey={activeTab}
              onChange={handleActiveTab}
              className="theme-tabs"
            >
              <TabPane tab="Facebook" key="facebook">
                <FacebookPerformance
                  fbData={fbData}
                  viewFbPerformance={viewFbPerformance}
                  fbInsight={fbInsight}
                  closeInsight={closeInsight}
                  fbPagination={fbPagination}
                  getPagePosts={getPagePosts}
                  fbPageData={fbPageData}
                  selectedPageId={selectedPageId}
                  disconnect={disconnect}
                  setSelectedPageId={setSelectedPageId}
                />
              </TabPane>
              {selectedPageId && (
                <TabPane tab="Instagram" key="instagram">
                  <InstagramPerformance
                    igData={igData}
                    viewIgPerformance={viewIgPerformance}
                    closeInsight={closeInsight}
                    igInsight={igInsight}
                    getInstaPosts={getInstaPosts}
                    igPagination={igPagination}
                  />
                </TabPane>
              )}
            </Tabs>
          )}
        </div>
      </>
    </Spin>
  );
}

export default SocialMediaPerformance;
