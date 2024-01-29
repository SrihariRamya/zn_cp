import { Col, Form, Row } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';
import React from 'react';
import {
  DATE_WITHOUT_TIME_FORMAT,
  SLOT_FORMAT,
} from '../../../shared/constant-values';

const BookingDetails = (properties) => {
  const { selectedBooking } = properties;
  const [form] = Form.useForm();
  return (
    <div className="booking-details-container">
      <Form form={form} autoComplete="off">
        <Row>
          <Col span={6}>
            <div className="booking-label">Client Name</div>
            <div className="booking-value">{selectedBooking?.user_name}</div>
          </Col>
          <Col span={6}>
            <div className="booking-label">Phone Number</div>
            <div className="booking-value">{`+91 ${selectedBooking?.phone_number}`}</div>
          </Col>
          <Col span={8}>
            <div className="booking-label text-center">Slot Timing</div>
            <div className="booking-value text-center">
              {selectedBooking?.booking_time}
              <div className="booking-date-value text-center">
                {moment(selectedBooking?.booking_date).format(
                  DATE_WITHOUT_TIME_FORMAT
                )}
              </div>
            </div>
          </Col>
          <Col span={4}>
            <div className="booking-label text-center">Booked on</div>
            <div className="booking-value text-center">
              {moment(selectedBooking?.creation_date).format(SLOT_FORMAT)}
            </div>
            <div className="booking-date-value text-center">
              {moment(selectedBooking?.creation_date).format(
                DATE_WITHOUT_TIME_FORMAT
              )}
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className="booking-label">Message</div>
            <div className="booking-value mt-10">
              <TextArea disabled value={selectedBooking?.message} />
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default BookingDetails;
