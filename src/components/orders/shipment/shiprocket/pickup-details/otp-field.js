import React from 'react';
import { Input, Col } from 'antd';

const OtpField = (properties) => {
  const { otp, inputRef } = properties;

  const handleTextChange = (event) => {
    const { length } = event.target.value;
    const { id, form } = event.target;
    const index = Number(id);
    if (length === 1) {
      if (index !== 6) form.elements[index].focus();
    }
  };

  const field = (
    <Col span={3} xs={4} className="input-otp input-otp-style">
      <Input
        className="text-center"
        id={otp}
        maxLength="1"
        name={`otpField${otp}`}
        size="1"
        min="0"
        max="9"
        ref={inputRef}
        onChange={(event) => handleTextChange(event)}
      />
    </Col>
  );
  return field;
};

export default OtpField;
