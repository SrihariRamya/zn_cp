import React, { useState, useEffect, useContext } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { isValidPhoneNumber } from 'libphonenumber-js';
import {
  Button,
  Form,
  notification,
  Spin,
  Space,
  Modal,
  Collapse,
  Row,
  Col,
} from 'antd';
import { getCode } from 'country-list';
import PostalCodes from 'postal-codes-js';
import { get, includes, map, filter, isEmpty, isNull } from 'lodash';
import Tour from 'reactour';
import DetailsForm from './details-form';
import ImageForm from './image-form';
import medalImg from '../../../assets/images/medal.png';
import {
  createOrUpdateProfile,
  getAllPaymentMethods,
  getCurrenyDetails,
  getDate,
  getDistrict,
  getOnboardGuide,
  getState,
  getTenant,
  putOnboardSubGuide,
  updatePaymentMethod,
  getInternationalState,
  getCitiesOfCountry,
  getCountryByCode,
} from '../../../utils/api/url-helper';
import {
  FAILED_TO_LOAD,
  PROFILE_ADD_FAILED,
  PROFILE_UPDATE_SUCCESS,
  SCREEN_MODE_VIEW,
  TENANT_MODE_CLIC,
  TENANT_MODE_NORMAL,
  PAYMENT_METHOD_SLUG_PAYPAL,
  PAYMENT_UPDATE_FAILED,
} from '../../../shared/constant-values';
// eslint-disable-next-line import/order
import { TenantContext } from '../../context/tenant-context';
import { trimPayloadFields } from '../../../shared/form-helpers';
import App from '../../../app';
import SettingsMobileHeading from '../setting-mobile-heading';
import ConfigurationForm from './configuration-form';

