import React, { useState } from 'react';
import {
  Button,
  Drawer,
  Menu,
  Layout,
  Checkbox,
  Input,
  notification,
} from 'antd';
import { map, get, filter, flatten, debounce, includes, isEmpty } from 'lodash';
import { ReactComponent as FilterIcon } from '../../assets/icons/filter-icon.svg';
import { ReactComponent as CloseIcon } from '../../assets/images/close-icon.svg';
import { getCategory } from '../../utils/api/url-helper';
import { ReactComponent as SearchOutlined } from '../../assets/icons/search-icon.svg';
import { CATEGORIES_TYPES, FAILED_TO_LOAD } from '../../shared/constant-values';
import { handleSubCategories } from '../../shared/function-helper';

const { Sider, Content } = Layout;

function Categories(properties) {
  const {
    isOpenDrawer,
    setOpenDrawer,
    categoryData,
    subCategoryData,
    setSubCategoryData,
    selectedCategories,
    setSelectedCategories,
    selectedSubCategories,
    setSelectedSubCategories,
    setCategoryData,
    fetchProductData,
    setProductSorter,
    categoryDataList,
    isRelatedProducts,
    setProductData,
  } = properties;
  const [filterType, setFilterType] = useState('Category');
  const [sorterValues, setSorterValues] = useState('');
  const [categorySearchValue, setCategorySearchValue] = useState('');
  const [subCategorySearchValue, setSubCategorySearchValue] = useState('');
  const [selectedUniqueCategories, setSelectedUniqueCategories] = useState([]);
  const [isSearch, setIsSearch] = useState(false);

  const onClose = () => {
    setOpenDrawer(false);
  };

  const onClickCategoryType = (event) => {
    setIsSearch(false);
    setFilterType(get(event, 'key', ''));
  };

  const checkedSubCategories = (
    flatArrayData,
    uniqueCategoriesData,
    selectedSubCategoriesData
  ) => {
    const data = map(
      filter(
        flatArrayData,
        (item) =>
          includes(uniqueCategoriesData, get(item, 'category_uid', '')) &&
          includes(selectedSubCategoriesData, get(item, 'sub_category_uid', ''))
      ),
      (item) => get(item, 'sub_category_uid', '')
    );
    return data;
  };

  const onChangeCategory = (checkedValues) => {
    if (isRelatedProducts) setProductData([]);
    const uniqueCategoriesList = [
      ...new Set([...selectedCategories, ...checkedValues]),
    ];
    const catList =
      isEmpty(categorySearchValue) && !isSearch
        ? checkedValues
        : uniqueCategoriesList;
    setSelectedUniqueCategories(catList);
    setSelectedCategories(catList);
    const subCategories = handleSubCategories(categoryDataList, catList);
    const flatArrayData = flatten(subCategories);
    const seletedSubCat = checkedSubCategories(
      flatArrayData,
      selectedUniqueCategories,
      selectedSubCategories
    );
    setSelectedSubCategories(seletedSubCat);
    setSubCategoryData(flatArrayData);
  };

  const onChangeSubCategory = (checkedValues) => {
    if (isRelatedProducts) setProductData([]);
    const uniqueSubCategoriesList = [
      ...new Set([...selectedSubCategories, ...checkedValues]),
    ];
    setSelectedSubCategories(uniqueSubCategoriesList);
  };

  const fetchCategoryData = (searchKey) => {
    return new Promise((resolve) => {
      const searchParameter = {};
      if (searchKey) {
        searchParameter.searchWord = searchKey;
      }
      getCategory({
        ...searchParameter,
      })
        .then((response) => {
          const categoryDataSet = get(response, 'data.rows', []);
          setCategoryData(categoryDataSet);
          const subCategories = handleSubCategories(
            categoryDataSet,
            selectedCategories
          );
          setSubCategoryData(flatten(subCategories));
          setSelectedCategories(selectedUniqueCategories);
          resolve();
        })
        .catch((error_) => {
          notification.error({ message: error_.message || FAILED_TO_LOAD });
        });
    });
  };

  const categorySearchDebounce = debounce((value) => {
    fetchCategoryData(value);
  }, 1000);

  const onSearchCategory = (value) => {
    if (!isEmpty(value)) {
      setIsSearch(true);
    }
    if (filterType === 'Category') {
      setCategorySearchValue(value);
    } else {
      setSubCategorySearchValue(value);
    }
    categorySearchDebounce(value);
  };

  const handleProductSorter = (checkedValues) => {
    setSorterValues(checkedValues);
    setProductSorter({
      columnKey: checkedValues,
      orders: 'ascend',
    });
  };

  const applyFilter = () => {
    fetchProductData({ pagination: { pageSize: 14, current: 1 } });
  };

  const filteredCategories = isRelatedProducts
    ? filter(CATEGORIES_TYPES, (category) => category?.value !== 'Sort by')
    : CATEGORIES_TYPES;

  return (
    <Drawer
      title={
        <div>
          <span className="filter-icon-align">
            <FilterIcon />
          </span>
          <span className="ml-30p">Filters & Sort by</span>
          <span className="drawer-close-icon">
            <CloseIcon onClick={onClose} />
          </span>
        </div>
      }
      width={360}
      height={660}
      onClose={onClose}
      closable={false}
      open={isOpenDrawer}
      placement="bottom"
      className="categories-drawer"
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button type="primary" className="apply-btn" onClick={applyFilter}>
            Apply
          </Button>
        </div>
      }
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={150} theme="light">
          <Menu
            mode="vertical"
            className="categories-menu"
            selectedKeys={[filterType]}
            onClick={onClickCategoryType}
          >
            {map(filteredCategories, (category) => (
              <Menu.Item key={category?.value}>{category?.label}</Menu.Item>
            ))}
          </Menu>
        </Sider>
        <Layout>
          <Content style={{ padding: '24px' }} className="white-color">
            {filterType !== 'Sort by' && (
              <Input
                className="filter-search"
                allowClear
                placeholder="Search by category"
                value={
                  filterType === 'Category'
                    ? categorySearchValue
                    : subCategorySearchValue
                }
                onChange={(event_) => onSearchCategory(event_.target.value)}
                suffix={<SearchOutlined className="site-form-item-icon" />}
              />
            )}
            {categoryData && filterType === 'Category' && (
              <Checkbox.Group
                className="selected-checkbox product-checkbox"
                defaultValue={selectedCategories}
                onChange={(event) => onChangeCategory(event)}
                options={map(categoryData, (category) => ({
                  label: category?.category_name,
                  value: category?.category_uid,
                }))}
              />
            )}
            {subCategoryData && filterType === 'Sub Category' && (
              <Checkbox.Group
                defaultValue={selectedSubCategories}
                className="selected-checkbox product-checkbox"
                onChange={onChangeSubCategory}
                options={map(subCategoryData, (subcategory) => ({
                  label: subcategory?.sub_category_name,
                  value: subcategory?.sub_category_uid,
                }))}
              />
            )}
            {filterType === 'Sort by' && (
              <Checkbox.Group
                defaultValue={sorterValues}
                className="selected-checkbox product-checkbox"
                onChange={handleProductSorter}
              >
                <Checkbox className="product-name" value="product_name">
                  Product Name
                </Checkbox>
              </Checkbox.Group>
            )}
          </Content>
        </Layout>
      </Layout>
    </Drawer>
  );
}
export default Categories;
