import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
  useMemo,
} from 'react';
import {
  Form,
  Input,
  Button,
  Table,
  Select,
  notification,
  Breadcrumb,
  Tag,
  Spin,
  Space,
  Popover,
  Tooltip,
  Switch,
  Col,
  Row,
  Modal,
} from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DeleteOutlined,
  PlusOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { get, isEmpty, map, isNaN, debounce, filter, find } from 'lodash';
import { MilestoneContext } from '../context/milestone-context';
import FirstTimeUser from '../../shared/first-time-user';
import { ReactComponent as Categorie } from '../../assets/icons/categories.svg';
import { ReactComponent as CategoryBackgroundModal } from '../../assets/ModalTourBackground/categoryBackground.svg';

import {
  getAllAttributes,
  getDataTypes,
  deleteAttribute,
  createAttribute,
  createCategory,
  createSubCategory,
  deleteCategory,
  editCategory,
  getCategory,
  putOnboardSubGuide,
  getCategoryAndSubcategory,
  updateStatus,
} from '../../utils/api/url-helper';
import {
  FAILED_TO_LOAD,
  CATEGORY_ADD_SUCCESS,
  CATEGORY_ADD_FAILED,
  SUB_CATEGORY_ADD_SUCCESS,
  SUB_CATEGORY_ADD_FAILED,
  ATTRIBUTE_ADD_SUCCESS,
  ATTRIBUTE_ADD_FAILED,
  ATTRIBUTE_DELETE_SUCCESS,
  ATTRIBUTE_DELETE_FAILED,
  CATEGORY_DELETE_SUCCESS,
  CATEGORY_DELETE_FAILED,
  CATEGORY_EDIT_FAILED,
  CATEGORY_EDIT_SUCCESS,
  CAT_BUTTON,
  PAGE_LIMIT,
  INITIAL_PAGE,
  SCREEN_MODE_ADD,
  SWITCH_WARNING,
} from '../../shared/constant-values';
import { getBase64, paginationstyler } from '../../shared/attributes-helper';
import { trimPayloadFields } from '../../shared/form-helpers';
import {
  CategoryDeleteAlert,
  DeleteAlert,
  DeleteAlertImage,
} from '../../shared/sweetalert-helper';
import { handleUrlChanges } from '../../shared/common-url-helper';
import { defaultImage } from '../../shared/image-helper';
import SocialShare from '../social-share';
import { TenantContext } from '../context/tenant-context';
import {
  seoImageCompressor,
  disableTabEnterKey,
  enableTabEnterKey,
} from '../../shared/function-helper';
import './categories.less';
import { ReactComponent as EditIcon } from '../../assets/images/edit-icon.svg';
import { ReactComponent as DeleteIcon } from '../../assets/images/delete-icon.svg';
import { ReactComponent as ShareIcon } from '../../assets/images/share-icon.svg';
import { ReactComponent as FilterIcon } from '../../assets/icons/filter-icon.svg';
import categoryDefaultImg from '../../assets/images/category-default.png';
import CategoriesForm from './categories-form';
import AddProduct from './add-product';
import TableMobileView from './table-mobile-view';
import MobileFilter from '../../shared/mobile-view-filter';

