import React, { useState, useEffect } from 'react';
import { Table, Drawer, notification } from 'antd';
import { capitalize, get, isEmpty } from 'lodash';

import { getPromoteMediaInsights } from '../../utils/api/url-helper';

const MetricsTable = (properties) => {
  const {
    isInsightVisible,
    closeInsights,
    mediaId,
    socialMediaType,
  } = properties;
  const [metricsData, setIsMetricsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMetricsData = () => {
    setIsLoading(true);
    const parameters = {
      socialMediaType,
    };
    getPromoteMediaInsights(mediaId, parameters)
      .then((response) => {
        const dataSet = get(response, 'insightData.data');
        const result = dataSet.map((item) => {
          const value = isEmpty(item.values[0]) ? 0 : item.values[0].value;
          let { name } = item;
          if (name === 'post_reactions_like_total') {
            name = 'Like';
          } else if (name === 'post_reactions_love_total') {
            name = 'Love';
          } else if (name === 'post_reactions_wow_total') {
            name = 'Wow';
          } else if (name === 'post_impressions') {
            name = 'Impression';
          } else if (name === 'post_clicks') {
            name = 'Clicks';
          } else if (name === 'post_engaged_users') {
            name = 'Engaged Users';
          } else {
            name = capitalize(name);
          }
          return {
            name,
            value,
            description: item.description,
          };
        });
        setIsMetricsData(result);
        setIsLoading(false);
      })
      .catch((error) => {
        notification.error({
          message: error.error,
        });
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchMetricsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const columns = [
    {
      title: 'Channel',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: `${socialMediaType === 'instagram' ? 'Instagram' : 'Facebook'}`,
      dataIndex: 'value',
      key: 'value',
    },
  ];
  return (
    <>
      <Drawer
        title="Social Media Insights"
        width={500}
        visible={isInsightVisible}
        onClose={closeInsights}
        closable={closeInsights}
        className="related-prdt-drawer"
      >
        <div className="box" style={{ padding: '0px 10px' }}>
          <Table
            dataSource={metricsData}
            columns={columns}
            pagination={false}
            loading={isLoading}
          />
        </div>
      </Drawer>
    </>
  );
};

export default MetricsTable;
