import React, { useState } from 'react';
import { get, map } from 'lodash';
import { notification } from 'antd/lib';
import { CloseOutlined } from '@ant-design/icons';
import { Row, Col, Form, Checkbox, Input, Button, Select } from 'antd';
import {
  CATEGORY_ADD_FAILED,
  CATEGORY_ADD_SUCCESS,
  SUB_CATEGORY_ADD_FAILED,
  SUB_CATEGORY_ADD_SUCCESS,
} from '../../shared/constant-values';
import { createCategory, createSubCategory } from '../../utils/api/url-helper';
import { ReactComponent as BackIcon } from '../../assets/icons/back-icon.svg';

const { Option } = Select;

function AddCategory(properties) {
  const {
    handleAddCategoryCancel,
    setAddCategoryModal,
    categoryList,
    fetchCategory,
    setOpenTourModal,
    setCloseTourModal,
    closeTourModal,
  } = properties;

  const [category, setCategory] = useState(true);
  const [form] = Form.useForm();

  const handleClickSubCatgory = (event) => {
    if (get(event, 'target.checked', '') === true) {
      setCategory(false);
      fetchCategory();
    } else {
      setCategory(true);
    }
  };

  const onFinishCategory = (values) => {
    const { categoryName } = values;
    const categoryObject = {
      attribute: '[]',
      category_name: categoryName,
    };
    const file = {
      files: [],
    };
    Promise.all([createCategory(categoryObject, file)])
      .then((response) => {
        const { data } = response[0];
        if (data.success) {
          if (closeTourModal) {
            setOpenTourModal(true);
            setCloseTourModal(false);
          }
          notification.success({ message: CATEGORY_ADD_SUCCESS });
          setAddCategoryModal(false);
          fetchCategory();
          form.resetFields();
        } else {
          notification.error({
            message: get(data, 'error', CATEGORY_ADD_FAILED),
          });
        }
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'error', CATEGORY_ADD_FAILED),
        });
      });
  };

  const onFinishSubCategory = (values) => {
    const { categoryID, subCategoryName } = values;
    const subCategoryList = {
      attribute: [],
      category_uid: categoryID,
      sub_category_name: subCategoryName,
    };
    createSubCategory(subCategoryList)
      .then((response) => {
        if (response.data) {
          if (closeTourModal) {
            setOpenTourModal(true);
            setCloseTourModal(false);
          }
          notification.success({ message: SUB_CATEGORY_ADD_SUCCESS });
          setAddCategoryModal(false);
          fetchCategory();
          form.resetFields();
        } else {
          notification.error({ message: SUB_CATEGORY_ADD_FAILED });
        }
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'error', SUB_CATEGORY_ADD_FAILED),
        });
      });
  };

  const onFinish = (value) => {
    if (category) {
      onFinishCategory(value);
    } else {
      onFinishSubCategory(value);
    }
  };
  return (
    <div>
      <Row>
        <Col span={12}>
          <div className="flex-start">
            <BackIcon onClick={handleAddCategoryCancel} cursor="pointer" />
            <p
              className="ml-10 add-category-heading"
              style={{ whiteSpace: 'nowrap' }}
            >
              {category ? 'Add new category' : 'Add new subcategory'}
            </p>
          </div>
        </Col>
        <Col span={12}>
          <div className="flex-end">
            <CloseOutlined
              onClick={handleAddCategoryCancel}
              style={{ color: 'red' }}
            />
          </div>
        </Col>
      </Row>
      <div className="mt-10">
        <Form onFinish={onFinish} form={form}>
          {category ? (
            <div className="zupain-form">
              <div id="category-name-text">
                <Form.Item
                  label="Category"
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  name="categoryName"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter Category',
                    },
                  ]}
                >
                  <Input placeholder="Enter Category" />
                </Form.Item>
              </div>
            </div>
          ) : (
            <div>
              <Form.Item
                label="Category"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                name="categoryID"
                rules={[
                  {
                    required: true,
                    message: 'Please enter categories',
                  },
                ]}
              >
                <Select
                  placeholder="Please select a category"
                  allowClear
                  virtual={false}
                  className="select-height"
                >
                  {map(categoryList, (categoryName) => (
                    <Option
                      key={get(categoryName, 'category_uid', '')}
                      value={get(categoryName, 'category_uid', '')}
                    >
                      {get(categoryName, 'category_name', '')}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Sub Category"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                name="subCategoryName"
                rules={[
                  {
                    required: true,
                    message: 'Please enter Sub-Category!',
                  },
                ]}
              >
                <Input placeholder="Enter Sub Category" />
              </Form.Item>
            </div>
          )}
          <Form.Item className="flex-center">
            <Checkbox onChange={handleClickSubCatgory}>
              Add as Sub category
            </Checkbox>
          </Form.Item>
          <div className="flex-center">
            <Button
              className={category ? 'create-cate-btn' : 'create-subcate-btn'}
              htmlType="submit"
            >
              {category ? 'Create Category' : 'Create Sub Category'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default AddCategory;
