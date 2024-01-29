import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  get,
  debounce,
  isEmpty,
  map,
  isNaN,
  filter,
  differenceBy,
} from 'lodash';
import {
  Input,
  Select,
  Space,
  Button,
  notification,
  Breadcrumb,
  Tag,
  Checkbox,
  Modal,
  Typography,
  Switch,
  Layout,
  Row,
  Col,
} from 'antd';
import Cookies from 'js-cookie';
import Tour from 'reactour';
import {
  DeleteOutlined,
  PlusOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { ReactComponent as Products } from '../../assets/icons/product-logo.svg';
import {
  getCategory,
  getProducts,
  deleteProduct,
  updateVariants,
  getMarketPlace,
  updateProductStatus,
  getOnboardGuide,
  putOnboardSubGuide,
  fbMediaPost,
  igMediaPost,
  addProductToMarket,
} from '../../utils/api/url-helper';
import ProductTable from './product-table';
import GridView from './grid-view';
import './product.less';
import {
  PRODUCT_DELETE_SUCCESS,
  PRODUCT_DELETE_FAILED,
  FAILED_TO_LOAD,
  VIDEO_FORMAT,
  LIST_TYPE_GRID,
  SINGLE_ITEM,
  MARKET_SYNC_ADD_FAILED,
  PROUDUCT_MARKET_ADD_SUCCESS,
  MARKET_SYNC_MRP_REQUIRED_TITLE,
} from '../../shared/constant-values';
import {
  DeleteAlert,
  DeleteAlertImage,
  DeleteAlertMessage,
  DeleteAlertAssociated,
} from '../../shared/sweetalert-helper';
import { paginationstyler } from '../../shared/attributes-helper';
import BulkUpload from './bulk-upload';
import { eventTrack } from '../../shared/function-helper';
import { ReactComponent as FilterIcon } from '../../assets/icons/filter-icon.svg';
import { ReactComponent as SearchOutlined } from '../../assets/icons/search-icon.svg';
import { ReactComponent as ProductIcon } from '../../assets/icons/product-icon.svg';
import { ReactComponent as NoData } from '../../assets/icons/no-data.svg';
import Categories from './mobile-view-categories';

const { Header } = Layout;
const { Option } = Select;
const { confirm } = Modal;
const { Text, Paragraph } = Typography;

const errorMessage = {
  best_seller: 'best seller',
  banner: 'banner',
  sliderBoxProduct: 'sliderBoxProduct',
  sections: 'sections',
  appearance: 'appearance',
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}
const adminEvent = (condition) => {
  if (condition) {
    const parameter = {
      value: 'Add Product',
    };
    eventTrack('Add Product Click', parameter);
  }
};

function Product(properties) {
  const navigate = useNavigate();
  const canWrite = get(properties, 'roleData.can_write', false);
  const [listType, setListType] = useState('table');
  const [filteredProductData, setFilteredProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [selectedID, setSelectedID] = useState([]);
  const [catId, setCategoryValue] = useState();
  const [subCatId, setSubCategoryValue] = useState();
  const [visible, setVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [variantOptions, setVariantOptions] = useState([]);
  const [checkedVariants, setCheckedVariants] = useState([]);
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchWord, setSearchWord] = useState('');
  const firstUpdate = useRef(true);
  const [enableSave, setEnableSave] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [productFilter, setProductFilter] = useState({});
  const [productSorter, setProductSorter] = useState({});
  const [productCurrentValue, setProductCurrentValue] = useState(1);
  const [marketPlace, setMarketPlace] = useState({});
  const [plainOptions, setPlainOptions] = useState([]);
  const [roleInfo] = useState(localStorage.getItem('roleName'));
  const query = useQuery();
  const queryParameter = query.get('list');
  const currentPage = query.get('page');
  const categoryUid = query.get('category_uid');
  const subCategoryUid = query.get('sub_category_uid');
  const isTenantAdmin = roleInfo === 'tenant_admin';
  const [tenantUid] = useState(localStorage.getItem('tenantUid'));

  const slug = useLocation()?.state?.slug;
  const isViewType = queryParameter !== 'grid';
  const [openTourModal1, setOpenTourModal1] = useState(false);
  const [tourCurrentStep1, setTourCurrentStep1] = useState(0);
  const [openTourModal2, setOpenTourModal2] = useState(false);
  const [tourCurrentStep2, setTourCurrentStep2] = useState(0);
  const [isChecked, setIsChecked] = useState(isViewType);
  const [mobileView, setMobileView] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [categoryDataList, setCategoryDataList] = useState([]);
  const [isTrackInventory, setIsTrackInventory] = useState(false);
  const [isSocialMediaModel, setIsSocialMediaModel] = useState(false);
  const [socialMediaCaptionValue, setSocialMediaCaptionValue] = useState('');
  const [isInventoryloading, setIsInventoryloading] = useState(false);
  const [isRelatedDrawer, setIsRelatedDrawer] = useState(false);
  const [isInventoryVisible, setIsInventoryVisible] = useState(false);

  useEffect(() => {
    const windoWidth = get(window, 'innerWidth', 0);
    if (windoWidth < 576) {
      setMobileView(true);
    } else {
      setMobileView(false);
    }
  }, []);

  const showSocialMediaModal = () => {
    setIsSocialMediaModel(true);
  };

  const showDrawer = () => {
    setIsOpen(true);
  };

  const TourSteps1 = [
    {
      selector: '#add-bulk-product-btn',
      content: `Now upload the complete product list in just one click`,
    },
    {
      selector: '#bulk-download-template',
      content: `Download template & update the product list`,
    },
    {
      selector: '#bulk-upload-single-file',
      content: `Upload the file`,
    },
    {
      selector: '#bulk-file-Validate',
      content: `Verify the data by clicking on validate`,
    },
    {
      selector: '#bulk-upload-multiple-file',
      content: `Click here to add multiple images`,
    },
    {
      selector: '#bulk-import',
      content: `Import to showcase the products in the online store`,
    },
  ];

  const TourSteps2 = [
    {
      selector: '#addProductBtn',
      content: `click here to add Product`,
    },
    {
      selector: '#2',
      content: `click here to add Product`,
    },
  ];

  function completeTour() {
    if (openTourModal1) {
      putOnboardSubGuide({
        completed: true,
        slug: 'bulk-product',
      });
    }
  }

  useEffect(() => {
    if (openTourModal1) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [openTourModal1]);

  useEffect(() => {
    if (openTourModal2) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [openTourModal2]);

  useEffect(() => {
    if (bulkModalVisible && tourCurrentStep1 === 0) {
      setTourCurrentStep1(tourCurrentStep1 + 1);
    }
  }, [bulkModalVisible, tourCurrentStep1]);

  const setPreviousPath = () => {
    Cookies.set(
      'PreviousPath',
      `${get(navigate, 'location.pathname', '/')}${get(
        navigate,
        'location.search',
        ''
      )}`
    );
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const getAttributeByName = (data, attribute) => {
    if (data && attribute) {
      return data.variant_attributes.filter(
        (item) => item?.zm_attribute?.name === attribute
      );
    }
    return '';
  };

  const fetchProductData = (parameters = {}, cat = '', subCat = '') => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      const catFilter = {};
      const searchParameter = {};
      const {
        pagination: { pageSize, current },
        searchKey,
      } = parameters;
      if (searchKey) {
        searchParameter.searchWord = searchKey;
      }
      if (subCat) {
        catFilter.sub_category_uid = subCat;
      } else if (cat) {
        catFilter.category_uid = cat;
      }
      searchParameter.firstTableParams = 'zm_product';
      getProducts({
        limit: pageSize,
        offset: current,
        sorter: JSON.stringify(productSorter),
        filters: JSON.stringify(productFilter),
        ...catFilter,
        ...searchParameter,
        selectedCategories: isEmpty(selectedCategories)
          ? []
          : JSON.stringify(selectedCategories),
        selectedSubCategories: isEmpty(selectedSubCategories)
          ? []
          : JSON.stringify(selectedCategories),
      })
        .then((response) => {
          const productDataSet = get(response, ['data'], []);
          setFilteredProductData(productDataSet.rows);
          setPagination({
            ...parameters.pagination,
            total: productDataSet.count,
          });
          setLoading(false);
          setIsOpen(false);
          resolve();
        })
        .catch((error_) => reject(error_));
    });
  };
  const getTableData = (sorters, current) => {
    if (!isEmpty(sorters.order) && sorters) {
      setProductSorter({
        columnKey: sorters.columnKey,
        orders: sorters.order === 'ascend' ? 'ascend' : 'descend',
      });
      setProductCurrentValue(current);
    } else {
      setProductSorter({
        columnKey: sorters.columnKey,
        orders: sorters.order === '',
      });
      setProductCurrentValue(current);
    }
  };
  useEffect(() => {
    if (Object.keys(productSorter).length > 0 && !mobileView) {
      fetchProductData(
        {
          pagination: { pageSize: 10, current: productCurrentValue },
          searchKey: searchWord,
        },
        catId,
        subCatId
      );
    }
  }, [productSorter]);
  const fetchData = (parameters, catUid, subCatUid) => {
    setLoading(true);
    Promise.all([
      getCategory(),
      fetchProductData(
        { ...(parameters || { pagination }) },
        catUid,
        subCatUid
      ),
      getOnboardGuide(),
    ])
      .then((response) => {
        const guide1 = response[2].data.find((index) =>
          index.subGuide.find((index_) => index_.slug === 'bulk-product')
        );
        const subGuide2 = guide1.subGuide.find(
          (index_) => index_.slug === 'bulk-product'
        );
        const isBulkProductCreated =
          !get(subGuide2, 'completed', false) && slug === 'bulk-product';
        setOpenTourModal1(isBulkProductCreated);

        const guide = response[2].data.find((index) =>
          index.subGuide.find((index_) => index_.slug === 'product')
        );
        const subGuide = guide.subGuide.find(
          (index_) => index_.slug === 'product'
        );

        const isProductCreated =
          !get(subGuide, 'completed', false) && slug === 'product';
        setOpenTourModal2(isProductCreated);
        const dataList = get(response, '[0].data.rows', []);
        setCategoryData(dataList);
        setCategoryDataList(dataList);
      })
      .catch((error_) => {
        setLoading(false);
        notification.error({ message: error_.message });
      });
  };
  const filterSelectedItems = (mappedData) => {
    const filtered = filter(
      selectedRowKeys,
      (item) => !mappedData.includes(item)
    );
    setSelectedRowKeys(filtered);
    const filteredData = filter(
      selectedID,
      (item) => !mappedData.includes(item?.product_uid)
    );
    setSelectedID(filteredData);
  };

  const handleSelectOneRow = (record, selected, selectedRows) => {
    const { product_uid: productUid } = record;
    if (selected) {
      const arrayProduct = [];
      arrayProduct.push(productUid);
      setSelectedRowKeys([...selectedRowKeys, ...arrayProduct]);
      setSelectedID([...selectedID, ...selectedRows]);
      setEnableSave(selectedID.length > 0);
    } else {
      filterSelectedItems(productUid);
    }
    setEnableSave(selectedRows.length > 0);
  };

  const handleSelectALLRow = (selected, selectedRows, changeRows) => {
    const mappedData = map(changeRows, (data) => data?.product_uid);
    if (selected) {
      setSelectedRowKeys([...selectedRowKeys, ...mappedData]);
      setSelectedID([...selectedID, ...changeRows]);
    } else {
      filterSelectedItems(mappedData);
    }
    setEnableSave(selectedRows.length > 0);
  };

  const rowSelection = {
    selectedRowKeys,
    onSelect: handleSelectOneRow,
    onSelectAll: handleSelectALLRow,
  };

  const resetFilters = () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    setCategoryValue(undefined);
    // eslint-disable-next-line unicorn/no-useless-undefined
    setSubCategoryValue(undefined);
    setSubCategoryData([]);
    navigate({
      pathname: '/products',
      search: searchWord,
    });
  };

  const productHardDelete = async (productsID, current, options) => {
    const { currentPageAlias, errMsg } = options;
    const title = `This Product is associated with ${errorMessage[errMsg]}`;
    const text = `Are you sure? The product will be deleted and ${errorMessage[errMsg]} will be unassociated?`;
    const result = await DeleteAlertAssociated(title, text);
    if (result.isConfirmed) {
      const parameters = {
        id: productsID,
        forceDelete: true,
      };
      setLoading(true);
      deleteProduct(parameters)
        .then(() => {
          setLoading(false);
          DeleteAlertImage(PRODUCT_DELETE_SUCCESS);
          setSearchWord('');
          resetFilters();
          fetchProductData({
            pagination: { ...pagination, current: currentPageAlias },
          });
        })
        .catch((error) => {
          notification.error({
            message: get(error, 'message', PRODUCT_DELETE_FAILED),
          });
        });
    } else {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (_event, method, key) => {
    const seletedItems =
      listType === LIST_TYPE_GRID
        ? selectedID
        : map(selectedID, (x) => x.product_uid);
    const productsID =
      method === SINGLE_ITEM ? [key.product_uid] : seletedItems;
    const text = 'Are you sure you want to delete this product from the list?';
    const result = await DeleteAlert(text, _event);
    if (result.isConfirmed) {
      const parameters = {
        id: productsID,
      };
      const { current } = pagination;
      const currentPageAlias =
        filteredProductData.length === 1 && current > 1 ? current - 1 : current;
      setLoading(true);
      deleteProduct(parameters)
        .then((response) => {
          const { success, message } = response;
          if (success === true) {
            setLoading(false);
            DeleteAlertImage(PRODUCT_DELETE_SUCCESS);
            setSearchWord('');
            resetFilters();
            fetchProductData({
              pagination: { ...pagination, current: currentPageAlias },
            });
            setEnableSave(false);
          } else if (success === false) {
            switch (message) {
              case 'Product_BestSeller_Associated': {
                productHardDelete(productsID, current, {
                  currentPageAlias,
                  errMsg: 'best_seller',
                });
                break;
              }
              case 'Product_Banner_Associated': {
                productHardDelete(productsID, current, {
                  currentPageAlias,
                  errMsg: 'banner',
                });
                break;
              }
              case 'Product_SliderBoxProduct_Associated': {
                productHardDelete(productsID, current, {
                  currentPageAlias,
                  errMsg: 'sliderBoxProduct',
                });
                break;
              }
              case 'Product_Sections_Associated': {
                productHardDelete(productsID, current, {
                  currentPageAlias,
                  errMsg: 'sections',
                });
                break;
              }
              case 'Product_Appearance_Associated': {
                productHardDelete(productsID, current, {
                  currentPageAlias,
                  errMsg: 'appearance',
                });
                break;
              }
              default: {
                setLoading(false);
                DeleteAlertMessage({
                  title: PRODUCT_DELETE_FAILED,
                  icon: 'error',
                });
              }
            }
          }
        })
        .catch((error_) => {
          if (error_?.success === false) {
            setLoading(false);
          }
          notification.error({ message: get(error_, 'message', '') });
        });
    }
  };
  const handleSave = () => {
    const updatedVariants = variantOptions.map((item) => {
      const data = {};
      data.id = item.value;
      data.in_stock = checkedVariants.includes(item.value);
      return data;
    });
    setConfirmLoading(true);
    updateVariants({ data: updatedVariants })
      .then(() => {
        notification.success({
          message: 'Product variants updated successfully',
        });
        setVisible(false);
        setConfirmLoading(false);
        setSaveDisabled(true);
        fetchData();
      })
      .catch((error_) => {
        notification.error({
          message: error_.message || 'Failed to update product variants',
        });
      });
  };

  const modalVisible = (value) => {
    setVisible(value);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const generateOptions = (values) => {
    if (values) {
      const checkedOptions = [];
      const variantOptionsData = values.map((item) => {
        const optionsData = {};
        optionsData.label = get(
          getAttributeByName(item, 'Units'),
          '[0].attribute_value',
          ''
        );
        optionsData.value = item.id;
        if (item.in_stock) checkedOptions.push(item.id);
        return optionsData;
      });
      setVariantOptions(variantOptionsData);
      setCheckedVariants(checkedOptions);
    }
  };

  const variantOptionChange = (checkedValues) => {
    setCheckedVariants(checkedValues);
    setSaveDisabled(false);
  };

  const handleViewChange = (view, currentAlias, catUid, subCatUId) => {
    const parameters = new URLSearchParams();
    // eslint-disable-next-line no-restricted-globals
    const current = isNaN(currentPage) ? false : Number(currentPage);
    if (currentAlias) {
      parameters.append('page', currentAlias);
    } else if (current) {
      parameters.append('page', current);
    }
    if (view) {
      parameters.append('list', view);
    } else if (listType) {
      parameters.append('list', listType);
    }
    if (catUid) {
      parameters.append('category_uid', catUid);
    } else if (catId) {
      parameters.append('category_uid', catId);
    }
    if (subCatUId) {
      parameters.append('sub_category_uid', subCatUId);
    }
    navigate({
      pathname: '/products',
      search: parameters.toString(),
    });
  };
  const onSearchDebounce = debounce((value) => {
    // eslint-disable-next-line unicorn/no-null
    handleViewChange(null, 1, null, null);
    fetchProductData(
      {
        pagination: { pageSize: 10, current: 1 },
        searchKey: value,
      },
      catId,
      subCatId
    );
  }, 1000);

  const onSearch = (value) => {
    setSearchWord(value || '');
    onSearchDebounce(value);
  };

  useEffect(() => {
    if (queryParameter === 'table') {
      setListType('table');
    } else if (queryParameter === 'grid') {
      setListType('grid');
    }
  }, [queryParameter]);

  const handleSelectChange = (value, redirect = true) => {
    if (value) {
      setCategoryValue(value);
      // eslint-disable-next-line unicorn/no-null
      setSubCategoryValue(null);
      const current = 1;
      // eslint-disable-next-line unicorn/no-null
      if (redirect) handleViewChange(null, current, value, null);
      const subCategory = categoryData.filter(
        (item) => item.category_uid === value
      );
      setSubCategoryData(get(subCategory, '[0].sub_category', []));
    } else {
      resetFilters();
    }
  };

  const handleSubcategoryChange = (value) => {
    setSubCategoryValue(value);
    const current = 1;
    // eslint-disable-next-line unicorn/no-null
    handleViewChange(null, current, null, value);
  };

  useEffect(() => {
    if (subCategoryData.length > 0 && subCategoryUid) {
      handleSubcategoryChange(subCategoryUid);
    }
  }, [subCategoryData]);

  useEffect(() => {
    if (categoryData.length > 0 && categoryUid) {
      handleSelectChange(categoryUid, false);
    }
  }, [categoryData]);

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    const current = isNaN(currentPage) ? false : Number(currentPage);
    const resetPagination = { ...pagination, ...(current && { current }) };
    const parameters = current
      ? { pagination: resetPagination, searchKey: searchWord }
      : false;
    if (currentPage || categoryUid || subCategoryUid) {
      if (firstUpdate.current) {
        firstUpdate.current = false;
        fetchData(parameters, categoryUid, subCategoryUid);
      } else {
        fetchProductData(
          {
            pagination: { ...resetPagination },
            searchKey: searchWord,
          },
          categoryUid,
          subCategoryUid
        );
      }
    } else {
      resetFilters();
      fetchData({
        pagination: { ...pagination, current: 1 },
        searchKey: searchWord,
      });
    }
  }, [currentPage, categoryUid, subCategoryUid]);

  useEffect(() => {
    paginationstyler();
  }, [filteredProductData]);

  useEffect(() => {
    setPreviousPath();
    getMarketPlace()
      .then((response) => {
        setMarketPlace(get(response, 'data', {}));
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, []);

  const syncToProduct = (syncProducts) => {
    addProductToMarket({ data: syncProducts })
      .then((response) => {
        if (response.success) {
          setSelectedRowKeys([]);
          setSelectedID([]);
          setLoading(false);
          const isAlreadyInSync = response?.message || undefined;
          if (!isAlreadyInSync) {
            navigate({
              pathname: '/products/marketplace-sync',
            });
          }
          notification.success({
            message: isAlreadyInSync || PROUDUCT_MARKET_ADD_SUCCESS,
          });
        } else setLoading(false);
      })
      .catch((error_) => {
        setLoading(false);
        return notification.error({
          message: error_.message || MARKET_SYNC_ADD_FAILED,
        });
      });
  };

  const handlePushProduct = async () => {
    setLoading(true);
    const parameters = await Promise.all(
      selectedID.map((value) => {
        return {
          ...value,
          product_variant_id: get(value, 'product_variants', []).map(
            (item) => item.id
          ),
          Category_Name: value?.zm_category?.category_name,
          marketplace_uid: marketPlace?.marketplace_uid,
        };
      })
    );
    const syncProducts = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const value of parameters) {
      const withMrp = value?.product_variant_id.every((item) => {
        const mrpPrice = get(
          getAttributeByName(item, 'MRP Price'),
          '[0].attribute_value',
          ''
        );
        return mrpPrice;
      });
      if (withMrp) {
        syncProducts.push(value);
      }
    }

    const mrpRequestProductsNames = await Promise.all(
      differenceBy(parameters, syncProducts, 'product_uid').map(
        (product) => product.product_name
      )
    );
    if (isEmpty(mrpRequestProductsNames)) {
      syncToProduct(syncProducts);
    } else {
      confirm({
        title: <h3>{MARKET_SYNC_MRP_REQUIRED_TITLE}</h3>,
        icon: <ExclamationCircleOutlined />,
        content: (
          <>
            <Paragraph>
              {`${mrpRequestProductsNames.length} products doesn't have MRP${
                syncProducts.length > 0
                  ? `, Do you want to push the ${syncProducts.length} products which has MRP.`
                  : ''
              }`}
            </Paragraph>
            {mrpRequestProductsNames?.length && (
              <Paragraph
                ellipsis={{
                  rows: 1,
                  expandable: true,
                  symbol: 'more',
                }}
              >
                Products without MRP : {mrpRequestProductsNames?.join(',')}
              </Paragraph>
            )}
          </>
        ),
        okText: 'Confirm',
        cancelText: 'Close',
        okButtonProps: {
          hidden: syncProducts.length === 0,
        },
        cancelButtonProps: {
          type: 'danger',
        },
        onOk() {
          syncToProduct(syncProducts);
        },
        onCancel() {
          setLoading(false);
        },
      });
    }
  };

  const onStatusChange = (value, row, fieldName) => {
    const messageData = {
      product_status: 'Are you sure you want to change product status?',
      track_inventory: `Are you sure you want to ${
        value ? 'count' : 'stop counting'
      } inventory?`,
    };
    const { product_uid: id } = row;
    confirm({
      title: `${messageData[fieldName]}`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Yes',
      onOk() {
        const { current } = pagination;
        const currentPageAlias =
          filteredProductData.length === 1 && current > 1
            ? current - 1
            : current;
        setIsInventoryloading(true);
        updateProductStatus(id, { status: value, fieldName })
          .then((response) => {
            if (get(response, 'success', false)) {
              notification.success({
                message: `Product ${
                  fieldName === 'product_status' ? 'active' : 'inventory'
                } status updated successfully`,
              });
              setIsTrackInventory(get(response.data, 'track_inventory', false));
              setSearchWord('');
              resetFilters();
              setIsInventoryloading(false);
              fetchProductData({
                pagination: { ...pagination, current: currentPageAlias },
              });
            }
          })
          .catch((error) => {
            setIsInventoryloading(false);
            notification.error({
              message:
                error.message ||
                `Failed to update product ${
                  fieldName === 'product_status' ? 'active' : 'inventory'
                } status`,
            });
          });
      },
    });
  };

  const checkMore = (items) => {
    const selectedItems = [...new Set([...selectedID, ...items])];
    setSelectedID(selectedItems);
    setEnableSave(selectedItems.length > 0);
  };
  const checkLess = (items) => {
    const selectedData = filter(selectedID, (c) => !items.includes(c));
    setSelectedID(selectedData);
    setEnableSave(!isEmpty(selectedData));
  };
  const onCheckAllChange = (event) => {
    const isSelected = get(event, 'target.checked', false);
    const productUid = map(plainOptions, (item) => item.product_uid);
    if (isSelected) {
      checkMore(productUid);
    } else {
      checkLess(productUid);
    }
  };

  const checkedCount = filter(selectedID, (item) =>
    map(plainOptions, (value) => value?.product_uid).includes(item)
  ).length;
  const isCheckedAll = checkedCount === plainOptions.length;
  const isIndeterminate = checkedCount && checkedCount !== plainOptions.length;

  const addProductButton = () => (
    <Link to="/products/add-product" className="mobile-flote-none">
      <Button
        type="primary"
        id="addProductBtn"
        className="product-primary-btn"
        icon={<PlusOutlined />}
        hidden={!canWrite}
        onClick={() => adminEvent(true)}
      >
        Add Product
      </Button>
    </Link>
  );

  const emptyTableData = () => {
    if (
      (isEmpty(filteredProductData) && !isEmpty(productFilter)) ||
      (!isEmpty(searchWord) && isEmpty(filteredProductData))
    ) {
      return <NoData />;
    }
    return (
      <div className="empty-text-div">
        <div className="box-icon-div">
          <ProductIcon className="mt-20p" />
        </div>
        <div className="fs-20 select-all-text mt-20p">
          Add products to your online store
        </div>
        <br />
        <div>
          <Text
            style={{ whiteSpace: 'pre-wrap', lineHeight: '1.2' }}
            className="add-products-text"
          >
            Add products and start selling to customers
            <br />
            within a matter of seconds
          </Text>
        </div>
        <div className="mt-20p">{addProductButton()}</div>
      </div>
    );
  };

  const productOptions = () => {
    return (
      <>
        <Space>
          {addProductButton()}
          {canWrite && (
            <BulkUpload
              visible={bulkModalVisible}
              setVisible={setBulkModalVisible}
              categoryData={categoryData}
              fetchData={fetchData}
              mobileView={mobileView}
            />
          )}
          {listType === LIST_TYPE_GRID && !mobileView && (
            <Checkbox
              className={`checkall product-checkbox ${
                !canWrite && 'display-none'
              }`}
              indeterminate={isIndeterminate}
              onChange={onCheckAllChange}
              checked={isCheckedAll}
            >
              <span className="select-all-text">Select all</span>
            </Checkbox>
          )}
          {isTenantAdmin && !mobileView && (
            <Link to="/products/marketplace-sync" className="mobile-flote-none">
              <Button
                type="primary"
                className="add-btn"
                icon={<ToolOutlined />}
              >
                Market Place Sync
              </Button>
            </Link>
          )}
        </Space>
        {!mobileView && (
          <div
            className={`${listType === 'grid' && ''} delete-btn btns-positions`}
          >
            <Space className="sync-product-modal">
              <Button
                hidden={!canWrite}
                danger
                onClick={(event) => handleDeleteProduct(event, 'multiple', '')}
                disabled={!enableSave}
                className="disable-danger product-dangerous-btn"
              >
                <span>
                  <DeleteOutlined />
                  <span className="mobile-display-none ml-6">Delete</span>
                </span>
              </Button>
              {isTenantAdmin && !mobileView && (
                <Button
                  type="primary"
                  className="add-btn product-add-sync"
                  onClick={handlePushProduct}
                  disabled={isEmpty(selectedID)}
                >
                  <Space>
                    <RiseOutlined />
                    Add To Sync
                  </Space>
                </Button>
              )}
            </Space>
          </div>
        )}
      </>
    );
  };

  const postOnFacebook = (item) => {
    const postData = map(item.product_image, (value) => {
      const items = value.product_image.slice(-3);
      if (VIDEO_FORMAT.includes(items)) {
        return { videoUrl: value.product_image };
      }
      return { imageUrl: value.product_image };
    });
    const parameters = {
      tenantUid,
      caption: socialMediaCaptionValue || item?.product_name,
      postData,
    };
    setLoading(true);
    fbMediaPost(parameters)
      .then((response) => {
        if (response?.success) {
          notification.success({
            message: response?.message || 'Posted',
          });
          setLoading(false);
        } else {
          notification.error({ message: 'Failed to post' });
          setLoading(false);
        }
        setIsSocialMediaModel(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', 'Error while posting'),
        });
      });
  };

  const postOnInstagram = (item) => {
    const postData = map(item.product_image, (value) => {
      const items = value.product_image.slice(-3);
      if (VIDEO_FORMAT.includes(items)) {
        return { videoUrl: value.product_image };
      }
      return { imageUrl: value.product_image };
    });
    const parameters = {
      tenantUid,
      caption: socialMediaCaptionValue || item?.product_name,
      postData,
    };
    setLoading(true);
    igMediaPost(parameters)
      .then((response) => {
        if (response?.success) {
          notification.success({
            message: response?.message || 'Posted',
          });
          setLoading(false);
          setIsSocialMediaModel(false);
        } else {
          notification.error({ message: 'Failed to post' });
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', 'Error while posting'),
        });
      });
  };

  const switchChange = (checked) => {
    setIsChecked(checked);
    handleViewChange(
      `${checked === true ? 'table' : 'grid'}`,
      1,
      catId,
      subCatId
    );
  };

  const commonProperties = {
    data: filteredProductData,
    handleDelete: handleDeleteProduct,
    getAttributeByName,
    modalVisible,
    generateOptions,
    fetchProductData,
    pagination,
    loading,
    searchWord,
    handleViewChange,
    canWrite,
    onStatusChange,
    isTenantAdmin,
    setPreviousPath,
    productCurrentValue,
    postOnFacebook,
    postOnInstagram,
    mobileView,
    emptyTableData,
    isTrackInventory,
    setIsTrackInventory,
    isSocialMediaModel,
    setIsSocialMediaModel,
    showSocialMediaModal,
    socialMediaCaptionValue,
    setSocialMediaCaptionValue,
    isInventoryloading,
    setIsInventoryloading,
    isRelatedDrawer,
    setIsRelatedDrawer,
    isInventoryVisible,
    setIsInventoryVisible,
    checkMore,
    checkLess,
  };

  const categoriesProperties = {
    isOpenDrawer: isOpen,
    setOpenDrawer: setIsOpen,
    categoryData,
    subCategoryData,
    setSubCategoryData,
    selectedCategories,
    setSelectedCategories,
    selectedSubCategories,
    setSelectedSubCategories,
    setCategoryData,
    fetchProductData,
    pagination,
    setProductSorter,
    categoryDataList,
  };

  const productHeadingRender = () => (
    <Breadcrumb>
      <Breadcrumb.Item>
        <Space>
          <Products />
          <div className="heading mb-5p fs-18p">Products</div>
        </Space>
      </Breadcrumb.Item>
    </Breadcrumb>
  );

  const searchContainer = () => (
    <Input
      allowClear
      placeholder="Search by product"
      value={searchWord}
      onChange={(event_) => onSearch(event_.target.value)}
      className={`custom-search ${mobileView && 'right-30p'}`}
      suffix={<SearchOutlined className="site-form-item-icon" />}
    />
  );

  const listViewRender = () => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span
        className={`view-type-text ${
          isChecked ? 'checked-view-type' : 'unchecked-view-type'
        }`}
      >
        List
      </span>
      <Switch
        checked={isChecked}
        className="view-type-switch"
        onChange={switchChange}
      />
      <span
        className={`view-type-text ${
          isChecked ? 'unchecked-view-type' : 'checked-view-type'
        }`}
      >
        Grid
      </span>
    </div>
  );

  return (
    <div
      className={`${
        listType === 'grid' && !mobileView && 'product-grid-view'
      } bg-color`}
    >
      {!mobileView && (
        <div className="product-search-container">
          <div>{productHeadingRender()}</div>
          <div className="search-input">{searchContainer()}</div>
          <div className="mr-8">{listViewRender()}</div>
        </div>
      )}
      {mobileView && (
        <>
          <Layout>
            <Header className="mobile-view-header">
              <div className="mobile-view-search-container">
                {searchContainer()}
                {mobileView && !isRelatedDrawer && !isInventoryVisible && (
                  <span className="filter-svg">
                    {' '}
                    <FilterIcon onClick={showDrawer} />
                  </span>
                )}
              </div>
            </Header>
          </Layout>
          {!isOpen && mobileView && (
            <div className="mobile-view-product-btns">{productOptions()}</div>
          )}
          <div className="mt-4rem mb-10p display-flex">
            <span className="ml-10p">{productHeadingRender()}</span>
            <span className="list-view-status">{listViewRender()}</span>
          </div>
        </>
      )}
      {!mobileView && (
        <Row className="mt-40p">
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={12}
            xl={14}
            className="category-col gap-8p"
          >
            <Select
              className={!mobileView && 'category-select mr-10'}
              placeholder="Categories"
              onChange={handleSelectChange}
              value={catId}
              allowClear
              virtual={false}
            >
              {categoryData &&
                categoryData.map((category) => (
                  <Option value={category.category_uid}>
                    {category.category_name}
                  </Option>
                ))}
            </Select>
            <Select
              className={!mobileView && 'category-select'}
              placeholder="Sub Categories"
              onChange={handleSubcategoryChange}
              value={subCatId}
              allowClear
              virtual={false}
            >
              {subCategoryData &&
                subCategoryData.map((subcategory) => (
                  <Option value={subcategory.sub_category_uid}>
                    {subcategory.sub_category_name}
                  </Option>
                ))}
            </Select>
            {(catId || subCatId) && (
              <Tag
                icon={<CloseCircleOutlined />}
                color="error"
                style={{ borderRadius: '15px' }}
                onClick={resetFilters}
              >
                Clear filters
              </Tag>
            )}
          </Col>
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={12}
            xl={10}
            className="product-btns-align"
          >
            <div className="product-option">{productOptions()}</div>
          </Col>
        </Row>
      )}
      <div className="product_table">
        {listType === 'table' && (
          <ProductTable
            rowSelection={canWrite ? rowSelection : ''}
            getTableData={getTableData}
            productFilter={productFilter}
            setProductFilter={setProductFilter}
            {...commonProperties}
          />
        )}
        {listType === LIST_TYPE_GRID && (
          <GridView
            plainOptions={plainOptions}
            selectedID={selectedID}
            setPlainOptions={setPlainOptions}
            {...commonProperties}
          />
        )}
      </div>

      <Modal
        title="Select (or) de-select the variant to change status"
        visible={visible}
        onOk={handleSave}
        okText="Save"
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        cancelButtonProps={{ danger: true }}
        maskClosable={!confirmLoading}
        closable={!confirmLoading}
        okButtonProps={{ disabled: saveDisabled }}
        destroyOnClose
      >
        <Checkbox.Group
          onChange={variantOptionChange}
          defaultValue={checkedVariants}
        >
          <Space direction="vertical">
            {variantOptions.map((variants) => (
              <Checkbox className="inStock-checkbox" value={variants.value}>
                <span className="text-green-dark "> {variants.label}</span>
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </Modal>
      <Tour
        steps={TourSteps1}
        isOpen={openTourModal1}
        onRequestClose={() => {
          setOpenTourModal1(false);
          completeTour();
        }}
        goToStep={tourCurrentStep1}
        prevStep={() => {
          if (tourCurrentStep1 === 1) {
            setBulkModalVisible(false);
          }
          if (tourCurrentStep1 > 0) {
            setTourCurrentStep1(tourCurrentStep1 - 1);
          }
        }}
        nextStep={() => {
          if (tourCurrentStep1 === 0) {
            setBulkModalVisible(true);
          } else if (tourCurrentStep1 < TourSteps1.length) {
            setTourCurrentStep1(tourCurrentStep1 + 1);
          }
        }}
        accentColor="#38523B"
        disableFocusLock
        closeWithMask={false}
      />
      <Tour
        steps={TourSteps2}
        isOpen={openTourModal2}
        onRequestClose={() => setOpenTourModal2(false)}
        goToStep={tourCurrentStep2}
        prevStep={() => {
          if (tourCurrentStep2 > 0) {
            setTourCurrentStep2(tourCurrentStep2 - 1);
          }
        }}
        nextStep={() => {
          if (tourCurrentStep2 === 0) {
            document.querySelector('#addProductBtn').click();
          }
        }}
        accentColor="#38523B"
        disableFocusLock
        closeWithMask={false}
      />
      {isOpen && <Categories {...categoriesProperties} />}
    </div>
  );
}
export default Product;
