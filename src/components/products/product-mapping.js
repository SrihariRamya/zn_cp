import React, { useState, useEffect } from 'react';
import {
  Spin,
  Card,
  Row,
  Col,
  Button,
  Typography,
  Checkbox,
  Select,
  Input,
  Tooltip,
  notification,
  List,
  Modal,
} from 'antd';
import './product.less';
import { Link } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import { get, debounce, isEmpty, map, filter } from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import { fetchAllProducts, getCategories } from '../../utils/api/url-helper';
import imagePath from '../../shared/image-helper';
import {
  PRODUCT_RETRIVE_FAILED,
  INITIAL_PAGE,
} from '../../shared/constant-values';
import VideoORImage from '../../shared/video-or-image-helper';
import { ReactComponent as AddProductIcon } from '../../assets/icons/add-product.svg';
import EmptyData from '../../shared/empty-data';
import Categories from './mobile-view-categories';

const { Text } = Typography;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

const cardClassName = (isFirstItem, isLastPage, isLastItem) => {
  if (isFirstItem || (isLastPage && isLastItem)) {
    return 'add-product-card';
  }
  return 'prdt-card';
};

const handleCatFilter = (cat, subCat) => {
  if (subCat) {
    return { sub_category_uid: subCat };
  }
  if (cat) {
    return { category_uid: cat };
  }
  return {};
};

const handleSearchParameter = (searchKey) => {
  return searchKey ? { searchWord: searchKey } : {};
};

const handleDataResponse = (response, current, totalCount, page) => {
  const productDataSet = get(response, ['data'], []);
  const dataSource = get(productDataSet, 'rows', []);
  const isInitialPage = current === INITIAL_PAGE;
  const findLastPage = Math.ceil(totalCount / page);
  const isLastPage = current === findLastPage && current > INITIAL_PAGE;
  const dataSet =
    isLastPage && !isEmpty(dataSource)
      ? [...dataSource, { slug: 'add_product' }]
      : dataSource;

  return { productDataSet, dataSet, isInitialPage };
};

