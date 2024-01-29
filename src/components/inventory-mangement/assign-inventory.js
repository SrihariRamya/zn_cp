import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  Spin,
  Button,
  notification,
  List,
  Avatar,
  Input,
  Select,
  Tag,
  Typography,
  Space,
} from 'antd';
import {
  UserSwitchOutlined,
  SearchOutlined,
  DeleteFilled,
  PlusOutlined,
} from '@ant-design/icons';
import { debounce, get, isEmpty, set } from 'lodash';
import './inventory.less';
import {
  getProducts,
  assignInventory,
  createOrUpdateStoreProduct,
} from '../../utils/api/url-helper';
import { withRouter } from '../../utils/react-router/index';
import BreadcrumbComponent from '../../shared/breadcrumb-helper';
import { PAGE_LIMIT } from '../../shared/constant-values';
import { defaultImage } from '../../shared/image-helper';
import { eventTrack } from '../../shared/function-helper';

const { Option } = Select;
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
    name: 'Add Inventory',
    pathname: '',
  },
];

function AssignInventory(properties) {
  const navigate = useNavigate();
  const location = useLocation();
  const canWrite = get(properties, 'roleData.can_write', false);
  const [loading, setLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [offset, setOffset] = useState(1);
  const [productTotal, setProductCount] = useState(0);
  const [searchWord, setSearchWord] = useState('');
  const [inventoryList, setInventoryList] = useState([]);
  const [storeID] = useState(localStorage.getItem('storeID'));
  const [storeUID] = useState(get(location, 'state.store_uid', ''));
  const productScroll = () => {
    if (productList.length < productTotal) setOffset(offset + 1);
  };
  const handleProductList = async () => {
    if (offset === 1) setLoading(true);
    try {
      const parameters = {
        offset,
        limit: PAGE_LIMIT,
        apiType: 'ByProductId',
        fromInventory: true,
        ...(searchWord && { searchWord }),
      };
      const response = await getProducts(parameters);
      const { rows, count } = response.data;
      const data = rows.map((product) => {
        const variants = get(product, 'product_variants', []).map((resp) => {
          const qty = inventoryList.find((variant) => {
            return (
              variant.product_uid === product.product_uid &&
              variant.product_uid === resp.product_uid &&
              resp.id === variant.product_variant_id
            );
          })?.quantity;
          return {
            ...resp,
            qty,
          };
        });
        return {
          ...product,
          product_variants: variants,
          selectedVariant: variants[0],
        };
      });
      setProductCount(count);
      // eslint-disable-next-line unicorn/prefer-spread
      const productData = await productList.concat(data);
      setProductList(productData);
      setLoading(false);
    } catch {
      setLoading(false);
      notification.error({ message: 'Failed to load product data' });
    }
  };

  useEffect(() => {
    handleProductList();
  }, [offset, searchWord]);

  const onSearch = debounce((value) => {
    setProductCount(0);
    setProductList([]);
    setOffset(1);
    setSearchWord(value || '');
  }, 1000);

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const getVariantDetail = (attributeList, attributeName) => {
    const item = attributeList.find((attribute) => {
      return attribute?.zm_attribute?.name === attributeName;
    });
    return item && item.attribute_value;
  };
  const variantChange = (value, data) => {
    const productData = [...productList];
    const selectedVariant = data.product_variants.find(
      (variant) => variant.id === value
    );
    data.selectedVariant = selectedVariant;
    const findProduct = productData.findIndex(
      (item) => item.product_uid === data.product_uid
    );
    productData[findProduct] = data;
    setProductList(productData);
  };
  const variantQty = (event, data) => {
    const productData = [...productList];
    set(data, 'selectedVariant.qty', event.target.value);
    const findProduct = productData.findIndex(
      (item) => item.product_uid === data.product_uid
    );
    set(productData, [findProduct], data);
    setProductList(productData);
  };

  const addInventoryQty = (event, data) => {
    const inventoryData = [...inventoryList];
    const productData = [...productList];
    data.quantity = event.target.value;
    const findInventoryProduct = inventoryData.findIndex(
      (item) =>
        item.product_uid === data.product_uid &&
        item.product_variant_id === data.product_variant_id
    );
    const findProduct = productData.findIndex(
      (item) => item.product_uid === data.product_uid
    );
    inventoryData[findInventoryProduct] = data;
    const variantIndex = get(
      productData,
      [findProduct, 'product_variants'],
      []
    ).findIndex((response) => response.id === data.product_variant_id);
    set(
      productData,
      `[${findProduct}].product_variants[${variantIndex}].qty`,
      event.target.value
    );
    if (
      get(productList, [findProduct, 'selectedVariant', 'id'], '') ===
        get(data, 'product_variant_id') &&
      get(productList, [findProduct, 'selectedVariant', 'product_uid'], '') ===
        get(data, 'product_uid')
    ) {
      set(
        productData,
        [findProduct, 'selectedVariant', 'qty'],
        event.target.value
      );
    }
    setProductList(productList);
    setInventoryList(inventoryData);
  };

  const handleInventory = (records) => {
    const inventoryData = [...inventoryList];
    const inventoryRecord = {
      product_name: get(records, 'product_name', ''),
      product_image: get(records, 'product_image[0].product_image', ''),
      product_uid: get(records, 'product_uid', ''),
      store_uid: storeID || storeUID,
      product_variant_id: get(records, 'selectedVariant.id', ''),
      quantity: get(records, 'selectedVariant.qty', ''),
      variant_attribute: isEmpty(
        get(records, 'selectedVariant.variant_attributes')
      )
        ? []
        : `${getVariantDetail(
            get(records, 'selectedVariant.variant_attributes', ''),
            'Units'
          )}`,
    };
    const findProduct = inventoryData.findIndex(
      (item) =>
        item.product_uid === records.product_uid &&
        item.product_variant_id === get(records, 'selectedVariant.id')
    );
    // eslint-disable-next-line no-unused-expressions
    findProduct === -1
      ? inventoryData.push(inventoryRecord)
      : set(inventoryData, [findProduct], inventoryRecord);
    setInventoryList(inventoryData);
  };

  const removeInventory = (record) => {
    const inventoryData = [...inventoryList];
    const productData = [...productList];
    const removeProductInventory = inventoryList.findIndex(
      (response) =>
        response.product_uid === record.product_uid &&
        response.product_variant_id === record.product_variant_id
    );
    const removeProduct = productData.findIndex(
      (response) =>
        response.product_uid === record.product_uid &&
        get(response, 'product_variants', []).some(
          (variant) => variant.id === record.product_variant_id
        )
    );
    inventoryData.splice(removeProductInventory, 1);
    if (!isEmpty(productData)) {
      const variantIndex = get(
        productList[removeProduct],
        'product_variants',
        []
      ).findIndex((response) => response.id === record.product_variant_id);
      set(
        productData,
        [removeProduct, 'product_variants', variantIndex, 'qty'],
        ''
      );
    }
    setProductList(productData);
    setInventoryList(inventoryData);
  };

  const submitInventoryList = async () => {
    try {
      setLoading(true);
      const formData = [];
      inventoryList.map((data) => {
        formData.push({
          ...data,
          source: 'inventory',
          transaction_type: 'instock',
        });
        // eslint-disable-next-line unicorn/no-null
        return null;
      });
      const updateData = {
        InventoryData: formData,
      };
      const result = await createOrUpdateStoreProduct(updateData);
      const response = await assignInventory(updateData);
      if (response.success && result.success) {
        setInventoryList([]);
        notification.success({
          message: `${
            formData.length === 1 ? 'Product' : 'Products'
          } added Successfully`,
        });
        setLoading(false);
        navigate({
          pathname: '/inventory',
          state: {
            store_uid: storeUID,
          },
        });
      } else {
        notification.error({
          message: 'Failed to add inventory',
        });
      }
    } catch (error) {
      notification.error({
        message: error.message,
      });
      setLoading(false);
    }
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const adminEvent = () => {
    const parameter = {
      value: 'Add Product',
    };
    eventTrack('Add Product Click', parameter);
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
        <div>
          <Link
            to={{
              pathname: '/products/add-product',
              aboutProps: {
                storeID: storeID || storeUID,
                page: 'add',
              },
            }}
          >
            <Button
              id="addProductBtn"
              type="primary"
              hidden={!canWrite}
              className="add-btn"
              onClick={() => adminEvent()}
            >
              <PlusOutlined />
              Add Product
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid-splits add-invt-table-split">
        <div className="box addinvprod-box">
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
              <span>Add</span>
            </div>
            <div className="invsearch-bar">
              <Input
                placeholder="Product Search"
                className="custom-search"
                onChange={(event) => onSearch(event.target.value)}
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
                <List
                  dataSource={productList}
                  className="inventory-list"
                  renderItem={(item) => {
                    const productImage = get(
                      item,
                      'product_image[0].product_image',
                      ''
                    );
                    return (
                      <List.Item key={item.uid}>
                        <div style={{ flex: 1, width: '50%' }}>
                          <div className="flex-bwn">
                            <div id="grid-area">
                              <Avatar
                                src={productImage || defaultImage}
                                size={50}
                              />
                              <span className="invprod-name">
                                {get(item, 'product_name', '')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ flex: 1, width: '50%' }}>
                          <div className="flex-bwn">
                            <div id="grid-area">
                              <Select
                                className="variant-select"
                                virtual={false}
                                name={`${item.product_uid}`}
                                value={get(item, 'selectedVariant.id', '')}
                                onChange={(value) => variantChange(value, item)}
                                getPopupContainer={() =>
                                  document.querySelector('#grid-area')
                                }
                              >
                                {get(item, 'product_variants', []).map(
                                  (result) => (
                                    <Option
                                      key={get(result, 'id', '')}
                                      value={get(result, 'id', '')}
                                    >
                                      {`${getVariantDetail(
                                        result.variant_attributes,
                                        'Units'
                                      )}`}
                                    </Option>
                                  )
                                )}
                              </Select>
                            </div>
                            <Input
                              className="add-button-pad"
                              type="number"
                              style={{ width: '130px' }}
                              suffix={
                                <Button
                                  type="primary"
                                  className="inventory-list-add-btn"
                                  onClick={() => handleInventory(item)}
                                  disabled={
                                    !get(item, 'selectedVariant.qty') ||
                                    Number(
                                      get(item, 'selectedVariant.qty', 0)
                                    ) <= 0
                                  }
                                >
                                  Add
                                </Button>
                              }
                              value={get(item, 'selectedVariant.qty', '')}
                              onChange={(event) => variantQty(event, item)}
                              min={0}
                            />
                          </div>
                        </div>
                      </List.Item>
                    );
                  }}
                >
                  {loading && (
                    <div className="demo-loading-container">
                      <Spin />
                    </div>
                  )}
                </List>
              </InfiniteScroll>
            </div>
          </div>
        </div>
        <div className="box addinvprod-box">
          <div className="box__header">
            <h3 className="box-title">Store Product List</h3>
          </div>
          <div className="box__content inventory-prod">
            <div className="productlist-title">
              <span>Product Name</span>
              <span>Variant</span>
              <span>Add / Remove</span>
            </div>
            <div className="demo-infinite-container" id="scrollable-div">
              <List
                className="inventory-list inventory-right-list"
                locale={{ emptyText: 'No data' }}
                itemLayout="horizontal"
                dataSource={inventoryList}
                renderItem={(item) => (
                  <List.Item>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ flex: 1, width: '50%' }}>
                        <Avatar
                          src={get(item, 'product_image', '') || defaultImage}
                          size={40}
                        />
                        <span className="invprod-name">
                          {get(item, 'product_name', '')}
                        </span>
                      </div>
                      <div style={{ width: '55%' }}>
                        <div className="flex-bwn">
                          <div style={{ width: '30%' }}>
                            <Tag
                              className="variant-attribute"
                              color="cyan"
                              style={{ fontSize: '12px' }}
                            >
                              {get(item, 'variant_attribute', '')}
                            </Tag>
                          </div>
                          <span className="mr-30" style={{ display: 'flex' }}>
                            <Input
                              name="quantity"
                              type="number"
                              style={{ width: '80px' }}
                              value={get(item, 'quantity')}
                              min={0}
                              onChange={(event) => addInventoryQty(event, item)}
                            />
                            <span>
                              <Button
                                type="danger"
                                shape="circle"
                                danger
                                onClick={() => removeInventory(item)}
                                icon={<DeleteFilled />}
                              />
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
            <div className="text-right">
              <Button
                type="primary"
                className="add-inventory"
                onClick={submitInventoryList}
                disabled={isEmpty(inventoryList)}
              >
                Add Inventory
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withRouter(AssignInventory);
