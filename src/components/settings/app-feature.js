import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Switch,
  Col,
  Row,
  Spin,
  Space,
  notification,
  Button,
  Input,
  Form,
  Modal,
  Card,
  Select,
} from 'antd';
import {
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { get, includes, isEmpty } from 'lodash';
import {
  getTenant,
  editGridListStatus,
  updateSocialStatus,
  updateDomainTags,
  getCurrenyDetails,
  getDate,
  createOrUpdateProfile,
} from '../../utils/api/url-helper';
import { TenantContext } from '../context/tenant-context';
import {
  FAILED_TO_LOAD,
  GRID_LIST_VIEW_STATUS_UPDATE_FAILED,
  GRID_VIEW_STATUS_UPDATE_SUCCESS,
  LIST_VIEW_STATUS_UPDATE_SUCCESS,
  SOCIAL_LOGIN_UPDATE_SUCCESS,
  LOW_STOCK_LABEL_SUCCESS,
  LOW_STOCK_LIMIT_SUCCESS,
  SOCIAL_UPDATE_FAILED,
  TENANT_MODE_CLIC,
} from '../../shared/constant-values';
import './settings.less';
import LowStockImg from '../../assets/images/low-stock-label.jpg';
import ConfigurationForm from './profile/configuration-form';
import whatsappImg from '../../assets/images/whatsapp.svg';
import facebookImg from '../../assets/images/facebook.svg';
import instaImg from '../../assets/images/Insta.svg';
import googleImg from '../../assets/images/google.svg';
import SettingsMobileHeading from './setting-mobile-heading';

const { Option } = Select;
const { confirm } = Modal;
function Appfeature(properties) {
  const { setScreenState, mobileView } = properties;
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tenantDetails, , setTenantDetails] = useContext(TenantContext);
  const [lowStockVisible, setLowStockVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(true);
  const [currency, setCurrency] = useState([]);
  const [dateList, setDateList] = useState([]);
  const [settingData, setSettingData] = useState([]);
  const [paypalCurrencyCodes, setPaypalCurrencyCodes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [status, setStatus] = useState(0);
  const [tenantUid] = useState(localStorage.getItem('tenantUid'));

  const isclicTenantMode =
    get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC;

  const fetchData = useCallback(() => {
    setLoading(true);
    getTenant()
      .then((response) => {
        const data = get(response, 'data', {});
        setTenantDetails(data);
        form.setFieldsValue({ ...get(data, 'setting', {}) });
        form1.setFieldsValue({ ...get(data, 'setting', {}) });
        setLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error.message || FAILED_TO_LOAD });
        setLoading(false);
      });
  }, []);

  const onFinishConfiguration = (values) => {
    const files = {};

    values.brand_logo = settingData?.brand_logo || [];
    values.admin_logo = settingData?.admin_logo || [];
    values.back_logo = settingData?.back_logo || [];
    values.fav_icon = settingData?.fav_icon || [];
    values.otp_logo = settingData?.otp_logo || [];
    values.login_logo = settingData?.login_logo || [];

    createOrUpdateProfile(values, files)
      .then((response) => {
        if (response?.success) {
          notification.success({
            message: 'Configuration updated successfully',
          });
          fetchData();
        }
      })
      .catch((error) => {
        notification.error({ message: error.message });
      });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchInitialAPICall = () => {
    try {
      const apiCall = [
        getCurrenyDetails({ tableName: 'zupain' }),
        getCurrenyDetails({ tableName: 'paypal' }),
        getDate(),
        getTenant(),
      ];
      Promise.all(apiCall).then((response) => {
        setCurrency(get(response, '[0].data', []));
        const paypalCurrencyCodeList = get(response, '[1].data', []).map(
          (item) => item.currency_code
        );
        setPaypalCurrencyCodes(paypalCurrencyCodeList);
        setDateList(get(response, '[2].data', ''));
        const currentProfileData = get(response, '[3].data.setting', {});
        setSettingData(currentProfileData);
      });
    } catch (error) {
      notification.error({ message: error.message });
    }
  };

  useEffect(() => {
    fetchInitialAPICall();
  }, []);

  const socialStatusUpdate = (item, message, limit) => {
    const value = !get(tenantDetails.setting, item, false);
    let parameters = {};
    if (item === 'social_login') parameters = { social_login: value };
    if (item === 'fresh_chat') parameters = { fresh_chat: value };
    if (item === 'low_stock_label_is_active') {
      parameters = { low_stock_label_is_active: value };
    }
    if (item === 'low_stock_label_limit') {
      parameters = { low_stock_label_limit: limit };
    }
    parameters = { ...parameters, id: get(tenantDetails, 'setting.id', '') };
    updateSocialStatus(parameters)
      .then(() => {
        notification.success({ message });
        setLowStockVisible(false);
        fetchData();
      })
      .catch(() => {
        notification.error({
          message: SOCIAL_UPDATE_FAILED,
        });
        fetchData();
      });
  };

  const handleChange = (value) => {
    const formData =
      value === 'grid_view'
        ? {
            grid_view: !get(tenantDetails, 'setting.grid_view', ''),
            list_view: get(tenantDetails, 'setting.list_view', ''),
            id: get(tenantDetails, 'setting.id', ''),
          }
        : {
            grid_view: get(tenantDetails, 'setting.grid_view', ''),
            list_view: !get(tenantDetails, 'setting.list_view', ''),
            id: get(tenantDetails, 'setting.id', ''),
          };
    editGridListStatus(formData)
      .then(() => {
        notification.success({
          message:
            value === 'grid_view'
              ? GRID_VIEW_STATUS_UPDATE_SUCCESS
              : LIST_VIEW_STATUS_UPDATE_SUCCESS,
        });
        setLoading(false);
        fetchData();
      })
      .catch(() => {
        notification.error({ message: GRID_LIST_VIEW_STATUS_UPDATE_FAILED });
        setLoading(false);
        fetchData();
      });
  };

  const onFinish = (values) => {
    const limit = get(values, 'low_stock_label_limit', 0);
    socialStatusUpdate('low_stock_label_limit', LOW_STOCK_LIMIT_SUCCESS, limit);
  };

  const onChange = (checked) => {
    setStatus(checked ? 1 : 0);
    setIsEdit(false);
  };

  const handleTagChange = (tags) => {
    setSelectedTags(tags);
    setIsEdit(false);
  };

  const onSavetags = () => {
    setLoading(true);
    const parameters = {
      tags: selectedTags,
      status: isEmpty(selectedTags) ? 0 : status,
    };
    updateDomainTags(tenantUid, parameters)
      .then(() => {
        setStatus(isEmpty(selectedTags) ? 0 : status);
        setIsEdit(true);
        fetchData();
        notification.success({ message: 'Successfully updated' });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        notification.error({
          message: 'failed to update',
        });
      });
  };

  useEffect(() => {
    const getSettings = get(tenantDetails, 'setting.authorised_domain', '');
    const tags = isEmpty(getSettings)
      ? []
      : getSettings.split('", "').map((item) => item.replaceAll('"', ''));
    setSelectedTags(tags);
    setStatus(get(tenantDetails, 'setting.domain_status', 0));
  }, [tenantDetails]);

  const handleCurrencyChange = (value) => {
    if (!isclicTenantMode && !includes(paypalCurrencyCodes, value)) {
      confirm({
        title:
          'Paypal doesnot support the selected currency. If you wish to continue Paypal will be disabled.',
        icon: <ExclamationCircleOutlined />,
        onOk() {
          form1.setFieldsValue({ currency: value });
        },
        onCancel() {
          form1.setFieldsValue({
            currency: get(tenantDetails, 'setting.currency', ''),
          });
        },
      });
    }
  };

  const handleRestField = () => {
    fetchData();
  };

  return (
    <Spin spinning={loading}>
      {mobileView && (
        <div className="ml-10">
          <SettingsMobileHeading
            heading="Store Feature"
            Tooltip="true"
            setScreenState={setScreenState}
          />
        </div>
      )}
      <div className="box mobile-side-padding">
        <div className="box__content box-content-background">
          <div className="block-header-settings">configuration</div>
          <Form form={form1} layout="vertical" onFinish={onFinishConfiguration}>
            <ConfigurationForm
              key="configuration"
              currencyList={currency}
              dateList={dateList}
              tenantDetails={tenantDetails}
              handleCurrencyChange={handleCurrencyChange}
            />
            <Space className="flex-end">
              <Button onClick={() => handleRestField()} danger type="default">
                Cancel
              </Button>
              <Button htmlType="submit" type="primary">
                Save
              </Button>
            </Space>
          </Form>
        </div>

        <div className="mt-30p">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6} xl={6} span={6}>
              <Card className="cont-height flex-centric">
                <div className="cat-img-alignment">
                  <img width="25px" src={googleImg} alt="googleIcon" />
                  <img width="25px" src={whatsappImg} alt="WhatsappIcon" />
                  <img width="25px" src={facebookImg} alt="facebookIcon" />
                  <img width="25px" src={instaImg} alt="instaIcon" />
                </div>
                <div className="center cat-img-alignment mt-20">
                  <p className="mr-20p settings-card-title">
                    Social media login
                  </p>
                  <Switch
                    checked={get(tenantDetails, 'setting.social_login', false)}
                    onChange={() => {
                      socialStatusUpdate(
                        'social_login',
                        SOCIAL_LOGIN_UPDATE_SUCCESS
                      );
                    }}
                    className="switch-container"
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} xl={6} span={6}>
              <Card className="cont-height flex-centric">
                <p className="cat-img-alignment settings-card-title">
                  I just want to show my products in
                </p>
                <div className="space-evenly">
                  <div className="center cat-img-alignment mt-20">
                    <Switch
                      checked={get(tenantDetails, 'setting.grid_view', false)}
                      onChange={() => {
                        handleChange('grid_view');
                      }}
                      className="switch-container"
                    />
                    <p className="switch-lable">Grid View</p>
                  </div>
                  <div className="center cat-img-alignment mt-20">
                    <Switch
                      checked={get(tenantDetails, 'setting.list_view', false)}
                      onChange={() => {
                        handleChange('list_view');
                      }}
                      className="switch-container"
                    />
                    <p className="switch-lable">List View</p>
                  </div>
                </div>

                <i className="cat-img-alignment mt-20">
                  Toggle both to show both option in application
                </i>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} xl={6} span={6}>
              <Card className="cont-height flex-centric">
                {/* <Row className="grid-list-view">
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}> */}
                {/* <div className="social-login-feature">
                      <h4 className="text-grey-dark">
                        Low Stock Label{' '}
                        <Tag
                          onClick={() => setPreviewVisible(true)}
                          color="green"
                          style={{
                            fontSize: '20px',
                            borderRadius: '10px',
                          }}
                        >
                          <EyeOutlined />
                        </Tag>
                      </h4>
                    </div> */}
                <div className="center cat-img-alignment">
                  <p className="mr-20p settings-card-title">Low Stock Label</p>
                  <InfoCircleOutlined
                    onClick={() => setPreviewVisible(true)}
                    className="mr-10"
                  />
                  <Switch
                    onChange={() => {
                      socialStatusUpdate(
                        'low_stock_label_is_active',
                        LOW_STOCK_LABEL_SUCCESS
                      );
                    }}
                    className="switch-container"
                  />
                </div>
                <Space className="cat-img-alignment mt-20p">
                  <Form
                    form={form}
                    name="horizontal_login"
                    layout="inline"
                    onFinish={onFinish}
                  >
                    <Form.Item
                      name="low_stock_label_limit"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter Limit!',
                        },
                      ]}
                      className="app-feature-low-stock-input"
                    >
                      <Input placeholder="Enter Limit" />
                    </Form.Item>
                    <Space className="f_btns">
                      <Button htmlType="submit" type="primary">
                        Save
                      </Button>
                    </Space>
                  </Form>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} xl={6} span={6}>
              <Card>
                <div className="d-flex mb-10">
                  <p className="mr-20p settings-card-title">
                    Enter authorised Domain for Sign up
                  </p>
                  <Switch
                    checked={status === 1}
                    className="switch-container"
                    onChange={onChange}
                  />
                </div>
                <Row className="grid-list-view">
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Select
                      mode="tags"
                      virtual={false}
                      style={{ width: '100%' }}
                      placeholder="@example.com"
                      value={selectedTags}
                      onChange={handleTagChange}
                      showArrow={false}
                    >
                      {selectedTags?.map((tag) => (
                        <Option key={tag} value={tag}>
                          {tag}
                        </Option>
                      ))}
                    </Select>
                    <div className="res-center">
                      <Button
                        type="primary"
                        disabled={isEdit}
                        style={{ marginTop: '5px' }}
                        className="res-center"
                        onClick={onSavetags}
                      >
                        save
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
        <Modal
          title="Low Stock Label"
          open={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
        >
          <img
            alt="lowstocklabel.jpg"
            style={{ width: '100%' }}
            src={LowStockImg}
          />
        </Modal>
      </div>
    </Spin>
  );
}

export default Appfeature;
