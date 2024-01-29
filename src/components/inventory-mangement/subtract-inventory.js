import React, { useState, useEffect } from 'react';
import {
  Input,
  List,
  notification,
  Avatar,
  Spin,
  Button,
  Space,
  Tag,
  Typography,
  Form,
} from 'antd';
import {
  UserSwitchOutlined,
  SearchOutlined,
  DeleteFilled,
} from '@ant-design/icons';
import { get, debounce, set, pick, isEmpty } from 'lodash';
import './inventory.less';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useLocation, useNavigate } from 'react-router-dom';
import { PAGE_LIMIT, FAILED_TO_LOAD } from '../../shared/constant-values';
import BreadcrumbComponent from '../../shared/breadcrumb-helper';
import {
  getInventoryDetails,
  assignInventory,
} from '../../utils/api/url-helper';
import { withRouter } from '../../utils/react-router/index';
import { defaultImage } from '../../shared/image-helper';

const { Title } = Typography;
const breadCrumbDetails = [
  {
    name: 'Home',
    pathname: '/',
  },
  {
    name: 'Inventory',
    pathname: '/inventory',
  },
  {
    name: 'Subtract Inventory',
    pathname: '',
  },
];

function SubtractInventory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [offset, setOffset] = useState(1);
  const [productTotal, setProductCount] = useState(0);
  const [searchWord, setSearchWord] = useState('');
  const [storeID] = useState(localStorage.getItem('storeID'));
  const [storeUID] = useState(get(location, 'state.store_uid', ''));
  const productScroll = () => {
    if (productList.length < productTotal) setOffset(offset + 1);
  };

  const handleProductList = async () => {
    if (offset === 1) setLoading(true);
    const parameters = {
      offset,
      limit: PAGE_LIMIT,
    };
    parameters.store_uid = storeID || storeUID;
    if (searchWord) {
      parameters.searchWord = searchWord;
    }
    getInventoryDetails(parameters)
      .then((response) => {
        const { count } = response.data;
        const data = get(response, 'data.rows', []).map((item) => {
          const findProduct = inventoryList.find(
            (list) =>
              item.product_uid === list.product_uid &&
              item.product_variant_id === list.product_variant_id
          );
          return {
            ...item,
            quantity: isEmpty(findProduct) ? '' : findProduct.quantity,
          };
        });
        setProductCount(count);
        // eslint-disable-next-line unicorn/prefer-spread
        const productData = productList.concat(data);
        setProductList(productData);
        setLoading(false);
      })
      .catch((error_) => {
        notification.error({ message: error_.message || FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  useEffect(() => {
    handleProductList();
  }, [offset, searchWord]);

  const onProductSearch = debounce((value) => {
    setProductCount(0);
    setProductList([]);
    setOffset(1);
    setSearchWord(value || '');
  }, 1000);

  const addQuantity = (event, data) => {
    const productData = [...productList];
    set(data, 'quantity', event.target.value);
    const findProduct = productData.findIndex(
      (item) =>
        item.product_uid === data.product_uid &&
        item.product_variant_id === data.product_variant_id
    );
    set(productData, [findProduct], data);
    setProductList(productData);
  };

  const handleAddInventory = (record) => {
    const inventoryData = [...inventoryList];
    const findProduct = inventoryData.findIndex(
      (item) =>
        item.product_uid === record.product_uid &&
        item.product_variant_id === get(record, 'product_variant_id', '')
    );
    // eslint-disable-next-line no-unused-expressions
    findProduct === -1
      ? inventoryData.push(record)
      : set(inventoryData, [findProduct], record);
    setInventoryList(inventoryData);
  };

  const removeInventory = (record) => {
    const inventoryData = [...inventoryList];
    const productData = [...productList];
    const removeInventoryData = inventoryList.findIndex(
      (resp) =>
        resp.product_uid === record.product_uid &&
        resp.product_variant_id === record.product_variant_id
    );
    const removeProductData = productList.findIndex(
      (item) =>
        item.product_uid === record.product_uid &&
        item.product_variant_id === record.product_variant_id
    );
    set(productData, [removeProductData, 'quantity'], '');
    inventoryData.splice(removeInventoryData, 1);
    setProductList(productData);
    setInventoryList(inventoryData);
    form.setFields([
      {
        name: [removeProductData, 'item', 'quantity'],
        value: '',
      },
    ]);
  };

  const onSubmitSubtractInventory = () => {
    setLoading(true);
    const formData = inventoryList.map((item) => {
      const data = pick(item, [
        'product_uid',
        'product_variant_id',
        'quantity',
        'store_uid',
      ]);
      return {
        ...data,
        source: 'inventory',
        transaction_type: 'outstock',
      };
    });
    const updateSubtrctData = {
      InventoryData: formData,
    };
    assignInventory(updateSubtrctData)
      .then((result) => {
        const { success } = result;
        if (success === true) {
          setInventoryList([]);
          notification.success({
            message: `${
              formData.length === 1 ? 'Product' : 'Products'
            } has been out-stock Successfully`,
          });
          setLoading(false);
          navigate({
            pathname: '/inventory',
            state: {
              store_uid: storeUID,
            },
          });
        }
      })
      .catch((error) => {
        notification.error({
          message: get(
            error,
            'message',
            `${formData.length === 1 ? 'Product' : 'Products'} out-stock failed`
          ),
        });
        setLoading(false);
      });
  };

  return (
    <>
      <div className="search-container">
        <Space direction="vertical">
          <Title level={5}>
            <Space align="center">
              <UserSwitchOutlined />
              Inventory Management
            </Space>
          </Title>
          <BreadcrumbComponent breadCrumbDetails={breadCrumbDetails} />
        </Space>
      </div>
      <div className="grid-splits add-invt-table-split">
        <div className="box addinvprod-box invError">
          <div className="box__header">
            <h3 className="box-title">Master Product List</h3>
          </div>
          <div
            className="box__content inventory-prod"
            style={{ height: '100%' }}
          >
            <div className="productlist-title">
              <span>Product Name</span>
              <span>Variant</span>
              <span>In Stock</span>
              <span>Add</span>
            </div>
            <div className="invsearch-bar">
              <Input
                placeholder="Product Search"
                className="custom-search"
                onChange={(event) => onProductSearch(event.target.value)}
                suffix={<SearchOutlined className="site-form-item-icon" />}
              />
            </div>
            <div className="demo-infinite-container" id="scrollable-div">
              <InfiniteScroll
                dataLength={productList.length}
                next={productScroll}
                hasMore={productList.length < productTotal}
                scrollableTarget="scrollable-div"
                style={{ overflow: 'none' }}
              >
                <Form form={form} onFinish={onSubmitSubtractInventory}>
                  <List
                    dataSource={productList}
                    className="inventory-list"
                    renderItem={(item, index) => {
                      const productImage = get(item, 'product_image', '');
                      return (
                        <List.Item style={{ height: '130px' }}>
                          <div style={{ width: '40%' }}>
                            <Avatar
                              src={productImage || defaultImage}
                              size={40}
                            />
                            <span className="invprod-name">
                              {get(item, 'product_name', '')}
                            </span>
                          </div>
                          <div style={{ width: '60%' }}>
                            <div className="flex-bwn">
                              <div style={{ width: '30%' }}>
                                <Tag
                                  className="variant-attribute"
                                  color="cyan"
                                  style={{ fontSize: '12px' }}
                                >
                                  {get(item, 'attribute_value', '')}
                                </Tag>
                              </div>
                              <span className="stock-area">
                                <span>{get(item, 'availability', '')}</span>
                              </span>
                              <div className="int-form-number">
                                <Form.Item
                                  name={[index, 'item', 'quantity']}
                                  rules={[
                                    {
                                      validator: (rule, value) => {
                                        if (value && value < 0) {
                                          // eslint-disable-next-line prefer-promise-reject-errors
                                          return Promise.reject(
                                            'Quantity should not be negative number'
                                          );
                                        }
                                        if (
                                          value &&
                                          value > Number(item.availability)
                                        ) {
                                          // eslint-disable-next-line prefer-promise-reject-errors
                                          return Promise.reject(
                                            'Quantity should not be greater than the availability'
                                          );
                                        }
                                        return Promise.resolve();
                                      },
                                    },
                                  ]}
                                >
                                  <Input
                                    className="add-button-pad"
                                    type="number"
                                    style={{ width: '130px' }}
                                    suffix={
                                      <Button
                                        type="primary"
                                        onClick={() => handleAddInventory(item)}
                                        className="inventory-list-add-btn"
                                        disabled={
                                          !get(item, 'quantity', '') ||
                                          Number(get(item, 'quantity', 0)) <=
                                            0 ||
                                          Number(get(item, 'quantity', 0)) >
                                            Number(get(item, 'availability', 0))
                                        }
                                      >
                                        Add
                                      </Button>
                                    }
                                    value={get(item, 'quantity', '')}
                                    onChange={(event) =>
                                      addQuantity(event, item)
                                    }
                                    min={0}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                          </div>
                        </List.Item>
                      );
                    }}
                  >
                    {loading && (
                      <div className="demo-loading-container">
                        <Spin spinning={loading} />
                      </div>
                    )}
                  </List>
                </Form>
              </InfiniteScroll>
            </div>
          </div>
        </div>
        <div className="box addinvprod-box invError">
          <div className="box__header">
            <h3 className="box-title">Store Product List</h3>
          </div>
          <div className="box__content inventory-prod">
            <div className="productlist-title">
              <span>Product Name</span>
              <span>Variant</span>
              <span>Remove</span>
            </div>
            <div className="demo-infinite-container" id="scrollable-div">
              <List
                className="inventory-list"
                locale={{ emptyText: 'No data' }}
                itemLayout="horizontal"
                dataSource={inventoryList}
                renderItem={(item) => (
                  <List.Item key={item.product_uid}>
                    <div style={{ flex: 1, width: '50%' }}>
                      <Avatar
                        src={get(item, 'product_image', '') || defaultImage}
                        size={40}
                      />
                      <span className="invprod-name">
                        {get(item, 'product_name', '')}
                      </span>
                    </div>
                    <div style={{ flex: 1, width: '60%' }}>
                      <div className="flex-bwn">
                        <div style={{ width: '30%' }}>
                          <Tag
                            className="variant-attribute"
                            color="cyan"
                            style={{ fontSize: '12px' }}
                          >
                            {get(item, 'attribute_value', '')}
                          </Tag>
                        </div>
                        <span style={{ display: 'flex' }}>
                          <Input.Group style={{ display: 'inline' }}>
                            <Input
                              type="number"
                              className="inventory-subtract-input"
                              value={get(item, 'quantity')}
                              readOnly
                            />
                          </Input.Group>
                          <Button
                            type="danger"
                            shape="circle"
                            danger
                            onClick={() => removeInventory(item)}
                            icon={<DeleteFilled />}
                          />
                        </span>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
            <div className="text-right">
              <Button
                htmlType="submit"
                type="primary"
                onClick={() => form.submit()}
                disabled={isEmpty(inventoryList)}
              >
                Subtract Inventory
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withRouter(SubtractInventory);
