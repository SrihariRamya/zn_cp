import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Row,
  Col,
  notification,
  Typography,
  Card,
  List,
  Image,
  Tooltip,
  Space,
  Select,
  Radio,
  Pagination,
} from 'antd';
import { UnorderedListOutlined, AppstoreFilled } from '@ant-design/icons';
import './promote-products.less';
import { get } from 'lodash';
import SocialMediaProductsForm from './promote-from';
import { getPromoteMedia } from '../../utils/api/url-helper';
import MetricsTable from './metrics-table';
import { ReactComponent as Instagram } from '../../assets/icons/instagram-icon.svg';
import { ReactComponent as Facebook } from '../../assets/icons/facebook-icon.svg';
import { paginationstyler } from '../../shared/attributes-helper';
import { defaultImage } from '../../shared/image-helper';

const { Option } = Select;
const { Text } = Typography;

const PromoteSocialMedia = () => {
  const [isLoading, setIsLodaing] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
  });
  const [isMediaDrawer, setIsMediaDrawer] = useState(false);
  const [socialMediaData, setSocialMediaData] = useState([]);
  const [isInsightVisible, setIsInsightVisible] = useState(false);
  const [paginationStyle, setPaginationStyle] = useState(false);

  const [mediaType] = useState([
    {
      label: 'All',
      value: 'all',
    },
    {
      label: 'Instagram',
      value: 'instagram',
    },
    {
      label: 'Facebook',
      value: 'facebook',
    },
  ]);
  const [mediaValue, setMediaValue] = useState('all');
  const [listType, setListType] = useState('grid');

  const [mediaId, setMediaId] = useState('');
  const [socialMediaType, setSociaMediaType] = useState('');

  const { currentPage } = pagination;

  const showMediaDrawer = () => {
    setIsMediaDrawer(true);
  };

  const closeMediaDrawer = () => {
    setIsMediaDrawer(false);
  };
  const fetchPromoteMedia = (parameters = {}, media) => {
    setIsLodaing(true);
    const {
      pagination: { pageSize, currentPage: current },
    } = parameters;
    const queryParameters = {
      limit: pageSize,
      offset: current,
      mediaType: media,
    };
    getPromoteMedia(queryParameters)
      .then((response) => {
        const dataSet = get(response, 'data.rows', []);
        setSocialMediaData(dataSet);
        setPagination({
          ...parameters.pagination,
          total: response.data.count,
        });
        setIsLodaing(false);
      })
      .catch((error) => {
        notification.error({
          message: error.message,
        });
        setIsLodaing(false);
      });
  };

  useEffect(() => {
    fetchPromoteMedia({ pagination }, mediaValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    const current = !isNaN(currentPage) ? Number(currentPage) : false;
    const resetPagination = { ...pagination, ...(current && { current }) };
    fetchPromoteMedia(
      {
        pagination: { ...resetPagination, pageSize: 20 },
      },
      mediaValue
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, mediaValue]);

  const showInsights = (item) => {
    setIsInsightVisible(true);
    setMediaId(item.media_id);
    setSociaMediaType(item.media_type);
  };

  const columns = [
    {
      title: 'Product Image',
      dataIndex: 'image_url',
      width: '10%',
      hidden: false,
      render: (image, value) => (
        <>
          <Row onClick={() => showInsights(value)}>
            <Image
              preview={false}
              className="media-product-img"
              size={50}
              src={image || defaultImage}
            />
            {value.media_type === 'instagram' ? (
              <Instagram className="promote-icon media-icon" />
            ) : (
              <Facebook className="promote-icon media-icon" />
            )}
          </Row>
        </>
      ),
    },
    {
      title: 'Product Name',
      hidden: false,
      dataIndex: 'product_name',
      key: 'product_name',
      width: '90%',
    },
  ];

  useEffect(() => {
    if (get(pagination, 'total', 0) > 70) setPaginationStyle(true);
    else setPaginationStyle(false);
  }, [socialMediaData, pagination]);

  const handlePagination = (page) => {
    setPagination({ currentPage: page });
    setIsLodaing(true);
  };

  const closeInsights = () => {
    setIsInsightVisible(false);
  };

  const onSelectedValue = (item) => {
    setMediaValue(item);
    setPagination({ currentPage: 1 });
    setIsLodaing(true);
  };

  const handleViewChange = (value) => {
    setListType(value);
  };

  const handleTableChange = (paginationAlias) => {
    const { current } = paginationAlias;
    setPagination({ currentPage: current });
  };

  useEffect(() => {
    paginationstyler();
  }, [socialMediaData]);
  return (
    <>
      <Row className="add-promote-align">
        <Col span={6}>
          <Select
            className="dropdown-picker"
            virtual={false}
            defaultValue="all"
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
            onChange={onSelectedValue}
          >
            {mediaType.map((item) => (
              <Option value={item.value}>{item.label}</Option>
            ))}
          </Select>
        </Col>
        <Col span={3}>
          <Space align="center" className="products-options-desktop">
            <Radio.Group
              buttonStyle="solid"
              value={listType}
              className="list_type_icons_set"
            >
              <Radio.Button
                value="grid"
                onClick={() => handleViewChange('grid')}
              >
                <AppstoreFilled />
              </Radio.Button>
              <Radio.Button
                value="table"
                onClick={() => handleViewChange('list')}
              >
                <UnorderedListOutlined />
              </Radio.Button>
            </Radio.Group>
          </Space>
        </Col>
      </Row>

      <div
        className="box promote-product-list-container"
        style={{ padding: '0px 10px' }}
      >
        {listType === 'grid' ? (
          <>
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 4,
                lg: 4,
                xl: 5,
                xxl: 3,
              }}
              dataSource={socialMediaData}
              loading={isLoading}
              renderItem={(item) => (
                <Row onClick={() => showInsights(item)}>
                  <List.Item>
                    <Card hoverable className="mr-30">
                      <div className="img-container">
                        <Image
                          preview={false}
                          src={item.image_url || defaultImage}
                        />
                        {item.media_type === 'instagram' ? (
                          <Instagram className="insta-icon" />
                        ) : (
                          <Facebook className="facebook-icon" />
                        )}
                      </div>
                      <Tooltip title={item.product_name}>
                        <Text className="text-ellipsis" ellipsis>
                          <b>{item.product_name}</b>
                        </Text>
                      </Tooltip>
                    </Card>
                  </List.Item>
                </Row>
              )}
            />
            {!isLoading && socialMediaData.length !== 0 ? (
              <div
                className={`${
                  paginationStyle
                    ? 'grid-pagination-long'
                    : 'grid-pagination-short'
                }`}
              >
                <Pagination
                  {...pagination}
                  onChange={handlePagination}
                  className="related-prdt-pagination"
                />
              </div>
            ) : null}
          </>
        ) : (
          <div className="product_table">
            <Table
              className="grid-table product-grid-table"
              scroll={{ x: 780 }}
              columns={columns}
              dataSource={socialMediaData}
              pagination={pagination}
              loading={isLoading}
              onChange={handleTableChange}
            />
          </div>
        )}
      </div>
      <>
        <SocialMediaProductsForm
          closeMediaDrawer={closeMediaDrawer}
          isMediaDrawer={isMediaDrawer}
          setIsMediaDrawer={setIsMediaDrawer}
        />
      </>
      {isInsightVisible && (
        <MetricsTable
          closeInsights={closeInsights}
          isInsightVisible={isInsightVisible}
          mediaId={mediaId}
          socialMediaType={socialMediaType}
        />
      )}
    </>
  );
};
export default PromoteSocialMedia;
