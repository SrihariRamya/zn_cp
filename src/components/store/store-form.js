/* eslint-disable no-shadow */
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Input,
  Select,
  Space,
  Typography,
  Modal,
  Checkbox,
  Spin,
  Button,
  Form,
  notification,
  Tooltip,
  Switch,
  Collapse,
  Tour,
} from 'antd';
import './store.less';
import axios from 'axios';
import _, {
  uniqBy,
  differenceBy,
  get,
  isEmpty,
  floor,
  sortBy,
  map,
  filter,
  forEach,
} from 'lodash';
import { isValidPhoneNumber } from 'libphonenumber-js';
import Geocode from 'react-geocode';
import PostalCodes from 'postal-codes-js';
import { InfoCircleOutlined } from '@ant-design/icons';
import ImageUploadModal from '../products/image-modal';
import GoogleMaps from './google-maps';
import {
  createStore,
  editStore,
  getState,
  getPOS,
  getCentralStoreDetail,
  getOneStore,
  getStorePOS,
  getDistrict,
  getSubDistrict,
  getLocality,
  getPincodeDetail,
  pincodeValidation,
  deleteRedisStoreLocationData,
  putOnboardSubGuide,
  getInternationalState,
  getCitiesOfCountry,
} from '../../utils/api/url-helper';
import {
  STORE_ADD_SUCCESS,
  STORE_UPDATE_SUCCESS,
  STORE_ADD_FAILED,
  STORE_UPDATE_FAILED,
  FAILED_TO_LOAD,
  FAILED_TO_DELETE_REDIS_KEY,
} from '../../shared/constant-values';
import gps from '../../assets/gps.svg';
import { ReactComponent as Stores } from '../../assets/icons/store-icon.svg';
import { ReactComponent as LeftArrow } from '../../assets/icons/leftarrow.svg';
import { getBase64 } from '../../shared/attributes-helper';
import getFormItemRules, {
  trimPayloadFields,
  handleKeyDown,
} from '../../shared/form-helpers';
import {
  getArea,
  getCity,
  getLocation,
  getStateName,
  nameFormatter,
} from '../../shared/map-helper';
import { getOptionValues } from '../../shared/store-helper';
import { TenantContext } from '../context/tenant-context';
import { defaultImage } from '../../shared/image-helper';
import {
  disableTabEnterKey,
  enableTabEnterKey,
  eventTrack,
} from '../../shared/function-helper';
import { StoreContext } from '../context/store-form-context';
import { withRouter } from '../../utils/react-router/index';
import StoreMobileForm from './store-mobile-view/store-mobile-form';
import LocationForm from './location-form';
import { ReactComponent as Group } from '../../assets/Group.svg';
import { MilestoneContext } from '../context/milestone-context';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

