/* eslint-disable camelcase */
import { filter, get, isArray } from 'lodash';
import React, { useState, useEffect } from 'react';
import AddCartActionButton from './button-template';
import { defaultImage } from '../../../shared/image-helper';

const APPEARANCE_TEMPLATE_NAME_1 = 'ONE';
const DEVICE_TYPE = 'WEB';

export const getImage = (productImage, web) => {
  let fiterImage;
  if (isArray(productImage)) {
    fiterImage = filter(productImage, (data) => data.image_source === web);
    return get(fiterImage, '[0].product_image', false) || defaultImage;
  }
  return productImage || defaultImage;
};

function productAddCart() {
  // Product add cart function
}

function productRemoveCart() {
  // Product remove cart function
}

const ButtonComp = ({ properties, dataSource }) => {
  const userData = {};
  const selectedstore = {};
  const dispatch = {};

  useEffect(() => {}, [dataSource.product_count]);
  const removeFromCart = (array, event) => {
    event.preventDefault();
    productRemoveCart(array, userData, selectedstore, dispatch);
  };
  const [addButton, setAddButton] = useState(true);

  const addToCart = (array, event) => {
    event.preventDefault();
    productAddCart(
      array,
      addButton,
      setAddButton,
      userData,
      selectedstore,
      dispatch
    );
  };
  const { column_properties } = properties;
  const { button } = column_properties;
  const {
    icon = '',
    btn_variant: button_variant = '',
    icon_position = '',
    width = '',
    color = '',
    backgroundColor = '',
    borderRadius = '',
    fontFamily = '',
    borderColor = '',
    borderWidth = '',
    btn_align: button_align = '',
  } = button;
  const buttonText = () => {
    if (
      Number(dataSource.stock) <= 0 &&
      dataSource.track_inventory &&
      button_variant
    ) {
      return 'No Stock';
    }
    if (
      Number(dataSource.stock) <= 0 &&
      dataSource.track_inventory &&
      !button_variant
    ) {
      return 'No Stock';
    }
    if (!button_variant) {
      return (
        <div>
          <span>
            {'  '}
            Add to Cart
          </span>
        </div>
      );
    }
    return <></>;
  };
  const flexDirection = () => {
    if (icon_position === 'left') return 'row';
    if (icon_position === 'right') return 'row-reverse';
    return 'row';
  };
  const marginButtonAlign = () => {
    if (button_align === 'left') return '0 auto 0 0';
    if (button_align === 'right') return '0 0 0 auto';
    return 'auto';
  };
  return (
    <>
      <AddCartActionButton
        icon={icon}
        buttonText={buttonText() || ''}
        template={{ template_name: APPEARANCE_TEMPLATE_NAME_1 }}
        buttonStyle={{
          flexDirection: flexDirection(),
          width,
          color,
          backgroundColor,
          borderRadius,
          fontFamily,
          borderColor,
          borderWidth,
          boxShadow: 'none',
          display: 'flex',
          margin: marginButtonAlign(),
        }}
        count={get(dataSource, 'product_count', 0)}
        product={{
          ...dataSource.currentVariant,
          product_name: get(dataSource, 'product_name', ''),
          product_uid: get(dataSource, 'product_uid', ''),
          product_count: get(dataSource, 'product_count', 0),
          product_image: getImage(
            get(dataSource, 'product_image', []),
            DEVICE_TYPE
          ),
          track_inventory: dataSource.track_inventory,
          product_status: dataSource.product_status,
        }}
        removeFromCart={removeFromCart}
        addToCart={addToCart}
      />
    </>
  );
};
export default ButtonComp;