const { Panel } = Collapse;
const { confirm } = Modal;
function Profile(properties) {
  const { setScreenState, mobileView } = properties;
  const [tenantDetails, , setTenantDetails] = useContext(TenantContext);
  const [form] = Form.useForm();

  const [openTourModal, setOpenTourModal] = useState(false);
  const [tourCurrentStep, setTourCurrentStep] = useState(0);
  const [paypalCurrencyCodes, setPaypalCurrencyCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [currency, setCurrency] = useState([]);
  const [dateList, setDateList] = useState([]);
  const [settingData, setSettingData] = useState([]);
  const [activeKey, setActiveKey] = useState(['images', 'details']);
  const [mode, setMode] = useState(SCREEN_MODE_VIEW);
  const [enableSave, setEnableSave] = useState(false);
  const [isError, setIsError] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditPhone, setIsEditPhone] = useState(false);
  const [countryKey, setCountryKey] = useState('');
  const [countryName, setCountryName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [fileListState, setFileList] = useState([]);
  const [adminfileListState, setAdminFileList] = useState([]);
  const [backGroundListState, setbackGroundFileList] = useState([]);
  const [faviconListState, setfaviconList] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loginListState, setLoginFileList] = useState([]);
  const [otpListState, setOtpFileList] = useState([]);
  const [IsCountryCode, setIsCountryCode] = useState('');
  const [uploadObjectBrandLogo, setUploadObjectBrandLogo] = useState([
    { id: 1, isDisable: true, url: '' },
  ]);
  const [uploadObjectAdminLogo, setUploadObjectAdminLogo] = useState([
    { id: 1, isDisable: true, url: '' },
  ]);
  const [uploadObjectLoginImg, setUploadObjectLoginImg] = useState([
    { id: 1, isDisable: true, url: '' },
  ]);
  const [uploadObjectOtpImg, setUploadObjectOtpImg] = useState([
    { id: 1, isDisable: true, url: '' },
  ]);
  const [uploadObjectAdminLoginImg, setUploadObjectAdminLoginImg] = useState([
    { id: 1, isDisable: true, url: '' },
  ]);
  const [uploadObjectFavIcon, setUploadObjectFavIcon] = useState([
    { id: 1, isDisable: true, url: '' },
  ]);

  const isclicTenantMode =
    get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC;

  const isNormalTenantMode =
    get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL;

  const onChange = (key) => {
    setActiveKey(key);
  };

  const imageProperties = {
    uploadObjectBrandLogo,
    uploadObjectAdminLogo,
    uploadObjectLoginImg,
    uploadObjectOtpImg,
    uploadObjectAdminLoginImg,
    uploadObjectFavIcon,
    setUploadObjectBrandLogo,
    setUploadObjectAdminLogo,
    setUploadObjectLoginImg,
    setUploadObjectOtpImg,
    setUploadObjectAdminLoginImg,
    setUploadObjectFavIcon,
  };

  const initialFormSet = () => {
    let fileImage = [];
    let adminImage = [];
    let loginImage = [];
    let otpImage = [];
    let bgImage = [];
    let faviconImage = [];
    if (settingData?.brand_logo) {
      fileImage = [
        {
          name: get(settingData, 'logo_name', ''),
          status: 'done',
          url: settingData.brand_logo,
        },
      ];
      setFileList(fileImage);
      map(uploadObjectBrandLogo, (item) => {
        item.productImageInfo = { product_image: settingData.brand_logo };
      });
    }
    if (settingData?.admin_logo) {
      adminImage = [
        {
          name: get(settingData, 'admin_logo_name', ''),
          status: 'done',
          url: settingData.admin_logo,
        },
      ];
      setAdminFileList(adminImage);
      map(uploadObjectAdminLogo, (item) => {
        item.productImageInfo = { product_image: settingData.admin_logo };
      });
    }
    if (settingData?.login_image) {
      loginImage = [
        {
          name: get(settingData, 'login_image_name', ''),
          status: 'done',
          url: settingData.login_image,
        },
      ];
      setLoginFileList(loginImage);
      map(uploadObjectLoginImg, (item) => {
        item.productImageInfo = { product_image: settingData.login_image };
      });
    }
    if (settingData?.otp_image) {
      otpImage = [
        {
          name: get(settingData, 'otp_image_name', ''),
          status: 'done',
          url: settingData.otp_image,
        },
      ];
      setOtpFileList(otpImage);
      map(uploadObjectOtpImg, (item) => {
        item.productImageInfo = { product_image: settingData.otp_image };
      });
    }
    if (settingData?.login_background_image) {
      bgImage = [
        {
          name: get(settingData, 'background_image_name', ''),
          status: 'done',
          url: settingData.login_background_image,
        },
      ];
      setbackGroundFileList(bgImage);
      map(uploadObjectAdminLoginImg, (item) => {
        item.productImageInfo = {
          product_image: settingData.login_background_image,
        };
      });
    }
    if (settingData?.favicon_image) {
      faviconImage = [
        {
          name: get(settingData, 'favicon_image_name', ''),
          status: 'done',
          url: settingData.favicon_image,
        },
      ];
      setfaviconList(faviconImage);
      map(uploadObjectFavIcon, (item) => {
        item.productImageInfo = { product_image: settingData.favicon_image };
      });
    }
    settingData.brand_logo = fileImage;
    settingData.admin_logo = adminImage;
    settingData.back_logo = bgImage;
    settingData.fav_icon = faviconImage;
    if (get(tenantDetails, 'tenant_mode', TENANT_MODE_NORMAL === '')) {
      settingData.otp_logo = otpImage;
      settingData.login_logo = loginImage;
    }
    form.setFieldsValue(settingData);
  };

  useEffect(() => {
    if (!isEmpty(settingData)) {
      initialFormSet();
    }
  }, [settingData]);

  const fetchData = (apiArray) => {
    setLoading(true);
    Promise.all(apiArray)
      .then(async (resp) => {
        if (!isclicTenantMode) {
          const guide = get(resp, '[6].data', []).find((index) =>
            index?.subGuide.find((index_) => index_?.slug === 'profile')
          );
          const subGuide = get(guide, 'subGuide', []).find(
            (index_) => index_?.slug === 'profile'
          );
          const isOneStoreCreated = get(subGuide, 'completed', false);
          const paypalCurrencyCodeList = get(resp, '[4].data', []).map(
            (item) => item.currency_code
          );
          setPaypalCurrencyCodes(paypalCurrencyCodeList);
          setOpenTourModal(!isOneStoreCreated);
          setPaymentMethods(get(resp, '[5].data', []));
        }
        setCurrency(get(resp, '[3].data', []));
        const dateData = get(resp, '[2].data', '');
        setDateList(dateData);
        const currentProfileData = get(resp, '[1].data.setting', {});
        const stateID = get(currentProfileData, 'state_id', '');
        const internationalCode = get(currentProfileData, 'country_code', '');
        const country = get(currentProfileData, 'country', '');
        const getCountryCode = getCode(country) || internationalCode;
        setCountryKey(getCountryCode.toLowerCase());
        setIsCountryCode(isNull(internationalCode) ? 'IN' : internationalCode);
        if (isEmpty(internationalCode) || internationalCode === 'IN') {
          const stateData = get(resp, '[0].data', '');
          setStateList(stateData);
        }
        if (!isEmpty(internationalCode) && internationalCode !== 'IN') {
          const stateArray = await getInternationalState(internationalCode);
          const state = await stateArray.json();
          const filterSelectedState = filter(
            get(state, 'data', []),
            (item) =>
              item.name === get(currentProfileData, 'international_state', '')
          );
          setStateList(get(state, 'data', []));
          const cityArray = await getCitiesOfCountry(
            internationalCode,
            get(filterSelectedState, '0.iso2', '')
          );
          const city = await cityArray.json();
          const isoCode = get(filterSelectedState, '0.iso2', '');
          const filterCity = filter(
            get(city, 'data', []),

            (element) => element.state_code === isoCode
          );
          setDistrictList(filterCity);
        } else if (stateID) {
          getDistrict(stateID)
            .then((response) => {
              setDistrictList(get(response, 'dataset', []));
            })
            .catch(() => {
              notification.error({ message: FAILED_TO_LOAD });
            });
        }
        setTenantDetails((previous) => {
          return previous === get(resp, '[1].data', {})
            ? tenantDetails
            : get(resp, '[1].data', {});
        });
        setSettingData(currentProfileData);
        setLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error.message || FAILED_TO_LOAD });
      });
  };

  const fetchIntitalApiCall = () => {
    let apicall = [];
    apicall =
      get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL
        ? [
            getState(),
            getTenant(),
            getDate(),
            getCurrenyDetails({ tableName: 'zupain' }),
            getCurrenyDetails({ tableName: 'paypal' }),
            getAllPaymentMethods(),
            getOnboardGuide(),
          ]
        : [
            getState(),
            getTenant(),
            getDate(),
            getCurrenyDetails({ tableName: 'zupain' }),
          ];
    fetchData(apicall);
  };

  useEffect(() => {
    fetchIntitalApiCall();
  }, []);

  const handleOnValuesChange = (changedValues) => {
    if (changedValues) {
      setEnableSave(true);
    }
  };

  const updatePaymentMethodApi = (id) => {
    const parameters = {
      is_active: false,
      slug: PAYMENT_METHOD_SLUG_PAYPAL,
    };
    updatePaymentMethod(id, parameters)
      .then((resp) => {
        if (resp.success) setLoading(false);
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', '') || PAYMENT_UPDATE_FAILED,
        });
        setLoading(false);
      });
  };

  const updateSettingsApi = (values, files) => {
    const brandLogo = filter(fileListState, (item) => item.localMedia === true);
    const adminlogo = filter(
      adminfileListState,
      (item) => item.localMedia === true
    );
    const loginImage = filter(
      loginListState,
      (item) => item.localMedia === true
    );
    const otpImage = filter(otpListState, (item) => item.localMedia === true);
    const adminLoginImg = filter(
      backGroundListState,
      (item) => item.localMedia === true
    );
    const favIconImg = filter(
      faviconListState,
      (item) => item.localMedia === true
    );

    if (brandLogo.length > 0) {
      values.image_source_brand = JSON.stringify([...brandLogo]);
    }
    if (adminlogo.length > 0) {
      values.image_source_admin_logo = JSON.stringify([...adminlogo]);
    }
    if (loginImage.length > 0) {
      values.image_source_login_image = JSON.stringify([...loginImage]);
    }
    if (otpImage.length > 0) {
      values.image_source_otp_image = JSON.stringify([...otpImage]);
    }
    if (adminLoginImg.length > 0) {
      values.image_source_admin_login_image = JSON.stringify([
        ...adminLoginImg,
      ]);
    }
    if (favIconImg.length > 0) {
      values.image_source_favicon_image = JSON.stringify([...favIconImg]);
    }

    values.brand_logo = fileListState || [];
    values.admin_logo = adminfileListState || [];
    values.back_logo = backGroundListState || [];
    values.fav_icon = faviconListState || [];
    if (get(tenantDetails, 'tenant_mode', TENANT_MODE_NORMAL === '')) {
      values.otp_logo = otpListState || [];
      values.login_logo = loginListState || [];
    }

    const trimFormValues = {};
    trimFormValues.country = isEditPhone
      ? `${countryName}`
      : get(settingData, 'country', '');
    trimPayloadFields(values, trimFormValues);
    trimFormValues.phone = isEditPhone
      ? phoneNumber.slice(countryCode.length)
      : get(settingData, 'phone', '');
    trimFormValues.country_code = IsCountryCode;
    setLoading(true);
    createOrUpdateProfile(trimFormValues, files)
      .then((result) => {
        if (result.data) {
          if (
            !isclicTenantMode &&
            !includes(paypalCurrencyCodes, values.currency)
          ) {
            const paypalPaymentMethod = paymentMethods.filter(
              (item) => item.slug === PAYMENT_METHOD_SLUG_PAYPAL
            );
            const id = get(paypalPaymentMethod, '[0].payment_method_id', '');
            updatePaymentMethodApi(id);
          }
          notification.success({ message: PROFILE_UPDATE_SUCCESS });
          fetchIntitalApiCall();
          setLoading(false);
          setIsEditPhone(false);
          setEnableSave(false);
          setMode(SCREEN_MODE_VIEW);
        } else {
          notification.error({ message: PROFILE_ADD_FAILED });
          setLoading(false);
          setIsEditPhone(false);
        }
      })
      .catch(() => {
        notification.error({ message: PROFILE_ADD_FAILED });
        setLoading(false);
        setIsEditPhone(false);
      });
  };

  // eslint-disable-next-line consistent-return
  const updateSettings = (values) => {
    setOpenTourModal(false);
    if (countryKey !== IsCountryCode.toLowerCase()) {
      return form.setFields([
        {
          name: ['country'],
          errors: ['Please select phone number matched country!'],
        },
      ]);
    }
    const isValidPostalCode = PostalCodes.validate(
      IsCountryCode,
      values.pincode
    );
    if (isValidPostalCode !== true && IsCountryCode === 'IN')
      return form.setFields([
        {
          name: 'pincode',
          errors: ['Please enter valid zip code!'],
        },
      ]);
    if (isValidPostalCode === true)
      form.setFields([
        {
          name: 'pincode',
          errors: '',
        },
      ]);
    if (isEditPhone && isValidPhoneNumber(`+${phoneNumber}`) === false) {
      form.setFields([
        {
          name: 'phone_number',
          errors: ['Please Enter your Mobile Number!'],
        },
      ]);
    } else {
      setOpenTourModal(false);
      confirm({
        title: 'Are you sure want to save the changes?',
        className:
          get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC &&
          'clic-confirm-modal',
        icon: <ExclamationCircleOutlined />,
        onOk() {
          const files = {};
          const fileData = map(fileListState, (item) => item.originFileObj);
          const adminData = map(
            adminfileListState,
            (item) => item.originFileObj
          );
          const bgData = map(backGroundListState, (item) => item.originFileObj);
          const favicon = map(faviconListState, (item) => item.originFileObj);
          if (fileData) {
            files.brand = fileData;
          }
          if (adminData) {
            files.admin = adminData;
          }
          if (bgData) {
            files.background = bgData;
          }
          if (favicon) {
            files.favicon = favicon;
          }
          if (get(tenantDetails, 'tenant_mode', false) === TENANT_MODE_NORMAL) {
            const loginData = map(loginListState, (item) => item.originFileObj);
            const otpData = map(otpListState, (item) => item.originFileObj);
            if (loginData) {
              files.login = loginData;
            }
            if (otpData) {
              files.otp = otpData;
            }
          }
          updateSettingsApi(values, files);
        },
      });
    }
  };

  const onFinish = (values) => {
    updateSettings(values);
  };

  const onChangePhoneNumber = async (phone, data) => {
    const code = get(data, 'countryCode', '');
    setIsCountryCode(code.toUpperCase());
    const countryArray = await getCountryByCode(code.toUpperCase());
    const country = await countryArray.json();
    form.setFieldsValue({ country: get(country, '[data]0.name', '') });
    if (code.toUpperCase() === 'IN') {
      getState()
        .then((resp) => {
          const stateData = get(resp, 'data', '');
          setStateList(stateData);
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
        });
    } else {
      const stateArray = await getInternationalState(code.toUpperCase());
      const state = await stateArray.json();
      setStateList(get(state, 'data', []));
    }
    if (code === IsCountryCode.toLowerCase()) {
      form.setFields([
        {
          name: ['country'],
          errors: '',
        },
      ]);
    }
    if (code !== IsCountryCode.toLowerCase()) {
      form.resetFields([
        'state_id',
        'city',
        'international_state',
        'international_city',
      ]);
    }
    setDistrictList([]);
    if (phone.length > 5) setIsError(true);
    setIsEditPhone(true);
    setCountryKey(get(data, 'countryCode', ''));
    setCountryCode(get(data, 'dialCode', ''));
    setPhoneNumber(phone);
  };

  const previousState = () => {
    fetchIntitalApiCall();
    setMode(SCREEN_MODE_VIEW);
    setEnableSave(false);
  };

  const onPrevious = () => {
    previousState();
  };

  const showCancelModal = () => {
    confirm({
      title: 'Are you sure want to cancel the changes?',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        previousState();
      },
    });
  };

  const handleCancelButton = () => {
    if (enableSave) {
      showCancelModal();
    } else onPrevious();
  };

  const TourSteps = [
    {
      selector: '.two',
      content: `Give your brand name a face by adding the logo`,
    },
    {
      selector: '.three',
      content: `Fill in the details of the business owner of the brand`,
    },
    {
      selector: '.four',
      content: `For your customer's clarity please type in the precise address`,
    },
    {
      selector: '.five',
      content: `Enter your email address to receive relevant information from Zupain`,
    },
    {
      selector: '.six',
      content: `Enter relevant information according to currency chosen`,
    },
    {
      selector: '.seven',
      content: `You're ready to move to the next milestone`,
    },
  ];

  useEffect(() => {
    if (openTourModal) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [openTourModal]);

  const completeTour = () => {
    if (openTourModal) {
      putOnboardSubGuide({
        completed: true,
        slug: 'profile',
      });
    }
  };

  return (
    <Spin spinning={loading}>
      {get(tenantDetails, 'tenant_mode', false) === TENANT_MODE_NORMAL && (
        <div>
          <Tour
            steps={TourSteps}
            isOpen={openTourModal}
            onRequestClose={() => {
              completeTour();
              setOpenTourModal(false);
            }}
            disableFocusLock
            accentColor="#38523B"
            goToStep={tourCurrentStep}
            prevStep={() => {
              if (tourCurrentStep === 1) {
                document.querySelector('#cancel-settings-profile').click();
              }
              if (tourCurrentStep > 0) {
                setTourCurrentStep(tourCurrentStep - 1);
              }
            }}
            nextStep={() => {
              if (tourCurrentStep === 0) {
                document.querySelector('#edit-settings-profile').click();
              }
              if (tourCurrentStep < TourSteps.length) {
                setTourCurrentStep(tourCurrentStep + 1);
              }
            }}
            closeWithMask={false}
          />
          <App fav_iconurl={get(settingData, 'favicon_image', '')} />
        </div>
      )}
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleOnValuesChange}
        onFinish={onFinish}
      >
        <div>
          <div className="flex-end mb-10">
            <div>
              <Space>
                <Button danger onClick={handleCancelButton} type="default">
                  Cancel
                </Button>
                <Button htmlType="submit" type="primary">
                  Save
                </Button>
              </Space>
            </div>
          </div>
        </div>
        {mobileView && (
          <div className="ml-10">
            <SettingsMobileHeading
              heading="Profile"
              Tooltip="true"
              setScreenState={setScreenState}
            />
          </div>
        )}
        {!isEmpty(settingData) && isclicTenantMode && (
          <div className="clic-profile-container">
            <Collapse
              activeKey={activeKey}
              onChange={onChange}
              expandIconPosition="right"
            >
              <Panel header="Images" key="images">
                <ImageForm
                  tenantDetails={tenantDetails}
                  backGroundListState={backGroundListState}
                  adminfileListState={adminfileListState}
                  fileListState={fileListState}
                  faviconListState={faviconListState}
                  setFileList={setFileList}
                  setbackGroundFileList={setbackGroundFileList}
                  setfaviconList={setfaviconList}
                  setAdminFileList={setAdminFileList}
                  setOtpFileList={setOtpFileList}
                  setLoginFileList={setLoginFileList}
                  loginListState={loginListState}
                  otpListState={otpListState}
                  mode={mode}
                  form={form}
                  settingData={settingData}
                  imageProps={imageProperties}
                />
              </Panel>
              <Panel header="Details" key="details">
                <DetailsForm
                  key="details"
                  form={form}
                  mode={mode}
                  settingData={settingData}
                  districtList={districtList}
                  stateList={stateList}
                  setDistrictList={setDistrictList}
                  onChangePhoneNumber={onChangePhoneNumber}
                  countryKey={countryKey}
                  countryName={countryName}
                  isError={isError}
                  phoneNumber={phoneNumber}
                  isNormalTenantMode={isNormalTenantMode}
                  setIsCountryCode={setIsCountryCode}
                  IsCountryCode={IsCountryCode}
                  setCountryName={setCountryName}
                  setStateList={setStateList}
                />
              </Panel>
              <Panel header="Configuration" key="configuration">
                <ConfigurationForm
                  key="configuration"
                  mode={mode}
                  currencyList={currency}
                  dateList={dateList}
                  tenantDetails={tenantDetails}
                />
              </Panel>
            </Collapse>
          </div>
        )}
        {!isEmpty(settingData) &&
          get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL && (
            <div className="box profile-container">
              <div className="box__content box-content-background">
                <div>
                  {!mobileView && (
                    <div className="block-header-settings">
                      <div className="center">
                        <img
                          src={medalImg}
                          alt="Brand-information-logo"
                          className="mr-8"
                        />
                        Brand Information
                      </div>
                    </div>
                  )}
                  <Row>
                    <Col xs={24} sm={24} md={24} xl={10} span={10}>
                      <ImageForm
                        tenantDetails={tenantDetails}
                        backGroundListState={backGroundListState}
                        adminfileListState={adminfileListState}
                        fileListState={fileListState}
                        faviconListState={faviconListState}
                        setFileList={setFileList}
                        setbackGroundFileList={setbackGroundFileList}
                        setfaviconList={setfaviconList}
                        setAdminFileList={setAdminFileList}
                        setOtpFileList={setOtpFileList}
                        setLoginFileList={setLoginFileList}
                        loginListState={loginListState}
                        otpListState={otpListState}
                        mode={mode}
                        form={form}
                        settingData={settingData}
                        imageProps={imageProperties}
                      />
                    </Col>
                    <Col xs={24} sm={24} md={24} xl={14} span={14}>
                      <DetailsForm
                        key="details"
                        form={form}
                        mode={mode}
                        settingData={settingData}
                        districtList={districtList}
                        stateList={stateList}
                        setDistrictList={setDistrictList}
                        onChangePhoneNumber={onChangePhoneNumber}
                        countryKey={countryKey}
                        countryName={countryName}
                        isError={isError}
                        phoneNumber={phoneNumber}
                        isNormalTenantMode={isNormalTenantMode}
                        setIsCountryCode={setIsCountryCode}
                        IsCountryCode={IsCountryCode}
                        setCountryName={setCountryName}
                        setStateList={setStateList}
                      />
                    </Col>
                  </Row>
                </div>
                {/* <div>
                  <div className="block-header mt-10">Details</div>
                </div> */}
                {/* <div>
                  <div className="block-header mt-10">configuration</div>
                  <ConfigurationForm
                    key="configuration"
                    mode={mode}
                    settingData={settingData}
                    currencyList={currency}
                    dateList={dateList}
                    tenantDetails={tenantDetails}
                    handleCurrencyChange={handleCurrencyChange}
                  />
                </div> */}
              </div>
            </div>
          )}
      </Form>
    </Spin>
  );
}
export default Profile;
