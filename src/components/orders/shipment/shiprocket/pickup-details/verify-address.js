import { WarningOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row } from 'antd';
import { get } from 'lodash';
import React, { useState } from 'react';

import OtpField from './otp-field';

const VerifyAddress = ({ address, otpVerfiy, sentToOtp, otpVerifyAddress }) => {
  const [form] = Form.useForm();
  const [errorText, setErrorText] = useState('');
  const onFinish = (values) => {
    const {
      otpField1,
      otpField2,
      otpField3,
      otpField4,
      otpField5,
      otpField6,
    } = values;
    const codeInput = `${otpField1}${otpField2}${otpField3}${otpField4}${otpField5}${otpField6}`;
    const pattern = /^[0-9\b]+$/;
    if (codeInput.length !== 6 || codeInput.includes('undefined')) {
      setErrorText('Please Enter OTP!');
    } else if (pattern.test(codeInput)) {
      setErrorText('');
      otpVerifyAddress(codeInput);
    } else {
      setErrorText('Please Enter Valid OTP!');
    }
  };

  return (
    <div className="verify-address-modal-container">
      {!otpVerfiy ? (
        <div className="verify-address-container">
          <div className="unverify-address-container">
            <div>
              <WarningOutlined style={{ color: 'red' }} />
              <span className="unverify-address-text-info">
                Unverified Address
              </span>
            </div>
            <div className="unverify-address-name-text">
              {get(address, 'name', '')}
            </div>
            <div className="unverify-address-text">
              {get(address, 'address', '')}
            </div>
            <div className="unverify-address-mobile">
              {`Mobile: +91 ${get(address, 'phone', '')}`}
            </div>
          </div>
          <div className="verify-address-container">
            <div className="verify-address-text">
              Verify phone number to verify address
            </div>
            <div className="verify-address-otp-text">
              OTP will be send on this phone number
            </div>
            <Row>
              <Col span={18}>
                <Input
                  value={get(address, 'phone', '')}
                  placeholder="Phone number"
                />
              </Col>
              <Col span={4} offset={1}>
                <Button onClick={() => sentToOtp(true)} type="primary">
                  Send OTP
                </Button>
              </Col>
            </Row>
          </div>
        </div>
      ) : (
        <div className="otp-verify-container">
          <div className="verify-otp-label">Enter OTP</div>
          <div className="verify-otp-text">
            OTP has been send to {get(address, 'phone', '')}. Please enter the
            OTP below
          </div>
          <Form form={form} onFinish={onFinish}>
            <Row>
              <Col span={18}>
                <Row>
                  <OtpField otp={1} />
                  <OtpField otp={2} />
                  <OtpField otp={3} />
                  <OtpField otp={4} />
                  <OtpField otp={5} />
                  <OtpField otp={6} />
                </Row>
                <div className="error-text">{errorText}</div>
              </Col>
              <Col span={4} offset={1}>
                <Form.Item>
                  <Button
                    htmlType="submit"
                    className="verify-button"
                    type="primary"
                  >
                    Verify OTP
                  </Button>
                </Form.Item>
              </Col>
            </Row>
            <div className="mt-10">
              Did not receive OTP yet?
              <span className="resend-otp">Resend OTP</span>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
};
export default VerifyAddress;
