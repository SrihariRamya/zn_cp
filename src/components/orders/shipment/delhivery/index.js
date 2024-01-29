/* eslint-disable unicorn/no-null */
import {
  Button,
  Col,
  Form,
  Modal,
  notification,
  Row,
  Space,
  Spin,
  Steps,
} from 'antd';
import { get, isEmpty, trim } from 'lodash';
import moment from 'moment';
import React, { useState, useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';
import { FAILED_TO_LOAD } from '../../../../shared/constant-values';
import {
  createDelhiveryOrder,
  getPincodeServiceability,
} from '../../../../utils/api/url-helper';
import { TenantContext } from '../../../context/tenant-context';
import CustomerDetails from './delhivery-customer-details';
import DelhiveryOrderDetails from './delhivery-order-details';
import DelhiveryPickupDetails from './delhivery-pickup-details';
import DelhiverySellerDetails from './delhivery-seller-details';

function Delhivery(properties) {
  const { onClose, order, refresh, shipmentMethod } = properties;
  const [form] = Form.useForm();
  const [tenantDetails] = useContext(TenantContext);
  const [currentTab, setCurrentTab] = useState(0);
  const [button, setButton] = useState(true);
  const [customerDetails, setCustomerDetails] = useState({});
  const [orderDetails, setOrderDetails] = useState({});
  const [sellerDetails, setSellerDetails] = useState({});
  const [pickupDetails, setPickupDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  useEffect(() => {
    setCustomerDetails({
      phone: get(order, 'zm_user.phone_number', ''),
      name: get(order, 'zm_user.user_name', ''),
      email: get(order, 'zm_user.email_address', ''),
      add: isEmpty(get(order, 'zm_b2c_address.complete_address', ''))
        ? get(order, 'zm_b2c_address.address', '')
        : get(order, 'zm_b2c_address.complete_address', ''),
      pin: get(order, 'zm_b2c_address.pincode', ''),
      city: get(
        order,
        'zm_b2c_address.locality.locality_by_district_id.district_name',
        ''
      ),
      state: get(
        order,
        'zm_b2c_address.locality.locality_by_state_id.state_name',
        ''
      ),
      country: 'India',
    });
    setOrderDetails({
      order_id: get(order, 'order_id', ''),
      order_date: moment(get(order, 'creation_date', ''), 'YYYY-MM-DD'),
      total_items: get(order, 'order_details', []).length,
      commodity_value: get(order, 'order_price', 0),
      delivery_charge: get(order, 'delivery_charge', 0),
      tax_value: get(order, 'gst', 0),
      discount_amount: get(order, 'discount_amount', 0),
      total_amount: get(order, 'total_price', 0),
    });
    setSellerDetails({
      seller_name: get(tenantDetails, 'setting.business_name', ''),
      seller_add: get(tenantDetails, 'setting.address_1', ''),
      seller_inv_date: moment(),
      seller_inv: get(order, 'order_id', ''),
    });
  }, [order, tenantDetails]);

  const checkServiceability = () => {
    setPincodeLoading(true);
    const parameters = {
      pincode: get(customerDetails, 'pin', ''),
    };
    getPincodeServiceability(parameters)
      .then((resp) => {
        setPincodeLoading(false);
        if (isEmpty(get(resp, 'data.delivery_codes', []))) {
          notification.error({
            message: 'Invalid API token',
          });
        } else {
          setCurrentTab(1);
        }
      })
      .catch((error) => {
        setPincodeLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };

  const handlePickupDetails = (address) => {
    setPickupDetails(address);
  };

  const hanldlePrevious = () => {
    if (currentTab === 0) {
      onClose();
    } else {
      setCurrentTab(currentTab - 1);
      if (currentTab === 5) {
        setButton(true);
      }
    }
  };

  const onFinish = () => {
    switch (currentTab) {
      case 0: {
        checkServiceability();

        break;
      }
      case 1: {
        setCurrentTab(2);

        break;
      }
      case 2: {
        setCurrentTab(3);

        break;
      }
      default: {
        if (isEmpty(pickupDetails)) {
          notification.error({ message: 'Please select pickup address' });
        } else {
          setIsModalVisible(true);
        }
      }
    }
  };

  const createDelhivery = () => {
    setLoading(true);
    const parameter = {
      shipment_method_id: get(shipmentMethod, 'shipment_method_id', ''),
      order_id: get(order, 'order_id', ''),
      shipment_mapping_uid: uuid(),
      order_uid: get(order, 'order_uid', ''),
      user_uid: get(order, 'zm_user.user_uid', ''),
      add: get(customerDetails, 'add', ''),
      name: get(customerDetails, 'name', ''),
      phone: get(customerDetails, 'phone', ''),
      alternate_phone: get(customerDetails, 'alternate_phone', ''),
      email: get(customerDetails, 'email', ''),
      payment_mode: get(orderDetails, 'payment_mode', ''),
      pin: get(customerDetails, 'pin', ''),
      city: get(customerDetails, 'city', ''),
      state: get(customerDetails, 'state', ''),
      country: get(customerDetails, 'country', ''),
      order: get(orderDetails, 'order_id', ''),
      order_date: get(order, 'creation_date', ''),
      total_amount:
        Number(get(orderDetails, 'commodity_value', 0)) +
        Number(get(orderDetails, 'tax_value', 0)),
      cod_amount:
        get(orderDetails, 'payment_mode', '') === 'COD'
          ? Number(get(orderDetails, 'commodity_value', 0)) +
            Number(get(orderDetails, 'tax_value', 0))
          : 0,
      ewaybill: get(orderDetails, 'ewaybill', ''),
      weight: Number(get(orderDetails, 'weight', 0)),
      shipment_length: Number(get(orderDetails, 'shipment_length', 0)),
      shipment_width: Number(get(orderDetails, 'shipment_width', 0)),
      shipment_height: Number(get(orderDetails, 'shipment_height', 0)),
      tax_value: Number(get(orderDetails, 'tax_value', 0)),
      commodity_value: Number(get(orderDetails, 'commodity_value', 0)),
      products_desc: trim(get(orderDetails, 'product_description', '')),
      category_of_goods: trim(get(orderDetails, 'category_of_goods', '')),
      hsn_code: get(orderDetails, 'hsn_code', ''),
      seller_name: trim(get(sellerDetails, 'seller_name', '')),
      seller_add: trim(get(sellerDetails, 'seller_add', '')),
      seller_gst_tin: trim(get(sellerDetails, 'seller_gst_tin', '')),
      seller_inv: trim(get(sellerDetails, 'seller_inv', '')),
      seller_inv_date: get(sellerDetails, 'seller_inv_date', ''),
      pickup_location: {
        add: get(pickupDetails, 'address', ''),
        name: get(pickupDetails, 'name', ''),
        city: get(pickupDetails, 'city', ''),
        state: get(pickupDetails, 'state', ''),
        pin: get(pickupDetails, 'pin', ''),
        country: get(pickupDetails, 'country', ''),
        phone: get(pickupDetails, 'phone', ''),
      },
    };
    createDelhiveryOrder(parameter)
      .then(() => {
        setLoading(false);
        refresh();
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };

  const buttonText = () => {
    if (currentTab === 3) {
      return 'Create Order';
    }
    return 'Next';
  };

  const handleTabChange = (current) => {
    setCurrentTab(current);
  };

  const contentRender = (current) => {
    switch (current) {
      case 0: {
        return (
          <CustomerDetails
            customerDetails={customerDetails}
            form={form}
            setCustomerDetails={setCustomerDetails}
          />
        );
      }
      case 1: {
        return (
          <DelhiveryOrderDetails
            orderDetails={orderDetails}
            form={form}
            setOrderDetails={setOrderDetails}
          />
        );
      }
      case 2: {
        return (
          <DelhiverySellerDetails
            sellerDetails={sellerDetails}
            form={form}
            setSellerDetails={setSellerDetails}
          />
        );
      }
      case 3: {
        return (
          <DelhiveryPickupDetails
            pickupDetails={pickupDetails}
            handlePickupDetails={handlePickupDetails}
          />
        );
      }
      default: {
        return null;
      }
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Spin spinning={pincodeLoading}>
      <div className="delhivery-container">
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Row>
            <div className="steps-container">
              <Steps
                current={currentTab}
                onChange={handleTabChange}
                direction="horizontal"
              >
                <Steps.Step
                  disabled
                  className={currentTab === 1 ? 'active-delhivery' : ''}
                  title="Customer Details"
                />
                <Steps.Step
                  disabled
                  className={currentTab === 2 ? 'active-delhivery' : ''}
                  title="Order Details"
                />
                <Steps.Step
                  disabled
                  className={currentTab === 3 ? 'active-delhivery' : ''}
                  title="Seller Details"
                />
                <Steps.Step
                  disabled
                  className={currentTab === 4 ? 'active-delhivery' : ''}
                  title="Pickup Point"
                />
              </Steps>
            </div>
            <Col xs={24} sm={24} md={16} lg={18} xl={18}>
              {!isEmpty(customerDetails) && contentRender(currentTab)}
            </Col>
          </Row>
          {button && (
            <div className="flex-end mt-10 ptb-20 pd-06">
              <Space className="f_btns">
                <Button onClick={hanldlePrevious}>
                  {currentTab === 0 ? 'Cancel' : 'Previous'}
                </Button>
                <Button type="primary" htmlType="submit">
                  {buttonText()}
                </Button>
              </Space>
            </div>
          )}
        </Form>
        <div className="shipment-modal-container">
          <Modal visible={isModalVisible} footer={null} onCancel={handleCancel}>
            <h3 className="courier-modal-title">
              Are you sure you want to create an order ?
            </h3>
            <span className="courier-modal-button">
              <Button
                type="default"
                style={{ color: 'red' }}
                onClick={handleCancel}
              >
                No
              </Button>
              <Button
                loading={loading}
                onClick={createDelhivery}
                type="primary"
                style={{ marginLeft: '10px' }}
              >
                Yes
              </Button>
            </span>
          </Modal>
        </div>
      </div>
    </Spin>
  );
}
export default Delhivery;
