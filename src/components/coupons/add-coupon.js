import React, { useState, useContext } from 'react';
import {
  Form,
  Spin,
  notification,
  Breadcrumb,
  Space,
  Row,
  Col,
  Typography,
} from 'antd';
import { get, map, includes, filter } from 'lodash';
import { createCoupon, updateCoupon } from '../../utils/api/url-helper';
import {
  COUPON_ADD_FAILED,
  COUPON_UPDATE_FAILED,
  COUPON_ALREADY_EXIST,
  MAXIMUM_DISCOUNT_ERROR,
  DISCOUNT_OFFER_ERROR,
} from '../../shared/constant-values';
import CouponForm from './coupon-form';
import { trimPayloadFields } from '../../shared/form-helpers';
import { extractDate } from '../../shared/date-helper';
import { ReactComponent as BackArrow } from '../../assets/icons/back-arrow-icon.svg';

import { MilestoneContext } from '../context/milestone-context';

const { Text } = Typography;
function Create(properties) {
  const {
    openTourModal,
    setOpenTourModal,
    handleOk,
    handleCancel,
    isEditVisible,
    updatedData,
    setCouponDiscount,
    couponDiscount,
    couponValidity,
    setCouponValidity,
    couponTypeId,
    couponType,
    couponTypeTitle,
    existCouponProducts,
    setIsVisible,
    productItems,
    categoryItems,
    setIsModalOpen,
    fileListState,
    setFileList,
    setCompleteModal,
  } = properties;
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [mappedProducts, setMappedProducts] = useState([]);

  const { fetchTourData } = useContext(MilestoneContext);

  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const {
      coupon_discount_type: couponDiscountType,
      maximum_discount_amount: maximumDiscountDmount,
      discount_offer: discountOffer,
      coupon_percentage: couponPercentage,
      image,
    } = values;
    const startDate = extractDate(get(values, 'start_date', ''));
    const expiryDate = extractDate(get(values, 'expiry_date', ''));
    const file = {
      files: map(fileListState, (item) => item.originFileObj),
    };
    values.expiry_date = expiryDate;
    values.start_date = startDate;
    values.coupon_type = couponType;
    values.image = typeof image === 'string' ? image : '';
    values.is_active = true;
    values.selected_products = mappedProducts;
    const trimFormValues = {};
    trimPayloadFields(values, trimFormValues);
    if (
      couponDiscountType === 'Value' &&
      maximumDiscountDmount <= couponPercentage
    ) {
      form.setFields([
        {
          name: 'maximum_discount_amount',
          errors: [MAXIMUM_DISCOUNT_ERROR],
        },
      ]);
    } else if (discountOffer <= maximumDiscountDmount) {
      form.setFields([
        {
          name: 'discount_offer',
          errors: [DISCOUNT_OFFER_ERROR],
        },
      ]);
    } else {
      const tourDataValues = await fetchTourData();
      const couponData = get(tourDataValues, 'data.[5]');
      const couponTourDatas = get(couponData, 'subGuide.[0]');
      const couponTourCompleted = get(couponTourDatas, 'completed');
      setLoading(true);
      createCoupon(trimFormValues, file)
        .then((response) => {
          const { success } = get(response, 'data', false);
          if (success) {
            if (couponTourCompleted) {
              setIsModalOpen(true);
            } else {
              setCompleteModal(true);
              setTimeout(() => {
                setCompleteModal(false);
              }, 4000);
            }
            form.resetFields();
            setLoading(false);
            setCouponDiscount('');
            setCouponValidity('');
            setIsVisible(false);
            setFileList([]);
            handleOk();
          } else {
            setIsModalOpen(false);
            setLoading(false);
            notification.error({
              message: get(response, 'data.error', '') || COUPON_ALREADY_EXIST,
            });
          }
        })
        .catch((error) => {
          setIsModalOpen(false);
          notification.error({
            message: get(error, 'error', COUPON_ADD_FAILED),
          });
          setLoading(false);
          handleOk();
        });
    }
  };

  const couponUpdate = (values) => {
    const {
      coupon_discount_type: couponDiscountType,
      maximum_discount_amount: maximumDiscountDmount,
      discount_offer: discountOffer,
      coupon_percentage: couponPercentage,
      image,
    } = values;
    const startDate = extractDate(get(values, 'start_date', ''));
    const expiryDate = extractDate(get(values, 'expiry_date', ''));
    const file = {
      files: map(fileListState, (item) => item.originFileObj),
    };
    const validCouponType = ['coupon-on-specific', 'free-shipping'];
    let newCouponProducts;
    let deletedCouponProducts;
    if (includes(validCouponType, couponType)) {
      const existingProducts = filter(mappedProducts, (x) =>
        includes(existCouponProducts, x)
      );
      newCouponProducts = filter(
        mappedProducts,
        (x) => !includes(existCouponProducts, x)
      );
      deletedCouponProducts = filter(
        existCouponProducts,
        (x) => !includes(existingProducts, x)
      );
    }
    values.expiry_date = expiryDate;
    values.start_date = startDate;
    values.coupon_type = couponType;
    values.image = typeof image === 'string' ? image : '';
    values.selected_products = JSON.stringify(newCouponProducts) || [];
    values.deleted_coupon_products =
      JSON.stringify(deletedCouponProducts) || [];
    values.coupon_id = updatedData.coupon_id;
    const trimFormValues = {};
    trimPayloadFields(values, trimFormValues);
    if (
      couponDiscountType === 'Value' &&
      maximumDiscountDmount <= couponPercentage
    ) {
      form.setFields([
        {
          name: 'maximum_discount_amount',
          errors: [MAXIMUM_DISCOUNT_ERROR],
        },
      ]);
    } else if (discountOffer <= maximumDiscountDmount) {
      form.setFields([
        {
          name: 'discount_offer',
          errors: [DISCOUNT_OFFER_ERROR],
        },
      ]);
    } else {
      setLoading(true);
      updateCoupon(trimFormValues, file, updatedData.coupon_uid)
        .then((response) => {
          if (response.success) {
            setIsModalOpen(true);
            form.resetFields();
            setLoading(false);
            setFileList([]);
            setIsVisible(false);
            handleOk();
          } else {
            setLoading(true);
            setIsModalOpen(false);
            notification.error({
              message: get(response, 'error', COUPON_ALREADY_EXIST),
            });
          }
        })
        .catch((error) => {
          setIsModalOpen(false);
          notification.error({
            message: get(error, 'error', COUPON_UPDATE_FAILED),
          });
          setLoading(false);
        });
    }
  };

  const couponFormProperties = {
    onFinish,
    couponUpdate,
    isEditVisible,
    loading,
    handleCancel,
    updatedData,
    setFileList,
    fileListState,
    openTourModal,
    setOpenTourModal,
    couponDiscount,
    setCouponDiscount,
    couponValidity,
    setCouponValidity,
    couponTypeId,
    couponType,
    setSelectedProducts,
    selectedProducts,
    mappedProducts,
    setMappedProducts,
    productItems,
    categoryItems,
    form,
  };

  return (
    <div>
      <Spin spinning={loading}>
        <div>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <Row>
                  <Col className="mt-2p cursor-pointer">
                    <BackArrow
                      onClick={() => {
                        setIsVisible(false);
                      }}
                    />
                  </Col>
                  <Col>
                    <Text className="coupon-form-title">{couponTypeTitle}</Text>
                  </Col>
                </Row>
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>{' '}
        </div>
        <CouponForm {...couponFormProperties} />
      </Spin>
    </div>
  );
}

export default Create;
