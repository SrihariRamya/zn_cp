import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, notification } from 'antd';
import { sendPass } from '../../utils/api/url-helper';

function ForgetPassword() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (localStorage.getItem('userName') && localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const onFinish = (values) => {
    const email = values;
    setLoading(true);
    sendPass(email)
      .then((response) => {
        if (response?.success) {
          notification.success({ message: response.message });
          form.resetFields();
        } else {
          notification.error({ message: response.error });
        }
        setLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error.error });
        form.resetFields();
        setLoading(false);
      });
  };

  return (
    <div className="error-container">
      <div>
        <div className="text-center" />
        <h2>Password Reset</h2>
        <p>
          Please provide your account’s email and we will send you a reset
          password link
        </p>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: 'Please enter user email!',
              },
              {
                type: 'email',
                message: 'Please enter a valid email address',
              },
            ]}
          >
            <Input className="mt-10" placeholder="User email" />
          </Form.Item>
          <Form.Item style={{ 'margin-bottom': 0 }}>
            <Button loading={loading} htmlType="submit" type="primary">
              Send Mail
            </Button>
          </Form.Item>
        </Form>
        <p>
          <Link to="/">Login?</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgetPassword;
