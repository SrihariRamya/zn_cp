/* eslint-disable no-restricted-syntax */
import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  Col,
  Row,
  DatePicker,
  Table,
  Spin,
  Button,
  notification,
  Dropdown,
  Menu,
  Progress,
  Select,
  List,
  Typography,
  Tooltip as Tooltips,
  Carousel,
} from 'antd';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { get, groupBy, isEmpty, map, round, size, sum } from 'lodash';
import moment from 'moment';
import {
  DownloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import {
  FAILED_TO_LOAD,
  PAGE_LIMIT,
  CURRENCYSYMBOLS,
  selectOptionData,
  DOWNLOAD_EXCEL_FAILED_MESSAGE,
} from '../../shared/constant-values';
import {
  getCategory,
  getOrderByAdmin,
  getOrderDate,
  getProductOrders,
  getCustomer,
  getOrderCustomerDate,
  getProductOrderDate,
  getAllOrderCount,
  getCustomerType,
  getBagCount,
  getTopProduct,
  getAllOrderDetails,
  getFilterCustomer,
} from '../../utils/api/url-helper';
import './dashboard.less';
import ExcelDownloads from '../../shared/excel';
import { getFilterData } from '../../shared/table-helper';
import OnboardGuide from './onboard-guide';
import { TenantContext } from '../context/tenant-context';
import {
  downloadImage,
  endDateCondition,
  eventTrack,
  orderEndDate,
  orderStartDate,
  shortenValues,
  startDateCondition,
} from '../../shared/function-helper';
import topSelling from '../../assets/images/top_selling.svg';
import orderStatusImg from '../../assets/images/order_status.svg';
import NewUserIcon from '../../assets/images/new-user.svg';
import BagIcon from '../../assets/images/bag_icon.png';
import NoImage from '../../assets/images/no-image.png';
import EmptyTable from '../../shared/empty-table';
import EmptyData from '../../shared/empty-data';
import AbandonedCartBox from './abandoned-cart-box';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const { RangePicker } = DatePicker;

const selectOption = (data) => [
  {
    id: 0,
    value: 'yester_day',
    count: 1,
    timePeriod: 'ordered_hour',
    label: 'Yesterday',
    cardName: data?.cardName,
  },
  {
    id: 1,
    value: 'today',
    count: 1,
    timePeriod: 'ordered_hour',
    label: 'Today',
    cardName: data?.cardName,
  },
  {
    id: 2,
    value: 'last_week',
    count: 7,
    timePeriod: 'ordered_day',
    label: 'Last Week',
    cardName: data?.cardName,
  },
  {
    id: 3,
    value: 'last_month',
    count: 30,
    timePeriod: 'ordered_day',
    label: 'Last Month',
    cardName: data?.cardName,
  },
  {
    id: 4,
    value: 'last_year',
    count: 365,
    timePeriod: 'ordered_month',
    label: 'Last Year',
    cardName: data?.cardName,
  },
  {
    id: 5,
    value: 'customize',
    label: 'Customize',
  },
];

const createGradientColor = () => {
  const getColor = document.createElement('canvas').getContext('2d');
  const gradient = getColor.createLinearGradient(0, 0, 0, 80);
  gradient.addColorStop(0, '#0B3D60');
  gradient.addColorStop(1, 'rgba(11, 61, 96, 0.30)');
  return gradient;
};
const createGradientColor2 = () => {
  const getColor = document.createElement('canvas').getContext('2d');
  const gradient = getColor.createLinearGradient(0, 0, 0, 90);
  gradient.addColorStop(0, '#C8BFE7');
  gradient.addColorStop(1, 'rgba(200, 191, 231, 0.2)');
  return gradient;
};

function StoreDashboard() {
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [orderResponse, setOrderResponse] = useState([]);
  const [salesResponse, setSalesResponse] = useState([]);
  const [avgOrderResponse, setAvgOrderResponse] = useState(0);
  const [orderPercentage, setOrderPercentage] = useState(0);
  const [salesPercentage, setSalesPercentage] = useState(0);
  const [avgOrderPercentage, setAvgOrderPercentage] = useState(0);
  const [customProductList, setCustomProductList] = useState({});
  const [dwnldProductList, setDwnldProductList] = useState({});
  const [dwnldCustomersList, setDwnldCustomersList] = useState({});
  const [categoryResponse, setCategoryResponse] = useState({});
  const [customCustomerList, setCustomCustomerList] = useState({});
  const [customOrderChart, setCustomOrderChart] = useState([]);
  const [customSalesChart, setCustomSalesChart] = useState([]);
  const [customUsersChart, setCustomUsersChart] = useState([]);
  const [totalOrderChart, setTotalOrderChart] = useState([]);
  const [totalSalesChart, setTotalSalesChart] = useState([]);
  const [totalAvgOrderChart, setTotalAvgOrderChart] = useState([]);
  const [customerCurrentValue, setCustomerCurrentValue] = useState(1);
  const [productCurrentValue, setProductCurrentValue] = useState(1);
  const [customerPagination, setCustomerPagination] = useState({
    current: 1,
    pageSize: PAGE_LIMIT,
  });
  const [productPagination, setProductPagination] = useState({
    current: 1,
    pageSize: PAGE_LIMIT,
  });
  const [customerFilterDate, setCustomerFilterDate] = useState('');
  const [productFilterDate, setProductFilterDate] = useState('');
  const [initialCount, setInitialCount] = useState({});
  const [filterValue, setFilterValue] = useState({});
  const [productFilter, setProductFilter] = useState({});
  const [customerSorter, setCustomerSorter] = useState({
    columnKey: 'total_orders',
    order: 'descend',
  });
  const [productSorter, setProductSorter] = useState({
    columnKey: 'orders_count',
    order: 'descend',
  });
  const tenantDetails = useContext(TenantContext)[0];
  const tenantConfig = useContext(TenantContext)[3];
  const mobileView = useContext(TenantContext)[4];
  const [currency, setCurrency] = useState('');
  const [currencyLocale, setCurrencyLocale] = useState('');
  const [onboardTotal, setOnboardTotal] = useState(0);
  const [orderStatus, setOrderStatus] = useState([]);
  const [customersType, setCustomersType] = useState({});
  const [totalOrderCusotmized, setTotalOrderCustomized] = useState(false);
  const [totalSalesCustomized, setTotalSalesCustomized] = useState(false);
  const [orderCustomized, setOrderCustomized] = useState(false);
  const [orderVsDateCustomized, setOrderVsDateCustomized] = useState(false);
  const [salesVsDateCustomized, setSalesVsDateCustomized] = useState(false);
  const [isCustomized, setIsCustomized] = useState(false);
  const [newUserCustomized, setNewUserCustomized] = useState(false);
  const [abandonedCustomized, setAbandonedCustomized] = useState(false);
  const [allFilterCustomized, setAllFilterCustomized] = useState(false);
  const [topSellingCustomized, setTopSellingCustomized] = useState(false);
  const [orderStatusCustomized, setOrderStatusCustomized] = useState(false);
  const [productsCustomized, setProductCustomized] = useState(false);
  const [customerDateCustomized, setCustomerDateCustomized] = useState(false);
  const [abandoned, setAbandoned] = useState({});
  const [topSellingList, setTopSellingList] = useState({});
  const [topSellingLoading, setTopSellingLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState('last_week');
  const [timePeriodCount, setTimePeriodCount] = useState({
    count: 7,
    timePeriod: 'ordered_day',
  });
  const [timePeriodCustomize] = useState('last_week');
  const [timePeriodCountCustomize] = useState({
    count: 7,
    timePeriod: 'ordered_day',
  });

  // Select State
  const [orderValue, setOrderValue] = useState();
  const [salesValue, setSalesValue] = useState();
  const [avgOrderValues, setAvgOrderValues] = useState();
  const [abandonedValue, setAbandonedValue] = useState();
  const [newUserValue, setNewUserValue] = useState();
  const [topSellingValue, setTopSellingValue] = useState();
  const [orderStatusValue, setOrderStatusValue] = useState();
  const [commonSelValue, setCommonSelValue] = useState();

  const [orderVsDate, setOrderVsDate] = useState();
  const [saleVsDate, setSaleVsDate] = useState();
  const [customerVsDate, setCustomerVsDate] = useState();
  const [sliderData, setSliderData] = useState([]);

  const orderChartReference = useRef();
  const salesChartReference = useRef();
  const customerChartReference = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    setCurrency(get(tenantDetails, 'setting.currency', ''));
    setCurrencyLocale(get(tenantDetails, 'setting.currency_locale', ''));
  }, [tenantDetails]);

  const fetchProductData = (parameters = {}) => {
    const {
      pagination: { pageSize, current },
      pagination,
    } = parameters;
    setTableLoading(true);
    getProductOrders({
      limit: pageSize,
      offset: current,
      filters: JSON.stringify(productFilter),
      sorter: JSON.stringify(productSorter),
      firstTableParams: 'zm_product_view',
    })
      .then((resp) => {
        setCustomProductList(get(resp, 'data', []));
        setProductPagination({
          ...pagination,
          total: get(resp, 'data.count', 0),
        });
        setLoading(false);
        setTableLoading(false);
      })
      .catch(() => {
        setCustomProductList({});
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const fetchAllProductData = () => {
    getProductOrders().then((response) => {
      setDwnldProductList(get(response, 'data', []));
    });
    getCustomer().then((response) => {
      setDwnldCustomersList(get(response, 'data', []));
    });
  };

  const fetchOrderProductsDate = (startDate, endDate, parameters = {}) => {
    const {
      pagination: { pageSize, current },
      pagination,
    } = parameters;

    let parameter = {
      limit: pageSize,
      offset: current,
      filters: JSON.stringify(productFilter),
      sorter: JSON.stringify(productSorter),
      firstTableParams: 'zm_product_view',
    };
    if (startDate && endDate) {
      parameter = {
        ...parameter,
        startDate,
        endDate,
      };
    }
    setTableLoading(true);
    getProductOrderDate(parameter)
      .then((resp) => {
        setCustomProductList(get(resp, 'data', []));
        setProductPagination({
          ...pagination,
          total: get(resp, 'data.count', 0),
        });
        setLoading(false);
        setTableLoading(false);
      })
      .catch(() => {
        setCustomProductList({ count: 0, rows: [] });
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const fetchOrderCustomerDate = (startDate, endDate, parameters = {}) => {
    const {
      pagination: { pageSize, current },
      pagination,
    } = parameters;
    let parameter = {
      milestone_code: 'CHK,CAN',
      limit: pageSize,
      offset: current,
      filters: JSON.stringify(filterValue),
      sorter: JSON.stringify(customerSorter),
      firstTableParams: 'zm_order_view',
    };
    if (startDate && endDate) {
      parameter = {
        ...parameter,
        startDate,
        endDate,
      };
    }
    getOrderCustomerDate(parameter)
      .then((resp) => {
        setCustomCustomerList(get(resp, 'data', []));
        setCustomerPagination({
          ...pagination,
          total: get(resp, 'data.count', []),
        });
        setLoading(false);
      })
      .catch(() => {
        setCustomCustomerList({ count: 0, rows: [] });
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const productFilterType = (value) => {
    if (value === 'customize') {
      setProductCustomized(true);
    } else {
      setProductCustomized(false);
    }
  };

  const productDateFilter = (date, value) => {
    const endDate = endDateCondition(date, value);
    const startDate = startDateCondition(date, value);
    setProductFilterDate({ startDate, endDate });
    if (startDate && endDate) {
      fetchOrderProductsDate(startDate, endDate, {
        pagination: {
          ...customerPagination,
          current: 1,
        },
      });
    }
  };

  const customerGraphFilter = (date) => {
    setLoading(true);
    let parameter = {
      roleName: 'Customer',
      milestone_code: 'CHK,CAN',
    };
    if (date) {
      parameter = {
        ...parameter,
        user_date_filter: true,
        date: JSON.stringify(date),
      };
    }
    parameter.type = 'customerDate';
    getCustomer(parameter)
      .then((resp) => {
        get(resp, 'data.rows', []).map((item) => {
          const creationDate = moment(get(item, 'creation_date', ''))
            .utc()
            .format('DD-MM-YYYY');
          return { ...item, creation_date: creationDate };
        });
        const userGroup = groupBy(get(resp, 'data.rows', ''), 'creation_date');

        const userDate = Object.keys(userGroup);
        const userGraphData = [];
        for (const itemDate of userDate) {
          const orderCount = size(userGroup[itemDate]);
          userGraphData.push({
            x: itemDate,
            y: orderCount,
          });
        }
        setCustomUsersChart(userGraphData);
        setLoading(false);
      })
      .catch(() => {
        setCustomUsersChart([]);
      });
  };

  const orderSalesGraphFilter = (date, filterType) => {
    setLoading(true);
    let parameter = { milestone_code: 'CHK,CAN' };
    if (date) {
      parameter = {
        ...parameter,
        date: JSON.stringify(date),
      };
    }
    getOrderByAdmin(parameter)
      .then((resp) => {
        for (const item of resp.data.rows) {
          item.ordered_date = moment(item.creation_date)
            .utc()
            .format('DD-MM-YYYY');
          item.ordered_month = moment(item.creation_date)
            .utc()
            .format('MMMM-YYYY');
          item.ordered_year = moment(item.creation_date).utc().format('YYYY');
        }
        const orderGroup = groupBy(resp.data.rows, 'ordered_date');
        const orderDate = Object.keys(orderGroup);

        const orderGroupMonth = groupBy(resp.data.rows, 'ordered_month');
        const orderMonth = Object.keys(orderGroupMonth);

        const orderGroupYear = groupBy(resp.data.rows, 'ordered_month');
        const orderYear = Object.keys(orderGroupYear);

        const orderGraphData = [];
        const totalOrderGraphData = [];
        const salesGraphData = [];
        const totalSalesGraphData = [];
        const avgOrderGraphData = [];

        for (const itemDate of orderDate) {
          const orderCount = size(orderGroup[itemDate]);
          const orderSales = sum(
            orderGroup[itemDate].map((order) => order.total_price)
          );
          orderGraphData.push({
            x: itemDate,
            y: orderCount,
          });
          salesGraphData.push({
            x: itemDate,
            y: orderSales,
          });
        }
        for (const itemDate of orderMonth) {
          const orderCount = size(orderGroupMonth[itemDate]);
          const orderSales = sum(
            orderGroupMonth[itemDate].map((order) => order.total_price)
          );
          totalOrderGraphData.push({
            x: itemDate,
            y: orderCount,
          });
          totalSalesGraphData.push({
            x: itemDate,
            y: orderSales,
          });
        }
        for (const itemDate of orderYear) {
          const orderCount = size(orderGroupYear[itemDate]);
          const orderSales = sum(
            orderGroupYear[itemDate].map((order) => order.total_price)
          );
          avgOrderGraphData.push({
            x: itemDate,
            y: orderSales / orderCount,
          });
        }
        switch (filterType) {
          case 'orderFilter': {
            setCustomOrderChart(orderGraphData);

            break;
          }
          case 'salesFilter': {
            setCustomSalesChart(salesGraphData);

            break;
          }
          case 'avgOrderFilter': {
            setTotalAvgOrderChart(avgOrderGraphData);
            setAvgOrderResponse(sum(avgOrderGraphData.map((value) => value.y)));

            break;
          }
          case 'totalOrderFilter': {
            setTotalOrderChart(totalOrderGraphData);
            setOrderResponse(sum(totalOrderGraphData.map((value) => value.y)));

            break;
          }
          case 'totalSalesFilter': {
            setTotalSalesChart(totalSalesGraphData);
            setSalesResponse(sum(totalSalesGraphData.map((value) => value.y)));

            break;
          }
          default: {
            setCustomOrderChart(orderGraphData);
            setCustomSalesChart(salesGraphData);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        if (filterType === 'orderFilter') {
          setCustomOrderChart([]);
        } else if (filterType === 'salesFilter') {
          setCustomSalesChart([]);
        } else {
          setCustomOrderChart([]);
          setCustomSalesChart([]);
        }
      });
  };

  // This API call used to get order status data
  const orderStatusFilter = (value, data) => {
    setOrderStatusValue(value);
    const endDate = endDateCondition(value, data);
    const startDate = startDateCondition(value, data);
    if (startDate && endDate) {
      getAllOrderCount({ startDate, endDate }).then((resp) => {
        const allCount = sum(
          resp?.data?.orderStatus?.map((item) => {
            return item.count;
          })
        );
        const item = resp?.data?.orderStatus;
        const newItem = { count: allCount, milestone_description: 'All' };
        const updateItem = [...item, newItem];
        setOrderStatus(updateItem);
      });
    }
  };

  const AvgOrderCount = (value) => {
    const count = get(
      orderStatus.filter((index) => index.milestone_description === value),
      '[0].count',
      0
    );
    return count;
  };

  const statusCategories = [
    'Cancelled',
    'Checkout',
    'Confirmed',
    'Delivered',
    'Dispatched',
    'In Packing',
    'Pending',
    'Cancel Request',
    'All',
  ];

  const avgOrderStatus = statusCategories.map((status) => ({
    count: AvgOrderCount(status),
    milestone_description: status,
  }));

  const statusFliterType = (value) => {
    if (value === 'customize') {
      setOrderStatusCustomized(true);
    }
  };

  // This API call used to get new users data
  const customersTypeFilter = () => {
    getCustomerType().then((resp) => {
      setCustomersType(resp?.data);
    });
  };

  const adminUrl = get(tenantConfig, 'masterAdmin.master_url', '');
  const token = CryptoJS.AES.encrypt(
    `${get(tenantConfig, 'masterAdmin.MASTER_ADMIN_VALUE', '')}`,
    `${get(tenantConfig, 'masterAdmin.MASTER_ADMIN_SECRET', '')}`
  ).toString();
  const sliderFetchData = async () => {
    try {
      const getSliderData = await axios.get(
        `${adminUrl}slider-template?status=true`,
        {
          headers: {
            masteradminheader: `Bearer ${token}`,
          },
        }
      );
      if (getSliderData.data.success) {
        setSliderData(get(getSliderData, 'data.data', []));
      }
    } catch (error) {
      notification.error({
        message:
          error.message ||
          'Some error occurred while getting slider template details',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    customersTypeFilter();
    sliderFetchData();
  }, []);

  useEffect(() => {
    getCategory()
      .then((resp) => {
        setCategoryResponse(resp.data);
      })
      .catch(() => {
        setCategoryResponse({});
      });
  }, []);

  const handleNewUserChange = (value, data) => {
    setNewUserValue(value);
    const endDate = endDateCondition(value, data);
    const startDate = startDateCondition(value, data);
    getCustomerType({ startDate, endDate }).then((response_) => {
      setCustomersType(response_?.data);
    });
  };

  const userFilterType = (value) => {
    if (value === 'customize') {
      setNewUserCustomized(true);
    }
  };

  const handleAbandonedChanges = (value, data) => {
    setAbandonedValue(value);
    const endDate = endDateCondition(value, data);
    const startDate = startDateCondition(value, data);
    if (startDate && endDate) {
      getBagCount({ day: value, startDate, endDate }).then((result_) => {
        setAbandoned(result_?.data);
      });
    }
  };

  const abandonedSelectType = (value) => {
    if (value === 'customize') {
      setAbandonedCustomized(true);
    }
  };

  const handleTotalOrder = (value, data) => {
    switch (data?.cardName) {
      case 'total_orders': {
        setOrderValue(value);
        break;
      }
      case 'total_sales': {
        setSalesValue(value);
        break;
      }
      case 'avg_order_value': {
        setAvgOrderValues(value);
        break;
      }
      default: {
        break;
      }
    }

    if (value !== 'customize') {
      const endDate = orderEndDate(value);
      const startDate = orderStartDate(value, data);
      const pastDate = moment(startDate).subtract(data?.count, 'days').format();

      getOrderDate({ day: value, startDate, endDate, pastDate }).then(
        (response) => {
          for (const item of response.data.previousDates) {
            item.ordered_day = moment(item.creation_date)
              .utc()
              .format('DD/MMMM/YYYY');
            item.ordered_hour = moment(item.creation_date).format('hh a');
            item.ordered_month = moment(item.creation_date)
              .utc()
              .format('MMMM-YYYY');
            item.ordered_year = moment(item.creation_date).format('YYYY');
          }

          const percentageValue = response?.data?.orderPercentage;

          const orderGroup = groupBy(
            response?.data?.previousDates,
            data?.timePeriod
          );
          const orderDate = Object.keys(orderGroup);

          const orderGraphData = [];
          const salesGraphData = [];
          const avgOrderGraphData = [];

          for (const itemDate of orderDate) {
            const orderCount = size(orderGroup[itemDate]);
            const orderSales = sum(
              orderGroup[itemDate].map((order) => order?.total_price)
            );
            orderGraphData.push({
              x: itemDate,
              y: orderCount,
            });
            salesGraphData.push({
              x: itemDate,
              y: orderSales,
            });
            avgOrderGraphData.push({
              x: itemDate,
              y: orderSales / orderCount,
            });
          }

          if (response && !data?.cardName) {
            setOrderPercentage(percentageValue?.totalOrder);
            setSalesPercentage(percentageValue?.totalSales);
            setAvgOrderPercentage(percentageValue?.avgOrderValue);
            setOrderResponse(response?.data?.previousDates);
            setSalesResponse(
              sum(
                get(response?.data, 'previousDates', []).map((item) => {
                  return item?.total_price;
                })
              )
            );
            setAvgOrderResponse(percentageValue?.totalAvgOrderValue);
            setTotalOrderChart(orderGraphData);
            setTotalSalesChart(salesGraphData);
            setTotalAvgOrderChart(avgOrderGraphData);
          }
          switch (data?.cardName) {
            case 'total_orders': {
              setTotalOrderChart(orderGraphData);
              setOrderPercentage(percentageValue?.totalOrder);
              setOrderResponse(response?.data?.previousDates);
              break;
            }
            case 'total_sales': {
              setTotalSalesChart(salesGraphData);
              setSalesPercentage(percentageValue?.totalSales);
              setSalesResponse(
                sum(
                  get(response?.data, 'previousDates', []).map((item) => {
                    return item?.total_price;
                  })
                )
              );
              break;
            }
            case 'avg_order_value': {
              setTotalAvgOrderChart(avgOrderGraphData);
              setAvgOrderPercentage(percentageValue?.avgOrderValue);
              setAvgOrderResponse(percentageValue?.totalAvgOrderValue);
              break;
            }
            default: {
              break;
            }
          }
        }
      );
    }

    if (value === 'customize' && data?.cardName === 'total_orders') {
      setTotalOrderCustomized(true);
    } else {
      setTotalOrderCustomized(false);
    }
    if (value === 'customize' && data?.cardName === 'total_sales') {
      setTotalSalesCustomized(true);
    } else {
      setTotalSalesCustomized(false);
    }
    if (value === 'customize' && data?.cardName === 'avg_order_value') {
      setOrderCustomized(true);
    } else {
      setOrderCustomized(false);
    }
  };

  const avgFilterType = (value) => {
    if (value === 'customize') {
      setOrderCustomized(true);
    }
  };

  const totalOrderType = (value) => {
    if (value === 'customize') {
      setTotalOrderCustomized(true);
    }
  };

  const totalSaleType = (value) => {
    if (value === 'customize') {
      setTotalSalesCustomized(true);
    }
  };

  const handleOrderVsDate = (value, data) => {
    setOrderVsDate(value);
    if (value === 'customize') {
      setOrderVsDateCustomized(true);
    } else {
      const startDate = startDateCondition(value, data);
      const endDate = endDateCondition(value, data);
      getAllOrderDetails({ startDate, endDate }).then((response) => {
        // This is commen function Add time preiod date & time
        for (const item of response.data.orderDetails) {
          item.ordered_day = moment(item.creation_date)
            .utc()
            .format('DD/MMMM/YYYY');
          item.ordered_hour = moment(item.creation_date).format('hh a');
          item.ordered_month = moment(item.creation_date)
            .utc()
            .format('MMMM-YYYY');
          item.ordered_year = moment(item.creation_date).format('YYYY');
        }

        const orderGroup = groupBy(
          response?.data?.orderDetails,
          data?.timePeriod
        );
        const orderDate = Object.keys(orderGroup);

        const orderVsDateGraphData = [];

        for (const itemDate of orderDate) {
          const orderCount = size(orderGroup[itemDate]);
          orderVsDateGraphData.push({
            x: itemDate,
            y: orderCount,
          });
        }
        setCustomOrderChart(orderVsDateGraphData);
      });

      setOrderVsDateCustomized(false);
    }
  };

  const handleSalesVsDate = (value, data) => {
    setSaleVsDate(value);
    if (value === 'customize') {
      setSalesVsDateCustomized(true);
    } else {
      const startDate = startDateCondition(value, data);
      const endDate = endDateCondition(value, data);
      getAllOrderDetails({ startDate, endDate }).then((response) => {
        // This is commen function Add time preiod date & time
        for (const item of response.data.orderDetails) {
          item.ordered_day = moment(item.creation_date)
            .utc()
            .format('DD/MMMM/YYYY');
          item.ordered_hour = moment(item.creation_date).format('hh a');
          item.ordered_month = moment(item.creation_date)
            .utc()
            .format('MMMM-YYYY');
          item.ordered_year = moment(item.creation_date).format('YYYY');
        }

        const orderGroup = groupBy(
          response?.data?.orderDetails,
          data?.timePeriod
        );
        const orderDate = Object.keys(orderGroup);

        const salesVsDateGraphData = [];

        for (const itemDate of orderDate) {
          const orderSales = sum(
            orderGroup[itemDate].map((order) => order?.total_price)
          );
          salesVsDateGraphData.push({
            x: itemDate,
            y: orderSales,
          });
        }
        setCustomSalesChart(salesVsDateGraphData);
      });
      setSalesVsDateCustomized(false);
    }
  };

  const handleCustomerVsDate = (value, data) => {
    setCustomerVsDate(value);
    if (value === 'customize') {
      setIsCustomized(true);
    } else {
      const startDate = startDateCondition(value, data);
      const endDate = endDateCondition(value, data);

      getFilterCustomer({ startDate, endDate }).then((response) => {
        for (const item of response.data.customerDetails) {
          item.ordered_day = moment(item.creation_date)
            .utc()
            .format('DD/MMM/YYYY');
          item.ordered_hour = moment(item.creation_date).format('hh a');
          item.ordered_month = moment(item.creation_date)
            .utc()
            .format('MMM-YYYY');
          item.ordered_year = moment(item.creation_date).format('YYYY');
        }

        const customerGroup = groupBy(
          response?.data?.customerDetails,
          data?.timePeriod
        );
        const customerDate = Object.keys(customerGroup);

        const customerVsDateGraphData = [];

        for (const itemDate of customerDate) {
          const orderCount = size(customerGroup[itemDate]);
          customerVsDateGraphData.push({
            x: itemDate,
            y: orderCount,
          });
        }
        setCustomUsersChart(customerVsDateGraphData);
      });
      setIsCustomized(false);
    }
  };

  const handleTopSelling = (value, data) => {
    setTopSellingValue(value);
    setTopSellingLoading(true);
    const endDate = endDateCondition(value, data);
    const startDate = startDateCondition(value, data);
    getTopProduct({ startDate, endDate }).then((response) => {
      if (response) {
        setTopSellingLoading(false);
        setTopSellingList(response);
      }
    });
  };

  const topSellingProFilter = (value) => {
    if (value === 'customize') {
      setTopSellingCustomized(true);
    }
  };

  const fetchData = (parameters = {}) => {
    const {
      pagination: { pageSize, current },
      customerCount = false,
      pagination,
    } = parameters;
    getCustomer({
      limit: pageSize,
      offset: current,
      filters: JSON.stringify(filterValue),
      sorter: JSON.stringify(customerSorter),
      firstTableParams: 'zm_customer_view',
      customerCount,
      topCustomer: true,
    })
      .then((resp) => {
        setCustomCustomerList(get(resp, 'data', []));
        setCustomerPagination({
          ...pagination,
          total: get(resp, 'data.count', []),
        });
        if (customerCount) {
          setInitialCount(get(resp, 'data.customerCount', {}));
        }
        setLoading(false);
      })
      .catch(() => {
        setCustomCustomerList({});
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const customerFliterType = (value) => {
    if (value === 'customize') {
      setCustomerDateCustomized(true);
    } else {
      setCustomerDateCustomized(false);
    }
  };

  const customOrderFilter = (value) => {
    if (value === 'customize') {
      setOrderVsDateCustomized(true);
    }
  };
  const customSaleFilter = (value) => {
    if (value === 'customize') {
      setSalesVsDateCustomized(true);
    }
  };

  const customCustomerFilter = (value) => {
    if (value === 'customize') {
      setIsCustomized(true);
    }
  };

  const customerDateFilter = (date, value) => {
    const endDate = endDateCondition(date, value);
    const startDate = startDateCondition(date, value);
    setCustomerFilterDate({ startDate, endDate });
    if (startDate && endDate) {
      fetchOrderCustomerDate(startDate, endDate, {
        pagination: {
          ...customerPagination,
          current: 1,
        },
      });
    } else {
      fetchData({
        pagination: { pageSize: PAGE_LIMIT, current: 1 },
        customerCount: true,
      });
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData({
      pagination: {
        ...customerPagination,
        current: 1,
      },
      customerCount: true,
    });
  }, []);

  useEffect(() => {
    fetchAllProductData();
    orderStatusFilter(timePeriod, timePeriodCount);
    handleNewUserChange(timePeriod, timePeriodCount);
    handleAbandonedChanges(timePeriod, timePeriodCount);
    handleTopSelling(timePeriod, timePeriodCount);
    if (timePeriod === 'customize' && timePeriodCount.value !== 'customize') {
      orderSalesGraphFilter(timePeriodCount, 'avgOrderFilter');
      orderSalesGraphFilter(timePeriodCount, 'orderFilter');
      orderSalesGraphFilter(timePeriodCount, 'salesFilter');
      orderSalesGraphFilter(timePeriodCount, 'totalOrderFilter');
      orderSalesGraphFilter(timePeriodCount, 'totalSalesFilter');
      customerGraphFilter(timePeriodCount);
    } else {
      handleTotalOrder(timePeriod, timePeriodCount);
      handleOrderVsDate(timePeriod, timePeriodCount);
      handleSalesVsDate(timePeriod, timePeriodCount);
      handleCustomerVsDate(timePeriod, timePeriodCount);
      setIsCustomized(false);
      setOrderVsDateCustomized(false);
      setSalesVsDateCustomized(false);
      setOrderCustomized(false);
      setTotalOrderCustomized(false);
      setTotalSalesCustomized(false);
    }
  }, [timePeriod, timePeriodCount]);

  useEffect(() => {
    setLoading(true);
    fetchProductData({
      pagination: { ...customerPagination, current: 1 },
    });
  }, []);

  const handleAllFilter = (data, value) => {
    if (data !== 'customized') {
      setOrderStatusValue(data);
      setTopSellingValue(data);
      setAbandonedValue(data);
      setNewUserValue(data);
      setAvgOrderValues(data);
      setSalesValue(data);
      setOrderValue(data);
      setOrderVsDate(data);
      setSaleVsDate(data);
      setCustomerVsDate(data);
      setCommonSelValue(data);
      setTimePeriod(data);
      setTimePeriodCount(value);
    }
    if (value) setTimePeriodCount(value);
  };

  const commenFilterType = (data) => {
    if (data === 'customize') {
      setAllFilterCustomized(true);
    }
  };

  const orderObject = [
    {
      objname: 'Total Orders',
      objvalue: get(orderResponse, 'length', shortenValues(orderResponse)),
      objPersentage: orderPercentage?.toFixed(2) || 0,
      objname_two: 'Categories',
      objvalue_two: get(categoryResponse, 'count', 0),
      objname_three: 'Sub Categories',
      objvalue_three: sum(
        get(categoryResponse, 'rows', []).map((item) => {
          return item.sub_category.length;
        })
      ),
      cardName: 'total_orders',
    },
  ];

  const salesObject = [
    {
      objname: 'Total Sales',
      objvalue: shortenValues(salesResponse),
      objPersentage: salesPercentage?.toFixed(2) || 0,
      objname_two: 'Total Products',
      objvalue_two: get(categoryResponse, 'products', 0),
      objname_three: 'All Customers',
      objvalue_three: get(initialCount, 'All', 0),
      cardName: 'total_sales',
    },
  ];

  const categoryObject = [
    {
      objname: 'Avg. Order Value',
      objvalue: avgOrderResponse?.toFixed(2) || 0,
      objPersentage: avgOrderPercentage?.toFixed(2) || 0,
      objname_two: 'New Customers',
      objvalue_two: get(initialCount, 'New', 0),
      objPersentage_two: '11.95',
      objname_three: 'Return Customers ',
      objvalue_three: get(initialCount, 'Old', 0),
      objPersentage_three: '11.95',
      cardName: 'avg_order_value',
    },
  ];

  const customerObject = [
    {
      objname: 'All Customers',
      objvalue: get(customersType, 'all_customers', 0),
      objCount: get(customersType, 'all_customers', 0),
      color: 'blue',
    },
    {
      objname: 'New Customers (Not Signed In)',
      objvalue:
        (get(customersType, 'new_customers_not_sign_in', 0) /
          get(customersType, 'all_customers', 0)) *
        100,
      objCount: get(customersType, 'new_customers_not_sign_in', 0),
      color: 'red',
    },
    {
      objname: 'New Customers (Signed In)',
      objvalue:
        (get(customersType, 'new_customers_sign_in', 0) /
          get(customersType, 'all_customers', 0)) *
        100,
      objCount: get(customersType, 'new_customers_sign_in', 0),
      color: 'blue',
    },
    {
      objname: 'Return Customers',
      objvalue:
        (get(customersType, 'return_customers', 0) /
          get(customersType, 'all_customers', 0)) *
        100,
      objCount: get(customersType, 'return_customers', 0),
      color: 'red',
    },
  ];

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      title: {
        display: false,
        text: 'Chart.js Bar Chart',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
  };

  const barChartData = {
    labels: totalOrderChart.map((data) => get(data, 'x', '')),
    datasets: [
      {
        label: 'Total Orders',
        data: totalOrderChart.map((data) => get(data, 'y', '')),
        backgroundColor: createGradientColor(),
        borderRadius: 20,
        borderSkipped: false,
        barThickness: 12,
      },
    ],
  };

  const barChartDataTwo = {
    labels: totalSalesChart.map((data) => get(data, 'x', '')),
    datasets: [
      {
        label: 'Total Orders',
        data: totalSalesChart.map((data) => get(data, 'y', '')),
        backgroundColor: createGradientColor2(),
        borderRadius: 20,
        borderSkipped: false,
        barThickness: 12,
      },
    ],
  };

  const handleClickCloseIcon = (value) => {
    switch (value) {
      case 'avg': {
        setOrderCustomized(false);
        handleTotalOrder(timePeriodCustomize, timePeriodCountCustomize);
        break;
      }
      case 'abandoned': {
        setAbandonedCustomized(false);
        handleAbandonedChanges(timePeriodCustomize, timePeriodCountCustomize);
        break;
      }
      case 'common': {
        setAllFilterCustomized(false);
        handleAllFilter(timePeriodCustomize, timePeriodCountCustomize);
        break;
      }
      case 'users': {
        setNewUserCustomized(false);
        handleNewUserChange(timePeriodCustomize, timePeriodCountCustomize);
        break;
      }
      case 'topselling': {
        setTopSellingCustomized(false);
        handleTopSelling(timePeriodCustomize, timePeriodCountCustomize);
        break;
      }
      case 'orderstatus': {
        setOrderStatusCustomized(false);
        orderStatusFilter(timePeriodCustomize, timePeriodCountCustomize);
        break;
      }
      case 'ordervsdate': {
        setOrderVsDateCustomized(false);
        handleOrderVsDate(timePeriodCustomize, timePeriodCountCustomize);
        break;
      }
      case 'salesvsdate': {
        setSalesVsDateCustomized(false);
        handleSalesVsDate(timePeriodCustomize, timePeriodCountCustomize);
        break;
      }
      case 'customervsdate': {
        setIsCustomized(false);
        handleCustomerVsDate(timePeriodCustomize, timePeriodCountCustomize);
        break;
      }
      case 'totalOrder': {
        setTotalOrderCustomized(false);
        handleTotalOrder(timePeriodCustomize, timePeriodCountCustomize);
        break;
      }
      case 'totalSales': {
        setTotalSalesCustomized(false);
        handleTotalOrder(timePeriodCustomize, timePeriodCountCustomize);
        break;
      }
      default: {
        break;
      }
    }
  };

  const orderBox = (orderData) => {
    return orderData?.map((data) => (
      <div key={get(data, 'id', '')} className="store-detail-box">
        <Row>
          <Col span={12}>
            <div>
              <p className="title">{data?.objname}</p>
              <b className="value">{data?.objvalue}</b>&nbsp;&nbsp;
              <span
                className={
                  data?.objPersentage > 0
                    ? 'percentage-green'
                    : 'percentage-red'
                }
              >
                {data?.objPersentage >= 0 ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )}
                {data?.objPersentage === 0
                  ? data?.objPersentage
                  : data?.objPersentage.replace(/[^ A-Za-z]/, '')}
                %
              </span>
            </div>
          </Col>
          <Col span={12}>
            <div className="float-right">
              {totalOrderCusotmized === true ? (
                <div className="button">
                  <RangePicker
                    format="DD-MM-YYYY"
                    onChange={(date) =>
                      orderSalesGraphFilter(date, 'totalOrderFilter')
                    }
                  />
                  <CloseOutlined
                    onClick={() => handleClickCloseIcon('totalOrder')}
                    style={{ marginLeft: '5px' }}
                  />
                </div>
              ) : (
                <Select
                  defaultValue="last_week"
                  value={orderValue}
                  virtual={false}
                  className="select-common-cls"
                  dropdownClassName="select-dropdown-style"
                  onChange={handleTotalOrder}
                  options={selectOption(data)}
                  onSelect={totalOrderType}
                />
              )}
            </div>
          </Col>
        </Row>

        <div style={{ margin: '20px 0px' }}>
          <Bar
            options={options}
            data={barChartData}
            height="60px"
            className="bar-chart-dashboard"
          />
        </div>
        <div>
          <Row>
            <Col span={12}>
              <div>
                <p className="cat-title">{data?.objname_two}</p>
                <b className="cat-value">{data?.objvalue_two}</b>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <p className="cat-title">{data?.objname_three}</p>
                <b className="cat-value">{data?.objvalue_three}</b>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    ));
  };

  const salesBox = (orderData) => {
    return orderData?.map((data) => (
      <div key={get(data, 'id', '')} className="store-detail-box">
        <Row>
          <Col span={12}>
            <div>
              <p className="title">{data?.objname}</p>
              <b className="value">{data?.objvalue}</b>&nbsp;&nbsp;
              <span
                className={
                  data?.objPersentage > 0
                    ? 'percentage-green'
                    : 'percentage-red'
                }
              >
                {data?.objPersentage >= 0 ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )}{' '}
                {data?.objPersentage === 0
                  ? data?.objPersentage
                  : data?.objPersentage.replace(/[^ A-Za-z]/, '')}{' '}
                %
              </span>
            </div>
          </Col>
          <Col span={12}>
            <div className="float-right">
              {totalSalesCustomized === true ? (
                <div className="button">
                  <RangePicker
                    format="DD-MM-YYYY"
                    onChange={(date) =>
                      orderSalesGraphFilter(date, 'totalSalesFilter')
                    }
                  />
                  <CloseOutlined
                    onClick={() => handleClickCloseIcon('totalSales')}
                    style={{ marginLeft: '5px' }}
                  />
                </div>
              ) : (
                <Select
                  defaultValue="last_week"
                  value={salesValue}
                  virtual={false}
                  className="select-common-cls"
                  onChange={handleTotalOrder}
                  options={selectOption(data)}
                  onSelect={totalSaleType}
                />
              )}
            </div>
          </Col>
        </Row>

        <div style={{ margin: '20px 0px' }}>
          <Bar
            options={options}
            data={barChartDataTwo}
            height="60px"
            className="bar-chart-dashboard"
          />
        </div>
        <div>
          <Row>
            <Col span={12}>
              <div>
                <p className="cat-title">{data?.objname_two}</p>
                <b className="cat-value">{data?.objvalue_two}</b>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <p className="cat-title">{data?.objname_three}</p>
                <b className="cat-value">{data?.objvalue_three}</b>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    ));
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      title: {
        display: false,
        text: 'Chart.js Bar Chart',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: true,
        },
      },
      y: {
        grid: {
          display: true,
        },
        ticks: {
          display: true,
        },
      },
    },
  };

  const lineChartData = {
    labels: totalAvgOrderChart?.map((data) => get(data, 'x', '')),
    datasets: [
      {
        label: 'Avg Order Value',
        data: totalAvgOrderChart.map((data) => get(data, 'y', '')),
        backgroundColor: '#0B3D60',
        borderRadius: 20,
        borderSkipped: false,
        barThickness: 12,
      },
    ],
  };

  // This section using for Avg Order Value
  const orderValueBox = (orderData) => {
    return orderData?.map((data) => (
      <Col key={data.objname} xs={24} sm={24} md={24} lg={24} xl={24}>
        <div className="store-detail-box">
          <Row>
            <Col span={12}>
              <div>
                <p className="title">{data?.objname}</p>
                <b className="value">{data?.objvalue}</b>&nbsp;&nbsp;
                <span
                  className={
                    data?.objPersentage > 0
                      ? 'percentage-green'
                      : 'percentage-red'
                  }
                >
                  {data?.objPersentage >= 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )}{' '}
                  {data?.objPersentage === 0
                    ? data?.objPersentage
                    : data?.objPersentage.replace(/[^ A-Za-z]/, '')}{' '}
                  %
                </span>
              </div>
            </Col>
            <Col span={12}>
              <div className="float-right d-flex">
                <Select
                  defaultValue="last_week"
                  virtual={false}
                  className="select-common-cls"
                  value={avgOrderValues}
                  onChange={handleTotalOrder}
                  options={selectOption(data)}
                  onSelect={avgFilterType}
                />
                &nbsp;&nbsp;
                {orderCustomized === true ? (
                  <div className="button">
                    <RangePicker
                      format="DD-MM-YYYY"
                      onChange={(date) =>
                        orderSalesGraphFilter(date, 'avgOrderFilter')
                      }
                    />
                    <CloseOutlined
                      onClick={() => handleClickCloseIcon('avg')}
                      style={{ marginLeft: '5px' }}
                    />
                  </div>
                ) : undefined}
              </div>
            </Col>
          </Row>

          <Row style={mobileView ? { display: 'block' } : {}}>
            <Col span={mobileView ? 24 : 20}>
              <div style={{ margin: '20px 0px' }}>
                <Bar
                  data={lineChartData}
                  options={mobileView ? options : lineChartOptions}
                  height="60px"
                  className="bar-chart-dashboard"
                />
              </div>
            </Col>
            <Col span={mobileView ? 24 : 4}>
              <div
                style={mobileView ? { display: 'flex' } : { display: 'block' }}
              >
                <Col span={mobileView ? 12 : 24}>
                  <div>
                    <p className="avg-title">{data?.objname_two}</p>
                    <b className="cat-value">{data?.objvalue_two}</b>
                  </div>
                </Col>
                <Col span={mobileView ? 12 : 24}>
                  <div>
                    <p className="avg-title">{data?.objname_three}</p>
                    <b className="cat-value">{data?.objvalue_three}</b>
                  </div>
                </Col>
              </div>
            </Col>
          </Row>
        </div>
      </Col>
    ));
  };

  const newUserBox = (orderData) => {
    return orderData.map((data) => (
      <div key={get(data, 'id', '')} className="new-user-title">
        <Row>
          <Col span={14}>
            <p>{data?.objname}</p>
          </Col>
          <Col span={10}>
            <p
              style={{ color: data.color === 'blue' ? '#0B3D60' : '#C8BFE7' }}
              className="float-right"
            >
              {data?.objCount}
            </p>
          </Col>
        </Row>
        <Progress
          percent={data?.objvalue}
          type="line"
          strokeColor={data.color === 'blue' ? '#0B3D60' : '#C8BFE7'}
          strokeWidth={20}
          showInfo={false}
        />
      </div>
    ));
  };
  const handleClickProduct = () => {
    navigate('/products/add-product');
  };

  const orderStatusBox = (orderedStatus) => {
    return orderedStatus.length === 0 ? (
      <EmptyTable
        src={BagIcon}
        title="No Orders Yet?"
        description="Add products to your store and start selling to see orders here."
        onClick={handleClickProduct}
      />
    ) : (
      [...orderedStatus].reverse().map((data) => (
        <Col key={data} xs={12} sm={12} md={12} lg={12} xl={12}>
          <div className="order-status-box">
            <Row>
              <Col span={8}>
                <p className="ord-stus-title">{data?.count}</p>
              </Col>
              <Col span={16}>
                <p className="ord-stus-value">{data?.milestone_description}</p>
              </Col>
            </Row>
          </div>
        </Col>
      ))
    );
  };

  const productColumns = [
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'productName',
      width: 250,
      ellipsis: true,
      sorter: true,
      render: (name) => <span className="text-grey-light">{name}</span>,
      ...getFilterData(
        'Product Name',
        'product_name',
        'text',
        setProductFilter,
        productFilter
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category',
      ellipsis: true,
      sorter: true,
      render: (category) => <span className="text-grey-light">{category}</span>,
      ...getFilterData(
        'Category',
        'category_name',
        'text',
        setProductFilter,
        productFilter
      ),
    },
    {
      title: 'Brand',
      dataIndex: 'product_brand',
      key: 'brand',
      ellipsis: true,
      sorter: true,
      render: (brand) => (
        <span className="text-grey-light">{brand || '-'}</span>
      ),
      ...getFilterData(
        'Brand',
        'product_brand',
        'text',
        setProductFilter,
        productFilter
      ),
    },
    {
      title: 'Orders',
      dataIndex: 'orders_count',
      key: 'orders',
      sorter: true,
      ellipsis: true,
      render: (order) => <span className="text-grey-light">{order}</span>,
    },
    {
      title: 'Qty.',
      dataIndex: 'orders_quantity',
      key: 'quantity',
      ellipsis: true,
      sorter: true,
      render: (quantity) => <span className="text-grey-light">{quantity}</span>,
    },
    {
      title: 'Sales',
      dataIndex: 'orders_sales',
      key: 'sales',
      ellipsis: true,
      sorter: true,
      render: (amount) => (
        <span className="text-grey-light">
          <CurrencyFormatter
            value={amount}
            type={currency}
            language={currencyLocale}
          />
        </span>
      ),
    },
  ];

  const customerColumns = [
    {
      title: 'Customer Name',
      dataIndex: 'user_name',
      key: 'productName',
      ellipsis: true,
      sorter: true,
      render: (name) => <span className="text-grey-light">{name}</span>,
      ...getFilterData(
        'Customer Name',
        'user_name',
        'text',
        setFilterValue,
        filterValue
      ),
    },
    {
      title: 'Orders',
      dataIndex: 'total_orders',
      key: 'orders',
      ellipsis: true,
      sorter: true,
      render: (order) => <span className="text-grey-light">{order}</span>,
    },
    {
      title: 'Sales',
      dataIndex: 'total_sales',
      key: 'sales',
      ellipsis: true,
      sorter: true,
      render: (amount) => (
        <span className="text-grey-light">
          <CurrencyFormatter
            value={amount}
            type={currency}
            language={currencyLocale}
          />
        </span>
      ),
    },
  ];

  const topSellingColumns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      render: (productName) => (
        <span className="text-grey-light">{productName}</span>
      ),
    },
    {
      title: 'Orders',
      dataIndex: 'orders_count',
    },
    {
      title: 'Qty',
      dataIndex: 'orders_quantity',
    },
    {
      title: 'Sales',
      dataIndex: 'orders_sales',
      render: (amount) => (
        <span className="text-grey-light">
          <CurrencyFormatter
            value={amount}
            type={currency}
            language={currencyLocale}
          />
        </span>
      ),
    },
  ];

  const orderChartData = (chartData) => ({
    labels: chartData.map((data) => get(data, 'x', '')),
    datasets: [
      {
        label: 'Order Vs Date',
        data: chartData.map((data) => get(data, 'y', '')),
        backgroundColor: '#0B3D60',
        borderRadius: 20,
        borderSkipped: false,
        barThickness: 12,
      },
    ],
  });

  const orderChartOptions = {
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'No. of Orders',
        },
        ticks: {
          callback(label) {
            return isEmpty(customOrderChart) ? label * 100 : label;
          },
        },
      },
    },
    layout: {
      padding: {
        left: 5,
        right: 10,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    animations: false,
  };

  const salesChartOptions = {
    ...orderChartOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: `Sales (${CURRENCYSYMBOLS[currency]})`,
        },
        ticks: {
          callback(label) {
            return isEmpty(customSalesChart)
              ? `${round(label * 100, 2)}k`
              : `${round(label / 1000, 2)}k`;
          },
        },
        scaleLabel: {
          display: true,
          labelString: '1k = 1000',
        },
      },
    },
  };

  const customerChartOptions = {
    ...orderChartOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'No. of Customers Added',
        },
        ticks: {
          callback(label) {
            return isEmpty(customUsersChart) ? label * 100 : label;
          },
        },
      },
    },
  };

  const handleProductTableChange = (pagination, filters, sorter) => {
    const { current } = pagination;
    if (!isEmpty(sorter.order) && sorter) {
      setProductSorter({
        columnKey: sorter.field,
        order: sorter.order === 'ascend' ? 'ascend' : 'descend',
      });
      setProductCurrentValue(current);
    } else {
      setProductSorter({
        columnKey: 'orders_count',
        order: 'descend',
      });
      setProductCurrentValue(current);
    }
  };

  const handleCustomerTableChange = (pagination, filters, sorter) => {
    const { current } = pagination;
    if (!isEmpty(sorter.order) && sorter) {
      setCustomerSorter({
        columnKey: sorter.field,
        order: sorter.order === 'ascend' ? 'ascend' : 'descend',
      });
      setCustomerCurrentValue(current);
    } else {
      setCustomerSorter({
        columnKey: 'total_orders',
        order: 'descend',
      });
      setCustomerCurrentValue(current);
    }
  };

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (Object.keys(customerSorter).length > 0) {
      if (customerFilterDate) {
        return fetchOrderCustomerDate(
          customerFilterDate?.startDate,
          customerFilterDate?.endDate,
          {
            pagination: { pageSize: PAGE_LIMIT, current: customerCurrentValue },
          }
        );
      }
      return fetchData({
        pagination: { pageSize: PAGE_LIMIT, current: customerCurrentValue },
      });
    }
  }, [customerSorter]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (Object.keys(productSorter).length > 0) {
      if (productFilterDate) {
        return fetchOrderProductsDate(
          productFilterDate?.startDate,
          productFilterDate?.endDate,
          {
            pagination: { pageSize: PAGE_LIMIT, current: productCurrentValue },
          }
        );
      }
      return fetchProductData({
        pagination: { pageSize: 10, current: productCurrentValue },
      });
    }
  }, [productSorter]);

  const downloadProductTable = async () => {
    if (size(get(dwnldProductList, 'rows')) > 0) {
      const productInfo = [];
      for (const product of dwnldProductList.rows) {
        productInfo.push({
          'Product Name': get(product, 'product_name', ''),
          'Product Category': get(product, 'category_name', ''),
          'Product Brand': get(product, 'product_brand', ''),
          'Total Orders': get(product, 'orders_count', 0),
          'Total Qty': get(product, 'orders_quantity', 0),
          'Total Sales': get(product, 'orders_sales', 0),
        });
      }
      await ExcelDownloads(productInfo, 'Top-Selling-Products');
    } else {
      notification.error({ message: DOWNLOAD_EXCEL_FAILED_MESSAGE });
    }
    const parameters = {
      value: 'dash-download-txt',
    };
    eventTrack('Dash_Xl_Dnld_Top_Selling_Product', parameters);
  };

  const downloadCustomerTable = async () => {
    if (size(get(dwnldCustomersList, 'rows')) > 0) {
      const customerInfo = [];
      for (const product of dwnldCustomersList.rows) {
        customerInfo.push({
          'Customer Name': get(product, 'user_name', ''),
          'Total Orders': get(product, 'total_orders', 0),
          'Total Sales': get(product, 'total_sales', 0),
          'Email Address': get(product, 'email_address', ''),
          'Phone Number': get(product, 'phone_number', ''),
        });
      }
      await ExcelDownloads(customerInfo, 'Top-Customers');
    } else {
      notification.error({ message: DOWNLOAD_EXCEL_FAILED_MESSAGE });
    }
  };

  const downloadChartExcel = async (chartData, columnName, sheetTitle) => {
    if (size(chartData) > 0) {
      const orderInfo = [];
      for (const data of chartData) {
        orderInfo.push({
          'Date ': get(data, 'x', ''),
          [columnName]: get(data, 'y', 0),
        });
      }
      await ExcelDownloads(orderInfo, sheetTitle);
    } else {
      notification.error({ message: DOWNLOAD_EXCEL_FAILED_MESSAGE });
    }
  };

  const selectStyles = mobileView
    ? { width: '100px', fontSize: '12px' }
    : { width: '130px' };

  return (
    <Spin
      spinning={
        (!get(customProductList, 'rows') && !get(customCustomerList, 'rows')) ||
        loading
      }
    >
      {onboardTotal !== 100 && (
        <OnboardGuide
          mobileView={mobileView}
          setOnboardTotal={setOnboardTotal}
          onboardTotal={onboardTotal}
        />
      )}
      <div className="store-dashboard">
        <Row>
          <Col span={12}>
            {mobileView ? (
              <div>
                {allFilterCustomized === true ? undefined : (
                  <h3 className="margin-left">Welcome back, Admin</h3>
                )}
              </div>
            ) : (
              <h3 className="margin-left">Welcome back, Admin</h3>
            )}
          </Col>
          <Col span={12}>
            <div
              className="float-right margin-left"
              style={{ display: 'flex' }}
            >
              {mobileView ? undefined : (
                <Select
                  defaultValue="last_week"
                  virtual={false}
                  className="main-select-cls"
                  value={commonSelValue}
                  onChange={handleAllFilter}
                  onSelect={commenFilterType}
                  options={selectOptionData}
                  style={{ marginRight: '10px' }}
                />
              )}
              {allFilterCustomized && (
                <div className="button">
                  <RangePicker
                    format="DD-MM-YYYY"
                    onChange={(date) => handleAllFilter('customized', date)}
                    className="top-customer-picker"
                  />
                  <CloseOutlined
                    onClick={() => handleClickCloseIcon('common')}
                  />
                </div>
              )}
              {!allFilterCustomized && mobileView && (
                <Select
                  defaultValue="last_week"
                  virtual={false}
                  className="main-select-cls"
                  value={commonSelValue}
                  onChange={handleAllFilter}
                  onSelect={commenFilterType}
                  options={selectOptionData}
                  style={{ marginRight: '10px' }}
                />
              )}
            </div>
          </Col>
        </Row>
        <Row className="data-box-container">
          <Col xs={24} sm={24} md={17} lg={17} xl={17}>
            <div className="data-box-width data-box-left">
              {currency && (
                <Row>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    {orderBox(orderObject)}
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    {salesBox(salesObject)}
                  </Col>
                </Row>
              )}
            </div>
            <Row>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <div className="data-box-width data-box-middle">
                  <Row>{orderValueBox(categoryObject)}</Row>
                </div>
              </Col>
            </Row>
            <div className="data-box-width data-box-right">
              <Row>
                <Col xs={24} sm={24} md={9} lg={9} xl={9}>
                  <div className="store-detail-box">
                    <Row>
                      <Col span={12}>
                        <div className="flex-left">
                          <img src={NewUserIcon} alt="log" />
                          {newUserCustomized ? undefined : (
                            <p className="card-title">New Users</p>
                          )}
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="float-right">
                          {newUserCustomized === false ? (
                            <Select
                              defaultValue="last_week"
                              virtual={false}
                              className="select-common-cls"
                              value={newUserValue}
                              onChange={handleNewUserChange}
                              onSelect={userFilterType}
                              options={selectOptionData}
                            />
                          ) : (
                            <div className="button">
                              <RangePicker
                                format="DD-MM-YYYY"
                                onChange={(date) =>
                                  handleNewUserChange('customized', date)
                                }
                                style={{ width: '225px' }}
                              />
                              &nbsp;&nbsp;
                              <CloseOutlined
                                onClick={() => handleClickCloseIcon('users')}
                              />
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                    <div className="new-user-padding-div">
                      {newUserBox(customerObject)}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={24} md={15} lg={15} xl={15}>
                  <div className="store-detail-box store-selling-height">
                    <Row>
                      <Col span={8}>
                        <div className="flex-left">
                          <img src={topSelling} alt="log" />
                          {mobileView ? (
                            <div>
                              {topSellingCustomized ? undefined : (
                                <p className="card-title">Top Selling</p>
                              )}
                            </div>
                          ) : (
                            <p className="card-title">Top Selling</p>
                          )}
                        </div>
                      </Col>
                      <Col span={16}>
                        <div className="float-right">
                          {topSellingCustomized === true ? (
                            <div className="button">
                              <RangePicker
                                format="DD-MM-YYYY"
                                onChange={(date) =>
                                  handleTopSelling('customized', date)
                                }
                              />
                              &nbsp;&nbsp;
                              <CloseOutlined
                                onClick={() =>
                                  handleClickCloseIcon('topselling')
                                }
                              />
                            </div>
                          ) : (
                            <Select
                              defaultValue="last_week"
                              className="select-common-cls"
                              virtual={false}
                              value={topSellingValue}
                              onChange={handleTopSelling}
                              onSelect={topSellingProFilter}
                              options={selectOptionData}
                            />
                          )}
                        </div>
                      </Col>
                    </Row>

                    <div className="dashboard-selling-table">
                      <Table
                        columns={topSellingColumns}
                        dataSource={get(topSellingList, 'data', [])}
                        loading={topSellingLoading}
                        pagination={false}
                        bordered={false}
                        locale={{
                          emptyText: <EmptyData value="10px" />,
                        }}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
          <Col xs={24} sm={24} md={7} lg={7} xl={7}>
            <div className="data-box-width data-box-left">
              {currency && (
                <Row>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <div className="scale-up-business-box">
                      <Carousel autoplay>
                        {map(sliderData, (item) => {
                          return (
                            <div>
                              <a
                                href={get(item, 'redirect_url', '')}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={get(item, 'image_url', '')}
                                  alt="slider_img"
                                  width="100%"
                                  height="210px"
                                  style={{ borderRadius: '16px' }}
                                />
                              </a>
                            </div>
                          );
                        })}
                      </Carousel>
                    </div>
                  </Col>
                </Row>
              )}
            </div>
            <Row>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <div className="data-box-width data-box-middle">
                  <Row>
                    <AbandonedCartBox
                      abandoned={abandoned}
                      abandonedCustomized={abandonedCustomized}
                      abandonedValue={abandonedValue}
                      handleAbandonedChanges={handleAbandonedChanges}
                      abandonedSelectType={abandonedSelectType}
                      handleClickCloseIcon={handleClickCloseIcon}
                    />
                  </Row>
                </div>
              </Col>
            </Row>
            <Row>
              <div className="data-box-width data-box-right">
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <div className="store-detail-box">
                    <Row>
                      <Col span={12}>
                        <div className="flex-left ">
                          <img src={orderStatusImg} alt="Order_status" />
                          {orderStatusCustomized === false ? (
                            <p className="card-title">Order Status</p>
                          ) : undefined}
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="float-right">
                          {orderStatusCustomized === false ? (
                            <Select
                              defaultValue="last_week"
                              className="select-common-cls"
                              virtual={false}
                              value={orderStatusValue}
                              onChange={orderStatusFilter}
                              onSelect={statusFliterType}
                              options={selectOptionData}
                            />
                          ) : (
                            <div className="button">
                              <RangePicker
                                format="DD-MM-YYYY"
                                onChange={(date) =>
                                  orderStatusFilter('customized', date)
                                }
                              />
                              &nbsp;&nbsp;
                              <CloseOutlined
                                onClick={() =>
                                  handleClickCloseIcon('orderstatus')
                                }
                              />
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                    <div className="order-status-div">
                      <Row>{orderStatusBox(avgOrderStatus)}</Row>
                    </div>
                  </div>
                </Col>
              </div>
            </Row>
          </Col>
        </Row>
        <div className="dashbord-tables-container data-box-container">
          <Row className="dashbord-tables" gutter={20}>
            <Col span={24}>
              <h1 className="store-dashboard-title margin-left">
                Top Selling Products
              </h1>
              <Row justify="space-between margin-left">
                <Col
                  xs={18}
                  sm={18}
                  md={12}
                  lg={12}
                  xl={12}
                  className="top-product-col"
                >
                  {productsCustomized === true ? (
                    <div className="button">
                      <RangePicker
                        format="DD-MM-YYYY"
                        onChange={(date) =>
                          productDateFilter('customized', date)
                        }
                        className="top-customer-picker"
                        style={{ marginLeft: '10px' }}
                      />
                      <CloseOutlined
                        onClick={productFilterType}
                        className="top-customer-close"
                      />
                    </div>
                  ) : (
                    <Select
                      defaultValue="Sort by"
                      style={selectStyles}
                      virtual={false}
                      onChange={productDateFilter}
                      onSelect={productFilterType}
                      options={selectOptionData}
                    />
                  )}
                </Col>
                <Col
                  xs={6}
                  sm={6}
                  md={12}
                  lg={12}
                  xl={12}
                  className="download-btn-col"
                >
                  <Button
                    type="primary"
                    className="download-excel dashboard-excel-btn"
                    onClick={downloadProductTable}
                  >
                    <DownloadOutlined />
                    <span className="dash-download-txt">Download To Excel</span>
                  </Button>
                </Col>
              </Row>
              {!mobileView && (
                <div className="box-seller-table dashboard-table store-detail-box selling-product-table-np">
                  <Table
                    className="products-seller-table orders-table-styles"
                    columns={productColumns}
                    dataSource={get(customProductList, 'rows', [])}
                    pagination={productPagination}
                    loading={tableLoading}
                    onChange={handleProductTableChange}
                    scroll={{ x: 780 }}
                    locale={{
                      emptyText: (
                        <EmptyTable
                          src={topSelling}
                          title="Top Selling Products"
                          description="Add products and start selling to see top selling products"
                          onClick={handleClickProduct}
                        />
                      ),
                    }}
                  />
                </div>
              )}

              {mobileView && (
                <div className="dashboard-list">
                  <List
                    dataSource={get(customProductList, 'rows', [])}
                    loading={tableLoading}
                    pagination={{
                      onChange: (page) => {
                        fetchProductData({
                          pagination: {
                            pageSize: 10,
                            current: page,
                          },
                        });
                      },
                      ...productPagination,
                      align: 'start',
                      size: 'small',
                    }}
                    renderItem={(item) => (
                      <List.Item>
                        <Row>
                          <Col span={6} className="f-center">
                            <img src={NoImage} alt="logo" />
                          </Col>
                          <Col span={14}>
                            <Tooltips
                              placement="top"
                              title={get(item, 'product_name', '')}
                            >
                              <p
                                style={{ fontSize: '12px' }}
                                className="middle-col"
                              >
                                {get(item, 'product_name', '')}
                              </p>
                            </Tooltips>
                            <Typography>
                              {get(item, 'category_name', '')}
                            </Typography>
                            <Typography>
                              Orders-{get(item, 'orders_count', '')}
                            </Typography>
                          </Col>
                          <Col span={4}>
                            <Tooltips
                              placement="top"
                              title={get(
                                item,
                                'orders_sales',
                                ''
                              ).toLocaleString('en-IN', {
                                maximumFractionDigits: 2,
                              })}
                            >
                              <Typography className="amount-typo">
                                {CURRENCYSYMBOLS[currency]}
                                {get(item, 'orders_sales', '').toLocaleString(
                                  'en-IN',
                                  {
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </Typography>
                            </Tooltips>
                            <Typography>
                              Qty-{get(item, 'orders_quantity', '')}
                            </Typography>
                          </Col>
                        </Row>
                      </List.Item>
                    )}
                    locale={{
                      emptyText: <EmptyData />,
                    }}
                  />
                </div>
              )}
            </Col>
          </Row>
        </div>
        <div className="dashbord-graph-container">
          <Row className="dashbord-tables" gutter={20}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Row justify="space-between margin-top-customer">
                <Col xs={20} sm={20} md={22} lg={22} xl={22}>
                  <Row className="top-customer-leftcol">
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                      <h1 className="store-dashboard-title top-customer">
                        Top Customers
                      </h1>
                    </Col>
                    <Col
                      xs={24}
                      sm={24}
                      md={24}
                      lg={12}
                      xl={12}
                      className="top-customer-col-end"
                    >
                      {customerDateCustomized === true ? (
                        <div className="button">
                          <RangePicker
                            format="DD-MM-YYYY"
                            onChange={(date) =>
                              customerDateFilter('customized', date)
                            }
                            className="top-customer-picker"
                          />
                          <CloseOutlined
                            onClick={customerFliterType}
                            className="top-customer-close"
                          />
                        </div>
                      ) : (
                        <Select
                          defaultValue="Sort by"
                          virtual={false}
                          style={selectStyles}
                          onChange={customerDateFilter}
                          onSelect={customerFliterType}
                          options={selectOptionData}
                        />
                      )}
                    </Col>
                  </Row>
                </Col>
                <Col
                  xs={4}
                  sm={4}
                  md={2}
                  lg={2}
                  xl={2}
                  className="download-btn-col top-customer-rightcol"
                >
                  <Button
                    onClick={downloadCustomerTable}
                    icon={<DownloadOutlined />}
                    type="primary"
                  />
                </Col>
              </Row>
              {!mobileView && (
                <div className="box-seller-table dashboard-table store-detail-box top-customer-table">
                  <Table
                    className="products-seller-table orders-table-styles"
                    columns={customerColumns}
                    dataSource={get(customCustomerList, 'rows', [])}
                    pagination={customerPagination}
                    onChange={handleCustomerTableChange}
                    scroll={{ x: 780 }}
                    locale={{
                      emptyText: <EmptyData value="20%" />,
                    }}
                  />
                </div>
              )}

              {mobileView && (
                <div className="dashboard-list-customer">
                  <List
                    dataSource={get(customCustomerList, 'rows', [])}
                    pagination={{
                      onChange: (page) => {
                        fetchData({
                          pagination: {
                            pageSize: 10,
                            current: page,
                          },
                        });
                      },
                      ...customerPagination,
                      align: 'start',
                      size: 'small',
                    }}
                    renderItem={(item) => (
                      <List.Item>
                        <Row>
                          <Col span={15} className="col-left">
                            <p style={{ fontSize: '12px' }}>
                              {get(item, 'user_name', '')}
                            </p>
                            <Typography>
                              Orders-{get(item, 'total_orders', '')}
                            </Typography>
                          </Col>
                          <Col span={9}>
                            <Tooltips
                              placement="top"
                              title={get(item, 'total_sales').toLocaleString(
                                'en-IN',
                                {
                                  maximumFractionDigits: 2,
                                }
                              )}
                            >
                              <Typography className="amount-typo">
                                {CURRENCYSYMBOLS[currency]}
                                {get(item, 'total_sales').toLocaleString(
                                  'en-IN',
                                  {
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </Typography>
                            </Tooltips>
                          </Col>
                        </Row>
                      </List.Item>
                    )}
                    locale={{
                      emptyText: <EmptyData />,
                    }}
                  />
                </div>
              )}
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Row justify="space-between" className="ordervsdate_main">
                <Col xs={18} sm={18} md={14} lg={14} xl={14}>
                  <h1 className="store-dashboard-title">Order Vs Date</h1>
                </Col>
                <Col
                  xs={6}
                  sm={6}
                  md={10}
                  lg={10}
                  xl={10}
                  className="download-btn-col"
                >
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          onClick={() =>
                            downloadChartExcel(
                              customOrderChart,
                              'Total Orders',
                              'Order-Vs-Date'
                            )
                          }
                        >
                          Excel
                        </Menu.Item>
                        <Menu.Item
                          onClick={() =>
                            downloadImage({
                              ref: orderChartReference,
                              name: 'orderChart.png',
                            })
                          }
                        >
                          Image
                        </Menu.Item>
                      </Menu>
                    }
                    placement="bottomRight"
                    arrow
                  >
                    <Button
                      type="primary"
                      className="download-excel dashboard-excel-btn"
                    >
                      <DownloadOutlined />
                      <span className="dash-download-txt">Download As</span>
                    </Button>
                  </Dropdown>
                </Col>
              </Row>
              <div className="box-seller-chart chart-styles">
                <div className="float-right d-flex">
                  {orderVsDateCustomized === true ? (
                    <div className="button">
                      <RangePicker
                        format="DD-MM-YYYY"
                        onChange={(date) =>
                          orderSalesGraphFilter(date, 'orderFilter')
                        }
                        className="top-customer-picker"
                      />
                      <CloseOutlined
                        onClick={() => handleClickCloseIcon('ordervsdate')}
                        className="top-customer-close"
                      />
                    </div>
                  ) : (
                    <Select
                      defaultValue="last_week"
                      style={selectStyles}
                      virtual={false}
                      value={orderVsDate}
                      onChange={handleOrderVsDate}
                      options={selectOptionData}
                      onSelect={customOrderFilter}
                      className="top-customer-select"
                    />
                  )}
                </div>
                <Bar
                  ref={orderChartReference}
                  options={orderChartOptions}
                  data={orderChartData(customOrderChart)}
                  height={200}
                  className="bar-chart-dashboard"
                />
              </div>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
              xl={12}
              className="dashbord-sales-chart-box"
            >
              <Row justify="space-between">
                <Col xs={18} sm={18} md={14} lg={14} xl={14}>
                  <h1 className="store-dashboard-title">Sales Vs Date</h1>
                </Col>
                <Col
                  xs={6}
                  sm={6}
                  md={10}
                  lg={10}
                  xl={10}
                  className="download-btn-col"
                >
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          onClick={() =>
                            downloadChartExcel(
                              customSalesChart,
                              'Total Sales',
                              'Sales-Vs-Date'
                            )
                          }
                        >
                          Excel
                        </Menu.Item>
                        <Menu.Item
                          onClick={() =>
                            downloadImage({
                              ref: salesChartReference,
                              name: 'salesChart.png',
                            })
                          }
                        >
                          Image
                        </Menu.Item>
                      </Menu>
                    }
                    placement="bottomRight"
                    arrow
                  >
                    <Button
                      type="primary"
                      className="download-excel dashboard-excel-btn"
                    >
                      <DownloadOutlined />
                      <span className="dash-download-txt">Download As</span>
                    </Button>
                  </Dropdown>
                </Col>
              </Row>
              <div className="box-seller-chart">
                <div className="float-right d-flex">
                  {salesVsDateCustomized === true ? (
                    <div className="button">
                      <RangePicker
                        format="DD-MM-YYYY"
                        onChange={(date) =>
                          orderSalesGraphFilter(date, 'salesFilter')
                        }
                        className="top-customer-picker"
                      />
                      <CloseOutlined
                        onClick={() => handleClickCloseIcon('salesvsdate')}
                        className="top-customer-close"
                      />
                    </div>
                  ) : (
                    <Select
                      defaultValue="last_week"
                      style={selectStyles}
                      virtual={false}
                      value={saleVsDate}
                      onChange={handleSalesVsDate}
                      options={selectOptionData}
                      onSelect={customSaleFilter}
                      className="top-customer-select"
                    />
                  )}
                </div>
                <Bar
                  ref={salesChartReference}
                  data={orderChartData(customSalesChart)}
                  options={salesChartOptions}
                  height={200}
                  className="bar-chart-dashboard"
                />
              </div>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Row justify="space-between">
                <Col xs={18} sm={18} md={14} lg={14} xl={14}>
                  <h1 className="store-dashboard-title">Customers Vs Date</h1>
                </Col>
                <Col
                  xs={6}
                  sm={6}
                  md={10}
                  lg={10}
                  xl={10}
                  className="download-btn-col"
                >
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          onClick={() =>
                            downloadChartExcel(
                              customUsersChart,
                              'Total Customers',
                              'Customer-Vs-Date'
                            )
                          }
                        >
                          Excel
                        </Menu.Item>
                        <Menu.Item
                          onClick={() =>
                            downloadImage({
                              ref: customerChartReference,
                              name: 'customerChart.png',
                            })
                          }
                        >
                          Image
                        </Menu.Item>
                      </Menu>
                    }
                    placement="bottomRight"
                    arrow
                  >
                    <Button
                      type="primary"
                      className="download-excel dashboard-excel-btn"
                    >
                      <DownloadOutlined />
                      <span className="dash-download-txt">Download As</span>
                    </Button>
                  </Dropdown>
                </Col>
              </Row>
              <div className="box-seller-chart">
                <div className="float-right d-flex">
                  {isCustomized === true ? (
                    <div className="button">
                      <RangePicker
                        format="DD-MM-YYYY"
                        onChange={customerGraphFilter}
                        className="top-customer-picker"
                      />
                      <CloseOutlined
                        onClick={() => handleClickCloseIcon('customervsdate')}
                        className="top-customer-close"
                      />
                    </div>
                  ) : (
                    <Select
                      defaultValue="last_week"
                      style={selectStyles}
                      virtual={false}
                      value={customerVsDate}
                      onChange={handleCustomerVsDate}
                      options={selectOptionData}
                      onSelect={customCustomerFilter}
                      className="top-customer-select"
                    />
                  )}
                </div>
                <Bar
                  ref={customerChartReference}
                  data={orderChartData(customUsersChart)}
                  options={customerChartOptions}
                  height={200}
                  className="bar-chart-dashboard"
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Spin>
  );
}

export default StoreDashboard;
