import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Spin,
  Avatar,
  Button,
  Form,
  Input,
  Space,
  Modal,
  Breadcrumb,
  Select,
  notification,
} from 'antd';
import { get } from 'lodash';
import { UserOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import {
  FAILED_TO_LOAD,
  FAILED_TO_UPDATE_USER_PROFILE,
  USER_PROFILE_UPDATE_SUCCESS,
} from '../../shared/constant-values';
import { CustomUpload } from '../../shared/form-helpers';
import { getCurrentUser, updateUserPassword } from '../../utils/api/url-helper';
import { getBase64 } from '../../shared/attributes-helper';

const { Option } = Select;

const UserProfile = (properties) => {
  const { readOnly, showButton, readOnlyMode } = properties;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [enableSave, setEnableSave] = useState(false);
  const [userData, setUserData] = useState({});
  const [userID] = useState(localStorage.getItem('userID'));
  const [fileListState, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [imgUrl, setImgUrl] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { confirm } = Modal;

  const fetchData = useCallback(() => {
    setLoading(true);
    getCurrentUser({ user_uid: userID })
      .then((response) => {
        const data = get(response, 'data', {});
        setUserData({ ...data });
        const imageData = get(data, 'image', '')
          ? [
              {
                url: get(data, 'user_image', ''),
                status: 'done',
                name: get(data, 'image_name', ''),
              },
            ]
          : [];
        setFileList(imageData);
        form.setFieldsValue(data);
        setLoading(false);
      })
      .catch((error) => {
        notification.error({
          message: error.message || FAILED_TO_LOAD,
        });
        setLoading(false);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
      setPreviewTitle(
        file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
      );
    }
    setImgUrl(file.url || file.preview);
    setPreviewVisible(true);
  };

  const closeImage = () => {
    setPreviewVisible(false);
  };

  const onFinish = (values) => {
    setLoading(true);
    const file = {
      files: fileListState.map((item) => item.originFileObj),
    };
    const formData = {
      new_password: values.new_password || '',
      confirm_password: values.confirm_password || '',
      current_password: values.current_password || '',
    };

    updateUserPassword(formData, file, userID)
      .then((result) => {
        if (result.success) {
          notification.success({ message: USER_PROFILE_UPDATE_SUCCESS });
          setEnableSave(false);
          form.resetFields();
          readOnlyMode();
          fetchData();
        }
        setLoading(false);
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'error', FAILED_TO_UPDATE_USER_PROFILE),
        });
        setLoading(false);
      });
  };
  const handleBack = () => {
    setPreviewVisible(false);
  };

  const handleCancel = () => {
    setFileList([]);
    setEnableSave(false);
    form.resetFields();
    readOnlyMode();
    fetchData();
  };

  const showCancelModal = () => {
    confirm({
      title: 'Are you sure want to cancel the changes?',
      icon: <ExclamationCircleOutlined />,

      onOk() {
        handleCancel();
      },
      onCancel() {
        handleBack();
      },
    });
  };

  useEffect(() => {
    const mobileImage = fileListState.length
      ? URL.createObjectURL(get(fileListState, '[0].originFileObj', ''))
      : '';
    setImageUrl(mobileImage);
  }, [fileListState]);

  const prefixSelector = (
    <Form.Item name="country_code" noStyle>
      <Select
        virtual={false}
        className="country-code-bor"
        style={{
          width: 70,
        }}
        disabled
      >
        <Option value="+91">+91</Option>
      </Select>
    </Form.Item>
  );

  const handleOnValuesChange = (changedValues) => {
    if (changedValues) {
      setEnableSave(true);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="box">
        <Form
          form={form}
          onFinish={onFinish}
          onValuesChange={handleOnValuesChange}
        >
          <fieldset disabled={!readOnly}>
            <div className="box__header bg-gray-lighter">
              <Breadcrumb separator=">">
                <Breadcrumb.Item className="table-tax">
                  <Link to="/"> Home </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item className="customer-breadcrum">
                  User Profile
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <div className="box__content box-content-background user-profile-box-content zp_form__grid pt-0 br-b-1">
              <div className="customers-container">
                <div style={{ marginTop: '10px' }}>
                  <Avatar
                    size={162}
                    icon={
                      get(userData, 'image_name', '') ? (
                        <img
                          src={imageUrl || get(userData, 'user_image', '')}
                          alt={get(userData, 'image_name', 'profile')}
                        />
                      ) : (
                        <UserOutlined />
                      )
                    }
                  />
                </div>
                <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                  <Form.Item name="user_image">
                    <CustomUpload
                      buttonUpload
                      setFileList={setFileList}
                      fileListState={fileListState}
                      handlePreview={handlePreview}
                      width={162}
                      disabled={!readOnly}
                      height={162}
                      maxItem={1}
                    />
                  </Form.Item>
                </div>
                <div className="zp_form__grid my-2">
                  <h4 className="use-pf-label">User Name</h4>
                  <Form.Item name="user_name">
                    <Input disabled />
                  </Form.Item>
                </div>
                <div className="zp_form__grid my-2">
                  <h4 className="use-pf-label">Phone Number</h4>
                  <Form.Item name="phone_number">
                    <Input
                      className="country-code-pad"
                      prefix={prefixSelector}
                      style={{
                        width: '100%',
                      }}
                      disabled
                    />
                  </Form.Item>
                </div>
                <div className="zp_form__grid my-2">
                  <h4 className="use-pf-label">Email Address</h4>
                  <Form.Item name="email_address">
                    <Input disabled />
                  </Form.Item>
                </div>
                <div className="zp_form__grid my-2">
                  <h4 className="use-pf-label">Current password</h4>
                  <Form.Item
                    name="current_password"
                    rules={[
                      {
                        min: 5,
                        message:
                          'Password must conatain at least 5 characters.',
                      },
                    ]}
                  >
                    <Input.Password autoComplete="new-password" />
                  </Form.Item>
                </div>
                <div className="zp_form__grid my-2">
                  <h4 className="use-pf-label">New password</h4>
                  <Form.Item
                    name="new_password"
                    rules={[
                      {
                        required: !!form.getFieldValue('current_password'),
                        message: 'Please enter your password!',
                      },
                      {
                        min: 5,
                        message:
                          'Password must conatain at least 5 characters.',
                      },
                    ]}
                  >
                    <Input.Password autoComplete="new-password" />
                  </Form.Item>
                </div>
                <div className="zp_form__grid my-2">
                  <h4 className="use-pf-label">Confirm new password</h4>
                  <Form.Item
                    name="confirm_password"
                    dependencies={['new_password']}
                    hasFeedback
                    rules={[
                      {
                        required: !!form.getFieldValue('current_password'),
                        message: 'Please confirm your password!',
                      },
                      ({ getFieldValue }) => ({
                        validator(_rule, value) {
                          if (
                            !value ||
                            getFieldValue('new_password') === value
                          ) {
                            return Promise.resolve();
                          }

                          return Promise.reject(
                            new Error(
                              'The two passwords that you entered do not match!'
                            )
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password autoComplete="new-password" />
                  </Form.Item>
                </div>
                {showButton && (
                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        disabled={!enableSave}
                      >
                        Save
                      </Button>
                      <Button
                        danger
                        onClick={() => {
                          if (enableSave) {
                            showCancelModal();
                          } else handleCancel();
                        }}
                      >
                        cancel
                      </Button>
                    </Space>
                  </Form.Item>
                )}
              </div>
              {get(userData, 'zm_store', '') && (
                <div className="br-1 box">
                  <div className="box__content">
                    <div className="block-header">Store Details</div>
                    <div className="my-2 order-box">
                      <div className="customers-container">
                        <div className="zp_form__grid my-2">
                          <h4>Store Name</h4>
                          <span>
                            {get(userData, 'zm_store.store_name', '')}
                          </span>
                        </div>
                        <div className="zp_form__grid my-2">
                          <h4>Contact Person</h4>
                          <span>
                            {get(userData, 'zm_store.store_person_name', '')}
                          </span>
                        </div>
                        <div className="zp_form__grid my-2">
                          <h4>Contact Person Number</h4>
                          <span>
                            {' '}
                            {get(userData, 'zm_store.country_code', '')}{' '}
                            {get(userData, 'zm_store.store_person_number', '')}
                          </span>
                        </div>
                        <div className="zp_form__grid my-2">
                          <h4>Store Location</h4>
                          <span>
                            {get(userData, 'zm_store.store_location', '')}
                          </span>
                        </div>
                        <div className="zp_form__grid my-2">
                          <h4>Store Address</h4>
                          <div className="mt-30">
                            <p style={{ fontSize: '12px' }}>
                              {get(userData, 'zm_store.address_1', '')}
                            </p>
                            <p style={{ fontSize: '12px' }}>
                              {get(userData, 'zm_store.address_2', '')}
                            </p>
                            <p style={{ fontSize: '12px' }}>
                              {get(userData, 'zm_store.city', '')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Modal
              visible={previewVisible}
              title={previewTitle}
              footer={null}
              onCancel={closeImage}
            >
              <img alt={previewTitle} style={{ width: '100%' }} src={imgUrl} />
            </Modal>
          </fieldset>
        </Form>
      </div>
    </Spin>
  );
};

export default UserProfile;
