import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from 'react';
import {
  Row,
  Col,
  Card,
  Spin,
  Switch,
  notification,
  Modal,
  Button,
  Form,
  Input,
  Tooltip,
  Divider,
  Tabs,
  Tour,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import _, { get, isEmpty, includes, map } from 'lodash';
import CryptoJS from 'crypto-js';
import { MilestoneContext } from '../../context/milestone-context';
import { ReactComponent as ModalBg } from '../../../assets/paymentModal.svg';
import ModalHeader from '../../../shared/modal-header-helper';
import Razer from '../../../assets/logos/razorpay-logo.svg';
import RazerMobile from '../../../assets/logos/razorpay-logo-mobile.svg';
import Cod from '../../../assets/logos/cod-logo.svg';
import Cashfree from '../../../assets/cashfree-image.png';
import CashfreeMob from '../../../assets/cashfree-mob.png';
import UpiImage from '../../../assets/logos/upi-logo.svg';
import UpiMobile from '../../../assets/logos/upi-logo-mobile.svg';
import Paypal from '../../../assets/logos/paypal-logo.svg';
import PaypalMobile from '../../../assets/logos/paypal-logo-mobile.svg';
import PhonePe from '../../../assets/logos/phonepe-logo.svg';
import PhonePeMobile from '../../../assets/logos/phonepe-logo-mobile.svg';
import stripe from '../../../assets/logos/stripe-logo.svg';
import stripeMobile from '../../../assets/logos/stripe-logo-mobile.svg';
import {
  FAILED_TO_LOAD,
  PAYMENT_METHOD_SLUG_PAYOFFLINE,
  PAYMENT_UPDATE_FAILED,
  PAYMENT_UPDATE_SUCCESS,
  TENANT_RAZORPAY_DETAILS_FAILED,
  UPDATE_BANK_DETAILS_FAILED,
  UPDATE_BANK_DETAILS_SUCCESS,
} from '../../../shared/constant-values';
import {
  getAllPaymentMethods,
  getTenant,
  updatePaymentMethod,
  updateRevokeAccessToken,
  putOnboardSubGuide,
  getCurrenyDetails,
  updateTenantSettings,
} from '../../../utils/api/url-helper';
import { TenantContext } from '../../context/tenant-context';
import PaymentBankDetails from './payment-bank-details';

import { ReactComponent as QuestionIcon } from '../../../assets/icons/question-icon.svg';

const { TabPane } = Tabs;

const paymentIamge = {
  razorpay: Razer,
  cod: Cod,
  cashfree: Cashfree,
  pay_offline: UpiImage,
  paypal: Paypal,
  phonepe: PhonePe,
  stripepay: stripe,
};
const paymentIamgeMobile = {
  razorpay: RazerMobile,
  cod: Cod,
  cashfree: CashfreeMob,
  pay_offline: UpiMobile,
  paypal: PaypalMobile,
  phonepe: PhonePeMobile,
  stripepay: stripeMobile,
};

function PaymentsList(properties) {
  const { mobileView } = properties;
  const [form] = Form.useForm();
  const [openTour, setOpenTour] = useState(false);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [indianPaymentMethods, setIndianPaymentMethods] = useState([]);
  const [otherPaymentMethods, setOtherPaymentMethods] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bankDetailsModal, setBankDetailsModal] = useState(false);
  const [updateloading, setUpdateLoading] = useState(false);
  const [activePayment, setActivePayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({});
  const [connectPaypalModal, setConnectPaypalModal] = useState(false);
  const [connectPhonepeModal, setConnectPhonepeModal] = useState(false);
  const [connectStripeModal, setConnectStripeModal] = useState(false);
  const [cashfreeModal, setCashfreeModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    checked: false,
    Id: '',
    slug: '',
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [completeModal, setCompleteModal] = useState(false);
  const { fetchTourData } = useContext(MilestoneContext);

  const [tenantDetails, , setTenantDetails, tenantConfig] =
    useContext(TenantContext);
  const formReference = useRef(null);

  const paypalClientId = get(tenantDetails, 'setting.paypal_client_id');
  const paypalClientSecret = get(tenantDetails, 'setting.paypal_client_secret');
  const isPhonepe =
    get(tenantDetails, 'setting.phonepe_merchant_id') &&
    get(tenantDetails, 'setting.phonepe_salt_key') &&
    get(tenantDetails, 'setting.phonepe_salt_index');
  const isStripePay =
    get(tenantDetails, 'setting.publish_key') &&
    get(tenantDetails, 'setting.secret_key');
  const isCashfree =
    get(tenantDetails, 'setting.cashfree_api_id', '') &&
    get(tenantDetails, 'setting.cashfree_secret_key', '');
  const handleSkip = async () => {
    setOpenTour(false);
    await putOnboardSubGuide({
      completed: true,
      slug: 'payment',
    });
  };

  const handleConnect = () => {
    setConnectPhonepeModal(true);
    setTimeout(() => {
      setCurrentStep(1);
    }, 400);
  };

  const previousStep = (value) => {
    if (value === 'phonepeclose') {
      setConnectPhonepeModal(false);
    }
    setCurrentStep(currentStep - 1);
  };
  const saveTour = () => {
    formReference.current.submit();
  };

  const steps = [
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Click the &apos;Connect&apos; button to initiate the setup process.
          </span>
          <div className="milestone-footer-store">
            <Tooltip title="Help and resources">
              <span className="question-icon-milestone">
                <QuestionCircleOutlined />
                Learn how
              </span>
            </Tooltip>
            <span className="footer-inner-left-span">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <Button type="primary" onClick={handleConnect}>
                Connect
              </Button>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.phonepe-container');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            To seamlessly integrate PhonePe, fetch your unique Merchant ID, Salt
            Key, and Salt Index from your PhonePe account. Once you have them,
            enter the details and click &apos;Submit&apos;.
          </span>
          <div className="milestone-footer-store mileStone-nonflex">
            <span className="footer-inner-left-span mileStone-flex-spaceBetween">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={() => previousStep('phonepeclose')}>
                  Previous
                </Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '5px' }}
                  onClick={saveTour}
                >
                  Submit
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.phonepeModal');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
  ];

  const fetchPaymentMethodData = () => {
    setLoading(true);
    const apiArray = [
      getAllPaymentMethods(),
      getCurrenyDetails({ tableName: 'paypal' }),
    ];
    Promise.all(apiArray)
      .then(async (response) => {
        const paypalCurrencyList = get(response, '[1].data', []);
        const paymentMethodList = _.get(response, '[0].data', []);
        const paypalCurrencyCodes = paypalCurrencyList.map(
          (item) => item.currency_code
        );
        paymentMethodList.map((item) => {
          if (item.slug === 'paypal') {
            const tenantCurrency = get(tenantDetails, 'setting.currency', '');
            item.is_disabled = !includes(paypalCurrencyCodes, tenantCurrency);
          } else item.is_disabled = false;
          return item;
        });
        const indianMethods = new Set([
          'UPI Pay',
          'Razorpay',
          'Cash on delivery',
          'PhonePe',
          'Cashfree',
        ]);
        const otherMethods = new Set(['Stripe Pay', 'PayPal']);

        const india = paymentMethodList.filter((pay) =>
          indianMethods.has(pay.method_name)
        );
        const other = paymentMethodList.filter((pay) =>
          otherMethods.has(pay.method_name)
        );
        setIndianPaymentMethods(india);
        setOtherPaymentMethods(other);
        setPaymentMethods(paymentMethodList);
        setLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error || FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTourData().then((data) => {
      const paymentData = get(data, 'data.[4]');
      const paymentTourDatas = get(paymentData, 'subGuide.[1]');
      const isOneProfileCreated = get(paymentTourDatas, 'completed', false);
      const shipmentTourDatas = get(paymentData, 'subGuide.[0]');
      const shipmentCompletion = get(shipmentTourDatas, 'completed');
      if (
        isOneProfileCreated === false &&
        shipmentCompletion === true &&
        !mobileView
      ) {
        setOpenTour(!isOneProfileCreated);
      }
    });
  }, []);

  useEffect(() => {
    if (openTour) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [openTour]);

  useEffect(() => {
    fetchPaymentMethodData();
  }, [tenantDetails]);

  const updatePaymentMode = () => {
    const { checked, Id, slug } = updateData;
    setLoading(true);
    const parameters = {
      is_active: checked,
      slug,
    };
    updatePaymentMethod(Id, parameters)
      .then((resp) => {
        if (get(resp, 'success', false)) {
          notification.success({ message: PAYMENT_UPDATE_SUCCESS });
          setLoading(false);
          setIsModalVisible(false);
          fetchPaymentMethodData();
          setUpdateData({ checked: false, Id: '', slug: '' });
        }
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', '') || PAYMENT_UPDATE_FAILED,
        });
        setLoading(false);
        setIsModalVisible(false);
        setUpdateData({ checked: false, Id: '', slug: '' });
      });
  };

  const updatePaymentBankDetails = useCallback((value, paymentMethod) => {
    setUpdateLoading(true);
    const parameters = {
      slug: get(paymentMethod, 'slug', ''),
      merchant_name: get(value, 'merchant_name', ''),
      upi_id: get(value, 'upi_id', ''),
      payment_description: get(value, 'payment_description', ''),
      account_name: get(value, 'account_name', ''),
      account_number: get(value, 'account_number', ''),
      bank_branch: get(value, 'bank_branch', ''),
      ifsc_code: get(value, 'ifsc_code', ''),
      is_proof: get(value, 'is_proof', ''),
    };
    updatePaymentMethod(get(paymentMethod, 'payment_method_id', ''), parameters)
      .then((resp) => {
        if (get(resp, 'success', false)) {
          notification.success({ message: UPDATE_BANK_DETAILS_SUCCESS });
          setUpdateLoading(false);
          setBankDetailsModal(false);
          fetchPaymentMethodData();
          setUpdateData({ checked: false, Id: '', slug: '' });
        }
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', '') || UPDATE_BANK_DETAILS_FAILED,
        });
        setUpdateLoading(false);
        setBankDetailsModal(false);
        setUpdateData({ checked: false, Id: '', slug: '' });
      });
  }, []);

  const handleCancel = () => {
    fetchPaymentMethodData();
    setUpdateData({ checked: false, Id: '', slug: '' });
    setIsModalVisible(false);
  };

  const showModal = (check, item) => {
    const { payment_method_id: id, slug } = item;
    setUpdateData({ checked: check, Id: id, slug });
    if (check) {
      setActivePayment(true);
    } else {
      const checkMethod = paymentMethods.filter((data) => data.is_active);
      if (checkMethod.length > 1) {
        setActivePayment(true);
      } else {
        setActivePayment(false);
      }
    }
    setIsModalVisible(true);
  };

  const fetchTenant = () => {
    setLoading(true);
    getTenant()
      .then((response) => {
        setTenantDetails((previous) => {
          return previous === get(response, 'data', {})
            ? tenantDetails
            : get(response, 'data', {});
        });

        setLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error || FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  const handleRazorpayAuth = () => {
    const clientId = get(tenantConfig, 'RazorpayClientId', '');
    const clientSecret = get(tenantConfig, 'RazorpayClientSecret', '');
    const RazorpayHostname = get(tenantConfig, 'RazorpayHostName', '');
    const RazorpayCallbackURL = get(tenantConfig, 'RazorpayCallbackURL', '');
    const razorpaySecret = get(tenantConfig, 'RazorpaySecret', '');
    // const customerUrl = get(tenantConfig, 'customer_url', '');
    const customerUrl = get(tenantDetails, 'customer_url', '');
    const hostname = customerUrl.replace('https://', '');
    if (isEmpty(get(tenantDetails, 'setting.razorpay_public_token'))) {
      const encrypted = CryptoJS.AES.encrypt(hostname, razorpaySecret);
      const encryptText = encrypted.toString();
      const url = `${RazorpayHostname}/authorize?client_id=${clientId}&response_type=code&redirect_uri=${RazorpayCallbackURL}/razorpay-callback&scope=read_write&state=${encryptText}`;
      const popWindow = window.open(url, '', 'height=600,width=600');
      const timer = setInterval(() => {
        if (popWindow.closed) {
          fetchTenant();
          clearInterval(timer);
        }
      }, 100);
    } else {
      const parameter = {
        client_id: clientId,
        client_secret: clientSecret,
        token_type_hint: 'access_token',
        token: get(tenantDetails, 'setting.razorpay_access_token'),
      };
      setLoading(true);
      updateRevokeAccessToken(parameter)
        .then(async () => {
          fetchTenant();
        })
        .catch((error) => {
          setLoading(false);
          notification.error({
            message: get(error, 'error', TENANT_RAZORPAY_DETAILS_FAILED),
          });
        });
    }
  };

  const handlePaypalAuth = (values) => {
    updateTenantSettings({ payload: values })
      .then((resp) => {
        if (resp.success) {
          setConnectPaypalModal(false);
          fetchTenant();
        }
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', '') || 'Failed to update the details',
        });
        setConnectPaypalModal(false);
      });
  };

  const handlePhonepeAuth = async (values) => {
    if (openTour) {
      setOpenTour(false);
      setCompleteModal(true);
      setTimeout(() => {
        setCompleteModal(false);
        navigate('/dashboard');
      }, 4000);
      await putOnboardSubGuide({
        completed: true,
        slug: 'payment',
      });
    }
    await updateTenantSettings({ payload: values })
      .then((resp) => {
        if (resp.success) {
          setConnectPhonepeModal(false);
          fetchTenant();
        }
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', '') || 'Failed to update the details',
        });
        setConnectPhonepeModal(false);
      });
  };
  const handleStripePayAuth = (values) => {
    updateTenantSettings({ payload: values })
      .then((resp) => {
        if (resp.success) {
          setConnectStripeModal(false);
          fetchTenant();
        }
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', '') || 'Failed to update the details',
        });
        setConnectStripeModal(false);
      });
  };

  const onClose = useCallback(() => {
    setBankDetailsModal(false);
  }, []);

  const handleBankDetailsModal = useCallback((item) => {
    setSelectedPaymentMethod(item);
    setBankDetailsModal(true);
  }, []);

  const handlePaypalConnect = () => {
    if (isEmpty(paypalClientId && paypalClientSecret))
      setConnectPaypalModal(true);
    else {
      const values = { paypal_client_id: '', paypal_client_secret: '' };
      setConnectPaypalModal(false);
      handlePaypalAuth(values);
    }
  };

  const handlePhonePeConnect = () => {
    if (isPhonepe) {
      const values = {
        phonepe_merchant_id: '',
        phonepe_salt_key: '',
        phonepe_key_index: '',
      };
      setConnectPhonepeModal(false);
      handlePhonepeAuth(values);
    } else {
      setOpenTour(false);
      setConnectPhonepeModal(true);
    }
  };
  const handleStripeConnect = () => {
    if (isStripePay) {
      const values = {
        publish_key: '',
        secret_key: '',
      };
      updateTenantSettings({ payload: values })
        .then((resp) => {
          if (resp.success) {
            setConnectStripeModal(false);
            fetchTenant();
          }
        })
        .catch((error) => {
          notification.error({
            message:
              get(error, 'message', '') || 'Failed to update the details',
          });
        });
    } else {
      setConnectStripeModal(true);
    }
  };
  const handleCashfree = () => {
    if (isCashfree) {
      const values = {
        cashfree_api_id: '',
        cashfree_secret_key: '',
      };
      updateTenantSettings({ payload: values })
        .then((resp) => {
          if (resp.success) {
            setCashfreeModal(false);
            fetchTenant();
          }
        })
        .catch((error) => {
          notification.error({
            message:
              get(error, 'message', '') || 'Failed to update the details',
          });
        });
    } else {
      setCashfreeModal(true);
    }
  };

  const handleCashfreeAuth = (values) => {
    updateTenantSettings({ payload: values })
      .then((resp) => {
        if (resp.success) {
          fetchTenant();
          setCashfreeModal(false);
        }
      })
      .catch((error) => {
        setCashfreeModal(false);
        notification.error({
          message: get(error, 'message', '') || 'Failed to update the details',
        });
      });
  };

  const handlePaymentLogos = (item) => {
    return (
      <img
        className="pament-method-img"
        src={
          mobileView ? paymentIamgeMobile[item.slug] : paymentIamge[item.slug]
        }
        alt="logout"
      />
    );
  };

  const handlePaymentTooltip = () => {
    return (
      <Tooltip title="Help and resources.">
        <QuestionIcon className="question-icon" />
      </Tooltip>
    );
  };

  const handlePaymentTitle = (item) => {
    return <p className="box-heading-text">{get(item, 'method_name', '')}</p>;
  };

  const handlePaymentDescription = (item) => {
    return (
      <span className="box-content-description">
        {get(item, 'description', '')}
      </span>
    );
  };

  const handleConnectButton = (item) => {
    return (
      <>
        {get(item, 'method_name', '') === 'Razorpay' && (
          <div className="connect-btn-styles">
            <Button
              id="razorpay-connect-btn"
              htmlType="submit"
              type="primary"
              onClick={handleRazorpayAuth}
              icon={<SwapOutlined />}
            >
              {isEmpty(get(tenantDetails, 'setting.razorpay_public_token'))
                ? 'Connect'
                : 'Disconnect'}
            </Button>
          </div>
        )}
        {get(item, 'slug', '') === PAYMENT_METHOD_SLUG_PAYOFFLINE &&
          get(item, 'is_active', false) === true && (
            <div className="connect-btn-styles">
              <Button
                htmlType="submit"
                type="primary"
                onClick={() => handleBankDetailsModal(item)}
              >
                {isEmpty(get(item, 'merchant_name')) ? 'Create' : 'Edit'}
              </Button>
            </div>
          )}
        {get(item, 'method_name', '') === 'PayPal' && (
          <div className="connect-btn-styles">
            <Button
              id="paypal-connect-btn"
              htmlType="submit"
              type="primary"
              onClick={() => handlePaypalConnect()}
              icon={<SwapOutlined />}
            >
              {isEmpty(paypalClientId && paypalClientSecret)
                ? 'Connect'
                : 'Disconnect'}
            </Button>
          </div>
        )}
        {get(item, 'method_name', '') === 'PhonePe' && (
          <div className="connect-btn-styles">
            <Button
              id="phonepe-connect-btn"
              htmlType="submit"
              type="primary"
              onClick={() => handlePhonePeConnect()}
              icon={<SwapOutlined />}
            >
              {isPhonepe ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        )}
        {get(item, 'method_name', '') === 'Stripe Pay' && (
          <div className="connect-btn-styles">
            <Button
              id="stripe-connect-btn"
              htmlType="submit"
              type="primary"
              onClick={() => handleStripeConnect()}
              icon={<SwapOutlined />}
            >
              {isStripePay ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        )}
        {get(item, 'method_name', '') === 'Cashfree' && (
          <div className="connect-btn-styles">
            <Button
              id="cashfree-connect-btn"
              htmlType="submit"
              type="primary"
              onClick={() => handleCashfree()}
              icon={<SwapOutlined />}
            >
              {isCashfree ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        )}
      </>
    );
  };

  const handlePaymentSwitch = (item) => {
    return (
      <Switch
        onChange={(checked) => showModal(checked, item)}
        checked={get(item, 'is_active', '')}
        disabled={get(item, 'is_disabled', '')}
        id={`payment-${get(item, 'payment_method_id', '')}-switch`}
        className="switch-container"
      />
    );
  };
  const handlePaymentList = (type) => {
    const method =
      type === 'india' ? indianPaymentMethods : otherPaymentMethods;
    return (
      <div className="card-container report">
        <Row
          className="all-payments"
          gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
        >
          {map(method, (item) => {
            return (
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={6}
                xl={6}
                style={{ marginBottom: '30px' }}
                key={get(item, 'payment_method_id', '')}
              >
                <Card
                  className={`payment-setup-box ${
                    get(item, 'method_name') === 'PhonePe'
                      ? 'phonepe-container'
                      : ''
                  }`}
                  id={`payment-${get(item, 'payment_method_id', '')}`}
                >
                  {mobileView ? (
                    <Row>
                      <Col span={6}>{handlePaymentLogos(item)}</Col>
                      <Col span={18}>
                        <Row className="box-text-main-row">
                          <Col span={22}>{handlePaymentTitle(item)}</Col>
                          <Col span={2}> {handlePaymentTooltip()}</Col>
                        </Row>
                        <Row className="box-description-main-row">
                          {handlePaymentDescription(item)}
                        </Row>
                        <Divider />
                        <Row>
                          <Col span={18}>{handleConnectButton(item)}</Col>
                          <Col span={6}>{handlePaymentSwitch(item)}</Col>
                        </Row>
                      </Col>
                    </Row>
                  ) : (
                    <>
                      <Row>
                        <Col span={20}>{handlePaymentLogos(item)}</Col>
                        <Col span={4} className="flexbox-end">
                          {handlePaymentTooltip()}
                        </Col>
                      </Row>
                      <Row
                        className="box-text-main-row"
                        style={{ display: 'block' }}
                      >
                        <Row>{handlePaymentTitle(item)}</Row>
                        <Row>{handlePaymentDescription(item)}</Row>
                      </Row>
                      <Divider />
                      <Row>
                        <Col span={20}>{handleConnectButton(item)}</Col>
                        <Col
                          span={4}
                          className="flexbox-center"
                          style={{ height: '40px' }}
                        >
                          {handlePaymentSwitch(item)}
                        </Col>
                      </Row>
                    </>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };
  const handlePaymentTabs = () => {
    return (
      <div>
        <Tabs className="theme-tabs-settings theme-tabs-line">
          <TabPane tab="India" key="india">
            {handlePaymentList('india')}
          </TabPane>
          <TabPane tab="International" key="international">
            {handlePaymentList('other')}
          </TabPane>
        </Tabs>
        <Modal
          open={isModalVisible}
          footer={false}
          onCancel={handleCancel}
          className="settings-payment-modal"
        >
          {activePayment ? (
            <>
              <p
                className="box-title-text"
                style={{ whiteSpace: 'nowrap', marginTop: '15px' }}
              >
                <ExclamationCircleOutlined className="payment-method-icon" />
                Are you sure you want to update the payment method status?
              </p>
              <span className="payment-modal-button">
                <Button
                  loading={loading}
                  onClick={updatePaymentMode}
                  type="primary"
                  style={{ marginRight: '10px' }}
                >
                  save
                </Button>
                <Button
                  type="default"
                  style={{ color: 'red' }}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </span>
            </>
          ) : (
            <h3>
              <ExclamationCircleOutlined className="payment-method-icon" />
              Atleast one payment method should be in active mode
            </h3>
          )}
        </Modal>
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      <div>{handlePaymentTabs()}</div>
      <Modal
        title={false}
        open={bankDetailsModal}
        destroyOnClose
        onCancel={onClose}
        footer={false}
        zIndex={1}
        className="settings-payment-modal"
      >
        <PaymentBankDetails
          onClose={onClose}
          loading={updateloading}
          paymentMethod={selectedPaymentMethod}
          updatePaymentBankDetails={updatePaymentBankDetails}
        />
      </Modal>
      <Modal
        title={false}
        open={connectPaypalModal}
        width={700}
        destroyOnClose
        onCancel={() => setConnectPaypalModal(false)}
        footer={false}
        zIndex={1}
        className="settings-payment-modal"
      >
        <ModalHeader title="Connect To PayPal" />
        <Form
          form={form}
          layout="horizontal"
          scrollToFirstError
          onFinish={handlePaypalAuth}
          onFinishFailed={() => setOpenTour(false)}
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 20,
          }}
        >
          <Form.Item
            label="Client ID"
            name="paypal_client_id"
            initialValue=""
            rules={[{ required: true, message: 'Please Enter Client ID!' }]}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input placeholder="Enter paypal client id" />
          </Form.Item>
          <Form.Item
            label="Client Secret"
            name="paypal_client_secret"
            initialValue=""
            rules={[{ required: true, message: 'Please Enter Client Secret!' }]}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input placeholder="Enter paypal client secret key" />
          </Form.Item>
          <div className="box-content-description">
            <span className="box-note-text">Note : </span> Login to Developer
            Account. Go to Apps&Credentials tab. Under AppName list choose your
            Application name. There you can find the details.
          </div>
          <Form.Item
            wrapperCol={{
              offset: 20,
              span: 18,
            }}
          >
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={false}
        open={connectPhonepeModal}
        width={700}
        destroyOnClose
        onCancel={() => setConnectPhonepeModal(false)}
        footer={false}
        zIndex={1}
        className="settings-payment-modal"
      >
        <ModalHeader title="Connect To PhonePe" />
        <Form
          className="phonepeModal"
          form={form}
          ref={formReference}
          layout="horizontal"
          scrollToFirstError
          onFinish={handlePhonepeAuth}
          onFinishFailed={() => setOpenTour(false)}
          labelCol={{
            span: 6,
          }}
          wrapperCol={{
            span: 18,
          }}
        >
          <Form.Item
            label="Merchant ID"
            name="phonepe_merchant_id"
            initialValue=""
            rules={[{ required: true, message: 'Please Enter Merchant ID!' }]}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input placeholder="Enter phonepe merchant id" />
          </Form.Item>
          <Form.Item
            label="Salt Key"
            name="phonepe_salt_key"
            initialValue=""
            rules={[{ required: true, message: 'Please Enter Salt Key!' }]}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input placeholder="Enter phonepe salt key" />
          </Form.Item>
          <Form.Item
            label="Salt Index"
            name="phonepe_salt_index"
            initialValue=""
            rules={[{ required: true, message: 'Please Enter Salt Index!' }]}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input placeholder="Enter phonepe salt index" />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              offset: mobileView ? 15 : 20,
              span: 18,
            }}
          >
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={false}
        open={connectStripeModal}
        width={700}
        destroyOnClose
        onCancel={() => setConnectStripeModal(false)}
        footer={false}
        zIndex={1}
        className="settings-payment-modal"
      >
        <ModalHeader title="Connect To Stripe Payment" />
        <Form
          form={form}
          layout="horizontal"
          scrollToFirstError
          onFinish={handleStripePayAuth}
          onFinishFailed={() => setOpenTour(false)}
          labelCol={{
            span: 6,
          }}
          wrapperCol={{
            span: 18,
          }}
        >
          <Form.Item
            label="Publish Key"
            name="publish_key"
            initialValue=""
            rules={[{ required: true, message: 'Please Enter Publish Key!' }]}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input placeholder="Enter stripe publish key" />
          </Form.Item>
          <Form.Item
            label="Secret Key"
            name="secret_key"
            initialValue=""
            rules={[{ required: true, message: 'Please Enter Secret Key!' }]}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input placeholder="Enter stripe secret key" />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              offset: 20,
              span: 18,
            }}
          >
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={false}
        open={cashfreeModal}
        width={700}
        destroyOnClose
        onCancel={() => setCashfreeModal(false)}
        footer={false}
        zIndex={1}
        className="settings-payment-modal"
      >
        <ModalHeader title="Connect To Cashfree Payment" />
        <Form
          form={form}
          layout="horizontal"
          scrollToFirstError
          onFinish={handleCashfreeAuth}
          onFinishFailed={() => setOpenTour(false)}
          labelCol={{
            span: 6,
          }}
          wrapperCol={{
            span: 18,
          }}
        >
          <Form.Item
            label="App Id"
            name="cashfree_api_id"
            initialValue=""
            rules={[{ required: true, message: 'Please Enter App Id!' }]}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input placeholder="Enter Cashfree App id" />
          </Form.Item>
          <Form.Item
            label="Secret Key"
            name="cashfree_secret_key"
            initialValue=""
            rules={[{ required: true, message: 'Please Enter Secret Key!' }]}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input placeholder="Enter cashfree secret key" />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              offset: 20,
              span: 18,
            }}
          >
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={completeModal}
        footer={false}
        maskClosable
        centered
        closeIcon={false}
        className="milestone-modal-store"
        zIndex={1005}
      >
        <span>
          <ModalBg />
        </span>
        <span>Payment Updated successfully</span>
      </Modal>
      <Tour
        open={openTour}
        onClose={() => setOpenTour(false)}
        steps={steps}
        current={currentStep}
        zIndex={1003}
        placement={mobileView ? 'bottom' : 'topRight'}
      />
    </Spin>
  );
}

export default PaymentsList;
