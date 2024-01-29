import React, { useContext } from 'react';
import {
  Button,
  Collapse,
  Tag,
  Space,
  Row,
  Col,
  Divider,
  Typography,
  Tooltip as Tooltips,
} from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { isEmpty, get } from 'lodash';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { DownloadOutlined } from '@ant-design/icons';
import '../order-details.less';
import moment from 'moment';
import { ReactComponent as LeftArrow } from '../../../assets/icons/leftarrow.svg';
import Pending from '../../../assets/icons/pending.svg';
import Confirmed from '../../../assets/icons/confirmed.svg';
import Inpacking from '../../../assets/icons/inpacking.svg';
import Dispatched from '../../../assets/icons/dispatched.svg';
import Delivered from '../../../assets/icons/delivered.svg';
import Cancelled from '../../../assets/icons/cancelled.svg';
import Checkout from '../../../assets/icons/checkout.svg';
import CancelRequest from '../../../assets/icons/cancelrequest.svg';
import {
  colorFunction,
  handleValidDate,
} from '../../../shared/function-helper';
import { TenantContext } from '../../context/tenant-context';

const { Panel } = Collapse;

function MobileOrderDetails(parameters) {
  const navigate = useNavigate();
  const [tenantDetails] = useContext(TenantContext);

  const {
    orderDatas,
    currency,
    currencyLocale,
    shipmentDetail,
    downloadLoading,
    downloadPackingLabel,
  } = parameters;

  const handleDropDown = (tags) => {
    const tagMappings = {
      Pending,
      Confirmed,
      Delivered,
      Cancelled,
      Checkout,
      Dispatch: Dispatched,
      'In Packing': Inpacking,
      'Preparing for Dispatch': Dispatched,
    };

    const iconSource =
      tagMappings[tags] || (tags === 'Cancel Req' ? '' : CancelRequest);

    return (
      <Tag color={colorFunction(tags)} className="order-tag">
        <Tooltips placement="top" title={tags}>
          <Typography className="mobile-order-status">
            {iconSource && (
              <img
                src={iconSource}
                alt={`Icon for ${tags}`}
                className="tag-icon"
              />
            )}
            {tags}
          </Typography>
        </Tooltips>
      </Tag>
    );
  };

  return (
    <div>
      <div className="box">
        <div className="box__header">
          <Space>
            <div style={{ paddingRight: '10px' }}>
              <LeftArrow onClick={() => navigate(-1)} />
            </div>
            <h3 className="text-primary">Order Details</h3>
          </Space>
        </div>
        <div className="order-details-container inpacking-menu-modal">
          <div style={{ padding: '10px' }}>
            <Row gutter={16} style={{ marginBottom: '10px' }}>
              <Col span={11} style={{ fontSize: '14px', fontWeight: 600 }}>
                Order ID
              </Col>
              <Col span={11}>{get(orderDatas, '[0][0].order_id', '')}</Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '10px' }}>
              <Col span={11} style={{ fontSize: '14px', fontWeight: 600 }}>
                Order Date
              </Col>
              <Col span={11}>
                {handleValidDate(
                  get(orderDatas, '[0][0].creation_date', ''),
                  tenantDetails
                )}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '10px' }}>
              <Col span={11} style={{ fontSize: '14px', fontWeight: 600 }}>
                Product ID
              </Col>
              <Col span={11}>{get(orderDatas, '[0][0].product_uid', '')}</Col>
            </Row>
            {!isEmpty(get(orderDatas, '[0][0].delivery_date')) && (
              <>
                <Row gutter={16} style={{ marginBottom: '10px' }}>
                  <Col span={11} style={{ fontSize: '14px', fontWeight: 600 }}>
                    Delivery Date
                  </Col>
                  <Col span={11}>
                    {moment(
                      get(orderDatas, '[0][0].delivery_date', '')
                    ).isValid() &&
                      moment(
                        get(orderDatas, '[0][0].delivery_date', '')
                      ).format('MMMM Do, YYYY')}
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: '10px' }}>
                  <Col span={11} style={{ fontSize: '14px', fontWeight: 600 }}>
                    Delivery Time Slot
                  </Col>
                  <Col span={11}>
                    {get(orderDatas, '[0][0].delivery_time', '')}
                  </Col>
                </Row>
              </>
            )}
            <Row gutter={16} style={{ marginBottom: '10px' }}>
              <Col span={11} style={{ fontSize: '14px', fontWeight: 600 }}>
                Status
              </Col>
              <Col span={11} style={{ paddingLeft: '0' }}>
                {handleDropDown(
                  get(orderDatas, '[0][0].milestone_description', '')
                )}
              </Col>
            </Row>
          </div>
          <div>
            <div className="modal-order-header">Order Detail</div>
          </div>
          <div>
            <Collapse
              defaultActiveKey={['1']}
              expandIconPosition="end"
              className="modal-order-details-collapse"
            >
              {orderDatas.map((result) => (
                <Panel
                  header={
                    <div className="flex-bwn">
                      <div>
                        <h4>{get(result, '[0].order_id', '')}</h4>
                        <span className="store-address">
                          {handleValidDate(
                            get(result, '[0].creation_date', ''),
                            tenantDetails
                          )}
                        </span>
                      </div>
                      <div className="order-detail-price">
                        <h4>
                          <CurrencyFormatter
                            value={get(result, '[0].total_price', '')}
                            type={currency}
                            language={currencyLocale}
                          />
                        </h4>
                        <Tag color="lime">
                          <small>
                            {get(result, '[0].customer_type', 'Online')}
                          </small>
                        </Tag>
                      </div>
                    </div>
                  }
                  key={get(result, '[0].order_id', '')}
                >
                  <div className="order-container">
                    {result?.map((product) => (
                      <div
                        key={get(product, 'product_uid', '')}
                        className="order-detail-products"
                      >
                        <div>
                          <h4>
                            Product ID - {get(product, 'product_uid', '')}
                          </h4>
                          <span>
                            {get(product, 'product_name', '')} X
                            {get(product, 'product_count', '')}
                          </span>
                          <div>{get(product, 'units', '')}</div>
                        </div>
                        <div>
                          <h4 className="order-detail-price">
                            <CurrencyFormatter
                              value={
                                get(product, 'selling_price', 0) *
                                get(product, 'product_count', 0)
                              }
                              type={currency}
                              language={currencyLocale}
                            />
                          </h4>
                        </div>
                      </div>
                    ))}
                    <Divider style={{ border: '2px dashed #bbb' }} />
                    <div className="mb-2">
                      <div className="order-detail-products">
                        <span>Item Total</span>
                        <h4 className="order-detail-price">
                          <CurrencyFormatter
                            value={get(result, '[0].order_price', 0)}
                            type={currency}
                            language={currencyLocale}
                          />
                        </h4>
                      </div>
                      <div className="order-detail-products">
                        <span>GST</span>
                        <h4 className="order-detail-price">
                          <CurrencyFormatter
                            value={get(result, '[0].order_gst_amount', 0)}
                            type={currency}
                            language={currencyLocale}
                          />
                        </h4>
                      </div>
                      <div className="order-detail-products">
                        <span>Delivery Charges</span>
                        <h4 className="order-detail-price">
                          <CurrencyFormatter
                            value={get(result, '[0].delivery_charge', '')}
                            type={currency}
                            language={currencyLocale}
                          />
                        </h4>
                      </div>
                    </div>
                    <Divider style={{ border: '1px solid #222222' }} />
                    <div className="mb-2">
                      <div className="order-detail-products">
                        <h4>Total</h4>
                        <h3 className="order-detail-price">
                          <CurrencyFormatter
                            value={get(result, '[0].total_price', '')}
                            type={currency}
                            language={currencyLocale}
                          />
                        </h3>
                      </div>
                    </div>
                  </div>
                </Panel>
              ))}
            </Collapse>
          </div>
          <div className="collapse-cust-box">
            <Collapse expandIconPosition="end">
              <Panel
                header={
                  <div className="customer-details">Customer Details</div>
                }
                key="1"
                className="Panelclass"
              >
                <div className="paneldiv">
                  <div className="zp_form__grid my-2">
                    <h4>Customer Name</h4>
                    <span>{get(orderDatas, '[0][0].user_name', '')}</span>
                  </div>
                  <div className="zp_form__grid my-2">
                    <h4>Customer Number</h4>
                    <span>
                      {get(orderDatas, '[0][0].country_code', '')}
                      &nbsp;
                      {get(orderDatas, '[0][0].phone_number', '')}
                    </span>
                  </div>
                  {get(orderDatas, '[0][0].upi_user', '') && (
                    <>
                      <div className="zp_form__grid my-2">
                        <h4>Upi Customer Name</h4>
                        <span>
                          {get(orderDatas, '[0][0].upi_user', '')}
                          &nbsp;
                        </span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Upi Customer Number</h4>
                        <span>
                          {get(orderDatas, '[0][0].upi_contact', '')}
                          &nbsp;
                        </span>
                      </div>
                    </>
                  )}
                  <div className="zp_form__grid my-2">
                    <h4>Delivery Address</h4>
                    <span>
                      {!isEmpty(
                        get(orderDatas, '[0][0].complete_address', '')
                      ) && (
                        <>{get(orderDatas, '[0][0].complete_address', '')},</>
                      )}
                      <br />
                      {!isEmpty(get(orderDatas, '[0][0].city', '')) && (
                        <>{get(orderDatas, '[0][0].city', '')}, </>
                      )}
                      {!isEmpty(get(orderDatas, '[0][0].country', '')) && (
                        <>
                          {get(orderDatas, '[0][0].state', '')},{' '}
                          {get(orderDatas, '[0][0].country', '')},
                        </>
                      )}{' '}
                      {get(orderDatas, '[0][0].pincode', '')}
                    </span>
                  </div>

                  <div className="zp_form__grid my-2">
                    <h4>Email</h4>

                    <span>{get(orderDatas, 'email_address', '')}</span>
                  </div>
                  <div className="zp_form__grid my-2">
                    <h4>Total Orders</h4>

                    <span>
                      {Number(
                        get(orderDatas, 'zt_order_hdrs[0].total_orders', '')
                      ).toFixed(0)}
                    </span>
                  </div>
                  <div className="zp_form__grid my-2">
                    <h4>Total Sales</h4>

                    <span>
                      {Number(
                        get(orderDatas, 'zt_order_hdrs[0].total_sales', '')
                      ).toFixed(0)}
                    </span>
                  </div>
                  <div className="zp_form__grid my-2">
                    <h4>Created Date</h4>

                    <span>
                      {' '}
                      {new Date(
                        get(orderDatas, 'creation_date', '')
                      ).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                      ,{' '}
                      {new Date(
                        get(orderDatas, 'creation_date', '')
                      ).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>

                  <div className="a-link">
                    <Link
                      to={`/customers/${get(
                        orderDatas,
                        '[0][0].user_uid',
                        ''
                      )}`}
                    >
                      View Order History
                    </Link>
                  </div>
                </div>
              </Panel>
            </Collapse>
          </div>

          {get(shipmentDetail, 'waybill') ||
          get(shipmentDetail, 'awb_code') ||
          !isEmpty(get(shipmentDetail, 'shippo_label_url', '')) ? (
            <div className="collapse-cust-box">
              <Collapse expandIconPosition="end">
                <Panel
                  header={
                    <div className="customer-details">Shipment Details</div>
                  }
                  key="1"
                  className="Panelclass"
                >
                  {!isEmpty(get(shipmentDetail, 'awb_code')) && (
                    <>
                      <div className="zp_form__grid my-2">
                        <h4>Shipment method</h4>
                        <span>
                          {get(shipmentDetail, 'shipment_method', '')}
                        </span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Courier name</h4>
                        <span>
                          {get(shipmentDetail, 'shiprocket_courier_name', '')}
                        </span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Tracking number</h4>
                        <span>{get(shipmentDetail, 'awb_code', '')}</span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Pickup address</h4>
                        <span>
                          {isEmpty(
                            get(shipmentDetail, 'shiprocket_pickup_address', '')
                          )
                            ? get(shipmentDetail, 'store_location', '')
                            : get(
                                shipmentDetail,
                                'shiprocket_pickup_address',
                                ''
                              )}
                        </span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Delivery address</h4>
                        <span>
                          {isEmpty(get(shipmentDetail, 'complete_address', ''))
                            ? get(shipmentDetail, 'customer_location', '')
                            : get(shipmentDetail, 'complete_address', '')}
                        </span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Pickup scheduled date</h4>
                        <span>
                          {handleValidDate(
                            get(
                              shipmentDetail,
                              'shiprocket_pickup_scheduled_date',
                              'N/A'
                            ),
                            tenantDetails
                          )}
                        </span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Package weight</h4>
                        <span>
                          {get(shipmentDetail, 'shiprocket_applied_weight')
                            ? `${get(
                                shipmentDetail,
                                'shiprocket_applied_weight'
                              )} kg`
                            : ''}
                        </span>
                      </div>
                    </>
                  )}
                  {!isEmpty(get(shipmentDetail, 'waybill')) && (
                    <>
                      <div className="zp_form__grid my-2">
                        <h4>Shipment method</h4>
                        <span>
                          {get(shipmentDetail, 'shipment_method', '')}
                        </span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Courier name</h4>
                        <span>Delhivery</span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Tracking number</h4>
                        <span>{get(shipmentDetail, 'waybill', '')}</span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Pickup address</h4>
                        <span>
                          {isEmpty(
                            get(shipmentDetail, 'delhivery_pickup_address', '')
                          )
                            ? get(shipmentDetail, 'store_location', '')
                            : get(
                                shipmentDetail,
                                'delhivery_pickup_address',
                                ''
                              )}{' '}
                          -{' '}
                          {get(shipmentDetail, 'delhivery_pickup_pincode', '')}
                        </span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Delivery address</h4>
                        <span>
                          {isEmpty(
                            get(
                              shipmentDetail,
                              'delhivery_delivery_address',
                              ''
                            )
                          )
                            ? get(shipmentDetail, 'complete_address', '')
                            : get(
                                shipmentDetail,
                                'delhivery_delivery_address',
                                ''
                              )}{' '}
                          -{' '}
                          {get(
                            shipmentDetail,
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
                  )}
                  {!isEmpty(get(shipmentDetail, 'shippo_label_url', '')) && (
                    <>
                      <div className="zp_form__grid my-2">
                        <h4>Shipment method</h4>
                        <span>
                          {get(shipmentDetail, 'shipment_method', '')}
                        </span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Courier name</h4>
                        <span>{get(shipmentDetail, 'courier_name', '')}</span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Tracking number</h4>
                        <span
                          style={{
                            wordWrap: 'break-word',
                            maxWidth: '200px',
                            display: 'inline-block',
                          }}
                        >
                          {get(shipmentDetail, 'tracking_number', '')}
                        </span>
                      </div>
                      <div className="zp_form__grid my-2">
                        <h4>Packing Label</h4>
                        <Button
                          type="primary"
                          onClick={() =>
                            window.open(
                              get(shipmentDetail, 'shippo_label_url', ''),
                              '_blank'
                            )
                          }
                        >
                          <DownloadOutlined />
                          Download
                        </Button>
                      </div>
                    </>
                  )}
                </Panel>
              </Collapse>
            </div>
          ) : undefined}
        </div>
      </div>
    </div>
  );
}
export default MobileOrderDetails;
