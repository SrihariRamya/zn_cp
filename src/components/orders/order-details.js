import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Button,
  Breadcrumb,
  Spin,
  Collapse,
  notification,
  Tag,
  Space,
} from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import _, { isEmpty, get } from 'lodash';
import moment from 'moment';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import OrderTick from '../../assets/smallImage/ordertick.svg';
import {
  getDownloadPackingLabel,
  getOrderDetail,
  getCurrentUser,
} from '../../utils/api/url-helper';
import {
  FAILED_TO_LOAD,
  PAYMENT_METHOD_SLUG_COD,
} from '../../shared/constant-values';
import './order-details.less';
import { TenantContext } from '../context/tenant-context';
import { eventTrack } from '../../shared/function-helper';
import MobileOrderDetails from './order-mobile-view/mobile-order-details';

const { Panel } = Collapse;

function OrderDetails() {
  const navigate = useNavigate();
  const mobileView = useContext(TenantContext)[4];
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [shipmentDetails, setShipmentDetails] = useState({});
  const [orderUID, setOrderUID] = useState(window.location.href?.split('/')[4]);
  const [customerData, setCustomerData] = useState({});
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [tenantDetails] = useContext(TenantContext);
  const { currency, currency_locale: currencyLocale } = get(
    tenantDetails,
    'setting',
    {}
  );

  const fetchData = useCallback(() => {
    const apiArray = [getOrderDetail({ order_uid: orderUID })];
    setLoading(true);
    Promise.all(apiArray)
      .then((result) => {
        setLoading(false);
        setOrderData(_.get(result, '[0].data.orderDetailMultiple', []));
        const orderDatas = _.get(result, '[0].data.orderDetailMultiple', []);
        const customerID = _.get(orderDatas, '[0][0].user_uid', '');
        setShipmentDetails(_.get(result, '[0].data.shipmentDetails', {}));
        setPaymentMethod(_.get(result, '[0].data.zt_order_payment', []));
        setCustomerData(_.get(result, '[1].data', {}));
        setOrderUID(window.location.href?.split('/')[4]);

        const customerApiArray = [
          getCurrentUser({ user_uid: customerID, salesData: true }),
        ];
        return Promise.all(customerApiArray);
      })
      .then((customerResult) => {
        const customerDatas = _.get(customerResult, '[0].data', {});
        setCustomerData(customerDatas);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
    const parameter = { value: orderUID };
    eventTrack('orderId_click', parameter);
  }, [orderUID]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const downloadPackingLabel = () => {
    setDownloadLoading(true);
    getDownloadPackingLabel(_.get(shipmentDetails, 'waybill'))
      .then((response) => {
        const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
        const documentLink = document.createElement('a');
        documentLink.href = urlBlob;
        documentLink.setAttribute('download', 'packing-label.pdf');
        document.body.append(documentLink);
        documentLink.click();
        setDownloadLoading(false);
      })
      .catch(() => {
        setDownloadLoading(false);
        notification.error({ message: FAILED_TO_LOAD });
      });
  };
  return (
    <Spin spinning={loading}>
      {mobileView ? (
        <MobileOrderDetails
          orderDatas={orderData}
          tenantDetails={tenantDetails}
          currency={currency}
          currencyLocale={currencyLocale}
          shipmentDetail={shipmentDetails}
          downloadLoading={downloadLoading}
          downloadPackingLabel={downloadPackingLabel}
        />
      ) : (
        <>
          <div className="search-container" style={{ margin: 'auto 10px' }}>
            <div>
              <Breadcrumb separator=">">
                <Breadcrumb.Item className="table-tax">
                  <Link to="/"> Home </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item className="table-tax">
                  <Link to="/orders"> Orders</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item className="customer-breadcrum">
                  Order Details
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
          <div className="box">
            <div className="box__header">
              <Space>
                <ArrowLeftOutlined onClick={() => navigate(-1)} />
                <div>
                  <img src={OrderTick} alt="Go back" />
                </div>
                <h3 className="text-primary">Order Details</h3>
              </Space>
            </div>
            {!loading && (
              <div className="box__content box-content-background  zp_form__grid pt-0 br-b-1">
                <div
                  className="customers-container"
                  style={{ paddingLeft: '15px' }}
                >
                  <div className="zp_form__grid my-2">
                    <h4>Order ID</h4>
                    <span>{_.get(orderData, '[0][0].order_id', '')}</span>
                  </div>
                  <div className="zp_form__grid my-2">
                    <h4>Order Date</h4>
                    <span>
                      {moment(
                        _.get(orderData, '[0][0].creation_date', '')
                      ).isValid()
                        ? moment(
                            _.get(orderData, '[0][0].creation_date', '')
                          ).format(
                            _.get(
                              tenantDetails,
                              'setting.date_format',
                              'DD-MM-YYYY hh:mm'
                            )
                          )
                        : ''}
                    </span>
                  </div>
                  {!_.isEmpty(_.get(orderData, '[0][0].delivery_date')) && (
                    <>
                      <div className="zp_form__grid my-2">
                        <h4>Delivery Date</h4>
                        <span>
                          {moment(
                            _.get(orderData, '[0][0].delivery_date', '')
                          ).isValid() &&
                            moment(
                              _.get(orderData, '[0][0].delivery_date', '')
                            ).format('MMMM Do, YYYY')}
                        </span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Delivery Time Slot</h4>
                        <span>
                          {_.get(orderData, '[0][0].delivery_time', '')}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="zp_form__grid my-2">
                    <h4>Status</h4>
                    <div>
                      <Tag color="#38523B" className="milestone_desc">
                        <small>
                          {_.get(orderData, '[0][0].milestone_description', '')}
                        </small>
                      </Tag>
                    </div>
                  </div>
                  <div className="zp_form__grid my-2">
                    <h4>Order Type</h4>
                    <span>{_.get(orderData, '[0][0].customer_type', '')}</span>
                  </div>
                  <div className="collapse-block">
                    <Collapse>
                      <Panel
                        header="Customer Details"
                        key="1"
                        className="panel-block"
                        style={{ marginBottom: '10px' }}
                      >
                        <div className="panel-content">
                          <div className="zp_form__grid my-2">
                            <h4>Customer Name</h4>
                            <span>
                              {_.get(orderData, '[0][0].user_name', '')}
                            </span>
                          </div>
                          <div className="zp_form__grid my-2">
                            <h4>Customer Number</h4>
                            <span>
                              {_.get(orderData, '[0][0].country_code', '')}
                              &nbsp;
                              {_.get(orderData, '[0][0].phone_number', '')}
                            </span>
                          </div>
                          {_.get(orderData, '[0][0].upi_user', '') && (
                            <>
                              <div className="zp_form__grid my-2">
                                <h4>Upi Customer Name</h4>
                                <span>
                                  {_.get(orderData, '[0][0].upi_user', '')}
                                  &nbsp;
                                </span>
                              </div>
                              <div className="zp_form__grid my-2">
                                <h4>Upi Customer Number</h4>
                                <span>
                                  {_.get(orderData, '[0][0].upi_contact', '')}
                                  &nbsp;
                                </span>
                              </div>
                            </>
                          )}
                          <div className="zp_form__grid my-2">
                            <h4>Delivery Address</h4>
                            <span>
                              {!isEmpty(
                                _.get(orderData, '[0][0].complete_address', '')
                              ) && (
                                <>
                                  {_.get(
                                    orderData,
                                    '[0][0].complete_address',
                                    ''
                                  )}
                                  ,
                                </>
                              )}
                              <br />
                              {!isEmpty(
                                _.get(orderData, '[0][0].city', '')
                              ) && <>{_.get(orderData, '[0][0].city', '')}, </>}
                              {!isEmpty(
                                _.get(orderData, '[0][0].country', '')
                              ) && (
                                <>
                                  {_.get(orderData, '[0][0].state', '')},{' '}
                                  {_.get(orderData, '[0][0].country', '')},
                                </>
                              )}{' '}
                              {_.get(orderData, '[0][0].pincode', '')}
                            </span>
                          </div>

                          <div className="zp_form__grid my-2">
                            <h4>Email</h4>

                            <span>
                              {_.get(customerData, 'email_address', '')}
                            </span>
                          </div>
                          <div className="zp_form__grid my-2">
                            <h4>Total Orders</h4>

                            <span>
                              {Number(
                                _.get(
                                  customerData,
                                  'zt_order_hdrs[0].total_orders',
                                  ''
                                )
                              ).toFixed(0)}
                            </span>
                          </div>
                          <div className="zp_form__grid my-2">
                            <h4>Total Sales</h4>

                            <span>
                              {Number(
                                _.get(
                                  customerData,
                                  'zt_order_hdrs[0].total_sales',
                                  ''
                                )
                              ).toFixed(0)}
                            </span>
                          </div>
                          <div className="zp_form__grid my-2">
                            <h4>Created Date</h4>

                            <span>
                              {moment(
                                _.get(customerData, 'creation_date', '')
                              ).format('DD-MM-YYYY, hh:mm A')}
                            </span>
                          </div>
                          <div className="my-2 a-link">
                            <span>
                              <Link
                                to={`/customers/${_.get(
                                  orderData,
                                  '[0][0].user_uid',
                                  ''
                                )}`}
                              >
                                View Order History
                              </Link>
                            </span>
                          </div>
                        </div>
                      </Panel>
                      {!isEmpty(_.get(shipmentDetails, 'awb_code')) && (
                        <Panel
                          header="Shipment Details"
                          key="2"
                          className="panel-block"
                        >
                          <>
                            <div className="zp_form__grid my-2">
                              <h4>Shipment method</h4>
                              <span>
                                {_.get(shipmentDetails, 'shipment_method', '')}
                              </span>
                            </div>
                            <div className="zp_form__grid my-2">
                              <h4>Courier name</h4>
                              <span>
                                {_.get(
                                  shipmentDetails,
                                  'shiprocket_courier_name',
                                  ''
                                )}
                              </span>
                            </div>
                            <div className="zp_form__grid my-2">
                              <h4>Tracking number</h4>
                              <span>
                                {_.get(shipmentDetails, 'awb_code', '')}
                              </span>
                            </div>
                            <div className="zp_form__grid my-2">
                              <h4>Pickup address</h4>
                              <span>
                                {isEmpty(
                                  _.get(
                                    shipmentDetails,
                                    'shiprocket_pickup_address',
                                    ''
                                  )
                                )
                                  ? _.get(shipmentDetails, 'store_location', '')
                                  : _.get(
                                      shipmentDetails,
                                      'shiprocket_pickup_address',
                                      ''
                                    )}
                              </span>
                            </div>
                            <div className="zp_form__grid my-2">
                              <h4>Delivery address</h4>
                              <span>
                                {isEmpty(
                                  _.get(shipmentDetails, 'complete_address', '')
                                )
                                  ? _.get(
                                      shipmentDetails,
                                      'customer_location',
                                      ''
                                    )
                                  : _.get(
                                      shipmentDetails,
                                      'complete_address',
                                      ''
                                    )}
                              </span>
                            </div>
                            <div className="zp_form__grid my-2">
                              <h4>Pickup scheduled date</h4>
                              <span>
                                {' '}
                                {moment(
                                  _.get(
                                    shipmentDetails,
                                    'shiprocket_pickup_scheduled_date',
                                    'N/A'
                                  )
                                ).isValid()
                                  ? moment(
                                      _.get(
                                        shipmentDetails,
                                        'shiprocket_pickup_scheduled_date',
                                        'N/A'
                                      )
                                    ).format(
                                      _.get(
                                        tenantDetails,
                                        'setting.date_format',
                                        'DD-MM-YYYY hh:mm'
                                      )
                                    )
                                  : ''}
                              </span>
                            </div>
                            <div className="zp_form__grid my-2">
                              <h4>Package weight</h4>
                              <span>
                                {_.get(
                                  shipmentDetails,
                                  'shiprocket_applied_weight'
                                )
                                  ? `${_.get(
                                      shipmentDetails,
                                      'shiprocket_applied_weight'
                                    )} kg`
                                  : ''}
                              </span>
                            </div>
                          </>
                        </Panel>
                      )}
                      {!isEmpty(_.get(shipmentDetails, 'waybill')) && (
                        <Panel
                          header="Shipment Details"
                          key="2"
                          className="panel-block"
                        >
                          <>
                            <div className="zp_form__grid my-2">
                              <h4>Shipment method</h4>
                              <span>
                                {_.get(shipmentDetails, 'shipment_method', '')}
                              </span>
                            </div>
                            <div className="zp_form__grid my-2">
                              <h4>Courier name</h4>
                              <span>Delhivery</span>
                            </div>
                            <div className="zp_form__grid my-2">
                              <h4>Tracking number</h4>
                              <span>
                                {_.get(shipmentDetails, 'waybill', '')}
                              </span>
                            </div>
                            <div className="zp_form__grid my-2">
                              <h4>Pickup address</h4>
                              <span>
                                {isEmpty(
                                  _.get(
                                    shipmentDetails,
                                    'delhivery_pickup_address',
                                    ''
                                  )
                                )
                                  ? _.get(shipmentDetails, 'store_location', '')
                                  : _.get(
                                      shipmentDetails,
                                      'delhivery_pickup_address',
                                      ''
                                    )}{' '}
                                -{' '}
                                {_.get(
                                  shipmentDetails,
                                  'delhivery_pickup_pincode',
                                  ''
                                )}
                              </span>
                            </div>
                            <div className="zp_form__grid my-2">
                              <h4>Delivery address</h4>
                              <span>
                                {isEmpty(
                                  _.get(
                                    shipmentDetails,
                                    'delhivery_delivery_address',
                                    ''
                                  )
                                )
                                  ? _.get(
                                      shipmentDetails,
                                      'complete_address',
                                      ''
                                    )
                                  : _.get(
                                      shipmentDetails,
                                      'delhivery_delivery_address',
                                      ''
                                    )}{' '}
                                -{' '}
                                {_.get(
                                  shipmentDetails,
                                  'delhivery_delivery_pincode',
                                  ''
                                )}
                              </span>
                            </div>
                            <div className="zp_form__grid my-2">
                              <h4>Packing Label</h4>
                              <Button
                                type="primary"
                                loading={downloadLoading}
                                onClick={downloadPackingLabel}
                              >
                                <DownloadOutlined />
                                Download
                              </Button>
                            </div>
                          </>
                        </Panel>
                      )}
                      {!isEmpty(
                        get(shipmentDetails, 'shippo_label_url', '')
                      ) && (
                        <Panel
                          header="Shipment Details"
                          key="2"
                          className="panel-block"
                        >
                          <>
                            <div className="zp_form__grid my-2">
                              <h4>Shipment method</h4>
                              <span>
                                {get(shipmentDetails, 'shipment_method', '')}
                              </span>
                            </div>
                            <div className="zp_form__grid my-2">
                              <h4>Courier name</h4>
                              <span>
                                {get(shipmentDetails, 'courier_name', '')}
                              </span>
                            </div>
                            <div className="zp_form__grid my-2">
                              <h4>Tracking number</h4>
                              <span>
                                {get(shipmentDetails, 'tracking_number', '')}
                              </span>
                            </div>
                            <div className="zp_form__grid my-2">
                              <h4>Packing Label</h4>
                              <Button
                                type="primary"
                                onClick={() =>
                                  window.open(
                                    get(
                                      shipmentDetails,
                                      'shippo_label_url',
                                      ''
                                    ),
                                    '_blank'
                                  )
                                }
                              >
                                <DownloadOutlined />
                                Download
                              </Button>
                            </div>
                          </>
                        </Panel>
                      )}
                    </Collapse>
                  </div>
                </div>
                <div className="box__content">
                  <div className="block-header-order">Orders</div>
                  <div className="my-2 order-box">
                    <Collapse defaultActiveKey={['1']}>
                      {_.map(orderData, (result) => (
                        <Panel
                          header={
                            <div className="flex-bwn">
                              <div>
                                <h4 style={{ fontSize: '14px' }}>
                                  {_.get(result, '[0].order_id', '')}
                                </h4>
                                <small>
                                  <i className="italic">
                                    {moment(
                                      _.get(result, '[0].creation_date', '')
                                    ).isValid()
                                      ? moment(
                                          _.get(result, '[0].creation_date', '')
                                        ).format(
                                          _.get(
                                            tenantDetails,
                                            'setting.date_format',
                                            'DD-MM-YYYY hh:mm'
                                          )
                                        )
                                      : ''}
                                  </i>
                                </small>
                              </div>
                              <div>
                                <h4 className="text-subheading">
                                  <CurrencyFormatter
                                    value={_.get(result, '[0].total_price', '')}
                                    type={currency}
                                    language={currencyLocale}
                                  />
                                </h4>
                                <Tag color="lime">
                                  <small>
                                    {_.get(
                                      result,
                                      '[0].customer_type',
                                      'Online'
                                    )}
                                  </small>
                                </Tag>
                              </div>
                            </div>
                          }
                          key={_.get(result, '[0].order_id', '')}
                        >
                          <div className="order-container">
                            {_.map(result, (product) => (
                              <div className="my-2 flex-bwn" key={product.id}>
                                <div>
                                  <h4>
                                    {_.get(product, 'product_name', '')} X{' '}
                                    {_.get(product, 'product_count', '')}
                                  </h4>
                                  <Tag color="cyan">
                                    <small>{_.get(product, 'units', '')}</small>
                                  </Tag>
                                </div>
                                <div>
                                  <h4 className="text-subheading">
                                    <CurrencyFormatter
                                      value={
                                        _.get(product, 'selling_price', 0) *
                                        _.get(product, 'product_count', 0)
                                      }
                                      type={currency}
                                      language={currencyLocale}
                                    />
                                  </h4>
                                </div>
                              </div>
                            ))}
                            <div className="bottom-border" />
                            <div className="br-b-1">
                              <div className="flex-bwn my-2">
                                <h4 className="text-subheading">Item Total</h4>
                                <h4 className="text-subheading">
                                  <CurrencyFormatter
                                    value={_.get(result, '[0].order_price', 0)}
                                    type={currency}
                                    language={currencyLocale}
                                  />
                                </h4>
                              </div>
                              <div className="flex-bwn my-2">
                                <h4 className="text-subheading">GST</h4>
                                <h4 className="text-subheading">
                                  <CurrencyFormatter
                                    value={_.get(
                                      result,
                                      '[0].order_gst_amount',
                                      0
                                    )}
                                    type={currency}
                                    language={currencyLocale}
                                  />
                                </h4>
                              </div>
                              {paymentMethod?.zm_payment_method?.slug ===
                                PAYMENT_METHOD_SLUG_COD &&
                                get(result, '[0].cod_charge', '') !== 0 &&
                                get(result, '[0].cod_charge', '') !== '' &&
                                get(result, '[0].cod_charge', '') !== null && (
                                  <div className="flex-bwn my-2">
                                    <h4 className="text-subheading">
                                      Cod Charges
                                    </h4>
                                    <h4 className="text-subheading">
                                      <CurrencyFormatter
                                        value={_.get(
                                          result,
                                          '[0].cod_charge',
                                          ''
                                        )}
                                        type={currency}
                                        language={currencyLocale}
                                      />
                                    </h4>
                                  </div>
                                )}
                              <div className="flex-bwn my-2">
                                <h4 className="text-subheading">
                                  Delivery Charges
                                </h4>
                                <h4 className="text-subheading">
                                  <CurrencyFormatter
                                    value={_.get(
                                      result,
                                      '[0].delivery_charge',
                                      ''
                                    )}
                                    type={currency}
                                    language={currencyLocale}
                                  />
                                </h4>
                              </div>
                            </div>
                            <div className="bottom-border-dark" />
                            <div className="br-b-1">
                              <div className="flex-bwn  my-2">
                                <h6 className="total-text">Total</h6>
                                <h4 className="text-green">
                                  <CurrencyFormatter
                                    value={_.get(result, '[0].total_price', '')}
                                    type={currency}
                                    language={currencyLocale}
                                  />
                                </h4>
                              </div>
                            </div>
                          </div>
                        </Panel>
                      ))}
                    </Collapse>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Spin>
  );
}

export default OrderDetails;
