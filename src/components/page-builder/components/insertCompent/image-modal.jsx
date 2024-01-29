import { get } from 'lodash';
import React, { useState, useEffect } from 'react';
import { Spin, notification } from 'antd';
import { useComponentContext } from '../../context/components';
import {
  getCategory,
  getProducts,
  getSubCategory,
} from '../../../../utils/api/url-helper';
import ImageActionComponent from '../contents/image-component/image-action';

function ImageComponentModal() {
  const { imageActionModal, setImageActionModal } = useComponentContext();
  const [loading, setLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [selectedValue, setSelectedValue] = useState({
    page: '',
    select: '',
  });

  const fetchData = () => {
    const apiArray = [
      getProducts({
        limit: 100,
        offset: 1,
        product_status: true,
      }),
      getCategory(),
      getSubCategory({
        limit: 100,
        offset: 1,
      }),
    ];
    setLoading(true);
    Promise.all(apiArray)
      .then((response) => {
        const productListData = get(response, '[0].data.rows', []).map(
          (data) => {
            return {
              id: data?.product_id,
              uid: data?.product_uid,
              image: data?.product_image[0]?.product_image,
              name: data?.product_name,
            };
          }
        );
        const categoryListData = get(response, '[1].data.rows', []).map(
          (data) => {
            return {
              id: data?.category_id,
              uid: data?.category_uid,
              image: data?.image,
              name: data?.category_name,
            };
          }
        );
        const subCategoryListData = get(response, '[2].data').map((data) => {
          return {
            id: get(data, 'subCategory[0].sub_category_id', ''),
            uid: get(data, 'subCategory[0].sub_category_uid', ''),
            image: get(data, 'subCategory[0].image', ''),
            name: get(data, 'subCategory[0].sub_category_name', ''),
            category_uid: get(data, 'category_uid', ''),
          };
        });
        setProductList(productListData);
        setCategoryList(categoryListData);
        setSubCategoryList(subCategoryListData);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setImageActionModal(false);
        notification.error({ message: error.error });
      });
  };

  useEffect(() => {
    fetchData();
  }, [selectedValue]);

  return (
    <Spin spinning={loading}>
      {imageActionModal && (
        <ImageActionComponent
          categoryList={categoryList}
          productList={productList}
          subCategoryList={subCategoryList}
          imageActionModal={imageActionModal}
          setImageActionModal={setImageActionModal}
          selectedValue={selectedValue}
          setSelectedValue={setSelectedValue}
        />
      )}
    </Spin>
  );
}
export default ImageComponentModal;
