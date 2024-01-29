import React, { useEffect, useState } from 'react';
import {
  Table,
  notification,
  Drawer,
  Switch,
  Card,
  Typography,
  Space,
  List,
  Row,
  Col,
  Pagination,
} from 'antd';
import { get } from 'lodash';
import { getStoresByProduct } from '../../utils/api/url-helper';
import { ReactComponent as BackArrow } from '../../assets/icons/back-arrow.svg';
import { ReactComponent as NoData } from '../../assets/icons/no-data.svg';

const { Text } = Typography;

function ProductStoreDetails(properties) {
  const {
    productData,
    isInventoryVisible,
    onClose,
    onStatusChange,
    isTrackInventory,
    product,
    mobileView,
    isInventoryloading,
    setIsInventoryloading,
  } = properties;
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [storesData, setStoresData] = useState([]);

  const fetchData = (parameters = {}) => {
    setIsInventoryloading(true);
    const {
      pagination: { pageSize, current },
    } = parameters;
    const productVariantsIds = [];
    get(productData, 'product_variants', []).map((item) => {
      return productVariantsIds.push(item.id);
    });
    const queryParameter = {
      limit: pageSize,
      offset: current,
      product_uid: get(productData, 'product_uid', ''),
      product_variant_id: productVariantsIds,
    };
    getStoresByProduct(queryParameter)
      .then((response) => {
        setStoresData(get(response, 'data.rows', []));
        setPagination({
          ...parameters.pagination,
          total: response.data.count,
        });
        setIsInventoryloading(false);
      })
      .catch(() => {
        notification.error({ message: 'Failed to load the data' });
        setIsInventoryloading(false);
      });
  };

  useEffect(() => {
    fetchData({ pagination });
  }, [isTrackInventory]);

  useEffect(() => {
    if (productData) {
      fetchData({ pagination });
    }
  }, [productData]);

  const handleTableChange = (paginationAlias) => {
    const { current } = paginationAlias;
    fetchData({
      pagination: { pageSize: 10, current },
    });
  };

  const columns = [
    {
      title: 'Store Name',
      dataIndex: 'store_name',
      width: 120,
      key: 'store_name',
      render: (data) => <Text className="typography-text">{data}</Text>,
    },
    {
      title: 'Store Location',
      dataIndex: 'store_location',
      width: 120,
      key: 'store_location',
      render: (data) => <Text className="typography-text">{data}</Text>,
    },
    {
      title: 'Variant',
      dataIndex: 'attribute_value',
      width: 120,
      key: 'attribute_value',
      render: (data) => <Text className="typography-text">{data}</Text>,
    },
    {
      title: 'Availability',
      dataIndex: 'availability',
      width: 120,
      key: 'availability',
      render: (data) => <Text className="typography-text">{data}</Text>,
    },
  ];

  const emptyTable = () => {
    return <NoData className="no-data" />;
  };

  const customDrawerStyle = {
    marginTop: '130px',
    zIndex: '99',
    overflow: 'auto',
    maxHeight: '-webkit-fill-available',
  };

  const customMaskStyle = {
    background: 'none',
  };

  return (
    <Drawer
      style={mobileView && customDrawerStyle}
      maskStyle={mobileView && customMaskStyle}
      title={
        <Row>
          <Col span={mobileView ? 2 : 1}>
            <BackArrow onClick={onClose} className="back-arrow" />
          </Col>
          <Col span={13} className="mt-2">
            <Text className="inventory-heading">
              {mobileView ? ' Add Inventory' : 'Inventory Details'}
            </Text>
          </Col>
          {mobileView && (
            <>
              <Col span={7} className="mt-2">
                <Text className="typography-text-col">Track Inventory</Text>
              </Col>
              <Col span={2} className="mt-2">
                <Switch
                  size="small"
                  className="custom-switch-container ml-2"
                  checked={isTrackInventory}
                  onClick={(value) =>
                    onStatusChange(value, product, 'track_inventory')
                  }
                />
              </Col>
            </>
          )}
        </Row>
      }
      open={isInventoryVisible}
      onClose={onClose}
      width={800}
      height={150}
      closable={false}
      className="products-inventory-drawer"
    >
      {!mobileView && (
        <>
          <div className="track-inventory-div inventory-div">
            <span>Track Inventory</span>
            <span>
              <Switch
                size="small"
                className="custom-switch-container"
                checked={isTrackInventory}
                onClick={(value) =>
                  onStatusChange(value, product, 'track_inventory')
                }
              />
            </span>
          </div>
          <div className="inventory-div">
            <span className="note-text">Note:</span>
            &nbsp;
            <span className="switch-on-text">
              Switch on Toggle to track inventory
            </span>
          </div>
        </>
      )}
      {!mobileView && (
        <Table
          className="product-table inventory-table"
          columns={columns}
          dataSource={isTrackInventory ? storesData : []}
          pagination={pagination}
          onChange={handleTableChange}
          loading={isInventoryloading}
          locale={{
            emptyText: emptyTable(),
          }}
        />
      )}
      {mobileView && (
        <>
          <List
            itemLayout="horizontal"
            grid={{
              xs: 1,
              sm: 1,
              md: 1,
              lg: 1,
            }}
            loading={isInventoryloading}
            dataSource={isTrackInventory ? storesData : []}
            locale={{
              emptyText: emptyTable(),
            }}
            renderItem={(item) => {
              return (
                <List.Item className="product-list-item">
                  <Card className="inventory-card">
                    <Space direction="vertical" className="inventory-card-text">
                      <Text>
                        <span>Availability:</span>{' '}
                        <span className="fw-400">
                          {' '}
                          {get(item, 'availability', '')}
                        </span>
                      </Text>
                      <Text>
                        <span>Store name:</span>{' '}
                        <span className="fw-400">
                          {' '}
                          {get(item, 'store_name', '')}
                        </span>
                      </Text>
                      <Text>
                        <span> Store Location:</span>
                        <span className="fw-400">
                          {' '}
                          {get(item, 'store_location', '')}
                        </span>
                      </Text>
                      <Text>
                        <span>Variant:</span>
                        <span className="fw-400">
                          {' '}
                          {get(item, 'attribute_value', '')}
                        </span>
                      </Text>
                    </Space>
                  </Card>
                </List.Item>
              );
            }}
          />
          {storesData && (
            <div className="grid-view-pagination-long">
              <Pagination {...pagination} onChange={handleTableChange} />
            </div>
          )}
        </>
      )}
    </Drawer>
  );
}

export default ProductStoreDetails;
