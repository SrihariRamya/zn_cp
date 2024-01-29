import React, { useContext, useEffect, useCallback, useState } from 'react';
import {
  notification,
  Tag,
  Collapse,
  Row,
  Button,
  Form,
  Divider,
  Spin,
  Space,
} from 'antd';
import { get } from 'lodash';
import moment from 'moment';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { getOrderDetail, getOneStore } from '../../utils/api/url-helper';
import { withRouter } from '../../utils/react-router/index';
import { TenantContext } from '../context/tenant-context';
import MobileOrderInpacking from './order-mobile-view/mobile-order-inpacking';

const { Panel } = Collapse;
function OrderInpacking(properties) {
  const [form] = Form.useForm();
  const { orderUID, onClose, handleEditStatus, editStatusData, storeUID } =
    properties;
  const mobileView = useContext(TenantContext)[4];
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [storeData, setStoreData] = useState({});
  const [tenantDetails] = useContext(TenantContext);
  const { currency, currency_locale: currencyLocale } = get(
    tenantDetails,
    'setting',
    {}
  );

  const fetchData = useCallback(() => {
    setLoading(true);
    const apiArray = [
      getOrderDetail({ order_uid: orderUID }),
      getOneStore({ store_uid: storeUID }),
    ];
    Promise.all(apiArray)
      .then((result) => {
        setLoading(false);
        setOrderData(get(result, '[0].data.orderDetailMultiple', []));
        setStoreData(get(result, '[1].data', []));
      })
      .catch(() => {
        notification.error({ message: 'Failed to load the data' });
        setLoading(false);
      });
  }, [orderUID]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onCancel = () => {
    form.resetFields();
    onClose();
  };

  const onFinish = () => {
    onClose();
    const { value, record, data } = editStatusData;
    handleEditStatus(value, record, data);
  };
  return (
    <Spin spinning={loading}>
      {mobileView ? (
        <MobileOrderInpacking
          onCancel={onCancel}
          loading={loading}
          storeData={storeData}
          orderData={orderData}
          tenantDetails={tenantDetails}
          currency={currency}
          currencyLocale={currencyLocale}
          onFinish={onFinish}
        />
      ) : (
        <div className="br-1 order-inpacking box">
          <Form
            form={form}
            name="form_in_modal"
            layout="vertical"
            onFinish={onFinish}
          >
            <div className="box__content">
              <div className="block-header">Store Detail</div>
              <div className="my-2 order-box">
                <Collapse defaultActiveKey={['1']}>
                  <Panel
                    header={
                      <div className="flex-bwn">
                        <div>
                          <h4 className="text-primary">
                            {get(storeData, 'store_name', '')}
                          </h4>
                          <small>
                            <i>{get(storeData, 'store_location', '')}</i>
                          </small>
                        </div>
                      </div>
                    }
                  >
                    <div className="order-container">
                      <h5 className="ml-10 dark-color">Store Location</h5>
                      <div className="mt-30">
                        <p className="p-keyf">
                          {get(storeData, 'address_1', '')}
                        </p>
                        <p className="p-keyf">
                          {get(storeData, 'address_2', '')}
                        </p>
                        <p className="p-keyf">{get(storeData, 'city', '')}</p>
                      </div>
                      <Divider />
                      <div className="ml-10">
                        <h5 className="mt-30 dark-color">Contact Person</h5>
                        <p className="mt-10 detail-text">
                          {get(storeData, 'store_person_name', '')}
                        </p>
                      </div>
                      <Divider />
                      <div className="ml-10">
                        <h5 className="m-t_15 dark-color">
                          Contact Person Number
                        </h5>
                        <p className="mt-10 detail-text">
                          {get(storeData, 'country_code', '')}
                          &nbsp;
                          {get(storeData, 'store_person_number', '')}
                        </p>
                      </div>
                      <Divider />
                    </div>
                  </Panel>
                </Collapse>
              </div>
              <div className="block-header">Orders Details</div>
              <div className="my-2 order-box">
                <Collapse defaultActiveKey={['1']}>
                  {orderData.map((result) => (
                    <Panel
                      header={
                        <div className="flex-bwn">
                          <div>
                            <h4 className="text-primary">
                              {get(result, '[0].order_id', '')}
                            </h4>
                            <small>
                              <i>
                                {moment(
                                  get(result, '[0].creation_date', '')
                                ).format(
                                  get(
                                    tenantDetails,
                                    'setting.date_format',
                                    'DD-MM-YYYY hh:mm'
                                  )
                                )}
                              </i>
                            </small>
                          </div>
                          <div>
                            <h4 className="text-primary">
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
                        {result &&
                          result.map((product) => (
                            <div className="my-2 flex-bwn">
                              <div>
                                <h4>
                                  {get(product, 'product_name', '')} X{' '}
                                  {get(product, 'product_count', '')}
                                </h4>
                                <Tag color="cyan">
                                  <small>{get(product, 'units', '')}</small>
                                </Tag>
                              </div>
                              <div>
                                <h4 className="text-green">
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
                        <div className="mb-2">
                          <div className="flex-bwn my-2">
                            <h5>Item Total</h5>
                            <h5>
                              <CurrencyFormatter
                                value={get(result, '[0].order_price', 0)}
                                type={currency}
                                language={currencyLocale}
                              />
                            </h5>
                          </div>
                          <div className="flex-bwn my-2">
                            <h5>GST</h5>
                            <h5 className="text-green">
                              <CurrencyFormatter
                                value={get(result, '[0].order_gst_amount', 0)}
                                type={currency}
                                language={currencyLocale}
                              />
                            </h5>
                          </div>
                          <div className="flex-bwn my-2">
                            <h5>Delivery Charges</h5>
                            <h5 className="text-green">
                              <CurrencyFormatter
                                value={get(result, '[0].delivery_charge', '')}
                                type={currency}
                                language={currencyLocale}
                              />
                            </h5>
                          </div>
                        </div>
                        <Divider />
                        <div className="mb-2">
                          <div className="flex-bwn  my-2">
                            <h5>Total</h5>
                            <h4 className="text-green">
                              <CurrencyFormatter
                                value={get(result, '[0].total_price', '')}
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
              <Row justify="end">
                <Form.Item>
                  <Space className="f_btns">
                    <Button danger onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit">
                      confirm packaging
                    </Button>
                  </Space>
                </Form.Item>
              </Row>
            </div>
          </Form>
        </div>
      )}
    </Spin>
  );
}

export default withRouter(OrderInpacking);
