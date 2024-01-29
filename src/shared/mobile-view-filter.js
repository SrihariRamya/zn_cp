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
import { ReactComponent as FilterIcon } from '../assets/icons/filter-icon.svg';
import { ReactComponent as CloseIcon } from '../assets/images/close-icon.svg';
import { getCategory } from '../utils/api/url-helper';
import { ReactComponent as SearchOutlined } from '../assets/icons/search-icon.svg';
import {
  CATEGORIES_TYPES,
  CAT_FILTER_TYPES,
  FAILED_TO_LOAD,
} from './constant-values';
import { handleSubCategories } from './function-helper';

const { Sider, Content } = Layout;

function MobileFilter(properties) {
  const {
    mobFilterDrawer,
    setMobFilterDrawer,
    categoryData,
    subCategoryData,
    setSubCategoryData,
    selectedCategories,
    setSelectedCategories,
    selectedSubCategories,
    setSelectedSubCategories,
    setCategoryData,
    getAPI,
    categoryDataList,
    isRelatedProducts,
    setProductData,
    filterPage,
  } = properties;
  const [filterType, setFilterType] = useState('Category');
  const [categorySearchValue, setCategorySearchValue] = useState('');
  const [subCategorySearchValue, setSubCategorySearchValue] = useState('');
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [isSearch, setIsSearch] = useState(false);

  const onClickCategoryType = (event) => {
    setIsSearch(false);
    setFilterType(get(event, 'key', ''));
  };

  const onClose = () => {
    setMobFilterDrawer(false);
  };

  const checkedSubCategory = (
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

  const fetchCategoryData = (catSearchKey) => {
    return new Promise((resolve) => {
      const searchParameter = {};
      if (catSearchKey) {
        searchParameter.searchWord = catSearchKey;
      }
      getCategory({
        ...searchParameter,
      })
        .then((response) => {
          const categoryValue = get(response, 'data.rows', []);
          setCategoryData(categoryValue);
          const subCategory = handleSubCategories(
            categoryValue,
            selectedCategories
          );
          setSubCategoryData(flatten(subCategory));
          setSelectedCategories(uniqueCategories);
          resolve();
        })
        .catch((error_) => {
          notification.error({ message: error_.message || FAILED_TO_LOAD });
        });
    });
  };

  const onChangeSubCategory = (checkedValues) => {
    if (isRelatedProducts) setProductData([]);
    const uniqueSubCategoriesList = [
      ...new Set([...selectedSubCategories, ...checkedValues]),
    ];
    setSelectedSubCategories(uniqueSubCategoriesList);
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
    setUniqueCategories(catList);
    setSelectedCategories(catList);
    const subCategories = handleSubCategories(categoryDataList, catList);
    const flatArrayData = flatten(subCategories);
    const seletedSubCat = checkedSubCategory(
      flatArrayData,
      uniqueCategories,
      selectedSubCategories
    );
    setSelectedSubCategories(seletedSubCat);
    setSubCategoryData(flatArrayData);
  };

  const applyFilter = () => {
    const categoryFilter =
      filterPage === 'category'
        ? { pagination: { pageSize: 10, current: 1 } }
        : { productPagination: { pageSize: 9, current: 1 } };
    getAPI(categoryFilter);
    onClose();
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

  const filteredCategories = isRelatedProducts
    ? filter(CATEGORIES_TYPES, (category) => category?.value !== 'Sort by')
    : CAT_FILTER_TYPES;

  return (
    <Drawer
      title={
        <div>
          <span className="filter-icon-align">
            <FilterIcon />
          </span>
          <span className="ml-30p">Filters</span>
          <span className="drawer-close-icon">
            <CloseIcon onClick={onClose} />
          </span>
        </div>
      }
      width={360}
      height={600}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button type="primary" className="apply-btn" onClick={applyFilter}>
            Apply
          </Button>
        </div>
      }
      onClose={onClose}
      closable={false}
      open={mobFilterDrawer}
      placement="bottom"
      className="categories-drawer"
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={150} theme="light">
          <Menu
            mode="vertical"
            className="categories-menu"
            onClick={onClickCategoryType}
            selectedKeys={[filterType]}
          >
            {map(filteredCategories, (category) => (
              <Menu.Item key={get(category, 'value', '')}>
                {get(category, 'label', '')}
              </Menu.Item>
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
            {subCategoryData.length > 0 && filterType === 'Sub Category' && (
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
          </Content>
        </Layout>
      </Layout>
    </Drawer>
  );
}
export default MobileFilter;