function StoreForm(properties) {
  const navigate = useNavigate();
  const tenantConfig = useContext(TenantContext)[3];
  const mobileView = useContext(TenantContext)[4];
  const googleMapApiKey = get(tenantConfig, 'GoogleMapAPi', '');
  const [storeDetails, setStoreDetails] = useContext(StoreContext);
  const [form] = Form.useForm();
  const [location, setLocation] = useState();
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState(false);
  const [fileListArray, setFileListArray] = useState([]);
  const [storeID] = useState(window.location.href.split('/')[5]);
  const [stateData, setStateData] = useState([]);
  const [storeRecord, setStoreRecord] = useState({});
  // const [, setPosData] = useState([]);
  // const [, setPOSIDs] = useState([]);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [checkValue, setCheckValue] = useState({});
  const [districtData, setDistrictData] = useState([]);
  const [subDistrictData, setSubDistrictData] = useState([]);
  const [previousValue, setPreviousValue] = useState();
  const [pincodeCheck, setPincodeCheck] = useState(true);
  const [isCountryCode, setIsCountryCode] = useState('');
  const [selectedStateData, setSelectedStateData] = useState([]);
  const [selectedSubDistributionData, setSelectedSubDistributionData] =
    useState([]);
  const [selectedDistributionData, setSelectedDistributionData] = useState([]);
  const [selectedPincodeData, setSelectedPincodeData] = useState([]);
  const [deliveryLocActive, setDeliveryLocActive] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [isError, setIsError] = useState(false);
  const [isEditPhone, setIsEditPhone] = useState(false);
  const [storeObject, setStoreObject] = useState({});
  const [districtId, setDistrictId] = useState('');
  const [, setFileUploadCount] = useState(0);
  const [googleMapVisible, setGoogleMapVisible] = useState(false);
  const [metaArray, setMetaArray] = useState([]);
  const [formData, setFormData] = useState();
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [useMyLocationAddress, setUseMyLocationAddress] = useState('');
  const [uploadObject, setUploadObject] = useState([
    { id: 1, isDisable: true, url: '' },
  ]);
  const [openTourModal, setOpenTourModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completeModal, setCompleteModal] = useState(false);
  const formReference = useRef();
  const { fetchTourData } = useContext(MilestoneContext);

  const nextStepTour = () => {
    setCurrentStep(currentStep + 1);
    const currentStepActive = currentStep + 1;
    if (window.innerWidth > 700) {
      const storeLocationButton = document.querySelector(
        '#store-current-location'
      );
      const storeMap = document.querySelector('#map-milestone');
      if (currentStepActive === 4) {
        storeLocationButton.classList.add('zIndextour');
        storeMap.classList.remove('zIndextour');
      } else if (currentStepActive === 5) {
        storeMap.classList.add('zIndextour');
        storeLocationButton.classList.remove('zIndextour');
        storeLocationButton.classList.remove('zIndextour');
      } else {
        storeMap.classList.remove('zIndextour');
      }
    }
  };

  const handleSkip = () => {
    setOpenTourModal(false);
    setCurrentStep(0);
  };

  const cancelModal = () => {
    setCompleteModal(false);
  };

  const openModalComplete = () => {
    formReference.current.submit();
  };

  const previousStepTour = () => {
    setCurrentStep(currentStep - 1);
    const currentStepActive = currentStep - 1;
    if (window.innerWidth > 700) {
      const storeLocationButton = document.querySelector(
        '#store-current-location'
      );
      const storeMap = document.querySelector('#map-milestone');
      if (currentStepActive === 4) {
        storeLocationButton.classList.add('zIndextour');
        storeMap.classList.remove('zIndextour');
      } else if (currentStepActive === 5) {
        storeMap.classList.add('zIndextour');
        storeLocationButton.classList.remove('zIndextour');
      } else {
        storeLocationButton.classList.remove('zIndextour');
        storeMap.classList.remove('zIndextour');
      }
    }
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
            &quot;Time to name your store! Just type your store&apos;s name in
            the text box. Make it unique and memorable, it&apos;s your
            brand&apos;s first impression.&quot;
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
        const elements = document.querySelectorAll('.store_name');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            &quot;Connect with your customers! Simply enter your store&apos;s
            phone number in the field box. This way, they can reach you easily.
            Your store &apos;s success is just a call away&quot;
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
        const elements = document.querySelectorAll('.store-phone');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Enter the name of your store&apos;s contact person in the field box.
            This way, customers know whom to reach out for assistance and
            inquiries. It adds a personal touch to your business!
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
        const elements = document.querySelectorAll('.store_person_name');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            &quot;Let&apos;s find your store! Just click &apos;{' '}
            <b style={{ color: '#0B3D60' }}>Use My Current Location,&apos;</b>{' '}
            and we&apos;ll fill in the address for you. Easy, right? Your
            store&apos;s address is crucial for customers to locate you. &quot;
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
        const elements = document.querySelectorAll('.store-address-details');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            &quot;Great job!{' '}
            <b style={{ color: '#0B3D60' }}>
              We&apos;ve filled in your address using your current location.
            </b>{' '}
            Now, click Save & move on to the next step. Your store&apos;s
            address is set, and you&apos;re one step closer to success! &quot;
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
                  onClick={openModalComplete}
                >
                  Save
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.store-location');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
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

  const handlePincodeInput = (value) => {
    if (pincodeCheck || value?.toString().length === 6) {
      setLoading(true);
      if (pincodeCheck) {
        const apiArray = [
          getDistrict(value.state),
          getSubDistrict(value.district),
          getLocality(value.subdistrict),
        ];
        Promise.all(apiArray)
          .then((response) => {
            const district = _.get(response, '[0].dataset', []);
            const result = _.find(get(response, '[0].dataset', []), {
              district_id: Number(get(value, 'district', '')),
            });
            const subDistrict = _.get(response, '[1].dataValue', []);
            setSubDistrictData(subDistrict);
            setDistrictData(district);
            setDistrictId(get(result, 'district_id', ''));
            form.setFieldsValue({
              district: _.get(result, 'district_id', ''),
              subdistrict: _.get(value, 'subdistrict', ''),
              district_name: _.get(result, 'district_id', ''),
            });
            setLoading(false);
          })
          .catch(() => {
            notification.error({ message: FAILED_TO_LOAD });
          });
      } else {
        getPincodeDetail(value)
          .then((response) => {
            const pincode = _.get(response, 'datasets', []);
            setSubDistrictData([_.get(pincode, '[0].localities', [])]);
            setDistrictData([
              _.get(pincode, '[0].locality_by_district_id', []),
            ]);
            form.setFieldsValue({
              state: _.get(pincode, '[0].locality_by_state_id.id', ''),
              district: _.get(
                pincode,
                '[0].locality_by_district_id.district_id',
                ''
              ),
              subdistrict: _.get(pincode, '[0].localities.sub_district_id', ''),
            });
            setLoading(false);
          })
          .catch(() => {
            notification.error({ message: FAILED_TO_LOAD });
          });
      }
    }
  };

  const handleLocationByFilter = (subDistrictdatas, localityDatas) => {
    const convertedData = {};
    forEach(subDistrictdatas, (item) => {
      const stateId = item.state_id;
      const districtIds = item.district_id;
      const subDistrictId = item.sub_district_id;
      if (!convertedData[stateId]) {
        convertedData[stateId] = {
          stateData: stateId,
          districtData: [],
          subDistrictData: [],
          localityData: [],
        };
      }

      if (!convertedData[stateId].districtData.includes(districtIds)) {
        convertedData[stateId].districtData.push(districtIds);
      }

      convertedData[stateId].subDistrictData.push(subDistrictId);
    });

    forEach(localityDatas, (item) => {
      const stateId = item.state_id;
      const localityData = item.locality_id;
      convertedData[stateId].localityData.push(localityData);
    });
    const resultArray = Object.values(convertedData);
    setFormData(resultArray);
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    setPincodeCheck(true);
    const apiArray = [
      storeID && getOneStore({ store_uid: storeID }),
      getState(),
      getPOS(),
      getStorePOS(),
      getCentralStoreDetail(),
    ];
    Promise.all(apiArray)
      .then(async (resp) => {
        const subDistrictdatas = get(resp, '[0].subDistrictdata', []);
        const localityDatas = get(resp, '[0].localityData', []);
        handleLocationByFilter(subDistrictdatas, localityDatas);
        const tourDataValues = await fetchTourData();
        const storeDatas = get(tourDataValues, 'data.[0]');
        const storeTourDatas = get(storeDatas, 'subGuide.[0]');
        const isOneStoreCreated = _.get(storeTourDatas, 'completed', false);
        if (!mobileView) {
          setOpenTourModal(!isOneStoreCreated);
        }
        const storeData = _.get(resp, '[0].data', {});
        map(uploadObject, (value) => {
          value.productImageInfo = { product_image: storeData?.image };
          return value;
        });
        const intrCode = get(storeData, 'international_code', '');
        setIsCountryCode(intrCode);
        const locality = _.get(resp, '[0].localityData', []);
        const uniqLocality = uniqBy(locality, 'locality_name');
        const finalLocality = uniqBy(uniqLocality, 'pincode');
        setSelectedStateData(get(resp, '[0].stateData', []));
        setSelectedDistributionData(get(resp, '[0].districtData', []));
        setSelectedSubDistributionData(get(resp, '[0].subDistrictdata', []));
        setStoreObject(_.get(resp, '[0].data', {}));
        setSelectedPincodeData(finalLocality);
        const statesData = await getOptionValues({
          data: get(resp, '[0].stateData', []),
          keyId: 'id',
          labelName: 'state_name',
        });
        const districData = await getOptionValues({
          data: get(resp, '[0].districtData', []),
          keyId: 'district_id',
          labelName: 'district_name',
        });
        const subDistributionData = await getOptionValues({
          data: get(resp, '[0].subDistrictdata', []),
          keyId: 'sub_district_id',
          labelName: 'sub_district_name',
        });
        const pincodeData = await getOptionValues({
          data: finalLocality,
          keyId: 'locality_id',
          labelName: 'pincode',
        });
        storeData.delivery_state = statesData;
        storeData.delivery_district = districData;
        storeData.delivery_subdistrict = subDistributionData;
        storeData.delivery_pincode = pincodeData;
        storeData.store_person_number = `${get(
          storeData,
          'country_code',
          ''
        )} ${get(storeData, 'store_person_number', '')}`;
        if (storeID) {
          const posArray = _.get(storeData, 'storePOS', []).map(
            (result) => result.pos_uid
          );
          const imageData = [
            {
              url: storeData.image || defaultImage,
              status: 'done',
              name: storeData.image_name || 'NO IMAGE',
            },
          ];
          storeData.pos_uid = posArray;
          setFileListArray(imageData);
          setPreviewTitle(storeData.image_name || '');
          // setPOSIDs(posArray);
        }
        let state = [];
        if (isEmpty(intrCode) || intrCode === 'IN') {
          state = _.get(resp, '[1].data', []);
          const result = _.find(get(resp, '[1].data', []), {
            id: Number(get(storeData, 'state', '')),
          });
          storeData.state_name = get(result, 'id', '');
        } else {
          const stateArrays = await getInternationalState(intrCode);
          const stateArrayValues = await stateArrays.json();
          const stateArray = stateArrayValues.data;
          state = stateArray;
          const result = _.find(get(resp, '[1].data', []), {
            id: Number(get(storeData, 'state', '')),
          });
          storeData.state_name = get(result, 'state_name', '');

          const filterSelectedState = filter(
            stateArray,
            (item) => item.name === get(storeData, 'international_state', '')
          );

          const cityArrays = await getCitiesOfCountry(
            intrCode,
            get(filterSelectedState, '0.iso2', '')
          );
          const cityArrayValues = await cityArrays.json();
          const cityArray = _.get(cityArrayValues, 'data', []);
          const isoCode = get(filterSelectedState, '0.iso2', '');
          const filterCity = filter(
            cityArray,
            (element) => element.stateCode === isoCode
          );
          setDistrictData(filterCity);
        }
        // const assignedPOS = _.intersectionBy(
        //   _.get(resp, '[2].data.rows', []),
        //   _.get(storeData, 'storePOS', []),
        //   'pos_uid'
        // );
        // const nonAssignedPOS = _.differenceBy(
        //   _.get(resp, '[2].data.rows', []),
        //   _.get(resp, '[3].data.rows', []),
        //   'pos_uid'
        // );
        // const pOSArrray = [...nonAssignedPOS, ...assignedPOS];
        setStateData(state);
        // setPosData(pOSArrray);
        setStoreRecord(storeData);
        setCheckValue(_.get(resp, '[4].data'));
        setDeliveryLocActive(_.get(storeData, 'store_delivery_pin', false));
        if (storeID) {
          const previousPath = sessionStorage.getItem('prevPath');
          sessionStorage.removeItem('prevPath');
          let currentStore = {};
          if (previousPath === '/pos/add-pos') {
            currentStore = { ...storeData, ...storeDetails };
            form.setFieldsValue(currentStore);
          } else {
            currentStore = storeData;
            setStoreDetails(storeData);
            form.setFieldsValue(storeData);
          }
          if (isEmpty(intrCode) || intrCode === 'IN')
            handlePincodeInput(currentStore);
        }
        setLoading(false);
        setPincodeCheck(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, [form, storeID]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // const showModal = () => {
  //   setVisible(true);
  // };

  // const handleOk = () => {
  //   const data = _.get(previousValue, 'address', '').split(',');
  //   setStoreRecord((previousState) => ({
  //     ...previousState,
  //     latitude: _.get(previousValue, 'position.latitude', ''),
  //     longitude: _.get(previousValue, 'position.longitude', ''),
  //     address_1: _.get(data, '[0]', ''),
  //     address_2: _.get(data, '[1]', ''),
  //     store_location: _.get(previousValue, 'locationData.city', ''),
  //   }));
  //   setVisible(false);
  // };

  // const handleCancel = () => {
  //   form.setFieldsValue({
  //     latitude: storeRecord.latitude,
  //     longitude: storeRecord.longitude,
  //     address_1: storeRecord.address_1,
  //     address_2: storeRecord.address_2,
  //     store_location: _.get(
  //       storeRecord,
  //       'store_sub_district.sub_district_name',
  //       ''
  //     ),
  //   });

  //   setVisible(false);
  // };

  const handlesubDistrictClear = (mode) => {
    if (mode === 'multiple') {
      form.setFieldsValue({
        delivery_pincode: [],
      });
      setSelectedSubDistributionData([]);
      setSelectedPincodeData([]);
    } else {
      form.setFieldsValue({
        pincode: [],
      });
    }
  };
  const handleDistrictClear = (mode) => {
    if (mode === 'multiple') {
      form.setFieldsValue({
        delivery_subdistrict: [],
        delivery_pincode: [],
      });
      setSelectedPincodeData([]);
      setSelectedSubDistributionData([]);
      setSelectedDistributionData([]);
    } else {
      form.setFieldsValue({
        pincode: [],
        subdistrict: [],
      });
      setSubDistrictData([]);
    }
  };
  const handleStateClear = (mode) => {
    if (mode === 'multiple') {
      form.setFieldsValue({
        delivery_district: [],
        delivery_subdistrict: [],
        delivery_pincode: [],
      });
      setSelectedPincodeData([]);
      setSelectedSubDistributionData([]);
      setSelectedDistributionData([]);
      setSelectedStateData([]);
    } else {
      form.setFieldsValue({
        pincode: [],
        subdistrict: [],
        district_name: [],
      });
      setDistrictData([]);
      setSubDistrictData([]);
    }
  };

  const handleState = async (data, value) => {
    form.resetFields(['city', 'international_city', 'district_name']);
    if (!isEmpty(isCountryCode) && isCountryCode !== 'IN') {
      const cityValues = await getCitiesOfCountry(isCountryCode, value.key);
      const cityArrays = await cityValues.json();
      const cityArray = _.get(cityArrays, 'data', []);
      setDistrictData(cityArray);
    } else if (value) {
      setLoading(true);
      getDistrict(data)
        .then((response) => {
          const district = _.get(response, 'dataset', []);
          handleStateClear();
          setDistrictData(district);
          setLoading(false);
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
          setLoading(false);
        });
    }
  };
  const handleDistrict = (data, value) => {
    if (value && (isEmpty(isCountryCode) || isCountryCode === 'IN')) {
      setLoading(true);
      setDistrictId(get(value, 'value', ''));
      getSubDistrict(value)
        .then((response) => {
          const subDistrict = _.get(response, 'dataValue', []);
          handleDistrictClear();
          setSubDistrictData(subDistrict);
          setLoading(false);
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
          setLoading(false);
        });
    }
  };

  const handleSubDistrict = (value) => {
    if (value) {
      setLoading(true);
      getLocality(value)
        .then(() => {
          handlesubDistrictClear();
          setLoading(false);
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    if (
      districtData &&
      previousValue &&
      !isEmpty(districtData) &&
      !isEmpty(previousValue)
    ) {
      const filtdistrict1 = nameFormatter(previousValue.locationData.city);
      const filtdistrict2 = nameFormatter(previousValue.locationData.locality);
      const districtId = districtData.filter((std) => {
        return (
          nameFormatter(std.district_name) === filtdistrict1 ||
          nameFormatter(std.district_name) === filtdistrict2
        );
      });
      if (get(districtId, '[0].district_id', false)) {
        form.setFieldsValue({ district: districtId[0].district_id });
        handleDistrict(districtId[0].district_id);
      }
    }
  }, [districtData, previousValue]);

  const getCountryCode = (lat, lon) => {
    Geocode.fromLatLng(lat, lon).then(
      async (response) => {
        const code = response.results[0].address_components.find((component) =>
          component.types.includes('country')
        ).short_name;
        setIsCountryCode(code);
        if (!isEmpty(code) && code !== 'IN') {
          const stateArrays = await getInternationalState(code);
          const stateValue = await stateArrays.json();
          const stateArray = _.get(stateValue, 'data', []);
          setStateData(stateArray);
        } else {
          getState()
            .then((resp) => {
              const stateData = get(resp, 'data', '');
              setStateData(stateData);
            })
            .catch(() => {
              notification.error({ message: FAILED_TO_LOAD });
            });
        }
        form.resetFields([
          'state',
          'city',
          'international_state',
          'international_city',
        ]);
      },
      (error) => {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    );
  };

  useEffect(() => {
    getCountryCode(
      get(location, 'latitude', ''),
      get(location, 'longitude', '')
    );
  }, [location]);

  const addressDetails = (address, position, locationData) => {
    getCountryCode(
      get(position, 'latitude', ''),
      get(position, 'longitude', '')
    );
    setPreviousValue({ address, position, locationData });
    if (address && position && locationData.city) {
      setLocation(position);
      const data = address
        .slice(
          0,
          address.toLowerCase().lastIndexOf(nameFormatter(locationData.city)),
          'data-addr'
        )
        .split(', ');
      const datalength = floor(data.length / 2);
      const address1 = data.slice(0, datalength).join(', ');
      const address2 = data.splice(datalength).join(', ');
      form.setFieldsValue({ latitude: position.latitude });
      form.setFieldsValue({ longitude: position.longitude });
      const storeAddress = address1 + address2;
      form.setFieldsValue({ store_location: storeAddress });
      form.setFieldsValue({ address_1: address1 });
      form.setFieldsValue({ address_2: address2 });
      setUseMyLocation(true);
    }
    if (locationData) {
      form.setFieldsValue({
        store_location:
          form.getFieldValue('store_location') + locationData.city,
      });
      const filtstate = nameFormatter(locationData.state);
      const stdId = stateData.filter(
        (std) => nameFormatter(std.state_name) === filtstate
      );
      if (get(stdId, '[0].id', false)) {
        form.setFieldsValue({ state: stdId[0].id });
        handleState(stdId[0].id);
      } else {
        form.setFieldsValue({
          state: [],
          district: [],
          subdistrict: [],
          pincode: [],
        });
      }
    }
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const adminEvent = (text) => {
    const parameter = {
      value: text,
    };
    eventTrack(`${text} Click`, parameter);
  };

  const getCurrentLocationDetails = () => {
    adminEvent('Current Location');
    navigator.geolocation.getCurrentPosition((position) => {
      getCountryCode(
        get(position, 'coords.latitude', ''),
        get(position, 'coords.longitude', '')
      );
      axios
        .get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${googleMapApiKey}&libraries=places`
        )
        .then((response) => {
          if (response.data.status === 'OK') {
            const address = _.get(
              response,
              'data.results[0].formatted_address',
              ''
            );
            const addressArray = _.get(
              response,
              'data.results[0].address_components',
              ''
            );
            const city = getCity(addressArray);
            const locality = getLocation(addressArray);
            const state = getStateName(addressArray);
            const area = getArea(addressArray);
            const data = address
              .slice(
                0,
                address.toLowerCase().lastIndexOf(nameFormatter(city)),
                'data-addr'
              )
              .split(', ');
            const datalength = floor(data.length / 2);
            const address1 = data.slice(0, datalength).join(', ');
            const address2 = data.splice(datalength).join(', ');
            const filtstate = nameFormatter(state);
            const latlong = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            const locationData = { city, area, state, locality };
            setPreviousValue({ address, position: latlong, locationData });
            const stdId = stateData.filter(
              (std) => nameFormatter(std.state_name) === filtstate
            );
            const storeAddress = address1 + address2;
            form.setFieldsValue({ store_location: storeAddress });
            form.setFieldsValue({ address_1: address1 });
            form.setFieldsValue({ address_2: address2 });
            form.setFieldsValue({
              latitude: _.get(position, 'coords.latitude', ''),
            });
            form.setFieldsValue({
              longitude: _.get(position, 'coords.longitude', ''),
            });
            setUseMyLocationAddress(storeAddress);
            setUseMyLocation(true);
            if (get(stdId, '[0].id', false)) {
              form.setFieldsValue({ state: stdId[0].id });
              handleState(stdId[0].id);
            } else {
              form.setFieldsValue({
                state: [],
                district: [],
                subdistrict: [],
                pincode: [],
              });
            }
          }
        });
    });
  };

  const modifyData = (values, action) => {
    const statData = [];
    // eslint-disable-next-line unicorn/no-array-reduce
    const localData = get(values, 'delivery_pincode', []).reduce(
      (preLocal, curnLocal) => {
        const filterData = selectedPincodeData.filter(
          (item) => curnLocal.key === item.locality_id
        );
        preLocal = [...preLocal, ...filterData];
        return preLocal;
      },
      []
    );
    // eslint-disable-next-line unicorn/no-array-reduce
    const subData = get(values, 'delivery_subdistrict', []).reduce(
      (preSub, curnSub) => {
        const filterData = selectedSubDistributionData.filter(
          (item) => curnSub.key === item.sub_district_id
        );
        preSub = [...preSub, ...filterData];
        return preSub;
      },
      []
    );
    // eslint-disable-next-line unicorn/no-array-reduce
    const distributionData = get(values, 'delivery_district', []).reduce(
      (preDistribution, curnDistribution) => {
        const filterData = selectedDistributionData.filter(
          (item) => curnDistribution.key === item.district_id
        );
        preDistribution = [...preDistribution, ...filterData];
        return preDistribution;
      },
      []
    );
    // eslint-disable-next-line no-restricted-syntax
    for (const state of get(values, 'delivery_state', [])) {
      // eslint-disable-next-line no-restricted-syntax
      for (const item of selectedStateData) {
        if (item.id === state.key) {
          statData.push({ ...item, state_id: state.key });
        }
      }
    }
    const locationFormData = [];
    const diffState = differenceBy(statData, distributionData, 'state_id');
    const diffDistribution = differenceBy(
      distributionData,
      subData,
      'district_id'
    );
    const diffSubDistribution = differenceBy(
      subData,
      localData,
      'sub_district_id'
    );
    if (action === 'create') {
      // eslint-disable-next-line no-restricted-syntax
      for (const item of diffSubDistribution) {
        locationFormData.push({
          district_id: item.district_id,
          state_id: item.state_id,
          sub_district_id: item.sub_district_id,
        });
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const item of diffDistribution) {
        locationFormData.push({
          district_id: item.district_id,
          state_id: item.state_id,
        });
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const item of diffState) {
        locationFormData.push({ state_id: item.id });
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const item of localData) {
        locationFormData.push({
          state_id: item.state_id,
          district_id: item.district_id,
          sub_district_id: item.sub_district_id,
          locality_id: item.locality_id,
        });
      }
    } else {
      // eslint-disable-next-line no-restricted-syntax
      for (const item of diffSubDistribution) {
        locationFormData.push({
          district_id: item.district_id,
          state_id: item.state_id,
          sub_district_id: item.sub_district_id,
          store_uid: storeID,
        });
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const item of diffDistribution) {
        locationFormData.push({
          district_id: item.district_id,
          state_id: item.state_id,
          store_uid: storeID,
        });
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const item of diffState) {
        locationFormData.push({ state_id: item.id, store_uid: storeID });
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const item of localData) {
        locationFormData.push({
          state_id: item.state_id,
          district_id: item.district_id,
          sub_district_id: item.sub_district_id,
          locality_id: item.locality_id,
          store_uid: storeID,
        });
      }
    }
    return locationFormData;
  };

  // eslint-disable-next-line consistent-return
  const onFinish = async (values) => {
    const isValidPostalCode = PostalCodes.validate(
      isCountryCode,
      values.pincode
    );
    if (
      !isEmpty(isCountryCode) &&
      isCountryCode === 'IN' &&
      isValidPostalCode !== true
    )
      return form.setFields([
        {
          name: 'pincode',
          errors: ['Please enter valid zip code!'],
        },
      ]);

    if (isEditPhone && isValidPhoneNumber(`+${phoneNumber}`) === false) {
      form.setFields([
        {
          name: 'store_person_number',
          errors: ['Please Enter your Mobile Number!'],
        },
      ]);
    } else {
      const storeData = {
        store_name: values.store_name,
        store_person_name: values.store_person_name,
        store_person_number: phoneNumber.slice(countryCode.length),
        store_location: values.store_location,
        state: get(values, 'state_name', ''),
        district: get(values, 'district_name', ''),
        subdistrict: values.subdistrict,
        pincode: values.pincode,
        longitude: values.longitude,
        latitude: values.latitude,
        address_2: values.address_2,
        address_1: values.address_1,
        country_code: `+${countryCode}`,
        // storePOS: JSON.stringify(storePOS),
        is_central: values.is_central,
        gst_number: values.gst_number,
        store_delivery_pin: values.store_delivery_pin,
        international_state: values.international_state,
        international_city: values.international_city,
        international_code: countryCode,
      };
      const trimFormValues = {};
      trimPayloadFields(storeData, trimFormValues);
      trimFormValues.international_state = values.international_state;
      trimFormValues.international_city = values.international_city;
      trimFormValues.international_code = isCountryCode;
      const storeImage = fileListArray.filter(
        (item) => item.localMedia === true
      );
      if (storeImage.length > 0) {
        trimFormValues.image_source = JSON.stringify([...storeImage]);
      }
      let createData = {
        createStoreData: JSON.stringify(trimFormValues),
      };
      if (get(storeData, 'store_delivery_pin')) {
        const modifyCreateDataValues = await Promise.all(
          modifyData(values, 'create')
        );
        createData = {
          ...createData,
          locationFormData: JSON.stringify(modifyCreateDataValues),
        };
      }
      const files = { files: map(fileListArray, (item) => item.originFileObj) };
      setLoading(true);
      Promise.all([
        createStore(createData, files),
        putOnboardSubGuide({
          completed: true,
          slug: 'store',
        }),
      ])
        .then((response) => {
          if (response[0].data) {
            if (openTourModal) {
              setOpenTourModal(false);
              setCompleteModal(true);
              setTimeout(() => {
                setCompleteModal(false);
                notification.success({ message: STORE_ADD_SUCCESS });
                setStoreDetails({});
                properties.history('/dashboard');
                setLoading(false);
              }, 4000);
            } else {
              notification.success({ message: STORE_ADD_SUCCESS });
              setStoreDetails({});
              properties.history('/stores');
              setLoading(false);
            }
          } else {
            notification.error({ message: STORE_ADD_FAILED });
            setLoading(false);
          }
        })
        .catch((error) => {
          setLoading(false);
          notification.error({
            message: _.get(error, 'error', STORE_ADD_FAILED),
          });
        });
    }
  };

  const updateStore = async (fields) => {
    const values = fields;
    if (values) {
      values.image = fileListArray;
    }

    if (isEditPhone && isValidPhoneNumber(`+${phoneNumber}`) === false) {
      form.setFields([
        {
          name: 'store_person_number',
          errors: ['Please Enter valid Mobile Number!'],
        },
      ]);
    } else {
      const storeData = {
        store_name: get(values, 'store_name', ''),
        store_person_name: get(values, 'store_person_name', ''),
        store_person_number: isEditPhone
          ? phoneNumber.slice(countryCode.length)
          : get(storeObject, 'store_person_number', '').slice(
              get(storeObject, 'country_code', '').length
            ),
        store_location: get(values, 'store_location', ''),
        state: get(values, 'state_name', ''),
        pincode: get(values, 'pincode', ''),
        longitude: get(values, 'longitude', ''),
        latitude: get(values, 'latitude', ''),
        district: get(values, 'district_name', ''),
        subdistrict: get(values, 'subdistrict', ''),
        address_2: get(values, 'address_2', ''),
        address_1: get(values, 'address_1', ''),
        // storePOS: JSON.stringify(storePOS),
        // deletePOS: JSON.stringify(deleteArray),
        country_code: isEditPhone
          ? `+${countryCode}`
          : `${get(storeObject, 'country_code', '')}`,
        is_central: get(values, 'is_central', ''),
        gst_number: get(values, 'gst_number', ''),
        store_delivery_pin: get(values, 'store_delivery_pin', ''),
        image:
          typeof get(values, 'image', '') === 'string'
            ? get(values, 'image', '')
            : '',
      };
      const trimFormValues = {};
      trimPayloadFields(storeData, trimFormValues);
      trimFormValues.international_state = values.international_state;
      trimFormValues.international_city = values.international_city;
      trimFormValues.international_code = isCountryCode;
      const checkBeforeUpdate = _.isEqual(storeRecord, trimFormValues);
      if (!checkBeforeUpdate) {
        setLoading(true);
        const storeImage = fileListArray.filter(
          (item) => item.localMedia === true
        );
        if (storeImage.length > 0) {
          trimFormValues.image_source = JSON.stringify([...storeImage]);
        }
        const files = {
          files: map(fileListArray, (item) => item.originFileObj),
        };
        let updateData = { updateStoreData: JSON.stringify(trimFormValues) };
        if (get(storeData, 'store_delivery_pin')) {
          const modifyUpdateDataValues = await Promise.all(modifyData(values));
          updateData = {
            ...updateData,
            locationFormData: JSON.stringify(modifyUpdateDataValues),
          };
        }
        editStore(updateData, files, storeID)
          .then((response) => {
            setIsEditPhone(false);
            if (response.data) {
              notification.success({ message: STORE_UPDATE_SUCCESS });
              setStoreDetails({});
              properties.history('/stores');
              setLoading(false);
            } else {
              notification.error({ message: STORE_UPDATE_FAILED });
              setLoading(false);
            }
          })
          .catch((error) => {
            setLoading(false);
            setIsEditPhone(false);
            notification.error({
              message: _.get(error, 'error', STORE_UPDATE_FAILED),
            });
          });
      }
    }
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setImgUrl(file.url || file.preview);
    setPreviewVisible(true);
  };

  useEffect(() => {
    if (!storeID) {
      const previousPath = sessionStorage.getItem('prevPath');
      sessionStorage.removeItem('prevPath');
      if (previousPath === '/pos/add-pos') {
        if (!isEmpty(get(storeDetails, 'image', '')))
          setFileListArray(get(storeDetails, 'image', ''));
        if (get(storeDetails, 'district', '')) handlePincodeInput(storeDetails);
        form.setFieldsValue(storeDetails);
      } else {
        setStoreDetails({});
      }
    }
  }, [form, storeID]);

  const onValuesChange = (changedValues) => {
    if (changedValues) {
      setStoreDetails({ ...storeDetails, ...changedValues });
    }
  };

  const onFinishFailed = () => {
    const storeMap = document.querySelector('#map-milestone');
    storeMap.classList.remove('zIndextour');
    setOpenTourModal(false);
  };

  // const debounceFetcher = React.useMemo(() => {
  //   const loadOptions = (value, tableName) => {
  //     fetchReference.current += 1;
  //     const fetchId = fetchReference.current;
  //     setOptions([]);
  //     setDistrctOptions([]);
  //     setSubDistOptions([]);
  //     setPincodeOptions([]);
  //     setFetching(true);
  //     const stateIds =
  //       form.getFieldValue('delivery_state') &&
  //       form.getFieldValue('delivery_state').map((item) => {
  //         return item.key;
  //       });
  //     const distIds =
  //       form.getFieldValue('delivery_district') &&
  //       form.getFieldValue('delivery_district').map((item) => {
  //         return item.key;
  //       });
  //     const subDistIds =
  //       form.getFieldValue('delivery_subdistrict') &&
  //       form.getFieldValue('delivery_subdistrict').map((item) => {
  //         return item.key;
  //       });
  //     const queryParameters = {
  //       searchValue: value,
  //       tableName,
  //       stateIds,
  //       distIds,
  //       subDistIds,
  //     };
  //     getSearchDetails(queryParameters)
  //       .then(async (newOptions) => {
  //         const { data } = newOptions;
  //         setSearchData(data);
  //         if (tableName === 'state') {
  //           const statesData = await getOptionValues({
  //             data,
  //             keyId: 'id',
  //             labelName: 'state_name',
  //           });
  //           setOptions(statesData);
  //         } else if (tableName === 'district') {
  //           const distsData = await getOptionValues({
  //             data,
  //             keyId: 'district_id',
  //             labelName: 'district_name',
  //           });
  //           setDistrctOptions(distsData);
  //         } else if (tableName === 'sub district') {
  //           const subDistsData = await getOptionValues({
  //             data,
  //             keyId: 'sub_district_id',
  //             labelName: 'sub_district_name',
  //           });
  //           setSubDistOptions(subDistsData);
  //         } else if (tableName === 'pincode') {
  //           const uniqLocality = uniqBy(data, 'locality_name');
  //           const finalLocality = uniqBy(uniqLocality, 'pincode');
  //           const subDistsData = await getOptionValues({
  //             data: finalLocality,
  //             keyId: 'locality_id',
  //             labelName: 'pincode',
  //           });
  //           setPincodeOptions(subDistsData);
  //         }
  //         if (fetchId !== fetchReference.current) {
  //           return;
  //         }
  //         setFetching(false);
  //       })
  //       .catch((error) => {
  //         notification.error({ message: error || FAILED_TO_LOAD });
  //       });
  //   };

  //   return debounce(loadOptions, debounceTimeout);
  // }, [debounceTimeout, form]);

  // const stateOnChange = async (value) => {
  //   if (!isEmpty(value)) {
  //     const stateValue = value.map((item) => {
  //       return searchData.filter((data) => item.key === data.id);
  //     });
  //     const stateFlatternData = flattenDeep([selectedStateData, stateValue]);
  //     const uniqStateData = await getFilterData({
  //       value,
  //       data: stateFlatternData,
  //       keyId: 'id',
  //       uniqKey: 'id',
  //       labelName: 'state_name',
  //     });
  //     setSelectedStateData(get(uniqStateData, 'filterData', []));
  //     const filtDistData = await getFilterData({
  //       value,
  //       data: selectedDistData,
  //       keyId: 'state_id',
  //       uniqKey: 'district_id',
  //       labelName: 'district_name',
  //     });
  //     const filtSubData = await getFilterData({
  //       value,
  //       data: selectedSubDistData,
  //       keyId: 'state_id',
  //       uniqKey: 'sub_district_id',
  //       labelName: 'sub_district_name',
  //     });
  //     const filtLocData = await getFilterData({
  //       value,
  //       data: selectedPincodeData,
  //       keyId: 'state_id',
  //       uniqKey: 'locality_id',
  //       labelName: 'pincode',
  //     });
  //     setSelectedDistData(get(filtDistData, 'filterData', []));
  //     setSelectedSubDistData(get(filtSubData, 'filterData', []));
  //     setSelectedPincodeData(get(filtLocData, 'filterData', []));
  //     form.setFieldsValue({
  //       delivery_district: get(filtDistData, 'keyData', []),
  //       delivery_subdistrict: get(filtSubData, 'keyData', []),
  //       delivery_pincode: get(filtLocData, 'keyData', []),
  //     });
  //   } else {
  //     form.setFieldsValue({
  //       delivery_district: [],
  //       delivery_subdistrict: [],
  //       delivery_pincode: [],
  //     });
  //     setSelectedPincodeData([]);
  //     setSelectedSubDistData([]);
  //     setSelectedDistData([]);
  //     setSelectedStateData([]);
  //   }
  // };

  // const districtOnChange = async (value) => {
  //   if (!isEmpty(value)) {
  //     const districtValue = value.map((item) => {
  //       return searchData.filter((data) => item.key === data.district_id);
  //     });
  //     const distFlatternData = await flattenDeep([
  //       selectedDistData,
  //       districtValue,
  //     ]);
  //     const uniqDistData = await getFilterData({
  //       value,
  //       data: distFlatternData,
  //       keyId: 'district_id',
  //       uniqKey: 'district_id',
  //       labelName: 'district_name',
  //     });
  //     setSelectedDistData(get(uniqDistData, 'filterData', []));
  //     const filtSubDistData = await getFilterData({
  //       value,
  //       data: selectedSubDistData,
  //       keyId: 'district_id',
  //       uniqKey: 'sub_district_id',
  //       labelName: 'sub_district_name',
  //     });
  //     const filtLocData = await getFilterData({
  //       value,
  //       data: selectedPincodeData,
  //       keyId: 'district_id',
  //       uniqKey: 'locality_id',
  //       labelName: 'pincode',
  //     });
  //     setSelectedSubDistData(get(filtSubDistData, 'filterData', []));
  //     setSelectedPincodeData(get(filtLocData, 'filterData', []));
  //     form.setFieldsValue({
  //       delivery_subdistrict: get(filtSubDistData, 'keyData', []),
  //       delivery_pincode: get(filtLocData, 'keyData', []),
  //     });
  //   } else {
  //     form.setFieldsValue({
  //       delivery_subdistrict: [],
  //       delivery_pincode: [],
  //     });
  //     setSelectedPincodeData([]);
  //     setSelectedSubDistData([]);
  //     setSelectedDistData([]);
  //   }
  // };

  // const subDistrictOnChange = async (value) => {
  //   if (!isEmpty(value)) {
  //     const subDistrictValue = value.map((item) => {
  //       return searchData.filter((data) => item.key === data.sub_district_id);
  //     });
  //     const subdistFlatternData = flattenDeep([
  //       selectedSubDistData,
  //       subDistrictValue,
  //     ]);
  //     const uniqsubData = await getFilterData({
  //       value,
  //       data: subdistFlatternData,
  //       keyId: 'sub_district_id',
  //       uniqKey: 'sub_district_id',
  //       labelName: 'sub_district_name',
  //     });
  //     setSelectedSubDistData(get(uniqsubData, 'filterData', []));
  //     const filtPinData = await getFilterData({
  //       value,
  //       data: selectedPincodeData,
  //       keyId: 'sub_district_id',
  //       uniqKey: 'locality_id',
  //       labelName: 'pincode',
  //     });
  //     setSelectedPincodeData(get(filtPinData, 'filterData', []));
  //     form.setFieldsValue({
  //       delivery_pincode: get(filtPinData, 'keyData', []),
  //     });
  //   } else {
  //     form.setFieldsValue({
  //       delivery_pincode: [],
  //     });
  //     setSelectedSubDistData([]);
  //     setSelectedPincodeData([]);
  //   }
  // };

  // const pincodeOnChange = async (value) => {
  //   const pincodeValue = value.map((item) => {
  //     return searchData.filter((data) => item.key === data.locality_id);
  //   });
  //   const pinFlatternData = flattenDeep([selectedPincodeData, pincodeValue]);
  //   const uniqPinData = await getFilterData({
  //     value,
  //     data: pinFlatternData,
  //     keyId: 'locality_id',
  //     uniqKey: 'locality_id',
  //     labelName: 'pincode',
  //   });
  //   setSelectedPincodeData(get(uniqPinData, 'filterData', []));
  // };

  // const selectAllDistrict = async () => {
  //   setImportAllFlag((previousState) => {
  //     const updateState = { ...previousState };
  //     updateState.districtAllImport = !previousState.districtAllImport;
  //     return updateState;
  //   });
  //   setLoading(true);
  //   const statIds = form
  //     .getFieldValue('delivery_state')
  //     .map((data) => data.key);
  //   const allDistrictData = await getDistrict(statIds);
  //   if (get(allDistrictData, 'success', false)) {
  //     setSelectedDistData(get(allDistrictData, 'dataset', []));
  //     const districts = await getOptionValues({
  //       data: get(allDistrictData, 'dataset', []),
  //       keyId: 'district_id',
  //       labelName: 'district_name',
  //     });
  //     form.setFieldsValue({
  //       delivery_district: districts,
  //     });
  //     setLoading(false);
  //   }
  // };

  // const selectAllSubDistrict = async () => {
  //   setLoading(true);
  //   const dstIds = form
  //     .getFieldValue('delivery_district')
  //     .map((data) => data.key);
  //   const allSubDistData = await getSubDistrict(dstIds);
  //   if (get(allSubDistData, 'success', false)) {
  //     setSelectedSubDistData(get(allSubDistData, 'dataValue', []));
  //     const subDistricts = await getOptionValues({
  //       data: get(allSubDistData, 'dataValue', []),
  //       keyId: 'sub_district_id',
  //       labelName: 'sub_district_name',
  //     });
  //     form.setFieldsValue({
  //       delivery_subdistrict: subDistricts,
  //     });
  //     setLoading(false);
  //   }
  // };

  // const selectAllPincode = async () => {
  //   setLoading(true);
  //   const subDstIds = form
  //     .getFieldValue('delivery_subdistrict')
  //     .map((data) => data.key);
  //   const allPincodeData = await getLocality(subDstIds);
  //   if (get(allPincodeData, 'success', false)) {
  //     const locality = _.get(allPincodeData, 'response', []);
  //     const uniqLocality = uniqBy(locality, 'locality_name');
  //     const uniqPincode = uniqBy(uniqLocality, 'pincode');
  //     setSelectedPincodeData(uniqPincode);
  //     const pincodes = await getOptionValues({
  //       data: uniqPincode,
  //       keyId: 'locality_id',
  //       labelName: 'pincode',
  //     });
  //     form.setFieldsValue({
  //       delivery_pincode: pincodes,
  //     });
  //     setLoading(false);
  //   }
  // };

  const storeDeliveryActive = (event) => {
    adminEvent('Store Delivery Location');
    form.setFieldsValue({
      store_delivery_pin: event,
    });
    setDeliveryLocActive(event);
  };

  const pincodeValidationFunction = async (value) => {
    const parameters = {
      district_id: districtId,
      pincode: value,
    };
    return pincodeValidation(parameters)
      .then((response) => {
        const data = get(response, 'data', {});
        form.setFieldsValue({
          subdistrict: get(data, 'sub_district_id', ''),
        });
        return get(response, 'success', false);
      })
      .catch((error) => {
        form.setFieldsValue({
          subdistrict: [],
        });
        notification.error({
          message:
            get(error, 'message', '') ||
            `This pincode doesn't exist within the chosen district`,
        });
        return false;
      });
  };
  const goBack = () => {
    if (googleMapVisible) return setGoogleMapVisible(false);
    return navigate(-1);
  };
  const handleSaveCancel = () => {
    setLoading(true);
    setStoreDetails({});
    deleteRedisStoreLocationData()
      .then((data) => {
        if (get(data, 'success', false)) {
          setLoading(false);
          setIsError(false);
          goBack();
        }
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', '') || FAILED_TO_DELETE_REDIS_KEY,
        });
        setLoading(false);
        setIsError(false);
      });
  };

  const onChangePhoneNumber = (phone, data) => {
    if (phone.length > 5) setIsError(true);
    setIsEditPhone(true);
    setCountryCode(get(data, 'dialCode', ''));
    setPhoneNumber(phone);
  };
  const handleImageByUpload = () => {
    return (
      <Form.Item name="image">
        <ImageUploadModal
          item={uploadObject}
          uploadObject={uploadObject}
          setUploadObject={setUploadObject}
          metaArray={metaArray}
          setMetaArray={setMetaArray}
          mobileView={mobileView}
          visibility="image-only"
          setFileList={setFileListArray}
          handlePreview={handlePreview}
          setFileUploadCount={setFileUploadCount}
          fileListState={fileListArray}
          width={165}
          height={165}
          openTourModal={openTourModal}
          setOpenTourModal={setOpenTourModal}
          setCurrentStep={setCurrentStep}
          editType={
            uploadObject[0]?.url?.length > 0 ||
            uploadObject[0]?.productImageInfo?.product_image?.length > 0
          }
        />
      </Form.Item>
    );
  };

  const handleAddByLocation = () => {
    return (
      <div>
        {(isEmpty(isCountryCode) || isCountryCode === 'IN') && (
          <div className="store-delivery-location">
            <Collapse expandIconPosition="end">
              <Panel
                header={
                  <Form.Item name="store_delivery_pin" className="six">
                    <Space>
                      <Text strong className="pos_tittle">
                        Add Locations
                      </Text>
                      <Tooltip
                        title="Note: Enable the Store Delivery Location(s) for the store to
                deliver selected pincodes."
                      >
                        <InfoCircleOutlined className="cursor-pointer" />
                      </Tooltip>
                    </Space>
                    <span className="pos_tittle">
                      <Switch
                        checked={deliveryLocActive}
                        onChange={(event) => storeDeliveryActive(event)}
                        className="switch-container"
                        size="small"
                      />
                    </span>
                  </Form.Item>
                }
              >
                <div className="order-container">
                  {(isEmpty(isCountryCode) || isCountryCode === 'IN') && (
                    <LocationForm
                      storeID={storeID}
                      deliveryLocActive={deliveryLocActive}
                      adminEvent={adminEvent}
                      formData={formData}
                    />
                  )}
                </div>
              </Panel>
            </Collapse>
          </div>
        )}
      </div>
    );
  };

  const handleGoogleMaps = () => {
    return (
      <div className="two google-map-location">
        <div id="map-milestone">
          <GoogleMaps
            GoogleMapsAPI={googleMapApiKey}
            loading={loading}
            locationData={location}
            addressDetails={addressDetails}
          />
        </div>
        {useMyLocation && mobileView && (
          <Row>
            <div className="use-current-location">{useMyLocationAddress}</div>
          </Row>
        )}
        <Row justify="end">
          <Space>
            {useMyLocation && mobileView && (
              <Button
                type="primary"
                onClick={() => setGoogleMapVisible(false)}
                className={`store-currect-location-btn ${
                  mobileView && 'mb-20'
                }`}
              >
                Submit
              </Button>
            )}
            <div id="store-current-location" className="location-btn-tour">
              <Button
                type="primary"
                onClick={getCurrentLocationDetails}
                className={`store-currect-location-btn ${
                  mobileView && 'mb-20'
                }`}
              >
                <Space>
                  <img src={gps} alt="." className="map_icon_svg" /> Use my
                  current location
                </Space>
              </Button>
            </div>
          </Space>
        </Row>
      </div>
    );
  };

  const handleFormSubmit = () => {
    return (
      <Row justify="end">
        <Space direction="horizontal">
          <Form.Item>
            <Button className="w-btn" onClick={handleSaveCancel}>
              Cancel
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-btn">
              Save
            </Button>
          </Form.Item>
        </Space>
      </Row>
    );
  };
  const parameters = {
    adminEvent,
    isError,
    phoneNumber,
    onChangePhoneNumber,
    isCountryCode,
    handleState,
    handleStateClear,
    stateData,
    handleDistrict,
    handleDistrictClear,
    districtData,
    pincodeValidationFunction,
    handleKeyDown,
    handleAddByLocation,
    setGoogleMapVisible,
    uploadObject,
    setUploadObject,
    metaArray,
    setMetaArray,
    mobileView,
    setFileListArray,
    handlePreview,
    setFileUploadCount,
    fileListArray,
    setUseMyLocation,
    handleFormSubmit,
  };

  return (
    <Spin spinning={loading}>
      <div className="box mt-10">
        <div style={{ cursor: 'pointer' }}>
          <Space>
            <LeftArrow onClick={goBack} />
            <Stores />
            <h4 className="box-title">
              {storeID ? 'Edit Store' : 'Add Store'}
            </h4>
          </Space>
        </div>
        <Form
          form={form}
          layout="vertical"
          ref={formReference}
          onValuesChange={onValuesChange}
          onFinish={storeID ? updateStore : onFinish}
          onFinishFailed={onFinishFailed}
          scrollToFirstError
          initialValues={{
            is_central: _.get(storeRecord, 'is_central', false),
          }}
        >
          {mobileView && googleMapVisible ? (
            <div>{handleGoogleMaps()}</div>
          ) : (
            <>
              {(_.get(checkValue, 'central_store', '') === 'false' ||
                _.get(storeRecord, 'is_central', false)) && (
                <Row justify="end">
                  <Col>
                    <Form.Item name="is_central" valuePropName="checked">
                      <Checkbox>Make this store as Central Store</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              )}
              {mobileView ? (
                <StoreMobileForm parameters={parameters} />
              ) : (
                <Row justify="space-between">
                  <Col span={6}>{handleGoogleMaps()}</Col>
                  <Col span={17} className="store_form add-store-form-style">
                    <div className="two">
                      <Row>
                        <Col span={4}>
                          <div className="store-upload">
                            {handleImageByUpload()}
                          </div>
                        </Col>
                        <Col span={20}>
                          <Row justify="space-evenly">
                            <Col span={11}>
                              <Form.Item
                                label="Store Name"
                                name="store_name"
                                className="form-item-field store_name"
                                rules={[
                                  {
                                    required: true,
                                    message: 'Store name is required',
                                  },
                                ]}
                                onClick={() => adminEvent('Store Name Edit')}
                              >
                                <Input placeholder="Enter Store Name" />
                              </Form.Item>
                              <Form.Item
                                label="Person Name"
                                name="store_person_name"
                                className="store_person_name"
                                rules={[
                                  {
                                    required: true,
                                    message: 'Person name is required',
                                  },
                                  ...getFormItemRules({
                                    special: true,
                                  }),
                                ]}
                              >
                                <Input placeholder="Enter Person Name" />
                              </Form.Item>
                            </Col>
                            <Col span={11}>
                              <Form.Item
                                label="Person Contact"
                                name="store_person_number"
                                className="form-item-field store-phone"
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please enter the phone number!',
                                  },
                                  ...getFormItemRules({
                                    phone: true,
                                    phoneError: isError,
                                  }),
                                ]}
                              >
                                <PhoneInput
                                  country="in"
                                  placeholder="Enter Person Contact"
                                  value={phoneNumber}
                                  onChange={onChangePhoneNumber}
                                  countryCodeEditable={false}
                                  inputExtraProps={{
                                    required: true,
                                  }}
                                />
                              </Form.Item>
                              <Form.Item
                                className="store-address-details"
                                label="Store Address (use map to autofill)"
                                name="store_location"
                                rules={[
                                  {
                                    required: true,
                                    message: 'Store address is required',
                                  },
                                  ...getFormItemRules({
                                    // special: true,
                                  }),
                                ]}
                              >
                                <TextArea placeholder="Enter Store Address" />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </div>
                    <div className="three mt-20 store-location">
                      {/* <Row gutter={10}>
                      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                        <Row gutter={10}>
                          <Col span={12}>
                            <Button type="primary" onClick={showModal} block>
                              <img
                                src={maplocation}
                                alt="."
                                className="map_icon_svg"
                              />
                              &nbsp; Map Location
                            </Button>
                          </Col>
                          <Col span={12}>
                            <Button
                              type="primary"
                              onClick={getCurrentLocationDetails}
                              block
                            >
                              <img src={gps} alt="." className="map_icon_svg" />
                              &nbsp; Current Location
                            </Button>
                          </Col>
                        </Row>
                      </Col>
                      <Col span={14} />
                    </Row> */}
                      <Row gutter={10}>
                        <Col span={10}>
                          <Form.Item
                            label="Address line 1"
                            name="address_1"
                            hidden
                            rules={[
                              {
                                // required: true,
                                message: 'Please input your address 1!',
                              },
                            ]}
                          >
                            <Input placeholder="Address line 1" />
                          </Form.Item>
                        </Col>
                        <Col span={14}>
                          <Form.Item
                            label="Address line 2"
                            name="address_2"
                            hidden
                          >
                            <Input placeholder="Address line 2" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={10}>
                        <Col span={16}>
                          <Row gutter={12}>
                            <Col span={12}>
                              <Form.Item
                                label="State"
                                name={
                                  !isEmpty(isCountryCode) &&
                                  isCountryCode !== 'IN'
                                    ? 'international_state'
                                    : 'state_name'
                                }
                                rules={[
                                  {
                                    required: true,
                                    message: 'State is required',
                                  },
                                ]}
                              >
                                <Select
                                  allowClear
                                  showSearch
                                  virtual={false}
                                  placeholder="Select State"
                                  optionFilterProp="children"
                                  className="select-height"
                                  onChange={handleState}
                                  autoComplete="dontshow"
                                  onClear={handleStateClear}
                                  filterOption={(inputData, optionData) =>
                                    optionData.children
                                      .toLowerCase()
                                      .includes(inputData.toLowerCase()) ===
                                    true
                                  }
                                >
                                  {(stateData && isEmpty(isCountryCode)) ||
                                  isCountryCode === 'IN'
                                    ? sortBy(stateData, (stateValue) => {
                                        return stateValue.state_name;
                                      }).map((state) => (
                                        <Option
                                          key={state?.id}
                                          value={state?.id}
                                        >
                                          {state?.state_name}
                                        </Option>
                                      ))
                                    : map(stateData, (state) => (
                                        <Option
                                          key={state.isoCode}
                                          value={state.name}
                                        >
                                          {state.name}
                                        </Option>
                                      ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                label="District"
                                name={
                                  !isEmpty(isCountryCode) &&
                                  isCountryCode !== 'IN'
                                    ? 'international_city'
                                    : 'district_name'
                                }
                                rules={[
                                  {
                                    required: true,
                                    message: 'District is required',
                                  },
                                ]}
                              >
                                <Select
                                  showSearch
                                  allowClear
                                  virtual={false}
                                  placeholder="Select District"
                                  className="select-height"
                                  optionFilterProp="children"
                                  onChange={handleDistrict}
                                  autoComplete="dontshow"
                                  onClear={handleDistrictClear}
                                  filterOption={(inputSet, optionSet) =>
                                    optionSet.children
                                      .toLowerCase()
                                      .includes(inputSet.toLowerCase()) === true
                                  }
                                >
                                  {(districtData && isEmpty(isCountryCode)) ||
                                  isCountryCode === 'IN'
                                    ? districtData.map((district) => (
                                        <Option
                                          key={district?.district_id}
                                          value={district?.district_id}
                                        >
                                          {district.district_name}
                                        </Option>
                                      ))
                                    : map(districtData, (district) => (
                                        <Option value={district?.name}>
                                          {district?.name}
                                        </Option>
                                      ))}
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                        <Col span={8}>
                          <Row gutter={12}>
                            <Col span={24}>
                              <Form.Item
                                label="Pin Code"
                                name="pincode"
                                rules={[
                                  {
                                    required: true,
                                    message: 'Pincode is required',
                                  },
                                  {
                                    validator: async (__, value) => {
                                      if (
                                        value &&
                                        value.toString().length === 6 &&
                                        (isEmpty(isCountryCode) ||
                                          isCountryCode === 'IN')
                                      ) {
                                        const result =
                                          await pincodeValidationFunction(
                                            value
                                          );
                                        if (!result) {
                                          throw new Error(
                                            `This pincode doesn't exist within the chosen district`
                                          );
                                        }
                                      }
                                    },
                                  },
                                ]}
                              >
                                <Input
                                  autoComplete="dontshow"
                                  style={{ width: '100%' }}
                                  placeholder="Enter Pin Code"
                                  onKeyDown={handleKeyDown}
                                />
                              </Form.Item>
                            </Col>
                            <Col>
                              <Form.Item
                                label="Sub District"
                                name="subdistrict"
                                hidden
                                // rules={[
                                //   {
                                //     // required: true,
                                //     message: 'Please input your sub district!',
                                //   },
                                // ]}
                              >
                                <Select
                                  showSearch
                                  allowClear
                                  virtual={false}
                                  onClear={handlesubDistrictClear}
                                  placeholder="Select Sub District"
                                  className="select-height"
                                  optionFilterProp="children"
                                  autoComplete="dontshow"
                                  onChange={handleSubDistrict}
                                  filterOption={(input, option) =>
                                    option.children
                                      .toLowerCase()
                                      .includes(input.toLowerCase()) === true
                                  }
                                >
                                  {subDistrictData.map((subDistrict) => (
                                    <Option
                                      key={subDistrict?.sub_district_id}
                                      value={subDistrict?.sub_district_id}
                                    >
                                      {subDistrict?.sub_district_name}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      <Row gutter={10}>
                        <Col span={8}>
                          <Form.Item
                            label="Latitude"
                            name="latitude"
                            // hidden
                            rules={[
                              {
                                required: true,
                                message: 'Latitude is required',
                              },
                              () => ({
                                validator(rule, value) {
                                  if (
                                    value &&
                                    (!Number(value) ||
                                      value >= 90 ||
                                      value <= -90)
                                  ) {
                                    return Promise.reject(
                                      new Error('Invalid latitude value!')
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              }),
                            ]}
                          >
                            <Input
                              suffix={<Text strong>°N</Text>}
                              placeholder="Enter Latitude"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            label="Longitude"
                            name="longitude"
                            // hidden
                            rules={[
                              {
                                required: true,
                                message: 'Longitude is required',
                              },
                              () => ({
                                validator(rule, value) {
                                  if (
                                    value &&
                                    (!Number(value) ||
                                      value >= 180 ||
                                      value <= -180)
                                  ) {
                                    return Promise.reject(
                                      new Error('Invalid longitude value!')
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              }),
                            ]}
                          >
                            <Input
                              suffix={<Text strong>°W</Text>}
                              placeholder="Enter Longitude"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            label="GST Number"
                            name="gst_number"
                            rules={[
                              {
                                message: 'GST Number is required',
                              },
                              ...getFormItemRules({
                                special: true,
                              }),
                            ]}
                          >
                            <Input placeholder="Enter GST Number" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                    {handleAddByLocation()}
                    {/* <div>
                    <div className="row-header">
                      <Text strong className="pos_tittle">
                        POS Mapping
                      </Text>
                    </div>
                    <Row>
                      <Col span={24}>
                        <Form.Item
                          label="POS ID"
                          name="pos_uid"
                          initialValue={[]}
                        >
                          <Select
                            mode="multiple"
                            placeholder="POS"
                            maxTagCount="responsive"
                          >
                            {posData.map((posID) => (
                              <Option value={posID.pos_uid} key={posID.pos_uid}>
                                {posID.pos_machine_name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row justify="end">
                      <Col xs={10} sm={10} md={4} lg={4} xl={4}>
                        {' '}
                        <Link to="/pos/add-pos">
                          <Button type="primary" icon={<PlusOutlined />} block>
                            Add POS
                          </Button>
                        </Link>
                      </Col>
                    </Row>
                  </div> */}
                    {/* <Row>
                    <Col span={24}>
                      <Form.Item
                        label="State"
                        name="delivery_state"
                        rules={
                          deliveryLocActive && [
                            {
                              required: true,
                              message: 'Please enter the state!',
                            },
                          ]
                        }
                      >
                        <Select
                          className="store-tags"
                          mode="multiple"
                          labelInValue
                          filterOption={false}
                          allowClear
                          onClear={() => handleStateClear('multiple')}
                          onSearch={(value) => debounceFetcher(value, 'state')}
                          notFoundContent={
                            fetching ? <Spin size="small" /> : null
                          }
                          onChange={stateOnChange}
                          options={stateOptions}
                          disabled={!deliveryLocActive}
                          placeholder="State"
                        />
                      </Form.Item>
                      {!isEmpty(form.getFieldValue('delivery_state') || []) && (
                        <div className="store-button-box">
                          <Button
                            type="text"
                            disabled={!deliveryLocActive}
                            onClick={() => selectAllDistrict('districtAllImport')}
                          >
                            import All
                          </Button>
                          {deliveryLocActive && (
                            <Text>
                              {' '}
                              Note: All districts belongs to the selected states
                              will be imported.
                            </Text>
                          )}
                        </div>
                      )}
                      <Form.Item
                        label="District"
                        name="delivery_district"
                        rules={
                          deliveryLocActive && [
                            {
                              required: true,
                              message: 'Please input your district!',
                            },
                          ]
                        }
                        initialValue={[]}
                      >
                        <Select
                          className="store-tags"
                          mode="multiple"
                          labelInValue
                          allowClear
                          filterOption={false}
                          onClear={() => handleDistrictClear('multiple')}
                          onSearch={(value) => debounceFetcher(value, 'district')}
                          notFoundContent={
                            fetching ? <Spin size="small" /> : null
                          }
                          // onChange={districtOnChange}
                          onSelect={(value) =>
                            storedInRedis(value, {
                              key: 'district',
                              id: 'district_id',
                              mode: 'select',
                            })
                          }
                          onDeselect={(value) =>
                            storedInRedis(value, {
                              key: 'district',
                              id: 'district_id',
                              mode: 'deselect',
                            })
                          }
                          options={distrctOptions}
                          disabled={!deliveryLocActive}
                          placeholder="District"
                        />
                      </Form.Item>
                      {!isEmpty(
                        form.getFieldValue('delivery_district') || []
                      ) && (
                        <div className="store-button-box">
                          <Button
                            type="text"
                            disabled={!deliveryLocActive}
                            onClick={selectAllSubDistrict}
                          >
                            import All
                          </Button>
                          {deliveryLocActive && (
                            <Text>
                              {' '}
                              Note: All sub districts belongs to the selected
                              districts will be imported.
                            </Text>
                          )}
                        </div>
                      )}
                      <Form.Item
                        label="Sub District"
                        name="delivery_subdistrict"
                        rules={
                          deliveryLocActive && [
                            {
                              required: true,
                              message: 'Please input your sub district!',
                            },
                          ]
                        }
                      >
                        <Select
                          className="store-tags"
                          mode="multiple"
                          labelInValue
                          filterOption={false}
                          allowClear
                          onClear={() => handlesubDistrictClear('multiple')}
                          onSearch={(value) =>
                            debounceFetcher(value, 'sub district')
                          }
                          notFoundContent={
                            fetching ? <Spin size="small" /> : null
                          }
                          // onChange={subDistrictOnChange}
                          onSelect={(value) =>
                            storedInRedis(value, {
                              key: 'subDist',
                              id: 'sub_district_id',
                              mode: 'select',
                            })
                          }
                          onDeselect={(value) =>
                            storedInRedis(value, {
                              key: 'subDist',
                              id: 'sub_district_id',
                              mode: 'deselect',
                            })
                          }
                          options={subDistOptions}
                          disabled={!deliveryLocActive}
                          placeholder="Sub District"
                        />
                      </Form.Item>
                      {!isEmpty(
                        form.getFieldValue('delivery_subdistrict') || []
                      ) && (
                        <div className="store-button-box">
                          <Button
                            type="text"
                            disabled={!deliveryLocActive}
                            onClick={selectAllPincode}
                          >
                            import All
                          </Button>
                          {deliveryLocActive && (
                            <Text>
                              {' '}
                              Note: All pin-codes belongs to the selected sub
                              districts will be imported.
                            </Text>
                          )}
                        </div>
                      )}
                      <Form.Item
                        label="Pincode"
                        name="delivery_pincode"
                        rules={
                          deliveryLocActive && [
                            {
                              required: true,
                              message: 'Please enter the pincode!',
                            },
                            ...getFormItemRules({
                              whitespace: true,
                            }),
                          ]
                        }
                      >
                        <Select
                          className="store-tags"
                          mode="multiple"
                          labelInValue
                          allowClear
                          filterOption={false}
                          onSearch={(value) => debounceFetcher(value, 'pincode')}
                          notFoundContent={
                            fetching ? <Spin size="small" /> : null
                          }
                          onChange={pincodeOnChange}
                          onSelect={(value) =>
                            storedInRedis(value, {
                              key: 'locality',
                              id: 'locality_id',
                              mode: 'select',
                            })
                          }
                          onDeselect={(value) =>
                            storedInRedis(value, {
                              key: 'locality',
                              id: 'locality_id',
                              mode: 'deselect',
                            })
                          }
                          options={pincodeOptions}
                          disabled={!deliveryLocActive}
                          placeholder="Pincode"
                        />
                      </Form.Item>
                    </Col>
                  </Row> */}
                    {handleFormSubmit()}
                  </Col>
                </Row>
              )}
              {/* <Row>
                <Col xs={0} sm={0} md={0} lg={7} xl={7} />
                <Col xs={24} sm={24} md={24} lg={17} xl={17}>
                  <Row justify="end">
                    <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                      <Form.Item>
                        <Button onClick={handleSaveCancel}>Cancel</Button>
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          disabled={saveDisabled}
                        >
                          Save
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row> */}
            </>
          )}
        </Form>
        <Tour
          open={openTourModal}
          onClose={() => setOpenTourModal(false)}
          steps={steps}
          current={currentStep}
        />
      </div>
      <Modal
        open={completeModal}
        footer={false}
        maskClosable
        centered
        onCancel={cancelModal}
        closeIcon={false}
        className="milestone-modal-store"
        zIndex={1005}
      >
        <span>
          <Group />
        </span>
        <span>Store created successfully</span>
      </Modal>
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={undefined}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt={previewTitle} style={{ width: '100%' }} src={imgUrl} />
      </Modal>
      {/* <Modal
        title="Map Location"
        okText="Save"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      > */}
      {/* </Modal> */}
      {/* </TourProvider> */}
    </Spin>
  );
}
export default withRouter(StoreForm);
