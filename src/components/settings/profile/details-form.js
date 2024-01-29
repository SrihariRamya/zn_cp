import {
  // AutoComplete,
  Col,
  Form,
  Input,
  Row,
  Select,
  notification,
} from 'antd';
import React, { useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import { filter, get, isEmpty, map, sortBy } from 'lodash';
import { getCode, getData } from 'country-list';
import { getCountryCallingCode } from 'react-phone-number-input';

import getFormItemRules, {
  handleKeyDown,
  validatePhoneNumber,
} from '../../../shared/form-helpers';
import {
  getCitiesOfCountry,
  getDistrict,
  getInternationalState,
  getState,
} from '../../../utils/api/url-helper';
import {
  FAILED_TO_LOAD,
  SCREEN_MODE_VIEW,
} from '../../../shared/constant-values';

const { Option } = Select;
function DetailsForm(properties) {
  const {
    onChangePhoneNumber,
    form,
    settingData,
    districtList,
    stateList,
    setDistrictList,
    countryKey,
    isError,
    phoneNumber,
    mode,
    IsCountryCode,
    setIsCountryCode,
    setCountryName,
    setStateList,
    isNormalTenantMode,
  } = properties;
  // const [autoCompleteResult, setAutoCompleteResult] = useState([]);

  useEffect(() => {
    const getCountryCode =
      getCode(get(settingData, 'country', '')) ||
      get(settingData, 'country_code', '');
    const countryCallingCode = getCountryCallingCode(getCountryCode);
    form.setFieldsValue({
      phone_number: `+${countryCallingCode}${get(settingData, 'phone', '')}`,
    });
  }, [settingData]);

  const restrictSpecialCharacter = {
    // eslint-disable-next-line no-shadow
    validator(_, value) {
      const nospecial = /^[\d A-Za-z]+$/;
      if (value && !nospecial.test(value)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('Special characters are not allowed.');
      }
      return Promise.resolve();
    },
  };

  // const websiteOptions = autoCompleteResult.map((website) => ({
  //   label: website,
  //   value: website,
  // }));

  // const onWebsiteChange = (value) => {
  //   if (!value) {
  //     setAutoCompleteResult([]);
  //   } else {
  //     setAutoCompleteResult(
  //       ['.com', '.org', '.net'].map((domain) => `${value}${domain}`)
  //     );
  //   }
  // };

  const handleStateChange = async (value, object) => {
    if (!isEmpty(IsCountryCode) && IsCountryCode !== 'IN') {
      const cityArray = await getCitiesOfCountry(IsCountryCode, object.key);
      const city = await cityArray.json();
      const filterCity = filter(
        get(city, 'data', []),
        (element) => element.state_code === object.key
      );
      setDistrictList(filterCity);
    } else {
      getDistrict(value)
        .then((data) => {
          setDistrictList(get(data, 'dataset', ''));
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
        });
      form.setFieldsValue({ city: '' });
    }
  };

  const handleCountryChange = async (key, data) => {
    const getCountryCode = getCode(key) || key;
    setCountryName(data.children);
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
      const stateArray = await getInternationalState(getCountryCode || key);
      const state = await stateArray.json();
      setStateList(get(state, 'data', []));
    }
    setDistrictList([]);
    form.resetFields([
      'state_id',
      'city',
      'international_state',
      'international_city',
    ]);
    if (countryKey === getCountryCode.toLowerCase()) {
      form.setFields([
        {
          name: ['country'],
          value: get(data, 'children', ''),
          errors: '',
        },
      ]);
    } else {
      form.setFields([
        {
          name: ['country'],
          errors: ['Please select phone number matched country!'],
        },
      ]);
    }
  };

  return (
    <div className="profile-container">
      <Row>
        {isNormalTenantMode && (
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: 'Please input your Owner Name',
                },
                restrictSpecialCharacter,
              ]}
              label="Owner Name"
              name="owner_name"
              required
            >
              <Input />
            </Form.Item>
          </Col>
        )}
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            label="Business Name"
            name="business_name"
            rules={[
              {
                required: true,
                message: 'Please input your Business Name',
              },
              restrictSpecialCharacter,
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            label="Email"
            name="email_address"
            rules={[
              { required: true, message: 'Please input yourEmail' },
              ...getFormItemRules({ email: true }),
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        {/* <Col span={8}>
          <Form.Item
            label="Business Type"
            name="business_type"
            rules={[
              {
                required: true,
                message: 'Please input your Business Type',
              },
              restrictSpecialCharacter,
            ]}
          >
            <Input readOnly={mode === SCREEN_MODE_VIEW} />
          </Form.Item>
        </Col> */}
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            label="Phone Number"
            name="phone_number"
            rules={[
              {
                required: true,
                message: 'Please enter the phone number',
              },
              ...validatePhoneNumber({
                phone: true,
                isError,
                phoneNumber,
              }),
            ]}
          >
            <PhoneInput
              country="in"
              inputStyle={{ width: '100%', height: '40px' }}
              placeholder="Mobile Number"
              value={phoneNumber}
              onChange={onChangePhoneNumber}
              countryCodeEditable={false}
              inputExtraProps={{
                required: true,
              }}
            />
          </Form.Item>
        </Col>
        {/* {isNormalTenantMode && (
          <Col span={8}>
            <Form.Item
              label="Website URL"
              name="website_url"
              rules={[
                {
                  required: true,
                  message: 'Please input your Website URL',
                },
                {
                  // eslint-disable-next-line no-shadow
                  validator(_, value) {
                    const pattern =
                      // eslint-disable-next-line no-useless-escape
                      /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
                    if (value && !value.match(pattern)) {
                      // eslint-disable-next-line prefer-promise-reject-errors
                      return Promise.reject('Invalid URL');
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <AutoComplete
                options={websiteOptions}
                onChange={onWebsiteChange}
                placeholder="website"
                className="web-site-url"
                disabled={mode === SCREEN_MODE_VIEW}
              />
            </Form.Item>
          </Col>
        )} */}
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            label="Address"
            name="address_1"
            rules={[
              {
                required: true,
                message: 'Please input your Address Line 1',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: 'Please select your country' }]}
          >
            <Select
              className="select-height"
              showSearch
              virtual={false}
              autoComplete="newpassword"
              onChange={handleCountryChange}
            >
              {getData().map((country) => (
                <Option key={country.code} value={country.code}>
                  {country.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            label="State"
            name={
              !isEmpty(IsCountryCode) && IsCountryCode !== 'IN'
                ? 'international_state'
                : 'state_id'
            }
            rules={[{ required: true, message: 'Please Select your state!' }]}
          >
            <Select
              className="select-height"
              showSearch
              virtual={false}
              autoComplete="new-password"
              optionFilterProp="children"
              allowClear
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              placeholder="Please select the state"
              onChange={handleStateChange}
            >
              {stateList && (isEmpty(IsCountryCode) || IsCountryCode === 'IN')
                ? sortBy(stateList, (stateValue) => {
                    return stateValue.state_name;
                  }).map((state) => (
                    <Option key={state.id} value={state.id}>
                      {state.state_name}
                    </Option>
                  ))
                : map(stateList, (state) => (
                    <Option key={state.iso2} value={state.name}>
                      {state.name}
                    </Option>
                  ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            label="City"
            name={
              !isEmpty(IsCountryCode) && IsCountryCode !== 'IN'
                ? 'international_city'
                : 'city'
            }
            rules={[
              {
                required: !isEmpty(districtList),
                message: 'Please Select your City!',
              },
            ]}
          >
            <Select
              showSearch
              className="select-height"
              virtual={false}
              autoComplete="new-password"
              optionFilterProp="children"
              allowClear
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              placeholder="Please select the city"
            >
              {districtList &&
              (isEmpty(IsCountryCode) || IsCountryCode === 'IN')
                ? districtList.map((district) => (
                    <Option
                      key={district.district_id}
                      value={district.district_id}
                    >
                      {district.district_name}
                    </Option>
                  ))
                : districtList.map((district) => (
                    <Option key={district.name} value={district.name}>
                      {district.name}
                    </Option>
                  ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            label="Pincode"
            name="pincode"
            rules={[{ required: true, message: 'Please enter your pincode' }]}
          >
            <Input
              placeholder="Pincode"
              maxLength={6}
              onKeyDown={handleKeyDown}
            />
          </Form.Item>
        </Col>
        {isNormalTenantMode && (
          <>
            {/* <Col span={8}>
              <Form.Item
                label="Notification sender email"
                name="notification_sender_email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  ...getFormItemRules({ email: true }),
                ]}
              >
                <Input readOnly={mode === SCREEN_MODE_VIEW} />
              </Form.Item>
            </Col> */}
          </>
        )}
      </Row>
    </div>
  );
}
export default DetailsForm;
