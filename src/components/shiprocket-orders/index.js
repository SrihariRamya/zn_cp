/* eslint-disable unicorn/consistent-function-scoping */
import {
  Breadcrumb,
  Button,
  Divider,
  Drawer,
  Dropdown,
  Menu,
  Modal,
  notification,
  Row,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Card,
  Pagination,
} from 'antd';
import { LeftOutlined, CloseOutlined } from '@ant-design/icons';
import { get, isEmpty, map } from 'lodash';
import React, { useState, useEffect, useContext } from 'react';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { addDates } from '@kaaylabs/date-helper';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { FAILED_TO_LOAD, LONG_DATE_FORMAT } from '../../shared/constant-values';
import {
  generateAwbShipment,
  generateInvoice,
  generateLabel,
  generateManifest,
  generatePickupShipment,
  getAllShiprocketOrders,
  orderAvailable,
  shiprocketOrderCancel,
  shiprocketShipmentCancel,
} from '../../utils/api/url-helper';
import CourierPartner from '../orders/shipment/shiprocket/courier-partner';
import PickupSchedule from './pickup-schedule';
import CancelOrder from './cancel-order';

import { ReactComponent as MoreOutlined } from './moreaction.svg';

import Shipment from '../orders/shipment';
import { TenantContext } from '../context/tenant-context';
import { paginationstyler } from '../../shared/attributes-helper';
import { ReactComponent as Shiprocket } from './shiprocket.svg';
import EmptyTag from './empty';

