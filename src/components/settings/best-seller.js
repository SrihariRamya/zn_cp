import React, { useState, useEffect } from 'react';
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
} from 'antd';
import { SearchOutlined, DeleteFilled } from '@ant-design/icons';
import { debounce, get, isEmpty, set } from 'lodash';
import {
  getNonMappedSliderProducts,
  CreateSliderBoxProduct,
  createBestSeller,
  getbestsellerProducts,
} from '../../utils/api/url-helper';
import imagePath from '../../shared/image-helper';
import { PAGE_LIMIT } from '../../shared/constant-values';
import { withRouter } from '../../utils/react-router/index';

const { Option } = Select;
const getVariantDetails = (attributeList, attributeName) => {
  const item = attributeList.find((attribute) => {
    return attribute?.zm_attribute?.name === attributeName;
  });
  return item && item.attribute_value;
};

function BestSeller(properties) {
  const { fetchData, onClose, sliderBoxUId } = properties;
  const [loading, setLoading] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [offset, setOffset] = useState(1);
  const [productTotal, setProductsCount] = useState(0);
  const [searchWord, setSearchWord] = useState('');
  const [bestSellerList, setBestSellerList] = useState([]);
  const [filterProducts, setFilterProducts] = useState([]);
  const [productSearchWord, setProductSearchWord] = useState('');
  const productsScroll = () => {
    if (productsList.length < productTotal) setOffset(offset + 1);
  };

  const handleProductsList = async () => {
    if (offset === 1) setLoading(true);
    try {
      let parameters;
      let response;
      if (sliderBoxUId) {
        parameters = {
          offset,
          limit: PAGE_LIMIT,
          slider_box_uid: sliderBoxUId,
          ...(searchWord && { searchWord }),
        };
        response = await getNonMappedSliderProducts(parameters);
      } else {
        parameters = {
          offset,
          limit: PAGE_LIMIT,
          ...(searchWord && { searchWord }),
        };
        response = await getbestsellerProducts(parameters);
      }
      const { rows, count } = response.data;
      const data = rows.map((product) => {
        const variants = get(product, 'product_variants', []).map((resp) => {
          const qty = bestSellerList.find((variant) => {
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
      setProductsCount(count);
      // eslint-disable-next-line unicorn/prefer-spread
      const productData = productsList.concat(data);
      setProductsList(productData);
      setLoading(false);
    } catch {
      setLoading(false);
      notification.error({ message: 'Failed to load product data' });
    }
  };

  useEffect(() => {
    handleProductsList();
  }, [offset, searchWord]);

  const onSearch = debounce((value) => {
    setProductsCount(0);
    setProductsList([]);
    setOffset(1);
    setSearchWord(value || '');
  }, 1000);

  const variantsChange = (value, data) => {
    const productData = [...productsList];
    const selectedVariant = data.product_variants.find(
      (variant) => variant.id === value
    );
    data.selectedVariant = selectedVariant;
    const findProduct = productData.findIndex(
      (item) => item.product_uid === data.product_uid
    );
    productData[findProduct] = data;
    setProductsList(productData);
  };

  const handleSeller = (records) => {
    const bestSellerData = [...bestSellerList];
    const sellerRecord = {
      product_name: get(records, 'product_name', ''),
      product_image: imagePath(get(records, 'product_image', [])),
      product_uid: get(records, 'product_uid', ''),
      product_variant_id: get(records, 'selectedVariant.id'),
      variant_attribute: `${getVariantDetails(
        get(records, 'selectedVariant.variant_attributes'),
        'Units'
      )}`,
    };
    const findProduct = bestSellerData.findIndex(
      (item) =>
        item.product_uid === records.product_uid &&
        item.product_variant_id === get(records, 'selectedVariant.id')
    );
    // eslint-disable-next-line no-unused-expressions
    findProduct === -1
      ? bestSellerData.push(sellerRecord)
      : set(bestSellerData, [findProduct], sellerRecord);
    setBestSellerList(bestSellerData);
  };

  const removeProducts = (record) => {
    const bestSellerData = [...bestSellerList];
    const productData = [...productsList];

    const removeProductInventory = bestSellerList.findIndex(
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

    bestSellerData.splice(removeProductInventory, 1);
    const variantIndex = get(
      productsList[removeProduct],
      'product_variants',
      []
    ).findIndex((response) => response.id === record.product_variant_id);
    set(
      productData,
      [removeProduct, 'product_variants', variantIndex, 'qty'],
      ''
    );

    productData[removeProduct].selectedVariant.qty =
      get(productsList, [removeProduct, 'selectedVariant', 'id'], '') ===
      get(record, 'product_variant_id', '')
        ? ''
        : productData[removeProduct].selectedVariant.qty;
    setProductsList(productData);
    setProductSearchWord('');
    setBestSellerList(bestSellerData);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = [];
      bestSellerList.map((data) => {
        formData.push({
          ...data,
        });
        // eslint-disable-next-line unicorn/no-null
        return null;
      });
      let updateData;
      let result;
      if (sliderBoxUId) {
        updateData = {
          sliderBoxProduct: formData,
          slider_box_uid: sliderBoxUId,
        };
        result = await CreateSliderBoxProduct(updateData);
      } else {
        updateData = {
          bestSellerData: formData,
        };
        result = await createBestSeller(updateData);
      }
      if (result.success) {
        setBestSellerList([]);
        if (formData.length > 1) {
          notification.success({
            message: 'Products added successfully',
          });
        } else {
          notification.success({
            message: 'Product added successfully',
          });
        }
        setLoading(false);
        onClose();
        fetchData();
      } else {
        notification.error({
          message: `Failed to add ${sliderBoxUId ? 'Products' : 'BestSeller'}`,
        });
      }
    } catch (error) {
      notification.error({
        message: error.message,
      });
      setLoading(false);
    }
  };

  const handleSearchProduct = (value) => {
    setProductSearchWord(value);
    const searchProduct = bestSellerList.filter((item) =>
      item.product_name.toLowerCase().includes(value)
    );
    setFilterProducts(searchProduct);
  };

  return (
    <Spin spinning={loading}>
      <div className="search-container" />
      <div className="grid-splits add-invt-table-split drawer">
        <div className="box addinvprod-box">
          <div className="box__header">
            <h3 className="box-title">Master Product List</h3>
          </div>
          <div className="box__content" style={{ height: '100%' }}>
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
                dataLength={productsList.length}
                next={productsScroll}
                hasMore={productsList.length < productTotal}
                scrollableTarget="scrollable-div"
                style={{ overflow: 'none' }}
              >
                <List
                  dataSource={productsList}
                  className="inventory-list"
                  renderItem={(item) => {
                    const productImage = imagePath(
                      get(item, 'product_image', [])
                    );
                    return (
                      <List.Item key={item.uid}>
                        <div className="products-list">
                          <div className="flex-bwn">
                            <div id="grid-area">
                              <Avatar src={productImage} size={60} />
                              <span className="invprod-name">
                                {get(item, 'product_name', '')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="products-list">
                          <div className="flex-bwn">
                            <div id="grid-area">
                              <Select
                                name={`${item.product_uid}`}
                                virtual={false}
                                value={item.selectedVariant.id}
                                onChange={(value) =>
                                  variantsChange(value, item)
                                }
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
                                      {`${getVariantDetails(
                                        result.variant_attributes,
                                        'Units'
                                      )}`}
                                    </Option>
                                  )
                                )}
                              </Select>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="primary"
                          onClick={() => handleSeller(item)}
                        >
                          Add
                        </Button>
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
            <h3 className="box-title">
              {sliderBoxUId ? 'Product List' : 'Best Seller List'}
            </h3>
          </div>
          <div className="box__content">
            <div className="productlist-title">
              <span>Product Name</span>
              <span>Variant</span>
              <span>Remove</span>
            </div>
            <div className="invsearch-bar">
              <Input
                placeholder="Product Search"
                className="custom-search"
                value={productSearchWord}
                onChange={(event) => handleSearchProduct(event.target.value)}
                suffix={<SearchOutlined className="site-form-item-icon" />}
              />
            </div>
            <div className="text-right pt-5">
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={isEmpty(bestSellerList)}
              >
                {sliderBoxUId ? 'Add Product' : 'Add BestSeller'}
              </Button>
            </div>
            <div
              className="demo-infinite-container demo-infinite-div"
              id="scrollable-div"
            >
              <List
                className="inventory-list inventory-right-list"
                locale={{ emptyText: 'No data' }}
                itemLayout="horizontal"
                dataSource={productSearchWord ? filterProducts : bestSellerList}
                renderItem={(record) => (
                  <List.Item>
                    <div className="products-contain">
                      <div className="products-list">
                        <Avatar
                          src={get(record, 'product_image', '')}
                          size={60}
                        />
                        <span className="invprod-name">
                          {get(record, 'product_name', '')}
                        </span>
                      </div>
                      <div style={{ width: '50%' }}>
                        <div className="flex-bwn">
                          <Tag color="cyan" style={{ fontSize: '15px' }}>
                            {get(record, 'variant_attribute', '')}
                          </Tag>
                          <span>
                            <span>
                              <Button
                                type="danger"
                                shape="circle"
                                danger
                                onClick={() => removeProducts(record)}
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
          </div>
        </div>
      </div>
    </Spin>
  );
}

export default withRouter(BestSeller);
