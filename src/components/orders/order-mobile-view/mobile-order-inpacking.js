import React, { useContext } from 'react';
import { Tag, Collapse, Row, Button, Form, Divider, Space, Col } from 'antd';
import { get } from 'lodash';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { ReactComponent as LeftArrow } from '../../../assets/icons/leftarrow.svg';
import { handleValidDate } from '../../../shared/function-helper';
import { TenantContext } from '../../context/tenant-context';

const { Panel } = Collapse;

function MobileOrderInpacking(parameters) {
  const {
    onCancel,
    loading,
    storeData,
    orderData,
    currency,
    currencyLocale,
    onFinish,
  } = parameters;
  const [tenantDetails] = useContext(TenantContext);

  return (
    <div>
      <Row className="model-inpak-head-con">
        <Col span={2} className="model-inpaking-icon" onClick={onCancel}>
          <LeftArrow />
        </Col>
        <Col span={22} className="model-inpaking-header">
          In packing details
        </Col>
      </Row>
      <div className="inpacking-menu-modal">
        {!loading && (
          <>
            <div className="modal-order-header">Store Detail</div>
            <div className="inpaking-modal">
              <Collapse
                defaultActiveKey={['1']}
                expandIconPosition="end"
                className="modal-order-details-collapse"
              >
                <Panel
                  header={
                    <div className="flex-bwn">
                      <div>
                        <h4>{get(storeData, 'store_name', '')}</h4>
                        <span className="store-address">
                          {get(storeData, 'store_location', '')}
                        </span>
                      </div>
                    </div>
                  }
                >
                  <div className="order-container">
                    <h4>Store Location</h4>
                    <span className="store-address">
                      {get(storeData, 'address_1', '')}
                    </span>
                    <span className="store-address">
                      {get(storeData, 'address_2', '')}
                    </span>
                    <span className="store-address">
                      {get(storeData, 'city', '')}
                    </span>
                    <Divider />
                    <h4>Contact Person</h4>
                    <span className="store-address">
                      {get(storeData, 'store_person_name', '')}
                    </span>
                    <Divider />
                    <h4>Contact Person Number</h4>
                    <span className="store-address">
                      {get(storeData, 'country_code', '')}
                      &nbsp;
                      {get(storeData, 'store_person_number', '')}
                    </span>
                  </div>
                </Panel>
              </Collapse>
              <div>
                <div className="modal-order-header">Order Detail</div>
              </div>
              <div className="order-box">
                <Collapse
                  defaultActiveKey={['1']}
                  expandIconPosition="end"
                  className="modal-order-details-collapse"
                >
                  {orderData.map((results) => (
                    <Panel
                      header={
                        <div className="flex-bwn">
                          <div>
                            <h4>{get(results, '[0].order_id', '')}</h4>
                            <span className="store-address">
                              {handleValidDate(
                                get(results, '[0].creation_date', ''),
                                tenantDetails
                              )}
                            </span>
                          </div>
                          <div className="order-detail-price">
                            <h4>
                              <CurrencyFormatter
                                value={get(results, '[0].total_price', '')}
                                type={currency}
                                language={currencyLocale}
                              />
                            </h4>
                            <Tag color="lime">
                              <small>
                                {get(results, '[0].customer_type', 'Online')}
                              </small>
                            </Tag>
                          </div>
                        </div>
                      }
                      key={get(results, '[0].order_id', '')}
                    >
                      <div className="order-container">
                        {results?.map((products) => (
                          <div
                            key={get(products, 'product_uid', '')}
                            className="order-detail-products"
                          />
                        ))}
                        <Divider style={{ border: '2px dashed #bbb' }} />
                        <div className="mb-2">
                          <div className="order-detail-products">
                            <span>Item Total</span>
                            <h4 className="order-detail-price">
                              <CurrencyFormatter
                                value={get(results, '[0].order_price', 0)}
                                type={currency}
                                language={currencyLocale}
                              />
                            </h4>
                          </div>
                          <div className="order-detail-products">
                            <span>GST</span>
                            <h4 className="order-detail-price">
                              <CurrencyFormatter
                                value={get(results, '[0].order_gst_amount', 0)}
                                type={currency}
                                language={currencyLocale}
                              />
                            </h4>
                          </div>
                          <div className="order-detail-products">
                            <span>Delivery Charges</span>
                            <h4 className="order-detail-price">
                              <CurrencyFormatter
                                value={get(results, '[0].delivery_charge', '')}
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
                                value={get(results, '[0].total_price', '')}
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
              <div className="order-details-confirm">
                <Row justify="end">
                  <Form.Item>
                    <Space className="f_btns">
                      <Button danger onClick={onCancel}>
                        Cancel
                      </Button>
                      <Button type="primary" onClick={onFinish}>
                        confirm
                      </Button>
                    </Space>
                  </Form.Item>
                </Row>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default MobileOrderInpacking;
