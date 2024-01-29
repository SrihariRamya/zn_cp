import { Modal, Select, Input, Row, Col, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { find, get, isEmpty } from 'lodash';
import { useComponentContext } from '../../../context/components';
import { categoryDefaultImage } from '../../../../../shared/image-helper';
import {
  IMAGE_ACTION_CATEGORY_LABEL,
  IMAGE_ACTION_CATEGORY_VALUE,
  IMAGE_ACTION_LIST,
  IMAGE_ACTION_PAGE_ERROR_MESSAGE,
  IMAGE_ACTION_PAGE_LABEL,
  IMAGE_ACTION_PAGE_VALUE,
  IMAGE_ACTION_PRODUCT_LABEL,
  IMAGE_ACTION_PRODUCT_VALUE,
  IMAGE_ACTION_SUB_CATEGORY_LABEL,
  IMAGE_ACTION_SUB_CATEGORY_VALUE,
} from '../../../../../shared/constant-values';

function ImageActionComponent(properties) {
  const {
    imageActionModal,
    setImageActionModal,
    subCategoryList,
    productList,
    categoryList,
    selectedValue,
    setSelectedValue,
  } = properties;

  const { updateImageSource, componentProperties } = useComponentContext();

  const [imageAction, setImageAction] = useState({
    label: IMAGE_ACTION_PAGE_LABEL,
    value: IMAGE_ACTION_PAGE_VALUE,
  });
  const [dropDownValue, setDropDownValue] = useState([]);
  const [actionValue, setActionValue] = useState({
    page: '',
    category: '',
    product: '',
    subCategory: '',
  });

  useEffect(() => {
    if (get(componentProperties, 'action.page', false)) {
      setImageAction({
        label: IMAGE_ACTION_PAGE_LABEL,
        value: IMAGE_ACTION_PAGE_VALUE,
      });
      setSelectedValue({
        page: get(componentProperties, 'action.page', ''),
        select: '',
      });
    } else if (get(componentProperties, 'action.product.uid', false)) {
      setDropDownValue(productList);
      setImageAction({
        label: IMAGE_ACTION_PRODUCT_LABEL,
        value: IMAGE_ACTION_PRODUCT_VALUE,
      });
      setSelectedValue({
        page: '',
        select: get(componentProperties, 'action.product.uid', ''),
      });
    } else if (get(componentProperties, 'action.category.uid', false)) {
      setDropDownValue(categoryList);
      setImageAction({
        label: IMAGE_ACTION_CATEGORY_LABEL,
        value: IMAGE_ACTION_CATEGORY_VALUE,
      });
      setSelectedValue({
        page: '',
        select: get(componentProperties, 'action.category.uid', ''),
      });
    } else if (get(componentProperties, 'action.subCategory.uid', false)) {
      setDropDownValue(subCategoryList);
      setImageAction({
        label: IMAGE_ACTION_SUB_CATEGORY_LABEL,
        value: IMAGE_ACTION_SUB_CATEGORY_VALUE,
      });
      setSelectedValue({
        page: '',
        select: get(componentProperties, 'action.subCategory.uid', ''),
      });
    }
  }, [componentProperties]);

  const onModalCancel = () => {
    setImageActionModal(false);
  };

  const handleOk = () => {
    if (
      actionValue.page ||
      actionValue.category ||
      actionValue.subCategory ||
      actionValue.product
    ) {
      updateImageSource({
        componentUid: get(componentProperties, 'componentUid', ''),
        value: get(componentProperties, 'value', ''),
        file: get(componentProperties, 'file', {}),
        action: actionValue,
      });
      setImageActionModal(false);
    } else {
      notification.error({
        message:
          imageAction.value === IMAGE_ACTION_PAGE_VALUE
            ? IMAGE_ACTION_PAGE_ERROR_MESSAGE
            : `Please select your ${imageAction?.value}`,
      });
    }
  };

  const handleImageAction = (value) => {
    setActionValue({
      page: '',
      category: '',
      product: '',
      subCategory: '',
    });
    setSelectedValue({
      page: '',
      select: '',
    });
    setDropDownValue([]);
    switch (value) {
      case IMAGE_ACTION_PAGE_VALUE: {
        setDropDownValue([]);
        setImageAction({
          label: IMAGE_ACTION_PAGE_LABEL,
          value,
        });
        break;
      }
      case IMAGE_ACTION_CATEGORY_VALUE: {
        setDropDownValue(categoryList);
        setImageAction({
          label: IMAGE_ACTION_CATEGORY_LABEL,
          value,
        });
        break;
      }
      case IMAGE_ACTION_SUB_CATEGORY_VALUE: {
        setDropDownValue(subCategoryList);
        setImageAction({
          label: IMAGE_ACTION_SUB_CATEGORY_LABEL,
          value,
        });
        break;
      }
      case IMAGE_ACTION_PRODUCT_VALUE: {
        setDropDownValue(productList);
        setImageAction({
          label: IMAGE_ACTION_PRODUCT_LABEL,
          value,
        });
        break;
      }
      default: {
        setImageAction({
          label: IMAGE_ACTION_PAGE_LABEL,
          value,
        });
        break;
      }
    }
  };

  const handleImageActionValue = (value) => {
    setSelectedValue({
      page: '',
      select: value,
    });
    switch (imageAction.value) {
      case IMAGE_ACTION_CATEGORY_VALUE: {
        const categoryValue = find(categoryList, (list) => {
          return list.uid === value;
        });
        setActionValue({
          page: '',
          category: categoryValue,
          product: '',
          subCategory: '',
        });
        break;
      }
      case IMAGE_ACTION_SUB_CATEGORY_VALUE: {
        const subCategoryValue = find(subCategoryList, (list) => {
          return list.uid === value;
        });
        setActionValue({
          page: '',
          category: '',
          product: '',
          subCategory: subCategoryValue,
        });
        break;
      }
      case IMAGE_ACTION_PRODUCT_VALUE: {
        const productValue = find(productList, (list) => {
          return list.uid === value;
        });
        setActionValue({
          page: '',
          category: '',
          product: productValue,
          subCategory: '',
        });
        break;
      }
      default: {
        setActionValue({
          page: '',
          category: '',
          product: '',
          subCategory: '',
        });
        break;
      }
    }
  };

  const handleInputOnchange = (event) => {
    setSelectedValue({
      page: event?.target?.value,
      select: '',
    });
    setActionValue({
      page: event?.target.value,
      category: '',
      product: '',
      subCategory: '',
    });
  };

  return (
    <Modal
      onCancel={onModalCancel}
      open={imageActionModal}
      onOk={handleOk}
      destroyOnClose
    >
      <div className="mt-10">
        <div>Select Action</div>
        <Select
          value={imageAction.value}
          placeholder="Select action"
          virtual={false}
          style={{ width: '100%' }}
          options={IMAGE_ACTION_LIST}
          onChange={handleImageAction}
        />
        <div className="mt-10">{imageAction.label}</div>
        {imageAction.value === IMAGE_ACTION_PAGE_VALUE ? (
          <Input onChange={handleInputOnchange} value={selectedValue.page} />
        ) : (
          <Select
            value={selectedValue.select}
            style={{ width: '100%' }}
            onChange={handleImageActionValue}
            virtual={false}
          >
            {dropDownValue.map((item) => {
              return (
                <Select.Option key={get(item, 'uid', '')}>
                  <Row align="middle" justify="space-between" gutter={[16, 16]}>
                    <Col>{get(item, 'name', '')}</Col>
                    <Col>
                      <img
                        alt={get(item, 'image', '')}
                        width="25px"
                        src={
                          isEmpty(get(item, 'image'))
                            ? categoryDefaultImage
                            : get(item, 'image')
                        }
                      />
                    </Col>
                  </Row>
                </Select.Option>
              );
            })}
          </Select>
        )}
      </div>
    </Modal>
  );
}
export default ImageActionComponent;
