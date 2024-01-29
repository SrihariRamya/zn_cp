import React from 'react';
import { Row, Col, Input, Select, Typography, Form } from 'antd';
import '../store.less';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { get, isEmpty, map, sortBy } from 'lodash';
import ImageUploadModal from '../../products/image-modal';
import { ReactComponent as GoogleMapIcon } from '../../../assets/icons/google-map-icon.svg';
import { USE_GOOGGLE_MAP_TO_ADD_ADDRESS } from '../../../shared/constant-values';
import getFormItemRules from '../../../shared/form-helpers';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function StoreMobileForm(parameters) {
  const {
    adminEvent,
    isError,
    phoneNumber,
    onChangePhoneNumber,
    IsCountryCode,
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
  } = parameters.parameters;

  const handleUseGoogleAddress = () => {
    setGoogleMapVisible(true);
    setUseMyLocation(false);
  };
  return (
    <div>
      <Row>
        <Col span={12}>
          <div className="store-upload">
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
              editType={
                uploadObject[0]?.url?.length > 0 ||
                uploadObject[0]?.productImageInfo?.product_image?.length > 0
              }
            />
          </div>
        </Col>
        <Col span={12}>
          <Row className="store-google-map" onClick={handleUseGoogleAddress}>
            <span>
              <GoogleMapIcon />
            </span>
            <div>{USE_GOOGGLE_MAP_TO_ADD_ADDRESS}</div>
          </Row>
        </Col>
      </Row>
      <Col>
        <Form.Item
          className="store_name"
          name="store_name"
          label="Store Name"
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
          className="store-phone"
          name="store_person_number"
          label="Person Contact"
          rules={[
            ...getFormItemRules({
              phone: true,
              phoneError: isError,
            }),
            {
              required: true,
              message: 'Please enter the phone number!',
            },
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
          className="store_person_name"
          label="Person Name"
          name="store_person_name"
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
        <Form.Item
          className="store-address-details"
          name="store_location"
          label="Store Address (use map to autofill)"
          rules={[
            ...getFormItemRules({}),
            {
              required: true,
              message: 'Store address is required',
            },
          ]}
        >
          <TextArea placeholder="Enter Store Address" />
        </Form.Item>
      </Col>
      <div className="store-location">
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item
              label="State"
              name={
                !isEmpty(IsCountryCode) && IsCountryCode !== 'IN'
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
                showSearch
                allowClear
                virtual={false}
                placeholder="Select State"
                className="select-height"
                optionFilterProp="children"
                autoComplete="dontshow"
                onClear={handleStateClear}
                onChange={handleState}
                filterOption={(inputData, optionData) =>
                  optionData.children
                    .toLowerCase()
                    .includes(inputData.toLowerCase()) === true
                }
              >
                {(stateData && isEmpty(IsCountryCode)) || IsCountryCode === 'IN'
                  ? sortBy(stateData, (stateValue) => {
                      return stateValue?.state_name;
                    }).map((state) => (
                      <Option key={state?.id} value={state?.id}>
                        {state?.state_name}
                      </Option>
                    ))
                  : map(stateData, (state) => (
                      <Option key={state.isoCode} value={state.name}>
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
                !isEmpty(IsCountryCode) && IsCountryCode !== 'IN'
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
                autoComplete="dontshow"
                onClear={handleDistrictClear}
                onChange={handleDistrict}
                filterOption={(inputSet, optionSet) =>
                  optionSet.children
                    .toLowerCase()
                    .includes(inputSet.toLowerCase()) === true
                }
              >
                {(districtData && isEmpty(IsCountryCode)) ||
                IsCountryCode === 'IN'
                  ? map(districtData, (district) => (
                      <Option
                        key={get(district, 'district_id', '')}
                        value={get(district, 'district_id', '')}
                      >
                        {get(district, 'district_name', '')}
                      </Option>
                    ))
                  : map(districtData, (district) => (
                      <Option value={get(district, 'name', '')}>
                        {get(district, 'name', '')}
                      </Option>
                    ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item
              name="pincode"
              label="PinCode"
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
                      (isEmpty(IsCountryCode) || IsCountryCode === 'IN')
                    ) {
                      const result = await pincodeValidationFunction(value);
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
                placeholder="Enter Pincode"
                style={{ width: '100%' }}
                onKeyDown={handleKeyDown}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="latitude"
              label="Latitude"
              rules={[
                {
                  required: true,
                  message: 'Latitude is required',
                },
                () => ({
                  validator(rule, value) {
                    if (
                      value &&
                      (!Number(value) || value >= 90 || value <= -90)
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
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item
              name="longitude"
              label="Longitude"
              rules={[
                {
                  required: true,
                  message: 'Longitude is required',
                },
                () => ({
                  validator(rule, value) {
                    if (
                      value &&
                      (!Number(value) || value >= 180 || value <= -180)
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
          <Col span={12}>
            <Form.Item
              name="gst_number"
              label="GST Number"
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
      {handleFormSubmit()}
    </div>
  );
}

export default StoreMobileForm;
