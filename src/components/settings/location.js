import React, { useEffect, useState } from 'react';
import { get, map, sortBy, filter, compact } from 'lodash';
import {
  Collapse,
  Spin,
  Tag,
  Button,
  Select,
  notification,
  Form,
  Modal,
  Checkbox,
  Divider,
  Row,
  Space,
  Col,
} from 'antd';
import './settings.less';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getStateByStoreId,
  getLocalityBySubDistId as getLocalityBySubDistributionId,
  getDistrictByStateID,
  getSubDistrictByDistrictID,
  createDeliveryLocation,
  deleteDeliveryLocation,
  deleteRedisStoreLocationData,
} from '../../utils/api/url-helper';
import {
  FAILED_TO_LOAD,
  LOCATION_ADD_SUCCESS,
  LOCATION_ADD_FAILED,
  LOCATION_DELETE_SUCCESS,
  LOCATION_DELETE_FAILED,
} from '../../shared/constant-values';
import getFormItemRules from '../../shared/form-helpers';
import { DeleteAlert } from '../../shared/sweetalert-helper';

const { Option } = Select;
const { Panel } = Collapse;
const CheckboxGroup = Checkbox.Group;

function Location(properties) {
  const { storeID, deliveryLocActive, adminEvent } = properties;
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [checkedList, setCheckedList] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [subDistrictData, setSubDistrictData] = useState([]);
  const [activeState, setActiveState] = useState([]);
  const [activeDistrict, setActiveDistrict] = useState([]);
  const [activeSubDistrict, setActiveSubDistrict] = useState([]);
  const [localityData, setLocalityData] = useState([]);
  const [selectedState, setSelectedState] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState([]);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState([]);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [subDistrictModalVisible, setSubDistrictModalVisible] = useState(false);
  const [plainOptions, setPlainOptions] = useState([]);
  const [filteredStateData, setFilteredStateData] = useState([]);
  const [filteredDistrictData, setFilteredDistrictData] = useState([]);
  const [filteredSubDistrictData, setFilteredSubDistrictData] = useState([]);
  const [activeStateKey, setActiveStateKey] = useState([]);
  const [activeDistrictKey, setActiveDistrictKey] = useState([]);
  const [activeSubDistrictKey, setActiveSubDistrictKey] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);

  const fetchData = (parameter) => {
    const { initialCall } = parameter;
    setLoading(true);
    const apiArray = [getStateByStoreId(storeID)];
    if (initialCall) {
      apiArray.push(deleteRedisStoreLocationData());
    }
    Promise.all(apiArray)
      .then((response) => {
        setStateData(get(response, '[0].allStateData', []));
        const filteredData = get(response, '[0].allStateData', []).filter(
          (state) => {
            const data = get(response, '[0].uniqStateData', []).find(
              (element) => state.id === element.state_id
            );
            return data;
          }
        );
        setActiveState(filteredData);
        setLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error.message || FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData({ initialCall: true });
  }, []);

  const onStateChange = (key) => {
    const queryParameter = {
      state_id: key,
      store_uid: storeID || '',
    };
    setActiveStateKey(key);
    if (key) {
      setLoading(true);
      getDistrictByStateID(queryParameter)
        .then((response) => {
          setDistrictData(get(response, 'data', []));
          const filterDistrictData = get(response, 'data', []).filter(
            (district) => {
              const data = get(response, 'uniqDistData', []).find(
                (element) => district.district_id === element.district_id
              );
              return data;
            }
          );
          setActiveDistrict(filterDistrictData);
          setLoading(false);
        })
        .catch((error) => {
          notification.error({ message: error.message || FAILED_TO_LOAD });
          setLoading(false);
        });
    }
  };

  const onDistrictChange = (key) => {
    const queryParameter = {
      district_id: key,
      store_uid: storeID || '',
    };
    setActiveDistrictKey(key);
    if (key) {
      setLoading(true);
      getSubDistrictByDistrictID(queryParameter)
        .then((response) => {
          setSubDistrictData(get(response, 'data', []));
          setCheckedList(get(response, 'checkedArea', []));
          const filterSubDistrictData = get(response, 'data', []).filter(
            (subDistrict) => {
              const data = get(response, 'uniqSubDistData', []).find(
                (element) =>
                  subDistrict.sub_district_id === element.sub_district_id
              );
              return data;
            }
          );
          setActiveSubDistrict(filterSubDistrictData);
          setLoading(false);
        })
        .catch((error) => {
          notification.error({ message: error.message || FAILED_TO_LOAD });
          setLoading(false);
        });
    }
  };

  const onSubDistrictChange = (key) => {
    setLoading(true);
    setCheckAll(false);
    const queryParameter = {
      sub_district_id: key,
      store_uid: storeID || '',
    };
    setActiveSubDistrictKey(key);
    getLocalityBySubDistributionId(queryParameter)
      .then((response) => {
        const data = get(response, 'data', []);
        setLocalityData(data);
        const checkedArea = get(response, 'data', []).filter((item) => {
          const filData = get(response, 'storeDeliLocalData', []).find(
            (element) => item.locality_id === element.locality_id
          );
          return filData;
        });
        const checkedLocalityArea = checkedArea.map((item) => item.locality_id);
        if (get(response, 'data', []).length === checkedArea.length)
          setCheckAll(true);
        setCheckedList(compact(checkedLocalityArea));
        const allLocalityData = get(response, 'data', []).map(
          (item) => item.locality_id
        );
        setLoading(false);
        setPlainOptions(allLocalityData);
      })
      .catch((error) => {
        notification.error({ message: error.message || FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  const handleState = (value, option) => {
    const selectedStateList = [
      { state_name: get(option, 'children', ''), id: get(option, 'value', '') },
    ];
    setSelectedState(selectedStateList);
  };

  const handleDistrict = (value, option) => {
    const selectedDistrictList = [
      {
        district_name: get(option, 'children', ''),
        district_id: get(option, 'value', ''),
      },
    ];
    setSelectedDistrict(selectedDistrictList);
  };

  const handleSubDistrict = (value, option) => {
    const selectedSubDistrictList = [
      {
        sub_district_name: get(option, 'children', ''),
        sub_district_id: get(option, 'value', ''),
      },
    ];
    setSelectedSubDistrict(selectedSubDistrictList);
  };

  const handleStateOk = () => {
    const userSelectedState = [...activeState, get(selectedState, '[0]', [])];
    setActiveState(userSelectedState);
    form.resetFields();
    setStateModalVisible(false);
  };

  const handleDistrictOk = () => {
    const userSelectedDistrict = [
      ...activeDistrict,
      get(selectedDistrict, '[0]', []),
    ];
    setActiveDistrict(userSelectedDistrict);
    form1.resetFields();
    setDistrictModalVisible(false);
  };

  const handleSubDistrictOk = () => {
    const newSubDistrictList = filter(subDistrictData, (subDistrict) => {
      return (
        get(selectedSubDistrict, '[0].sub_district_id', '') ===
        subDistrict.sub_district_id
      );
    });
    const userSelectedSubDistrict = [
      ...activeSubDistrict,
      get(newSubDistrictList, '[0]', []),
    ];
    setActiveSubDistrict(userSelectedSubDistrict);
    form2.resetFields();
    setSubDistrictModalVisible(false);
  };

  const onChange = (list) => {
    setCheckedList(list);
    setIndeterminate(list.length > 0 && list.length < plainOptions.length);
    setCheckAll(list.length === plainOptions.length);
  };

  const onCheckAllChange = (event) => {
    setCheckedList(event.target.checked ? plainOptions : []);
    setCheckAll(event.target.checked);
    setIndeterminate(false);
  };

  const handleSave = (subDistrict) => {
    setLoading(true);
    const formData = {
      state_id: subDistrict.state_id,
      district_id: subDistrict.district_id,
      sub_district_id: subDistrict.sub_district_id,
      checkedList,
      store_uid: storeID,
    };
    createDeliveryLocation(formData)
      .then((response) => {
        if (response.success) {
          notification.success({ message: LOCATION_ADD_SUCCESS });
          fetchData({ initialCall: false });
          setActiveStateKey('');
          setActiveDistrictKey('');
          setActiveSubDistrictKey('');
          setLoading(false);
        }
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'error', LOCATION_ADD_FAILED),
        });
        fetchData({ initialCall: true });
        setActiveStateKey('');
        setActiveDistrictKey('');
        setActiveSubDistrictKey('');
        setLoading(false);
      });
  };

  const handeleSaveCancel = () => {
    fetchData({ initialCall: false });
    setActiveStateKey('');
    setActiveDistrictKey('');
    setActiveSubDistrictKey('');
    setSelectedState([]);
    setSelectedDistrict([]);
    setSelectedSubDistrict([]);
  };

  const handleCancel = () => {
    form.resetFields();
    setStateModalVisible(false);
  };

  const stateOnClick = () => {
    adminEvent('Add More Location');
    const data = new Set(
      activeState.map((state) => {
        return state.id;
      })
    );
    const dataArray = stateData.filter((item) => {
      return !data.has(item.id);
    });
    setFilteredStateData(dataArray || stateData);
    setStateModalVisible(true);
  };

  const districtOnClick = () => {
    const data = new Set(
      activeDistrict.map((district) => {
        return district.district_id;
      })
    );
    const dataArray = districtData.filter((item) => {
      return !data.has(item.district_id);
    });
    setFilteredDistrictData(dataArray || districtData);
    setDistrictModalVisible(true);
  };

  const subDistrictOnClick = () => {
    const data = new Set(
      activeSubDistrict.map((subDistrict) => {
        return subDistrict.sub_district_id;
      })
    );
    const dataArray = subDistrictData.filter((item) => {
      return !data.has(item.sub_district_id);
    });
    setFilteredSubDistrictData(dataArray || subDistrictData);
    setSubDistrictModalVisible(true);
  };

  const handleDeleteLocation = async (event, properties_) => {
    event.stopPropagation();
    const text = 'Are you sure you want to delete this Active Location ? ';
    const result = await DeleteAlert(text);
    properties_.store_uid = storeID;
    if (result.isConfirmed) {
      setLoading(true);
      deleteDeliveryLocation(properties_)
        .then(() => {
          notification.success({ message: LOCATION_DELETE_SUCCESS });
          fetchData({ initialCall: false });
          setActiveStateKey('');
          setActiveDistrictKey('');
          setActiveSubDistrictKey('');
          setLoading(false);
        })
        .catch((error) => {
          notification.error({
            message: error.message || LOCATION_DELETE_FAILED,
          });
          fetchData({ initialCall: false });
          setActiveStateKey('');
          setActiveDistrictKey('');
          setActiveSubDistrictKey('');
          setLoading(false);
        });
    }
  };

  const deleteOption = (properties__) => {
    if (deliveryLocActive) {
      return (
        <Tag color="red">
          <DeleteOutlined
            onClick={(event) => {
              handleDeleteLocation(event, properties__);
            }}
          />
        </Tag>
      );
    }
    return '';
  };

  const handleDistrictCancel = () => {
    form1.resetFields();
    setDistrictModalVisible(false);
  };

  const handleSubDistrictCancel = () => {
    form2.resetFields();
    setSubDistrictModalVisible(false);
  };

  return (
    <Spin spinning={loading}>
      <div className="box mobile-side-padding">
        <div className="box__header bg-gray-lighter">
          <h3 className="box-title">Locations</h3>
        </div>
        <div className="box-container">
          <div className="heading-content">
            <h3 className="box-title">Active Location</h3>
            <div>
              <Button
                onClick={stateOnClick}
                type="primary"
                disabled={!deliveryLocActive}
              >
                <PlusOutlined />
                Add More Location
              </Button>
            </div>
          </div>
          <div className="list_padding">
            {activeState &&
              activeState.map((stateField) => {
                return (
                  <Collapse
                    onChange={onStateChange}
                    accordion
                    activeKey={activeStateKey}
                  >
                    <Panel
                      forceRender
                      header={stateField.state_name}
                      key={stateField.id}
                      extra={deleteOption({ state_id: stateField.id })}
                    >
                      <div className="list_scroll">
                        <div className="area-box">
                          <Button onClick={districtOnClick} type="primary">
                            <PlusOutlined />
                            Add District
                          </Button>
                        </div>
                        {activeDistrict.map((district) => {
                          return (
                            <Collapse
                              onChange={onDistrictChange}
                              accordion
                              activeKey={activeDistrictKey}
                            >
                              <Panel
                                forceRender
                                header={district.district_name}
                                key={district.district_id}
                                extra={deleteOption({
                                  district_id: district.district_id,
                                })}
                              >
                                <div className="area-box">
                                  <Button
                                    onClick={subDistrictOnClick}
                                    type="primary"
                                  >
                                    <PlusOutlined />
                                    Add Sub District
                                  </Button>
                                </div>
                                {activeSubDistrict.map((subDistrict) => {
                                  return (
                                    <Collapse
                                      onChange={onSubDistrictChange}
                                      accordion
                                      activeKey={activeSubDistrictKey}
                                    >
                                      <Panel
                                        forceRender
                                        header={subDistrict.sub_district_name}
                                        key={subDistrict.sub_district_id}
                                        extra={deleteOption({
                                          sub_district_id:
                                            subDistrict.sub_district_id,
                                        })}
                                      >
                                        <Checkbox
                                          indeterminate={indeterminate}
                                          onChange={onCheckAllChange}
                                          checked={checkAll}
                                        >
                                          Check all
                                        </Checkbox>
                                        <Divider />
                                        <CheckboxGroup
                                          style={{ width: '100%' }}
                                          onChange={onChange}
                                          value={checkedList}
                                        >
                                          <Row className="sub-district-list-row">
                                            {map(localityData, (localArea) => {
                                              return (
                                                <Col span={8}>
                                                  <Checkbox
                                                    value={
                                                      localArea.locality_id
                                                    }
                                                  >
                                                    {localArea.locality_name}
                                                    {` ( ${localArea.pincode} )`}
                                                  </Checkbox>
                                                </Col>
                                              );
                                            })}
                                          </Row>
                                        </CheckboxGroup>
                                        <div
                                          className="text-right"
                                          style={{ marginBottom: '16px' }}
                                        >
                                          <Button
                                            size="large"
                                            type="primary"
                                            style={{ marginRight: '8px' }}
                                            onClick={() =>
                                              handleSave(subDistrict)
                                            }
                                          >
                                            Save
                                          </Button>
                                          <Button
                                            size="large"
                                            danger
                                            onClick={handeleSaveCancel}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </Panel>
                                    </Collapse>
                                  );
                                })}
                              </Panel>
                            </Collapse>
                          );
                        })}
                      </div>
                    </Panel>
                  </Collapse>
                );
              })}
          </div>
          <Modal
            title="Add State"
            visible={stateModalVisible}
            footer={false}
            onCancel={handleCancel}
          >
            <Form
              form={form}
              layout="vertical"
              scrollToFirstError
              onFinish={handleStateOk}
            >
              <Form.Item
                label="State"
                name="state"
                rules={getFormItemRules({ required: true })}
              >
                <Select
                  allowClear
                  showSearch
                  virtual={false}
                  style={{ width: '100%' }}
                  onChange={handleState}
                  placeholder="Please select the state"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {filteredStateData &&
                    sortBy(filteredStateData, (stateValue) => {
                      return stateValue.state_name;
                    }).map((state) => {
                      return (
                        <Option value={state.id}>{state.state_name}</Option>
                      );
                    })}
                </Select>
              </Form.Item>
              <Row justify="end">
                <Form.Item>
                  <Space>
                    <Button
                      type="default"
                      style={{ color: 'red' }}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button htmlType="submit" type="primary">
                      Ok
                    </Button>
                  </Space>
                </Form.Item>
              </Row>
            </Form>
          </Modal>
          <Modal
            title="Add District"
            visible={districtModalVisible}
            footer={false}
            onCancel={handleDistrictCancel}
          >
            <Form
              form={form1}
              layout="vertical"
              scrollToFirstError
              onFinish={handleDistrictOk}
            >
              <Form.Item
                label="District"
                name="district"
                rules={getFormItemRules({ required: true })}
              >
                <Select
                  allowClear
                  showSearch
                  virtual={false}
                  style={{ width: '100%' }}
                  onChange={handleDistrict}
                  placeholder="Please select the district"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {filteredDistrictData &&
                    sortBy(filteredDistrictData, (districtValue) => {
                      return districtValue.district_name;
                    }).map((district) => (
                      <Option value={district.district_id}>
                        {district.district_name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <Row justify="end">
                <Form.Item>
                  <Space>
                    <Button
                      type="default"
                      style={{ color: 'red' }}
                      onClick={handleDistrictCancel}
                    >
                      Cancel
                    </Button>
                    <Button htmlType="submit" type="primary">
                      Ok
                    </Button>
                  </Space>
                </Form.Item>
              </Row>
            </Form>
          </Modal>
          <Modal
            title="Add Sub District"
            visible={subDistrictModalVisible}
            footer={false}
            onCancel={handleSubDistrictCancel}
          >
            <Form
              form={form2}
              layout="vertical"
              scrollToFirstError
              onFinish={handleSubDistrictOk}
            >
              <Form.Item
                label="Sub District"
                name="subdistrict"
                rules={getFormItemRules({ required: true })}
              >
                <Select
                  allowClear
                  showSearch
                  virtual={false}
                  style={{ width: '100%' }}
                  onChange={handleSubDistrict}
                  placeholder="Please select the Sub-district"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {filteredSubDistrictData &&
                    sortBy(filteredSubDistrictData, (stateValue) => {
                      return stateValue.sub_district_name;
                    }).map((state) => (
                      <Option value={state.sub_district_id}>
                        {state.sub_district_name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <Row justify="end">
                <Form.Item>
                  <Space>
                    <Button
                      type="default"
                      style={{ color: 'red' }}
                      onClick={handleSubDistrictCancel}
                    >
                      Cancel
                    </Button>
                    <Button htmlType="submit" type="primary">
                      Ok
                    </Button>
                  </Space>
                </Form.Item>
              </Row>
            </Form>
          </Modal>
        </div>
      </div>
    </Spin>
  );
}

export default Location;
