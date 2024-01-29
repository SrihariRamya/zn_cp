import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Form,
  Input,
  Button,
  Space,
  Spin,
  Switch,
  Row,
  Col,
  notification,
  Collapse,
  Modal,
} from 'antd';
import { getCode } from 'country-list';
import { EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import {
  filter,
  findKey,
  forEach,
  get,
  includes,
  isEmpty,
  isNull,
  map,
  pick,
} from 'lodash';
import Tour from 'reactour';
import { useNavigate } from 'react-router-dom';
import {
  getAllfooterDetails,
  createOrUpdateFooter,
  getTenant,
  getState,
  getDistrict,
  getAllDocuments,
  getOnboardGuide,
  putOnboardSubGuide,
  getInternationalState,
  getCitiesOfCountry,
  getSocialMedias,
} from '../../utils/api/url-helper';
import {
  FAILED_TO_LOAD,
  FOOTER_UPDATE_SUCCESS,
  FOOTER_UPDATE_FAILED,
  TENANT_MODE_CLIC,
  TENANT_MODE_NORMAL,
  SCREEN_MODE_EDIT,
  SCREEN_MODE_VIEW,
} from '../../shared/constant-values';
import {
  parseJSONSafely,
  disableTabEnterKey,
  enableTabEnterKey,
} from '../../shared/function-helper';
import FooterDocumentation from './foorter-management/footer-documentation';
import ProfileAddress from './foorter-management/profile-address';
import SocialMediaLinks from './foorter-management/social-media-links';
import { TenantContext } from '../context/tenant-context';
import SettingsMobileHeading from './setting-mobile-heading';
import PageEditor from './documentations/page-editor';

const { Panel } = Collapse;
const { confirm } = Modal;

function completeTour() {
  putOnboardSubGuide({
    completed: true,
    slug: 'footer',
  });
}

function FooterManagement(properties) {
  const { mobileView, setScreenState } = properties;
  const history = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [activeData, setactiveData] = useState([]);
  const [form] = Form.useForm();
  const [tenantData, setTenantData] = useContext(TenantContext);
  const [tenantDetails, setTenantDetails] = useState({});
  const [checkedList, setCheckedList] = useState([]);
  const [documentData, setDocumentData] = useState([]);
  const [activeKey, setActiveKey] = useState(['socialMediaLinks']);
  const [socialDisable, setSocialDisable] = useState(false);
  const [addressDisable, setAddressDisable] = useState(false);
  const [quickDisable, setQuickDisable] = useState(false);
  const [enableSave, setEnableSave] = useState(false);
  const [quickLink, setQuickLink] = useState([]);
  const [socialEnable, setSocialEnable] = useState([]);
  const [socialRemove, setSocialRemove] = useState();
  const [quickLinkDisable, setQuickLinkDisable] = useState([]);
  const [IsCountryCode, setIsCountryCode] = useState('');
  const [openTourModal, setOpenTourModal] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [intialState, setInitialState] = useState([]);
  const [tourCurrentStep, setTourCurrentStep] = useState(0);
  const [socialMediaList, setSocialMediaList] = useState([]);
  const [validateData, setValidateData] = useState({});
  const isclicTenantMode =
    get(tenantData, 'tenant_mode', '') === TENANT_MODE_CLIC;
  const isNormalTenantMode =
    get(tenantData, 'tenant_mode', '') === TENANT_MODE_NORMAL;
  const [mode, setMode] = useState(SCREEN_MODE_EDIT);
  const [openDocumentModal, setOpenDocumentModal] = useState(false);

  const TourSteps = [
    {
      content: `There's a high correlation between social media presence & sales.And we'll help you to benefit from it.`,
    },
    {
      selector: '.logo-tag',
      content: `Add a tagline for you customer to relate to your brand better`,
    },
    {
      selector: '#social-media-links',
      content: `Enable social media links to showcase your online presencece`,
    },
    {
      selector: '#fb',
      content: `Enable Facebook and add it's link `,
    },
    {
      selector: '#other-social-media',
      content: `add other social media links`,
    },
    {
      selector: '#whatsapp',
      content: `Enter your whatsapp Number. Your customers will be able to chat from your store using this`,
    },
    {
      selector: '#column2',
      content: `Enter the communication address`,
    },
    {
      selector: '#column3',
      content: `Enable the documents for visibility in footer`,
    },
    {
      selector: '.footer-form-submit',
      content: `Congratulations! now let's move to the next step`,
      action: (node) => {
        node.addEventListener('click', () => {
          setOpenTourModal(false);
        });
      },
    },
  ];

  useEffect(() => {
    if (openTourModal) {
      disableTabEnterKey();
    } else {
      enableTabEnterKey();
    }
  }, [openTourModal]);

  useEffect(() => {
    if (openTourModal) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [openTourModal]);

  const onAddressCallback = async (countryCode, resp, data) => {
    const stateArray = await getInternationalState(countryCode);
    const state = await stateArray.json();
    setStateList(get(state, 'data', []));
    const filterSelectedState = filter(
      get(state, 'data', []),
      (item) =>
        item.name ===
        (isEmpty(data)
          ? get(resp, '[2].data.setting.international_state', '')
          : get(data, 'international_state.key', ''))
    );
    const cityArray = await getCitiesOfCountry(
      countryCode,
      get(filterSelectedState, '0.iso2', '')
    );
    const city = await cityArray.json();
    const isoCode = get(filterSelectedState, '0.iso2', '');
    const filterCity = filter(
      get(city, 'data', []),
      (element) => element.state_code === isoCode
    );
    setDistrictList(filterCity);
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    let apiArray = [
      getAllfooterDetails(),
      getState(),
      getTenant(),
      getAllDocuments(),
      getSocialMedias({ is_active: 1 }),
    ];
    if (isNormalTenantMode) apiArray = [...apiArray, getOnboardGuide()];
    Promise.all(apiArray).then(async (resp) => {
      setInitialState(resp);
      if (isNormalTenantMode) {
        const guide = resp[5].data.find((index) =>
          index.subGuide.find((index_) => index_.slug === 'footer')
        );
        const subGuide = guide.subGuide.find(
          (index_) => index_.slug === 'footer'
        );
        const isSocialMediaCreated = get(subGuide, 'completed', false);
        setOpenTourModal(!isSocialMediaCreated);
      }
      setSocialMediaList(get(resp, '[4].data.rows', ''));
      const data = get(resp, '[0].data.data', []);
      setactiveData(data);
      setDocumentData(get(resp, '[3].data.rows', []));
      data.map((item) =>
        form.setFieldsValue({ [item.header]: { is_active: item.is_active } })
      );
      if (data) {
        if (get(data, '[1].is_active', false) === false)
          setAddressDisable(true);
        if (get(data, '[0].is_active', false) === false) setSocialDisable(true);
        if (get(data, '[2].is_active', false) === false) setQuickDisable(true);
      }

      const countryCode = get(resp, '[2].data.setting.country_code', '');
      setIsCountryCode(isNull(countryCode) ? '' : countryCode);
      const footerData = get(resp, '[0].data.data', []);
      const parseData = parseJSONSafely(get(footerData, '[1].data_list', ''));
      const condtion = isNull(parseData)
        ? false
        : Object.hasOwn(parseData, 'international_state');

      setIsValid(condtion);
      const cityData = get(resp, '[2].data.setting', '');
      if (isEmpty(countryCode) || countryCode === 'IN' || !condtion) {
        const stateData = get(resp, '[1].data', '');
        setStateList(stateData);
        cityData.state_id = { key: cityData.state_id };
        cityData.city = { key: cityData.city };
      }
      if (cityData.pincode === 0) {
        cityData.pincode = '';
      }
      if (!isEmpty(cityData.internationalState)) {
        cityData.country = get(parseData, '[2].country', '');
      }
      const stateID = parseJSONSafely(get(data, '[1].data_list', ''));
      const stateValue = get(stateID, 'state_id.key', '');
      if (!isEmpty(countryCode) && countryCode !== 'IN' && condtion) {
        const getCountryCode = getCode(parseData.country);
        const code =
          getCountryCode === countryCode ? countryCode : getCountryCode;
        onAddressCallback(code, resp, parseData);
      } else if (stateValue) {
        await getDistrict(stateValue)
          .then((response) => {
            setDistrictList(get(response, 'dataset', []));
          })
          .catch(() => {
            notification.error({ message: FAILED_TO_LOAD });
          });
      } else {
        await getDistrict(get(cityData, 'state_id.key', ''))
          .then((response) => {
            setDistrictList(get(response, 'dataset', []));
          })
          .catch(() => {
            notification.error({ message: FAILED_TO_LOAD });
          });
      }
      form.setFieldsValue(cityData);
      setTenantDetails((previous) => {
        return previous === get(resp, '[2].data', {})
          ? setTenantData
          : get(resp, '[2].data', {});
      });
      setTenantDetails(get(resp, '[2].data.setting', {}));
      const currentFooterData = get(resp, '[0].data.data', []);
      const socialData = parseJSONSafely(
        get(currentFooterData, '[0].data_list', '')
      );
      const addData = parseJSONSafely(
        get(currentFooterData, '[1].data_list', '')
      );
      const quickJsonData = parseJSONSafely(
        get(currentFooterData, '[2].data_list', '')
      );
      const quickLinkData = get(quickJsonData, 'quickLinks', []);

      const socialReference = {
        fb_is_active: 'facebook',
        insta_is_active: 'insta',
        linkedin_is_active: 'linkedin',
        twiter_is_active: 'twitter',
        whatsapp_is_active: 'whatsapp',
      };
      const socialKey = Object.keys(socialData);
      const referenceKey = Object.keys(socialReference);
      let socialArray = [...socialEnable];
      forEach(socialKey, (x) => {
        if (includes(referenceKey, x) && socialData[x]) {
          socialArray = [...socialArray, socialReference[x]];
        }
      });

      forEach(get(quickJsonData, 'quickLinks'), (link, index) => {
        if (link[`quickLink_active_${index + 1}`]) {
          socialArray = [...socialArray, `column-${index + 1}`];
        }
      });
      setSocialEnable([...socialArray]);

      setQuickLink(quickLinkData);
      form.setFieldsValue(socialData);
      form.setFieldsValue(addData);
      quickLinkData.map((_item, index) =>
        form.setFieldsValue(quickLinkData[index])
      );
      const disableData = quickLinkData.map((_item, index) => {
        form.setFieldsValue(quickLinkData[index]);
        if (_item[`quickLink_document_${index + 1}`]) {
          return {
            [`quickLink_document_${index + 1}`]: false,
            [`quickLink_hyperlink_${index + 1}`]: true,
          };
        }
        return {
          [`quickLink_document_${index + 1}`]: true,
          [`quickLink_hyperlink_${index + 1}`]: false,
        };
      });
      setQuickLinkDisable(disableData);
      setLoading(false);
    });
  }, [form]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    switch (socialRemove) {
      case 'facebook': {
        form.validateFields(['facebook_hyperlink']);
        break;
      }
      case 'insta': {
        form.validateFields(['instagram_hyperlink']);
        break;
      }
      case 'twitter': {
        form.validateFields(['twitter_hyperlink']);
        break;
      }
      case 'linkedin': {
        form.validateFields(['linkedin_hyperlink']);
        break;
      }
      case 'whatsapp': {
        form.validateFields(['whatsapp_hyperlink']);
        break;
      }
      default: {
        form.validateFields([]);
      }
    }
  }, [socialRemove]);

  const socialmediaName = map(
    socialMediaList,
    (item) => item?.social_media_name
  );

  const socialmediaStatus = map(
    socialMediaList,
    (item) => `${item?.social_media_name}_status`
  );

  const onFinish = (values) => {
    setLoading(true);
    setOpenTourModal(false);
    const objectEntries = Object.entries(values).map((index) => ({
      [index[0]]: index[1],
    }));
    const quickLinksFilter = objectEntries.filter((item) => {
      return String(Object.keys(item)[0])?.startsWith('quickLink');
    });
    const quickLinks = quickLink.map((item) => {
      const quickLinkSubFilter = quickLinksFilter.filter((element) => {
        return (
          Object.keys(element)[0]?.slice(
            Math.max(0, Object.keys(element)[0].lastIndexOf('_') + 1)
          ) === item.id.toString()
        );
      });

      const addId = Object.assign({}, ...quickLinkSubFilter);
      addId.id = item.id;
      return addId;
    });
    const settingsDetail = ['quick_links', 'logo_tag_link', 'address'];
    const addressDetail = [
      'address_1',
      'address_2',
      'country',
      'pincode',
      'state_id',
      'city',
      'footer_address',
      'international_state',
      'international_city',
    ];
    const quickDetail = ['qucik_link'];

    const defaultSocialDetails = [
      'social_network',
      'facebook_hyperlink',
      'fb_is_active',
      'instagram_hyperlink',
      'insta_is_active',
      'linkedin_hyperlink',
      'linkedin_is_active',
      'twitter_hyperlink',
      'twiter_is_active',
      'youtube_hyperlink',
      'youtube_is_active',
      'whatsapp_hyperlink',
      'whatsapp_is_active',
    ];

    const socialDetail = [
      ...socialmediaName,
      ...socialmediaStatus,
      ...defaultSocialDetails,
    ];

    const addSettingsData = pick(values, settingsDetail);
    const addAddress = pick(values, addressDetail);
    const addQuickLinks = pick(values, quickDetail);
    const addSocial = pick(values, socialDetail);

    addQuickLinks.quickLinks = quickLinks;
    addAddress.header = 'footer_address';
    addSocial.header = 'social_network';
    addQuickLinks.header = 'qucik_link';
    const formData = {
      addSettingsData,
      addAddress,
      addQuickLinks,
      addSocial,
      tenant_id: get(tenantDetails, 'zmTenantTenantId', ''),
      country_code: isEmpty(IsCountryCode) ? '' : IsCountryCode,
    };
    createOrUpdateFooter(formData)
      .then((result) => {
        if (result) {
          completeTour();
          notification.success({ message: FOOTER_UPDATE_SUCCESS });
          form.resetFields();
          fetchData();
          setEnableSave(false);
          setMode(SCREEN_MODE_EDIT);
        } else {
          notification.error({ message: FOOTER_UPDATE_FAILED });
          setLoading(false);
        }
      })
      .catch(() => {
        notification.error({ message: FOOTER_UPDATE_FAILED });
        setLoading(false);
      });
  };

  const handleStateChange = async (key, value) => {
    if (!isEmpty(IsCountryCode) && IsCountryCode !== 'IN') {
      const cityArray = await getCitiesOfCountry(IsCountryCode, value.key);
      const city = await cityArray.json();
      const filterCity = filter(
        get(city, 'data', []),
        (element) => element.state_code === value.key
      );
      setDistrictList(filterCity);
    } else {
      getDistrict(value?.value)
        .then((data) => {
          setDistrictList(get(data, 'dataset', ''));
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
        });
    }
    form.resetFields(['city', 'international_city']);
  };

  const urlValidator = {
    validator(_, value) {
      const nospecial =
        /^https?:\/\/(?:www\.)?[\w#%+.:=@~-]{1,256}\.[\d()A-Za-z]{1,6}\b[\w#%&()+./:=?@~-]*$/;
      if (value && !nospecial.test(value)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('Invalid URL');
      }
      return Promise.resolve();
    },
  };

  const phoneValidator = {
    validator(_, value) {
      const pattern = /^(\+\d{1,3}[ -]?)?\d{10}$/;
      if (value && !pattern.test(value)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('Invalid Phone Number');
      }
      return Promise.resolve();
    },
  };

  const onChange = (event) => {
    const stateId = get(tenantDetails, 'state_id.key', '');
    const internationalState = get(tenantDetails, 'international_state', '');
    const internationalCity = get(tenantDetails, 'international_city', '');
    if (!event.target.checked && isEmpty(internationalState))
      getDistrict(stateId)
        .then((data) => {
          const districtValue = get(data, 'dataset', []);
          setDistrictList(districtValue);
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
        });
    const key = stateId;
    const value = get(tenantDetails, 'city.key', '');
    const tenantValues = {
      address_1: get(tenantDetails, 'address_1', ''),
      address_2: get(tenantDetails, 'address_2', ''),
      city: { value },
      country: get(tenantDetails, 'country', ''),
      state_id: { key },
      pincode: get(tenantDetails, 'pincode', ''),
    };
    const countryName = get(tenantDetails, 'country', '');
    const getCountryCode =
      getCode(countryName) || get(tenantDetails, 'country_code', '');
    if (getCountryCode === 'IN') {
      setIsValid(false);
      getState()
        .then((resp) => {
          const stateData = get(resp, 'data', '');
          setStateList(stateData);
        })
        .catch((error) => {
          notification.error({
            message: get(error, 'message', FAILED_TO_LOAD),
          });
        });
      getDistrict(stateId)
        .then((data) => {
          const districtValue = get(data, 'dataset', []);
          setDistrictList(districtValue);
        })
        .catch((error) => {
          notification.error({
            message: get(error, 'message', FAILED_TO_LOAD),
          });
        });
    } else {
      setIsValid(true);
    }
    setIsCountryCode(getCountryCode);

    const addressValues = {
      address_1: '',
      address_2: '',
      city: '',
      country: '',
      state_id: '',
      pincode: '',
      international_city: '',
      international_state: '',
    };
    tenantValues.international_city = {
      label: internationalCity,
      value: internationalCity,
      key: internationalCity,
    };
    tenantValues.international_state = {
      label: internationalState,
      value: internationalState,
      key: internationalState,
    };
    if (event.target.checked && !isEmpty(internationalState)) {
      onAddressCallback(IsCountryCode, intialState);
    }
    setCheckedList(
      event.target.checked
        ? form.setFieldsValue(tenantValues)
        : form.setFieldsValue(addressValues)
    );
    setEnableSave(true);
  };

  const handleCountryChange = async (key) => {
    const getCountryCode = getCode(key);
    setIsCountryCode(getCountryCode);
    if (getCountryCode === 'IN') {
      getState()
        .then((resp) => {
          const stateData = get(resp, 'data', '');
          setStateList(stateData);
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
        });
    } else {
      const stateArray = await getInternationalState(getCountryCode);
      const state = await stateArray.json();
      setStateList(get(state, 'data', []));
      setIsValid(true);
    }
    form.resetFields([
      'state_id',
      'city',
      'international_state',
      'international_city',
    ]);
  };

  const onAddressChange = (checked, event) => {
    setAddressDisable(!checked);
    if (isclicTenantMode) {
      event.stopPropagation();
    }
  };
  const onSocialChange = (checked, event) => {
    setSocialDisable(!checked);
    if (isclicTenantMode) {
      event.stopPropagation();
    }
  };

  const previousState = () => {
    fetchData();
    setMode(SCREEN_MODE_EDIT);
    setEnableSave(false);
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

  const handleCancel = () => {
    if (enableSave) {
      showCancelModal();
    } else previousState();
  };

  const onQuickChange = (checked) => {
    setQuickDisable(!checked);
  };

  const openDocumentation = () => {
    setOpenDocumentModal(true);
  };

  const handleOnValuesChange = (values) => {
    if (values) {
      setEnableSave(true);
    }
  };

  const addQuickLink = () => {
    const id = quickLink.length + 1;
    const addObject = {
      id,
      [`quickLink_listName_${id}`]: '',
      [`quickLink_hyperlink_${id}`]: '',
      [`quickLink_active_${id}`]: false,
      [`quickLink_document_${id}`]: '',
    };
    form.setFieldsValue(addObject);
    setQuickLink([...quickLink, addObject]);
    setEnableSave(true);
    setQuickLinkDisable([
      ...quickLinkDisable,
      {
        [`quickLink_document_${id}`]: true,
        [`quickLink_hyperlink_${id}`]: false,
      },
    ]);
  };
  const removeQuickLinks = (parameters) => {
    if (quickLink.length <= 3) return;
    const quickLinkFilter = filter(
      quickLink,
      (item_) => item_.id !== parameters
    );
    const quickLinkEvaluate = map(quickLinkFilter, (item, index) => ({
      id: index + 1,
      [`quickLink_listName_${index + 1}`]: get(
        item,
        findKey(item, (_item_, key) => includes(key, 'listName'))
      ),
      [`quickLink_hyperlink_${index + 1}`]: get(
        item,
        findKey(item, (_item_, key) => includes(key, 'hyperlink'))
      ),
      [`quickLink_active_${index + 1}`]: get(
        item,
        findKey(item, (_item_, key) => includes(key, 'active'))
      ),
      [`quickLink_document_${index + 1}`]: get(
        item,
        findKey(item, (_item_, key) => includes(key, 'document'))
      ),
    }));
    quickLinkEvaluate.map((_item, _index) =>
      form.setFieldsValue(quickLinkEvaluate[_index])
    );
    setQuickLink(quickLinkEvaluate);
    setEnableSave(true);
  };

  const checkDisabled = (item, checked) => {
    let fieldDisable = {};
    if (checked) {
      fieldDisable = {
        [`quickLink_document_${item.id}`]: false,
        [`quickLink_hyperlink_${item.id}`]: true,
      };
      form.resetFields([`quickLink_hyperlink_${item.id}`]);
    } else {
      fieldDisable = {
        [`quickLink_document_${item.id}`]: true,
        [`quickLink_hyperlink_${item.id}`]: false,
      };
      form.resetFields([`quickLink_document_${item.id}`]);
    }
    const disableData = [...quickLinkDisable];
    disableData[item.id - 1] = fieldDisable;
    setQuickLinkDisable(disableData);
  };

  const getDisableValues = (index, type) => {
    if (quickLinkDisable[index]) {
      return quickLinkDisable[index][`quickLink_${type}_${index + 1}`];
    }
    return true;
  };

  const onChangeCollapse = (key) => {
    setActiveKey(key);
  };

  const SocialMediaLinkProperties = {
    socialDisable,
    setSocialEnable,
    socialEnable,
    setSocialRemove,
    urlValidator,
    phoneValidator,
    activeData,
    onSocialChange,
    isNormalTenantMode,
    mode,
    form,
    validateData,
  };
  const profileAddressProperties = {
    activeData,
    onAddressChange,
    onChange,
    addressDisable,
    checkedList,
    IsCountryCode,
    handleStateChange,
    isValid,
    stateList,
    handleCountryChange,
    districtList,
    isNormalTenantMode,
    mode,
  };
  const footerDocumentationProperties = {
    activeData,
    onQuickChange,
    quickDisable,
    openDocumentation,
    quickLink,
    setSocialEnable,
    socialEnable,
    setSocialRemove,
    getDisableValues,
    urlValidator,
    checkDisabled,
    documentData,
    addQuickLink,
    removeQuickLinks,
    mode,
    mobileView,
  };

  return (
    <Spin spinning={loading}>
      {mobileView && (
        <div className="ml-10">
          <SettingsMobileHeading
            heading="Store Feature"
            Tooltip="true"
            setScreenState={setScreenState}
          />
        </div>
      )}
      <div className="box mobile-side-padding">
        <div
          className={
            isNormalTenantMode && 'box__content box-content-background'
          }
        >
          <Form
            form={form}
            layout="vertical"
            scrollToFirstError
            onFinish={onFinish}
            onFinishFailed={() => setOpenTourModal(false)}
            onValuesChange={handleOnValuesChange}
            className="footer-manage-form-box"
          >
            {isclicTenantMode && (
              <div>
                <div className="flex-end mb-10">
                  {mode === SCREEN_MODE_EDIT ? (
                    <div>
                      <Space>
                        <Button danger onClick={handleCancel}>
                          cancel
                        </Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="footer-form-submit"
                        >
                          Save
                        </Button>
                      </Space>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setMode(SCREEN_MODE_EDIT);
                      }}
                      type="primary"
                      icon={<EditOutlined />}
                    >
                      Edit Settings
                    </Button>
                  )}
                </div>
              </div>
            )}
            {!isEmpty(tenantDetails) && isNormalTenantMode && (
              <div>
                <Form.Item
                  label="Logo Description"
                  name="logo_tag_link"
                  className="logo-tag"
                >
                  <Input placeholder="Logo Description" />
                </Form.Item>
              </div>
            )}
            <div>
              <Row>
                <Col flex={3}>
                  {isclicTenantMode && (
                    <div className="clic-footer-container mb-20">
                      <Collapse
                        accordion
                        onChange={onChangeCollapse}
                        expandIconPosition="right"
                        activeKey={activeKey}
                      >
                        <Panel
                          header={
                            <span
                              className="active-class"
                              id="social-media-links"
                            >
                              <Form.Item
                                name={[
                                  get(activeData, '[0].header', ''),
                                  'is_active',
                                ]}
                                valuePropName="checked"
                                className="social-media-switch"
                              >
                                <Switch
                                  className="social-media-link-switch"
                                  size="small"
                                  onChange={onSocialChange}
                                  disabled={mode === SCREEN_MODE_VIEW}
                                />
                              </Form.Item>
                              <span className="switch-class">
                                Social Media Links
                              </span>
                            </span>
                          }
                          key="socialMediaLinks"
                        >
                          <SocialMediaLinks {...SocialMediaLinkProperties} />
                        </Panel>
                        <Panel
                          header={
                            <span className="active-class">
                              <Form.Item
                                name={[
                                  get(activeData, '[1].header', ''),
                                  'is_active',
                                ]}
                                valuePropName="checked"
                                className="social-media-switch"
                              >
                                <Switch
                                  size="small"
                                  onChange={onAddressChange}
                                  disabled={mode === SCREEN_MODE_VIEW}
                                />
                              </Form.Item>
                              <span className="switch-class">Profile</span>
                            </span>
                          }
                          key="ProfileAddress"
                        >
                          <ProfileAddress {...profileAddressProperties} />
                        </Panel>
                      </Collapse>
                    </div>
                  )}
                  {!isEmpty(tenantDetails) && isNormalTenantMode && (
                    <>
                      <SocialMediaLinks {...SocialMediaLinkProperties} />
                      <ProfileAddress {...profileAddressProperties} />
                      <FooterDocumentation {...footerDocumentationProperties} />
                      <Row className="mt-20 res-center ">
                        <Col>
                          <Form.Item>
                            <Space>
                              <Button
                                type="primary"
                                htmlType="submit"
                                className="footer-form-submit"
                                // disabled={!enableSave}
                              >
                                Save
                              </Button>
                              <Button danger onClick={previousState}>
                                cancel
                              </Button>
                            </Space>
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )}
                </Col>
              </Row>
            </div>
          </Form>
        </div>
      </div>
      <Modal
        title="Page Editor"
        open={openDocumentModal}
        footer={false}
        width={989}
        className="settings-payment-modal"
        onCancel={() => setOpenDocumentModal(false)}
      >
        <PageEditor />
      </Modal>
      <Tour
        steps={TourSteps}
        isOpen={openTourModal}
        onRequestClose={() => {
          completeTour();
          setOpenTourModal(false);
        }}
        goToStep={tourCurrentStep}
        prevStep={() => {
          if (tourCurrentStep > 0) {
            setTourCurrentStep(tourCurrentStep - 1);
          }
        }}
        nextStep={() => {
          if (tourCurrentStep < TourSteps.length) {
            setTourCurrentStep(tourCurrentStep + 1);
          }
        }}
        accentColor="#38523B"
        disableFocusLock
        closeWithMask={false}
      />
    </Spin>
  );
}

export default FooterManagement;
