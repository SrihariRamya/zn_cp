import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import {
  get,
  map,
  sortBy,
  filter,
  isEmpty,
  includes,
  isUndefined,
} from 'lodash';
import {
  Collapse,
  Spin,
  Button,
  Select,
  notification,
  Form,
  Row,
  Col,
  Tag,
} from 'antd';
import './store.less';
import { DeleteAlert } from '../../shared/sweetalert-helper';
import {
  getStateByStoreId,
  getLocalityBySubDistId as getLocalityBySubDistributionId,
  getDistrictByStateID,
  getSubDistrictByDistrictID,
  createDeliveryLocation,
  deleteRedisStoreLocationData,
  deleteDeliveryLocation,
} from '../../utils/api/url-helper';
import {
  FAILED_TO_LOAD,
  LOCATION_ADD_SUCCESS,
  LOCATION_ADD_FAILED,
  LOCATION_DELETE_SUCCESS,
  LOCATION_DELETE_FAILED,
} from '../../shared/constant-values';

const { Option } = Select;
const { Panel } = Collapse;
function LocationForm(properties) {
  const { storeID, deliveryLocActive, adminEvent, formData } = properties;
  const [form] = Form.useForm();
  const [panelLoading, setPanelLoading] = useState(false);
  const [subDistrictPanelLoading, setSubDistrictPanelLoading] = useState(false);
  const [pincodePanelLoading, setPincodePanelLoading] = useState(false);
  const [activeState, setActiveState] = useState([]);
  const [locationVisible, setLocationVisible] = useState(false);
  const [pincodesVisible, setPincodesVisible] = useState(false);
  const [subDistrictVisible, setSubDistrictVisible] = useState(false);
  const [filteredStateData, setFilteredStateData] = useState([]);
  const [activeStateKey, setActiveStateKey] = useState([]);
  const [formValues, setFormValues] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [editFormData, setEditFormData] = useState({ users: [] });

  useEffect(() => {
    if (!isEmpty(formData)) {
      const locationData = { users: formData };
      form.setFieldsValue(locationData);
      setFormValues(locationData);
      setEditFormData(locationData);
      setSelectedLocation(
        map(formData, (item, index) => {
          return {
            id: index,
            state_id: get(item, 'stateData', ''),
            district: [],
            subDistrict: [],
            locality: [],
          };
        })
      );
    }
  }, [formData]);

  const fetchData = (parameter) => {
    setPanelLoading(true);
    const { initialCall } = parameter;
    const apiArray = [getStateByStoreId(storeID)];
    if (initialCall) {
      apiArray.push(deleteRedisStoreLocationData());
    }
    Promise.all(apiArray)
      .then((response) => {
        const filteredData = get(response, '[0].allStateData', []).filter(
          (state) => {
            const data = get(response, '[0].uniqStateData', []).find(
              (element) => state.id === element.state_id
            );
            return data;
          }
        );
        setFilteredStateData(get(response, '[0].allStateData', []));
        setActiveState(filteredData);
        setPanelLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error.message || FAILED_TO_LOAD });
        setPanelLoading(false);
      });
  };

  useEffect(() => {
    fetchData({ initialCall: true });
  }, []);

  const onSubDistrictChange = async (key, index) => {
    setPanelLoading(true);
    const queryParameter = {
      sub_district_id: key,
      store_uid: storeID || '',
    };

    await getLocalityBySubDistributionId(queryParameter)
      .then(async (response) => {
        const localityDatas = get(response, 'data', []);
        const upandLocation = await selectedLocation;
        upandLocation[index].id = index;
        upandLocation[index].locality = localityDatas;
        setSelectedLocation(upandLocation);

        if (formValues?.users[index]?.localityData?.length) {
          const updateLocality = formValues;
          const localityId = map(localityDatas, (item) => item.locality_id);
          const filterLocality = filter(
            updateLocality.users[index].localityData,
            (locData) => includes(localityId, locData)
          );
          updateLocality.users[index].localityData = filterLocality;
          form.setFieldsValue(updateLocality);
          setFormValues(updateLocality);
        }

        setPanelLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error.message || FAILED_TO_LOAD });
        setPanelLoading(false);
      });
  };

  const onDistrictChange = (key, index) => {
    setPanelLoading(true);
    const queryParameter = {
      district_id: key,
      store_uid: storeID || '',
    };
    if (key) {
      getSubDistrictByDistrictID(queryParameter)
        .then(async (response) => {
          const subDistrict = get(response, 'data', []);
          const upandLocation = selectedLocation;
          upandLocation[index].id = index;
          upandLocation[index].subDistrict = subDistrict;
          setSelectedLocation(upandLocation);

          if (formValues?.users[index]?.subDistrictData?.length) {
            const updateSubDisValues = formValues;
            const subDistrictId = map(
              subDistrict,
              (item) => item.sub_district_id
            );
            const filterSubDistrict = filter(
              updateSubDisValues.users[index].subDistrictData,
              (subDisData) => includes(subDistrictId, subDisData)
            );
            updateSubDisValues.users[index].subDistrictData = filterSubDistrict;
            form.setFieldsValue(updateSubDisValues);
            setFormValues(updateSubDisValues);
            onSubDistrictChange(
              updateSubDisValues.users[index].subDistrictData,
              index
            );
          }

          setPanelLoading(false);
          if (
            editFormData?.users?.length > 0 &&
            editFormData?.users[index] !== undefined &&
            editFormData?.users[index]?.localityData &&
            selectedLocation[index]?.locality?.length === 0
          ) {
            onSubDistrictChange(
              editFormData?.users[index].subDistrictData,
              index
            );
          }
        })
        .catch((error) => {
          notification.error({ message: error.message || FAILED_TO_LOAD });
          setPanelLoading(false);
        });
    }
  };

  const onStateChange = (key, index) => {
    setPanelLoading(true);
    const queryParameter = {
      state_id: key,
      store_uid: storeID || '',
    };
    if (key) {
      getDistrictByStateID(queryParameter)
        .then((response) => {
          const districtData = get(response, 'data', []);
          const upandLocation = selectedLocation;
          upandLocation[index].id = index;
          upandLocation[index].district = districtData;
          upandLocation[index].subDistrict = [];
          upandLocation[index].locality = [];
          setSelectedLocation(upandLocation);
          setPanelLoading(false);
          if (
            editFormData?.users?.length > 0 &&
            editFormData?.users[index] !== undefined &&
            editFormData?.users[index]?.subDistrictData &&
            selectedLocation[index]?.subDistrict?.length === 0
          ) {
            onDistrictChange(editFormData?.users[index].districtData, index);
          }
        })
        .catch((error) => {
          notification.error({ message: error.message || FAILED_TO_LOAD });
          setPanelLoading(true);
        });
    }
  };

  const stateOnClick = () => {
    const addMoreLocation = [
      ...selectedLocation,
      {
        id: '',
        state_id: '',
        district: [],
        subDistrict: [],
        locality: [],
      },
    ];
    setSelectedLocation(addMoreLocation);
    setActiveStateKey(get(formValues, 'users.length', 0));
    adminEvent('Add More Location');
    setLocationVisible(true);
  };

  const handleState = (value, option, index) => {
    const updateFormValue = formValues;
    const updateSelectedLocation = selectedLocation;
    if (isUndefined(value)) {
      updateFormValue.users[index].stateData = '';
      updateFormValue.users[index].districtData = [];
      updateFormValue.users[index].subDistrictData = [];
      updateFormValue.users[index].localityData = [];
      form.setFieldsValue(updateFormValue);
      setFormValues(updateFormValue);
      updateSelectedLocation[index].district = [];
      updateSelectedLocation[index].subDistrict = [];
      updateSelectedLocation[index].locality = [];
      setSelectedLocation(updateSelectedLocation);
    } else {
      const upandLocation = updateSelectedLocation;
      upandLocation[index].id = index;
      upandLocation[index].state_id = value;
      setSelectedLocation(upandLocation);
      const selectedStateList = [
        {
          state_name: get(option, 'children', ''),
          id: get(option, 'value', ''),
        },
      ];
      const userSelectedState = [
        ...activeState,
        get(selectedStateList, '[0]', []),
      ];
      setActiveState(userSelectedState);
      onStateChange(selectedStateList[0].id, index);
      if (updateFormValue?.users[index] !== undefined) {
        updateFormValue.users[index].stateData = value;
        updateFormValue.users[index].districtData = [];
        updateFormValue.users[index].subDistrictData = [];
        updateFormValue.users[index].localityData = [];
        form.setFieldsValue(updateFormValue);
      }
    }
  };

  const handleSave = (index) => {
    const userData = formValues?.users[index];
    const { stateData, districtData, subDistrictData, localityData } =
      userData || {};
    const formDatas = {
      state_id: stateData,
      district_id: districtData,
      sub_district_id: subDistrictData,
      checkedList: localityData,
      store_uid: storeID,
    };
    createDeliveryLocation(formDatas)
      .then((response) => {
        if (response.success) {
          notification.success({ message: LOCATION_ADD_SUCCESS });
          fetchData({ initialCall: false });
          setActiveStateKey([]);
          setLocationVisible(false);
        }
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'error', LOCATION_ADD_FAILED),
        });
        fetchData({ initialCall: true });
        setActiveStateKey([]);
      });
  };

  const onPanelChange = (key) => {
    setPanelLoading(true);
    const locationKey = Number(get(key, '[0]', 0));
    setActiveStateKey(locationKey);
    if (formValues?.users[locationKey]) {
      setSubDistrictVisible(`activeSubDis${locationKey}`);
      setPincodesVisible(`activePinCode${locationKey}`);
    }
    if (
      editFormData?.users?.length > 0 &&
      editFormData?.users[locationKey] !== undefined &&
      editFormData?.users[locationKey]?.districtData &&
      selectedLocation[locationKey]?.district?.length === 0
    ) {
      onStateChange(editFormData?.users[locationKey]?.stateData, locationKey);
    } else setPanelLoading(false);
  };
  const onValuesChange = () => {
    const allFieldValues = form.getFieldsValue();
    setFormValues(allFieldValues);
  };

  const handleDeleteLocation = async (event, properties_, remove, index) => {
    setPanelLoading(true);
    event.stopPropagation();
    const text = 'Are you sure you want to delete this Active Location ? ';
    const result = await DeleteAlert(text, index);
    properties_.store_uid = storeID;
    if (storeID && result?.isConfirmed) {
      deleteDeliveryLocation(properties_)
        .then(() => {
          notification.success({ message: LOCATION_DELETE_SUCCESS });
          remove(index);
          fetchData({ initialCall: false });
          setActiveStateKey([]);
          setPanelLoading(false);
        })
        .catch((error) => {
          notification.error({
            message: error.message || LOCATION_DELETE_FAILED,
          });
          fetchData({ initialCall: false });
          setActiveStateKey([]);
          setPanelLoading(false);
        });
    } else {
      remove(index);
      const removeLocation = selectedLocation;
      if (
        !selectedLocation[index]?.id ||
        !selectedLocation[index]?.state_id ||
        !selectedLocation[index]?.district?.length ||
        !selectedLocation[index]?.subDistrict?.length ||
        !selectedLocation[index]?.locality?.length
      ) {
        setLocationVisible(false);
      }
      const filterSelectedLoc = filter(
        removeLocation,
        (data) => data.id !== index
      );
      const updatedSelectedLoc = map(filterSelectedLoc, (item, index_) => {
        return { ...item, id: index_ };
      });
      setSelectedLocation(updatedSelectedLoc);
      if (get(filterSelectedLoc, 'length', 0) === 0) {
        setSubDistrictVisible(false);
        setPincodesVisible(false);
      }
      setPanelLoading(false);
    }
  };
  const deleteOption = (properties__, remove, index) => {
    if (deliveryLocActive) {
      return (
        <Tag color="red">
          <DeleteOutlined
            onClick={(event) => {
              handleDeleteLocation(event, properties__, remove, index);
            }}
          />
        </Tag>
      );
    }
    return '';
  };

  // district
  const onCheckAllDistrict = (index) => {
    if (selectedLocation[index]?.district?.length) {
      setSubDistrictVisible(`activeSubDis${index}`);
      const districtDatas = selectedLocation[index]?.district?.map(
        (data) => data?.district_id
      );

      formValues.users[index].districtData = districtDatas;
      form.setFieldsValue(formValues);
      onDistrictChange(districtDatas, index);
    }
  };
  const onChangeByCheckDistrict = (list, index) => {
    setSubDistrictVisible(`activeSubDis${index}`);
    formValues.users[index].districtData = list;
    onDistrictChange(list, index);
  };
  // sub district
  const onCheckAllSubDistrict = (index) => {
    if (selectedLocation[index]?.subDistrict?.length) {
      setTimeout(() => {
        setSubDistrictPanelLoading(true);
        setPincodesVisible(`activePinCode${index}`);
        const subDistrict = selectedLocation[index]?.subDistrict?.map(
          (data) => data?.sub_district_id
        );
        formValues.users[index].subDistrictData = subDistrict;
        form.setFieldsValue(formValues);
        onSubDistrictChange(subDistrict, index);
        setSubDistrictPanelLoading(false);
      }, 1000);
    }
  };
  const onChangeByCheckSubDistrict = async (list, index) => {
    setPincodesVisible(`activePinCode${index}`);
    formValues.users[index].subDistrictData = list;
    await onSubDistrictChange(list, index);
  };

  // pincode
  const onCheckAllPinCode = (index) => {
    if (selectedLocation[index]?.locality?.length) {
      setPincodePanelLoading(true);
      setTimeout(() => {
        formValues.users[index].localityData = selectedLocation[
          index
        ]?.locality?.map((data) => data?.locality_id);
        form.setFieldsValue(formValues);
        setPincodePanelLoading(false);
      }, 1000);
    }
  };
  const onChangeByCheckPinCode = (list, index) => {
    formValues.users[index].localityData = list;
  };

  return (
    <Form
      name="dynamic_form_more_location"
      onValuesChange={onValuesChange}
      autoComplete="off"
      layout="vertical"
      form={form}
    >
      <Spin spinning={panelLoading}>
        <div>
          <Form.List name="users">
            {(fields, { add, remove }) => (
              <>
                {!locationVisible && (
                  <Form.Item>
                    <Row justify="end">
                      <Button
                        onClick={() => {
                          stateOnClick();
                          add();
                        }}
                        type="primary"
                        disabled={!deliveryLocActive}
                      >
                        <PlusOutlined />
                        Add More Location
                      </Button>
                    </Row>
                  </Form.Item>
                )}
                {fields.map(({ key, name, ...restField }) => (
                  <Collapse
                    expandIconPosition="end"
                    className="mt-10 mb-10"
                    activeKey={activeStateKey}
                    onChange={onPanelChange}
                    accordion
                    key={name}
                  >
                    <Panel
                      key={key}
                      header={get(
                        activeState[key],
                        'state_name',
                        'Location Name'
                      )}
                      forceRender
                      extra={deleteOption(
                        {
                          state_id: get(activeState[name], 'id', ''),
                        },
                        remove,
                        name
                      )}
                    >
                      <div>
                        <Row>
                          <Col xs={24} sm={24} md={20} lg={20} xl={20}>
                            <Row gutter={8}>
                              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                <Form.Item
                                  label="State"
                                  {...restField}
                                  name={[name, 'stateData']}
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
                                    style={{ width: '100%' }}
                                    onChange={(value, option) =>
                                      handleState(value, option, name)
                                    }
                                    className="select-height"
                                    placeholder="Please select the state"
                                    filterOption={(input, option) =>
                                      option.children
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                    }
                                  >
                                    {filteredStateData &&
                                      sortBy(
                                        filteredStateData,
                                        (stateValue) => {
                                          return get(
                                            stateValue,
                                            'state_name',
                                            ''
                                          );
                                        }
                                      ).map((state) =>
                                        selectedLocation.some((data) => {
                                          return (
                                            get(data, 'state_id', '') ===
                                              get(state, 'id', '') &&
                                            get(data, 'id', '') !== name
                                          );
                                        }) ? (
                                          ''
                                        ) : (
                                          <Option
                                            key={get(state, 'id', '')}
                                            value={get(state, 'id', '')}
                                          >
                                            {get(state, 'state_name', '')}
                                          </Option>
                                        )
                                      )}
                                  </Select>
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row>
                              <Col span={24}>
                                <div className="store-button-box">
                                  <Button
                                    htmlType="button"
                                    type="primary"
                                    onClick={() => onCheckAllDistrict(name)}
                                  >
                                    Import All
                                  </Button>
                                </div>
                                <Form.Item
                                  label="District"
                                  {...restField}
                                  name={[name, 'districtData']}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'District is required',
                                    },
                                  ]}
                                >
                                  <Select
                                    allowClear
                                    showSearch
                                    virtual={false}
                                    mode="multiple"
                                    className="store-tags-select"
                                    optionFilterProp="children"
                                    autoComplete="dontshow"
                                    onChange={(value) =>
                                      onChangeByCheckDistrict(value, name)
                                    }
                                    placeholder="Please select the district"
                                    filterOption={(input, option) =>
                                      option.children
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                    }
                                  >
                                    {get(
                                      selectedLocation[name],
                                      'district',
                                      []
                                    ) &&
                                      sortBy(
                                        get(
                                          selectedLocation[name],
                                          'district',
                                          []
                                        ),
                                        (districtValue) => {
                                          return get(
                                            districtValue,
                                            'district_name',
                                            ''
                                          );
                                        }
                                      ).map((district) => (
                                        <Option
                                          key={get(district, 'district_id', '')}
                                          value={get(
                                            district,
                                            'district_id',
                                            ''
                                          )}
                                        >
                                          {get(district, 'district_name', '')}
                                        </Option>
                                      ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                            </Row>
                            {subDistrictVisible === `activeSubDis${name}` && (
                              <Row>
                                <Col span={24}>
                                  <div className="store-button-box">
                                    <Button
                                      type="primary"
                                      onClick={() =>
                                        onCheckAllSubDistrict(name)
                                      }
                                    >
                                      Import All
                                    </Button>
                                  </div>
                                  <Form.Item
                                    label="Sub District"
                                    {...restField}
                                    name={[name, 'subDistrictData']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Sub District is required',
                                      },
                                    ]}
                                  >
                                    <Select
                                      allowClear
                                      showSearch
                                      virtual={false}
                                      mode="multiple"
                                      className="store-tags-select"
                                      optionFilterProp="children"
                                      autoComplete="dontshow"
                                      style={{ width: '100%' }}
                                      loading={subDistrictPanelLoading}
                                      onChange={(value) =>
                                        onChangeByCheckSubDistrict(value, name)
                                      }
                                      placeholder="Please select the Sub-district"
                                      filterOption={(input, option) =>
                                        option.children
                                          .toLowerCase()
                                          .includes(input.toLowerCase())
                                      }
                                    >
                                      {get(
                                        selectedLocation[name],
                                        'subDistrict',
                                        []
                                      ) &&
                                        sortBy(
                                          get(
                                            selectedLocation[name],
                                            'subDistrict',
                                            []
                                          ),
                                          (stateValue) => {
                                            return get(
                                              stateValue,
                                              'sub_district_name',
                                              ''
                                            );
                                          }
                                        ).map((state) => (
                                          <Option
                                            key={get(
                                              state,
                                              'sub_district_id',
                                              ''
                                            )}
                                            value={get(
                                              state,
                                              'sub_district_id',
                                              ''
                                            )}
                                          >
                                            {get(
                                              state,
                                              'sub_district_name',
                                              ''
                                            )}
                                          </Option>
                                        ))}
                                    </Select>
                                  </Form.Item>
                                </Col>
                              </Row>
                            )}
                            {pincodesVisible === `activePinCode${name}` && (
                              <Row>
                                <Col span={24}>
                                  <div className="store-button-box">
                                    <Button
                                      type="primary"
                                      onClick={() => onCheckAllPinCode(name)}
                                    >
                                      Import All
                                    </Button>
                                  </div>
                                  <Form.Item
                                    label="Pincode"
                                    {...restField}
                                    name={[name, 'localityData']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Pincode is required',
                                      },
                                    ]}
                                  >
                                    <Select
                                      allowClear
                                      showSearch
                                      virtual={false}
                                      mode="multiple"
                                      className="store-tags-select"
                                      optionFilterProp="children"
                                      autoComplete="dontshow"
                                      style={{ width: '100%' }}
                                      onChange={(value) =>
                                        onChangeByCheckPinCode(value, name)
                                      }
                                      placeholder="Please select the Pin-code"
                                      filterOption={(input, option) =>
                                        option.children
                                          .toLowerCase()
                                          .includes(input.toLowerCase())
                                      }
                                      loading={pincodePanelLoading}
                                    >
                                      {get(
                                        selectedLocation[name],
                                        'locality',
                                        []
                                      ) &&
                                        sortBy(
                                          get(
                                            selectedLocation[name],
                                            'locality',
                                            []
                                          ),
                                          (stateValue) => {
                                            return get(
                                              stateValue,
                                              'pincode',
                                              ''
                                            );
                                          }
                                        ).map((state) => (
                                          <Option
                                            key={get(state, 'locality_id', '')}
                                            value={get(
                                              state,
                                              'locality_id',
                                              ''
                                            )}
                                          >
                                            {get(state, 'pincode', '')}
                                          </Option>
                                        ))}
                                    </Select>
                                  </Form.Item>
                                </Col>
                              </Row>
                            )}
                          </Col>
                          <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                            <div
                              className="text-right"
                              style={{ marginTop: '28px' }}
                            >
                              <Button
                                disabled={
                                  formValues?.users[name]?.stateData ===
                                    undefined ||
                                  formValues?.users[name]?.districtData ===
                                    undefined ||
                                  formValues?.users[name]?.subDistrictData ===
                                    undefined ||
                                  formValues?.users[name]?.localityData ===
                                    undefined ||
                                  !formValues?.users[name]?.stateData ||
                                  formValues?.users[name]?.districtData
                                    ?.length === 0 ||
                                  formValues?.users[name]?.subDistrictData
                                    ?.length === 0 ||
                                  formValues?.users[name]?.localityData
                                    ?.length === 0
                                }
                                size="large"
                                type="primary"
                                style={{ marginRight: '8px' }}
                                onClick={() => handleSave(name)}
                              >
                                Save
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Panel>
                  </Collapse>
                ))}
              </>
            )}
          </Form.List>
        </div>
      </Spin>
    </Form>
  );
}
export default LocationForm;
