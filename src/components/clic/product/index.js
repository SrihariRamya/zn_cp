/* eslint-disable react-hooks/exhaustive-deps */
import {
  Breadcrumb,
  Button,
  Input,
  List,
  Modal,
  Space,
  notification,
} from 'antd';
import { debounce, filter, get, isEmpty } from 'lodash';
import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link } from 'react-router-dom';
import { ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import {
  DeleteAlert,
  DeleteAlertMessage,
} from '../../../shared/sweetalert-helper';
import {
  BUTTON_NO_TEXT,
  BUTTON_YES_TEXT,
  INITIAL_PAGE,
  PAGE_LIMIT,
  PRODUCTS_BREAD_TITLE,
  PRODUCT_DELETE_COMFIRM_TEXT,
  PRODUCT_DELETE_FAILED,
  PRODUCT_STATUS_LIVE_COMFIRM_TEXT,
} from '../../../shared/constant-values';
import {
  deleteClicProduct,
  getClicProducts,
  updateClicProductStatus,
} from '../../../utils/api/url-helper';
import './clic-product.less';
import { parseJSONSafely } from '../../../shared/function-helper';
import ProductItem from './product-item';

const { confirm } = Modal;

const Product = () => {
  const [initLoading, setInitLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(INITIAL_PAGE);
  const [totalProductCount, setTotalProductCount] = useState();
  const [searchWord, setSearchWord] = useState('');

  const fetchProductData = (offset, searchKey = '') => {
    setInitLoading(true);
    const parameters = {
      limit: PAGE_LIMIT,
      offset,
    };
    if (searchKey) {
      parameters.searchWord = searchKey;
    }
    getClicProducts(parameters)
      .then((response) => {
        const { count, rows } = get(response, ['data'], []);
        setTotalProductCount(count);
        if (offset === INITIAL_PAGE) {
          const element = document.getElementById('scrollableDiv');
          if (element) element.scrollTop = 0;

          setProducts(rows);
        } else {
          setProducts([...products, ...rows]);
        }
        setPage(offset);
        setInitLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error?.message });
      });
  };

  const loadMoreData = () => {
    fetchProductData(page + INITIAL_PAGE);
  };

  useEffect(() => {
    fetchProductData(INITIAL_PAGE);
  }, []);

  const onSearchDebounce = debounce((value) => {
    fetchProductData(INITIAL_PAGE, value);
  }, 1000);

  const onSearch = (value) => {
    setSearchWord(value || '');
    onSearchDebounce(value);
  };

  const handleDelete = async (value) => {
    const text = PRODUCT_DELETE_COMFIRM_TEXT;
    const result = await DeleteAlert(text);
    if (result.isConfirmed) {
      const parameters = {
        id: [value?.product_uid],
      };
      setInitLoading(true);
      deleteClicProduct(parameters)
        .then(() => {
          setInitLoading(false);
          setSearchWord('');
          fetchProductData(INITIAL_PAGE);
        })
        .catch(() => {
          setInitLoading(false);
          DeleteAlertMessage({
            title: PRODUCT_DELETE_FAILED,
            icon: 'error',
          });
        });
    }
  };

  const onStatusChange = (value, item) => {
    confirm({
      title: PRODUCT_STATUS_LIVE_COMFIRM_TEXT,
      icon: <ExclamationCircleOutlined />,
      okText: BUTTON_YES_TEXT,
      cancelText: BUTTON_NO_TEXT,
      className: 'clic-confirm-modal',
      onOk() {
        const parameters = {
          status: value,
        };
        setInitLoading(true);
        updateClicProductStatus(item?.product_uid, parameters)
          .then(() => {
            setInitLoading(false);
            setSearchWord('');
            fetchProductData(INITIAL_PAGE);
          })
          .catch(() => {
            setInitLoading(false);
            DeleteAlertMessage({
              title: PRODUCT_DELETE_FAILED,
              icon: 'error',
            });
          });
      },
    });
  };

  return (
    <div className="clic-product-container">
      <div>
        <div>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>{PRODUCTS_BREAD_TITLE}</Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="search-products-container">
          <div className="flex-bwn">
            <div>
              <Input
                allowClear
                placeholder="Search"
                value={searchWord}
                onChange={(event_) => onSearch(event_?.target?.value)}
                className="custom-search"
                suffix={<SearchOutlined className="site-form-item-icon" />}
              />
            </div>
            <div className="flex-bwn">
              <div className="ml-10">
                <Link to="/products/add-product">
                  <Button type="primary">Add Product</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div id="scrollableDiv" className="product-list-container">
            <InfiniteScroll
              dataLength={products?.length || 0}
              next={loadMoreData}
              hasMore={products?.length < totalProductCount}
              // loader={true}
              scrollableTarget="scrollableDiv"
            >
              <List
                itemLayout="horizontal"
                dataSource={products}
                grid={{
                  gutter: 0,
                  xs: 1,
                  sm: 1,
                  md: 2,
                  lg: 2,
                  xl: 3,
                  xxl: 3,
                }}
                className="products-listlook"
                loading={initLoading}
                renderItem={(product) => {
                  const enquiryFeild = filter(
                    get(product, 'product_leads', []),
                    (item) =>
                      item?.lead?.key === 'enquire' &&
                      !isEmpty(item?.enquiry_fields)
                  );
                  let enquiryFeilds = [];
                  if (!isEmpty(enquiryFeild))
                    enquiryFeilds = parseJSONSafely(
                      get(enquiryFeild, '[0].enquiry_fields', {})
                    );
                  return (
                    <List.Item>
                      <ProductItem
                        enquiryFeilds={enquiryFeilds}
                        product={product}
                        onStatusChange={onStatusChange}
                        handleDelete={handleDelete}
                      />
                    </List.Item>
                  );
                }}
              />
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Product;
