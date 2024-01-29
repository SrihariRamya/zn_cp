import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Tooltip,
  notification,
} from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { debounce, get, last, map } from 'lodash';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ReactComponent as DeleteIcon } from '../../../../assets/icons/delete.svg';
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info-icon.svg';
import {
  createDeliveryChargeByWeight,
  deleteDeliveryChargeByWeight,
  getAllDeliveryChargeByWeight,
  updateDeliveryChargeWeight,
} from '../../../../utils/api/url-helper';
import {
  DELIVERYCHARGE_ADD_FAILED,
  DELIVERYCHARGE_ADD_SUCCESS,
  DELIVERYCHARGE_DELETE_FAILED,
  DELIVERYCHARGE_DELETE_SUCCESS,
  DELIVERYCHARGE_UPDATE_FAILED,
  DELIVERYCHARGE_UPDATE_SUCCESS,
  FAILED_TO_LOAD,
} from '../../../../shared/constant-values';
import { currencyParser } from '../../../../shared/function-helper';
import { TenantContext } from '../../../context/tenant-context';
import { ReactComponent as EditIcon } from '../../../../assets/images/edit-icon.svg';

function AddChargeByWeight(properties) {
  const { mobileView } = properties;
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [weightData, setWeightData] = useState([]);
  const [criteriaId, setCriteriaId] = useState(0);
  const [enableButtonById, setEnableButtonById] = useState(0);
  const [enableSave, setEnableSave] = useState(false);
  const [tenantDetails] = useContext(TenantContext);
  const [mobileEdit, setMobileEdit] = useState('');
  const scrollDivWeight = useRef();

  const scrollSmoothHandler = () => {
    scrollDivWeight.current.scrollTo(0, scrollDivWeight.current.scrollHeight);
  };

  const debouncedScrollHandler = debounce(() => {
    scrollSmoothHandler();
  }, 1000);

  // eslint-disable-next-line no-unused-vars
  const { currency_locale: currencyLocale } = get(tenantDetails, 'setting', {});

  const fetchDate = () => {
    getAllDeliveryChargeByWeight()
      .then((data) => {
        const lastData = last(get(data, 'data.rows', ''));
        const maxPrice = lastData
          ? get(lastData, 'weight_charge_mapped.maximum_weight', '') + 0.01
          : 0.01;

        form1.setFieldsValue({
          min: maxPrice,
        });
        const updateData = get(data.data, 'rows', {});
        map(updateData, (item) => {
          form.setFieldsValue({
            [`details_${get(item, 'criteria_id', '')}`]: get(
              item,
              'weight_charge_mapped.details',
              ''
            ),
            [`min_${get(item, 'criteria_id', '')}`]: get(
              item,
              'weight_charge_mapped.minimum_weight',
              ''
            ),
            [`max_${get(item, 'criteria_id', '')}`]: get(
              item,
              'weight_charge_mapped.maximum_weight',
              ''
            ),
            [`charge_${get(item, 'criteria_id', '')}`]: get(
              item,
              'delivery_charge',
              ''
            ),
          });
        });
        setWeightData(get(data, 'data.rows', ''));
        scrollSmoothHandler();
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const handleSave = (values) => {
    const parameter = {
      criteria_name: 'By Weight',
      details: get(values, 'details', ''),
      minimum_weight: get(values, 'min', ''),
      maximum_weight: get(values, 'max', ''),
      delivery_charge: get(values, 'charge', ''),
    };

    createDeliveryChargeByWeight(parameter)
      .then(() => {
        fetchDate();
        form1.resetFields();
        notification.success({ message: DELIVERYCHARGE_ADD_SUCCESS });
        debouncedScrollHandler();
      })
      .catch(() => {
        notification.success({ message: DELIVERYCHARGE_ADD_FAILED });
      });
  };

  const handleClickUpdate = (id) => {
    setCriteriaId(id);
    setTimeout(() => {
      if (mobileView) setMobileEdit('');
    }, '2000');
  };

  const handleFinishUpdate = (values) => {
    if (criteriaId) {
      const parameter = {
        criteria_id: criteriaId,
        delivery_charge: values[`charge_${criteriaId}`],
        weight_charge_mapped: {
          minimum_weight: values[`min_${criteriaId}`],
          maximum_weight: values[`max_${criteriaId}`],
          details: values[`details_${criteriaId}`],
        },
      };
      updateDeliveryChargeWeight(parameter)
        .then(() => {
          fetchDate();
          setEnableButtonById(0);
          setCriteriaId(0);
          setEnableSave(false);
          notification.success({ message: DELIVERYCHARGE_UPDATE_SUCCESS });
        })
        .catch(() => {
          notification.error({ message: DELIVERYCHARGE_UPDATE_FAILED });
        });
    }
  };

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

  const findClosestWeights = (target) => {
    let smallerClosestWeight;
    let biggerClosestWeight;
    map(weightData, (list, index) => {
      if (index === target - 1) {
        smallerClosestWeight =
          get(list, 'weight_charge_mapped.maximum_weight', '') + 0.01;
      }
      if (index === target + 1) {
        biggerClosestWeight = list;
      } else if (target === weightData.length - 1) {
        biggerClosestWeight = last(weightData);
      }
    });
    return [smallerClosestWeight, biggerClosestWeight];
  };

  const handleDeleteWeight = async (id, index) => {
    const [smallerClosestWeight, biggerClosestWeight] =
      findClosestWeights(index);
    const parameters = {
      criteria_id: get(biggerClosestWeight, 'criteria_id', ''),
      delivery_charge: get(biggerClosestWeight, 'delivery_charge', ''),
      weight_charge_mapped: {
        minimum_weight: smallerClosestWeight,
        maximum_weight: get(
          biggerClosestWeight,
          'weight_charge_mapped.maximum_weight',
          ''
        ),
      },
    };
    await updateDeliveryChargeWeight(parameters);
    deleteDeliveryChargeByWeight(id)
      .then(() => {
        fetchDate();
        notification.success({ message: DELIVERYCHARGE_DELETE_SUCCESS });
      })
      .catch(() => {
        notification.error({ message: DELIVERYCHARGE_DELETE_FAILED });
      });
  };

  useEffect(() => {
    fetchDate();
  }, []);

  const handleChangeFormUpdate = (id) => {
    if (id) {
      setEnableButtonById(id);
    }
  };

  const handleValueChange = (changedvalues) => {
    if (changedvalues) {
      setEnableSave(true);
    }
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const getProperties = (dataType) => {
    const inputProperties = {};
    if (dataType === 'float') {
      inputProperties.precision = 2;
      inputProperties.step = 0.1;
    }
    return inputProperties;
  };

  const handleEditWeightForm = (list, index) => {
    return (
      <Form
        layout="vertical"
        form={form}
        key={list}
        name={list}
        onFinish={handleFinishUpdate}
        className="delivery-form-label"
      >
        {mobileView && (
          <div style={{ display: 'flex' }}>
            <ArrowLeftOutlined
              onClick={() => setMobileEdit('')}
              className="flexbox-center"
            />
            <p className="flexbox-center" style={{ marginLeft: '2px' }}>
              Back
            </p>
          </div>
        )}
        <Row className="weight-form-list">
          <Col xs={11} sm={11} md={4} lg={4} xl={4}>
            <Form.Item
              name={`details_${list}`}
              label={
                <div>
                  Details
                  <Tooltip
                    title="For your reference only"
                    className="tooltip-class"
                  >
                    <InfoIcon className="info-icon-styles" />
                  </Tooltip>
                </div>
              }
            >
              <Input
                placeholder="Example 10kg"
                onChange={() => handleChangeFormUpdate(list)}
              />
            </Form.Item>
          </Col>
          <Col xs={11} sm={11} md={4} lg={4} xl={4}>
            <Form.Item
              label="Minimum weight"
              name={`min_${list}`}
              rules={[
                {
                  required: true,
                  message: 'Please enter the minimum weight!',
                },
                { validator: validatePositiveNumber },
              ]}
            >
              <InputNumber
                type="number"
                {...getProperties('float')}
                onKeyPress={(value) => currencyParser(value, currencyLocale)}
                onChange={() => handleChangeFormUpdate(list)}
                disabled={index !== weightData.length - 1}
              />
            </Form.Item>
          </Col>
          <Col xs={11} sm={11} md={4} lg={4} xl={4}>
            <Form.Item
              label="Maximum weight"
              name={`max_${list}`}
              rules={[
                {
                  required: true,
                  message: 'Please enter the maximum weight!',
                },
                () => ({
                  validator() {},
                }),
                { validator: validatePositiveNumber },
              ]}
            >
              <InputNumber
                type="number"
                onChange={() => handleChangeFormUpdate(list)}
                disabled={index !== weightData.length - 1}
              />
            </Form.Item>
          </Col>
          <Col xs={11} sm={11} md={4} lg={4} xl={4}>
            <Form.Item
              label="Delivery Charge"
              name={`charge_${list}`}
              rules={[
                {
                  required: true,
                  message: 'Please enter the delivery charge!',
                },
                { validator: validatePositiveNumber },
              ]}
            >
              <InputNumber
                type="number"
                onChange={() => handleChangeFormUpdate(list)}
              />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            sm={24}
            md={4}
            lg={4}
            xl={4}
            className={mobileView && 'flexbox-end'}
          >
            <div className="weight-delete-icon">
              <Button
                htmlType="submit"
                type="primary"
                onClick={() => handleClickUpdate(list)}
                disabled={enableButtonById !== list}
                className={enableButtonById !== list && 'button-color'}
              >
                Update
              </Button>
              {weightData.length > 1
                ? index !== 0 && (
                    <DeleteIcon
                      onClick={() => handleDeleteWeight(list, index)}
                    />
                  )
                : index === 0 && (
                    <DeleteIcon
                      onClick={() => handleDeleteWeight(list, index)}
                    />
                  )}
            </div>
          </Col>
        </Row>
      </Form>
    );
  };

  const handleNewWeightForm = () => {
    return (
      <Form
        layout="vertical"
        form={form1}
        onFinish={handleSave}
        onValuesChange={handleValueChange}
        initialValues={{
          min: 0.01,
        }}
        className="delivery-form-label"
      >
        <Row className="weight-form-list">
          <Col xs={11} sm={11} md={4} lg={4} xl={4}>
            <Form.Item
              label={
                <div>
                  Details
                  <Tooltip
                    title="For your reference only"
                    className="tooltip-class"
                  >
                    <InfoIcon className="info-icon-styles" />
                  </Tooltip>
                </div>
              }
              name="details"
            >
              <Input placeholder="Example 10kg" />
            </Form.Item>
          </Col>
          <Col xs={11} sm={11} md={4} lg={4} xl={4}>
            <Form.Item label="Minimum weight" name="min">
              <InputNumber
                type="number"
                disabled
                {...getProperties('float')}
                onKeyPress={(value) => currencyParser(value, currencyLocale)}
              />
            </Form.Item>
          </Col>
          <Col xs={11} sm={11} md={4} lg={4} xl={4}>
            <Form.Item
              label="Maximum weight"
              name="max"
              rules={[
                {
                  required: true,
                  message: 'Please enter the maximum weight!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue(`min`) < value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('Should be greater than minimum weight')
                    );
                  },
                }),
                { validator: validatePositiveNumber },
              ]}
            >
              <InputNumber
                type="number"
                {...getProperties('float')}
                onKeyPress={(value) => currencyParser(value, currencyLocale)}
              />
            </Form.Item>
          </Col>
          <Col xs={11} sm={11} md={4} lg={4} xl={4}>
            <Form.Item
              label="Delivery Charge"
              name="charge"
              rules={[
                {
                  required: true,
                  message: 'Please enter the delivery charge!',
                },
                { validator: validatePositiveNumber },
              ]}
            >
              <InputNumber type="number" />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            sm={24}
            md={4}
            lg={4}
            xl={4}
            className={mobileView && 'flexbox-end'}
          >
            <Button
              htmlType="submit"
              type="primary"
              disabled={!enableSave}
              className={!enableSave && 'button-color'}
            >
              Save
            </Button>
          </Col>
        </Row>
      </Form>
    );
  };

  const handleMobileEdit = (id) => {
    setMobileEdit(id);
  };

  const handleFormEditMobile = (data, index) => {
    if (mobileEdit === data) {
      return handleEditWeightForm(data, index);
    }
    return '';
  };

  const handleMobileEditCartForm = (data, index) => {
    if (mobileEdit !== '') {
      return handleFormEditMobile(data.criteria_id, index);
    }
    return (
      <div className="edit-delivery-charges-card" key={data.criteria_id}>
        <Row>
          <Col span={20} className="flexbox-start">
            <p className="edit-title">
              {data.weight_charge_mapped.minimum_weight}-
              {data.weight_charge_mapped.maximum_weight}kg Charges : ₹
              {data.delivery_charge}
            </p>
          </Col>
          <Col span={2}>
            <EditIcon
              cursor="pointer"
              onClick={() => handleMobileEdit(data.criteria_id)}
            />
          </Col>
          <Col span={2} className="flexbox-center">
            <div className="weight-delete-icon">
              {weightData.length > 1
                ? index !== 0 && (
                    <DeleteIcon
                      onClick={() =>
                        handleDeleteWeight(data.criteria_id, index)
                      }
                    />
                  )
                : index === 0 && (
                    <DeleteIcon
                      onClick={() =>
                        handleDeleteWeight(data.criteria_id, index)
                      }
                    />
                  )}
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Card className="delivery-charge-card">
      <div
        ref={scrollDivWeight}
        className={mobileView ? '' : 'content-cart-detail'}
      >
        {weightData.length > 0 &&
          map(weightData, (data, index) =>
            mobileView
              ? handleMobileEditCartForm(data, index)
              : handleEditWeightForm(data.criteria_id, index)
          )}
        {!mobileEdit && handleNewWeightForm()}
      </div>
    </Card>
  );
}

export default AddChargeByWeight;