function ProductMapping(properties) {
  const {
    isRelatedProducts,
    addRelatedProduct,
    onCancel,
    productUid,
    isSaveBtnLoading,
    isAddProducts,
    mobileView,
    isOpenDrawer,
    setIsOpenDrawer,
    isCoupon,
    addMappedProducts,
    mappedProducts,
  } = properties;
  const [mainCategoryValue, setMainCategoryValue] = useState();
  const [productFlag, setProductFlag] = useState(false);
  const [pagination, setPagination] = useState({
    current: INITIAL_PAGE,
    pageSize: 14,
  });
  const [searchValue, setSearchValue] = useState('');
  const [productData, setProductData] = useState([]);
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [mainCategoryData, setMainCategoryData] = useState([]);
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [categoryUid, setCategoryUid] = useState();
  const [subCategoryUid, setSubCategoryUid] = useState();
  const [totalProductCount, setTotalProductCount] = useState('');
  const [plainOptions, setPlainOptions] = useState([]);
  const [checkedList, setCheckedList] = useState(
    isCoupon ? mappedProducts : []
  );
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const hasMoreProducts = productData?.length < totalProductCount;

  const getProductViewData = (parameters = {}, cat = '', subCat = '') => {
    setProductFlag(true);

    const {
      pagination: { pageSize: page, current },
      searchKey,
    } = parameters;

    const catFilter = handleCatFilter(cat, subCat);
    const searchParameter = handleSearchParameter(searchKey);
    searchParameter.firstTableParams = 'zm_product';

    return new Promise((resolve, reject) => {
      fetchAllProducts({
        limit: page,
        offset: current,
        ...catFilter,
        ...searchParameter,
        productUid: productUid || '',
        isRelatedProducts,
        selectedCategories: isEmpty(selectedCategories)
          ? []
          : JSON.stringify(selectedCategories),
        selectedSubCategories: isEmpty(selectedSubCategories)
          ? []
          : JSON.stringify(selectedCategories),
      })
        .then((response) => {
          const { productDataSet, dataSet, isInitialPage } = handleDataResponse(
            response,
            current,
            totalProductCount,
            page
          );
          if (isInitialPage) {
            dataSet.unshift({ slug: 'add_new_product' });
            const element = document.querySelector('#scrollable-product');
            if (element) element.scrollTop = 0;
            setProductData(dataSet);
            setPlainOptions(dataSet);
          } else {
            setProductData([...productData, ...dataSet]);
            setPlainOptions([...productData, ...dataSet]);
          }

          setPagination({
            ...parameters.pagination,
            total: productDataSet.count,
          });

          setIsOpenDrawer(false);
          setTotalProductCount(productDataSet?.count);
          setProductFlag(false);

          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const createProducts = () => {
    if (isRelatedProducts) {
      const mappedProductList = map(checkedList, (item) => {
        const product = {
          product_uid: productUid,
          mapping_product_uid: item,
        };
        return product;
      });
      addRelatedProduct(mappedProductList);
    } else {
      addMappedProducts(checkedList);
    }
  };

  const resetFilters = () => {
    setMainCategoryValue();
    setSubCategoryUid();
    setSubCategoryData([]);
    setCategoryUid();
  };

  const mainCategoryChange = (value, item) => {
    if (value) {
      const subCategory = mainCategoryData.filter(
        (data) => data.category_uid === value
      );
      setProductData([]);
      setCategoryUid(item.value);
      setMainCategoryValue(value);
      setSubCategoryUid();
      setProductFlag(true);
      setSubCategoryData(get(subCategory, '[0].sub_category', []));
    } else {
      resetFilters();
    }
  };

  const subCategoryChange = (value, item) => {
    const setCategoryID = item ? item.value : subCategoryUid;
    if (value) {
      setProductFlag(true);
      setSubCategoryUid(setCategoryID);
      setProductData([]);
    } else {
      setProductFlag(true);
      setProductData([]);
      setSubCategoryUid();
    }
  };

  const getCategoryData = () => {
    setIsDataFetching(true);
    const parameters = {
      productUid,
      isRelatedProducts,
    };
    getCategories(parameters)
      .then((response) => {
        const categoryData = get(response, 'data', []);
        const filteredCategory = categoryData.map((item) => {
          const returnArray = item;
          returnArray.sub_category = item.sub_category.filter(
            (element) => get(element, 'product_sub_category_count', '') !== 0
          );
          return returnArray;
        });
        setMainCategoryData(filteredCategory);
        setIsDataFetching(false);
      })
      .catch((error_) => {
        setIsDataFetching(false);
        notification.error({
          message: error_.message || PRODUCT_RETRIVE_FAILED,
        });
      });
  };

  useEffect(() => {
    getCategoryData();
  }, []);

  useEffect(() => {
    getProductViewData(
      {
        pagination: { current: INITIAL_PAGE, pageSize: 14 },
        searchKey: searchValue,
      },
      categoryUid,
      subCategoryUid
    );
  }, [categoryUid, subCategoryUid]);

  const onSearchDebounce = debounce((value) => {
    setProductFlag(true);
    getProductViewData(
      {
        pagination: { pageSize: 14, current: INITIAL_PAGE },
        searchKey: value,
      },
      categoryUid,
      subCategoryUid
    );
  }, 1000);

  const onSearch = (value) => {
    setSearchValue(value || '');
    onSearchDebounce(value);
  };

  const cancelDrawer = () => {
    setProductData([]);
    setPlainOptions([]);
    if (!isCoupon) {
      setCheckedList([]);
    }
    onCancel();
  };

  const checkMore = (items) => {
    setCheckedList([...new Set([...checkedList, ...items])]);
  };
  const checkLess = (items) => {
    setCheckedList(filter(checkedList, (c) => !items.includes(c)));
  };
  const onCheckAllChange = (event) => {
    const filteredOptions = filter(
      plainOptions,
      (value) => Object.hasOwn(value, 'slug') === false
    );
    const selectedItems = map(filteredOptions, (item) => item?.product_uid);
    if (event.target.checked) {
      checkMore(selectedItems);
    } else {
      checkLess(selectedItems);
    }
  };
  const filteredOptions = filter(
    plainOptions,
    (value) => Object.hasOwn(value, 'slug') === false
  );
  const checkedCount = filter(checkedList, (item) =>
    map(filteredOptions, (value) => value?.product_uid).includes(item)
  ).length;
  const isCheckedAll = checkedCount === filteredOptions.length;
  const isIndeterminate =
    checkedCount && checkedCount !== filteredOptions.length;

  const addNewProduct = () => {
    return (
      <Link to="/products/add-product">
        <Button type="text" block>
          <div>
            <AddProductIcon />
          </div>
          <div>
            <Text className={`add-typography ${!mobileView && 'add-text'}`}>
              <span className="click-text">Click</span>{' '}
              {!mobileView && <span> here add new </span>}
            </Text>
          </div>
          <div>
            {mobileView && (
              <Text className="add-typography add-text">here add new</Text>
            )}
          </div>
          <Text className="add-typography add-prdt-span"> product</Text>
        </Button>
      </Link>
    );
  };
  const loadMoreData = () => {
    const { current } = pagination;
    getProductViewData(
      {
        pagination: { current: current + INITIAL_PAGE, pageSize: 14 },
        searchKey: searchValue,
      },
      categoryUid,
      subCategoryUid
    );
  };

  const renderContent = (item, isLastPage, isLastItem) => {
    if (get(item, 'slug', '') === 'add_new_product') {
      return addNewProduct();
    }
    if (get(item, 'slug', '') === 'add_product' && isLastPage && isLastItem) {
      return addNewProduct();
    }
    return (
      <>
        <div>
          <Checkbox
            className="store-category-card checkbox-position"
            value={item?.product_uid}
            onChange={(event) => {
              if (event.target.checked) {
                checkMore([item?.product_uid]);
              } else {
                checkLess([item?.product_uid]);
              }
            }}
          />
          {item && (
            <div>
              <VideoORImage
                imageOrVideoSrc={imagePath(get(item, 'product_image', []))}
                preload="auto"
                draggable={false}
                videoClassName="flex-category-image"
                imageAltName={get(item, 'product_name', '')}
                imageClassName="flex-category-image"
              />
            </div>
          )}
        </div>
        <div className="drawer-heading">
          <Tooltip title={item.product_name}>
            <Text className="text-ellipsis product-name-text" ellipsis>
              {item?.product_name}
            </Text>
          </Tooltip>
        </div>
      </>
    );
  };

  const productListRender = () => {
    return (
      <div>
        {productData.length > 0 && (
          <div className="prdt-mapping-list" id="scrollable-product">
            <InfiniteScroll
              dataLength={productData?.length || 0}
              next={loadMoreData}
              hasMore={hasMoreProducts}
              scrollableTarget="scrollable-product"
            >
              <CheckboxGroup value={checkedList}>
                <List
                  grid={{
                    gutter: 16,
                    xs: 3,
                    sm: 3,
                    md: 4,
                    lg: 5,
                    xl: 5,
                    xxl: 5,
                  }}
                  locale={{
                    emptyText: (
                      <div style={{ textAlign: 'center' }}>
                        <EmptyData />
                      </div>
                    ),
                  }}
                  loading={productFlag}
                  dataSource={productData}
                  renderItem={(item, index) => {
                    const { pageSize, current } = pagination;
                    const isFirstItem = index === 0;
                    const isLastItem =
                      index === productData.length - INITIAL_PAGE;
                    const findLastPage = Math.ceil(
                      totalProductCount / pageSize
                    );
                    const isLastPage =
                      current === findLastPage && current > INITIAL_PAGE;
                    return (
                      <List.Item>
                        <Col key={item.mapping_product_uid}>
                          <Card
                            className={cardClassName(
                              isFirstItem,
                              isLastPage,
                              isLastItem
                            )}
                            hoverable
                          >
                            {renderContent(item, isLastPage, isLastItem)}
                          </Card>
                        </Col>
                      </List.Item>
                    );
                  }}
                />
              </CheckboxGroup>
            </InfiniteScroll>
          </div>
        )}
      </div>
    );
  };

  const categoriesProperties = {
    isOpenDrawer,
    setOpenDrawer: setIsOpenDrawer,
    categoryData: mainCategoryData,
    subCategoryData,
    setSubCategoryData,
    selectedCategories,
    setSelectedCategories,
    selectedSubCategories,
    setSelectedSubCategories,
    setCategoryData: setMainCategoryData,
    fetchProductData: getProductViewData,
    pagination,
    categoryDataList: mainCategoryData,
    isLoader: isDataFetching,
    isRelatedProducts,
    setProductData,
  };

  const searchRender = () => {
    return (
      <Input
        allowClear
        placeholder="Search by product name"
        value={searchValue}
        onChange={(event) => onSearch(event.target.value)}
        className={mobileView ? 'filter-search product-search' : 'search-prdt'}
        suffix={<SearchOutlined className="site-form-item-icon" />}
      />
    );
  };

  const addButton = () => {
    return (
      <div>
        {!isEmpty(checkedList) && (
          <Button
            key="save"
            type="primary"
            className="add-prdt-btn"
            loading={isSaveBtnLoading}
            onClick={createProducts}
          >
            Add
          </Button>
        )}
        ,
      </div>
    );
  };

  const selectAllProductsRender = () => {
    return (
      <div>
        <Checkbox
          indeterminate={isIndeterminate}
          onChange={onCheckAllChange}
          checked={isCheckedAll}
          className="checkbox-col"
        >
          <Text className="select-all">Select all</Text>
        </Checkbox>
      </div>
    );
  };

  return (
    <div>
      {!mobileView && (
        <Modal
          bodyStyle={{ height: 600 }}
          className={`prdt-mapping-modal ${isCoupon && 'product-modal'}`}
          title={
            <Row className="drawer-title-div">
              <Col span={16}>
                <Text className="select-prdt ml-10p">Select Products</Text>
              </Col>
              <Col span={7} className="b-5p">
                {searchRender()}
              </Col>
            </Row>
          }
          centered
          open={isAddProducts}
          footer={[addButton()]}
          maskClosable={false}
          onCancel={cancelDrawer}
          closable
          width={900}
        >
          <Row>
            <Col md={7} lg={6} xl={6} className="mr-8">
              <Select
                className="dropdown-selection"
                placeholder="Filter by Category"
                onChange={mainCategoryChange}
                value={mainCategoryValue}
                notFoundContent={
                  isDataFetching && <Spin size="small" className="ml-5rem" />
                }
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                allowClear={!!mainCategoryValue}
                virtual={false}
                getPopupContainer={(triggerNode) => triggerNode.parentElement}
              >
                {mainCategoryData &&
                  map(mainCategoryData, (category) => (
                    <Option value={category.category_uid}>
                      {category.category_name}
                    </Option>
                  ))}
              </Select>
            </Col>
            <Col md={13} lg={15} xl={15}>
              <Select
                className="dropdown-selection"
                placeholder="Filter by Subcategory"
                value={subCategoryUid}
                onChange={subCategoryChange}
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                allowClear={!!subCategoryUid}
                virtual={false}
                getPopupContainer={(triggerNode) => triggerNode.parentElement}
              >
                {subCategoryData &&
                  map(subCategoryData, (subcategory) => (
                    <Option value={subcategory.sub_category_uid}>
                      {subcategory.sub_category_name}
                    </Option>
                  ))}
              </Select>
            </Col>
            <Col>{selectAllProductsRender()}</Col>
            <Col span={24}> {productListRender()}</Col>
          </Row>
        </Modal>
      )}
      {mobileView && (
        <div>
          <div className="mobile-view-product-btns">{addButton()}</div>
          <Row>
            <Col span={24}>{searchRender()}</Col>
            <Col span={24} className="prdt-select-all">
              {selectAllProductsRender()}
            </Col>
            <Col span={24}>{productListRender()}</Col>
          </Row>
        </div>
      )}
      {mobileView && isOpenDrawer && <Categories {...categoriesProperties} />}
    </div>
  );
}
export default ProductMapping;
