import {
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  notification,
  Row,
  Tooltip,
} from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { debounce, get, last, map } from 'lodash';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  createDeliveryChargeCart,
  getAllDeliveryByCart,
  deleteDeliveryByCart,
  updateDeliveryChargeCart,
} from '../../../../utils/api/url-helper';
import {
  DELIVERYCHARGE_ADD_FAILED,
  DELIVERYCHARGE_ADD_SUCCESS,
  FAILED_TO_LOAD,
  DELIVERYCHARGE_DELETE_FAILED,
  DELIVERYCHARGE_DELETE_SUCCESS,
  DELIVERYCHARGE_UPDATE_FAILED,
  DELIVERYCHARGE_UPDATE_SUCCESS,
} from '../../../../shared/constant-values';
import { ReactComponent as DeleteIcon } from '../../../../assets/images/delete-icon.svg';
import { ReactComponent as EditIcon } from '../../../../assets/images/edit-icon.svg';

const validatePositiveNumber = (rule, value, callback) => {
  if (value < 0) {
    callback('Value should not be a negative number');
  } else if (value === 0) {
    callback('Value should not be zero');
  } else {
    callback();
  }
};

function AddChargeByCartPrice(properties) {
  const { mobileView } = properties;
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const scrollDiv = useRef();
  const [cartData, setCartData] = useState([]);
  const [editDataId, setEditDataId] = useState(0);
  const [enableSave, setEnableSave] = useState(false);
  const [enableButtonById, setEnableButtonById] = useState(0);
  const [mobileEdit, setMobileEdit] = useState('');

  const scrollSmoothHandler = () => {
    scrollDiv.current.scrollTo(0, scrollDiv.current.scrollHeight);
  };

  const debouncedScrollHandler = debounce(() => {
    scrollSmoothHandler();
  }, 1000);

  const getCharge = () => {
    getAllDeliveryByCart()
      .then((data) => {
        const lastData = last(data.data.rows);
        const maxPrice = lastData
          ? lastData.cart_charge_mapped.maximum_charge + 1
          : 1;
        form2.setFieldsValue({
          min: maxPrice,
        });
        const updateData = get(data.data, 'rows', {});
        map(updateData, (item) => {
          form1.setFieldsValue({
            [`min_${item.criteria_id}`]: item?.cart_charge_mapped
              .minimum_charge,
            [`max_${item.criteria_id}`]: item?.cart_charge_mapped
              .maximum_charge,
            [`charge_${item.criteria_id}`]: item?.delivery_charge,
          });
        });

        setCartData(data.data.rows);
        scrollSmoothHandler();
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };
  const handleEdit = (id) => {
    setEditDataId(id);
    setTimeout(() => {
      if (mobileView) setMobileEdit('');
    }, '2000');
  };
  const save = (values) => {
    if (editDataId) {
      const parameters = {
        criteria_id: editDataId,
        delivery_charge: values[`charge_${editDataId}`],
        cart_charge_mapped: {
          minimum_charge: values[`min_${editDataId}`],
          maximum_charge: values[`max_${editDataId}`],
        },
      };
      updateDeliveryChargeCart(parameters)
        .then(() => {
          getCharge();
          setEditDataId(0);
          setEnableSave(false);
          setEnableButtonById(0);
          notification.success({ message: DELIVERYCHARGE_UPDATE_SUCCESS });
        })
        .catch(() => {
          notification.error({ message: DELIVERYCHARGE_UPDATE_FAILED });
        });
    }
  };

  const findClosestNumbers = (target) => {
    let smallerClosestData;
    let biggerClosestData;
    map(cartData, (item, index) => {
      if (index === target - 1) {
        smallerClosestData = item.cart_charge_mapped.maximum_charge + 1;
      }
      if (index === target + 1) {
        biggerClosestData = item;
      } else if (target === cartData.length - 1) {
        biggerClosestData = last(cartData);
      }
    });

    return [smallerClosestData, biggerClosestData];
  };

  const hanleDelete = async (id, index) => {
    const [smallerClosestData, biggerClosestData] = findClosestNumbers(index);
    const parameters = {
      criteria_id: biggerClosestData.criteria_id,
      delivery_charge: biggerClosestData.delivery_charge,
      cart_charge_mapped: {
        minimum_charge: smallerClosestData,
        maximum_charge: biggerClosestData.cart_charge_mapped.maximum_charge,
      },
    };

    await updateDeliveryChargeCart(parameters);
    deleteDeliveryByCart(id)
      .then(() => {
        notification.success({ message: DELIVERYCHARGE_DELETE_SUCCESS });
        getCharge();
      })
      .catch(() => {
        notification.error({ message: DELIVERYCHARGE_DELETE_FAILED });
      });
  };
  const handleOnValuesChange = (changedvalues) => {
    if (changedvalues) {
      setEnableSave(true);
    }
  };
  const handleOnValuesChangeByForm = (id) => {
    if (id) {
      setEnableButtonById(id);
    }
  };
  const handleSave = async (values) => {
    const parameter = {
      criteria_name: 'By Cart Price',
      minimum_charge: values.min,
      maximum_charge: values.max,
      delivery_charge: values.charge,
    };

    createDeliveryChargeCart(parameter)
      .then(() => {
        form2.resetFields();
        getCharge();
        setEnableSave(false);
        notification.success({ message: DELIVERYCHARGE_ADD_SUCCESS });
        debouncedScrollHandler();
      })
      .catch(() => {
        notification.error({ message: DELIVERYCHARGE_ADD_FAILED });
      });
  };

  useEffect(() => {
    getCharge();
  }, []);

  const handleEditCartForm = (data, index) => {
    return (
      <Form
        key={data}
        name={data}
        className="user-form user-add-form delivery-form-label"
        layout="vertical"
        form={form1}
        onFinish={save}
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
        <Row className="form-list">
          <Col xs={11} sm={11} md={6} lg={6} xl={6}>
            <Form.Item label="Minimum price" name={`min_${data}`}>
              <InputNumber style={{ width: '100%' }} type="number" disabled />
            </Form.Item>
          </Col>
          <Col xs={11} sm={11} md={6} lg={6} xl={6}>
            <Form.Item
              label="Maximum price"
              name={`max_${data}`}
              rules={[
                {
                  required: true,
                  message: 'Please enter the maximum price!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue(`min_${data}`) < value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('Should be greater than minimum price')
                    );
                  },
                }),
                { validator: validatePositiveNumber },
              ]}
            >
              <InputNumber
                disabled={index !== cartData.length - 1}
                onChange={() => handleOnValuesChangeByForm(data)}
                style={{ width: '100%' }}
                type="number"
              />
            </Form.Item>
          </Col>
          <Col xs={11} sm={11} md={6} lg={6} xl={6}>
            <Form.Item
              label="Delivery Charge"
              name={`charge_${data}`}
              rules={[
                {
                  required: true,
                  message: 'Please enter the Charges!',
                },
                { validator: validatePositiveNumber },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                type="number"
                onChange={() => handleOnValuesChangeByForm(data)}
              />
            </Form.Item>
          </Col>
          <Col xs={11} sm={11} md={3} lg={3} xl={3} className="flexbox-start">
            <div className="d-flex">
              <div>
                <Tooltip title="Update">
                  <Button
                    htmlType="submit"
                    type="primary"
                    className={enableButtonById !== data && 'button-color'}
                    disabled={enableButtonById !== data}
                    onClick={() => handleEdit(data)}
                  >
                    Update
                  </Button>
                </Tooltip>
              </div>
              <div className="weight-delete-icon">
                {cartData.length > 1
                  ? index !== 0 && (
                      <Tooltip title="Delete">
                        <DeleteIcon onClick={() => hanleDelete(data, index)} />
                      </Tooltip>
                    )
                  : index === 0 && (
                      <Tooltip title="Delete">
                        <DeleteIcon onClick={() => hanleDelete(data, index)} />
                      </Tooltip>
                    )}
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    );
  };
  const handleFormEditMobile = (data, index) => {
    if (mobileEdit === data) {
      return handleEditCartForm(data, index);
    }
    return '';
  };
  const handleCartNewForm = () => {
    return (
      <Form
        form={form2}
        className="user-form user-add-form delivery-form-label"
        layout="vertical"
        onFinish={handleSave}
        onValuesChange={handleOnValuesChange}
        initialValues={{
          charge: 0,
        }}
      >
        <Row className="form-list">
          <Col xs={11} sm={11} md={6} lg={6} xl={6}>
            <Form.Item label="Minimum price" name="min">
              <InputNumber style={{ width: '100%' }} type="number" disabled />
            </Form.Item>
          </Col>
          <Col xs={11} sm={11} md={6} lg={6} xl={6}>
            <Form.Item
              label="Maximum price"
              name="max"
              rules={[
                {
                  required: true,
                  message: 'Please enter the maximum price!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('min') < value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('Should be greater than minimum price')
                    );
                  },
                }),
                { validator: validatePositiveNumber },
              ]}
            >
              <InputNumber style={{ width: '100%' }} type="number" />
            </Form.Item>
          </Col>
          <Col xs={11} sm={11} md={6} lg={6} xl={6}>
            <Form.Item
              label="Delivery Charge"
              name="charge"
              rules={[
                {
                  required: true,
                  message: 'Please enter the Charges!',
                },
                { validator: validatePositiveNumber },
              ]}
            >
              <InputNumber style={{ width: '100%' }} type="number" />
            </Form.Item>
          </Col>
          <Col
            xs={11}
            sm={11}
            md={3}
            lg={3}
            xl={3}
            className={mobileView ? 'flexbox-end' : 'flexbox-start'}
          >
            <Tooltip title="Save">
              <Button
                htmlType="submit"
                className={!enableSave && 'button-color'}
                type="primary"
                disabled={!enableSave}
              >
                Save
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </Form>
    );
  };
  const handleMobileEdit = (id) => {
    setMobileEdit(id);
  };
  const handleMobileEditCartForm = (data, index) => {
    if (mobileEdit !== '') {
      return handleFormEditMobile(data.criteria_id, index);
    }
    return (
      <div className="edit-delivery-charges-card" key={data.criteria_id}>
        <Row>
          <Col span={19} className="flexbox-start">
            <p className="edit-title">
              Charges: ₹ {data.cart_charge_mapped.maximum_charge} on ₹
              {data.delivery_charge}
            </p>
          </Col>
          <Col span={2}>
            <EditIcon
              cursor="pointer"
              onClick={() => handleMobileEdit(data.criteria_id)}
            />
          </Col>
          <Col span={2}>
            <div className="weight-delete-icon">
              {cartData.length > 1
                ? index !== 0 && (
                    <Tooltip title="Delete">
                      <DeleteIcon
                        onClick={() => hanleDelete(data.criteria_id, index)}
                      />
                    </Tooltip>
                  )
                : index === 0 && (
                    <Tooltip title="Delete">
                      <DeleteIcon
                        onClick={() => hanleDelete(data.criteria_id, index)}
                      />
                    </Tooltip>
                  )}
            </div>
          </Col>
        </Row>
      </div>
    );
  };
  return (
    <Card
      style={{
        width: '100%',
        backgroundColor: '#ffffff',
      }}
      className="delivery-charge-card"
    >
      <div ref={scrollDiv} className={mobileView ? '' : 'content-cart-detail'}>
        {cartData.length > 0 &&
          map(cartData, (data, index) =>
            mobileView
              ? handleMobileEditCartForm(data, index)
              : handleEditCartForm(data.criteria_id, index)
          )}
        {!mobileEdit && handleCartNewForm()}
      </div>
    </Card>
  );
}

export default AddChargeByCartPrice;
