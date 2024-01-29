import { Row, Col, Select, Input } from 'antd';
import { filter, find, get, isEmpty, map } from 'lodash';
import React, { useState, useEffect } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { SCREEN_MODE_EDIT } from '../../../../shared/constant-values';
import { handleCarouselImages } from '../../../../shared/function-helper';

function ImgeUploadItem(properties) {
  const {
    handleRowDelete,
    banner,
    products,
    categories,
    selectedBanners,
    setSelectedBanners,
    from,
  } = properties;
  const [categoryData, setCategoryData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [selectedproductDatas, setSelectedproductDatas] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [insertBanner, setInsertBanner] = useState([]);

  const [categoryObject, setCategoryObject] = useState();
  const [subCategoryObject, setSubCategoryObject] = useState();
  const [productObject, setProductObject] = useState();
  const [pageValue, setPageValue] = useState('');

  const intitalSetup = () => {
    if (from === SCREEN_MODE_EDIT) {
      setSelectedCategoryId(banner?.action?.category?.category_uid);
      setSelectedSubCategoryId(banner?.action?.subCategory?.sub_category_uid);
      setSelectedProductId(banner?.action?.product?.product_uid);
      setPageValue(banner?.action?.page);
      const subcategoryDatas = find(
        categories,
        (item) => banner?.action?.category?.category_uid === item.category_uid
      );
      const productValue = banner?.action?.subCategory?.sub_category_uid
        ? get(subcategoryDatas, 'sub_category', []).filter(
            (item) =>
              item.sub_category_uid ===
              banner?.action?.subCategory.sub_category_uid
          )
        : categories.filter(
            (item) =>
              item.category_uid === banner?.action?.category?.category_uid
          );
      setSubCategoryData(get(subcategoryDatas, 'sub_category', []));
      setProductData(
        banner?.action?.category?.category_uid
          ? get(productValue, '[0].productList', [])
          : products
      );
      setSelectedproductDatas(
        banner?.action?.category?.category_uid
          ? get(productValue, '[0].productList', [])
          : products
      );
    } else {
      setProductData(products);
      setSelectedproductDatas(products);
    }
    setCategoryData(categories);
  };

  useEffect(() => {
    intitalSetup();
  }, []);

  useEffect(() => {
    setInsertBanner(selectedBanners);
  }, [selectedBanners]);

  const handleBannerAction = (action) => {
    const insertActionList = map(insertBanner, (item) => {
      if (item.id === banner.id) {
        const newBanner = item;
        newBanner.action = action;
        return newBanner;
      }
      return item;
    });
    setSelectedBanners(insertActionList);
  };

  const handleCategoryOnChange = (value) => {
    const categoryValue = categories.find((list) => {
      return list.category_uid === value;
    });
    setCategoryObject(categoryValue);
    if (value) {
      setSelectedProductId('');
      setSelectedSubCategoryId('');
      setSelectedCategoryId(value);
      const subCategory = filter(
        categoryData,
        (item) => item.category_uid === value
      );
      const productDatas = filter(
        categoryData,
        (item) => item.category_uid === value
      );
      if (isEmpty(subCategory)) {
        setSelectedSubCategoryId('');
        setSubCategoryData([]);
      } else {
        setSubCategoryData(get(subCategory, '[0].sub_category', []));
      }
      if (productDatas) {
        setSelectedproductDatas(get(productDatas, '[0].productList', []));
      } else {
        setSelectedProductId('');
        setSelectedproductDatas([]);
      }
    } else {
      selectedCategoryId('');
      setSelectedSubCategoryId('');
      setSelectedproductDatas(productData);
      setSubCategoryData([]);
    }
    const action = {
      category: categoryValue,
      subCategory: '',
      product: '',
      page: pageValue,
    };
    handleBannerAction(action);
  };

  const handleSubCategoryOnChange = (value) => {
    const subCategoryValue = subCategoryData.find((list) => {
      return list.sub_category_uid === value;
    });
    setSubCategoryObject(subCategoryValue);
    if (value) {
      setSelectedSubCategoryId(value);
      setSelectedProductId('');
      const productwithsubcategory = filter(
        subCategoryData,
        (item) => item.sub_category_uid === value
      );
      if (isEmpty(productwithsubcategory)) {
        setSelectedProductId('');
        setSelectedproductDatas([]);
      } else {
        setSelectedproductDatas(
          get(productwithsubcategory, '[0].productList', [])
        );
      }
    } else if (selectedCategoryId) {
      setSelectedSubCategoryId('');
      setSelectedProductId('');
      const productwithcategory = filter(
        categoryData,
        (item) => item.category_uid === selectedCategoryId
      );
      if (!isEmpty(productwithcategory)) {
        setSelectedproductDatas(
          get(productwithcategory, '[0].productList', [])
        );
      }
    } else {
      setSelectedCategoryId('');
      setSelectedproductDatas(productData);
    }
    const action = {
      category: categoryObject,
      subCategory: subCategoryValue,
      product: '',
      page: pageValue,
    };
    handleBannerAction(action);
  };

  const handleProductOnChange = (value) => {
    const productValue = selectedproductDatas.find((list) => {
      return list.product_uid === value;
    });
    setProductObject(productValue);
    if (value) {
      setSelectedProductId(value);
    } else {
      setSelectedProductId('');
    }
    const action = {
      category: categoryObject,
      subCategory: subCategoryObject,
      product: productValue,
      page: pageValue,
    };
    handleBannerAction(action);
  };

  const handleInputOnchange = (event) => {
    setPageValue(event?.target.value);
    const action = {
      category: categoryObject,
      subCategory: subCategoryObject,
      product: productObject,
      page: event?.target.value,
    };
    handleBannerAction(action);
  };

  return (
    <Row>
      <div className="flex-center mr-10">
        <DeleteOutlined onClick={() => handleRowDelete(banner)} />
      </div>
      <Col span={4}>
        <div className="image-container">
          <img
            className="image"
            src={handleCarouselImages(banner)}
            alt={get(banner, 'file.name', 'images')}
          />
        </div>
      </Col>
      <Col span={18}>
        <Row>
          <Col span={6}>
            <div>Category</div>
            <Select
              onChange={handleCategoryOnChange}
              style={{ width: '100%' }}
              placeholder="Select Category"
              value={selectedCategoryId}
              virtual={false}
            >
              {map(categoryData, (item) => (
                <Select.Option value={get(item, 'category_uid')}>
                  {get(item, 'category_name')}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <div>Sub Category</div>
            <Select
              style={{ width: '100%' }}
              placeholder="Select Sub Category"
              onChange={handleSubCategoryOnChange}
              value={selectedSubCategoryId}
            >
              {map(subCategoryData, (subCategory) => (
                <Select.Option value={get(subCategory, 'sub_category_uid')}>
                  {get(subCategory, 'sub_category_name')}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <div>Product</div>
            <Select
              style={{ width: '100%' }}
              placeholder="Select Product Name"
              onChange={handleProductOnChange}
              value={selectedProductId}
            >
              {map(selectedproductDatas, (product) => (
                <Select.Option value={get(product, 'product_uid')}>
                  {get(product, 'product_name')}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <div>Web URL</div>
            <Input onChange={handleInputOnchange} value={pageValue} />
          </Col>
        </Row>
      </Col>
      <Col />
    </Row>
  );
}
export default ImgeUploadItem;
