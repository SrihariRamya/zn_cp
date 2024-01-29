/* eslint-disable react-hooks/exhaustive-deps */
import { List, Modal, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { get } from 'lodash';
import BookingListItem from './booking-list-item';
import BookingDetails from './booking-details';

const BookingList = (properties) => {
  const {
    tabStatus,
    bookingProducts,
    pageLoading,
    loadMoreData,
    totalProductCount,
    handleSelectChange,
  } = properties;
  const [bookingData, setBookingData] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState({});
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setBookingData(bookingProducts);
  }, [bookingProducts, tabStatus]);

  const handleSelectedBooking = (data) => {
    setSelectedBooking(data);
    setVisible(true);
  };

  const handleCancel = () => {
    setSelectedBooking({});
    setVisible(false);
  };

  return (
    <div id="scrollableDiv" className="mt-10 booking-list-container">
      <InfiniteScroll
        dataLength={bookingData?.length || 0}
        next={loadMoreData}
        hasMore={bookingData?.length < totalProductCount}
        scrollableTarget="scrollableDiv"
      >
        <List
          itemLayout="horizontal"
          className="booking-list"
          loading={pageLoading}
          dataSource={bookingData}
          renderItem={(item) => {
            return (
              <List.Item>
                <Row
                  style={{ width: '100%' }}
                  className="booking-list-item-container"
                >
                  <BookingListItem
                    tabStatus={tabStatus}
                    handleSelectChange={handleSelectChange}
                    bookingID={get(item, 'booking_product_uid', '')}
                    data={item}
                    handleSelectedBooking={handleSelectedBooking}
                  />
                </Row>
              </List.Item>
            );
          }}
        />
      </InfiniteScroll>
      <Modal
        width={550}
        footer={false}
        visible={visible}
        onCancel={handleCancel}
        className="booking-details-modal"
      >
        <BookingDetails selectedBooking={selectedBooking} />
      </Modal>
    </div>
  );
};
export default BookingList;
