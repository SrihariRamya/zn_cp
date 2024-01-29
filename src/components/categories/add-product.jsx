import {
  CloseCircleOutlined,
  CloseOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Layout,
  Modal,
  List,
  Checkbox,
  Button,
  notification,
  Space,
  Select,
  Tag,
  Input,
} from 'antd';
import { debounce, filter, findIndex, get, isEmpty, map } from 'lodash';
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tooltip } from 'antd/lib';
import { defaultImage } from '../../shared/image-helper';
import { ReactComponent as FilterIcon } from '../../assets/icons/filter-icon.svg';
import {
  INITIAL_PAGE,
  PAGE_LIMIT,
  CAT_PRODUCT_PAGE_LIMIT,
  PRODUCT_UPDATE_SUCCESS,
} from '../../shared/constant-values';
import { handleUrlChanges } from '../../shared/common-url-helper';
import { getProducts, updateCategoryProduct } from '../../utils/api/url-helper';
import productImg from '../../assets/images/new-product.png';
import MobileFilter from '../../shared/mobile-view-filter';

const { Header } = Layout;
const { Option } = Select;
const moduleName = 'categories';

function AddProduct(properties) {
  const {
    productModel,
    setProductModel,
    categoryUID,
    subcategoryUID,
    getAllCategoryData,
    pagination,
    selectCategoryData,
    mobileView,
    categoryDataList,
  } = properties;
  const history = useNavigate();
  const [productData, setProductData] = useState([]);
  const [filterCheckedData, setFilterCheckedData] = useState([]);
  const [productCatId, setProductCatId] = useState();
  const [productSubCatId, setProductSubCatId] = useState();
  const [productSearchWord, setProductSearchWord] = useState();
  const [productMobileFilter, setProductMobileFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [productPagination, setProductPagination] = useState({
    current: INITIAL_PAGE,
    pageSize: CAT_PRODUCT_PAGE_LIMIT,
  });
  const [listPagination, setListPagination] = useState({
    current: INITIAL_PAGE,
    pageSize: PAGE_LIMIT,
  });
  const [productSubCategoryData, setProductSubCategoryData] = useState([]);
  const handleFilterChecked = (checkedData) => {
    const selectedValues = filter(checkedData, (item) => item.isCheck === true);
    setFilterCheckedData(
      map(selectedValues, (item) => {
        return item.product_uid;
      })
    );
  };

  const resetFilters = () => {
    handleUrlChanges(INITIAL_PAGE, history, moduleName);
    setProductCatId();
    setProductSubCatId();
    setProductSubCategoryData([]);
  };

  const handleChecedProduction = (value, item) => {
    const isCheck = value !== true;
    const checkedData = productData;
    const checkedFindIndex = findIndex(
      checkedData,
      (data) => data.product_id === item.product_id
    );
    checkedData[checkedFindIndex].isCheck = isCheck;
    setProductData(checkedData);
    handleFilterChecked(checkedData);
  };

  const handelSubmitProduct = () => {
    setProductModel(false);
    updateCategoryProduct(categoryUID, {
      categoryUID,
      subcategoryUID,
      filterCheckedData,
    }).then((response) => {
      if (response.success) {
        getAllCategoryData({ pagination: { ...pagination } });
        notification.success({ message: PRODUCT_UPDATE_SUCCESS });
        setFilterCheckedData([]);
        map(productData, (item, index) => {
          productData[index].isCheck = false;
        });
        setProductData(productData);
        resetFilters();
      }
    });
  };

  const handleCategorySelectChange = (value) => {
    handleUrlChanges(INITIAL_PAGE, history, moduleName);
    setProductCatId(value);
    setProductSubCatId();
    const subCategory = filter(
      selectCategoryData,
      (item) => item.category_uid === value
    );
    setProductSubCategoryData(get(subCategory, '[0].sub_category', []));
  };

  const getAllProduct = (parameters = {}) => {
    const {
      productPagination: { pageSize, current },
      searchKey,
    } = parameters;
    const catFilter = {};
    if (productSubCatId) {
      catFilter.sub_category_uid = productSubCatId;
    } else if (productCatId) {
      catFilter.category_uid = productCatId;
    }
    getProducts({
      limit: pageSize,
      offset: current,
      searchWord: searchKey || '',
      ...catFilter,
      selectedCategories: isEmpty(selectedCategories)
        ? []
        : JSON.stringify(selectedCategories),
      selectedSubCategories: isEmpty(selectedSubCategories)
        ? []
        : JSON.stringify(selectedCategories),
    }).then((response) => {
      if (response) {
        const productDetailes = get(response, 'data.rows', []);
        setProductPagination({
          ...parameters.productPagination,
          current,
          total: get(response, 'data.count', ''),
        });
        setListPagination({
          pageSize: PAGE_LIMIT,
          current,
          total: get(response, 'data.count', ''),
        });
        map(productDetailes, (item, index) => {
          productDetailes[index].isCheck = false;
        });
        setProductData(productDetailes);
      }
    });
  };

  const handleProductChange = (paginationAlias) => {
    const { current } = paginationAlias;
    getAllProduct({
      productPagination: { pageSize: CAT_PRODUCT_PAGE_LIMIT, current },
    });
  };

  useEffect(() => {
    getAllProduct({
      productPagination: { ...productPagination, current: INITIAL_PAGE },
      searchKey: productSearchWord,
    });
  }, [productCatId, productSubCatId]);

  const productSearchDebounce = (event_) => {
    getAllProduct({
      productPagination: { pageSize: PAGE_LIMIT, current: INITIAL_PAGE },
      searchKey: event_.target.value,
    });
  };
  const productSearch = useMemo(
    () => debounce(productSearchDebounce, 1000),
    []
  );

  const dataSource = [
    {
      staticItem: true,
      key: 'static-1',
      content: (
        <div className="static-list">
          <Link to="/products/add-product">
            <img src={productImg} alt="product-img" />
            <p> Click here to add new product</p>
          </Link>
        </div>
      ),
    },
    ...productData,
  ];

  const onCloseProduct = () => {
    setProductModel(false);
    resetFilters();
    map(productData, (item, index) => {
      productData[index].isCheck = false;
    });
    setProductData(productData);
  };

  const handleAddProduct = () => {
    return (
      <Layout>
        <Header>
          <div className="coupon-row" style={{ padding: '0px 20px' }}>
            <p>Select product</p>
            <div className="center">
              {!mobileView && (
                <Input
                  placeholder="Search"
                  allowClear
                  value={productSearchWord}
                  onChange={(event_) => {
                    setProductSearchWord(event_.target.value);
                    productSearch(event_);
                  }}
                  className="custom-search category-product-search"
                  suffix={<SearchOutlined className="site-form-item-icon" />}
                />
              )}
              <CloseOutlined
                onClick={() => onCloseProduct()}
                height="2em"
                style={{ color: 'red' }}
              />
            </div>
          </div>
        </Header>
        <Layout>
          <div style={{ padding: '20px' }}>
            <div>
              {!mobileView && (
                <Space>
                  <Select
                    className="dropdown-picker product-category-select select-height"
                    placeholder="Filter by Category"
                    virtual={false}
                    onChange={handleCategorySelectChange}
                    value={productCatId}
                  >
                    {map(selectCategoryData, (cat) => (
                      <Option
                        key={get(cat, 'category_uid', '')}
                        value={get(cat, 'category_uid', '')}
                      >
                        {get(cat, 'category_name', '')}
                      </Option>
                    ))}
                  </Select>
                  <Select
                    className="dropdown-picker-category product-category-select select-height"
                    placeholder="Filter by subcategory"
                    virtual={false}
                    onChange={(value) => {
                      setProductSubCatId(value);
                      handleUrlChanges(INITIAL_PAGE, history, moduleName);
                    }}
                    value={productSubCatId}
                  >
                    {map(productSubCategoryData, (cat) => (
                      <Option
                        key={get(cat, 'category_uid', '')}
                        value={get(cat, 'sub_category_uid', '')}
                      >
                        {get(cat, 'sub_category_name', '')}
                      </Option>
                    ))}
                  </Select>
                  <Tag
                    icon={<CloseCircleOutlined />}
                    color="error"
                    style={{ borderRadius: '15px' }}
                    visible={productCatId || productSubCatId}
                    onClick={resetFilters}
                  >
                    Clear filters
                  </Tag>
                </Space>
              )}
            </div>
            <div style={{ display: 'flex' }}>
              {mobileView && (
                <>
                  <Input
                    placeholder="Search"
                    allowClear
                    value={productSearchWord}
                    onChange={(event_) => {
                      setProductSearchWord(event_.target.value);
                      productSearch(event_);
                    }}
                    className="custom-search"
                    suffix={<SearchOutlined className="site-form-item-icon" />}
                  />
                  <FilterIcon
                    className="ml-10"
                    onClick={() => setProductMobileFilter(true)}
                  />
                </>
              )}
            </div>
            <br />
            <List
              grid={{
                gutter: 16,
                xs: 2,
                sm: 2,
                md: 5,
                lg: 5,
                xl: 5,
                xxl: 5,
              }}
              dataSource={dataSource}
              pagination={{
                align: 'center',
                onChange: (current) => {
                  handleProductChange({ current });
                },
                ...listPagination,
              }}
              renderItem={(item, index) => (
                <List.Item key={index}>
                  {index === 0 ? (
                    item.content
                  ) : (
                    <>
                      <img
                        src={get(
                          item,
                          'product_image[0].product_image',
                          defaultImage
                        )}
                        alt="product-img"
                        width="100%"
                        height="140px"
                        className="img-alignment"
                      />
                      <Checkbox
                        className="check-align"
                        checked={get(item, 'isCheck', '')}
                        value={get(item, 'isCheck', '')}
                        onChange={(event_) =>
                          handleChecedProduction(event_.target.value, item)
                        }
                      />
                      <Tooltip
                        title={
                          get(item, 'product_name.length') > 17
                            ? item.product_name
                            : ''
                        }
                      >
                        <p className="product-ellipsis">
                          {get(item, 'product_name', '')}
                        </p>
                      </Tooltip>
                    </>
                  )}
                </List.Item>
              )}
            />
            <Button
              type="primary"
              style={{ float: 'right' }}
              onClick={handelSubmitProduct}
              disabled={get(filterCheckedData, 'length') <= 0}
            >
              Submit
            </Button>
            {productMobileFilter && (
              <MobileFilter
                mobFilterDrawer={productMobileFilter}
                setMobFilterDrawer={setProductMobileFilter}
                categoryData={selectCategoryData}
                subCategoryData={productSubCategoryData}
                setSubCategoryData={setProductSubCategoryData}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedSubCategories={selectedSubCategories}
                setSelectedSubCategories={setSelectedSubCategories}
                categoryDataList={categoryDataList}
                getAPI={getAllProduct}
                pagination={pagination}
                filterPage="product"
              />
            )}
          </div>
        </Layout>
      </Layout>
    );
  };

  useEffect(() => {
    getAllProduct({ productPagination: { ...productPagination } });
  }, []);

  useEffect(() => {
    if (productSubCatId) {
      const filterdProducts = filter(
        productData,
        (item) => item.sub_category_uid === productSubCatId
      );
      setProductData(filterdProducts);
    } else if (productCatId) {
      getAllProduct({ productPagination: { ...productPagination } });
    }
  }, [productCatId, productSubCatId]);

  return (
    <div>
      <Modal
        open={productModel}
        footer={false}
        className="upload-modal-main-social"
        width={850}
        closable={false}
        centered
      >
        {handleAddProduct()}
      </Modal>
    </div>
  );
}

export default AddProduct;
