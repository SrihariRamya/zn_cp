/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react';
import { Form, Input, Select, Switch, Checkbox, Card, Row, Col } from 'antd';
import { getData } from 'country-list';
import { get, isEmpty, map, sortBy } from 'lodash';
import { SCREEN_MODE_VIEW } from '../../../shared/constant-values';

const { Option } = Select;
function ProfileAddress(properties) {
  const {
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
  } = properties;

  const stateOptions = () =>
    stateList &&
    sortBy(stateList, (stateValue) => {
      return stateValue.state_name;
    }).map((state) => (
      <Option key={state?.id} value={state?.id}>
        {state?.state_name}
      </Option>
    ));

  const renderStateOptions = () => {
    return (
      <Select
        showSearch
        className="select-height"
        virtual={false}
        autoComplete="new-password"
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
        allowClear
        disabled={mode === SCREEN_MODE_VIEW || addressDisable}
        placeholder="Please select the state"
        onChange={handleStateChange}
        labelInValue
      >
        {isValid && !isEmpty(IsCountryCode) && IsCountryCode !== 'IN' ? (
          <>
            {stateList && (isEmpty(IsCountryCode) || IsCountryCode === 'IN')
              ? stateOptions()
              : map(stateList, (state) => (
                  <Option key={state.iso2} value={state.name}>
                    {state.name}
                  </Option>
                ))}
          </>
        ) : (
          stateOptions()
        )}
      </Select>
    );
  };

  return (
    <div id="column2" className={isNormalTenantMode ? '' : 'profile-address'}>
      {isNormalTenantMode && (
        <div className="block-header-footer-management mt-10">
          <span className="active-class base-line">
            <span className="switch-class mr-20p">Column 2</span>
            <Form.Item
              name={[get(activeData, '[1].header', ''), 'is_active']}
              valuePropName="checked"
            >
              <Switch onChange={onAddressChange} className="switch-container" />
            </Form.Item>
          </span>{' '}
        </div>
      )}

      <Card>
        <div className="footer-check-box">
          <Checkbox
            onChange={onChange}
            disabled={mode === SCREEN_MODE_VIEW || addressDisable}
            defaultChecked={checkedList}
          >
            Same as profile address
          </Checkbox>
        </div>

        <Row gutter={[40]}>
          {isNormalTenantMode && (
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <div>
                <Form.Item label="Column Title" name="address">
                  <Input
                    placeholder="Address"
                    disabled={mode === SCREEN_MODE_VIEW || addressDisable}
                  />
                </Form.Item>
              </div>
            </Col>
          )}
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <div>
              <Form.Item
                label="Address Line 1"
                name="address_1"
                rules={[
                  {
                    required: !addressDisable,
                    message: 'Please input your Address Line 1!',
                  },
                ]}
              >
                <Input
                  placeholder="Flat, Plot number"
                  disabled={mode === SCREEN_MODE_VIEW || addressDisable}
                />
              </Form.Item>
            </div>
          </Col>
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <Form.Item
              label="Country"
              name="country"
              rules={[
                {
                  required: !addressDisable,
                  message: 'Please input your Country',
                },
              ]}
            >
              <Select
                showSearch
                className="select-height"
                virtual={false}
                autoComplete="newpassword"
                disabled={mode === SCREEN_MODE_VIEW || addressDisable}
                onChange={handleCountryChange}
              >
                {getData().map((country) => (
                  <Option key={country.code} value={country.name}>
                    {country.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            {isValid ? (
              <Form.Item
                label="State"
                name={
                  !isEmpty(IsCountryCode) && IsCountryCode !== 'IN'
                    ? 'international_state'
                    : 'state_id'
                }
                rules={[
                  {
                    required: !addressDisable,
                    message: 'Please Select your state!',
                  },
                ]}
              >
                {renderStateOptions()}
              </Form.Item>
            ) : (
              <Form.Item
                label="State"
                name="state_id"
                rules={[
                  {
                    required: !addressDisable,
                    message: 'Please Select your state!',
                  },
                ]}
              >
                {renderStateOptions()}
              </Form.Item>
            )}
          </Col>
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            {isValid && !isEmpty(IsCountryCode) && IsCountryCode !== 'IN' ? (
              <Form.Item
                label="City"
                name={
                  !isEmpty(IsCountryCode) && IsCountryCode !== 'IN'
                    ? 'international_city'
                    : 'city'
                }
                rules={[
                  {
                    required: !isEmpty(districtList) && !addressDisable,
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
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Please select the city"
                  disabled={addressDisable}
                  labelInValue
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
            ) : (
              <Form.Item
                label="City"
                name="city"
                rules={[
                  {
                    required: !isEmpty(districtList) && !addressDisable,
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
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Please select the city"
                  disabled={addressDisable}
                  labelInValue
                >
                  {districtList &&
                    districtList.map((district) => (
                      <Option
                        key={district.district_id}
                        value={district.district_id}
                      >
                        {district.district_name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            )}
          </Col>
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <Form.Item
              label="PIN Code"
              name="pincode"
              rules={[
                {
                  required: !addressDisable,
                  message: 'Please Enter your pincode',
                },
              ]}
            >
              <Input
                placeholder="Pincode"
                disabled={mode === SCREEN_MODE_VIEW || addressDisable}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default ProfileAddress;
