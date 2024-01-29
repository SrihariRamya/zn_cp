import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react';
import {
  Input,
  Table,
  notification,
  Breadcrumb,
  Tag,
  Spin,
  Space,
  Button,
  Radio,
  Dropdown,
  Drawer,
  Menu,
  Popover,
  Modal,
  Select,
  Form,
  Image,
  DatePicker,
} from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import _, { get, isEmpty } from 'lodash';
import Tour from 'reactour';
import {
  SearchOutlined,
  DownloadOutlined,
  DownOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import moment from 'moment';
import EmptyData from '../../shared/empty-data';
import { ExcelDownload } from '../../shared/excel';
import {
  getAllOrder,
  getMilestone,
  editStatus,
  getOrderDetail,
  getOrderCount,
  singleOrderPdfDownload,
  multipleOrderPdfDownload,
  getOrdersByStore,
  editCancelRequest,
  getAllShipmentMethods,
  getOnboardGuide,
  putOnboardSubGuide,
  createSelfShipmentOrder,
} from '../../utils/api/url-helper';
import { ReactComponent as Order } from '../../assets/smallImage/order.svg';
import { ReactComponent as Pdf } from '../../assets/icons/pdf.svg';
import { ReactComponent as MicrosoftExcel } from '../../assets/icons/microsoftexcel.svg';

import {
  FAILED_TO_LOAD,
  STATUS_EDIT_FAILED,
  STATUS_EDIT_SUCCESS,
  EXCEL_FILE_DOWNLOAD_FAILED,
  PAYMENT_METHOD_SLUG_PAYOFFLINE,
  PAYMENT_METHOD_TEXT_PAYOFFLINE,
  SHIPMENT_METHOD_SLUG_DELHIVERY,
  SHIPMENT_METHOD_SLUG_SHIPPO,
  SHIPMENT_METHOD_SLUG_SELF,
  SELF_SHIPMENT_CREATE_SUCCESS,
  SELF_SHIPMENT_CREATE_FAILED,
  SHIPMENT_METHOD_SLUG_SHIPROCKET,
} from '../../shared/constant-values';
import { handleUrlChanges } from '../../shared/common-url-helper';
import { TenantContext } from '../context/tenant-context';
import Confirmed, {
  ReactComponent as Confirm,
} from '../../assets/smallImage/confirm.svg';
import Inpacking from '../../assets/smallImage/inpack.svg';
import Dispatched from '../../assets/smallImage/dispatch.svg';
import Delivered from '../../assets/smallImage/deliver.svg';
import Cancelled from '../../assets/smallImage/cancel.svg';
import Checkout from '../../assets/smallImage/checkout.svg';
import Pending from '../../assets/smallImage/pending.svg';
import OrderInpacking from './order-inpacking';
import { paginationstyler } from '../../shared/attributes-helper';
import { getFilterData } from '../../shared/table-helper';
import Shipment from './shipment';
import { trimPayloadFields } from '../../shared/form-helpers';
import {
  colorFunction,
  disableTabEnterKey,
  enableTabEnterKey,
  eventTrack,
} from '../../shared/function-helper';
import { ReactComponent as CancelRequest } from '../../assets/smallImage/cancelreq.svg';
import { ReactComponent as Rejected } from '../../assets/smallImage/rejected.svg';
import OrderMobileView from './order-mobile-view/mobile-order';
import Kanban from './kanban';
import FirstShipRocketUser from './first-time-user/shiprocket-first-user';
import FirstDelhiveryUser from './first-time-user/delhivery-first-user';

const adminEvent = (text) => {
  const parameter = {
    value: text,
  };
  eventTrack(`${text} Click`, parameter);
};

const handlekey = () => {
  adminEvent('Order Status');
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const handleOrderSearchContent = (isChecked) => {
  if (isChecked) {
    return 'order-search-content-margin';
  }
  return 'order-search-content-pad';
};

const handleShipmentMethod = (slug) => {
  if (slug === 'self') {
    return 'Dispatched';
  }
  return 'Next';
};

const handleShipmentDrawer = (slug) => {
  if (slug === SHIPMENT_METHOD_SLUG_DELHIVERY) {
    return 'Create Delhivery Order';
  }
  if (slug === SHIPMENT_METHOD_SLUG_SHIPPO) {
    return 'Create Shippo Order';
  }
  return 'Create Shiprocket Order';
};

const handleShipmentFirstDrawer = (slug) => {
  if (slug === SHIPMENT_METHOD_SLUG_DELHIVERY) {
    return 'Delhivery Order';
  }
  return 'Shiprocket Order';
};

function Orders(properties) {
  const [openTourModal, setOpenTourModal] = useState(false);
  const canWrite = _.get(properties, 'roleData.can_write', false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderKey, setOrderKey] = useState([]);
  const [status] = useState([]);
  const [mID, setMID] = useState('');
  const [cID, setCID] = useState('');
  const [selectedRow, setSelectedRow] = useState([]);
  const [downloadButton, setDownloadButton] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [progressCount, setProgressCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [dispatchedCount, setDispatchedCount] = useState(0);
  const [checkoutCount, setCheckoutCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [downloadText, setDownloadText] = useState('');
  const [selectedID, setSelectedID] = useState([]);
  const [defaultName, setDefaultName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [tenantDetails] = useContext(TenantContext);
  const mobileView = useContext(TenantContext)[4];
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [userID, setUserID] = useState(localStorage.getItem('userID'));
  const appType = 'B2C';
  const firstUpdate = useRef(true);
  const [tableChange, setTableChange] = useState(false);
  const [visible, setVisible] = useState(false);
  const [orderUID, setOrderUID] = useState('');
  const [storeUID, setStoreUID] = useState('');
  const [editStatusData, setEditStatusData] = useState({});
  const [storeID, setStoreID] = useState(localStorage.getItem('storeID'));
  const [roleName, setRoleName] = useState(localStorage.getItem('roleName'));
  const [orderFilter, setOrderFilter] = useState({});
  const [orderSorter, setOrderSorter] = useState({});
  const [orderCurrentValue, setOrderCurrentValue] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [createShiprocket, setCreateShiprocket] = useState(false);
  const [createShippo, setCreateShippo] = useState(false);
  const [orderRecord, setOrderRecord] = useState({});
  const [shipmentMethod, setShipmentMethod] = useState('');
  const [shipmentMethods, setShipmentMethods] = useState([]);
  const [shiprocketOrderButton, setShiprocketOrderButton] = useState(false);
  const [isVisibleSelfShipment, setIsVisibleSelfShipment] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [shipmentMethodId, setShipmentMethodId] = useState('');
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  const [isChecked, setIsChecked] = useState(true);
  const [menuValue, setMenuValue] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeKey, setActiveKey] = useState('Reset');
  const [isKanbanOrder, setIsKanbanOrder] = useState(false);
  const [handleBasic, setHandleBasic] = useState(false);

  const sessionStartTime = new Date();
  const query = useQuery();
  const [form] = Form.useForm();
  const currentPage = query.get('page');
  const moduleName = 'orders';
  const firstPage = 1;
  let count;

  // const switchChange = (checked) => {
  //   setIsChecked(checked);
  // };

  const selectOptionData = [
    {
      value: 'Today',
      count: 1,
      label: 'Today',
    },
    {
      value: 'Yesterday',
      count: 2,
      label: 'Yesterday',
    },
    {
      value: 'Last Week',
      count: 7,
      label: 'Last Week',
    },
    {
      value: 'Last Month',
      count: 30,
      label: 'Last Month',
    },
    {
      value: 'Last Year',
      count: 365,
      label: 'Last Year',
    },
    {
      value: 'Customize',
      label: 'Customize',
    },
  ];

  const orderTitle = [
    {
      key: 'Reset',
      label: `All (${orderCount})`,
      value: 'Reset',
    },
    {
      key: 'PEN',
      label: `Pending (${pendingCount})`,
      value: 'Pending',
    },
    {
      key: 'CON',
      label: `Confirmed (${confirmedCount})`,
      value: 'Confirmed',
    },
    {
      key: 'INP',
      label: `In Packing (${progressCount})`,
      value: 'In Packing',
    },
    {
      key: 'DIS',
      label: `Dispatched (${dispatchedCount})`,
      value: 'Dispatched',
    },
    {
      key: 'DEL',
      label: `Delivered (${deliveredCount})`,
      value: 'Delivered',
    },
    {
      key: 'CAN',
      label: `Cancelled (${cancelledCount})`,
      value: 'Cancelled',
    },
    {
      key: 'CHK',
      label: `Checkout (${checkoutCount})`,
      value: 'Checkout',
    },
    {
      key: 'REQ',
      label: `Cancel Request (${requestCount})`,
      value: 'Request',
    },
  ];

  const tailLayout = {
    wrapperCol: {
      offset: 8,
      span: 16,
    },
  };

  const TourSteps = [
    {
      selector: '.one',
      content: `Here, you can see different tabs for Order Status`,
    },
    {
      selector: '.two',
      content: `This is the table for different Order Status`,
    },
  ];

  useEffect(() => {
    if (openTourModal) {
      disableTabEnterKey();
    } else {
      enableTabEnterKey();
    }
  }, [openTourModal]);

  useEffect(() => {
    if (openTourModal) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [openTourModal]);

  const fetchOrderData = useCallback(async (parameters, flag) => {
    setLoading(true);
    const {
      pagination: { pageSize, current },
      milestone,
      id,
      searchWord,
      startDate: startDateParameter,
      endDate: endDateParameter,
    } = parameters;
    const queryParameter = {
      limit: pageSize,
      offset: flag ? 1 : current,
      sorter: JSON.stringify(orderSorter),
      filters: JSON.stringify(orderFilter),
    };

    queryParameter.firstTableParams = 'zt_order_hdr';
    if (_.get(orderFilter, 'user_name', '')) {
      queryParameter.thirdTableParams = true;
    }
    if (orderFilter.creation_date) {
      queryParameter.creationDate = true;
    }
    if (id && id !== 'ALL') {
      queryParameter.customerType = id;
    }
    if (milestone !== 'ALL' && milestone) {
      queryParameter.milestone = milestone;
    }
    if (searchWord) {
      queryParameter.searchWord = searchWord;
    }
    if (storeID) {
      queryParameter.store_uid = storeID;
      return getOrdersByStore(appType, queryParameter);
    }
    if (startDateParameter && endDateParameter) {
      queryParameter.startDate = startDateParameter;
      queryParameter.endDate = endDateParameter;
    }
    return getAllOrder(appType, queryParameter);
  }, []);

  const getOrdersCount = (
    groupBy,
    milestone,
    id,
    searchWord,
    type,
    functionStartDate,
    functionEndDate
  ) => {
    const apiArray = [
      getOrderCount({
        groupBy,
        searchWord: searchWord || '',
        store_uid: storeID,
        roleName,
        sorter: JSON.stringify(orderSorter) || '',
        filters: JSON.stringify(orderFilter) || '',
        startDate: functionStartDate || '',
        endDate: functionEndDate || '',
      }),
      getOrderCount({
        groupBy: ['zt_order_hdr.customer_type_id'],
        searchWord: searchWord || '',
        store_uid: storeID,
        roleName,
        sorter: JSON.stringify(orderSorter) || '',
        filters: JSON.stringify(orderFilter) || '',
      }),
      getOnboardGuide(),
    ];
    Promise.all(apiArray)
      .then((response) => {
        const guide = response[2].data.find((index) =>
          index.subGuide.find((index_) => index_.slug === 'orders')
        );
        const subGuide = guide.subGuide.find(
          (index_) => index_.slug === 'orders'
        );
        const isOneStoreCreated = _.get(subGuide, 'completed', false);
        setOpenTourModal(!isOneStoreCreated);
        if (groupBy.length > 1 && id) {
          setCancelledCount(
            _.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'CAN' &&
                value.zm_customer_type.customer_type === id
            )?.count || 0
          );
          setCheckoutCount(
            _.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'CHK' &&
                value.zm_customer_type.customer_type === id
            )?.count || 0
          );
          setPendingCount(
            _.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'PEN' &&
                value.zm_customer_type.customer_type === id
            )?.count || 0
          );
          setRequestCount(
            _.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'REQ' &&
                value.zm_customer_type.customer_type === id
            )?.count || 0
          );
          setConfirmedCount(
            _.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'CON' &&
                value.zm_milestone.application_type === 'B2C' &&
                value.zm_customer_type.customer_type === id
            )?.count || 0
          );
          setProgressCount(
            _.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'INP' &&
                value.zm_customer_type.customer_type === id
            )?.count || 0
          );
          setDispatchedCount(
            _.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'DIS' &&
                value.zm_customer_type.customer_type === id
            )?.count || 0
          );
          setDeliveredCount(
            _.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'DEL' &&
                value.zm_customer_type.customer_type === id
            )?.count || 0
          );
        } else if (groupBy.length > 1 && !id) {
          setCancelledCount(
            (_.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'CAN' &&
                value.zm_customer_type.customer_type === 'Online'
            )?.count || 0) +
              (_.get(response, '[0]data', []).find(
                (value) =>
                  value.zm_milestone.milestone_code === 'CAN' &&
                  value.zm_customer_type.customer_type === 'Walk-in'
              )?.count || 0)
          );
          setCheckoutCount(
            (_.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'CHK' &&
                value.zm_customer_type.customer_type === 'Online'
            )?.count || 0) +
              (_.get(response, '[0]data', []).find(
                (value) =>
                  value.zm_milestone.milestone_code === 'CHK' &&
                  value.zm_customer_type.customer_type === 'Walk-in'
              )?.count || 0)
          );
          setPendingCount(
            (_.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'PEN' &&
                value.zm_customer_type.customer_type === 'Online'
            )?.count || 0) +
              (_.get(response, '[0]data', []).find(
                (value) =>
                  value.zm_milestone.milestone_code === 'PEN' &&
                  value.zm_customer_type.customer_type === 'Walk-in'
              )?.count || 0)
          );
          setRequestCount(
            (_.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'REQ' &&
                value.zm_customer_type.customer_type === 'Online'
            )?.count || 0) +
              (_.get(response, '[0]data', []).find(
                (value) =>
                  value.zm_milestone.milestone_code === 'REQ' &&
                  value.zm_customer_type.customer_type === 'Walk-in'
              )?.count || 0)
          );
          setConfirmedCount(
            (_.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'CON' &&
                value.zm_milestone.application_type === 'B2C' &&
                value.zm_customer_type.customer_type === 'Online'
            )?.count || 0) +
              (_.get(response, '[0]data', []).find(
                (value) =>
                  value.zm_milestone.milestone_code === 'CON' &&
                  value.zm_customer_type.customer_type === 'Walk-in'
              )?.count || 0)
          );
          setProgressCount(
            (_.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'INP' &&
                value.zm_customer_type.customer_type === 'Online'
            )?.count || 0) +
              (_.get(response, '[0]data', []).find(
                (value) =>
                  value.zm_milestone.milestone_code === 'INP' &&
                  value.zm_customer_type.customer_type === 'Walk-in'
              )?.count || 0)
          );
          setDispatchedCount(
            (_.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'DIS' &&
                value.zm_customer_type.customer_type === 'Online'
            )?.count || 0) +
              (_.get(response, '[0]data', []).find(
                (value) =>
                  value.zm_milestone.milestone_code === 'DIS' &&
                  value.zm_customer_type.customer_type === 'Walk-in'
              )?.count || 0)
          );
          setDeliveredCount(
            (_.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'DEL' &&
                value.zm_customer_type.customer_type === 'Online'
            )?.count || 0) +
              (_.get(response, '[0]data', []).find(
                (value) =>
                  value.zm_milestone.milestone_code === 'DEL' &&
                  value.zm_customer_type.customer_type === 'Walk-in'
              )?.count || 0)
          );
        } else {
          setCancelledCount(
            _.get(response, '[0]data', []).find(
              (value) => value.zm_milestone.milestone_code === 'CAN'
            )?.count || 0
          );
          setCheckoutCount(
            _.get(response, '[0]data', []).find(
              (value) => value.zm_milestone.milestone_code === 'CHK'
            )?.count || 0
          );
          setPendingCount(
            _.get(response, '[0]data', []).find(
              (value) => value.zm_milestone.milestone_code === 'PEN'
            )?.count || 0
          );
          setRequestCount(
            _.get(response, '[0]data', []).find(
              (value) => value.zm_milestone.milestone_code === 'REQ'
            )?.count || 0
          );
          setConfirmedCount(
            _.get(response, '[0]data', []).find(
              (value) =>
                value.zm_milestone.milestone_code === 'CON' &&
                value.zm_milestone.application_type === 'B2C'
            )?.count || 0
          );
          setProgressCount(
            _.get(response, '[0]data', []).find(
              (value) => value.zm_milestone.milestone_code === 'INP'
            )?.count || 0
          );
          setDispatchedCount(
            _.get(response, '[0]data', []).find(
              (value) => value.zm_milestone.milestone_code === 'DIS'
            )?.count || 0
          );
          setDeliveredCount(
            _.get(response, '[0]data', []).find(
              (value) => value.zm_milestone.milestone_code === 'DEL'
            )?.count || 0
          );
          setUserID(localStorage.getItem('userID'));
        }
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  useEffect(() => {
    getMilestone()
      .then((resp) => {
        resp.data.map((value) => {
          switch (value.milestone_code) {
            case 'CHK': {
              break;
            }
            case 'PEN': {
              status[0] = value;
              break;
            }
            case 'CON': {
              status[1] = value;
              break;
            }
            case 'INP': {
              status[2] = value;
              break;
            }
            case 'DIS': {
              status[3] = value;
              break;
            }
            case 'DEL': {
              status[4] = value;
              break;
            }
            case 'CAN': {
              status[5] = value;
              break;
            }
            default:
          }
          return false;
        });
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, [status]);

  const fetchShipmentMethod = () => {
    const parameters = {
      from: 'ORDER',
    };
    getAllShipmentMethods(parameters)
      .then((resp) => {
        const data = get(resp, 'data', []);
        setShipmentMethods(data);
        const findShiprocketMethod = data.find(
          (method) => method.slug === SHIPMENT_METHOD_SLUG_SHIPROCKET
        );
        if (findShiprocketMethod.is_active) {
          setShiprocketOrderButton(true);
        }
        const findSelfMethod = data.find(
          (method) => method.slug === SHIPMENT_METHOD_SLUG_SELF
        );
        if (!isEmpty(findSelfMethod)) {
          setShipmentMethod(findSelfMethod);
        }
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  useEffect(() => {
    fetchShipmentMethod();
  }, []);

  const singleOrderPdf = (id) => {
    setLoading(true);
    adminEvent('Download Invoice');
    setDownloadText('Downloading');
    setIsChecked(true);
    singleOrderPdfDownload(id)
      .then((resp) => {
        const url = window.URL.createObjectURL(new Blob([resp.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Order.pdf');
        document.body.append(link);
        link.click();
        setLoading(false);
        setDownloadText('');
      })
      .catch(() => {
        setDownloadText('');
        setLoading(false);
        notification.error({
          message: 'Failed to download order details',
        });
      });
  };
  const multipleOrderPDF = (parameter = {}) => {
    const selectedOrderId = isChecked ? selectedRow : parameter;
    const orderIDS = selectedOrderId.map((id) => id.order_id);
    setDownloadButton(true);
    adminEvent('Download Invoice');
    setLoading(true);
    setDownloadText('Downloading');
    multipleOrderPdfDownload(orderIDS)
      .then((response) => {
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const linkDocument = document.createElement('a');
        linkDocument.href = blobUrl;
        linkDocument.setAttribute(
          'download',
          `orders${moment().format(
            _.get(tenantDetails, 'setting.date_format', 'DD-MM-YYYY hh:mm')
          )}.zip`
        );
        document.body.append(linkDocument);
        linkDocument.click();
        setDownloadButton(false);
        setLoading(false);
        setDownloadText('');
        setSelectedRow([]);
        setSelectedID([]);
        setOrderKey([]);
      })
      .catch(() => {
        setDownloadText('');
        setLoading(false);
        notification.error({
          message: 'failed',
        });
      });
  };
  const downloadOrderExcel = (item) => {
    adminEvent('Download Invoice');
    let tableDataValue = [];
    const excelData = isChecked ? selectedID : item;
    try {
      if (excelData.length > 0) {
        tableDataValue = excelData.map((value) => {
          const addressId = value.delivery_address_id;
          const userAddress = value.zm_user.user_address;
          const response = userAddress.find(
            (data) => data.b2c_address_id === addressId
          );
          return {
            'Customer name': _.get(value, 'zm_user.user_name', ''),
            'Phone Number': _.get(value, 'zm_user.phone_number', ''),
            'Email Address': _.get(value, 'zm_user.email_address', ''),
            City: _.get(value, 'zm_user.city', ''),
            'Order ID': _.get(value, 'order_id', 0),
            'Order Date': moment(_.get(value, 'creation_date', 0)).isValid()
              ? moment(_.get(value, 'creation_date', 0)).format(
                  _.get(
                    tenantDetails,
                    'setting.date_format',
                    'DD-MM-YYYY hh:mm'
                  )
                )
              : '',
            'Delivery Address': `${
              _.get(response, 'address', '') ||
              _.get(response, 'complete_address', '')
            } - ${_.get(response, 'pincode', '')}`,
            'Order Type': _.get(value, 'customer_type', 'Online'),
            'Item total': _.get(value, 'order_price', 0),
            'GST Price': _.get(value, 'gst', ''),
            'Delivery Charges': _.get(value, 'delivery_charge', 0),
            Total: _.get(value, 'total_price', 0),
          };
        });
      }
      setSelectedRow([]);
      setSelectedID([]);
      setOrderKey([]);
      ExcelDownload(tableDataValue, 'Orders');
    } catch {
      notification.error({ message: EXCEL_FILE_DOWNLOAD_FAILED });
    }
  };
  const downloadExcel = async (data) => {
    setLoading(true);
    adminEvent('Download Invoice');
    setDownloadText('Downloading');
    try {
      const customerInfo = await getOrderDetail({ order_uid: data.order_uid });
      const orderInfos = await _.get(
        customerInfo,
        'data.orderDetailMultiple',
        []
      ).map((result) => {
        const response = result.find((_value, index) => index === 0);
        return {
          'Customer name': _.get(data, 'zm_user.user_name', ''),
          'Phone Number': _.get(data, 'zm_user.phone_number', ''),
          'Email Address': _.get(data, 'zm_user.email_address', ''),
          City: _.get(data, 'zm_user.city', ''),
          'Order ID': response.order_id,
          'Order Date': moment(_.get(response, 'creation_date', '')).format(
            _.get(tenantDetails, 'setting.date_format', 'DD-MM-YYYY hh:mm')
          ),
          'Delivery Address': `${
            _.get(response, 'address', '') ||
            _.get(response, 'complete_address', '')
          } - ${_.get(response, 'pincode', '')}`,
          'Order Type': _.get(response, 'customer_type', 'Online'),
          'Item total': _.get(response, 'order_price', 0),
          'GST Price': _.get(response, 'order_gst_amount', 0),
          'Delivery Charges': _.get(response, 'delivery_charge', 0),
          Total: _.get(response, 'total_price', 0),
        };
      });
      ExcelDownload(orderInfos, 'Orders');
      setLoading(false);
      setDownloadText('');
    } catch {
      setDownloadText('');
      setLoading(false);
      notification.error({ message: EXCEL_FILE_DOWNLOAD_FAILED });
    }
  };

  const fetchData = useCallback((parameters) => {
    const current = Number.isNaN(currentPage) ? false : Number(currentPage);
    const newPagination = {
      ...pagination,
      ...(current && { current }),
    };
    setMID('ALL');
    setCID('ALL');
    fetchOrderData(parameters || { pagination })
      .then((resp) => {
        setDefaultName('Reset');
        const orderDataSet = resp.data;
        setFilterData(orderDataSet.rows);
        setPagination({
          ...newPagination,
          total: orderDataSet.count,
        });
        setOrderCount(orderDataSet.count);
        getOrdersCount(['zt_order_hdr.milestone_id']);
        setLoading(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, []);
  useEffect(() => {
    const current = Number.isNaN(currentPage) ? false : Number(currentPage);
    const newPagination = {
      ...pagination,
      ...(current && { current }),
    };
    if (
      (currentPage || currentPage === null) &&
      !tableChange &&
      !firstUpdate.current
    ) {
      const addPagination =
        currentPage === null ? { ...pagination, current: 1 } : newPagination;
      fetchOrderData({
        pagination: addPagination,
        milestone: mID === 'ALL' ? '' : mID,
        id: cID,
        searchWord: searchText,
        startDate,
        endDate,
      })
        .then((resp) => {
          setLoading(false);
          const orderDataSet = resp.data;
          setFilterData(orderDataSet.rows);
          setPagination({
            ...addPagination,
            total: orderDataSet.count,
          });
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
        });
    }
    if (firstUpdate.current) {
      firstUpdate.current = false;
      const parameters = current ? { pagination: newPagination } : false;
      fetchData(parameters);
    }
  }, [currentPage]);

  const filterStatus = (id, name) => {
    setTableChange(true);
    handleUrlChanges(firstPage, navigate, moduleName);
    setDefaultName(name);
    setMID(id);
    fetchOrderData(
      {
        pagination,
        milestone: id,
        id: cID,
        searchWord: searchText,
        startDate,
        endDate,
      },
      true
    )
      .then((resp) => {
        setLoading(false);
        const orderDataSet = resp.data;
        setFilterData(orderDataSet.rows);
        getOrdersCount(
          ['zt_order_hdr.milestone_id', 'zt_order_hdr.customer_type_id'],
          id === 'ALL' ? '' : id,
          cID === 'ALL' ? '' : cID,
          searchText,
          orderFilter,
          startDate,
          endDate
        );
        setPagination({
          ...pagination,
          current: 1,
          total: orderDataSet.count,
        });
        setTableChange(false);
      })
      .catch(() => {
        setTableChange(false);
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const filterReset = (name) => {
    window.location.reload();
    setDefaultName(name);
    setCID('Online');
    setMID('ALL');
    setSearchText('');
    fetchOrderData({ pagination, id: 1 })
      .then((resp) => {
        setLoading(false);
        const orderDataSet = resp.data;
        setFilterData(orderDataSet.rows);
        setPagination({
          ...pagination,
          total: orderDataSet.count,
        });
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const rowSelection = {
    selectedRowKeys: orderKey,
    onChange: (selectedRowKeys, selectedRow1) => {
      if (!isEmpty(selectedRowKeys) && !isEmpty(selectedRow1)) {
        setSelectedRow(selectedRow1);
        setSelectedID(selectedRow1);
        setOrderKey(selectedRowKeys);
      } else {
        setSelectedRow([]);
        setSelectedID([]);
        setOrderKey([]);
      }
    },
    getCheckboxProps: (record) => ({
      name: record.name,
    }),
  };

  const globalSearch = _.debounce((value) => {
    setTableChange(true);

    setSearchText(value);
    handleUrlChanges(firstPage, navigate, moduleName);
    getOrdersCount(
      ['zt_order_hdr.milestone_id', 'zt_order_hdr.customer_type_id'],
      mID === 'ALL' || !value ? '' : mID,
      cID === 'ALL' || !value ? '' : cID,
      value,
      '',
      '',
      ''
    );
    if (value) {
      setPagination({
        ...pagination,
        current: 1,
      });
      fetchOrderData(
        { pagination, milestone: mID, id: cID, searchWord: value },
        true
      )
        .then((resp) => {
          const orderDataSet = resp.data;
          setFilterData(orderDataSet.rows);
          setPagination({
            ...pagination,
            current: 1,
            total: orderDataSet.count,
          });
          setTableChange(false);
          setOrderCount(orderDataSet.count);
          setLoading(false);
          setStoreID(localStorage.getItem('storeID'));
          setRoleName(localStorage.getItem('roleName'));
        })
        .catch(() => {
          setTableChange(false);
          notification.error({ message: FAILED_TO_LOAD });
        });
    } else {
      setMID('ALL');
      setCID('ALL');
      setDefaultName('Reset');
      fetchOrderData({ pagination }, true)
        .then((resp) => {
          const orderDataSet = resp.data;
          setFilterData(orderDataSet.rows);
          setPagination({
            ...pagination,
            current: 1,
            total: orderDataSet.count,
          });
          setTableChange(false);
          setOrderCount(orderDataSet.count);
          setLoading(false);
        })
        .catch(() => {
          setTableChange(false);
          notification.error({ message: FAILED_TO_LOAD });
        });
    }
  }, 1000);

  const reInitiateDatas = () => {
    setLoading(false);
    notification.success({
      message: STATUS_EDIT_SUCCESS,
    });
    setSearchText('');
    fetchOrderData({ pagination, id: cID }, true)
      .then((resp) => {
        setDefaultName('Reset');
        setMID('ALL');
        setCID('ALL');
        const groupBy = ['zt_order_hdr.milestone_id'];
        getOrdersCount(groupBy);
        const orderDataSet = resp.data;
        setFilterData(orderDataSet.rows);
        setPagination({
          ...pagination,
          total: orderDataSet.count,
        });
        setOrderCount(orderDataSet.count);
        setLoading(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const handleEditStatus = (value, record, data) => {
    if (isChecked) {
      setLoading(true);
    }
    editStatus(
      {
        ...data,
        milestone_id: value.key,
        user_uid: userID,
      },
      record
    )
      .then(() => {
        if (isChecked) {
          return reInitiateDatas();
        }
        return setIsKanbanOrder(true);
      })
      .catch(() => {
        notification.error({
          message: STATUS_EDIT_FAILED,
        });
      });
  };

  const handleStatus = (value, record, data) => {
    setOrderUID(_.get(data, 'order_uid', ''));
    setOrderId(_.get(data, 'order_id', ''));
    setStoreUID(_.get(data, 'store_uid', ''));
    if (_.get(value, 'key', '') === '9') {
      setEditStatusData({
        value,
        record,
        data,
      });
      setVisible(true);
    } else if (_.get(value, 'key', '') === '10') {
      setOrderRecord(record);
      setIsModalVisible(true);
    } else {
      handleEditStatus(value, record, data);
    }
  };

  const onClose = () => {
    setVisible(false);
    setCreateShiprocket(false);
    setCreateShippo(false);
    setHandleBasic(false);
    fetchShipmentMethod();
  };

  const handleTableChange = (paginationAlias, filters, sorters) => {
    setTableChange(true);
    const { current } = paginationAlias;

    if (!_.isEmpty(sorters.order) && sorters) {
      setOrderSorter({
        columnKey: sorters.columnKey,
        orders: sorters.order === 'ascend' ? 'ascend' : 'descend',
      });
      setOrderCurrentValue(current);
    } else {
      setOrderSorter({
        columnKey: sorters.columnKey,
        orders: sorters.order === '',
      });
      setOrderCurrentValue(current);
    }
  };

  useEffect(() => {
    if (Object.keys(orderSorter).length > 0) {
      const parameters = new URLSearchParams();
      if (orderCurrentValue) parameters.append('page', orderCurrentValue);
      navigate({
        pathname: '/orders',
        search: parameters.toString(),
      });
      fetchOrderData({
        pagination: { pageSize: 10, current: orderCurrentValue },
        milestone: mID === 'ALL' ? '' : mID,
        id: cID,
        searchWord: searchText,
        startDate,
        endDate,
      })
        .then((resp) => {
          setLoading(false);
          const orderDataSet = resp.data;
          setFilterData(orderDataSet.rows);
          getOrdersCount(
            ['zt_order_hdr.milestone_id', 'zt_order_hdr.customer_type_id'],
            mID === 'ALL' ? '' : mID,
            cID === 'ALL' ? '' : cID,
            searchText,
            orderFilter,
            startDate,
            endDate
          );
          setPagination({
            pageSize: 10,
            ...orderCurrentValue,
            total: orderDataSet.count,
          });
          setTableChange(false);
          setOrderCount(orderDataSet.count);
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
          setTableChange(false);
        });
    }
  }, [orderSorter]);

  const icons = (milestone) => {
    return (
      (milestone.milestone_code === 'CON' && (
        <img src={Confirmed} className="icon" alt="." />
      )) ||
      (milestone.milestone_code === 'INP' && (
        <img src={Inpacking} className="icon" alt="." />
      )) ||
      (milestone.milestone_code === 'DIS' && (
        <img src={Dispatched} className="icon" alt="." />
      )) ||
      (milestone.milestone_code === 'DEL' && (
        <img src={Delivered} className="icon" alt="." />
      )) ||
      (milestone.milestone_code === 'CAN' && (
        <img src={Cancelled} className="icon" alt="." />
      ))
    );
  };

  const editRequestStatus = (value, record) => {
    editCancelRequest({ ...record, type: value.key }, record.order_id)
      .then(() => {
        reInitiateDatas();
      })
      .catch(() => {
        notification.error({
          message: STATUS_EDIT_FAILED,
        });
      });
  };

  const handleRequestStatus = () => {
    return (
      <>
        <Menu.Item key={1} data-value={1} className="active">
          <Confirm />
          <span className="milestone-data">Accept</span>
        </Menu.Item>
        <Menu.Item key={2} data-value={2} className="active">
          <Rejected />
          <span className="milestone-data">Reject</span>
        </Menu.Item>
      </>
    );
  };

  const handleDuration = (value) => {
    // eslint-disable-next-line no-unused-vars
    const parameter = {
      session_type: `${value} status update`,
      start_time: sessionStartTime,
      end_time: new Date(),
    };
  };

  const handleMileStones = (milestone, tags, value) => {
    if (value === true) {
      return (
        <Menu.Item
          key={milestone.milestone_id}
          data-value={milestone.milestone_id}
          icon={icons(milestone)}
          className={
            _.get(milestone, 'milestone_description', '') === tags
              ? 'bg-gray-lightcolor active'
              : 'active'
          }
        >
          <span
            className={
              _.get(milestone, 'milestone_description', '') === tags
                ? 'text-green-dark'
                : 'text-grey-light'
            }
          >
            <span
              role="button"
              tabIndex={0}
              className="milestone-data"
              onClick={() => handleDuration(milestone.milestone_description)}
              onKeyDown={(event_) => {
                if (event_.key === 'Enter' || event_.key === 'Space') {
                  handleDuration(milestone.milestone_description);
                }
              }}
            >
              {' '}
              {milestone.milestone_description}
            </span>
          </span>
        </Menu.Item>
      );
    }
    return false;
  };

  const handleCount = (value) => {
    count = value;
  };

  const handleDropDown = (tags, record) => {
    if (
      tags === 'Delivered' ||
      tags === 'Checkout' ||
      tags === 'Cancelled' ||
      tags === 'Preparing for Dispatch'
    ) {
      let iconSource = '';
      switch (tags) {
        case 'Delivered': {
          iconSource = Delivered;

          break;
        }
        case 'Checkout': {
          iconSource = Checkout;

          break;
        }
        case 'Cancelled': {
          iconSource = Cancelled;

          break;
        }
        case 'Preparing for Dispatch': {
          iconSource = Dispatched;

          break;
        }
        default:
      }
      return (
        <Tag color={colorFunction(tags)} className="order-tag">
          <span>
            {iconSource && (
              <img src={iconSource} alt="." className="tag-icon" />
            )}
            {tags}
          </span>
        </Tag>
      );
    }
    if (tags !== 'Cancel Request') {
      let iconSource = '';
      switch (tags) {
        case 'Pending': {
          iconSource = Pending;

          break;
        }
        case 'Dispatched': {
          iconSource = Dispatched;

          break;
        }
        case 'Confirmed': {
          iconSource = Confirmed;

          break;
        }
        case 'In Packing': {
          iconSource = Inpacking;

          break;
        }
        default:
      }
      return (
        <div className="tag-button">
          <Button className={colorFunction(tags)} onClick={() => handlekey()}>
            <Dropdown
              disabled={!canWrite}
              trigger="click"
              overlay={
                <Menu
                  onClick={(event) =>
                    handleStatus(event, record.order_id, record)
                  }
                  className="order_dropdown"
                >
                  {handleCount(false)}
                  {status &&
                    status.map((milestone) =>
                      _.get(milestone, 'milestone_description', '') === tags
                        ? handleCount(true)
                        : handleMileStones(milestone, tags, count)
                    )}
                </Menu>
              }
              placement="bottomRight"
              arrow
            >
              <span color={colorFunction(tags)}>
                {iconSource && (
                  <img src={iconSource} alt="." className="tag-icon" />
                )}
                {tags}
                <DownOutlined hidden={!canWrite} className="dropdown-icon" />
              </span>
            </Dropdown>
          </Button>
        </div>
      );
    }
    return (
      <Tag className="order-tag" color={colorFunction(tags)}>
        <Dropdown
          disabled={!canWrite}
          trigger="click"
          overlay={
            <Menu
              className="order_dropdown"
              onClick={(event) => editRequestStatus(event, record)}
            >
              {handleRequestStatus()}
            </Menu>
          }
          placement="bottomRight"
          arrow
        >
          <span className="cancelreq-span" color={colorFunction(tags)}>
            <CancelRequest style={{ marginLeft: '5px', marginRight: '5px' }} />
            Cancel Req
            <DownOutlined hidden={!canWrite} className="dropdown-icon" />
          </span>
        </Dropdown>
      </Tag>
    );
  };

  const categoryColumns = [
    {
      title: 'Order ID',
      width: 150,
      key: 'order_id',
      render: (record) => (
        <Link to={`/orders/${_.get(record, 'order_uid', '')}`}>
          {record.order_id}
        </Link>
      ),
      sorter: true,
      ...getFilterData(
        'Order ID',
        'order_id',
        'text',
        setOrderFilter,
        orderFilter
      ),
    },
    {
      title: 'Customer Name',
      dataIndex: ['zm_user', 'user_name'],
      key: 'number',
      width: 170,
      render: (text) => <span className="text-grey-light">{text}</span>,
      sorter: true,
      ...getFilterData(
        'Customer Name',
        'user_name',
        'text',
        setOrderFilter,
        orderFilter
      ),
    },
    {
      title: 'Bill Date',
      dataIndex: ['modified_date'],
      key: 'modified_date',
      width: 160,
      render: (a) => (
        <span className="text-grey-light">
          {moment(a).format(
            _.get(tenantDetails, 'setting.date_format', 'DD-MM-YYYY hh:mm')
          )}
        </span>
      ),
      sorter: true,
      ...getFilterData(
        'Bill Date',
        'modified_date',
        'dateTime',
        setOrderFilter,
        orderFilter
      ),
    },
    {
      title: 'Status',
      dataIndex: ['zm_milestone', 'milestone_description'],
      key: 'status',
      width: 150,
      sorter: true,
      render: (tags, record) => <>{handleDropDown(tags, record)}</>,
    },
    {
      title: 'Payment method',
      width: 150,
      render: (text) => (
        <span className="text-grey-light">
          {get(text, 'zt_order_payment.zm_payment_method.slug', '') ===
          PAYMENT_METHOD_SLUG_PAYOFFLINE
            ? PAYMENT_METHOD_TEXT_PAYOFFLINE
            : get(text, 'zt_order_payment.zm_payment_method.slug', '')}
        </span>
      ),
    },
    {
      title: 'Payment Proof',
      width: 150,
      render: (text) =>
        get(text, 'zt_order_payment.user_payment_proof', '') ? (
          <Image
            src={get(text, 'zt_order_payment.user_payment_proof', '')}
            className="proof-image"
          />
        ) : (
          <span style={{ wordBreak: 'break-all' }} className="text-grey-light">
            {get(text, 'zt_order_payment.user_transaction_id', '')}
          </span>
        ),
    },
    {
      title: 'Amount',
      dataIndex: 'total_price',
      key: 'total_price',
      width: 160,
      render: (currency) => (
        <span className="text-grey-light">
          <CurrencyFormatter
            value={currency}
            type={get(tenantDetails, 'setting.currency', '')}
            language={get(tenantDetails, 'setting.currency_locale', '')}
          />
        </span>
      ),
      sorter: true,
      ...getFilterData(
        'Amount',
        'total_price',
        'text',
        setOrderFilter,
        orderFilter
      ),
    },
    {
      title: 'Bills',
      width: 100,
      align: 'center',
      render: (data) => (
        <span className="edit-box">
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item onClick={() => singleOrderPdf(data.order_uid)}>
                  <Pdf /> Download PDF
                </Menu.Item>
                <Menu.Item onClick={() => downloadExcel(data)}>
                  <MicrosoftExcel /> Download Excel
                </Menu.Item>
              </Menu>
            }
            placement="bottomRight"
            arrow
          >
            <Tag className="bills" color="blue">
              <DownloadOutlined />
            </Tag>
          </Dropdown>
        </span>
      ),
    },
  ];
  useEffect(() => {
    paginationstyler();
  }, [filterData]);

  const refresh = () => {
    setCreateShiprocket(false);
    setCreateShippo(false);
    if (isChecked) {
      return fetchData();
    }
    return setIsKanbanOrder(true);
  };
  const fetchAndUpdateData = (startDateValue, endDateValue) => {
    const startDates = startDateValue;
    const endDates = endDateValue;

    setTableChange(true);
    setLoading(true);
    getOrdersCount(
      ['zt_order_hdr.milestone_id', 'zt_order_hdr.customer_type_id'],
      mID === 'ALL' || (!startDates && !endDates) ? '' : mID,
      cID === 'ALL' || (!startDates && !endDates) ? '' : cID,
      '',
      '',
      startDates,
      endDates
    );

    fetchOrderData(
      {
        pagination,
        milestone: mID,
        id: cID,
        startDate: startDateValue,
        endDate: endDateValue,
      },
      true
    )
      .then((resp) => {
        const orderDataSet = resp.data;
        setFilterData(orderDataSet.rows);
        setPagination({
          ...pagination,
          current: 1,
          total: orderDataSet.count,
        });
        setTableChange(false);
        setOrderCount(orderDataSet.count);
        setLoading(false);
      })
      .catch(() => {
        setTableChange(false);
        notification.error({ message: FAILED_TO_LOAD });
      });
  };
  const handleDateRangeChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      const startDateValue = start.startOf('day').format();
      const endDateValue = end.endOf('day').format();
      setStartDate(startDateValue);
      setEndDate(endDateValue);
      fetchAndUpdateData(startDateValue, endDateValue);
    }
  };
  const { RangePicker } = DatePicker;

  const menuChange = (value, data) => {
    setMenuValue(value);
    setTableChange(true);

    if (value) {
      if (value === 'Customize') {
        return;
      }
      let startDateValue;
      let endDateValue;

      switch (value) {
        case 'Yesterday': {
          endDateValue =
            data?.length === 2
              ? moment(data[1]).endOf('day').format()
              : moment().subtract(1, 'days').endOf('day').format();
          startDateValue =
            data?.length === 2
              ? moment(data[0]).startOf('day').format()
              : moment().subtract(1, 'days').startOf('day').format();
          break;
        }
        case 'Today': {
          endDateValue = moment().endOf('day').format();
          startDateValue = moment().startOf('day').format();
          break;
        }
        case 'Last Week': {
          endDateValue = moment().subtract(1, 'weeks').endOf('week').format();
          startDateValue = moment()
            .subtract(1, 'weeks')
            .startOf('week')
            .format();
          break;
        }
        case 'Last Month': {
          endDateValue = moment().subtract(1, 'months').endOf('month').format();
          startDateValue = moment()
            .subtract(1, 'months')
            .startOf('month')
            .format();
          break;
        }
        case 'Last Year': {
          endDateValue = moment().subtract(1, 'years').endOf('year').format();
          startDateValue = moment()
            .subtract(1, 'years')
            .startOf('year')
            .format();
          break;
        }
        default: {
          const selectedOption = selectOptionData.find(
            (option) => option.value === value
          );
          if (!selectedOption) {
            return;
          }
          endDateValue = moment().endOf('day').format();
          startDateValue = moment()
            .subtract(selectedOption.count, 'days')
            .startOf('day')
            .format();
        }
      }

      setEndDate(endDateValue);
      setStartDate(startDateValue);
      fetchAndUpdateData(startDateValue, endDateValue);
    } else if (!value) {
      getOrdersCount(
        ['zt_order_hdr.milestone_id', 'zt_order_hdr.customer_type_id'],
        mID === 'ALL' || !value ? '' : mID,
        cID === 'ALL' || !value ? '' : cID,
        value,
        '',
        '',
        ''
      );
      setStartDate('');
      setEndDate('');
      setMID('ALL');
      setCID('ALL');
      setDefaultName('Reset');
      fetchOrderData({ pagination }, true)
        .then((resp) => {
          const orderDataSet = resp.data;
          setFilterData(orderDataSet.rows);
          setPagination({
            ...pagination,
            current: 1,
            total: orderDataSet.count,
          });
          setTableChange(false);
          setOrderCount(orderDataSet.count);
          setLoading(false);
        })
        .catch(() => {
          setTableChange(false);
          notification.error({ message: FAILED_TO_LOAD });
        });
    }
  };

  const filterOrders = () => {
    return (
      <div className="orders-filter-popup-content">
        <Space>
          <div className="radio-button" style={{ color: 'red' }}>
            <Radio.Group
              className="theme-radio"
              value={defaultName}
              style={{ display: 'flex', gap: '5px' }}
            >
              <Radio.Button
                value="Reset"
                key="Reset"
                onClick={() => filterReset('Reset')}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    className={
                      defaultName === 'Reset' ? 'white' : 'text-grey-dark'
                    }
                  >
                    {' '}
                    All
                  </div>
                  <div
                    className={
                      defaultName === 'Reset' ? 'white' : 'text-grey-dark'
                    }
                  >
                    ({orderCount})
                  </div>
                </div>
              </Radio.Button>
              <Radio.Button
                value="Pending"
                onClick={() => filterStatus('PEN', 'Pending')}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    className={
                      defaultName === 'Pending' ? 'white' : 'text-grey-dark'
                    }
                  >
                    {' '}
                    Pending
                  </div>
                  <div
                    className={
                      defaultName === 'Pending' ? 'white' : 'text-grey-dark'
                    }
                  >
                    ({pendingCount})
                  </div>
                </div>
              </Radio.Button>
              <Radio.Button
                value="Confirmed"
                onClick={() => filterStatus('CON', 'Confirmed')}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    className={
                      defaultName === 'Confirmed' ? 'white' : 'text-grey-dark'
                    }
                  >
                    {' '}
                    Confirmed
                  </div>
                  <div
                    className={
                      defaultName === 'Confirmed' ? 'white' : 'text-grey-dark'
                    }
                  >
                    ({confirmedCount})
                  </div>
                </div>
              </Radio.Button>
              <Radio.Button
                value="In Packing"
                onClick={() => filterStatus('INP', 'In Packing')}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    className={
                      defaultName === 'In Packing' ? 'white' : 'text-grey-dark'
                    }
                  >
                    {' '}
                    In Packing
                  </div>
                  <div
                    className={
                      defaultName === 'In Packing' ? 'white' : 'text-grey-dark'
                    }
                  >
                    ({progressCount})
                  </div>
                </div>
              </Radio.Button>
              <Radio.Button
                value="Dispatched"
                onClick={() => filterStatus('DIS', 'Dispatched')}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    className={
                      defaultName === 'Dispatched' ? 'white' : 'text-grey-dark'
                    }
                  >
                    {' '}
                    Dispatched
                  </div>
                  <div
                    className={
                      defaultName === 'Dispatched' ? 'white' : 'text-grey-dark'
                    }
                  >
                    ({dispatchedCount})
                  </div>
                </div>
              </Radio.Button>
              <Radio.Button
                value="Delivered"
                onClick={() => filterStatus('DEL', 'Delivered')}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    className={
                      defaultName === 'Delivered' ? 'white' : 'text-grey-dark'
                    }
                  >
                    {' '}
                    Delivered
                  </div>
                  <div
                    className={
                      defaultName === 'Delivered' ? 'white' : 'text-grey-dark'
                    }
                  >
                    ({deliveredCount})
                  </div>
                </div>
              </Radio.Button>
              <Radio.Button
                value="Cancelled"
                onClick={() => filterStatus('CAN', 'Cancelled')}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    className={
                      defaultName === 'Cancelled' ? 'white' : 'text-grey-dark'
                    }
                  >
                    {' '}
                    Cancelled
                  </div>
                  <div
                    className={
                      defaultName === 'Cancelled'
                        ? 'white text-align-center'
                        : 'text-grey-dark text-align-center'
                    }
                  >
                    ({cancelledCount})
                  </div>
                </div>
              </Radio.Button>
              <Radio.Button
                value="Checkout"
                onClick={() => filterStatus('CHK', 'Checkout')}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    className={
                      defaultName === 'Checkout' ? 'white' : 'text-grey-dark'
                    }
                  >
                    {' '}
                    Checkout
                  </div>
                  <div
                    className={
                      defaultName === 'Checkout' ? 'white' : 'text-grey-dark'
                    }
                  >
                    ({checkoutCount})
                  </div>
                </div>
              </Radio.Button>
              <Radio.Button
                value="Request"
                onClick={() => filterStatus('REQ', 'Request')}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    className={
                      defaultName === 'Request' ? 'white' : 'text-grey-dark'
                    }
                  >
                    {' '}
                    Cancel Request
                  </div>
                  <div
                    className={
                      defaultName === 'Request' ? 'white' : 'text-grey-dark'
                    }
                  >
                    ({requestCount})
                  </div>
                </div>
              </Radio.Button>
            </Radio.Group>
          </div>
        </Space>
      </div>
    );
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    fetchShipmentMethod();
  };

  const handleSave = () => {
    setIsModalVisible(false);
    if (
      get(shipmentMethod, 'slug', '') === SHIPMENT_METHOD_SLUG_SELF &&
      !isEmpty(orderRecord)
    ) {
      const shipmentMethodID = get(shipmentMethod, 'shipment_method_id', '');
      setIsVisibleSelfShipment(true);
      setShipmentMethodId(shipmentMethodID);
    } else if (
      get(shipmentMethod, 'slug', '') === SHIPMENT_METHOD_SLUG_DELHIVERY
    ) {
      setCreateShiprocket(true);
    } else if (
      get(shipmentMethod, 'slug', '') === SHIPMENT_METHOD_SLUG_SHIPPO
    ) {
      setCreateShippo(true);
    } else {
      setCreateShiprocket(true);
    }
  };

  const showDrawer = () => {
    if (shipmentMethod.method_name === 'Shiprocket' && !shipmentMethod.email) {
      setHandleBasic(true);
    } else if (
      shipmentMethod.method_name === 'Shiprocket' &&
      !shipmentMethod.is_active
    ) {
      setHandleBasic(true);
    } else if (
      shipmentMethod.method_name === 'Delhivery' &&
      !shipmentMethod.api_token
    ) {
      setHandleBasic(true);
    } else if (
      shipmentMethod.method_name === 'Delhivery' &&
      !shipmentMethod.is_active
    ) {
      setHandleBasic(true);
    } else if (
      shipmentMethod.method_name === 'Shippo' &&
      !shipmentMethod.api_token
    ) {
      setHandleBasic(true);
    } else if (
      shipmentMethod.method_name === 'Shippo' &&
      !shipmentMethod.is_active
    ) {
      setHandleBasic(true);
    } else {
      handleSave();
    }
    setIsModalVisible(false);
  };

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };

  const handleOnChange = (event) => {
    const { value } = event.target;
    const shipment = shipmentMethods.find(
      (data) => data.shipment_method_id === value
    );
    setShipmentMethod(shipment);
  };

  function completeTour() {
    if (openTourModal) {
      putOnboardSubGuide({
        completed: true,
        slug: 'orders',
      });
    }
  }

  const CloseModalSelfShipment = () => {
    setIsVisibleSelfShipment(false);
  };

  const createSelfShipment = async (values) => {
    const trimFormValues = {};
    trimPayloadFields(values, trimFormValues);
    const parameters = {
      order_id: orderId,
      order_uid: orderUID,
      shipment_method_id: shipmentMethodId,
      user_uid: userID,
      ...trimFormValues,
    };
    if (isChecked) {
      setIsSaveLoading(true);
    }
    createSelfShipmentOrder(parameters)
      .then((response) => {
        notification.success({
          message: response.message || SELF_SHIPMENT_CREATE_SUCCESS,
        });
        form.resetFields();
        setIsVisibleSelfShipment(false);
        setIsModalVisible(false);
        if (isChecked) {
          fetchData({ pagination });
          setIsSaveLoading(false);
        } else setIsKanbanOrder(true);
      })
      .catch((error) => {
        notification.error({
          message: error.message || SELF_SHIPMENT_CREATE_FAILED,
        });
        setIsSaveLoading(false);
      });
  };

  const handleDispatch = () => {
    setIsModalVisible(false);
    if (
      get(shipmentMethod, 'slug', '') === SHIPMENT_METHOD_SLUG_SELF &&
      !isEmpty(orderRecord)
    ) {
      const shipmentMethodID = get(shipmentMethod, 'shipment_method_id', '');
      setShipmentMethodId(shipmentMethodID);
    }
  };

  const getOrderHeader = () => {
    return (
      <>
        <div className={!isChecked && 'order-heading'}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <Order />
                <div className="heading">Orders</div>
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className={!isChecked && 'order-search'}>
          <Input
            allowClear
            placeholder="Search"
            onChange={(event_) => globalSearch(event_.target.value)}
            className="custom-search"
            suffix={<SearchOutlined className="site-form-item-icon" />}
          />
        </div>
        <div className={`orders-switch ${!isChecked && 'order-switch'}`}>
          {/* <Switch
            defaultChecked={false}
            checked={isChecked}
            checkedChildren="List"
            unCheckedChildren="Kanban"
            onChange={switchChange}
            style={{ backgroundColor: '#664BEB' }}
          /> */}
        </div>
      </>
    );
  };

  const handleHeaderVisible = () => {
    if (isChecked) {
      return getOrderHeader();
    }
    return <div className="order-header">{getOrderHeader()}</div>;
  };

  const getCreateOrderMessage = () => {
    const methodSlug = get(shipmentMethod, 'slug', '');

    switch (methodSlug) {
      case SHIPMENT_METHOD_SLUG_SHIPPO: {
        return 'Create Shippo Order';
      }
      case SHIPMENT_METHOD_SLUG_DELHIVERY: {
        return 'Create Delhivery Order';
      }
      default: {
        return 'Create Shiprocket Order';
      }
    }
  };

  return (
    <Spin spinning={loading} tip={downloadText}>
      <Drawer
        className="shipment-drawer"
        visible={createShiprocket || createShippo}
        title={getCreateOrderMessage()}
        onClose={onClose}
        width={620}
        destroyOnClose
        maskClosable={false}
      >
        <Shipment
          formOrders
          onClose={onClose}
          orderId={orderUID}
          refresh={refresh}
          shipmentMethod={shipmentMethod}
          fetchShipmentMethod={fetchShipmentMethod}
        />
      </Drawer>
      <Drawer
        className="shipment-first-drawer"
        width={600}
        title={
          get(shipmentMethod, 'slug', '') === SHIPMENT_METHOD_SLUG_DELHIVERY
            ? 'Delhivery Order'
            : 'Shiprocket Order'
        }
        placement="right"
        onClose={onClose}
        open={handleBasic}
      >
        {get(shipmentMethod, 'slug', '') === 'shiprocket' ? (
          <FirstShipRocketUser
            handleSave={handleSave}
            setHandleBasic={setHandleBasic}
          />
        ) : (
          <FirstDelhiveryUser
            setHandleBasic={setHandleBasic}
            handleSave={handleSave}
          />
        )}
      </Drawer>
      {isVisibleSelfShipment && (
        <Modal
          className="shipment-main-container"
          title="Self Shipment"
          visible={isVisibleSelfShipment}
          destroyOnClose
          footer={false}
          handleCancel={CloseModalSelfShipment}
          onCancel={CloseModalSelfShipment}
        >
          <Form
            form={form}
            name="self_shipment"
            {...layout}
            autoComplete="off"
            onFinish={createSelfShipment}
            layout="vertical"
          >
            <div className="shipment-main-container">
              <div className="shipment-span">
                <Form.Item
                  label="Courier Service Name"
                  name="courier_service_name"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter courier service name',
                    },
                  ]}
                >
                  <Input placeholder="Enter Courier service name" />
                </Form.Item>
              </div>
              <div className="shipment-span">
                <Form.Item label="Order Tracking ID" name="tracking_id">
                  <Input placeholder="Enter the Tracking Id" />
                </Form.Item>
              </div>
              <div className="shipment-span">
                <Form.Item
                  label="Order Tracking URL"
                  name="tracking_url"
                  rules={[
                    {
                      type: 'url',
                      warningOnly: true,
                      message: 'Please enter valid url',
                    },
                  ]}
                >
                  <Input placeholder="https://www.yourtrackinglink.com/" />
                </Form.Item>
              </div>
            </div>
            <Form.Item {...tailLayout} className="mt-3rem">
              <Button
                type="primary"
                size="small"
                className="save-prdt-btn mr-30"
                htmlType="submit"
                loading={isSaveLoading}
              >
                save
              </Button>
              <Button
                htmlType="button"
                className="cancel-prdt-btn"
                onClick={CloseModalSelfShipment}
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
      {mobileView ? (
        <>
          <OrderMobileView
            filterData={filterData}
            tenantDetails={tenantDetails}
            handleDropDown={handleDropDown}
            downloadExcel={downloadExcel}
            singleOrderPdf={singleOrderPdf}
            pagination={pagination}
            handleTableChange={handleTableChange}
            filterReset={filterReset}
            filterStatus={filterStatus}
            orderTitle={orderTitle}
            setActiveKey={setActiveKey}
            activeKey={activeKey}
            shiprocketOrderButton={shiprocketOrderButton}
            menuValue={menuValue}
            menuChange={menuChange}
            selectOptionData={selectOptionData}
            handleDateRangeChange={handleDateRangeChange}
            multipleOrderPDF={multipleOrderPDF}
            downloadOrderExcel={downloadOrderExcel}
            setSelectedID={setSelectedID}
            setEditStatusData={setEditStatusData}
            setVisible={setVisible}
            setOrderUID={setOrderUID}
            setStoreUID={setStoreUID}
            handleEditStatus={handleEditStatus}
            setOrderId={setOrderId}
            setOrderRecord={setOrderRecord}
            setIsModalVisible={setIsModalVisible}
            isKanbanOrder={isKanbanOrder}
            setIsKanbanOrder={setIsKanbanOrder}
            handleDispatch={handleDispatch}
          />
          <Modal
            className="order-inpacking-modal"
            visible={visible}
            onClose={onClose}
            maskClosable={false}
            closable={false}
            footer={false}
            header={false}
          >
            <OrderInpacking
              orderUID={orderUID}
              storeUID={storeUID}
              onClose={onClose}
              handleEditStatus={handleEditStatus}
              editStatusData={editStatusData}
            />
          </Modal>

          {!isEmpty(shipmentMethods) && (
            <Modal
              title="Select Shipment Method"
              visible={isModalVisible}
              okText={handleShipmentMethod(get(shipmentMethod, 'slug', ''))}
              destroyOnClose
              onOk={showDrawer}
              handleCancel={handleCancel}
              onCancel={handleCancel}
              className="shipment-method"
            >
              <Radio.Group
                className="select-shipment-container"
                onChange={handleOnChange}
                value={get(shipmentMethod, 'shipment_method_id', '')}
              >
                {shipmentMethods.map((item) => (
                  <div
                    style={{ display: 'flex', flexDirection: 'column' }}
                    className="shipmentradio"
                    key={item.shipment_method_id}
                  >
                    <Radio
                      value={item.shipment_method_id}
                      key={item.shipment_method_id}
                    >
                      {item.method_name}
                    </Radio>
                  </div>
                ))}
              </Radio.Group>
            </Modal>
          )}
        </>
      ) : (
        <>
          <Tour
            steps={TourSteps}
            isOpen={openTourModal}
            onRequestClose={() => {
              setOpenTourModal(false);
              completeTour();
            }}
            disableFocusLock
            accentColor="#38523B"
            closeWithMask={false}
          />
          <div
            className={`search-container ${handleOrderSearchContent(
              isChecked
            )}`}
          >
            {handleHeaderVisible()}
          </div>

          {isChecked ? (
            <>
              <div
                className="dropDowndiv"
                style={{ padding: '0rem 1rem 1rem 1rem' }}
              >
                <Space wrap>
                  <Select
                    value={menuValue}
                    virtual={false}
                    style={{
                      width: 300,
                      marginLeft: '2rem',
                    }}
                    onChange={menuChange}
                    options={selectOptionData}
                    allowClear
                    placeholder="All"
                  />
                  <div>
                    {menuValue === 'Customize' && (
                      <RangePicker onChange={handleDateRangeChange} />
                    )}
                  </div>
                </Space>
              </div>
              <div className="box">
                <div className="one">
                  <div className="box-head">
                    <div className="filter-orders-mobile">
                      <Popover
                        content={filterOrders()}
                        trigger="click"
                        placement="bottomLeft"
                      >
                        <FilterOutlined />
                      </Popover>
                    </div>
                    <div className="filter-orders-desktop">
                      {filterOrders()}
                    </div>
                    <div className="filter-types-mobile" />
                  </div>
                  {shiprocketOrderButton && (
                    <div className="flex-end m-5 mr-10">
                      <Button
                        type="primary"
                        onClick={() => navigate('/shiprocket/orders')}
                      >
                        Shiprocket Order
                      </Button>
                    </div>
                  )}
                  {orderKey.length > 0 && (
                    <div className="box__header flex-end">
                      <Dropdown
                        overlay={
                          <Menu>
                            <Menu.Item onClick={multipleOrderPDF}>
                              <Pdf /> Download PDF
                            </Menu.Item>
                            <Menu.Item onClick={downloadOrderExcel}>
                              <MicrosoftExcel /> Download Excel
                            </Menu.Item>
                          </Menu>
                        }
                        placement="bottomRight"
                        arrow
                      >
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          disabled={downloadButton}
                          className="download-primary"
                        >
                          {downloadButton ? 'Downloading' : 'Download'}
                        </Button>
                      </Dropdown>
                    </div>
                  )}
                </div>
                <div className="two">
                  <div className="box__content p-0" style={{ padding: 10 }}>
                    <Space style={{ marginBottom: 16 }} />
                    <Table
                      className="grid-table orders-main-table"
                      columns={categoryColumns}
                      dataSource={filterData}
                      rowSelection={rowSelection}
                      pagination={pagination}
                      rowKey="order_hdr_id"
                      onChange={handleTableChange}
                      scroll={{ x: 780 }}
                      locale={{
                        emptyText: (
                          <div style={{ textAlign: 'center' }}>
                            <EmptyData />
                          </div>
                        ),
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Kanban
              singleOrderPdf={singleOrderPdf}
              downloadExcel={downloadExcel}
              multipleOrderPDF={multipleOrderPDF}
              downloadOrderExcel={downloadOrderExcel}
              setSelectedID={setSelectedID}
              shiprocketOrderButton={shiprocketOrderButton}
              setEditStatusData={setEditStatusData}
              setVisible={setVisible}
              setOrderUID={setOrderUID}
              setStoreUID={setStoreUID}
              handleEditStatus={handleEditStatus}
              setOrderId={setOrderId}
              setOrderRecord={setOrderRecord}
              setIsModalVisible={setIsModalVisible}
              isKanbanOrder={isKanbanOrder}
              setIsKanbanOrder={setIsKanbanOrder}
            />
          )}

          <Drawer
            title="Orders Inpacking details"
            visible={visible}
            onClose={onClose}
            width={800}
            maskClosable={false}
          >
            <OrderInpacking
              orderUID={orderUID}
              storeUID={storeUID}
              onClose={onClose}
              handleEditStatus={handleEditStatus}
              editStatusData={editStatusData}
            />
          </Drawer>
          {!isEmpty(shipmentMethods) && (
            <Modal
              className="shipment-radio-modal"
              title="Select Shipment Method"
              visible={isModalVisible}
              okText={
                get(shipmentMethod, 'slug', '') === 'self'
                  ? 'Dispatched'
                  : 'Next'
              }
              destroyOnClose
              onOk={showDrawer}
              handleCancel={handleCancel}
              onCancel={handleCancel}
              style={{
                width: '500px',
                height: '201px',
              }}
            >
              <Radio.Group
                className="select-shipment-container"
                onChange={handleOnChange}
                value={get(shipmentMethod, 'shipment_method_id', '')}
              >
                {shipmentMethods.map((item) => (
                  <div
                    style={{ display: 'flex', flexDirection: 'column' }}
                    className="shipmentradio"
                    key={item.shipment_method_id}
                  >
                    <Radio
                      value={item.shipment_method_id}
                      key={item.shipment_method_id}
                    >
                      {item.method_name}
                    </Radio>
                  </div>
                ))}
              </Radio.Group>
            </Modal>
          )}
          {isVisibleSelfShipment && (
            <Modal
              className="shipment-main-container"
              title="Self Shipment"
              visible={isVisibleSelfShipment}
              destroyOnClose
              footer={false}
              handleCancel={CloseModalSelfShipment}
              onCancel={CloseModalSelfShipment}
            >
              <Form
                form={form}
                name="self_shipment"
                {...layout}
                autoComplete="off"
                onFinish={createSelfShipment}
                layout="vertical"
              >
                <div className="shipment-main-container">
                  <div className="shipment-span">
                    <Form.Item
                      label="Courier Service Name"
                      name="courier_service_name"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter courier service name',
                        },
                      ]}
                    >
                      <Input placeholder="Enter Courier service name" />
                    </Form.Item>
                  </div>
                  <div className="shipment-span">
                    <Form.Item label="Order Tracking ID" name="tracking_id">
                      <Input placeholder="Enter the Tracking Id" />
                    </Form.Item>
                  </div>
                  <div className="shipment-span">
                    <Form.Item
                      label="Order Tracking URL"
                      name="tracking_url"
                      rules={[
                        {
                          type: 'url',
                          warningOnly: true,
                          message: 'Please enter valid url',
                        },
                      ]}
                    >
                      <Input placeholder="https://www.yourtrackinglink.com/" />
                    </Form.Item>
                  </div>
                </div>
                <Form.Item {...tailLayout} className="mt-3rem">
                  <Button
                    type="primary"
                    size="small"
                    className="save-prdt-btn mr-30"
                    htmlType="submit"
                    loading={isSaveLoading}
                  >
                    save
                  </Button>
                  <Button
                    htmlType="button"
                    className="cancel-prdt-btn"
                    onClick={CloseModalSelfShipment}
                  >
                    Cancel
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          )}
          <Drawer
            className="shipment-drawer"
            visible={createShiprocket}
            title={handleShipmentDrawer(get(shipmentMethod, 'slug', ''))}
            onClose={onClose}
            width={620}
            destroyOnClose
            maskClosable={false}
          >
            <Shipment
              formOrders
              onClose={onClose}
              orderId={orderUID}
              refresh={refresh}
              shipmentMethod={shipmentMethod}
            />
          </Drawer>
          <Drawer
            className="shipment-first-drawer"
            width={600}
            title={handleShipmentFirstDrawer(get(shipmentMethod, 'slug', ''))}
            placement="right"
            onClose={onClose}
            open={handleBasic}
          >
            {shipmentMethod.slug === 'shiprocket' ? (
              <FirstShipRocketUser
                handleSave={handleSave}
                setHandleBasic={setHandleBasic}
              />
            ) : (
              <FirstDelhiveryUser
                setHandleBasic={setHandleBasic}
                handleSave={handleSave}
              />
            )}
          </Drawer>
        </>
      )}
    </Spin>
  );
}

export default Orders;
