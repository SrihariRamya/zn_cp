import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Input,
  Button,
  notification,
  Breadcrumb,
  Space,
  Spin,
} from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import _ from 'lodash';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ReactComponent as PosIcon } from '../../assets/icons/pos.svg';
import { getPOSID, addPOS, editPOS } from '../../utils/api/url-helper';
import getFormItemRules, { trimPayloadFields } from '../../shared/form-helpers';
import {
  POS_ADD_FAILED,
  POS_ADD_SUCCESS,
  POS_UPDATE_FAILED,
  POS_UPDATE_SUCCESS,
  FAILED_TO_LOAD,
} from '../../shared/constant-values';
import './pos.less';

const POSAdd = (properties) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [posID] = useState(window.location.pathname?.split('/')[3]);
  const [disabled, setDisabled] = useState(false);
  const fetchData = useCallback(() => {
    const apiArray = [getPOSID(posID)];
    setLoading(true);
    Promise.all(apiArray)
      .then((result) => {
        form.setFieldsValue(_.get(result, '[0].data', []));
        setLoading(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, [form, posID]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validateError = (name) => {
    if (name === 'model_number') {
      return 'Please enter the model number';
    }
    if (name === 'serial_number') {
      return 'Please enter the serial number';
    }
    if (name === 'pos_machine_name') {
      return 'Please enter the POS ID';
    }
    return '';
  };

  const onReset = () => {
    form.resetFields();
    sessionStorage.setItem('prevPath', location.pathname);
    navigate(-1)
  };

  const onFinish = (values) => {
    values.userPOS = values.user_uid;
    const trimFormValues = {};
    trimPayloadFields(values, trimFormValues);
    let isErrorVisible = false;
    _.forEach(trimFormValues, (value, key) => {
      if (value === '') {
        isErrorVisible = true;
        form.setFields([
          {
            name: key,
            errors: [validateError(key)],
          },
        ]);
      }
    });
    if (!isErrorVisible) {
      setDisabled(true);
      if (posID) {
        editPOS(trimFormValues, posID)
          .then(() => {
            notification.success({ message: POS_UPDATE_SUCCESS });
            setDisabled(false);
            form.resetFields();
            navigate(-1);
            fetchData();
          })
          .catch((error) => {
            setDisabled(false);
            notification.error({
              message: _.get(error, 'error', POS_UPDATE_FAILED),
            });
          });
      } else {
        addPOS(trimFormValues)
          .then(() => {
            notification.success({ message: POS_ADD_SUCCESS });
            setDisabled(false);
            onReset();
            fetchData();
          })
          .catch((error) => {
            setDisabled(false);
            notification.error({
              message: _.get(error, 'error', POS_ADD_FAILED),
            });
          });
      }
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="search-container">
        <div>
          <h1>
            <PosIcon /> POS
          </h1>

          <Breadcrumb separator=">">
            <Breadcrumb.Item className="table-tax">
              <Link to="/">Home</Link>
            </Breadcrumb.Item>

            <Breadcrumb.Item className="table-tax">
              <Link to="/POS">POS</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-title">
              {posID ? 'Edit POS' : 'Add POS'}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <Form.Item>
          <Space>
            <Button
              htmlType="submit"
              type="primary"
              disabled={disabled}
              onClick={() => form.submit()}
            >
              {disabled ? 'Submitting' : 'Save'}
            </Button>
            <Button danger htmlType="cancel" type="text" onClick={onReset}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </div>
      <div className="box" style={{ padding: '0px 10px' }}>
        <div className="box__header bg-gray-lighter">
          {' '}
          <Space>
            <ArrowLeftOutlined type="primary" onClick={onReset} />
            <span className="text-green-dark">
              {' '}
              {posID ? 'Edit POS' : 'Add POS'}
            </span>
          </Space>
        </div>
        <div className="box__content box-content-background">
          <Form
            form={form}
            className="POS-form"
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              label="POS Name"
              name="pos_machine_name"
              rules={[
                {
                  required: true,
                  message: 'Please enter the POS ID',
                },
              ]}
            >
              <Input placeholder="Enter POS Name" />
            </Form.Item>
            <Form.Item
              name="ip_address"
              label="IP Address"
              rules={[
                {
                  required: true,
                  message: 'Please enter the IP Address',
                },
                ...getFormItemRules({ ipAddress: true }),
              ]}
            >
              <Input placeholder="Enter Serial Number" />
            </Form.Item>
            <Form.Item
              label="Model Number"
              name="model_number"
              rules={[
                {
                  required: true,
                  message: 'Please enter the model number',
                },
              ]}
            >
              <Input placeholder="Enter Serial Number" />
            </Form.Item>
            <Form.Item
              name="serial_number"
              label="Serial Number"
              rules={[
                {
                  required: true,
                  message: 'Please enter the serial number',
                },
              ]}
            >
              <Input placeholder="Enter Serial Number" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button htmlType="submit" type="primary" disabled={disabled}>
                  {disabled ? 'Submitting' : 'Save'}
                </Button>
                <Button danger htmlType="cancel" type="text" onClick={onReset}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Spin>
  );
};

export default POSAdd;