const { Option } = Select;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}
function Categories(properties) {
  const tenantDetails = useContext(TenantContext)[0];
  const mobileView = useContext(TenantContext)[4];
  const history = useNavigate();
  const canWrite = get(properties, 'roleData.can_write', false);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [type, setType] = useState('ADD');
  const [cateName, setCateName] = useState('');
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [selectCategoryData, setSelectData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [newFilterData, setNewFilterData] = useState([]);
  const [attributeData, setAttributeData] = useState([]);
  const [dataType, setDataType] = useState([]);
  const [attribute, setAttribute] = useState([]);
  const [selectedAttribute, setSelectedAttribute] = useState([]);
  const [title, setTitle] = useState('');
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [catId, setCategoryValue] = useState();
  const [subCatId, setSubCategoryValue] = useState();
  const [fileLists, setFileListArray] = useState([]);
  const [subCatFileList, setSubCatFileList] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [previewTitle, setPreviewTitle] = useState('');
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [selectedData, setSelectedData] = useState({});
  const [seoPageTitle, setSeoPageTitle] = useState('');
  const [seoMetaDescription, setSeoMetaDescription] = useState('');
  const [catCustomUrl, setCatCustomUrl] = useState('');
  const [subCatCustomUrl, setSubCatCustomUrl] = useState('');
  const [tableChange, setTableChange] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState({});
  const [categorySorter, setCategorySorter] = useState({});
  const [categoryCurrentValue, setCategoryCurrentValue] = useState(1);
  const [openTourModal, setOpenTourModal] = useState(false);
  const [scrollHidden, setScrollHidden] = useState(false);
  const [activeTab, setActiveTab] = useState('category');
  const [tourCurrentStep, setTourCurrentStep] = useState(0);
  const [firstTimeUser, setFirstTimeUser] = useState(false);
  const [mobFilterDrawer, setMobFilterDrawer] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [categoryDataList, setCategoryDataList] = useState([]);
  const [categoryTab, setCategoryTab] = useState(false);
  const [subcategoryTab, setSubcategoryTab] = useState(false);
  const [subCategoryInput, setSubCategoryInput] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedID, setSelectedID] = useState([]);
  // product state
  const [productModel, setProductModel] = useState(false);
  const [categoryUID, setCategoryUID] = useState('');
  const [subcategoryUID, setSubcategoryUID] = useState('');
  const [, setFileUploadCount] = useState(0);

  const { fetchTourData } = useContext(MilestoneContext);
  const [completeModal, setCompleteModal] = useState(false);

  const firstUpdate = useRef(true);
  const query = useQuery();
  const currentPageCount = query.get('page');
  const moduleName = 'categories';
  const firstPage = INITIAL_PAGE;
  const [uploadObject, setUploadObject] = useState([
    { id: 1, isDisable: true, url: '' },
  ]);
  const [subCatUploadObject, setSubCatUploadObject] = useState([
    { id: 1, isDisable: true, url: '' },
  ]);

  const getAllCategoryData = (
    // eslint-disable-next-line default-param-last
    parameters = {},
    flag2,
    showError = false,
    rejectError = true
  ) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      const catFilter = {};
      if (subCatId) {
        catFilter.sub_category_uid = subCatId;
      } else if (catId) {
        catFilter.category_uid = catId;
      }
      const {
        pagination: { pageSize, current },
        searchKey,
      } = parameters;
      getCategoryAndSubcategory({
        limit: isNaN(pageSize) ? 10 : pageSize,
        offset: flag2 ? 1 : current,
        sorter: JSON.stringify(categorySorter),
        filters: JSON.stringify(categoryFilter),
        ...catFilter,
        searchWord: searchKey || '',
        selectedCategorie: JSON.stringify(selectedCategories),
      })
        .then((response) => {
          const data = get(response, 'data.rows', []);
          const value = data.map(({ sub_category: children, ...rest }) => ({
            children,
            ...rest,
          }));
          // eslint-disable-next-line no-restricted-syntax
          for (const element of value) {
            if (element.children.length === 0) {
              delete element.children;
            }
          }
          map(value, (dat) => {
            return map(dat?.children, (cat, index) => {
              dat.children[index].slug = !dat?.is_active;
            });
          });
          setPagination({
            ...parameters.pagination,
            current,
            total: get(response, 'data.count', ''),
          });
          setCategoryData(value);
          setNewFilterData(value);
          setLoading(false);
          setFirstTimeUser(get(data, 'length', 0) <= 0);
          setTableChange(false);
          setCategoryFilter([]);
          setFilterData([]);
          resolve();
        })
        .catch((error_) => {
          setTableChange(false);
          if (showError)
            notification.error({ message: error_.message || FAILED_TO_LOAD });
          if (rejectError) reject(error_);
        });
    });
  };

  const fetchData = useCallback((parameters) => {
    setLoading(true);
    const apiArray = [
      getAllCategoryData(parameters || { pagination }),
      getAllAttributes(),
      getDataTypes(),
      getCategory(),
    ];
    Promise.all(apiArray)
      .then(async (response) => {
        const tourDataValues = await fetchTourData();
        const categoryDatas = get(tourDataValues, 'data.[2]');
        const categoryTourDatas = get(categoryDatas, 'subGuide.[0]');
        const isCategoryCreated = get(categoryTourDatas, 'completed', false);
        if (!isCategoryCreated && !mobileView) {
          setVisible(true);
          setScrollHidden(true);
          setTimeout(() => {
            setOpenTourModal(true);
          }, 1000);
        }
        setAttributeData(get(response, '[1].data', []));
        setSelectData(get(response, '[3].data.rows', []));
        setDataType(get(response, '[2].data', []));
        setLoading(false);
        setCategoryDataList(get(response, '[3].data.rows', []));
      })
      .catch(() => notification.error({ message: FAILED_TO_LOAD }));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    const current = isNaN(currentPageCount) ? false : Number(currentPageCount);
    const newPagination = {
      ...pagination,
      ...(current && { current }),
    };
    if (!tableChange && !firstUpdate.current) {
      const addPagination = currentPageCount
        ? newPagination
        : { ...pagination, current: INITIAL_PAGE };
      if (catId) {
        getAllCategoryData(
          { pagination: addPagination, searchKey: searchWord },
          true,
          true,
          false
        );
      } else {
        getAllCategoryData(
          { pagination: addPagination, searchKey: searchWord },
          false,
          true,
          false
        );
      }
    }

    if (firstUpdate.current) {
      firstUpdate.current = false;
      const parameters = current
        ? { pagination: newPagination, searchKey: searchWord || '' }
        : false;
      fetchData(parameters);
    }
  }, [catId, currentPageCount]);

  useEffect(() => {
    if (subCatId) {
      const filteredProducts = filter(
        get(categoryData[0], 'children', ''),
        (item) => item.sub_category_uid === subCatId
      );
      setNewFilterData(filteredProducts);
    } else if (catId) {
      const filteredProducts = categoryData.filter(
        (item) => item.category_uid === catId
      );
      setNewFilterData(filteredProducts);
    } else {
      setNewFilterData(categoryData);
    }
  }, [catId, subCatId]);

  const handleSelectChange = (value) => {
    handleUrlChanges(firstPage, history, moduleName);
    setCategoryValue(value);
    // eslint-disable-next-line unicorn/no-null
    setSubCategoryValue(null);
    const subCategory = selectCategoryData.filter(
      (item) => item.category_uid === value
    );
    setSubCategoryData(get(subCategory, '[0].sub_category', []));
  };

  const resetFilters = () => {
    if (!openTourModal) {
      handleUrlChanges(firstPage, history, moduleName);
    }
    // eslint-disable-next-line unicorn/no-null
    setCategoryValue(null);
    // eslint-disable-next-line unicorn/no-null
    setSubCategoryValue(null);
    setSubCategoryData([]);
    getAllCategoryData(
      {
        pagination: { ...pagination, current: INITIAL_PAGE },
        searchKey: searchWord,
      },
      false,
      true,
      false
    );
  };

  // attribute table select
  const rowSelectionAttribute = {
    selectedRowKeys: selectedKeys,
    onChange: (selectedRowKeysAttribute, selectedRow) => {
      setSelectedKeys(selectedRowKeysAttribute);
      setAttribute(selectedRowKeysAttribute);
      setSaveDisabled(false);
      setSelectedAttribute(selectedRow);
    },
    getCheckboxProps: (record) => ({
      disabled: record.is_default,
      name: record.name,
    }),
    renderCell: (checked, record, index, originalNode) =>
      record.is_default ? <Tag color="default">default</Tag> : originalNode,
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setImgUrl(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url.slice(Math.max(0, file.url.lastIndexOf('/') + 1))
    );
  };

  const onFinishCategory = async (values) => {
    const {
      categoryName,
      subCategoryName,
      seoTitle,
      seoDescription,
      seoCatCustomPath,
      seoSubCatCustomPath,
    } = values;

    const newdata = filter(fileLists, (item) => item.localMedia === true);
    const imageSource = map(newdata, (item) => item);

    const body = {
      attribute: JSON.stringify(attribute),
      category_name: categoryName,
      sub_category_name: subCategoryName,
      seo_title: seoTitle?.trim(),
      seo_description: seoDescription?.trim(),
      seo_custom_path: seoCatCustomPath?.trim(),
      seo_sub_category_custom_path: seoSubCatCustomPath?.trim(),
      image_source: JSON.stringify([...imageSource]),
    };
    const trimFormValues = {};
    trimPayloadFields(body, trimFormValues);
    const fileImage = fileLists && fileLists.map((item) => item.originFileObj);
    let seoPreviewImage;
    if (!isEmpty(fileImage[0])) {
      seoPreviewImage = await seoImageCompressor(fileImage[0]);
    }
    const file = {
      files: fileLists.map((item) => item.originFileObj),
      seo_image: seoPreviewImage,
    };
    setDrawerLoading(true);
    Promise.all([
      createCategory(trimFormValues, file),
      putOnboardSubGuide({
        completed: true,
        slug: 'category',
      }),
    ])
      .then((response) => {
        const { data } = response[0];
        if (data?.success) {
          notification.success({ message: CATEGORY_ADD_SUCCESS });
          form.resetFields();
          setSearchWord('');
          resetFilters();
          fetchData();
          setSelectedKeys([]);
          setAttribute([]);
          setVisible(false);
          setImgUrl(false);
          setSaveDisabled(true);
          setFileListArray([]);
          map(uploadObject, (item) => {
            item.url = '';
          });
        } else {
          notification.error({
            message: get(data, 'error', CATEGORY_ADD_FAILED),
          });
        }
        setDrawerLoading(false);
      })
      .catch((error) => {
        setDrawerLoading(false);
        notification.error({
          message: get(error, 'error', CATEGORY_ADD_FAILED),
        });
      });
  };

  const handleTableChange = (paginationAlias, filters, sorters) => {
    setTableChange(true);
    const { current } = paginationAlias;
    handleUrlChanges(current, history, moduleName);
    if (!isEmpty(sorters.order) && sorters) {
      setCategorySorter({
        columnKey: sorters.columnKey,
        orders: sorters.order === 'ascend' ? 'ascend' : 'descend',
      });
      setCategoryCurrentValue(current);
    } else {
      setCategorySorter({
        columnKey: sorters.columnKey,
        orders: sorters.order === '',
      });
      setCategoryCurrentValue(current);
    }
  };

  useEffect(() => {
    if (Object.keys(categorySorter).length > 0) {
      getAllCategoryData(
        {
          pagination: { pageSize: PAGE_LIMIT, current: categoryCurrentValue },
          searchKey: searchWord,
        },
        false,
        true,
        false
      );
    }
  }, [categorySorter]);

  const onFinishSubCategory = (values) => {
    const { categoryID, subCategoryName, seoSubCatCustomPath } = values;
    const newdata = filter(subCatFileList, (item) => item.localMedia === true);
    const imageSource = map(newdata, (item) => item);
    const body = {
      attribute,
      category_uid: categoryID,
      sub_category_name: subCategoryName,
      seo_sub_category_custom_path: seoSubCatCustomPath?.trim(),
      image_source: JSON.stringify([...imageSource]),
    };
    const trimFormValues = {};
    trimPayloadFields(body, trimFormValues);
    setDrawerLoading(true);
    const file = {
      files: subCatFileList.map((item) => item.originFileObj),
    };
    createSubCategory(trimFormValues, file)
      .then((response) => {
        if (response.data) {
          notification.success({ message: SUB_CATEGORY_ADD_SUCCESS });
          form.resetFields();
          setSearchWord('');
          resetFilters();
          fetchData();
          setSelectedKeys([]);
          setVisible(false);
          setSaveDisabled(true);
          map(subCatUploadObject, (item) => {
            item.url = '';
          });
        } else {
          notification.error({ message: SUB_CATEGORY_ADD_FAILED });
        }
        setDrawerLoading(false);
      })
      .catch((error) => {
        setDrawerLoading(false);
        notification.error({
          message: get(error, 'error', SUB_CATEGORY_ADD_FAILED),
        });
      });
  };

  const showDrawer = () => {
    setType('ADD');
    setTitle('Add Category');
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
    setLoading(false);
    setImgUrl(false);
    setSelectedKeys([]);
    setAttribute([]);
    setSelectedData({});
    setSeoPageTitle('');
    setSeoMetaDescription('');
    setCatCustomUrl('');
    setSubCatCustomUrl('');
    setSaveDisabled(true);
    setDrawerLoading(false);
    setFileListArray([]);
    form1.resetFields();
    form.resetFields();
    setOpenTourModal(false);
    setSubCategoryInput(false);
    setCategoryTab(false);
    setSubcategoryTab(false);
    setSelectedAttribute([]);
    setActiveTab('category');
    setCategoryTab(false);
    setSubcategoryTab(false);
    map(uploadObject, (item) => {
      item.productImageInfo = { product_image: '' };
    });
    map(subCatUploadObject, (item) => {
      item.productImageInfo = { product_image: '' };
    });
  };
  const handleCancel = () => {
    setPreviewVisible(false);
  };

  const globalSearchDebounce = (event_) => {
    getAllCategoryData({
      pagination: { pageSize: PAGE_LIMIT, current: INITIAL_PAGE },
      searchKey: event_.target.value,
    });
    handleUrlChanges(firstPage, history, moduleName);
  };

  const globalSearch = useMemo(() => debounce(globalSearchDebounce, 1000), []);

  const onFinishAttributes = () => {
    form1
      .validateFields(['attributes'])
      .then(() => {
        const value = form1.getFieldsValue();
        const { attributes, attributeType } = value;
        const body = {
          attributes: attributes?.trim(),
          data_type: attributeType,
        };
        setDrawerLoading(true);
        createAttribute(body)
          .then((response) => {
            if (response.data) {
              notification.success({ message: ATTRIBUTE_ADD_SUCCESS });
              form1.resetFields();
              fetchData();
            } else notification.error({ message: ATTRIBUTE_ADD_FAILED });
            setDrawerLoading(false);
          })
          .catch((error) => {
            setDrawerLoading(false);
            notification.error({
              message: get(error, 'error', ATTRIBUTE_ADD_FAILED),
            });
          });
      })
      .catch((error) => {
        console.log('Username field validation error:', error.errorFields);
      });
  };

  const handleDeleteAttribute = async (event, key, method) => {
    let selectedAttributeID = [];
    if (method === 'single') {
      selectedAttributeID = [key.attribute_id];
    } else {
      map(key, (item) => {
        if (item.attribute_id) {
          selectedAttributeID.push(item.attribute_id);
        }
      });
    }
    const text =
      'Are you sure you want to delete this attribute from the list?';
    const result = await DeleteAlert(text);
    if (result.isConfirmed) {
      setDrawerLoading(true);
      const body = {
        attributeIDList: JSON.stringify(selectedAttributeID),
      };
      deleteAttribute(body)
        .then(() => {
          setDrawerLoading(false);
          DeleteAlertImage(ATTRIBUTE_DELETE_SUCCESS);
          setSelectedAttribute([]);
          fetchData();
        })
        .catch((error) => {
          setDrawerLoading(false);
          notification.error({
            message: get(error, 'error', ATTRIBUTE_DELETE_FAILED),
          });
        });
    }
  };

  const handleDeleteCategory = async (key, method) => {
    let selectedCategoryID = [];
    let selectedSubCategoryID = [];
    if (method === 'single') {
      if (key.sub_category_uid) {
        selectedSubCategoryID = [key.sub_category_uid];
      } else {
        selectedCategoryID = [key.category_uid];
      }
    } else {
      map(key, (item) => {
        if (item.sub_category_uid) {
          selectedSubCategoryID.push(item.sub_category_uid);
        } else {
          selectedCategoryID.push(item.category_uid);
          map(item?.children, (value) => {
            if (value?.sub_category_uid) {
              selectedSubCategoryID.push(item?.category_uid);
            }
          });
        }
      });
    }
    const text =
      'Are you sure you want to delete this category/subcategory from the list?';
    const result = await CategoryDeleteAlert(text, key);
    if (result.isConfirmed) {
      setLoading(true);
      const { current } = pagination;
      const currentPage =
        filterData.length === 1 && current > 1 ? current - 1 : current;
      const body = {
        categoryIDList: JSON.stringify(selectedCategoryID),
        subCategoryIDList: JSON.stringify(selectedSubCategoryID),
      };
      deleteCategory(body)
        .then(() => {
          setLoading(false);
          DeleteAlertImage(CATEGORY_DELETE_SUCCESS);
          setSelectedID([]);
          setSearchWord('');
          resetFilters();
          getAllCategoryData({
            pagination: { ...pagination, current: currentPage },
          });
        })
        .catch(async (error) => {
          let parsedResponse;
          try {
            parsedResponse = await error.json();
          } catch {
            parsedResponse = error;
          }
          setLoading(false);
          notification.error({
            message: get(parsedResponse, 'message', CATEGORY_DELETE_FAILED),
          });
        });
    }
  };

  const handleEdit = async (event, key) => {
    const filtervalue = find(
      newFilterData,
      (item) => item?.category_uid === key?.category_uid
    );
    setTitle('Edit Category');
    setCateName(get(filtervalue, 'category_name', ''));
    setType('EDIT');
    setSelectedData(key);
    setSeoPageTitle(key?.seo_title || 'Page Title');
    setSeoMetaDescription(key?.seo_description || 'Meta Description');
    setCatCustomUrl(key?.seo_custom_path || key?.category_uid);
    const list = key.attributes
      ? key.attributes.map((item) => Number(item.attribute_id))
      : [];
    setSelectedKeys([...list]);
    setAttribute([...list]);

    if (key.sub_category_uid) {
      setActiveTab('subCategory');
      setCategoryTab(true);
      form.setFieldsValue({
        categoryID: key?.category_uid,
        subCategoryName: key?.category_name,
        seoSubCatCustomPath: key?.seo_sub_category_custom_path,
      });
      map(subCatUploadObject, (item) => {
        item.productImageInfo = { product_image: key?.image };
        return list;
      });
      setSubCatCustomUrl(
        key?.seo_sub_category_custom_path || key?.sub_category_uid
      );
    } else {
      setSubcategoryTab(true);
      form.setFieldsValue({
        ...key,
        categoryName: key.category_name,
        seoTitle: key?.seo_title,
        seoDescription: key?.seo_description,
        seoCatCustomPath: key?.seo_custom_path,
      });

      map(uploadObject, (value) => {
        value.productImageInfo = { product_image: key?.image };
        return value;
      });
    }
    setVisible(true);
  };

  const onFinishEdit = async (values) => {
    const {
      categoryName,
      subCategoryName,
      seoTitle,
      seoDescription,
      seoCatCustomPath,
      seoSubCatCustomPath,
      image,
    } = values;
    const fileImage = fileLists && fileLists.map((item) => item.originFileObj);
    const seoPreviewImage = await seoImageCompressor(fileImage[0]);
    const file = {
      files: selectedData?.sub_category_uid?.length
        ? subCatFileList.map((item) => item.originFileObj)
        : fileLists.map((item) => item.originFileObj),
      seo_image: seoPreviewImage,
    };
    const attributeArray = attribute.map((value) => ({
      attribute_id: value,
      sub_category_uid: selectedData.sub_category_uid,
      category_uid: selectedData.category_uid,
    }));

    const catFilter = filter(fileLists, (item) => item.localMedia === true);
    const catMapData = map(catFilter, (item) => item);
    const categoryImg = JSON.stringify([...catMapData]);

    const subCatFilter = filter(
      subCatFileList,
      (item) => item.localMedia === true
    );
    const subCatMapData = map(subCatFilter, (item) => item);
    const subCategoryImg = JSON.stringify([...subCatMapData]);

    const body = {
      ...selectedData,
      category_name: categoryName || cateName,
      sub_category_name: subCategoryName,
      image: typeof image === 'string' ? image : '',
      attributeArray: JSON.stringify(attributeArray),
      seo_title: seoTitle?.trim(),
      seo_description: seoDescription?.trim(),
      seo_custom_path: seoCatCustomPath?.trim(),
      seo_sub_category_custom_path: seoSubCatCustomPath?.trim(),
      image_source: activeTab === 'category' ? categoryImg : subCategoryImg,
      cat_img_slug: !!uploadObject[0]?.productImageInfo,
      sub_cat_img_slug: !!subCatUploadObject[0]?.productImageInfo,
    };
    const trimFormValues = {};
    trimPayloadFields(body, trimFormValues);
    setDrawerLoading(true);
    editCategory(trimFormValues, file, selectedData.category_uid)
      .then((result) => {
        if (result.data.success) {
          notification.success({ message: CATEGORY_EDIT_SUCCESS });
          form.resetFields();
          setVisible(false);
          setSelectedKeys([]);
          setAttribute([]);
          setSearchWord('');
          resetFilters();
          fetchData();
          setFileListArray([]);
          setSaveDisabled(true);
          map(uploadObject, (item) => {
            item.url = '';
          });
          map(subCatUploadObject, (item) => {
            item.url = '';
          });
          onClose();
        } else {
          notification.error({
            message: get(result.data, 'error', CATEGORY_EDIT_FAILED),
          });
        }
        setDrawerLoading(false);
      })
      .catch((error) => {
        setDrawerLoading(false);
        notification.error({
          message: Object.prototype.hasOwnProperty.call(error, 'error')
            ? error.error
            : CATEGORY_EDIT_FAILED,
        });
      });
  };

  const onFinish = async (value) => {
    if (openTourModal) {
      setOpenTourModal(false);
      await putOnboardSubGuide({
        completed: true,
        slug: 'category',
      });
      setCompleteModal(true);
      setTimeout(() => {
        setCompleteModal(false);
        if (activeTab === 'category' && type === SCREEN_MODE_ADD) {
          onFinishCategory(value);
          setOpenTourModal(false);
        } else if (activeTab === 'subCategory' && type === SCREEN_MODE_ADD) {
          onFinishSubCategory(value);
        } else {
          onFinishEdit(value);
        }
        history('/dashboard');
      }, 4000);
    } else if (
      activeTab === 'category' &&
      type === SCREEN_MODE_ADD &&
      openTourModal === false
    ) {
      onFinishCategory(value);
      setOpenTourModal(false);
    } else if (activeTab === 'subCategory' && type === SCREEN_MODE_ADD) {
      onFinishSubCategory(value);
    } else {
      onFinishEdit(value);
    }
  };

  const onValuesChange = (changedValues) => {
    if (changedValues) {
      setSaveDisabled(false);
    }
  };

  const handleStatusChange = (status, record) => {
    let UID;
    let tableName;
    if (record.sub_category_uid) {
      UID = get(record, 'sub_category_uid', '');
      tableName = 'sub_category';
    } else {
      UID = get(record, 'category_uid', '');
      tableName = 'category';
    }
    if (record) {
      updateStatus(UID, { status, tableName })
        .then((response) => {
          if (response.success) {
            getAllCategoryData({
              pagination: { ...pagination },
            });
            notification.success({ message: 'Category updated successfully' });
          }
        })
        .catch((error) => {
          notification.error({
            message: get(error, 'message', ''),
          });
        });
    }
  };

  const drawerColumn = [
    {
      title: 'Attributes',
      dataIndex: 'name',
      width: 150,
      render: (text) => <span className="text-grey-light">{text}</span>,
    },
    {
      title: 'Data Type',
      dataIndex: 'data_type',
      width: 150,
      render: (text) => <span className="text-grey-light">{text}</span>,
    },
    {
      title: 'Actions',
      width: 100,
      align: 'center',
      render: (a) => (
        <span className="edit-box">
          {!a.is_default && (
            <DeleteIcon
              className="cursor-pointer"
              onClick={(event_) => {
                if (!openTourModal) {
                  handleDeleteAttribute(event_, a, 'single');
                }
              }}
            />
          )}
        </span>
      ),
    },
  ];

  const handleProduct = (record) => {
    setCategoryUID(get(record, 'category_uid', ''));
    setSubcategoryUID(get(record, 'sub_category_uid', ''));
    setProductModel(true);
  };

  const columns = [
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      width: '30%',
      render: (data, value) => {
        return (
          <div className="center">
            <img
              width="40"
              height="40px"
              src={get(value, 'image', '') || defaultImage}
              alt="category-img"
              className="radius"
            />{' '}
            &nbsp;
            <span>{data}</span>
          </div>
        );
      },
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: '20%',
      render: (value, record) => {
        const data = record.is_active === true ? SWITCH_WARNING : '';
        return (
          <Tooltip title={get(record, 'sub_category_uid', '') ? '' : data}>
            <Switch
              className="switch-container"
              checked={value}
              disabled={record.slug}
              onChange={(values) => handleStatusChange(values, record)}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Products',
      dataIndex: 'product_count',
      key: 'product_count',
      width: '25%',
      render: (value, record) => (
        <span>
          {value > 0 ? (
            value
          ) : (
            <Button onClick={() => handleProduct(record)}>Add Products</Button>
          )}
        </span>
      ),
    },
    {
      title: 'Actions',
      align: 'center',
      width: '25%',
      render: (a) => (
        <span>
          <Tooltip title="Edit">
            <EditIcon
              className="cursor-pointer"
              onClick={(key) => handleEdit(key, a)}
            />
          </Tooltip>

          <Popover
            overlayClassName="share-popover"
            content={
              <SocialShare
                url={`${get(
                  tenantDetails,
                  'customer_url',
                  ''
                )}/product-list?categoryId=${get(a, 'category_uid', '')}${
                  get(a, 'sub_category_uid', '')
                    ? `&subCategoryId=${get(a, 'sub_category_uid', '')}`
                    : ''
                }&viewType=grid`}
                name={get(a, 'category_name', '')}
                image_url={get(a, 'image', '')}
                description=""
              />
            }
            placement="bottom"
            trigger="click"
          >
            <Tooltip title="Social Share">
              <ShareIcon className="share-icon cursor-pointer" />
            </Tooltip>
          </Popover>

          <Tooltip title="Delete">
            <DeleteIcon
              className="cursor-pointer"
              onClick={() => handleDeleteCategory(a, 'single')}
            />
          </Tooltip>
        </span>
      ),
    },
  ];

  useEffect(() => {
    paginationstyler();
  }, [filterData]);

  const handleCatCustomUrl = (a) => {
    setCatCustomUrl(a.target.value.replaceAll(/\s+/g, '-'));
    form.setFieldsValue({
      seoCatCustomPath: a.target.value.replaceAll(/\s+/g, '-'),
    });
  };

  const handleSubCatCustomUrl = (a) => {
    setSubCatCustomUrl(a.target.value.replaceAll(/\s+/g, '-'));
    form.setFieldsValue({
      seoSubCatCustomPath: a.target.value.replaceAll(/\s+/g, '-'),
    });
  };

  useEffect(() => {
    if (visible && tourCurrentStep === 1) {
      setTimeout(() => {
        setTourCurrentStep((step) => step + 1);
      }, 250);
    }
  }, [visible, tourCurrentStep]);

  useEffect(() => {
    if (openTourModal) {
      disableTabEnterKey();
    } else {
      enableTabEnterKey();
    }
  }, [openTourModal]);

  useEffect(() => {
    if (scrollHidden) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [scrollHidden]);

  useEffect(() => {
    if (!visible && !openTourModal) {
      document.body.style.overflow = 'auto';
    }
  }, [visible, openTourModal]);

  const filterSelectedAllItems = (mergedArray, changeRows) => {
    const filtered = filter(
      selectedRowKeys,
      (item) => !mergedArray.includes(item)
    );
    setSelectedRowKeys(filtered);
    const filteredData = filter(
      selectedID,
      (item) => !changeRows.includes(item)
    );
    setSelectedID(filteredData);
  };

  const filterSelectedItems = (mappedData, record) => {
    const { category_uid: categoryUid, sub_category_uid: subcategoryUid } =
      record;
    if (subcategoryUid) {
      const filtered = filter(
        selectedRowKeys,
        (item) => !subcategoryUid.includes(item)
      );
      setSelectedRowKeys(filtered);
      const filteredData = filter(
        selectedID,
        (item) => !subcategoryUid.includes(item?.sub_category_uid)
      );
      setSelectedID(filteredData);
    } else {
      const filtered = filter(
        selectedRowKeys,
        (item) => !categoryUid.includes(item)
      );
      setSelectedRowKeys(filtered);
      const filteredData = filter(
        selectedID,
        (item) => !categoryUid.includes(item?.category_uid)
      );
      setSelectedID(filteredData);
    }
  };

  const handleSelectOneRow = (record, selected) => {
    const { category_uid: categoryUid, sub_category_uid: subcategoryUid } =
      record;
    if (selected) {
      const arrayProduct = [];
      const arrySubCategory = [];
      const arrayOfObject = [];

      if (subcategoryUid) {
        arrySubCategory.push(subcategoryUid);
        arrayOfObject.push(record);
        setSelectedRowKeys([...selectedRowKeys, ...arrySubCategory]);
        setSelectedID([...selectedID, ...arrayOfObject]);
      } else {
        arrayProduct.push(categoryUid);
        arrayOfObject.push(record);
        setSelectedRowKeys([...selectedRowKeys, ...arrayProduct]);
        setSelectedID([...selectedID, ...arrayOfObject]);
      }
    } else {
      filterSelectedItems(categoryUid, record);
    }
  };

  const handleSelectALLRow = (selected, selectedRows, changeRows) => {
    const selectedCategoryUID = [];
    const selectedSubCategoryUID = [];
    map(changeRows, (item) => {
      if (item.sub_category_uid) {
        selectedSubCategoryUID.push(item.sub_category_uid);
      } else {
        selectedCategoryUID.push(item.category_uid);
      }
    });
    const mergedArray = [...selectedCategoryUID, ...selectedSubCategoryUID];

    if (selected) {
      setSelectedRowKeys([...selectedRowKeys, ...mergedArray]);
      setSelectedID([...selectedID, ...changeRows]);
    } else {
      filterSelectedAllItems(mergedArray, changeRows);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onSelect: handleSelectOneRow,
    onSelectAll: handleSelectALLRow,
  };

  return (
    <Spin spinning={loading}>
      <Row style={{ padding: '15px 10px 10px 10px' }}>
        <Col xs={24} sm={24} md={8} xl={8}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <Categorie />
                <p className="heading">Category</p>
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col xs={24} sm={24} md={8} xl={8}>
          <div style={{ display: 'flex' }}>
            <Input
              placeholder="Search"
              allowClear
              value={searchWord}
              onChange={(event_) => {
                setSearchWord(event_.target.value);
                globalSearch(event_);
              }}
              className="custom-search"
              suffix={<SearchOutlined className="site-form-item-icon" />}
            />
            {mobileView && (
              <FilterIcon
                className="ml-10"
                onClick={() => setMobFilterDrawer(true)}
              />
            )}
          </div>
        </Col>
      </Row>
      {firstTimeUser ? (
        <FirstTimeUser
          src={categoryDefaultImg}
          onClick={showDrawer}
          buttonTitle={CAT_BUTTON}
          title="Category awaits products"
          description="Present your products/services to customers through visually appealing categories."
        />
      ) : (
        <div className="box">
          <div
            className={
              mobileView
                ? 'p-0 box__header product-page-header-options'
                : 'box__header product-page-header-options'
            }
          >
            {!mobileView && (
              <div>
                <Space>
                  <Select
                    className="dropdown-picker category-select"
                    placeholder="Category"
                    virtual={false}
                    onChange={handleSelectChange}
                    value={catId}
                  >
                    {selectCategoryData.map((cat) => (
                      <Option
                        key={get(cat, 'category_uid', '')}
                        value={get(cat, 'category_uid', '')}
                      >
                        {get(cat, 'category_name', '')}
                      </Option>
                    ))}
                  </Select>
                  <Select
                    className="dropdown-picker category-select"
                    placeholder="Sub Category"
                    virtual={false}
                    onChange={(value) => {
                      setSubCategoryValue(value);
                      handleUrlChanges(firstPage, history, moduleName);
                    }}
                    value={subCatId}
                  >
                    {subCategoryData.map((cat) => (
                      <Option value={cat.sub_category_uid}>
                        {cat.sub_category_name}
                      </Option>
                    ))}
                  </Select>
                  <Tag
                    icon={<CloseCircleOutlined />}
                    color="error"
                    style={{ borderRadius: '15px' }}
                    visible={catId || subCatId}
                    onClick={resetFilters}
                  >
                    Clear filters
                  </Tag>
                </Space>
              </div>
            )}

            <Space className="search_btns category-button-options">
              <div className={mobileView ? 'mobile-view-product-btns' : ''}>
                <Button
                  id="add-categories-btn"
                  className=""
                  type="primary"
                  onClick={showDrawer}
                  hidden={!canWrite}
                >
                  <PlusOutlined />
                  Add Category
                </Button>
              </div>
              {mobileView ? undefined : (
                <Button
                  type="danger"
                  danger
                  hidden={!canWrite}
                  onClick={() => handleDeleteCategory(selectedID, 'multiple')}
                  disabled={isEmpty(selectedID)}
                  className="disable-danger delete-danger product-delete-btn"
                >
                  {' '}
                  <Space>
                    <DeleteOutlined />
                    <span className="mobile-display-none">Delete</span>
                  </Space>
                </Button>
              )}
            </Space>
          </div>
          {mobileView ? (
            <TableMobileView
              newFilterData={newFilterData}
              handleEdit={handleEdit}
              handleDeleteCategory={handleDeleteCategory}
              handleTableChange={handleTableChange}
              handleStatusChange={handleStatusChange}
              handleProduct={handleProduct}
              pagination={pagination}
              mobileView={mobileView}
            />
          ) : (
            <div className="box__content p-0">
              <Table
                className="grid-table category"
                columns={columns}
                rowSelection={rowSelection}
                rowKey={(item) =>
                  item?.sub_category_uid
                    ? `${item?.sub_category_uid}`
                    : `${item?.category_uid}`
                }
                dataSource={newFilterData}
                pagination={pagination}
                getAllCategoryData={getAllCategoryData}
                loading={loading}
                onChange={handleTableChange}
                scroll={{ x: 780 }}
                indentSize={50}
              />
            </div>
          )}
        </div>
      )}

      <CategoriesForm
        onClose={onClose}
        visible={visible}
        drawerLoading={drawerLoading}
        title={title}
        form={form}
        onFinish={onFinish}
        setOpenTourModal={setOpenTourModal}
        onValuesChange={onValuesChange}
        setFileListArray={setFileListArray}
        handlePreview={handlePreview}
        fileLists={fileLists}
        subCatFileLists={subCatFileList}
        setSubCatFileList={setSubCatFileList}
        setFileUploadCount={setFileUploadCount}
        selectCategoryData={selectCategoryData}
        type={type}
        selectedData={selectedData}
        form1={form1}
        onFinishAttributes={onFinishAttributes}
        dataType={dataType}
        drawerColumn={drawerColumn}
        attributeData={attributeData}
        rowSelectionAttribute={rowSelectionAttribute}
        seoMetaDescription={seoMetaDescription}
        seoPageTitle={seoPageTitle}
        catCustomUrl={catCustomUrl}
        subCatCustomUrl={subCatCustomUrl}
        setSeoPageTitle={setSeoPageTitle}
        setSeoMetaDescription={setSeoMetaDescription}
        handleCatCustomUrl={handleCatCustomUrl}
        handleSubCatCustomUrl={handleSubCatCustomUrl}
        saveDisabled={saveDisabled}
        previewVisible={previewVisible}
        previewTitle={previewTitle}
        handleCancel={handleCancel}
        imgUrl={imgUrl}
        openTourModal={openTourModal}
        tourCurrentStep={tourCurrentStep}
        setVisible={setVisible}
        setTourCurrentStep={setTourCurrentStep}
        showDrawer={showDrawer}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        handleDeleteAttribute={handleDeleteAttribute}
        selectedAttribute={selectedAttribute}
        uploadObject={uploadObject}
        setUploadObject={setUploadObject}
        subCatUploadObject={subCatUploadObject}
        setSubCatUploadObject={setSubCatUploadObject}
        subcategoryTab={subcategoryTab}
        categoryTab={categoryTab}
        subCategoryInput={subCategoryInput}
        setSubCategoryInput={setSubCategoryInput}
      />
      <AddProduct
        productModel={productModel}
        setProductModel={setProductModel}
        subcategoryUID={subcategoryUID}
        categoryUID={categoryUID}
        getAllCategoryData={getAllCategoryData}
        pagination={pagination}
        selectCategoryData={selectCategoryData}
        mobileView={mobileView}
        categoryDataList={categoryDataList}
      />
      {mobFilterDrawer && (
        <MobileFilter
          mobFilterDrawer={mobFilterDrawer}
          setMobFilterDrawer={setMobFilterDrawer}
          categoryData={categoryDataList}
          subCategoryData={subCategoryData}
          setSubCategoryData={setSubCategoryData}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedSubCategories={selectedSubCategories}
          setSelectedSubCategories={setSelectedSubCategories}
          setCategoryData={setCategoryData}
          getAPI={getAllCategoryData}
          pagination={pagination}
          categoryDataList={categoryDataList}
          filterPage="category"
        />
      )}
      <Modal
        open={completeModal}
        footer={false}
        maskClosable
        centered
        closeIcon={false}
        className="milestone-modal-store"
        zIndex={1005}
      >
        <span>
          <CategoryBackgroundModal />
        </span>
        <span>Category added successfully</span>
      </Modal>
    </Spin>
  );
}

export default Categories;
