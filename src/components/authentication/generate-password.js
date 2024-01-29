import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, notification } from 'antd';
import { resetPass } from '../../utils/api/url-helper';

function GeneratePassword() {
  const [form] = Form.useForm();
  const { token } = useParams();
  const navigate = useNavigate();

  const onFinish = (values) => {
    resetPass({ password: values.password, token })
      .then((response) => {
        notification.success({ message: response.message });
        navigate('/');
      })
      .catch((error) => {
        notification.error({ message: error.error });
      });
  };

  return (
    <div className="error-container">
      <div>
        <div className="text-center" />
        <h2>Create New Password</h2>
        <p>Enter your new password below.</p>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Repeat Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Please confirm your password!',
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject();
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item style={{ 'margin-bottom': 0 }}>
            <input type="hidden" name="_csrf" value="<%= csrfToken %>" />
            <input type="hidden" name="userID" value="<%= userID%>" />
            <Button htmlType="submit" type="primary">
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
export default GeneratePassword;
