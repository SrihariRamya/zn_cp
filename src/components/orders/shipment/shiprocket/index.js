import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  notification,
  Row,
  Space,
  Steps,
  Upload,
} from 'antd';
import { get, isEmpty } from 'lodash';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';
import { v4 as uuid } from 'uuid';
import BuyerDetails from './buyer-details';
import OrderDetails from './order-details/index';
import PackageDetails from './package-details';
import PickupDetails from './pickup-details';
import { createShiprocketOrder } from '../../../../utils/api/url-helper';
import {
  FAILED_TO_LOAD,
  TOTAL_MAX_AMOUNT,
} from '../../../../shared/constant-values';

function Shiprocket(properties) {
  const { refreshList, formOrders, onClose, order, shipmentMethod } =
    properties;
  const [form] = Form.useForm();
  const [documentForm] = Form.useForm();
  const [currentTab, setCurrentTab] = useState(0);
  const [buyerDetails, setBuyerDetails] = useState({});
  const [pickupDetails, setPickupDetails] = useState({});
  const [orderDetails, setOrderDetails] = useState({});
  const [packageDetails, setPackageDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [invoiceFileList, setInvoiceFileList] = useState([]);
  const [billNumber, setBillNumber] = useState('');
  const [button, setButton] = useState(true);
  const navigate = useNavigate();

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

  const contentRender = (current) => {
    switch (current) {
      case 0: {
        return (
          <BuyerDetails
            buyerDetails={buyerDetails}
            form={form}
            setBuyerDetails={setBuyerDetails}
          />
        );
      }
      case 1: {
        return (
          <PickupDetails
            pickupDetails={pickupDetails}
            handlePickupDetails={handlePickupDetails}
          />
        );
      }
      case 2: {
        return (
          <OrderDetails
            orderDetails={orderDetails}
            setOrderDetails={setOrderDetails}
            requiredField={get(order, 'total_price', 0) >= TOTAL_MAX_AMOUNT}
          />
        );
      }
      case 3: {
        return (
          <PackageDetails
            form={form}
            packageDetails={packageDetails}
            setPackageDetails={setPackageDetails}
          />
        );
      }
      default: {
        return '';
      }
    }
  };

  useEffect(() => {
    setBuyerDetails({
      billing_phone: get(order, 'zm_user.phone_number', ''),
      billing_customer_name: get(order, 'zm_user.user_name', ''),
      billing_email: get(order, 'zm_user.email_address', ''),
      billing_address: isEmpty(
        get(order, 'zm_b2c_address.complete_address', '')
      )
        ? get(order, 'zm_b2c_address.address', '')
        : get(order, 'zm_b2c_address.complete_address', ''),
      billing_address_2: get(order, 'zm_b2c_address.landmark', ''),
      billing_pincode: get(order, 'zm_b2c_address.pincode', ''),
      billing_city: get(
        order,
        'zm_b2c_address.locality.locality_by_district_id.district_name',
        ''
      ),
      billing_state: get(
        order,
        'zm_b2c_address.locality.locality_by_state_id.state_name',
        ''
      ),
      billing_country: 'India',
    });
    setOrderDetails({
      payment_method:
        get(order, 'zt_order_payment.zm_payment_method.slug', '') === 'cod'
          ? 'Cod'
          : 'Prepaid',
      order_id: get(order, 'order_id', ''),
      order_date: moment(get(order, 'creation_date', ''), 'YYYY-MM-DD'),
      order_items: get(order, 'order_details', []).map((item) => ({
        name: get(item, 'zm_products[0].product_name', ''),
        sku: get(item, 'product_uid', ''),
        units: get(item, 'product_count', ''),
        selling_price: get(item, 'selling_price', ''),
      })),
      sub_total: get(order, 'order_price', 0),
      delivery_charge: get(order, 'delivery_charge', 0),
      discount_amount: get(order, 'discount_amount', 0),
      total_price: get(order, 'total_price', 0),
    });
  }, [order]);

  const handleTabChange = (current) => {
    setCurrentTab(current);
  };

  const onFinish = () => {
    switch (currentTab) {
      case 0: {
        setCurrentTab(1);

        break;
      }
      case 1: {
        if (isEmpty(pickupDetails)) {
          notification.error({ message: 'Please Select pickup address' });
        } else {
          setCurrentTab(2);
        }

        break;
      }
      case 2: {
        setCurrentTab(3);

        break;
      }
      case 3: {
        if (Number(get(order, 'total_price', 0)) >= TOTAL_MAX_AMOUNT) {
          setDocumentModalVisible(true);
        } else {
          setIsModalVisible(true);
        }

        break;
      }
      default:
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setDocumentModalVisible(false);
  };

  const createShiprocket = () => {
    setLoading(true);
    const parameter = {
      order_id: get(order, 'order_id', ''),
      shipment_mapping_uid: uuid(),
      order_uid: get(order, 'order_uid', ''),
      user_uid: get(order, 'zm_user.user_uid', ''),
      order_date: get(order, 'creation_date', ''),
      channel_id: get(orderDetails, 'channel_id', ''),
      billing_customer_name: get(buyerDetails, 'billing_customer_name', ''),
      billing_address: get(buyerDetails, 'billing_address', ''),
      billing_address_2: get(buyerDetails, 'billing_address_2', ''),
      billing_city: get(buyerDetails, 'billing_city', ''),
      billing_pincode: Number(get(buyerDetails, 'billing_pincode', '')),
      billing_state: get(buyerDetails, 'billing_state', ''),
      billing_country: get(buyerDetails, 'billing_country', ''),
      billing_email: get(buyerDetails, 'billing_email', ''),
      billing_phone: get(buyerDetails, 'billing_phone', ''),
      shipping_is_billing: JSON.stringify(true),
      latitude: get(order, 'zm_b2c_address.latitude', 0),
      longitude: get(order, 'zm_b2c_address.longitude', 0),
      order_items: JSON.stringify(get(orderDetails, 'order_items', [])),
      payment_method: get(orderDetails, 'payment_method', ''),
      total_discount: get(order, 'discount_amount', 0),
      sub_total: get(order, 'order_price', 0),
      length: Number(get(packageDetails, 'length', 0)),
      breadth: Number(get(packageDetails, 'width', 0)),
      height: Number(get(packageDetails, 'height', 0)),
      weight: Number(get(packageDetails, 'applicableWeight', 0)),
      pickup_location: get(pickupDetails, 'pickup_location', ''),
      pickup_address: get(pickupDetails, 'address', ''),
      ewaybill_no: billNumber,
      shipment_method_id: get(shipmentMethod, 'shipment_method_id', ''),
    };
    const files = {
      files: fileList.map((item) => item.originFileObj),
      invoiceFiles: invoiceFileList.map((item) => item.originFileObj),
    };
    createShiprocketOrder(parameter, files)
      .then((response) => {
        setLoading(false);
        if (get(response, 'data.success', '')) {
          setIsModalVisible(false);
          setDocumentModalVisible(false);
          onClose();
          if (formOrders) {
            navigate('/shiprocket/orders');
          } else {
            refreshList();
          }
        } else {
          notification.error({
            message: get(response, 'data.message', false) || FAILED_TO_LOAD,
          });
        }
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const dummyRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok');
    }, 0);
  };
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handleUpload = (file) => {
    const uploadFormat = get(file, 'name', '').split('.')[1];
    const acceptedFormats = ['pdf'];
    if (!acceptedFormats.includes(uploadFormat)) {
      notification.error({ message: 'Upload the proper file format' });
    }
  };
  const handleFileList = ({ fileList: fileListName }) => {
    setFileList(fileListName);
  };
  const handleInvoiceFileList = ({ fileList: fileListName }) => {
    setInvoiceFileList(fileListName);
  };
  const inputOnchange = (event) => {
    const { value } = event.target;
    setBillNumber(value);
  };

  const buttonText = () => {
    if (currentTab === 3) {
      if (Number(get(orderDetails, 'total_price', 0)) >= TOTAL_MAX_AMOUNT) {
        return 'Next';
      }
      return 'Create Order';
    }
    return 'Next';
  };
  const onFinishDocument = () => {
    createShiprocket();
  };
  return (
    <div className="shiprocket-container">
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Row>
          <Col>
            <div className="steps-container">
              <Steps
                current={currentTab}
                onChange={handleTabChange}
                direction="horizontal"
              >
                <Steps.Step
                  disabled
                  className={currentTab === 1 ? 'active-delhivery' : ''}
                  title="Buyer Details"
                />
                <Steps.Step
                  disabled
                  className={currentTab === 2 ? 'active-delhivery' : ''}
                  title="Pickup Address"
                />
                <Steps.Step
                  disabled
                  className={currentTab === 3 ? 'active-delhivery' : ''}
                  title="Order Details"
                />
                <Steps.Step
                  disabled
                  className={currentTab === 4 ? 'active-delhivery' : ''}
                  title="Package Details"
                />
              </Steps>
            </div>
          </Col>
          <Col xs={24} sm={24} md={16} lg={19} xl={19}>
            {!isEmpty(buyerDetails) && contentRender(currentTab)}
          </Col>
        </Row>
        {button && (
          <div className="flex-end mt-10 ptb-20">
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
        <Modal visible={isModalVisible} footer={false} onCancel={handleCancel}>
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
              onClick={createShiprocket}
              type="primary"
              style={{ marginLeft: '10px' }}
            >
              Yes
            </Button>
          </span>
        </Modal>
      </div>
      <div className="shipment-modal-container">
        <Modal
          width={720}
          visible={documentModalVisible}
          title="Upload E-way Bill Document"
          destroyOnClose
          onCancel={handleCancel}
          footer={false}
        >
          <div className="pickup-ebill-way-container">
            <div className="pickup-ebill-way-title">E-Way Bill</div>
            <div className="pickup-ebill-way-info-text">
              Mandatory for Shipment Above Rs 50,000 as per Govt. Norms
            </div>
            <div className="pickup-ebill-way-filed-container">
              <Form form={documentForm} onFinish={() => onFinishDocument()}>
                <Row>
                  <Col span={12}>
                    <Form.Item
                      label="Enter E-way Bill Number"
                      name="billNumber"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter a E-way bill number',
                        },
                        {
                          pattern: /^[\d[]{12}$/,
                          message:
                            'E-way bill number must be exactly 12 digits!',
                        },
                      ]}
                    >
                      <Input
                        type="number"
                        onChange={(event) => inputOnchange(event)}
                        placeholder="E-way Bill Number"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Upload E-way Bill"
                      name="billUrl"
                      rules={[
                        {
                          required: true,
                          message: 'Please upload a E-way bill URL',
                        },
                      ]}
                    >
                      <Upload
                        customRequest={dummyRequest}
                        beforeUpload={handleUpload}
                        onChange={handleFileList}
                        fileList={fileList}
                        maxCount={1}
                        accept="application/pdf"
                      >
                        <Button icon={<UploadOutlined />}>
                          Click to Upload
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Upload Invoice"
                      name="billInvoice"
                      rules={[
                        {
                          required: true,
                          message: 'Please upload a E-way bill invoice',
                        },
                      ]}
                    >
                      <Upload
                        customRequest={dummyRequest}
                        beforeUpload={handleUpload}
                        onChange={handleInvoiceFileList}
                        fileList={invoiceFileList}
                        maxCount={1}
                        accept="application/pdf"
                      >
                        <Button icon={<UploadOutlined />}>
                          Click to Upload
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
                <div className="flex-end">
                  <Button
                    type="default"
                    style={{ color: 'red' }}
                    onClick={handleCancel}
                  >
                    Close
                  </Button>
                  <Button
                    type="primary"
                    loading={loading}
                    htmlType="submit"
                    style={{ marginLeft: '8px' }}
                    disabled={
                      isEmpty(billNumber) ||
                      isEmpty(fileList) ||
                      isEmpty(invoiceFileList)
                    }
                  >
                    Create Order
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
export default Shiprocket;
