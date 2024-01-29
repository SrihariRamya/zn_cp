import { get, isEmpty } from 'lodash';
import React, { useEffect } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  notification,
  Row,
  Col,
  Card,
  Divider,
  Tooltip,
} from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import ModalHeader from '../../../shared/modal-header-helper';
import {
  ANALYTIC_COMFIRM_POP_TITLE,
  BUTTON_DELETE_TEXT,
  BUTTON_SAVE_TEXT,
  GOOGLE_ANALYTICS_TITLE,
  GOOGLE_ANALYTIC_ERROR,
  GOOGLE_ANALYTIC_EXIST,
  GOOGLE_ANALYTIC_FROM,
  SCREEN_MODE_DELETE,
  SCREEN_MODE_EDIT,
  TENANT_MODE_CLIC,
} from '../../../shared/constant-values';
import AnalyticLogo from '../../../assets/logos/analtylics-logo.svg';
import AnalyticLogoMobile from '../../../assets/logos/analtyics-logo-mobile.svg';
import { ReactComponent as QuestionIcon } from '../../../assets/icons/question-icon.svg';

const { confirm } = Modal;

function GoogleAnalytics(properties) {
  const [form] = Form.useForm();

  const { tenantDetails, updateSettingsData, mobileView, isModal, setIsModal } =
    properties;
  const clicTenantMode =
    get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC;

  useEffect(() => {
    form.setFieldsValue({
      google_analytics_key: get(
        tenantDetails,
        'setting.google_analytics_key',
        ''
      ),
      property_id: get(tenantDetails, 'setting.property_id', ''),
    });
  }, [tenantDetails]);

  const onFinish = (values) => {
    const {
      google_analytics_key: googleAnalyticsKey,
      property_id: propertyID,
    } = values;
    const measurementId = googleAnalyticsKey.replaceAll(/\s/g, '');
    const propertyId = propertyID.replaceAll(/\s/g, '');
    const body = {
      google_analytics_key: measurementId,
      property_id: propertyId,
    };
    if (!isEmpty(measurementId) && !isEmpty(propertyId)) {
      if (
        measurementId ===
          get(tenantDetails, 'setting.google_analytics_key', '') &&
        propertyId === get(tenantDetails, 'setting.property_id', '')
      ) {
        notification.error({ message: GOOGLE_ANALYTIC_EXIST });
      } else {
        updateSettingsData(body, GOOGLE_ANALYTIC_FROM, SCREEN_MODE_EDIT);
      }
    } else notification.error({ message: GOOGLE_ANALYTIC_ERROR });
  };

  const clearGoogleAnalytic = () => {
    confirm({
      title: ANALYTIC_COMFIRM_POP_TITLE,
      className:
        get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC &&
        'clic-confirm-modal',
      onOk() {
        setIsModal(false);
        const body = {
          google_analytics_key: '',
          property_id: '',
        };
        updateSettingsData(body, GOOGLE_ANALYTIC_FROM, SCREEN_MODE_DELETE);
      },
    });
  };

  const handleAnalyticsLogo = () => {
    return (
      <img src={mobileView ? AnalyticLogoMobile : AnalyticLogo} alt="logout" />
    );
  };

  const handleAnalyticsTitle = () => {
    return <p className="box-heading-text">Google Analytics</p>;
  };

  const handleAnalyticsDescription = () => {
    return (
      <span className="box-content-description">
        Ethical Analytics, Powerful Insights.
      </span>
    );
  };

  const handleAnalyticsTooltip = () => {
    return (
      <Tooltip title="Help and resources.">
        <QuestionIcon className="question-icon" />
      </Tooltip>
    );
  };

  const handleCancel = () => {
    setIsModal(false);
  };
  const handleOpenModal = () => {
    setIsModal(true);
  };

  const handleConnectButton = () => {
    return (
      <div className="connect-btn-styles">
        <Button
          type="primary"
          onClick={handleOpenModal}
          icon={<SwapOutlined />}
        >
          {isEmpty(get(tenantDetails, 'setting.google_analytics_key', ''))
            ? 'Connect'
            : 'Edit'}
        </Button>
      </div>
    );
  };

  const handleAnalytics = () => {
    return (
      <div>
        <div className="card-container report">
          <Row
            className="all-analytics"
            gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
          >
            <Col xs={24} sm={24} md={12} lg={24} xl={24}>
              <Card className="payment-setup-box">
                {mobileView ? (
                  <Row>
                    <Col span={6}>{handleAnalyticsLogo()}</Col>
                    <Col span={18}>
                      <Row className="box-text-main-row">
                        <Col span={22}>{handleAnalyticsTitle()}</Col>
                        <Col span={2}> {handleAnalyticsTooltip()}</Col>
                      </Row>
                      <Row className="box-description-main-row">
                        {handleAnalyticsDescription()}
                      </Row>
                      <Divider />
                      <Row>
                        <Col span={18}>{handleConnectButton()}</Col>
                      </Row>
                    </Col>
                  </Row>
                ) : (
                  <>
                    <Row>
                      <Col span={20}>{handleAnalyticsLogo()}</Col>
                      <Col span={4} className="flexbox-end">
                        {handleAnalyticsTooltip()}
                      </Col>
                    </Row>
                    <Row
                      className="box-text-main-row"
                      style={{ display: 'block', height: '110px' }}
                    >
                      <Row>{handleAnalyticsTitle()}</Row>
                      <Row>{handleAnalyticsDescription()}</Row>
                    </Row>
                    <Divider />
                    <Row>
                      <Col span={20}>{handleConnectButton()}</Col>
                    </Row>
                  </>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  return (
    <div className={clicTenantMode ? 'clic-product-container' : ''}>
      {handleAnalytics()}
      <Modal
        open={isModal}
        footer={false}
        onCancel={handleCancel}
        className="settings-payment-modal"
        width={700}
      >
        {!clicTenantMode && <ModalHeader title={GOOGLE_ANALYTICS_TITLE} />}
        <Form
          initialValues={{
            remember: true,
          }}
          layout="vertical"
          form={form}
          onFinish={onFinish}
        >
          <Form.Item
            label="Enter Google Analytic Measurement Id"
            name="google_analytics_key"
            rules={[
              {
                required: true,
                message: 'Please Enter Measurement Id!',
              },
            ]}
          >
            <Input placeholder="Example G-*****" />
          </Form.Item>
          <Form.Item
            label="Enter Google Analytic Property Id"
            name="property_id"
            rules={[
              {
                required: true,
                message: 'Please Enter Property Id!',
              },
            ]}
            initialValue={get(tenantDetails, 'setting.property_id', '')}
          >
            <Input placeholder="Property id" />
          </Form.Item>
          <Form.Item>
            <div className="flex-end mt-20">
              <Space>
                <Button
                  type="danger"
                  disabled={isEmpty(
                    get(tenantDetails, 'setting.google_analytics_key', '')
                  )}
                  onClick={() => clearGoogleAnalytic()}
                >
                  {BUTTON_DELETE_TEXT}
                </Button>
                <Button htmlType="submit" type="primary" className="ten">
                  {BUTTON_SAVE_TEXT}
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default GoogleAnalytics;
