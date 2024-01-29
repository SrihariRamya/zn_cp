import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from 'react';
import {
  Form,
  Input,
  Switch,
  InputNumber,
  Modal,
  Row,
  Col,
  Button,
  Select,
  DatePicker,
  Space,
  Radio,
  notification,
  Spin,
  Tour,
} from 'antd';
import moment from 'moment';
import { get, map, includes, flatMap, filter, isEmpty } from 'lodash';
import { PercentageOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { TenantContext } from '../context/tenant-context';
import getFormItemRules from '../../shared/form-helpers';
import { getBase64 } from '../../shared/attributes-helper';
import {
  couponDiscountTypes,
  couponSelectOptions,
  couponUsageLimits,
} from '../../shared/function-helper';
import {
  getAllProductList,
  getExistingCouponProducts,
} from '../../utils/api/url-helper';
import ProductMapping from '../products/product-mapping';
import ImageUploadModal from '../products/image-modal';
import {
  COUPON_BY_VALUE_ERROR,
  COUPON_BY_PERCENTAGE_ERROR,
  COUPON_USAGE_LIMIT_INFO,
  MINIMUN_PURCHASE_INFO,
  COUPON_USER_LIMIT_INFO,
  MAXIMUM_DISCOUNT_INFO,
} from '../../shared/constant-values';
import { disabledPreviousDate } from '../../shared/date-helper';

import { MilestoneContext } from '../context/milestone-context';

const { Option } = Select;

const handleKeyDown = (event) => {
  const key = event.keyCode;
  if (key === 32 || key === 'Space') event.preventDefault();
};

const getKey = (type, item) => {
  if (type === 'Product') {
    return item.product_uid;
  }
  if (type === 'Category') {
    return item.category_uid;
  }
  if (type === 'Collection') {
    return item.collection_uid;
  }
  return '';
};

const labelCol = {
  span: 18,
};
const wrapperCol = {
  span: 6,
};

function CouponForm(properties) {
  const { TextArea } = Input;
  const {
    isEditVisible,
    updatedData,
    couponUpdate,
    onFinish,
    loading,
    handleCancel,
    setFileList,
    fileListState,
    setOpenTourModal,
    setCouponDiscount,
    couponDiscount,
    couponValidity,
    setCouponValidity,
    couponType,
    mappedProducts,
    setMappedProducts,
    productItems,
    categoryItems,
    form,
  } = properties;
  const [imgUrl, setImgUrl] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [targetSelection, setTargetSelection] = useState([]);
  const [productData, setProductData] = useState([]);
  const [tenantDetails] = useContext(TenantContext);
  const [existingProducts, setExistingProducts] = useState([]);
  const [loader, setLoader] = useState(false);
  const [isAddProducts, setIsAddProducts] = useState(false);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [openDropDown, setOpenDropDown] = useState(false);
  const [fileUploadCount, setFileUploadCount] = useState(0);
  const [metaArray, setMetaArray] = useState([]);
  const [uploadObject, setUploadObject] = useState([
    { id: 1, isDisable: true, url: '' },
  ]);
  const mobileView = useContext(TenantContext)[4];

  const [openTour, setOpenTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const formReference = useRef(null);
  const { fetchTourData } = useContext(MilestoneContext);

  const { currency_locale: currencyLocale } = get(tenantDetails, 'setting', {});
  const isProduct = targetSelection === 'Product';

  useEffect(() => {
    if (!isEmpty(updatedData)) {
      const selectedCollection = get(updatedData, 'target_selection', '');
      setTargetSelection(selectedCollection);
      const imageName = get(updatedData, 'image', '')
        ? get(updatedData, 'image', '').split('/')
        : '';
      setPreviewTitle(imageName && imageName.at(-1));
      updatedData.valid_till_user =
        get(updatedData, 'valid_till_user', 0) !== 0 &&
        get(updatedData, 'valid_till_user', 0);
      updatedData.start_date = moment(
        get(updatedData, 'start_date', '')
      ).isValid()
        ? moment(get(updatedData, 'start_date', ''))
        : '';
      updatedData.expiry_date = moment(
        get(updatedData, 'expiry_date', '')
      ).isValid()
        ? moment(get(updatedData, 'expiry_date', ''))
        : '';
      const existProducts = get(updatedData, 'coupon_products', []).map(
        (item) => get(item, 'product_coupon_uid', '')
      );
      if (selectedCollection === 'Product') {
        setMappedProducts(existProducts);
        const filterSelectedItems = filter(productItems, (item) =>
          existProducts.includes(item?.product_uid)
        );
        updatedData.selected_products = map(
          filterSelectedItems,
          (item) => item?.product_name
        );
      } else {
        const filterSelectedItems = filter(categoryItems, (item) =>
          existProducts.includes(item?.category_uid)
        );
        updatedData.selected_products = map(
          filterSelectedItems,
          (item) => item?.category_name
        );
      }
      map(uploadObject, (list) => {
        list.url = updatedData.image || '';
        return list;
      });

      form.setFieldsValue(updatedData);
    }
  }, []);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
      setPreviewTitle(
        file.name || file.url.slice(Math.max(0, file.url.lastIndexOf('/') + 1))
      );
    }
    setImgUrl(file.url || file.preview);
    setPreviewVisible(true);
  };

  const closeImage = () => {
    setPreviewVisible(false);
  };

  const handleChangeDiscount = (event) => {
    setCouponDiscount(get(event, 'target.value', ''));
  };

  const onChangeCouponValidity = (value) => {
    setCouponValidity(value);
  };

  const handleSelectChange = (value) => {
    setTargetSelection(value);
    form.setFieldsValue({
      selected_products: [],
    });
  };

  const tourData = async () => {
    const tourDataValues = await fetchTourData();
    const couponData = get(tourDataValues, 'data.[5]');
    const couponTourDatas = get(couponData, 'subGuide.[0]');
    const couponTourCompleted = get(couponTourDatas, 'completed');
    if (!mobileView) {
      setOpenTour(!couponTourCompleted);
    }
  };

  const fetchData = useCallback(() => {
    if (['Category'].includes(targetSelection)) {
      const parameters = {
        targetSelection,
        coupon_type: couponType,
      };
      const apiArray = [
        getAllProductList(parameters),
        getExistingCouponProducts(parameters),
      ];
      Promise.all(apiArray)
        .then((response) => {
          setProductData(get(response, '[0].data', []));
          const data = get(response, '[1].data', []);
          const couponProducts = map(data, (coupon) => coupon.coupon_products);
          const productCouponIds = flatMap(couponProducts, (coupon) =>
            map(coupon, (item) => item.product_coupon_uid)
          );
          setExistingProducts(productCouponIds);
          setLoader(false);
        })
        .catch((error) => {
          notification.error({ message: get(error, 'message', '') });
        });
    }
  }, [targetSelection, updatedData]);

  useEffect(() => {
    fetchData();
    tourData();
    setCouponDiscount('Percentage');
  }, [fetchData]);

  const filteredProductData = filter(
    productData,
    (item) => !includes(existingProducts, getKey(targetSelection, item))
  );

  const handleChangeProducts = (open) => {
    if (isProduct) {
      setOpenDropDown(open);
      setIsAddProducts(true);
    } else {
      setOpenDropDown(open);
      setIsAddProducts(false);
    }
  };

  const onCancel = () => {
    setIsAddProducts(false);
  };

  const addMappedProducts = (mappedProductsItems) => {
    setIsAddProducts(false);
    setMappedProducts(mappedProductsItems);
    const seletedItems = new Set([mappedProducts, ...mappedProductsItems]);
    const filterSelectedItems = filter(productItems, (item) =>
      seletedItems.has(item?.product_uid)
    );
    form.setFieldsValue({
      selected_products: map(filterSelectedItems, (item) => item?.product_name),
    });
  };

  const handleChange = (selectedOptions) => {
    if (['Product'].includes(targetSelection)) {
      const filterSelectedItems = filter(productItems, (item) =>
        selectedOptions.includes(item?.product_name)
      );
      const selectedproducts = map(
        filterSelectedItems,
        (item) => item?.product_uid
      );
      setMappedProducts(selectedproducts);
    } else {
      const filterSelectedItems = filter(categoryItems, (item) =>
        selectedOptions.includes(item?.category_name)
      );
      const selectedproducts = map(
        filterSelectedItems,
        (item) => item?.category_uid
      );
      setMappedProducts(selectedproducts);
    }
  };
  const validateEndDate = (_, value) => {
    const startDate = form.getFieldValue('start_date');
    if (value && startDate && value.isBefore(startDate)) {
      return Promise.reject(
        new Error('End date must be greater than start date')
      );
    }
    return Promise.resolve();
  };

  const productsProperties = {
    addMappedProducts,
    onCancel,
    isCoupon: true,
    isAddProducts,
    isRelatedProducts: false,
    productData,
    isOpenDrawer,
    setIsOpenDrawer,
    mappedProducts,
  };

  const errorMessage =
    couponDiscount === 'Percentage'
      ? COUPON_BY_PERCENTAGE_ERROR
      : COUPON_BY_VALUE_ERROR;

  const nextStepTour = () => {
    const stepCurrent = currentStep + 1;
    setCurrentStep(stepCurrent);
  };
  const handleSkip = () => {
    setOpenTour(false);
    setCurrentStep(0);
  };

  const previousStepTour = () => {
    const stepCurrent = currentStep - 1;
    setCurrentStep(stepCurrent);
  };

  const handleSave = () => {
    formReference.current.submit();
    setOpenTour(false);
  };

  const steps = [
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            &quot;Adding a store image is simple! You can import from{' '}
            <b style={{ color: '#0B3D60' }}>
              Facebook, Instagram, Google Photos,
            </b>{' '}
            or select images from your local file folder by clicking the
            respective option. If you don&apos;t have one, no worries; use{' '}
            <b style={{ color: '#0B3D60' }}>Adobe Express</b> to design your
            own.
          </span>
          <div className="milestone-footer-store mileStone-nonflex">
            <span className="footer-inner-left-span mileStone-flex-spaceBetween">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip for Now
              </Button>
              <Button type="primary" onClick={nextStepTour}>
                Next
              </Button>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.ant-upload-btn');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Generate a unique coupon code{' '}
            <b style={{ color: '#0B3D60' }}>
              to offer discounts or promotions.
            </b>{' '}
            Choose a code that&apos;s easy to remember and share with your
            customers.
          </span>
          <div className="milestone-footer-store mileStone-nonflex">
            <span className="footer-inner-left-span mileStone-flex-spaceBetween">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={previousStepTour}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '5px' }}
                  onClick={nextStepTour}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.coupon_code');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            limit coupon usage to &apos;Only Once&apos; for a single-use, keep
            it &apos;Unlimited&apos; for endless deals, or{' '}
            <b style={{ color: '#0B3D60' }}>
              {' '}
              customize usage limits to match your strategy.
            </b>
          </span>
          <div className="milestone-footer-store mileStone-nonflex">
            <span className="footer-inner-left-span mileStone-flex-spaceBetween">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={previousStepTour}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '5px' }}
                  onClick={nextStepTour}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.coupon_validity');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Set a <b style={{ color: '#0B3D60' }}>minimum purchase amount</b>{' '}
            for customers to redeem this coupon.
          </span>
          <div className="milestone-footer-store mileStone-nonflex">
            <span className="footer-inner-left-span mileStone-flex-spaceBetween">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={previousStepTour}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '5px' }}
                  onClick={nextStepTour}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.discount_offer');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            you can specify a{' '}
            <b style={{ color: '#0B3D60' }}>maximum discount amount.</b> This
            ensures the coupon is valid only for purchases up to a certain
            limit.
          </span>
          <div className="milestone-footer-store mileStone-nonflex">
            <span className="footer-inner-left-span mileStone-flex-spaceBetween">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={previousStepTour}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '5px' }}
                  onClick={nextStepTour}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.maximum_discount_amount');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Specify the{' '}
            <b style={{ color: '#0B3D60' }}>
              maximum discount amount for this coupon.
            </b>{' '}
            You can set it as a fixed value or a percentage of the total
            purchase.
          </span>
          <div className="milestone-footer-store mileStone-nonflex">
            <span className="footer-inner-left-span mileStone-flex-spaceBetween">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={previousStepTour}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '5px' }}
                  onClick={nextStepTour}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.discount_container');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Choose the start date for this coupon using the calendar. It&apos;s
            the{' '}
            <b style={{ color: '#0B3D60' }}>
              date when your coupon offer will be available to your customers.
            </b>
          </span>
          <div className="milestone-footer-store mileStone-nonflex">
            <span className="footer-inner-left-span mileStone-flex-spaceBetween">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={previousStepTour}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '5px' }}
                  onClick={nextStepTour}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.start_date');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Select the end date for this coupon using the calendar. This is when
            the <b style={{ color: '#0B3D60' }}>coupon offer will expire.</b>
          </span>
          <div className="milestone-footer-store mileStone-nonflex">
            <span className="footer-inner-left-span mileStone-flex-spaceBetween">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={previousStepTour}>Previous</Button>
                <Button
                  style={{ marginLeft: '10px' }}
                  type="primary"
                  onClick={handleSave}
                >
                  Save
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.expiry_date');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
  ];

  return (
    <Spin spinning={loader}>
      <Form
        ref={formReference}
        name="form_in_modal"
        form={form}
        layout="vertical"
        onFinish={isEditVisible ? couponUpdate : onFinish}
        onFinishFailed={() => setOpenTourModal(false)}
        className="coupon-form"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Row>
              <Col span={7}>
                <Form.Item>
                  <ImageUploadModal
                    item={uploadObject}
                    uploadObject={uploadObject}
                    setUploadObject={setUploadObject}
                    metaArray={metaArray}
                    setMetaArray={setMetaArray}
                    mobileView={mobileView}
                    visibility="image-only"
                    setFileList={setFileList}
                    handlePreview={handlePreview}
                    setFileUploadCount={setFileUploadCount}
                    fileListState={fileListState}
                    fileUploadCount={fileUploadCount}
                    width={177}
                    height={145}
                    setOpenTourModal={setOpenTour}
                    openTourModal={openTour}
                    setCurrentStep={setCurrentStep}
                  />
                </Form.Item>
              </Col>
              <Col span={17}>
                <Form.Item name="description" className="coupon-desc">
                  <TextArea
                    style={{ height: '165px' }}
                    placeholder="Enter your coupon description here"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  name="is_active"
                  label="Show coupon to customers"
                  labelCol={labelCol}
                  wrapperCol={wrapperCol}
                  className="coupon-access"
                >
                  <Switch
                    className="switch-container"
                    defaultChecked={updatedData.is_active}
                  />
                </Form.Item>
              </Col>
              <Col span={12} className="text-align-right">
                <Form.Item
                  name="is_online_payment"
                  label="Valid only for online payments"
                  labelCol={labelCol}
                  wrapperCol={wrapperCol}
                  className="coupon-access"
                >
                  <Switch
                    className="switch-container"
                    defaultChecked={updatedData.is_online_payment}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row className="coupon-form-row">
              <Col span={12}>
                <Form.Item
                  className="coupon_code"
                  name="coupon_code"
                  label="Coupon code"
                  preserve
                  rules={[
                    {
                      required: true,
                      message: 'Enter Coupon Code',
                    },
                    ...getFormItemRules({
                      alphanumeric: true,
                    }),
                  ]}
                >
                  <Input
                    className="two"
                    placeholder="Enter Coupon Code"
                    style={{ width: '86%' }}
                    onKeyDown={handleKeyDown}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  className="coupon_validity"
                  label="Coupon usage limit"
                  name="coupon_validity"
                  tooltip={{
                    title: COUPON_USAGE_LIMIT_INFO,
                    icon: <InfoCircleOutlined />,
                  }}
                  rules={[
                    {
                      required: true,
                      message: 'Please select coupon usage limit',
                    },
                  ]}
                >
                  <Select
                    style={{ width: '86%' }}
                    placeholder="Select coupon usage limit"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase()) === true
                    }
                    options={couponUsageLimits}
                    getPopupContainer={(triggerNode) =>
                      triggerNode.parentElement
                    }
                    onChange={onChangeCouponValidity}
                    className="product-select"
                  />
                </Form.Item>
              </Col>
              {couponValidity === 'Number of times' && (
                <Col span={12}>
                  <Form.Item
                    label="Custom coupon usage limit"
                    name="number_of_times"
                    rules={[
                      {
                        validator: (_, value) =>
                          value
                            ? Promise.resolve()
                            : Promise.reject(
                                new Error('Enter Number of times')
                              ),
                      },
                      ...getFormItemRules({
                        positiveNumber: true,
                        maxLength: 6,
                        error: 'Number of times',
                      }),
                    ]}
                  >
                    <InputNumber
                      placeholder="Please enter number of times"
                      style={{ width: '86%' }}
                    />
                  </Form.Item>
                </Col>
              )}
              {includes(['coupon-on-specific'], couponType) && (
                <>
                  <Col span={12}>
                    <Form.Item
                      name="target_selection"
                      label="Select category / product"
                      rules={[
                        {
                          required: true,
                          message: 'Please select specific product/ category',
                        },
                      ]}
                    >
                      <Select
                        style={{ width: '86%' }}
                        placeholder="Select"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .includes(input.toLowerCase()) === true
                        }
                        options={couponSelectOptions}
                        getPopupContainer={(triggerNode) =>
                          triggerNode.parentElement
                        }
                        onChange={handleSelectChange}
                        disabled={isEditVisible}
                        className="product-select"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        targetSelection === 'Category'
                          ? 'Select category'
                          : 'Select product'
                      }
                      name="selected_products"
                      rules={[
                        {
                          required: true,
                          message: 'Please select products',
                        },
                      ]}
                      className="product-select"
                    >
                      <Select
                        virtual={false}
                        mode="multiple"
                        style={{ width: '86%' }}
                        className="store-tags-select"
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .includes(input.toLowerCase()) === true
                        }
                        placeholder="Select"
                        getPopupContainer={(triggerNode) =>
                          triggerNode.parentElement
                        }
                        onChange={handleChange}
                        onDropdownVisibleChange={handleChangeProducts}
                        open={openDropDown && !isProduct}
                      >
                        {!isProduct &&
                          map(filteredProductData, (item) => (
                            <Option
                              key={item.category_uid}
                              value={
                                {
                                  Category: item.category_name,
                                }[targetSelection] || ''
                              }
                            >
                              {{
                                Category: item.category_name,
                              }[targetSelection] || ''}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </>
              )}
              <Col span={12}>
                <Form.Item
                  className="discount_offer"
                  label="Minimum purchase"
                  tooltip={{
                    title: MINIMUN_PURCHASE_INFO,
                    icon: <InfoCircleOutlined />,
                  }}
                  name="discount_offer"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter discount Offer',
                    },
                    ...getFormItemRules({
                      positiveNumber: true,
                      maxLength: 6,
                      error: 'Discount Offer',
                    }),
                  ]}
                >
                  <InputNumber
                    className="six"
                    style={{ width: '86%' }}
                    placeholder="₹ Enter amount"
                  />
                </Form.Item>
              </Col>
              {!includes('free-shipping', couponType) && (
                <Col span={12}>
                  <Form.Item
                    className="maximum_discount_amount"
                    label="Maximum discount"
                    name="maximum_discount_amount"
                    tooltip={{
                      title: MAXIMUM_DISCOUNT_INFO,
                      icon: <InfoCircleOutlined />,
                    }}
                    rules={[
                      {
                        required: true,
                        message: 'Please enter maximum discount amount',
                      },
                      ...getFormItemRules({
                        positiveNumber: true,
                        maxLength: 6,
                        error: 'Maximum discount amount',
                      }),
                    ]}
                  >
                    <InputNumber
                      className="six"
                      style={{ width: '86%' }}
                      formatter={(value) => {
                        return value
                          ? ` ${new Intl.NumberFormat(currencyLocale).format(
                              value
                            )}`
                          : undefined;
                      }}
                      placeholder="Maximum Discount Amount"
                    />
                  </Form.Item>
                </Col>
              )}
              <Row className="discount_container">
                {!includes('free-shipping', couponType) && (
                  <Col span={12}>
                    <Form.Item
                      name="coupon_discount_type"
                      className="coupon-radio-btn"
                      label="Discount amount"
                    >
                      <Radio.Group
                        onChange={handleChangeDiscount}
                        value={couponDiscount}
                        className="mb-10p"
                        defaultValue="Percentage"
                      >
                        {map(couponDiscountTypes, (item) => (
                          <Radio value={item.value}>{item.label}</Radio>
                        ))}
                      </Radio.Group>
                    </Form.Item>
                    {includes(['Percentage', 'Value'], couponDiscount) && (
                      <Form.Item
                        name="coupon_percentage"
                        rules={[
                          {
                            validator: (_, value) =>
                              value
                                ? Promise.resolve()
                                : Promise.reject(new Error(errorMessage)),
                          },
                          ...getFormItemRules(
                            couponDiscount === 'Percentage'
                              ? {
                                  number: true,
                                  positiveNumber: true,
                                  minMax: true,
                                }
                              : {
                                  positiveNumber: true,
                                  maxLength: 6,
                                  error: 'Coupon by value',
                                }
                          ),
                        ]}
                      >
                        {couponDiscount === 'Percentage' ? (
                          <InputNumber
                            style={{ width: '86%' }}
                            className="discount-input"
                            precision={2}
                            step={0.1}
                            placeholder="Enter Percentage %"
                            suffix={
                              <PercentageOutlined className="site-form-item-icon" />
                            }
                          />
                        ) : (
                          <InputNumber
                            className="discount-input"
                            placeholder="Enter Value"
                            style={{ width: '86%' }}
                          />
                        )}
                      </Form.Item>
                    )}
                  </Col>
                )}
                <Col span={12}>
                  <Form.Item
                    name="valid_till_user"
                    label="Coupon user limit"
                    tooltip={{
                      title: COUPON_USER_LIMIT_INFO,
                      icon: <InfoCircleOutlined />,
                    }}
                    rules={[
                      {
                        required: true,
                        message: 'Please enter coupon user limit',
                      },
                      ...getFormItemRules({
                        positiveNumber: true,
                        maxLength: 6,
                        error: 'Coupon user limit',
                      }),
                    ]}
                  >
                    <InputNumber
                      style={{ width: '86%' }}
                      placeholder="Enter coupon user limit"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Col span={12}>
                <Form.Item
                  className="start_date"
                  label="Start date & time"
                  name="start_date"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter start date',
                    },
                  ]}
                >
                  <DatePicker
                    disabledDate={disabledPreviousDate}
                    showTime
                    style={{ width: '86%', height: '40px' }}
                    placeholder="Select start date & time "
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  className="expiry_date"
                  label="End date & time"
                  name="expiry_date"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter expiry date',
                    },
                    { validator: validateEndDate },
                  ]}
                >
                  <DatePicker
                    showTime
                    style={{ width: '86%', height: '40px' }}
                    placeholder="Select End date & time "
                    disabledDate={disabledPreviousDate}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row className="coupon-form-btns">
              <Col className="r-17p">
                <Form.Item>
                  <Space className="f_btns">
                    <Button type="default" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      loading={loading}
                      htmlType="submit"
                      type="primary"
                      id="save-coupon-btn"
                    >
                      save
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
      <Tour
        open={openTour}
        onClose={() => setOpenTour(false)}
        steps={steps}
        current={currentStep}
        placement="bottomLeft"
      />
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={false}
        onCancel={closeImage}
      >
        <img alt={previewTitle} style={{ width: '100%' }} src={imgUrl} />
      </Modal>
      {isAddProducts && <ProductMapping {...productsProperties} />}
    </Spin>
  );
}

export default CouponForm;
