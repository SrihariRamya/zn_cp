import {
  Button,
  Col,
  Input,
  notification,
  Rate,
  Row,
  Spin,
  Table,
  Card,
  Pagination,
} from 'antd';
import { get, isEmpty, map } from 'lodash';
import React, { useState, useEffect, useContext } from 'react';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { FAILED_TO_LOAD } from '../../../../shared/constant-values';
import { getCourierPartner } from '../../../../utils/api/url-helper';
import { TenantContext } from '../../../context/tenant-context';
import EmptyTag from '../../../shiprocket-orders/empty';

function CourierPartner(parameters) {
  const { order, handleCouierPartner } = parameters;
  const [tenantDetails] = useContext(TenantContext);
  const { currency, currency_locale: currencyLocale } = get(
    tenantDetails,
    'setting',
    {}
  );
  const columns = [
    {
      title: 'Courier Partner',
      dataIndex: 'courier_name',
      key: 'courier_name',
      render: (text, record) => (
        <Row>
          <Col className="courier-name-details">
            <div className="courier-name">{text}</div>
            <div>
              {get(record, 'is_surface', false) === true ? 'Surface' : 'Air'} |
              Min-Weight: {record.min_weight} Kg
            </div>
            <div>
              RTO Charges:{' '}
              <CurrencyFormatter
                value={record.rto_charges}
                language={currencyLocale}
                type={currency}
              />
            </div>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (text) => (
        <div>
          <Rate disabled defaultValue={text} />
        </div>
      ),
    },
    {
      title: 'Expected Pickup',
      dataIndex: 'suppress_date',
      key: 'suppress_date',
      render: (text) => <div>{isEmpty(text) ? 'Tomorrow' : text}</div>,
    },
    {
      title: 'Estimated Delivery',
      dataIndex: 'etd',
      key: 'etd',
      render: (text) => <div>{text}</div>,
    },
    {
      title: 'Chargeable Weight',
      key: 'charge_weight',
      dataIndex: 'charge_weight',
      render: (text) => <div>{text} Kg</div>,
    },
    {
      title: 'Charges',
      key: 'freight_charge',
      render: (_text, record) => (
        <div>
          <CurrencyFormatter
            value={record.freight_charge + record.cod_charges}
            language={currencyLocale}
            type={currency}
          />
        </div>
      ),
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Button onClick={() => handleCouierPartner(record)} type="primary">
          Ship Now
        </Button>
      ),
    },
  ];
  const tablePageSize = 4;

  const [productPagination, setProductPagination] = useState({
    current: 1,
    pageSize: tablePageSize,
    showSizeChanger: false,
  });
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [couriers, setCouriers] = useState([]);

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentCouriers = couriers.slice(firstIndex, lastIndex);

  const fetchCourierData = () => {
    const parameter = {
      order_id: get(order, 'id', ''),
      declared_value: Number(get(order, 'total', '')),
      pickup_postcode: Number(get(order, 'pickup_address_detail.pin_code', '')),
      delivery_postcode: Number(get(order, 'customer_pincode', '')),
      weight: Number(get(order, 'shipments[0].weight', 0)),
      cod: get(order, 'payment_method', '') === 'prepaid' ? 0 : 1,
    };
    setLoading(true);
    getCourierPartner(parameter)
      .then((resp) => {
        setCouriers(
          get(
            resp,
            'getServiceAvailability.data.available_courier_companies',
            []
          )
        );
        setTotalCount(
          get(
            resp,
            'getServiceAvailability.data.available_courier_companies',
            []
          ).length
        );
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };

  useEffect(() => {
    fetchCourierData();
  }, []);

  const handleTableChange = (pagination, filters, sorter, { action }) => {
    if (action === 'paginate') {
      setProductPagination(pagination);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="courier-partner-container">
        <div className="courier-order-details-container">
          <div className="order-details-title">Order details</div>
          <Row>
            <Col span={6}>
              <div className="order-details-label">Pickup From</div>
              <Input
                readOnly
                value={get(order, 'pickup_address_detail.pin_code', '')}
              />
            </Col>
            <Col span={6}>
              <div className="order-details-label">Delivery To</div>
              <Input readOnly value={get(order, 'customer_pincode', '')} />
            </Col>
            <Col span={6}>
              <div className="order-details-label">Applicable Weight</div>
              <Input
                readOnly
                value={`${get(order, 'shipments[0].weight', 0)} kg`}
              />
            </Col>
            <Col span={6}>
              <div className="order-details-label">Payment Mode</div>
              <Input
                className="order-details-value"
                readOnly
                value={get(order, 'payment_method', '')}
              />
            </Col>
          </Row>
        </div>
        <div className="flex-bwn mt-10">
          <div className="courier-partner-title">Select Courier Partner</div>
          <div className="courier-partner-count">
            ({totalCount} Couriers Found)
          </div>
        </div>
        {!loading && (
          <>
            <div className="courier-partner-table-container">
              <Table
                className="products-seller-table"
                pagination={productPagination}
                columns={columns}
                dataSource={couriers}
                onChange={handleTableChange}
              />
            </div>
            <div className="courier-mobile-view">
              {map(currentCouriers, (courier) => {
                return (
                  <Card key={get(courier, 'id')}>
                    <div>
                      <div className="main-container">
                        <div className="card-one-column-mobile">
                          <div>{get(courier, 'courier_name')}</div>
                          <div>
                            <Rate
                              disabled
                              defaultValue={get(courier, 'rating')}
                            />
                          </div>
                        </div>
                        <div className="card-two-column-mobile">
                          <div>
                            <span>Air</span>
                            <span>
                              Min Weight:{get(courier, 'min_weight')}kg
                            </span>
                            <span>
                              RTO Charges: &#8377;{get(courier, 'rto_charges')}
                            </span>
                          </div>
                          <div className="courier-rate">
                            &#8377;{get(courier, 'rate')}
                          </div>
                        </div>
                        <div className="card-three-column-mobile">
                          Chargeable weight -{' '}
                          <span>{get(courier, 'charge_weight')}kg</span>
                        </div>
                        <div className="card-four-column-mobile">
                          <div>
                            Expected pickup - <span>Tomorrow</span>
                          </div>
                        </div>
                        <div className="card-five-column-mobile">
                          <div>
                            Estimated delivery -{' '}
                            <span>{get(courier, 'etd')}</span>
                          </div>
                          <Button
                            onClick={() => handleCouierPartner(courier)}
                            type="primary"
                          >
                            Ship Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {isEmpty(currentCouriers) && (
                <div className="empty-tag">
                  <EmptyTag />
                </div>
              )}
              <Pagination
                current={currentPage}
                total={couriers.length}
                pageSize={itemsPerPage}
                onChange={handlePageChange}
                style={{ marginTop: '20px', textAlign: 'center' }}
              />
            </div>
          </>
        )}
      </div>
    </Spin>
  );
}
export default CourierPartner;
