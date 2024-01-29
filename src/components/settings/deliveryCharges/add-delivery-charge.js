import {
  Button,
  Checkbox,
  Col,
  Empty,
  Form,
  InputNumber,
  notification,
  Row,
  Select,
  Space,
  Spin,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import React, { useState, useCallback, useEffect, useContext } from 'react';
import _, {
  get,
  compact,
  map,
  isEmpty,
  isNull,
  find,
  filter,
  forEach,
} from 'lodash';
import {
  getState,
  getDistrict,
  createDeliveryChargeLocation,
  updateDeliveryChargeLocation,
  getAllDelivery,
  getCountryByCode,
  getInternationalState,
  getCitiesOfCountry,
  getAllCountry,
} from '../../../utils/api/url-helper';
import './delivery-charges.less';
import Details from './delivery-charges-details';
import {
  CURRENCYSYMBOLS,
  DELIVERYCHARGE_ADD_FAILED,
  DELIVERYCHARGE_ADD_SUCCESS,
  DELIVERYCHARGE_UPDATE_FAILED,
  DELIVERYCHARGE_UPDATE_SUCCESS,
  FAILED_TO_LOAD,
} from '../../../shared/constant-values';
import { TenantContext } from '../../context/tenant-context';

function Create(properties) {
  const { mobileView } = properties;
  const { Option } = Select;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stateData, setStateData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [checkAllDistrict, setCheckAllDistrict] = useState(false);
  const [plainOptionDistrict, setPlainOptionDistrict] = useState([]);
  const [checkedDistrictList, setCheckedDistrictList] = useState([]);
  const [alreadySelected, setAlreadySelected] = useState([]);
  const [deliveryData, setDeliveryData] = useState([]);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [editData, setEditData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isCountryCode, setIsCountryCode] = useState('');
  const [countryLoading, setCountryLoading] = useState(false);
  const [countryList, setCountryList] = useState([]);

  const [tenantDetails, , , tenantConfig] = useContext(TenantContext);
  const currency = CURRENCYSYMBOLS[get(tenantDetails, 'setting.currency', '')];
  const countryUrl = get(tenantConfig, 'country_url', '');

  const handleDeliveryCharge = (values) => {
    setDeliveryCharge(values);
  };

  const fetehCountry = async () => {
    setCountryLoading(true);
    await getAllCountry(countryUrl)
      .then(async (response) => {
        const countryArrayValue = await response.json();
        setCountryList(_.get(countryArrayValue, 'data', []));
        setCountryLoading(false);
      })
      .catch(() => {
        setCountryLoading(false);
      });
  };

  useEffect(() => {
    fetehCountry();
  }, []);

  const getDelivery = (parameters = {}) => {
    const {
      pagination: { pageSize, current },
    } = parameters;
    const apiArray = [getAllDelivery({ limit: pageSize, offset: current })];
    Promise.all(apiArray)
      .then((resp) => {
        const delivery = _.get(resp, '[0].data', []);
        setDeliveryData(delivery.rows);
        const mappedDistrict = [];
        const rows = get(delivery, 'rows', []);
        map(rows, (item) =>
          forEach(item.location_mapped, (items) =>
            mappedDistrict.push(items.district_id)
          )
        );
        map(rows, (item) =>
          forEach(item.location_mapped, (items) =>
            mappedDistrict.push(items.international_city)
          )
        );
        setAlreadySelected(mappedDistrict);
        setPagination({ ...parameters.pagination, total: delivery.count });
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const handleState = async (value, data, condition) => {
    setCheckAllDistrict(false);
    setCheckedDistrictList([]);
    if (value.length > 0) {
      const cityData = [];
      if (!isEmpty(condition) && condition !== 'IN') {
        if (!isEmpty(editData)) {
          await Promise.all(
            value.map(async (item) => {
              const citiesOfstatesValue = await getCitiesOfCountry(
                condition,
                item
              );
              const citiesArrayData = await citiesOfstatesValue.json();
              const citiesOfstate = _.get(citiesArrayData, 'data', []);
              cityData.push(citiesOfstate);
            })
          );

          const checkedArea = editData?.location_mapped.map(
            (item) => item.international_city
          );
          setCheckedDistrictList(checkedArea);
        } else if (!isEmpty(isCountryCode) && isCountryCode !== 'IN') {
          const stateOfCodes = [];
          map(data, (item) => {
            stateOfCodes.push(item.key);
          });

          if (stateOfCodes.length > 0) {
            await Promise.all(
              stateOfCodes.map(async (item) => {
                const citiesOfstatesInfo = await getCitiesOfCountry(
                  condition,
                  item
                );
                const citiesOfstatesArray = await citiesOfstatesInfo.json();
                const citiesOfstateInfo = _.get(
                  citiesOfstatesArray,
                  'data',
                  []
                );
                cityData.push(citiesOfstateInfo);
              })
            );
          }
          setDistrictData(cityData.flat());
          getDelivery({
            pagination: { pageSize: 10, current: 1 },
          });
        }
      } else if (!isEmpty(isCountryCode) && isCountryCode !== 'IN') {
        const stateOfCodesValue = [];
        map(data, (item) => {
          stateOfCodesValue.push(item.key);
        });

        if (stateOfCodesValue.length > 0) {
          await Promise.all(
            stateOfCodesValue.map(async (item) => {
              const citiesOfstates = await getCitiesOfCountry(
                isCountryCode,
                item
              );
              const cityOfstatesArray = await citiesOfstates.json();
              const citiesOfstateData = _.get(cityOfstatesArray, 'data', []);
              cityData.push(citiesOfstateData);
            })
          );
        }
        getDelivery({
          pagination: { pageSize: 10, current: 1 },
        });
        setDistrictData(cityData.flat());
      } else {
        getDistrict(value)
          .then((response) => {
            const district = _.get(response, 'dataset', []);
            setDistrictData(district);
            if (!editData) {
              const checkedArea = filter(district, (item) => {
                const filData = find(
                  [],
                  (element) => item.district_id === element.district_id
                );
                return filData;
              });
              const checkedDistrict = map(
                checkedArea,
                (item) => item.district_id
              );
              if (get(response, 'dataset', []).length === checkedArea.length)
                setCheckAllDistrict(true);
              setCheckedDistrictList(compact(checkedDistrict));
              const allDistrictData = map(district, (item) => item.district_id);
              setPlainOptionDistrict(allDistrictData);
            }
            if (editData) {
              const checkedArea = filter(district, (item) => {
                const filData = find(
                  editData?.location_mapped,
                  (element) => item.district_id === element.district_id
                );
                return filData;
              });

              const checkedDistrict = map(
                checkedArea,
                (item) => item.district_id
              );
              if (get(response, 'dataset', []).length === checkedArea.length)
                setCheckAllDistrict(true);
              setCheckedDistrictList(compact(checkedDistrict));
              const allDistrictData = map(district, (item) => item.district_id);
              setPlainOptionDistrict(allDistrictData);
            }
          })
          .catch(() => {
            notification.error({ message: FAILED_TO_LOAD });
          });
      }
    } else {
      setDistrictData([]);
    }
  };
  const handleStateClear = () => {
    setCheckAllDistrict(false);
    setDistrictData([]);
  };
  const onChangeDistrict = (list) => {
    if (isEmpty(isCountryCode) || isCountryCode === 'IN') {
      setCheckedDistrictList(list);
      setCheckAllDistrict(list.length === plainOptionDistrict.length);
    } else {
      setCheckedDistrictList(list);
    }
  };
  const onCheckAllChangeDistrict = (event) => {
    setCheckedDistrictList(event.target.checked ? plainOptionDistrict : []);
    setCheckAllDistrict(event.target.checked);
    if (event.target.checked) {
      if (isEmpty(isCountryCode) || isCountryCode === 'IN') {
        const filteredValue = filter(
          districtData,
          (value) => !alreadySelected.includes(value.district_id)
        );
        const dataId = map(filteredValue, (item) => item.district_id);
        setCheckedDistrictList(dataId);
      } else {
        const filteredValue = filter(
          districtData,
          (value) => !alreadySelected.includes(value.name)
        );
        const dataName = map(filteredValue, (item) => item.name);

        setCheckedDistrictList(dataName);
      }
    } else {
      setCheckedDistrictList([]);
    }
  };
  const fetchData = useCallback(() => {
    setLoading(true);
    const apiArray = [getState()];
    Promise.all(apiArray)
      .then(async (resp) => {
        const state = _.get(resp, '[0].data', []);

        setStateData(state);

        setLoading(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, [form]);

  const updateData = async () => {
    const condition = get(editData, 'location_mapped.0.international_code', '');
    setIsCountryCode(condition);
    if (!isNull(condition) && condition !== 'IN') {
      const stateArrays = await getInternationalState(condition);
      const stateArrayValue = await stateArrays.json();
      const stateArray = _.get(stateArrayValue, 'data', []);

      setStateData(stateArray);
      const stateOfCodesValue = _.uniq(
        map(editData?.location_mapped, (item) => item.state_code)
      );
      const statesArray = filter(stateArray, (value) =>
        stateOfCodesValue.includes(value.iso2)
      );

      const states = map(statesArray, (item) => item.name);
      const countryValue = await getCountryByCode(condition);
      const countryData = await countryValue.json();
      const country = _.get(countryData, 'data[0]', []);

      form.setFieldsValue({
        delivery_charge: editData?.delivery_charge,
        country: get(country, 'name', ''),
        state: states,
      });
      const cityValue = [];
      if (stateOfCodesValue.length > 0) {
        await Promise.all(
          stateOfCodesValue.map(async (item) => {
            const citiesOfstatesData = await getCitiesOfCountry(
              condition,
              item
            );
            const citiesOfstatesArrayValue = await citiesOfstatesData.json();
            const cityOfstateValue = _.get(
              citiesOfstatesArrayValue,
              'data',
              []
            );
            cityValue.push(cityOfstateValue);
          })
        );
      }
      setDistrictData(cityValue.flat());
      handleDeliveryCharge(editData?.delivery_charge);
      handleState(stateOfCodesValue, 'state', condition);
      const filteredValue = filter(alreadySelected, (value) => {
        return !editData?.location_mapped?.some(
          (object) => object.international_city === value
        );
      });
      setAlreadySelected(filteredValue);
    } else if (editData) {
      await fetchData();
      window.scroll({
        top: 0,
        behavior: 'smooth',
      });
      const stateId = _.uniq(
        map(editData?.location_mapped, (item) => item.state_id)
      );
      const districtId = map(
        editData?.location_mapped,
        (item) => item.district_id
      );
      setIsCountryCode('');
      form.setFieldsValue({
        delivery_charge: editData?.delivery_charge,
        country: 'India',
        state: stateId,
        district: districtId,
      });
      handleDeliveryCharge(editData?.delivery_charge);
      handleState(stateId);
      const filteredValue = filter(alreadySelected, (value) => {
        return !editData?.location_mapped?.some(
          (object) => object.district_id === value
        );
      });
      setAlreadySelected(filteredValue);
    } else {
      setEditData([]);
    }
  };
  const onUpdate = () => {
    const locationDataValue = [];
    if (isEmpty(isCountryCode) || isCountryCode === 'IN') {
      const filterId = filter(districtData, (data) =>
        checkedDistrictList.includes(data.district_id)
      );
      // eslint-disable-next-line no-restricted-syntax
      for (const index of filterId) {
        locationDataValue.push({
          district_id: index.district_id,
          state_id: index.state_id,
        });
      }
    } else {
      const filterLocationValue = filter(districtData, (data) =>
        checkedDistrictList.includes(data.name)
      );
      forEach(filterLocationValue, (index) => {
        locationDataValue.push({
          state_code: index.state_code,
          international_city: index.name,
          international_code: index.country_code,
        });
      });
    }
    const parameters = {
      criteria_id: editData.criteria_id,
      criteria_name: editData.criteria_name,
      delivery_charge: deliveryCharge,
      location_mapped: locationDataValue,
    };
    updateDeliveryChargeLocation(parameters)
      .then((result) => {
        if (result.success) {
          const { current } = pagination;
          const currentPageAlias =
            deliveryData.length === 1 && current > 1 ? current - 1 : current;
          getDelivery({
            pagination: { ...pagination, current: currentPageAlias },
          });
          notification.success({
            message: DELIVERYCHARGE_UPDATE_SUCCESS,
          });
          setDistrictData([]);
          setDeliveryData([]);
          setEditData([]);
          form.resetFields();
          setDeliveryCharge(0);
        }
      })
      .catch(() => {
        notification.error({ message: DELIVERYCHARGE_UPDATE_FAILED });
      });
  };
  const onFinish = () => {
    const locationData = [];
    if (isEmpty(isCountryCode) || isCountryCode === 'IN') {
      const filterId = filter(districtData, (data) =>
        checkedDistrictList.includes(data.district_id)
      );
      // eslint-disable-next-line no-restricted-syntax
      for (const index of filterId) {
        locationData.push({
          district_id: index.district_id,
          state_id: index.state_id,
        });
      }
    } else {
      const filterLocation = filter(districtData, (data) =>
        checkedDistrictList.includes(data.name)
      );
      forEach(filterLocation, (index) => {
        locationData.push({
          state_code: index.state_code,
          international_city: index.name,
          international_code: index.country_code,
        });
      });
    }
    const parameters = {
      criteria_name: 'By Location',
      delivery_charge: deliveryCharge,
      location_mapped: locationData,
    };
    createDeliveryChargeLocation(parameters)
      .then(() => {
        const { current } = pagination;
        const currentPageAlias =
          deliveryData.length === 1 && current > 1 ? current - 1 : current;
        getDelivery({
          pagination: { ...pagination, current: currentPageAlias },
        });
        notification.success({
          message: DELIVERYCHARGE_ADD_SUCCESS,
        });
        setDistrictData([]);
        setStateData([]);
        form.resetFields();
        setDeliveryCharge(0);
      })
      .catch(() => {
        notification.error({ message: DELIVERYCHARGE_ADD_FAILED });
      });
  };

  useEffect(() => {
    fetchData();
    getDelivery({
      pagination: { pageSize: 10, current: 1 },
    });
  }, [fetchData]);
  useEffect(() => {
    updateData();
  }, [editData]);
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const validatePositiveNumber = (rule, value, callback) => {
    if (value < 0) {
      callback('Value should not be a negative number');
    } else if (value === 0) {
      callback('Value should not be zero');
    } else {
      callback();
    }
  };

  const handleCountryChange = async (key) => {
    setCheckAllDistrict(false);
    setDistrictData([]);
    form.resetFields(['state']);
    const countryCode = countryList.find((code) => key === code?.name);
    setIsCountryCode(countryCode?.iso2);
    if (countryCode?.iso2 === 'IN') {
      const apiArray = [getState()];
      Promise.all(apiArray)
        .then(async (resp) => {
          const state = _.get(resp, '[0].data', []);

          setStateData(state);

          setLoading(false);
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
        });
    } else {
      const stateArrays = await getInternationalState(countryCode?.iso2);
      const stateValues = await stateArrays.json();
      const stateArray = _.get(stateValues, 'data', []);
      setStateData(stateArray);
    }
  };
  return (
    <div className="location-tab-main">
      <Spin spinning={loading || countryLoading}>
        <div className="location-form">
          {mobileView && !isEmpty(editData) && (
            <div style={{ display: 'flex' }}>
              <ArrowLeftOutlined
                onClick={() => setEditData([])}
                className="flexbox-center"
              />
              <p className="flexbox-center" style={{ marginLeft: '2px' }}>
                Back
              </p>
            </div>
          )}
          <Form
            form={form}
            className="user-form user-add-form delivery-form delivery-form-label"
            layout="vertical"
            onFinish={editData.length <= 0 ? onFinish : onUpdate}
          >
            <Row className="location-form-list form-display">
              <Col xs={11} sm={11} md={4} lg={4} xl={4} className="form1">
                <Form.Item label="Country" name="country">
                  <Select
                    showSearch
                    virtual={false}
                    autoComplete="newpassword"
                    onChange={handleCountryChange}
                    placeholder="Select country"
                  >
                    {map(countryList, (country) => (
                      <Option key={country.iso2} value={country.name}>
                        {country.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={6} lg={6} xl={6} className="form2">
                <Form.Item
                  label="State"
                  name="state"
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
                    placeholder="Select state"
                    mode="multiple"
                    optionFilterProp="children"
                    onChange={handleState}
                    autoComplete="dontshow"
                    maxTagCount="responsive"
                    onClear={handleStateClear}
                    filterOption={(inputData, optionData) =>
                      optionData.children
                        .toLowerCase()
                        .includes(inputData.toLowerCase()) === true
                    }
                  >
                    {isEmpty(isCountryCode) || isCountryCode === 'IN'
                      ? map(stateData, (state) => (
                          <Option value={state.id} key={state.id}>
                            {state.state_name}
                          </Option>
                        ))
                      : map(stateData, (state) => (
                          <Option key={state.iso2} value={state.name}>
                            {state.name}
                          </Option>
                        ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={6} lg={6} xl={6} className="form3">
                <Form.Item label="District" name="district">
                  {districtData?.length > 0 && (
                    <Checkbox
                      style={{
                        position: 'absolute',
                        top: '-30px',
                        right: '0',
                      }}
                      onChange={onCheckAllChangeDistrict}
                      checked={checkAllDistrict}
                    >
                      Check All
                    </Checkbox>
                  )}
                  <Select
                    mode="multiple"
                    virtual={false}
                    allowClear
                    onChange={onChangeDistrict}
                    value={checkedDistrictList}
                    className="district-select-field"
                  >
                    {(isEmpty(isCountryCode) || isCountryCode === 'IN') && (
                      // eslint-disable-next-line react/jsx-no-useless-fragment
                      <>
                        {districtData.length > 0 ? (
                          districtData.map((district) => (
                            <Option
                              value={district.district_id}
                              key={district.name}
                              disabled={alreadySelected.includes(
                                district.district_id
                              )}
                              className="product-level-select"
                            >
                              {district.district_name}
                              <Checkbox
                                className="product-name-checkbox"
                                checked={checkedDistrictList.includes(
                                  district.district_id
                                )}
                                disabled={alreadySelected.includes(
                                  district.district_id
                                )}
                              />
                            </Option>
                          ))
                        ) : (
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                      </>
                    )}
                    {!isEmpty(isCountryCode) && isCountryCode !== 'IN' && (
                      // eslint-disable-next-line react/jsx-no-useless-fragment
                      <>
                        {districtData.length > 0 ? (
                          districtData.map((district) => (
                            <Option
                              value={district.name}
                              key={district.name}
                              disabled={alreadySelected.includes(district.name)}
                              className="product-level-select"
                            >
                              {district.name}
                              <Checkbox
                                className="product-name-checkbox"
                                checked={checkedDistrictList.includes(
                                  district.name
                                )}
                                disabled={alreadySelected.includes(
                                  district.name
                                )}
                              />
                            </Option>
                          ))
                        ) : (
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                      </>
                    )}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={4} lg={4} xl={4} className="form4">
                <Form.Item
                  label={`Delivery Charge (in ${currency})`}
                  name="delivery_charge"
                  rules={[
                    {
                      required: true,
                      message: 'Delivery charge is required',
                    },
                    { validator: validatePositiveNumber },
                  ]}
                >
                  <InputNumber
                    type="number"
                    value={deliveryCharge}
                    onChange={handleDeliveryCharge}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={3}
                lg={3}
                xl={3}
                className="flexbox-end form5"
              >
                <Form.Item>
                  <Space className="f_btns">
                    <Button
                      disabled={checkedDistrictList.length <= 0}
                      htmlType="submit"
                      type="primary"
                    >
                      Save
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
        {isEmpty(editData) && (
          <div className="location-details">
            {deliveryData.length > 0 && (
              <Details
                setEditData={setEditData}
                getDelivery={getDelivery}
                deliveryData={deliveryData}
                pagination={pagination}
                setPagination={setPagination}
                mobileView={mobileView}
              />
            )}
          </div>
        )}
      </Spin>
    </div>
  );
}

export default Create;
