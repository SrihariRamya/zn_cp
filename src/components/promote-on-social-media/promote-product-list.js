/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import {
  Table,
  Row,
  Col,
  notification,
  Typography,
  Card,
  List,
  Image,
  Tooltip,
  Space,
  Radio,
  Pagination,
  Button,
} from 'antd';
import { UnorderedListOutlined, AppstoreFilled } from '@ant-design/icons';
import './promote-products.less';
import { get } from 'lodash';
import SocialMediaProductsForm from './promote-from';
import { getPromoteSavedProducts } from '../../utils/api/url-helper';
import { paginationstyler } from '../../shared/attributes-helper';
import { defaultImage } from '../../shared/image-helper';

const { Text } = Typography;

const PromoteProducts = () => {
  const [isLoading, setIsLodaing] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
  });
  const [isMediaDrawer, setIsMediaDrawer] = useState(false);
  const [productData, setProductData] = useState([]);
  const [paginationStyle, setPaginationStyle] = useState(false);
  const [promoteProduct, setPromoteProduct] = useState({});
  const [listType, setListType] = useState('grid');
  const [isEditPromoteProduct, setIsEditPromoteProduct] = useState(false);

  const { currentPage } = pagination;

  const showMediaDrawer = async (item) => {
    if (item?.promote_product_id) {
      setIsEditPromoteProduct(true);
    }
    setIsMediaDrawer(true);
    setPromoteProduct(item);
  };

  const closeMediaDrawer = () => {
    setIsMediaDrawer(false);
  };
  const fetchPromoteProducts = (parameters = {}) => {
    setIsLodaing(true);
    const {
      pagination: { pageSize, currentPage: current },
    } = parameters;
    const queryParameters = {
      limit: pageSize,
      offset: current,
      promote_product_type: 'SAVED',
    };
    getPromoteSavedProducts(queryParameters)
      .then((response) => {
        const dataSet = get(response, 'data.rows', []);
        setProductData(dataSet);
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
    fetchPromoteProducts({ pagination });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    const current = !isNaN(currentPage) ? Number(currentPage) : false;
    const resetPagination = { ...pagination, ...(current && { current }) };
    fetchPromoteProducts({
      pagination: { ...resetPagination, pageSize: 20 },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    if (get(pagination, 'total', 0) > 70) setPaginationStyle(true);
    else setPaginationStyle(false);
  }, [productData, pagination]);

  const handlePagination = (page) => {
    setPagination({ currentPage: page });
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
  }, [productData]);

  const columns = [
    {
      title: 'Product Image',
      dataIndex: 'image_url',
      hidden: false,
      render: (image, value) => (
        <>
          <Row onClick={() => showMediaDrawer(value)}>
            <Image
              preview={false}
              className="media-product-img"
              size={50}
              src={image || defaultImage}
            />
          </Row>
        </>
      ),
    },
    {
      title: 'Product Name',
      hidden: false,
      dataIndex: 'product_name',
      key: 'product_name',
    },
  ];

  return (
    <>
      <Row className="add-promote-align">
        <Space align="center" className="products-options-desktop">
          <Radio.Group
            buttonStyle="solid"
            value={listType}
            className="list_type_icons_set"
          >
            <Radio.Button value="grid" onClick={() => handleViewChange('grid')}>
              <AppstoreFilled />
            </Radio.Button>
            <Radio.Button
              value="table"
              onClick={() => handleViewChange('list')}
            >
              <UnorderedListOutlined />
            </Radio.Button>
          </Radio.Group>
          <Button type="primary" onClick={showMediaDrawer}>
            <i className="fas fa-plus-circle" />
            &nbsp; create Campaign
          </Button>
        </Space>
      </Row>
      {!isLoading && (
        <>
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
                  dataSource={productData}
                  loading={isLoading}
                  renderItem={(item) => (
                    <Row onClick={() => showMediaDrawer(item)}>
                      <List.Item>
                        <Card hoverable className="mr-30">
                          <Image
                            preview={false}
                            src={item.image_url || defaultImage}
                          />
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
              </>
            ) : (
              <div className="product_table">
                <Table
                  className="grid-table product-grid-table"
                  scroll={{ x: 780 }}
                  columns={columns}
                  dataSource={productData}
                  pagination={pagination}
                  loading={isLoading}
                  onChange={handleTableChange}
                />
              </div>
            )}
          </div>
          <SocialMediaProductsForm
            closeMediaDrawer={closeMediaDrawer}
            isMediaDrawer={isMediaDrawer}
            promoteProduct={promoteProduct}
            isEditPromoteProduct={isEditPromoteProduct}
            setIsMediaDrawer={setIsMediaDrawer}
            fetchPromoteProducts={fetchPromoteProducts}
            pagination={pagination}
          />
        </>
      )}
    </>
  );
};
export default PromoteProducts;
