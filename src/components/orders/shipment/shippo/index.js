import React, { useState, useEffect, useContext } from 'react';
import { get, filter, isEmpty, map } from 'lodash';
import {
  Button,
  Col,
  Form,
  Modal,
  notification,
  Row,
  Space,
  Steps,
} from 'antd';
import { v4 as uuid } from 'uuid';
import { getData } from 'country-list';
import { TenantContext } from '../../../context/tenant-context';
import ShippoCustomerDetails from './shippo-customer-details';
import ShippoOrderDetails from './shippo-order-details';
import { LOCATION_NOT_IN_US } from '../../../../shared/constant-values';
import {
  createShipment,
  buyShippingLabel,
  getAllShipmentMethods,
  createShippoOrder,
} from '../../../../utils/api/url-helper';
import ShippoPickupDetails from './shippo-pickup-details';
import CreateInitialAddress from './create-initial-add';
import ShippoLabelDetails from './shippo-label';

function Shippo(properties) {
  const { onClose, order, refresh } = properties;
  const [form] = Form.useForm();
  const [tenantDetails] = useContext(TenantContext);
  const [button, setButton] = useState(true);
  const [labelResponse, setLabelResponse] = useState();
  const [shipmentLabelUrl, setShipmentLabelUrl] = useState('');
  const [customerDetails, setCustomerDetails] = useState({});
  const [orderDetails, setOrderDetails] = useState({});
  const [currentTab, setCurrentTab] = useState(0);
  const [pickupDetails, setPickupDetails] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [labelLoading, setLabelLoading] = useState(false);
  const [labelButtonLoading, setLabelButtonLoading] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [shipmentMethod, setShipmentMethod] = useState({});
  const [courierDetails, setCourierDetails] = useState({});

  const fetchShippingMethod = () => {
    const parameters = {
      from: 'ORDER',
    };
    getAllShipmentMethods(parameters)
      .then((resp) => {
        const data = get(resp, 'data', []);
        const findShippo = data.find((method) => method.slug === 'shippo');
        setShipmentMethod(findShippo);
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', false),
        });
      });
  };

  useEffect(() => {
    const countryList = filter(
      getData(),
      (country) => country.name === get(order, 'zm_b2c_address.country', '')
    );
    setCountryData(countryList);
    setCustomerDetails({
      phone: get(order, 'zm_user.phone_number', ''),
      name: get(order, 'zm_user.user_name', ''),
      email: get(order, 'zm_user.email_address', ''),
      street1: isEmpty(get(order, 'zm_b2c_address.complete_address', ''))
        ? get(order, 'zm_b2c_address.address', '')
        : get(order, 'zm_b2c_address.complete_address', ''),
      zip: get(order, 'zm_b2c_address.pincode', ''),
      city:
        get(order, 'zm_b2c_address.country', '') === 'India'
          ? get(
              order,
              'zm_b2c_address.locality.locality_by_district_id.district_name',
              ''
            )
          : get(order, 'zm_b2c_address.city', ''),
      state:
        get(order, 'zm_b2c_address.country', '') === 'India'
          ? get(
              order,
              'zm_b2c_address.locality.locality_by_state_id.state_name',
              ''
            )
          : get(order, 'zm_b2c_address.state', ''),
      country: get(order, 'zm_b2c_address.country', ''),
    });
    setOrderDetails({
      order_id: get(order, 'order_id', ''),
    });
    fetchShippingMethod();
  }, [order, tenantDetails]);

  const handlePickupDetails = (address) => {
    setPickupDetails(address);
  };

  const onCreateLabel = () => {
    const parameters = {
      order_uid: get(order, 'order_uid', ''),
      order_id: get(order, 'order_id', ''),
      shipment_mapping_uid: uuid(),
      shipment_method_id: get(shipmentMethod, 'shipment_method_id', ''),
      user_uid: get(order, 'zm_user.user_uid', ''),
      label_url: get(shipmentLabelUrl, 'label_url', ''),
      tracking_url_provider: get(shipmentLabelUrl, 'tracking_url_provider', ''),
      tracking_number: get(shipmentLabelUrl, 'tracking_number', ''),
      object_id: get(shipmentLabelUrl, 'object_id', ''),
      parcel_id: get(shipmentLabelUrl, 'parcel', ''),
      object_owner: get(shipmentLabelUrl, 'object_owner', ''),
      object_created: get(shipmentLabelUrl, 'object_created', ''),
      courier_name: get(courierDetails, 'courier_name', ''),
      rates_object_id: get(shipmentLabelUrl, 'rate', ''),
      tenant_uid: get(tenantDetails, 'tenant_uid', ''),
    };
    createShippoOrder(parameters)
      .then(() => {
        window.open(get(shipmentLabelUrl, 'label_url'), '_blank');
        refresh();
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', false),
        });
      });
  };

  const buttonText = () => {
    if (currentTab === 3) {
      return 'Create label';
    }
    return 'Next';
  };

  const handleTabChange = (current) => {
    setCurrentTab(current);
  };

  const handleLabelDetails = (value, option) => {
    setLabelButtonLoading(true);
    setCourierDetails({
      courier_name: get(option, 'label', ''),
    });
    buyShippingLabel(value, shipmentMethod)
      .then((label) => {
        setShipmentLabelUrl(get(label, 'transaction', ''));
        setLabelButtonLoading(false);
        if (get(label, 'transaction.status') === 'ERROR') {
          setLabelButtonLoading(false);
          notification.error({
            message: get(label, 'transaction.messages[0].text'),
          });
        }
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'error.messages[0].text', false),
        });
        setLabelButtonLoading(false);
      });
  };

  const contentRender = (current) => {
    switch (current) {
      case 0: {
        return (
          <ShippoCustomerDetails
            order={order}
            customerDetails={customerDetails}
            form={form}
            setCustomerDetails={setCustomerDetails}
          />
        );
      }
      case 1: {
        return (
          <ShippoOrderDetails
            orderDetails={orderDetails}
            form={form}
            setOrderDetails={setOrderDetails}
          />
        );
      }
      case 2: {
        return (
          <ShippoPickupDetails
            pickupDetails={pickupDetails}
            handlePickupDetails={handlePickupDetails}
          />
        );
      }
      case 3: {
        return (
          <ShippoLabelDetails
            labelResponse={labelResponse}
            orderDetails={orderDetails}
            customerDetails={customerDetails}
            pickupDetails={pickupDetails}
            labelLoading={labelLoading}
            handleLabelDetails={handleLabelDetails}
          />
        );
      }
      default: {
        return '';
      }
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handlePrevious = () => {
    setShipmentLabelUrl('');
    if (currentTab === 0) {
      onClose();
    } else {
      setCurrentTab(currentTab - 1);
      if (currentTab === 5) {
        setButton(true);
      }
    }
  };

  // eslint-disable-next-line consistent-return
  const onFinish = () => {
    if (get(countryData, '[0].code') !== 'US')
      return notification.error({
        message: LOCATION_NOT_IN_US,
      });
    if (currentTab === 3) setIsModalVisible(true);

    switch (currentTab) {
      case 0: {
        setCurrentTab(1);
        break;
      }
      case 1: {
        setCurrentTab(2);
        break;
      }
      default: {
        if (isEmpty(pickupDetails)) {
          notification.error({ message: 'Please select pickup address' });
        } else {
          setCurrentTab(3);
        }
      }
    }
  };

  useEffect(() => {
    if (currentTab === 3) {
      setLabelLoading(true);
      customerDetails.country = 'US';
      const parameters = {
        customerDetails,
        pickupDetails,
        orderDetails,
        shipmentMethod,
      };
      createShipment(parameters)
        .then((resp) => {
          if (resp.success && !isEmpty(get(resp, 'shipment.rates', []))) {
            setLabelResponse(get(resp, 'shipment.rates', []));
            setLabelLoading(false);
          } else {
            const errorMessages = map(
              filter(
                get(resp, 'shipment.messages', []),
                (message) => !isEmpty(message.code)
              ),
              (message, index) => `${index + 1}. ${message.text}`
            );
            if (errorMessages.length > 0) {
              notification.error({
                message: errorMessages.join('\n'),
              });
              setLabelLoading(false);
            }
            setLabelLoading(false);
          }
        })
        .catch(() => {
          setLabelLoading(false);
          notification.error({
            message:
              'Address or parcel details you sent was not accepted as valid',
          });
        });
    }
  }, [currentTab]);

  return (
    <div className="delhivery-container">
      {!get(shipmentMethod, 'is_active', false) && (
        <CreateInitialAddress
          onClose={onClose}
          shipmentMethod={shipmentMethod}
          fetchShippingMethod={fetchShippingMethod}
        />
      )}

      {get(shipmentMethod, 'is_active', false) && (
        <>
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
                    title="Package Details"
                  />
                  <Steps.Step
                    disabled
                    className={currentTab === 3 ? 'active-delhivery' : ''}
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
                  <Button onClick={handlePrevious}>
                    {currentTab === 0 ? 'Cancel' : 'Previous'}
                  </Button>
                  <Button
                    disabled={
                      currentTab === 3 &&
                      (isEmpty(shipmentLabelUrl) ||
                        get(shipmentLabelUrl, 'status') === 'ERROR')
                    }
                    loading={currentTab === 3 ? labelButtonLoading : false}
                    type="primary"
                    htmlType="submit"
                  >
                    {buttonText()}
                  </Button>
                </Space>
              </div>
            )}
          </Form>
          <div className="shipment-modal-container">
            <Modal
              visible={isModalVisible}
              footer={false}
              onCancel={handleCancel}
            >
              <h3 className="courier-modal-title">
                Are you sure you want to create an label ?
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
                  onClick={onCreateLabel}
                  type="primary"
                  style={{ marginLeft: '10px' }}
                >
                  Yes
                </Button>
              </span>
            </Modal>
          </div>
        </>
      )}
    </div>
  );
}

export default Shippo;
