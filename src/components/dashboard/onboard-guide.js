import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './setup.less';
import {
  Spin,
  Button,
  Typography,
  Row,
  Col,
  Divider,
  Steps,
  Tour,
  Modal,
  Tooltip,
} from 'antd';
import { filter, forEach, get, has, map } from 'lodash';
import {
  LeftOutlined,
  QuestionCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  getOnboardGuide,
  getSubGuideOnboard,
  putOnboardSubGuide,
} from '../../utils/api/url-helper';
import { ReactComponent as TickIcon } from '../../assets/icons/tick-circle.svg';
import { withRouter } from '../../utils/react-router/index';
import { ReactComponent as Rocket } from '../../assets/rocket-emj.svg';

const { Step } = Steps;
const { Text } = Typography;
const handleTabButtonClip = (data) => {
  if (data === 1) {
    return 'setup-maintab-button setup-tab-first';
  }
  if (data > 1 && data < 6) {
    return 'setup-maintab-button setup-tab-middle';
  }
  if (data === 6) {
    return 'setup-maintab-button setup-tab-last';
  }
  return '';
};
function OnBoardGuide(guideProperties) {
  const { setOnboardTotal, mobileView } = guideProperties;
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [onGuideData, setOnGuideData] = useState([]);
  const [activeSteps, setActiveSteps] = useState(1);
  const [activeColor, setActiveColor] = useState(true);
  const [open, setOpen] = useState(false);
  const [isopenModal, setIsopenModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [incompleteTourData, setIncompleteTourData] = useState(0);

  const [storeComplete, setStoreComplete] = useState(false);
  const [policyComplete, setPolicyComplete] = useState(false);
  const [categoryComplete, setCategoryComplete] = useState(false);
  const [productComplete, setProductComplete] = useState(false);
  const [bulkUploadComplete, setBulkUploadComplete] = useState(false);
  const [shipmentComplete, setShipmentComplete] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [couponComplete, setCouponComplete] = useState(false);

  const TourStart = (values) => {
    const storeSubGuide = get(values, '[0].subGuide', '');
    const productSubGuide = get(values, '[2].subGuide', '');
    const orderSubGuide = get(values, '[4].subGuide', '');
    const createCoupon = get(values, '[5].subGuide', '');
    const createStore = get(storeSubGuide, '[0].completed', '');
    const AddStore = get(storeSubGuide, '[1].completed', '');
    const AddCategories = get(productSubGuide, '[0].completed', '');

    const AddProduct = get(productSubGuide, '[1].completed', '');
    const BulkUpload = get(productSubGuide, '[2].completed', '');

    const shippingPartner = get(orderSubGuide, '[0].completed', '');
    const addPayments = get(orderSubGuide, '[1].completed', '');
    const coupon = get(createCoupon, '[0].completed', '');
    switch (false) {
      case createStore: {
        setOpen(true);
        break;
      }
      case AddStore: {
        setOpen(true);
        break;
      }
      case AddCategories: {
        setActiveSteps(3);
        setOpen(true);
        break;
      }
      case AddProduct: {
        setActiveSteps(3);
        setOpen(true);
        break;
      }
      case BulkUpload: {
        setActiveSteps(3);
        setOpen(true);
        break;
      }
      case shippingPartner: {
        setActiveSteps(5);
        setOpen(true);
        break;
      }
      case addPayments: {
        setActiveSteps(5);
        setOpen(true);
        break;
      }
      case coupon: {
        setActiveSteps(6);
        setOpen(true);
        break;
      }
      default: {
        setOpen(false);
      }
    }
    if (values && window.innerWidth > 700) {
      switch (currentStep) {
        case 1: {
          const setupFirstButton = document.querySelector('.storeButton');
          setupFirstButton.classList.add('zIndextour');
          break;
        }
        case 2:
        case 3:
        case 4: {
          const setupFirstButton = document.querySelector('.productButton');
          setupFirstButton.classList.add('zIndextour');
          break;
        }
        case 5:
        case 6: {
          const setupFirstButton = document.querySelector('.shipmentButton');
          setupFirstButton.classList.add('zIndextour');
          break;
        }
        default:
      }
    }
  };

  useEffect(() => {
    const hasModalBeenShown = localStorage.getItem('hasModalBeenShown');
    let checkState = false;
    if (hasModalBeenShown === 'true') {
      checkState = true;
      setIsopenModal(false);
    }
    getOnboardGuide().then((data) => {
      const guideData = get(data, 'data', []);
      const storeSubGuide = get(guideData, '[0].subGuide', '');
      const createStore = get(storeSubGuide, '[0].completed', '');
      const AddStore = get(storeSubGuide, '[1].completed', '');
      if (
        createStore === false &&
        AddStore === false &&
        checkState === false &&
        mobileView === false &&
        open === false
      ) {
        setIsopenModal(true);
      } else if (guideData && !mobileView && !checkState) {
        TourStart(guideData);
      }
      setLoading(false);
      setOnGuideData(guideData);

      const incompletedDataLength = guideData.map(
        (item) => item.subGuide.filter((items) => !items.completed).length
      );
      setOnboardTotal(
        Number.parseInt(
          (100 / guideData.length) *
            incompletedDataLength.filter((item) => !item).length,
          10
        )
      );
    });
  }, []);

  useEffect(() => {
    if (open) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [open]);

  useEffect(() => {
    getSubGuideOnboard().then((data) => {
      const tourValues = get(data, 'data');
      const excludedValues = new Set([
        'orders',
        'footer',
        'appearance',
        'profile',
      ]);
      const incompleteTourValues = filter(tourValues, (item) => {
        return !item.completed && !has(excludedValues, get(item, 'slug'));
      });
      setIncompleteTourData(incompleteTourValues);
      // eslint-disable-next-line unicorn/no-array-for-each
      forEach(incompleteTourValues, (item) => {
        switch (item.slug) {
          case 'store': {
            setStoreComplete(true);
            break;
          }
          case 'policy': {
            setPolicyComplete(true);
            break;
          }
          case 'category': {
            setCategoryComplete(true);
            break;
          }
          case 'product': {
            setProductComplete(true);
            break;
          }
          case 'bulk-product': {
            setBulkUploadComplete(true);
            break;
          }
          case 'shipment': {
            setShipmentComplete(true);
            break;
          }
          case 'payment': {
            setPaymentComplete(true);
            break;
          }
          case 'coupon': {
            setCouponComplete(true);
            break;
          }
          default: {
            break;
          }
        }
      });
    });
  }, [open]);

  const handleSkip = (values) => {
    localStorage.setItem('hasModalBeenShown', true);
    if (values === 'self-ship' && open) {
      putOnboardSubGuide({
        completed: true,
        slug: 'shipment',
      });
    } else if (values === 'coupon-skip' && open) {
      putOnboardSubGuide({
        completed: true,
        slug: 'coupon',
      });
    }
    setIsopenModal(false);
    setOpen(false);
    if (window.innerWidth > 700 && currentStep === 0) {
      const setupFirstButton = document.querySelector('.setup-tab-first');
      setupFirstButton.classList.remove('zIndextour');
    }
  };

  const reference1 = useRef(null);
  const reference2 = useRef(null);
  const reference3 = useRef(null);
  const reference4 = useRef(null);
  const reference5 = useRef(null);
  const reference6 = useRef(null);
  const reference7 = useRef(null);
  const reference8 = useRef(null);

  const generateStep = (completed, description, target) => {
    return completed
      ? {
          title: '',
          description: (
            <div className="milestone-description">{description}</div>
          ),
          target,
        }
      : // eslint-disable-next-line unicorn/no-null
        null;
  };

  const handleNextTour = (values) => {
    if (values === 'store-next') {
      if (policyComplete) {
        const setStep = currentStep + 1;
        setCurrentStep(setStep);
        return;
      }
      if (categoryComplete || productComplete || bulkUploadComplete) {
        setActiveSteps(3);
      } else if (shipmentComplete || paymentComplete) {
        setActiveSteps(5);
      } else if (couponComplete) {
        setActiveSteps(6);
      }
    }
    if (values === 'policy-next') {
      if (categoryComplete || productComplete || bulkUploadComplete) {
        setActiveSteps(3);
      } else if (shipmentComplete || paymentComplete) {
        setActiveSteps(5);
      } else if (couponComplete) {
        setActiveSteps(6);
      }
    }
    if (values === 'category-next') {
      if (productComplete || bulkUploadComplete) {
        const setStep = currentStep + 1;
        setCurrentStep(setStep);
        return;
      }
      if (shipmentComplete || paymentComplete) {
        setActiveSteps(5);
      } else if (couponComplete) {
        setActiveSteps(6);
      }
    }
    if (values === 'product-next') {
      if (bulkUploadComplete) {
        const setStep = currentStep + 1;
        setCurrentStep(setStep);
        return;
      }
      if (shipmentComplete || paymentComplete) {
        setActiveSteps(5);
      } else if (couponComplete) {
        setActiveSteps(6);
      }
    }
    if (values === 'bulk-next') {
      if (shipmentComplete || paymentComplete) {
        setActiveSteps(5);
      } else if (couponComplete) {
        setActiveSteps(6);
      }
    }
    if (values === 'shipment-next') {
      if (paymentComplete) {
        const setStep = currentStep + 1;
        setCurrentStep(setStep);
        return;
      }
      if (couponComplete) {
        setActiveSteps(6);
      }
    }
    if (values === 'payment-next' && couponComplete) {
      setActiveSteps(6);
    }
    const setStep = currentStep + 1;
    setCurrentStep(setStep);
  };

  const handlePreviousTour = (values) => {
    if (values === 'policy-previous' && storeComplete) {
      const setStep = currentStep - 1;
      setCurrentStep(setStep);
      return;
    }
    if (values === 'category-previous' && (storeComplete || policyComplete)) {
      setActiveSteps(1);
      const setStep = currentStep - 1;
      setCurrentStep(setStep);
      return;
    }
    if (values === 'product-previous') {
      if (categoryComplete) {
        const setStep = currentStep - 1;
        setCurrentStep(setStep);
        return;
      }
      if (storeComplete || policyComplete) {
        setActiveSteps(1);
        const setStep = currentStep - 1;
        setCurrentStep(setStep);
        return;
      }
    }
    if (values === 'bulk-previous') {
      if (productComplete || categoryComplete) {
        const setStep = currentStep - 1;
        setCurrentStep(setStep);
        return;
      }
      if (storeComplete || policyComplete) {
        setActiveSteps(1);
        const setStep = currentStep - 1;
        setCurrentStep(setStep);
        return;
      }
    }
    if (values === 'shipment-previous') {
      if (productComplete || bulkUploadComplete || categoryComplete) {
        setActiveSteps(3);
        const setStep = currentStep - 1;
        setCurrentStep(setStep);
        return;
      }
      if (storeComplete || policyComplete) {
        setActiveSteps(1);
        const setStep = currentStep - 1;
        setCurrentStep(setStep);
        return;
      }
    }
    if (values === 'payment-previous') {
      if (shipmentComplete) {
        const setStep = currentStep - 1;
        setCurrentStep(setStep);
        return;
      }
      if (productComplete || bulkUploadComplete || categoryComplete) {
        setActiveSteps(3);
        const setStep = currentStep - 1;
        setCurrentStep(setStep);
        return;
      }
      if (storeComplete || policyComplete) {
        setActiveSteps(1);
        const setStep = currentStep - 1;
        setCurrentStep(setStep);
        return;
      }
    }
    if (values === 'coupon-previous') {
      if (shipmentComplete || paymentComplete) {
        setActiveSteps(5);
        const setStep = currentStep - 1;
        setCurrentStep(setStep);
        return;
      }
      if (productComplete || bulkUploadComplete || categoryComplete) {
        setActiveSteps(3);
        const setStep = currentStep - 1;
        setCurrentStep(setStep);
        return;
      }
      if (storeComplete || policyComplete) {
        setActiveSteps(1);
        const setStep = currentStep - 1;
        setCurrentStep(setStep);
        return;
      }
    }
    const setStep = currentStep - 1;
    setCurrentStep(setStep);
  };

  const steps = [
    generateStep(
      storeComplete,
      <>
        <span>
          The first step is to add all your customers need to know about your
          store - let your customers get to know you better
        </span>
        <div className="milestone-footer-store">
          <Tooltip title="Help and resources" zIndex={100_001}>
            <span className="question-icon-milestone">
              <QuestionCircleOutlined />
              Learn how
            </span>
          </Tooltip>
          <span className="footer-inner-left-span">
            <Button className="skip-btn-tour" onClick={() => handleSkip()}>
              Skip
            </Button>
            <Button
              type="primary"
              onClick={() => navigate('/stores/add-store')}
            >
              Add store
            </Button>
            {get(incompleteTourData, 'length') - 1 === currentStep ? (
              ''
            ) : (
              <Button
                style={{ width: '30px', marginLeft: '10px' }}
                onClick={() => handleNextTour('store-next')}
              >
                <RightOutlined />
              </Button>
            )}
          </span>
        </div>
      </>,
      () => reference1.current
    ),
    generateStep(
      policyComplete,
      <>
        <span>
          You&apos;re doing fantastic! Now, You can add your store policies if
          you have one, and if you don&apos;t our AI has you covered!
        </span>
        <div>
          <span className="footer-inner-left-span space-between-milestone">
            <div>
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
            </div>
            <div>
              {currentStep === 0 ? (
                ''
              ) : (
                <Button
                  style={{ width: '30px' }}
                  onClick={() => handlePreviousTour('policy-previous')}
                >
                  <LeftOutlined />
                </Button>
              )}
              <Button
                style={{ width: '110px', marginLeft: '10px' }}
                type="primary"
                onClick={() => navigate('/settings?page=documentations')}
              >
                Add store policies
              </Button>
              {get(incompleteTourData, 'length') - 1 === currentStep ? (
                ''
              ) : (
                <Button
                  style={{ width: '30px', marginLeft: '10px' }}
                  onClick={() => handleNextTour('policy-next')}
                >
                  <RightOutlined />
                </Button>
              )}
            </div>
          </span>
        </div>
      </>,
      () => reference2.current
    ),
    generateStep(
      categoryComplete,
      <>
        <span>
          Let your customers know what you&apos;re selling by adding the
          different categories you have.
        </span>
        <div className="milestone-footer-store">
          <Tooltip title="Help and resources" zIndex={100_001}>
            <span className="question-icon-milestone">
              <QuestionCircleOutlined />
              Learn how
            </span>
          </Tooltip>
          <span className="footer-inner-left-span">
            <Button className="skip-btn-tour" onClick={() => handleSkip()}>
              Skip
            </Button>
            {currentStep === 0 ? (
              ''
            ) : (
              <Button
                style={{ width: '30px' }}
                onClick={() => handlePreviousTour('category-previous')}
                disabled={currentStep === 0}
              >
                <LeftOutlined />
              </Button>
            )}
            <Button
              type="primary"
              onClick={() => navigate('/categories')}
              style={{ width: '110px', marginLeft: '18px' }}
            >
              Add Category
            </Button>
            {get(incompleteTourData, 'length') - 1 === currentStep ? (
              ''
            ) : (
              <Button
                style={{ width: '30px', marginLeft: '10px' }}
                onClick={() => handleNextTour('category-next')}
              >
                <RightOutlined />
              </Button>
            )}
          </span>
        </div>
      </>,
      () => reference3.current
    ),
    generateStep(
      productComplete,
      <>
        <span>
          Make sure you make your product pages as detailed as possible. The
          quality of product display pages is directly proportional to
          conversions.
        </span>
        <div className="milestone-footer-store">
          <Tooltip title="Help and resources" zIndex={100_001}>
            <span className="question-icon-milestone">
              <QuestionCircleOutlined />
              Learn how
            </span>
          </Tooltip>
          <span className="footer-inner-left-span">
            <Button className="skip-btn-tour" onClick={() => handleSkip()}>
              Skip
            </Button>
            {currentStep === 0 ? (
              ''
            ) : (
              <Button
                style={{ width: '30px' }}
                onClick={() => handlePreviousTour('product-previous')}
              >
                <LeftOutlined />
              </Button>
            )}
            <Button
              type="primary"
              onClick={() => navigate('/products/add-product')}
              style={{ width: '110px', marginLeft: '18px' }}
            >
              Add Products
            </Button>
            {get(incompleteTourData, 'length') - 1 === currentStep ? (
              ''
            ) : (
              <Button
                style={{ width: '30px', marginLeft: '10px' }}
                onClick={() => handleNextTour('product-next')}
              >
                <RightOutlined />
              </Button>
            )}
          </span>
        </div>
      </>,
      () => reference4.current
    ),
    generateStep(
      bulkUploadComplete,
      <>
        <span>
          Short on time? Lots of products? We&apos;ve got you covered – you can
          upload them in bulk, happy selling!
        </span>
        <div className="milestone-footer-store">
          <Tooltip title="Help and resources" zIndex={100_001}>
            <span className="question-icon-milestone">
              <QuestionCircleOutlined />
              Learn how
            </span>
          </Tooltip>
          <span className="footer-inner-left-span">
            <Button className="skip-btn-tour" onClick={() => handleSkip()}>
              Skip
            </Button>
            {currentStep === 0 ? (
              ''
            ) : (
              <Button
                style={{ width: '30px' }}
                onClick={() => handlePreviousTour('bulk-previous')}
              >
                <LeftOutlined />
              </Button>
            )}
            <Button
              type="primary"
              onClick={() => navigate('/products')}
              style={{ width: '110px', marginLeft: '18px' }}
            >
              Bulk Upload
            </Button>
            {get(incompleteTourData, 'length') - 1 === currentStep ? (
              ''
            ) : (
              <Button
                style={{ width: '30px', marginLeft: '10px' }}
                onClick={() => handleNextTour('bulk-next')}
              >
                <RightOutlined />
              </Button>
            )}
          </span>
        </div>
      </>,
      () => reference5.current
    ),
    generateStep(
      shipmentComplete,
      <>
        <span>
          Connect with one of our shipping partners and you&apos;ll have your
          products picked up at your doorstep and delivered to your customers,
          hassle-free!
        </span>
        <div className="milestone-footer-store">
          <Button className="skip-btn-tour" onClick={() => handleSkip()}>
            Skip
          </Button>
          <div>
            <Button
              onClick={() => handleSkip('self-ship')}
              style={{ width: '110px' }}
              className="self-ship-btn"
            >
              I will self-ship
            </Button>
            {currentStep === 0 ? (
              ''
            ) : (
              <Button
                style={{ width: '30px' }}
                onClick={() => handlePreviousTour('shipment-previous')}
              >
                <LeftOutlined />
              </Button>
            )}
            <Button
              type="primary"
              onClick={() => navigate('/settings?page=integration')}
              style={{ marginLeft: '10px' }}
            >
              Add
            </Button>
            {get(incompleteTourData, 'length') - 1 === currentStep ? (
              ''
            ) : (
              <Button
                style={{ width: '30px', marginLeft: '10px' }}
                onClick={() => handleNextTour('shipment-next')}
              >
                <RightOutlined />
              </Button>
            )}
          </div>
        </div>
      </>,
      () => reference6.current
    ),
    generateStep(
      paymentComplete,
      <>
        <span>
          Your e-commerce is almost ready to sell! Connect to your preferred
          payment methods and you&apos;re good to go.
        </span>
        <div className="milestone-footer-store">
          <Button className="skip-btn-tour" onClick={() => handleSkip()}>
            Skip
          </Button>
          <div>
            {currentStep === 0 ? (
              ''
            ) : (
              <Button
                style={{ width: '30px' }}
                onClick={() => handlePreviousTour('payment-previous')}
              >
                <LeftOutlined />
              </Button>
            )}
            <Button
              type="primary"
              onClick={() => navigate('/settings?page=integration')}
              style={{ marginLeft: '10px' }}
            >
              Add
            </Button>
            {get(incompleteTourData, 'length') - 1 === currentStep ? (
              ''
            ) : (
              <Button
                style={{ width: '30px', marginLeft: '10px' }}
                onClick={() => handleNextTour('payment-next')}
              >
                <RightOutlined />
              </Button>
            )}
          </div>
        </div>
      </>,
      () => reference7.current
    ),
    generateStep(
      couponComplete,
      <>
        <span>
          Coupons are a great way to excite your customers, try creating your
          first coupon now!
        </span>
        <div className="milestone-footer-store">
          <Tooltip title="Help and resources" zIndex={100_001}>
            <span className="question-icon-milestone">
              <QuestionCircleOutlined />
              Learn how
            </span>
          </Tooltip>
          <span className="footer-inner-left-span">
            <Button
              className="skip-btn-tour"
              onClick={() => handleSkip('coupon-skip')}
            >
              Skip
            </Button>
            {currentStep === 0 ? (
              ''
            ) : (
              <Button
                style={{ width: '30px' }}
                onClick={() => handlePreviousTour('coupon-previous')}
              >
                <LeftOutlined />
              </Button>
            )}
            <Button
              type="primary"
              onClick={() => navigate('/coupons')}
              style={{ width: '100px', marginLeft: '18px' }}
            >
              Add coupon
            </Button>
          </span>
        </div>
      </>,
      () => reference8.current
    ),
  ];

  const filteredSteps = steps.filter((step) => step !== null);

  const handleClickButton = (index) => {
    setActiveSteps(index + 1);
    setActiveColor(true);
  };

  const handlePrevious = () => {
    if (activeSteps > 1) {
      setActiveSteps(activeSteps - 1);
    }
  };
  const handleNext = () => {
    if (activeSteps < 6) {
      setActiveSteps(activeSteps + 1);
    }
  };

  const handleClickButtonTableStyles = (data) => {
    if (activeSteps === data && activeColor) {
      return 'setup-onboard-mapdivone setup-button-clic';
    }
    if (activeSteps > data && activeColor) {
      return 'setup-onboard-mapdivone setup-button-clic-bg';
    }
    return 'setup-onboard-mapdivone';
  };

  const tourhandle = () => {
    setOpen(true);
    setIsopenModal(false);
    setCurrentStep(0);
    if (window.innerWidth > 760) {
      if (currentStep === 0) {
        const setupFirstButton = document.querySelector('.storeButton');
        setupFirstButton.classList.add('zIndextour');
      } else {
        const setupFirstButton = document.querySelector('.setup-tab-first');
        setupFirstButton.classList.remove('zIndextour');
      }
    }
  };

  const getButtonReference = (index, subindex) => {
    switch (`${index}-${subindex}`) {
      case '0-0': {
        return reference1;
      }
      case '0-1': {
        return reference2;
      }
      case '2-0': {
        return reference3;
      }
      case '2-1': {
        return reference4;
      }
      case '2-2': {
        return reference5;
      }
      case '4-0': {
        return reference6;
      }
      case '4-1': {
        return reference7;
      }
      case '5-0': {
        return reference8;
      }
      default: {
        // eslint-disable-next-line unicorn/no-null
        return null;
      }
    }
  };
  const handleCancel = () => {
    setIsopenModal(false);
    localStorage.setItem('hasModalBeenShown', true);
  };

  return (
    <Spin spinning={loading}>
      <div className="setup">
        <div className="setup-onboard-maindiv">
          {!mobileView && (
            <div className="setup-onboard-subdiv">
              {map(onGuideData, (data, index) => (
                <div className={handleClickButtonTableStyles(data.id)}>
                  <Button
                    onClick={() => handleClickButton(index)}
                    className={`${handleTabButtonClip(data.id)} ${
                      index === 0 && reference1 === true ? 'custom-style' : ''
                    } ${
                      get(data, 'title') === 'Store setup' && reference1
                        ? 'storeButton'
                        : ''
                    } ${
                      get(data, 'title') === 'Add product' && reference3
                        ? 'productButton'
                        : ''
                    } ${
                      get(data, 'title') === 'Add Order Processing Details' &&
                      reference5
                        ? 'shipmentButton'
                        : ''
                    }`}
                  >
                    <div className="setup-mainbutton-insidediv">
                      <p>{get(data, 'title', '')}</p>
                      <Text type="secondary">{get(data, 'sub_title', '')}</Text>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {mobileView && (
            <div className="setup-onboard-div-stepper">
              <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>
                Milestone
              </span>
              <Steps
                current={activeSteps - 1}
                size="small"
                status="process"
                style={{ display: 'flex', flexDirection: 'row' }}
                direction="horizontal"
              >
                {map(onGuideData, (data, index) => (
                  <Step onClick={() => handleClickButton(index)} />
                ))}
              </Steps>
            </div>
          )}

          <div className="setup-onboard-mapdivtwo">
            {map(onGuideData, (data, index) =>
              map(
                get(data, 'subGuide', []),
                (subGuideData, subindex) =>
                  activeSteps === data.id && (
                    <>
                      {mobileView && (
                        <div className="setup-onboard-div-stepper">
                          {subindex === 0 && (
                            <p style={{ display: 'inline' }}>
                              {activeSteps}.&nbsp;{get(data, 'title', '')}
                              :&nbsp;
                              <Text type="secondary">
                                {get(data, 'sub_title', '')}
                              </Text>
                            </p>
                          )}
                        </div>
                      )}

                      <Row className="setup-row-mainrow">
                        {!mobileView && (
                          <Col span={6} className="flex-end">
                            {subGuideData.completed && <TickIcon />}
                          </Col>
                        )}

                        <Col span={mobileView ? 24 : 18}>
                          <h4>{get(subGuideData, 'title', '')}</h4>
                          <Row gutter={[16, 16]}>
                            <Col span={16} style={{ paddingLeft: '0px' }}>
                              <Text type="secondary">
                                {get(subGuideData, 'sub_title', '')}
                              </Text>
                            </Col>
                            <Col span={8} className="btn-col-add-store">
                              <Button
                                ref={getButtonReference(index, subindex)}
                                type="primary"
                                size="small"
                                className="btn-add-store"
                                onClick={() => {
                                  navigate({
                                    pathname: `${
                                      get(subGuideData, 'path', '').split(
                                        '?'
                                      )[0]
                                    }`,
                                    search: `?${
                                      get(subGuideData, 'path', '').split(
                                        '?'
                                      )[1] || ''
                                    }`,
                                    state: {
                                      tourStart: true,
                                      slug: `${get(subGuideData, 'slug', '')}`,
                                    },
                                  });
                                }}
                              >
                                {get(subGuideData, 'button_text', '')}
                              </Button>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      {subindex !== data.subGuide.length - 1 && <Divider />}
                    </>
                  )
              )
            )}
          </div>
          <div style={{ zIndex: '1005' }} className="milestone-container">
            <Tour
              open={open}
              onClose={() => setOpen(false)}
              steps={filteredSteps}
              current={currentStep}
              className="milestone-tour"
              zIndex={100_000}
            />
          </div>

          <Modal
            width="540px"
            className="tour-main-modal"
            open={isopenModal}
            onCancel={handleCancel}
            title="Welcome!"
            footer={false}
            centered
          >
            <span style={{ marginBottom: '10px' }}>
              Welcome to Zupain, your go-to solution for building an online
              store effortlessly. We&apos;re excited to be part of your
              e-commerce journey, and we&apos;re here to guide you every step of
              the way. Finish each milestone to start selling and making orders
              in no time. Ready to get started?
            </span>
            <div className="tour-main-modal-button">
              <div>
                <Button onClick={handleSkip} className="tour-button">
                  Skip for now
                </Button>
              </div>
              <div>
                <Button
                  className="tour-button"
                  type="primary"
                  onClick={tourhandle}
                >
                  <div className="btn-alignment">
                    <span>Lets get started</span>{' '}
                    <div>
                      <Rocket />
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </Modal>
          {onGuideData.length > 0 && (
            <div className="flex-end setup-onboard-divthree">
              <Row>
                <Col style={{ display: 'flex' }}>
                  {activeSteps > 1 && (
                    <Button onClick={handlePrevious} className="previous-btn">
                      Previous
                    </Button>
                  )}
                  {activeSteps < 6 && (
                    <Button onClick={() => handleNext()} className="next-btn">
                      Next
                    </Button>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </div>
      </div>
    </Spin>
  );
}
export default withRouter(OnBoardGuide);
