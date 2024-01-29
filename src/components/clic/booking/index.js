import React, { useEffect, useState } from 'react';
import { Button, Col, Row, Tabs, Spin, notification, Empty } from 'antd';
import { get, isEmpty, map } from 'lodash';
import { addDates } from '@kaaylabs/date-helper';
import moment from 'moment';
import { Link } from 'react-router-dom';
import {
  ALL,
  BOOKINGS_BREAD_TITLE,
  BOOKING_STATUS_TABS_VALUES,
  BOOKING_STATUS_WAITING,
  INITIAL_PAGE,
  LASTMONTH,
  LASTWEEK,
  LASTYEAR,
  PAGE_LIMIT,
  SLOT_FORMAT,
  TODAY,
  YESTERDAY,
} from '../../../shared/constant-values';
import './clic-booking.less';
import BookingList from './booking-list';
import {
  getBookingProduct,
  getBookingTimeSlot,
  getClicProductNames,
  updateBookingStatus,
} from '../../../utils/api/url-helper';
import HeadingWithFilter from '../heading-with-filter';

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('Waiting');
  const [timeSoltList, setTimeSoltList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingProducts, setBookingProduct] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [page, setPage] = useState(INITIAL_PAGE);
  const [totalProductCount, setTotalProductCount] = useState();
  const [selectedFilterDate, setSelectedFilterDate] = useState(ALL);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [updateDateWiseFilter, setUpdateDateWiseFilter] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [productNames, setProductNames] = useState([]);

  const handleActiveTab = (value) => {
    setBookingProduct([]);
    setActiveTab(value);
  };

  const fetchData = () => {
    setLoading(true);
    const requestTimeSlot = {
      day_name: addDates({
        date: new Date(),
        unit: 'd',
        count: 0,
        fmt: 'dddd',
      }),
    };
    Promise.all([
      getBookingTimeSlot(requestTimeSlot),
      getClicProductNames({ module: 'booking' }),
    ])
      .then((response) => {
        const timeSlotData = get(response, '[0].data', []);
        setTimeSoltList(get(timeSlotData, '[0].delivery_slots', []));
        const filterByProduct = get(response, '[1].data', []).map((value) => {
          if (selectedProduct.includes(value.product_uid)) value.checked = true;
          else value.checked = false;
          return value;
        });
        setProductNames(filterByProduct);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getBookingProductData = (offset) => {
    setPageLoading(true);
    const parameters = {
      limit: PAGE_LIMIT,
      offset,
      status: activeTab,
    };
    if (startDate) parameters.startDate = startDate;
    if (endDate) parameters.endDate = endDate;
    if (!isEmpty(selectedProduct)) parameters.productUid = selectedProduct;
    getBookingProduct(parameters)
      .then((response) => {
        const { count, rows } = get(response, ['data'], []);
        setTotalProductCount(count);
        if (offset === INITIAL_PAGE) {
          setBookingProduct(rows);
        } else {
          setBookingProduct([...bookingProducts, ...rows]);
        }
        setPage(offset);
        setPageLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error?.message });
      });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getBookingProductData(INITIAL_PAGE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, updateDateWiseFilter, selectedProduct]);

  const loadMoreData = () => {
    getBookingProductData(page + INITIAL_PAGE);
  };

  const bookingStatus = (value, id) => {
    setLoading(true);
    const parameter = {
      status: value,
    };
    updateBookingStatus(id, parameter)
      .then((response) => {
        notification.success({ message: response.message });
        setLoading(false);
        setBookingProduct([]);
        setUpdateDateWiseFilter(!updateDateWiseFilter);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleSelectChange = (value, id) => {
    if (value !== BOOKING_STATUS_WAITING) {
      bookingStatus(value, id);
    }
  };

  const handleDatteFilter = (value) => {
    setSelectedFilterDate(value);
    if (value === TODAY) {
      setBookingProduct([]);
      setStartDate(moment().startOf('day').format());
      setEndDate(moment().endOf('day').format());
      setUpdateDateWiseFilter(!updateDateWiseFilter);
    } else if (value === YESTERDAY) {
      setBookingProduct([]);
      setStartDate(moment().startOf('day').subtract(1, 'days').format());
      setEndDate(moment().subtract(1, 'days').endOf('day').format());
      setUpdateDateWiseFilter(!updateDateWiseFilter);
    } else if (value === LASTWEEK) {
      setBookingProduct([]);
      setStartDate(moment().startOf('week').subtract(7, 'days').format());
      setEndDate(moment().endOf('week').subtract(7, 'days').format());
      setUpdateDateWiseFilter(!updateDateWiseFilter);
    } else if (value === LASTMONTH) {
      setBookingProduct([]);
      setStartDate(moment().subtract(1, 'months').startOf('month').format());
      setEndDate(moment().subtract(1, 'months').endOf('month').format());
      setUpdateDateWiseFilter(!updateDateWiseFilter);
    } else if (value === LASTYEAR) {
      setBookingProduct([]);
      setStartDate(moment().subtract(1, 'years').startOf('year').format());
      setEndDate(moment().subtract(1, 'years').endOf('year').format());
      setUpdateDateWiseFilter(!updateDateWiseFilter);
    } else if (value === ALL) {
      setEndDate('');
      setStartDate('');
      setUpdateDateWiseFilter(!updateDateWiseFilter);
    }
  };

  const productDateFilter = (date) => {
    if (date) {
      setStartDate(
        moment(get(date, '[0]', '')).isValid()
          ? moment(get(date, '[0]', '')).startOf('day').format()
          : ''
      );
      setEndDate(
        moment(get(date, '[1]', '')).isValid()
          ? moment(get(date, '[1]', '')).startOf('day').format()
          : ''
      );
      setUpdateDateWiseFilter(!updateDateWiseFilter);
    }
  };

  const handleProductLevelFilter = (value) => {
    productNames.forEach((item) => {
      if (value.includes(item.product_uid)) item.checked = true;
      else item.checked = false;
    });
    setSelectedProduct(value);
    getBookingProductData(INITIAL_PAGE);
  };

  return (
    <Spin spinning={loading}>
      <div className="clic-booking-container">
        <div className="booking-title-container">
          <HeadingWithFilter
            title={BOOKINGS_BREAD_TITLE}
            productDateFilter={productDateFilter}
            productNames={productNames}
            selectedFilterDate={selectedFilterDate}
            handleDatteFilter={handleDatteFilter}
            handleProductLevelFilter={handleProductLevelFilter}
          />
        </div>
        <Row gutter={15}>
          <Col span={8}>
            <div className="mt-20 time-slots-container">
              <div className="time-slot-title">Today Slots</div>
              <div className="time-slots-list-container">
                {timeSoltList.length > 0 ? (
                  <>
                    {timeSoltList.map((data) => (
                      <div key={data?.id} className="time-slot-item-container">
                        <div className="time-slot-value">
                          {moment(data?.start_time, 'HH:mm').format(
                            SLOT_FORMAT
                          )}
                          &nbsp; - &nbsp;{' '}
                          {moment(data?.end_time, 'HH:mm').format(SLOT_FORMAT)}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex-center">
                    <Empty
                      description="Today no slots"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  </div>
                )}
              </div>
              <div className="mt-10 add-time-slot-button-container">
                <Link to="/bookings/slots">
                  <Button type="primary" block className="booking-box-button">
                    Add / Edit Time Slot
                  </Button>
                </Link>
              </div>
            </div>
          </Col>
          <Col span={16}>
            <div className="mt-20 booking-status-list-container">
              <div className="booking-status-tab-container">
                <Tabs
                  type="card"
                  activeKey={activeTab}
                  className="theme-tabs"
                  onChange={handleActiveTab}
                  items={map(BOOKING_STATUS_TABS_VALUES, (tab) => {
                    return {
                      label: <span className="flex-center">{tab?.lable}</span>,
                      key: tab?.value,
                    };
                  })}
                />
                {activeTab && (
                  <BookingList
                    bookingProducts={bookingProducts}
                    tabStatus={activeTab}
                    loadMoreData={loadMoreData}
                    pageLoading={pageLoading}
                    totalProductCount={totalProductCount}
                    handleSelectChange={handleSelectChange}
                  />
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};
export default Bookings;