function ShipmentList() {
  const history = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState({
    filterBy: 'status',
    filter: '1',
  });
  const [orderCurrentValue, setOrderCurrentValue] = useState(1);
  const [orderPagination, setOrderPagination] = useState({
    current: 1,
    pageSize: 5,
  });
  const [openMobile, setOpenMobile] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mode, setMode] = useState('create');
  const [selectedOrder, setSelectedOrder] = useState({});
  const [selectedCouier, setSelectedCouier] = useState({});
  const [selectedDate, setSelectedDate] = useState({});
  const [visible, setVisible] = useState(false);
  const [dateList, setDateList] = useState([]);
  const [pickupScheduleModal, setPickupScheduleModal] = useState(false);
  const [filterColumns, setFilterColumns] = useState([]);
  const [reorderDrawerOpen, setReorderDrawerOpen] = useState(false);
  const [shipmentMethod, setShipmentMethod] = useState({});
  const [shipmentOrderId, setShipmentOrderId] = useState({});
  const [userID, setUserID] = useState(localStorage.getItem('userID'));
  const [refreshTab, setRefreshTab] = useState(false);
  // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
  const [tenantDetails, , , tenantConfig] = useContext(TenantContext);
  const [orderSorter, setOrderSorter] = useState({
    sort_by: 'created_at',
    sort: 'desc',
  });
  const { currency, currency_locale: currencyLocale } = get(
    tenantDetails,
    'setting',
    {}
  );
  const handleShipNow = (record) => {
    setSelectedOrder(record);
    setVisible(true);
  };

  const showMobileDrawer = (record) => {
    setSelectedOrder(record);
    setOpenMobile(true);
  };
  const onMobileClose = () => {
    setOpenMobile(false);
  };

  const handlePickSchedule = (record) => {
    setSelectedOrder(record);
    setPickupScheduleModal(true);
  };
  const downloadPdf = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name);
    document.body.append(link);
    link.click();
  };
  useEffect(() => {
    paginationstyler();
  }, [orders]);
  const getGenerateManifest = (record) => {
    const parameter = {
      order_id: get(record, 'id', ''),
      shipment_id: [get(record, 'shipments[0].id', '')],
    };
    setLoading(true);
    generateManifest(parameter)
      .then((response) => {
        setLoading(false);
        downloadPdf(get(response, 'data.manifest_url', ''), 'manifest.pdf');
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };
  const getGenerateLabel = (record) => {
    const parameter = {
      order_id: get(record, 'id', ''),
      shipment_id: [get(record, 'shipments[0].id', '')],
    };
    setLoading(true);
    setUserID(localStorage.getItem('userID'));
    generateLabel(parameter)
      .then((response) => {
        setLoading(false);
        downloadPdf(get(response, 'data.label_url', ''), 'label.pdf');
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };
  const getGenerateInvoice = (record) => {
    const parameter = {
      order_id: [get(record, 'id', '')],
      shipment_id: get(record, 'shipments[0].id', ''),
    };
    setLoading(true);
    generateInvoice(parameter)
      .then((response) => {
        setLoading(false);
        downloadPdf(get(response, 'data.invoice_url', ''), 'invoice.pdf');
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };
  const handleCancelOrder = (record) => {
    setSelectedOrder(record);
    setMode('edit');
    setIsModalVisible(true);
  };
  const getShiprocketOrders = (parameters = {}) => {
    const {
      pagination: { pageSize, current },
      filterValue: { filter, filterBy },
      pagination,
    } = parameters;

    setLoading(true);
    const parameter = {
      page: current,
      per_page: pageSize,
      filter,
      filter_by: filterBy,
      sort: get(orderSorter, 'sort', ''),
      sort_by: get(orderSorter, 'sort_by'),
    };
    getAllShiprocketOrders(parameter)
      .then((response) => {
        setOrders(get(response, 'data.data', []));
        setOrderPagination({
          ...pagination,
          total: get(response, 'data.meta.pagination.total', 0),
        });
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };
  const orderCancel = (record) => {
    const parameter = {
      ids: [get(record, 'id', '')],
      order_id: get(record, 'id', ''),
      user_uid: userID,
    };
    setModalLoading(true);
    shiprocketOrderCancel(parameter)
      .then((response) => {
        setModalLoading(false);
        setIsModalVisible(false);
        notification.success({ message: get(response, 'data.message', '') });
        setRefreshTab(!refreshTab);
      })
      .catch((error) => {
        setModalLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };
  const shipmentCancel = (record) => {
    const parameter = {
      awbs: [get(record, 'shipments[0].awb', '')],
      order_id: get(record, 'id', ''),
      user_uid: userID,
    };
    setShipmentLoading(true);
    shiprocketShipmentCancel(parameter)
      .then((response) => {
        setShipmentLoading(false);
        setIsModalVisible(false);
        notification.success({ message: get(response, 'data.message', '') });
        setRefreshTab(!refreshTab);
      })
      .catch((error) => {
        setShipmentLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };
  const generateAwb = () => {
    const parameter = {
      order_id: get(selectedOrder, 'id', ''),
      courier_id: get(selectedCouier, 'courier_company_id', ''),
      shipment_id: get(selectedOrder, 'shipments[0].id', ''),
      user_uid: userID,
    };
    setModalLoading(true);
    generateAwbShipment(parameter)
      .then(() => {
        setModalLoading(false);
        setIsModalVisible(false);
        setVisible(false);
        setPickupScheduleModal(true);
      })
      .catch((error) => {
        setModalLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };
  const pickupSchedule = () => {
    const parameter = {
      order_id: get(selectedOrder, 'id', ''),
      shipment_id: [get(selectedOrder, 'shipments[0].id', '')],
      pickup_date: [selectedDate],
    };
    setPickupScheduleModal(false);
    setLoading(true);
    generatePickupShipment(parameter)
      .then((response) => {
        setPickupScheduleModal(false);
        notification.success({
          message: get(response, 'message', ''),
        });
        setRefreshTab(!refreshTab);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };
  const reorderAvailable = (record) => {
    setLoading(true);
    orderAvailable(get(record, 'id', ''))
      .then((response) => {
        setLoading(false);
        setShipmentMethod(
          get(response, 'data.shipment_mapped.shipment_method')
        );
        setShipmentOrderId(get(response, 'data.order_uid', ''));
        setReorderDrawerOpen(true);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };
  const handleDay = (value) => {
    let day;
    if (value === 0) {
      day = 'Today';
    } else if (value === 1) {
      day = 'Tomorrow';
    } else {
      day = addDates({
        date: new Date(),
        count: value,
        unit: 'd',
        fmt: 'DD MMM Y',
      });
    }
    return day;
  };
  const CustomCalendar = () => {
    const list = [];
    for (let index = 0; index < 7; index += 1) {
      const item = {
        day: handleDay(index),
        keyDate: addDates({
          date: new Date(),
          count: index,
          unit: 'd',
          fmt: LONG_DATE_FORMAT,
        }),
      };
      list.push(item);
    }
    setDateList(list);
  };
  const handleTableChange = (pagination, filters, sorter, { action }) => {
    const { current } = pagination;
    if (!isEmpty(sorter.order) && sorter) {
      setOrderSorter({
        sort_by: sorter.field,
        sort: sorter.order === 'ascend' ? 'asc' : 'desc',
      });
      setOrderCurrentValue(current);
    } else {
      setOrderSorter({
        sort_by: 'created_at',
        sort: 'desc',
      });
      setOrderCurrentValue(current);
    }
    if (action === 'paginate') {
      setOrderCurrentValue(current);
    }
  };
  const onChange = (key) => {
    setOrderCurrentValue(1);
    if (key === 'all') {
      setOrderFilter({ filter: '', filterBy: '' });
    } else {
      setOrderFilter({ filter: key, filterBy: 'status' });
    }
  };
  const onClose = () => {
    setVisible(false);
    setReorderDrawerOpen(false);
  };
  const refreshList = () => {
    setReorderDrawerOpen(false);
    setRefreshTab(!refreshTab);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    setPickupScheduleModal(false);
  };
  const handleCouierPartner = (courier) => {
    setMode('create');
    setSelectedCouier(courier);
    setIsModalVisible(true);
  };
  const buttonRender = (record) => {
    if (
      get(record, 'status_code', '') === 5 ||
      get(record, 'status_code', '') === 18
    ) {
      return (
        <Button type="primary" onClick={() => reorderAvailable(record)}>
          Reorder
        </Button>
      );
    }
    if (
      get(record, 'status_code', '') === 1 ||
      get(record, 'status_code', '') === 2
    ) {
      return (
        <Row>
          <Button onClick={() => handleShipNow(record)} type="primary">
            Ship Now
          </Button>
          <div>
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item onClick={() => getGenerateInvoice(record)}>
                    Download Invoice
                  </Menu.Item>
                  <Menu.Item onClick={() => handleCancelOrder(record)}>
                    Cancel Order
                  </Menu.Item>
                </Menu>
              }
              placement="topRight"
              arrow
            >
              <MoreOutlined style={{ cursor: 'pointer' }} />
            </Dropdown>
          </div>
        </Row>
      );
    }
    if (get(record, 'status_code', '') === 3) {
      return (
        <Row>
          <Button onClick={() => handlePickSchedule(record)} type="primary">
            Schedule
          </Button>
          <div style={{ cursor: 'pointer' }}>
            <Dropdown
              overlay={
                <Menu>
                  {!get(record, 'manifest_generated', false) && (
                    <Menu.Item onClick={() => getGenerateManifest(record)}>
                      Download Manifest
                    </Menu.Item>
                  )}
                  <Menu.Item onClick={() => getGenerateInvoice(record)}>
                    Download Invoice
                  </Menu.Item>
                  <Menu.Item onClick={() => handleCancelOrder(record)}>
                    Cancel Order
                  </Menu.Item>
                </Menu>
              }
              placement="topRight"
              arrow
            >
              <MoreOutlined />
            </Dropdown>
          </div>
        </Row>
      );
    }
    return (
      <div className="flex">
        <Button onClick={() => getGenerateManifest(record)} type="primary">
          Download
        </Button>
        <span className="edit-box">
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item onClick={() => handleCancelOrder(record)}>
                  Cancel Order
                </Menu.Item>
                {!get(record, 'manifest_generated', false) && (
                  <Menu.Item onClick={() => getGenerateManifest(record)}>
                    Download Manifest
                  </Menu.Item>
                )}
                <Menu.Item onClick={() => getGenerateLabel(record)}>
                  Download Label
                </Menu.Item>
                <Menu.Item onClick={() => getGenerateInvoice(record)}>
                  Download Invoice
                </Menu.Item>
              </Menu>
            }
            placement="bottomRight"
            arrow
          >
            <MoreOutlined />
          </Dropdown>
        </span>
      </div>
    );
  };
  const handleOpenShiprocket = (record) => {
    const shiprocketAppURL = get(tenantConfig, 'ShiprocketAppURL', '');
    window.open(`${shiprocketAppURL}/${get(record, 'id', '')}`, '');
  };
  const columns = [
    {
      title: 'Zupain Order Details',
      key: 'zupain_order_details',
      dataIndex: 'zupain_order_details',
      render: (text, record) => (
        <div>
          <Link
            to={`/orders/${get(record, 'zupain_order_details.order_uid', '')}`}
          >
            <div className="channel-order-id">
              {get(record, 'zupain_order_details.order_id', '')}
            </div>
          </Link>
          <div className="order-createAt">
            {moment(
              get(record, 'zupain_order_details.creation_date', '')
            ).isValid()
              ? moment(
                  get(record, 'zupain_order_details.creation_date', '')
                ).format('DD MMM YYYY hh:mm A')
              : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Shiprocket Order Details',
      key: 'order_details',
      dataIndex: 'channel_order_id',
      sorter: true,
      render: (text, record) => (
        <div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleOpenShiprocket(record)}
            onKeyDown={(_event) => {
              if (_event.key === 'Enter') {
                handleOpenShiprocket(record);
              }
            }}
            className="channel-order-id"
          >
            {get(record, 'channel_order_id', '')}
          </div>

          <div className="order-createAt">{get(record, 'created_at', '')}</div>
        </div>
      ),
    },
    {
      title: 'Customer Details',
      dataIndex: 'customer_name',
      key: 'customer_details',
      sorter: true,
      render: (text, record) => (
        <div>
          <div>{get(record, 'customer_name', '')}</div>
          <div>{get(record, 'customer_email', '')}</div>
          <div>{get(record, 'customer_phone', '')}</div>
        </div>
      ),
    },
    {
      title: 'Package Details',
      key: 'package_details',
      dataIndex: 'shipments',
      render: (text, record) => (
        <div>
          <div>Dead wt. : {get(record, 'shipments[0].weight', 0)} Kg</div>
          <div>{get(record, 'shipments[0].dimensions', 0)} (cm)</div>
          <div>
            Volumetric wt.: {get(record, 'shipments[0].volumetric_weight', 0)}{' '}
            Kg
          </div>
        </div>
      ),
    },
    {
      title: 'Payment',
      key: 'payment',
      dataIndex: 'total',
      sorter: true,
      render: (text, record) => (
        <div>
          <div>
            <CurrencyFormatter
              value={get(record, 'total', 0)}
              language={currencyLocale}
              type={currency}
            />
          </div>
          <Tag color="green">{get(record, 'payment_method', '')}</Tag>
        </div>
      ),
    },
    {
      title: 'Pickup Details',
      key: 'pickup_details',
      dataIndex: 'pickup_location',
      render: (text) => <div>{text}</div>,
    },
    {
      title: 'Shipping Details',
      key: 'shipping_details',
      dataIndex: 'shipping_details',
      render: (text, record) => (
        <div>
          <div>{get(record, 'shipments[0].courier', '')}</div>
          <div>AWB#</div>
          <div>{get(record, 'shipments[0].awb', '') ?? 'Not Assigned'}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      sorter: true,
      render: (text) => (
        <Tag
          color={
            text === 'CANCELED' || text === 'CANCELLATION REQUESTED'
              ? 'red'
              : 'green'
          }
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'Action',
      width: '220px',
      render: (_, record) => buttonRender(record),
    },
  ];
  useEffect(() => {
    if (get(orderFilter, 'filter', '') === '1') {
      setFilterColumns(columns.filter((col) => col.key !== 'shipping_details'));
    }
    if (get(orderFilter, 'filter', '') === '3') {
      setFilterColumns(columns.filter((col) => col.key !== 'package_details'));
    }
    getShiprocketOrders({
      pagination: { pageSize: 5, current: orderCurrentValue },
      filterValue: {
        filter: get(orderFilter, 'filter', ''),
        filterBy: get(orderFilter, 'filterBy', ''),
      },
    });
    CustomCalendar();
  }, [orderCurrentValue, orderFilter, refreshTab, orderSorter]);

  const renderTable = orders.length > 0 && !loading;
  const emptyfunc = () => {
    return {
      emptyText: renderTable ? undefined : <EmptyTag />,
    };
  };
  const onChangePagination = (pagination) => {
    setOrderCurrentValue(pagination);
  };
  return (
    <Spin spinning={loading}>
      <div className="shipment-list-container" style={{ background: 'white' }}>
        <div className="search-container">
          <div>
            <Breadcrumb separator=">">
              <Breadcrumb.Item className="table-tax">
                <Link to="/"> Home </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item className="table-tax">
                <Link to="/orders"> Orders</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item className="customer-breadcrum">
                Shiprocket Orders
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
        <div className="ml-10">
          <Space>
            <LeftOutlined
              onClick={() => {
                history(-1);
              }}
            />
            <Shiprocket />
            <h3 className="text-primary">Shiprocket Orders</h3>
          </Space>
        </div>
        <div
          className="tabs-list-container"
          style={{ margin: '10px 0  0 15px' }}
        >
          <Tabs defaultActiveKey="1" onChange={onChange}>
            <Tabs.TabPane tab="All" key="all" />
            <Tabs.TabPane tab="New" key="1" />
            <Tabs.TabPane tab="Ready To Ship" key="3" />
            <Tabs.TabPane tab="Pickups" key="4" />
            <Tabs.TabPane tab="In Transit" key="20" />
            <Tabs.TabPane tab="Delivered" key="7" />
          </Tabs>
          <Divider />
        </div>
        <div className="tabs-list-container box">
          <Table
            pagination={orderPagination}
            columns={filterColumns}
            dataSource={orders}
            onChange={handleTableChange}
            rowKey="id"
            locale={emptyfunc()}
          />
        </div>

        <div className="mobile-view">
          <div style={{ width: '100%' }}>
            <div className="mobile-view-tab">
              <Tabs defaultActiveKey="1" onChange={onChange}>
                <Tabs.TabPane tab="All" key="all" />
                <Tabs.TabPane tab="New" key="1" />
                <Tabs.TabPane tab="Ready To Ship" key="3" />
                <Tabs.TabPane tab="Pickups" key="4" />
                <Tabs.TabPane tab="In Transit" key="20" />
                <Tabs.TabPane tab="Delivered" key="7" />
              </Tabs>
            </div>
            <div className="card-view">
              {map(orders, (order) => (
                <Card key={get(order, 'id')}>
                  <div>
                    <div className="main-container">
                      <div className="card-one-column">
                        <div>{get(order, 'zupain_order_details.order_id')}</div>
                        <div>{get(order, 'status')}</div>
                        <Dropdown
                          overlay={
                            <Menu>
                              <Menu.Item
                                onClick={() => getGenerateInvoice(order)}
                              >
                                Download Invoice
                              </Menu.Item>
                              <Menu.Item
                                onClick={() => handleCancelOrder(order)}
                              >
                                Cancel Order
                              </Menu.Item>
                            </Menu>
                          }
                          placement="topRight"
                          arrow
                        >
                          <MoreOutlined />
                        </Dropdown>
                      </div>
                      <div className="card-two-column">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            handleOpenShiprocket(get(order, 'channel_order_id'))
                          }
                          onKeyDown={(_event) => {
                            if (_event.key === 'Enter') {
                              handleOpenShiprocket(
                                get(order, 'channel_order_id')
                              );
                            }
                          }}
                          className="channel-order-id"
                        >
                          {get(order, 'channel_order_id')}
                        </div>

                        <div>{get(order, 'pickup_location')}</div>
                      </div>
                      <div className="card-three-column">
                        <div>
                          <span>{get(order, 'customer_name')}</span>
                          <span>{get(order, 'customer_email')}</span>
                          <span>{get(order, 'customer_phone')}</span>
                        </div>
                        <div style={{ marginTop: '20px', marginRight: '50px' }}>
                          <span className="card-rupees">
                            &#8377;{get(order, 'total')}
                          </span>
                          <span>{get(order, 'payment_method')}</span>
                        </div>
                      </div>
                      <div className="card-four-column">
                        <div>
                          <span>
                            Dead wt.: {get(order, 'shipments[0].weight')}
                          </span>
                          <span>
                            {get(order, 'shipments[0].dimensions')} (cm)
                          </span>
                          <span>
                            Volumetric wt.:
                            {get(order, 'shipments[0].volumetric_weight')} Kg
                          </span>
                        </div>
                        <Button
                          onClick={() => showMobileDrawer(order)}
                          type="primary"
                        >
                          Ship Now
                        </Button>
                        <Drawer
                          className="shipment-drawer-mobile"
                          visible={visible}
                          title="Create Shipment"
                          onClose={onMobileClose}
                          destroyOnClose
                          maskClosable={false}
                          open={openMobile}
                          closeIcon={<CloseOutlined />}
                          width="100%"
                          mask={false}
                        >
                          <CourierPartner
                            order={selectedOrder}
                            handleCouierPartner={handleCouierPartner}
                          />
                        </Drawer>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              <Modal
                className="shipment-modal"
                onCancel={handleCancel}
                open={isModalVisible}
                footer={false}
              >
                {mode === 'create' ? (
                  <div className="shipment-modal-content-container">
                    <h3 className="courier-modal-title">
                      Are you sure you want to ship with{' '}
                      {get(selectedCouier, 'courier_name', '')}?
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
                        loading={modalLoading}
                        onClick={generateAwb}
                        type="primary"
                        style={{ marginLeft: '8px' }}
                      >
                        Yes
                      </Button>
                    </span>
                  </div>
                ) : (
                  <CancelOrder
                    loading={modalLoading}
                    shipmentLoading={shipmentLoading}
                    handleCancel={handleCancel}
                    orderCancel={(value) => orderCancel(value)}
                    shipmentCancel={(value) => shipmentCancel(value)}
                    order={selectedOrder}
                  />
                )}
              </Modal>
              {!isEmpty(orders) && (
                <div className="empty-page-tag">
                  <Pagination
                    onChange={onChangePagination}
                    current={orderCurrentValue}
                    pageSize={5}
                    total={orderPagination.total}
                  />
                </div>
              )}

              {isEmpty(orders) && (
                <div className="empty-tag">
                  <EmptyTag />
                </div>
              )}
            </div>
          </div>
        </div>

        <Drawer
          className="shipment-drawer"
          visible={visible}
          title="Create Shipment"
          onClose={onClose}
          width={1100}
          destroyOnClose
          maskClosable={false}
        >
          <CourierPartner
            order={selectedOrder}
            handleCouierPartner={handleCouierPartner}
          />
          <div className="shipment-modal-content-container">
            <Modal
              className="shipment-modal"
              onCancel={handleCancel}
              visible={isModalVisible}
              footer={false}
            >
              {mode === 'create' ? (
                <div className="shipment-modal-content-container">
                  <h3 className="courier-modal-title">
                    Are you sure you want to ship with{' '}
                    {get(selectedCouier, 'courier_name', '')}?
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
                      loading={modalLoading}
                      onClick={generateAwb}
                      type="primary"
                      style={{ marginLeft: '8px' }}
                    >
                      Yes
                    </Button>
                  </span>
                </div>
              ) : (
                <CancelOrder
                  loading={modalLoading}
                  shipmentLoading={shipmentLoading}
                  handleCancel={handleCancel}
                  orderCancel={(value) => orderCancel(value)}
                  shipmentCancel={(value) => shipmentCancel(value)}
                  order={selectedOrder}
                />
              )}
            </Modal>
          </div>
        </Drawer>

        <div className="shipment-modal-container">
          <Modal
            width={720}
            visible={pickupScheduleModal}
            title="Schedule Your Pick Up"
            okText="Schedule Pick UP"
            destroyOnClose
            footer={false}
            onCancel={handleCancel}
          >
            <PickupSchedule
              order={selectedOrder}
              setSelectedDate={setSelectedDate}
              selectedDate={selectedDate}
              dateList={dateList}
              handleCancel={handleCancel}
              pickupSchedule={pickupSchedule}
            />
          </Modal>
        </div>
        <Drawer
          visible={reorderDrawerOpen}
          title="Reorder Shiprocket"
          onClose={onClose}
          width={1100}
          destroyOnClose
          maskClosable={false}
        >
          <div className="shipment-container">
            <Shipment
              onClose={onClose}
              formOrders={false}
              refreshList={refreshList}
              orderId={shipmentOrderId}
              shipmentMethod={shipmentMethod}
            />
          </div>
        </Drawer>
      </div>
    </Spin>
  );
}
export default ShipmentList;
