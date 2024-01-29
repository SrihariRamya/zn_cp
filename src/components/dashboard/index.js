import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  Row,
  Col,
  Card,
  Avatar,
  Table,
  Tag,
  notification,
  Button,
  Spin,
  Dropdown,
  Menu,
} from 'antd';
import {
  RightOutlined,
  CaretDownOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { Line, Bar } from 'react-chartjs-2';
import './dashboard.less';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { Link } from 'react-router-dom';
import {
  filter,
  forEach,
  get,
  groupBy,
  isFinite,
  map,
  reduce,
  sumBy,
  uniqBy,
} from 'lodash';
import moment from 'moment';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  getUser,
  getOrdersByDate,
  getOrderConfirmation,
  getAllOrder,
  getOrdersByStore,
} from '../../utils/api/url-helper';
import box from '../../assets/images/1.svg';
import giftBox from '../../assets/images/2.svg';
import parcel from '../../assets/images/3.svg';
import container from '../../assets/images/4.svg';
import { FAILED_TO_LOAD } from '../../shared/constant-values';
import { TenantContext } from '../context/tenant-context';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [recentCustomer, setRecentCustomer] = useState([]);
  const [orderConfirm, setOrderConfirm] = useState();
  const [orderPacking, setOrderPacking] = useState();
  const [orderDispatch, setOrderDispatch] = useState();
  const [orderDelivered, setOrderDelivered] = useState();
  const [daycount, setdaycount] = useState('7 Days');
  const [allOrders, setAllOrders] = useState([]);
  const [currentMonthSales, setCurrentMonthSales] = useState([]);
  const [previousMonthSales, setPreviousMonthSales] = useState([]);
  const [linegraphMonth, setLinegraphMonth] = useState([]);
  const [areagraph, setAreaGraph] = useState([]);
  const [bargraph, setBarGraph] = useState([]);
  const [filterValue, setFilterValue] = useState(7);
  const [areaFilterValue, setAreaFilterValue] = useState(7);
  const [lineFilterValue, setLineFilterValue] = useState(7);
  const [roleInfo] = useState(localStorage.getItem('roleName'));
  const [orderLoading, setOrderLoading] = useState(false);
  const [tenantDetails] = useContext(TenantContext);
  const [sales, setsales] = useState();
  const [ratio, setratio] = useState();
  const [revenue, setrevenue] = useState();
  const [storeID] = useState(localStorage.getItem('storeID'));
  const { currency } = get(tenantDetails, 'setting', {});

  const dropdowns = [
    { value: 7, description: 'Last 7 days' },
    { value: 30, description: 'Last 30 days' },
    { value: 90, description: 'Last 3 Months' },
    { value: 180, description: 'Last 6 Months' },
  ];
  const reference = useRef();
  const customerReference = useRef();
  const appType = 'B2C';
  useEffect(() => {
    setLoading(true);
    const parameters = {
      roleName: 'Customer',
      includeAddress: true,
      limit: 10,
      offset: 1,
      recentCustomer: true,
    };
    const apiArray = [getUser(parameters)];
    Promise.all(apiArray)
      .then((response) => {
        setLoading(false);
        const customerHeight = customerReference.current.clientHeight;
        const customerInfo = get(response, '[0].data.rows', []).filter(
          (result, index) => index < Math.floor((customerHeight - 140) / 40) - 1
        );
        const getPreviousMonthData = () => {
          const startOf = moment()
            .subtract(1, 'months')
            .startOf('month')
            .format();
          const endOf = moment().subtract(1, 'months').endOf('month').format();
          return [startOf, endOf];
        };
        const getPreviousData = getPreviousMonthData();
        getOrdersByDate(
          { startOf: getPreviousData[0], endOf: getPreviousData[1] },
          appType
        )
          .then((resp) => {
            const customDataSet = get(resp, 'data', []);
            setPreviousMonthSales(customDataSet);
          })
          .catch(() => notification.error({ message: FAILED_TO_LOAD }));
        const getCustomDate = () => {
          const startOf = moment().startOf('month').format();
          const endOf = moment().endOf('month').format();
          return [startOf, endOf];
        };
        const getValue = getCustomDate();
        getOrdersByDate({ startOf: getValue[0], endOf: getValue[1] }, appType)
          .then((resp) => {
            const customData = get(resp, 'data', []);
            setCurrentMonthSales(customData);
          })
          .catch(() => notification.error({ message: FAILED_TO_LOAD }));
        setRecentCustomer(customerInfo);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, []);

  useEffect(() => {
    getOrderConfirmation('CON', appType)
      .then((resp) => {
        setOrderConfirm(get(resp, 'data', 0));
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
    getOrderConfirmation('DEL', appType)
      .then((resp) => {
        setOrderDelivered(get(resp, 'data', 0));
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
    getOrderConfirmation('DIS', appType)
      .then((resp) => {
        setOrderDispatch(get(resp, 'data', 0));
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
    getOrderConfirmation('INP', appType)
      .then((resp) => {
        setOrderPacking(get(resp, 'data', 0));
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, []);

  useEffect(() => {
    const height = reference.current.clientHeight;
    setOrderLoading(true);
    if (storeID) {
      const queryParameter = {
        store_uid: storeID,
      };
      getOrdersByStore(appType, queryParameter)
        .then((resp) => {
          setOrderLoading(false);
          const orderInfo = get(resp, 'data.rows', []).filter(
            (result, index) => index < Math.floor((height - 140) / 40) - 1
          );
          setAllOrders(get(resp, 'data.rows', []));
          setOrderData(orderInfo);
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
        });
    } else {
      getAllOrder(appType)
        .then((response) => {
          setOrderLoading(false);
          const orderInfo = get(response, 'data.rows', []).filter(
            (result, index) => index < Math.floor((height - 140) / 40) - 1
          );
          setAllOrders(get(response, 'data.rows', []));
          setOrderData(orderInfo);
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayData = filter(allOrders, (today) => {
    return (
      moment(today.creation_date).format('DD/MM/YYYY') ===
        moment().local().format('DD/MM/YYYY') &&
      (get(today, 'zm_milestone.milestone_code', '') === 'CON' ||
        get(today, 'zm_milestone.milestone_code', '') === 'INP' ||
        get(today, 'zm_milestone.milestone_code', '') === 'DIS' ||
        get(today, 'zm_milestone.milestone_code', '') === 'DEL')
    );
  });
  const yesterdayData = filter(allOrders, (today) => {
    return (
      moment(today.creation_date).format('DD/MM/YYYY') ===
        moment().local().subtract(30, 'days').format('DD/MM/YYYY') &&
      (get(today, 'zm_milestone.milestone_code', '') === 'CON' ||
        get(today, 'zm_milestone.milestone_code', '') === 'INP' ||
        get(today, 'zm_milestone.milestone_code', '') === 'DIS' ||
        get(today, 'zm_milestone.milestone_code', '') === 'DEL')
    );
  });
  const yesterdayTotalSales = reduce(
    yesterdayData,
    (sum, n) => {
      return sum + n.total_price;
    },
    0
  );
  const updatedAreaTotal = filter(areagraph, (dataItem) => {
    return (
      get(dataItem, 'zm_milestone.milestone_code', '') === 'CON' ||
      get(dataItem, 'zm_milestone.milestone_code', '') === 'INP' ||
      get(dataItem, 'zm_milestone.milestone_code', '') === 'DIS' ||
      get(dataItem, 'zm_milestone.milestone_code', '') === 'DEL'
    );
  });
  const AreaTotalAverage = reduce(
    updatedAreaTotal,
    (sum, n) => {
      return sum + n.total_price;
    },
    0
  );
  const todayTotalSales = reduce(
    todayData,
    (sum, n) => {
      return sum + n.total_price;
    },
    0
  );
  const handleOrderDate = (date) => {
    const uniqData = uniqBy(date, 'label');
    return uniqData;
  };
  const previousMonthData = filter(previousMonthSales, (previous) => {
    return (
      get(previous, 'zm_milestone.milestone_code', '') === 'CON' ||
      get(previous, 'zm_milestone.milestone_code', '') === 'INP' ||
      get(previous, 'zm_milestone.milestone_code', '') === 'DIS' ||
      get(previous, 'zm_milestone.milestone_code', '') === 'DEL'
    );
  });
  const previousMonthTotalSales = reduce(
    previousMonthData,
    (sum, n) => {
      return sum + n.total_price;
    },
    0
  );
  const currentMonthData = filter(currentMonthSales, (today) => {
    return (
      get(today, 'zm_milestone.milestone_code', '') === 'CON' ||
      get(today, 'zm_milestone.milestone_code', '') === 'INP' ||
      get(today, 'zm_milestone.milestone_code', '') === 'DIS' ||
      get(today, 'zm_milestone.milestone_code', '') === 'DEL'
    );
  });
  const currentMonthTotalSales = reduce(
    currentMonthData,
    (sum, n) => {
      return sum + n.total_price;
    },
    0
  );
  const graphData = (dataValue, filterValue_) => {
    const arrayUpdate = filter(dataValue, (arrayData) => {
      return (
        get(arrayData, 'zm_milestone.milestone_code', '') === 'CON' ||
        get(arrayData, 'zm_milestone.milestone_code', '') === 'INP' ||
        get(arrayData, 'zm_milestone.milestone_code', '') === 'DIS' ||
        get(arrayData, 'zm_milestone.milestone_code', '') === 'DEL'
      );
    });
    const oneMonthData = groupBy(arrayUpdate, (date) =>
      moment(date.creation_date).format('LL')
    );
    const oneMonthXaxis = Object.keys(oneMonthData);
    if (filterValue_ <= 30) {
      const datewiseData = [];
      forEach(oneMonthXaxis, (line) => {
        oneMonthData[line].forEach((iterate) => {
          if (moment(iterate.creation_date).format('LL') === line) {
            const object = {
              label: line,
              value: sumBy(oneMonthData[line], 'total_price').toFixed(2),
            };
            datewiseData.push(object);
          }
        });
      });
      return handleOrderDate(datewiseData);
    }
    const monthwiseData = [];
    const monthData = map(arrayUpdate, (line) => {
      const monthName = moment(line.creation_date, 'YYYY/MM/DD').format('MMM');
      line = { ...line, monthName };
      return line;
    });
    const dataMonth = groupBy(monthData, 'monthName');
    const monthDataName = Object.keys(dataMonth);
    monthDataName.forEach((iterate) => {
      const object = {
        label: iterate,
        value: sumBy(dataMonth[iterate], 'total_price').toFixed(2),
      };
      monthwiseData.push(object);
    });
    return handleOrderDate(monthwiseData);
  };

  const getPercentageChange = () => {
    const decreaseValue = todayTotalSales - yesterdayTotalSales;
    return isFinite(decreaseValue / todayTotalSales) * 100
      ? (decreaseValue / todayTotalSales) * 100
      : 0;
  };
  const getSalesRatioPercentage = () => {
    if (previousMonthTotalSales > currentMonthTotalSales) {
      const decreaseValue = previousMonthTotalSales - currentMonthTotalSales;
      return isFinite(decreaseValue / previousMonthTotalSales) * 100
        ? (decreaseValue / previousMonthTotalSales) * 100
        : 0;
    }

    const increaseValue = currentMonthTotalSales - previousMonthTotalSales;
    return isFinite(increaseValue / previousMonthTotalSales) * 100
      ? (increaseValue / previousMonthTotalSales) * 100
      : 0;
  };

  const todayAverage = Number.isNaN(todayTotalSales / todayData.length)
    ? 0
    : todayTotalSales / todayData.length;
  const totalAverageData = Number.isNaN(
    AreaTotalAverage / updatedAreaTotal.length
  )
    ? 0
    : AreaTotalAverage / updatedAreaTotal.length;
  const getLast30Days = (input, value) => {
    const {
      date = new Date(),
      count = value,
      unit = 'day',
      fmt = 'YYYY-MM-DD',
    } = input;
    const startOf = moment(date).subtract(count, unit).format(fmt);
    const endOf = moment(date).endOf('day').format(fmt);
    return [startOf, endOf];
  };
  const handleLinegraph = useCallback((values) => {
    values = values === 7 ? 7 : values.key;
    if (values === '7' || values === 7) {
      setsales('Last 7 days');
    } else if (values === '90') {
      setsales('Last 3 Month');
    } else if (values === '30') {
      setsales('Last 30 days');
    } else {
      setsales('Last 6 Month');
    }
    const todayDate = moment().format();
    const getValue = getLast30Days(todayDate, values);
    setLoading(true);
    setLineFilterValue(values);
    getOrdersByDate({ startOf: getValue[0], endOf: getValue[1] }, appType)
      .then((resp) => {
        const lineData = get(resp, 'data', []);
        setLinegraphMonth(lineData);
        setLoading(false);
      })
      .catch(() => notification.error({ message: FAILED_TO_LOAD }));
  }, []);
  const handleAreagraph = useCallback((rvalue) => {
    rvalue = rvalue === 7 ? 14 - 7 : rvalue.key;
    if (rvalue === '7' || rvalue === 7) {
      setdaycount('7 days');
      setrevenue('Last 7 days');
    } else if (rvalue === '30') {
      setdaycount('30 days');
      setrevenue('Last 30 days');
    } else if (rvalue === '90') {
      setdaycount('3 Month');
      setrevenue('Last 3 Month');
    } else {
      setdaycount('6 Month');
      setrevenue('Last 6 Month');
    }
    const todayDate = moment().format();
    const getValue = getLast30Days(todayDate, rvalue);
    setLoading(true);
    setAreaFilterValue(rvalue);
    getOrdersByDate({ startOf: getValue[0], endOf: getValue[1] }, appType)
      .then((resp) => {
        const areaData = get(resp, 'data', []);
        setAreaGraph(areaData);
        setLoading(false);
      })
      .catch(() => notification.error({ message: FAILED_TO_LOAD }));
  }, []);
  const handleBargraph = useCallback((value) => {
    value = value !== 7 ? value.key : 7;
    if (value === '30') {
      setratio('Last 30 days');
      setFilterValue(30);
    } else if (value === '7' || value === 7) {
      setratio('Last 7 days');
      setFilterValue(7);
    } else if (value === '90') {
      setratio('Last 3 Month');
      setFilterValue(90);
    } else {
      setratio('Last 6 Month');
      setFilterValue(180);
    }
    const todayDate = moment().format();
    const getValue = getLast30Days(todayDate, value);
    setLoading(true);
    getOrdersByDate({ startOf: getValue[0], endOf: getValue[1] }, appType)
      .then((resp) => {
        const barData = get(resp, 'data', []);
        setBarGraph(barData);
        setLoading(false);
      })
      .catch(() => notification.error({ message: FAILED_TO_LOAD }));
  }, []);
  useEffect(() => {
    handleLinegraph(7);
    handleAreagraph(7);
    handleBargraph(7);
  }, [handleAreagraph, handleBargraph, handleLinegraph]);
  const LineChartData = {
    labels: map(graphData(linegraphMonth, lineFilterValue), 'label'),
    datasets: [
      {
        label: '',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: map(graphData(linegraphMonth, lineFilterValue), 'value'),
      },
    ],
    options: {
      legend: {
        display: false,
      },
    },
  };
  const areaChartData = {
    labels: map(graphData(areagraph, areaFilterValue), 'label'),
    datasets: [
      {
        label: '',
        fill: 'start',
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 10,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: map(graphData(areagraph, areaFilterValue), 'value'),
      },
    ],
    options: {
      legend: {
        display: false,
      },
    },
  };
  const barGraphData = {
    labels: map(graphData(bargraph, filterValue), 'label'),
    datasets: [
      {
        label: 'Sales',
        backgroundColor: '#9ACB34',
        borderColor: '#9ACB34',
        borderWidth: 2,
        data: map(graphData(bargraph, filterValue), 'value'),
      },
    ],
    options: {
      legend: {
        display: false,
      },
    },
  };
  const data = [
    {
      title: "Today's Revenue(Online)",
      amount: todayTotalSales.toFixed(2),
      diff: getPercentageChange().toFixed(2),
      diffAmount: yesterdayTotalSales.toFixed(2),
      span: 'Last month this day',
    },
    {
      title: "Today's Revenue(Walk-in)",
      amount: '0',
      diff: '0',
      diffAmount: '0',
      span: 'Last month this day',
    },
    {
      title: 'This Month(Online)',
      amount: currentMonthTotalSales.toFixed(2),
    },
    {
      title: 'This Month(Walk-in)',
      amount: '0',
    },
    {
      ImgAmount: orderConfirm,
      img: box,
      imgTitle: 'Confirmed Orders',
    },
    {
      ImgAmount: orderPacking,
      img: giftBox,
      imgTitle: 'Orders in packing',
    },
    {
      ImgAmount: orderDispatch,
      img: parcel,
      imgTitle: 'Dispatched Orders',
    },
    {
      ImgAmount: orderDelivered,
      img: container,
      imgTitle: 'Delivered Orders',
    },
  ];
  const colorFunction = (dataCol) => {
    if (dataCol === 'Confirmed') return 'blue';
    if (dataCol === 'Checkout') return 'yellow';
    if (dataCol === 'Cancelled') return 'red';
    if (dataCol === 'In Packing') return 'orange';
    if (dataCol === 'Delivered') return 'green';
    if (dataCol === 'Dispatched') return 'gold';
    return null;
  };
  const columns = [
    {
      title: 'Name',
      dataIndex: ['zm_user', 'user_name'],
      key: 'name',
      render: (text) => <span className="text-grey-light">{text}</span>,
    },
    {
      title: 'BillDate',
      dataIndex: 'creation_date',
      key: 'billDate',
      render: (bill) => (
        <span className="text-grey-light">
          {moment(bill).isValid()
            ? moment(bill).format(
                get(tenantDetails, 'setting.date_format', 'DD-MM-YYYY hh:mm')
              )
            : ''}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: ['zm_milestone', 'milestone_description'],
      key: 'status',
      render: (tags) => (
        <>
          <Tag color={colorFunction(tags)}>{tags}</Tag>
        </>
      ),
    },
    {
      title: 'Amount',
      key: 'amount',
      dataIndex: 'total_price',
      render: (amount) => (
        <span className="text-grey-light">
          <CurrencyFormatter value={amount} type={currency} />
        </span>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ margin: '15px 0' }}>
        <h3 className="analytics">Analytics Overview</h3>
        <Row className="overview" align="stretch" gutter={[5, 5]}>
          <Col span={10}>
            <Spin spinning={orderLoading}>
              <Row className="cont-height" gutter={[5, 5]}>
                {data.map((value) => {
                  return (
                    <Col className="" span={12}>
                      <Card className="card-amount">
                        {get(value, 'title', '') && (
                          <p className="title">{get(value, 'title', '')}</p>
                        )}
                        {get(value, 'amount', '') && (
                          <p className="amount">
                            <CurrencyFormatter
                              value={Math.floor(value.amount)}
                              type={currency}
                            />
                          </p>
                        )}
                        {get(value, 'diff', '') && (
                          <p
                            className={
                              Math.sign(get(value, 'diff', '')) === -1
                                ? 'diff-neg'
                                : 'diff'
                            }
                          >
                            {get(value, 'diff', '')}%
                          </p>
                        )}
                        {get(value, 'diffAmount', '') && (
                          <p className="diffAmount">
                            <CurrencyFormatter
                              value={Math.floor(get(value, 'diffAmount', ''))}
                              type={currency}
                            />

                            <span className="span">
                              {get(value, 'span', '')}
                            </span>
                          </p>
                        )}
                        {get(value, 'img', '') && (
                          <>
                            <img
                              className="img"
                              src={get(value, 'img', '')}
                              alt=""
                            />
                            <span className="imgTitle">
                              {get(value, 'imgTitle', '')}
                            </span>
                          </>
                        )}
                        <p className="img-amount">
                          {get(value, 'ImgAmount', '')}
                        </p>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Spin>
          </Col>
          <Col span={14}>
            <Card style={{ height: '100%' }}>
              <div className="title-handler">
                <h2>Total Sales</h2>
                <Dropdown
                  className="dashboard_Dropdown"
                  trigger="click"
                  overlay={
                    <Menu
                      onClick={handleLinegraph}
                      style={{
                        border: 'groove',
                        borderRadius: '8px',
                        bottom: '40px',
                      }}
                    >
                      {dropdowns.map((result) => (
                        <Menu.Item
                          key={result.value}
                          className={
                            result.description === sales
                              ? 'bg-gray-lightcolor text-green-dark active'
                              : 'text-grey-light active'
                          }
                        >
                          {result.description === 'Last 7 days' ? (
                            <span>
                              {' '}
                              {result.description}&nbsp;{' '}
                              <CaretDownOutlined
                                style={{
                                  margin: '0px 2px 0px 27px',
                                  color: 'gray',
                                }}
                              />{' '}
                            </span>
                          ) : (
                            result.description
                          )}
                        </Menu.Item>
                      ))}
                    </Menu>
                  }
                >
                  <span className="ant-dropdown-link" style={{ color: 'gray' }}>
                    <span>{sales}</span>
                    <CaretDownOutlined />
                  </span>
                </Dropdown>
              </div>
              <h4 className="text-grey-light">All transaction record</h4>
              <Line
                data={LineChartData}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                        drawBorder: false,
                      },
                    },
                    y: {
                      grid: {
                        drawBorder: false,
                      },
                    },
                  },
                  title: {
                    display: false,
                  },
                  legend: {
                    display: false,
                  },
                }}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={[5, 5]} className="overview">
          <Col span={16}>
            <Card style={{ height: '100%' }}>
              <div className="title-handler">
                <h2>Sales Ratio</h2>
                <Dropdown
                  trigger="click"
                  className="dashboard_Dropdown"
                  overlay={
                    <Menu
                      onClick={handleBargraph}
                      style={{
                        border: 'groove',
                        borderRadius: '8px',
                        bottom: '40px',
                      }}
                    >
                      {dropdowns.map((result) => (
                        <Menu.Item
                          key={result.value}
                          className={
                            result.description === ratio
                              ? 'bg-gray-lightcolor text-green-dark active'
                              : 'text-grey-light active'
                          }
                        >
                          {result.description === 'Last 7 days' ? (
                            <span>
                              {' '}
                              {result.description}&nbsp;{' '}
                              <CaretDownOutlined
                                style={{
                                  margin: '0px 2px 0px 27px',
                                  color: 'gray',
                                }}
                              />{' '}
                            </span>
                          ) : (
                            result.description
                          )}
                        </Menu.Item>
                      ))}
                    </Menu>
                  }
                >
                  <span className="ant-dropdown-link" style={{ color: 'gray' }}>
                    <span>{ratio}</span>
                    <CaretDownOutlined />
                  </span>
                </Dropdown>
              </div>
              <Bar
                className="bar-graph"
                data={barGraphData}
                height={130}
                plugins={[ChartDataLabels]}
                options={{
                  title: {
                    display: false,
                    text: 'Average Rainfall per month',
                    fontSize: 20,
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                        drawBorder: false,
                      },
                    },
                    y: {
                      grid: {
                        borderDash: [2, 5],
                        drawBorder: false,
                      },
                    },
                  },
                  legend: {
                    display: false,
                    position: 'right',
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    datalabels: {
                      anchor: 'end',
                      align: 'top',
                      color: '#8993a0',
                      formatter(value) {
                        const number = parseInt(value, 10);
                        return Math.abs(number) > 999
                          ? `${
                              Math.sign(number) *
                              (Math.abs(number) / 1000).toFixed(1)
                            }k`
                          : `${Math.sign(number) * Math.abs(number)}`;
                      },
                    },
                  },
                }}
              />
              {filterValue !== 7 && filterValue !== 30 && (
                <div className="saleratio">
                  <p className="ratio">This month sales ratio</p>
                  <h1 className="percentage">
                    {previousMonthTotalSales !== 0 &&
                      (previousMonthTotalSales > currentMonthTotalSales ? (
                        <ArrowDownOutlined className="sales-decrease" />
                      ) : (
                        <ArrowUpOutlined className="sales-increase" />
                      ))}
                    {getSalesRatioPercentage().toFixed(2)}%
                  </h1>
                </div>
              )}
            </Card>
          </Col>
          <Col span={8}>
            <div ref={customerReference} style={{ height: '100%' }}>
              <Card className="contact-card cont-height">
                <h3 className="title1">Recent Customers</h3>
                <Row gutter={5}>
                  <Col span={24}>
                    {recentCustomer.map((value) => {
                      return (
                        <Row className="contact-row">
                          <Col span={3}>
                            <Avatar className="avatar" size={34}>
                              {get(value, 'user_name.[0]', '').toUpperCase()}
                            </Avatar>
                          </Col>
                          <Col span={19}>
                            <p className="name">
                              {get(value, 'user_name', '')}
                            </p>
                            <p className="number">
                              {get(value, 'phone_number', '')}
                            </p>
                          </Col>
                          <Col span={2}>
                            <RightOutlined className="arrow" />
                          </Col>
                        </Row>
                      );
                    })}
                    <div className="button">
                      <Link to="customers">
                        {roleInfo === 'tenant_admin' ? (
                          <Button type="link" className="text-primary">
                            See More
                          </Button>
                        ) : null}
                      </Link>
                    </div>
                  </Col>
                </Row>
              </Card>
            </div>
          </Col>
        </Row>
        <Row gutter={[5, 5]} className="overview">
          <Col span={10}>
            <Card className="card-amount">
              <div className="title-handler">
                <h2>Total Revenue</h2>
                <Dropdown
                  trigger="click"
                  className="dashboard_Dropdown"
                  overlay={
                    <Menu
                      onClick={handleAreagraph}
                      style={{
                        border: 'groove',
                        borderRadius: '8px',
                        bottom: '40px',
                      }}
                    >
                      {dropdowns.map((result) => (
                        <Menu.Item
                          key={result.value}
                          className={
                            get(result, 'description', '') === revenue
                              ? 'bg-gray-lightcolor text-green-dark active'
                              : 'text-grey-light active'
                          }
                        >
                          {get(result, 'description', '') === 'Last 7 days' ? (
                            <span>
                              {' '}
                              {get(result, 'description', '')}&nbsp;{' '}
                              <CaretDownOutlined
                                style={{
                                  margin: '0px 2px 0px 27px',
                                  color: 'gray',
                                }}
                              />{' '}
                            </span>
                          ) : (
                            get(result, 'description', '')
                          )}
                        </Menu.Item>
                      ))}
                    </Menu>
                  }
                >
                  <span className="ant-dropdown-link" style={{ color: 'gray' }}>
                    <span>{revenue}</span>
                    <CaretDownOutlined />
                  </span>
                </Dropdown>
              </div>
              <p className="diffAmount">
                <CurrencyFormatter
                  value={Math.floor(totalAverageData)}
                  type={currency}
                />
                <span className="span">Avg for Last {daycount}</span>
              </p>
              <p className="diffAmount">
                <CurrencyFormatter
                  value={Math.floor(todayAverage)}
                  type={currency}
                />
                <span className="span">Avg for Today </span>
              </p>

              <Line
                height="200"
                data={areaChartData}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                        drawBorder: false,
                      },
                    },
                    y: {
                      grid: {
                        display: false,
                        drawBorder: false,
                      },
                    },
                  },
                  title: {
                    display: false,
                  },
                  legend: {
                    display: false,
                  },
                }}
              />
            </Card>
          </Col>
          <Col span={14}>
            <div ref={reference} style={{ height: '100%' }}>
              <Card className="table-card cont-height">
                <h3 className="title1">Recent Orders</h3>
                <h4 className="text-grey-light">All transaction record</h4>
                <Row gutter={5}>
                  <Col span={24}>
                    <Table
                      className="cont-height thead-color"
                      pagination={false}
                      columns={columns}
                      dataSource={orderData}
                      loading={orderLoading}
                    />
                    <div className="button">
                      <Link to="orders">
                        <Button type="link" className="text-primary">
                          See More
                        </Button>
                      </Link>
                    </div>
                  </Col>
                </Row>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};
export default Dashboard;
