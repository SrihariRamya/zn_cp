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
import _, { get, isEmpty } from 'lodash';
import moment from 'moment';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { ReactComponent as Customer } from '../../assets/icons/customer.svg';
import { getOrderDetail, getCurrentUser } from '../../utils/api/url-helper';
import { withRouter } from '../../utils/react-router/index';
import {
  FAILED_TO_LOAD,
  ORDER_CHECKOUT,
  CURRENCYSYMBOLS,
} from '../../shared/constant-values';
import './customer-detail.less';
import { TenantContext } from '../context/tenant-context';

const { Panel } = Collapse;

function CustomerDetails() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({});
  const [salesData, setSalesData] = useState({});
  const [orderDatas, setOrderData] = useState([]);
  const [customerID] = useState(window.location.href.split('/')[4]);
  const [tenantDetails] = useContext(TenantContext);
  const { currency, currency_locale: currencyLocale } = get(
    tenantDetails,
    'setting',
    {}
  );
  const fetchData = useCallback(() => {
    const apiArray = [
      getCurrentUser({ user_uid: customerID, salesData: true }),
      getOrderDetail({ user_uid: customerID, milestone_id: ORDER_CHECKOUT }),
    ];
    setLoading(true);
    Promise.all(apiArray)
      .then((result) => {
        setLoading(false);
        setCustomerData(_.get(result, '[0].data', {}));
        setSalesData(_.get(result, '[0].data.zt_order_hdrs[0]', {}));
        setOrderData(_.get(result, '[1].data.orderDetailMultiple', []));
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, [customerID]);
  const goBackToPrevious = () => {
    navigate(-1);
  };
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <Spin spinning={loading}>
      <div className="search-container">
        <div>
          <h1>
            <Customer />
            &nbsp; Customers
          </h1>
          <Breadcrumb separator=">">
            <Breadcrumb.Item className="table-tax">
              {' '}
              <Link to="/">Home</Link>
            </Breadcrumb.Item>

            <Breadcrumb.Item className="table-tax">
              {' '}
              <Link to="/customers">Customers</Link>
            </Breadcrumb.Item>

            <Breadcrumb.Item className="customer-breadcrum">
              Customer Details
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      <div className="box">
        <div className="box__header">
          <h3 className="text-primary">
            <Space>
              <ArrowLeftOutlined onClick={goBackToPrevious} />
              Customer Details
            </Space>
          </h3>
        </div>
        {loading ? undefined : (
          <div className="box__content box-content-background pt-0 br-b-1">
            <div className="customers-container">
              <div className="zp_form__grid my-2">
                <h4>Customer Name</h4>
                <span>{_.get(customerData, 'user_name', '')}</span>
              </div>
              <div className="zp_form__grid my-2">
                <h4>Customer Number</h4>
                <span>
                  {' '}
                  {_.get(customerData, 'country_code', '')}{' '}
                  {_.get(customerData, 'phone_number', '')}
                </span>
              </div>
              <div className="zp_form__grid my-2">
                <h4>Email Address</h4>
                <span>{_.get(customerData, 'email_address', '')}</span>
              </div>
              {_.get(customerData, 'city') && (
                <div className="zp_form__grid my-2">
                  <h4>City</h4>
                  <span>{_.get(customerData, 'city', '')}</span>
                </div>
              )}
              <div className="zp_form__grid my-2">
                <h4>Total Orders</h4>
                <span>{_.get(salesData, 'total_orders', 0)}</span>
              </div>
              <div className="zp_form__grid my-2">
                <h4>Total Sales</h4>
                <span>
                  {CURRENCYSYMBOLS[currency]}
                  {_.get(salesData, 'total_sales', 0) || 0}
                </span>
              </div>
              <div className="zp_form__grid my-2">
                <h4>Created Date</h4>
                <span>
                  {moment(_.get(customerData, 'creation_date', '')).isValid()
                    ? moment(_.get(customerData, 'creation_date', '')).format(
                        _.get(
                          tenantDetails,
                          'setting.date_format',
                          'DD-MM-YYYY hh:mm'
                        )
                      )
                    : ''}
                </span>
              </div>
              <div className="block-header-order my-2">Address</div>
              {_.get(customerData, 'user_address', []).map((response) => (
                <div className="zp_form__grid my-2">
                  <h4>{_.get(response, 'address_tag', '')}</h4>
                  <p>
                    {response.address || response.complete_address},{' '}
                    {!isEmpty(response.city) && <>{response.city},</>}
                    {!isEmpty(response.country) && (
                      <>
                        {response.state}, {response.country} -{' '}
                      </>
                    )}
                    {response.pincode}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3rem">
              <div className="box__content">
                <div className="block-header-order">Orders</div>
                <div className="my-2 order-box">
                  <Collapse defaultActiveKey={['1']}>
                    {orderDatas.map((result, index) => (
                      <Panel
                        header={
                          <div className="flex-bwn">
                            <div>
                              <h4 className="text-primary">
                                {_.get(result, '[0].order_id', '')}
                              </h4>
                              <small>
                                <i>
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
                              <h4 className="text-primary">
                                <CurrencyFormatter
                                  value={_.get(result, '[0].total_price', '')}
                                  type={currency}
                                  language={currencyLocale}
                                />
                              </h4>
                              <Tag color="lime">
                                <small>
                                  {_.get(result, '[0].customer_type', 'Online')}
                                </small>
                              </Tag>
                            </div>
                          </div>
                        }
                        // eslint-disable-next-line react/no-array-index-key
                        key={index + 1}
                      >
                        <div className="order-container">
                          {result.map((product) => (
                            <div className="my-2 flex-bwn">
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
                                <h4 className="text-green">
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
                          <div className="br-b-1">
                            <div className="flex-bwn my-2">
                              <h5>Item Total</h5>
                              <h5>
                                <CurrencyFormatter
                                  value={_.get(result[0], 'order_price')}
                                  type={currency}
                                  language={currencyLocale}
                                />
                              </h5>
                            </div>
                            <div className="flex-bwn my-2">
                              <h5>GST</h5>
                              <h5 className="text-green">
                                <CurrencyFormatter
                                  value={_.get(
                                    result,
                                    '[0].order_gst_amount,',
                                    ''
                                  )}
                                  type={currency}
                                  language={currencyLocale}
                                />
                              </h5>
                            </div>
                            <div className="flex-bwn my-2">
                              <h5>Delivery Charges</h5>
                              <h5 className="text-green">
                                <CurrencyFormatter
                                  value={_.get(
                                    result,
                                    '[0].delivery_charge',
                                    ''
                                  )}
                                  type={currency}
                                  language={currencyLocale}
                                />
                              </h5>
                            </div>
                          </div>
                          <div className="br-b-1">
                            <div className="flex-bwn  my-2">
                              <h6>Total</h6>
                              <h4 className="text-green">
                                <CurrencyFormatter
                                  value={_.get(result, '[0].total_price', '')}
                                  type={currency}
                                  language={currencyLocale}
                                />
                              </h4>
                            </div>
                          </div>
                          <div className="flex-end">
                            <Button type="primary">
                              <Link
                                to={`/orders/${_.get(
                                  result,
                                  '[0].order_uid',
                                  ''
                                )}`}
                              >
                                <EyeOutlined /> View Order Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </Panel>
                    ))}
                  </Collapse>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Spin>
  );
}

export default withRouter(CustomerDetails);
