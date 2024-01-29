import React, { useEffect, useState } from 'react';
import {
  Input,
  Form,
  Button,
  notification,
  Modal,
  Space,
  Tooltip,
  Row,
  Col,
  Divider,
  Card,
} from 'antd';
import { get, isEmpty } from 'lodash';
import { SwapOutlined } from '@ant-design/icons';
import {
  FACEBOOK_PIXEL_EXIST,
  REMOVE_FACEBOOK_PIXEL,
  FACEBOOK_PIXEL_TITLE,
  SCREEN_MODE_EDIT,
  FB_PIXEL_TAG_FROM,
  SCREEN_MODE_DELETE,
  BUTTON_DELETE_TEXT,
  BUTTON_SAVE_TEXT,
  FACEBOOK_PIXEL_UPDATE_FAILED,
} from '../../../shared/constant-values';
import PixelLogo from '../../../assets/logos/pixel-logo.svg';
import PixelLogoMobile from '../../../assets/logos/pixel-logo-mobile.svg';
import { ReactComponent as QuestionIcon } from '../../../assets/icons/question-icon.svg';
import ModalHeader from '../../../shared/modal-header-helper';

const { confirm } = Modal;

function FacebookPixel(properties) {
  const { tenantDetails, updateSettingsData, mobileView, isModal, setIsModal } =
    properties;
  const [btnloading, setButtonLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      facebook_pixel_id: get(tenantDetails, 'setting.facebook_pixel_id', ''),
    });
  }, [form, tenantDetails]);

  const onSubmit = (values) => {
    setButtonLoading(true);
    const facebookPixelId = values?.facebook_pixel_id.replaceAll(/\s/g, '');
    const body = {
      facebook_pixel_id: facebookPixelId,
    };
    if (isEmpty(facebookPixelId)) {
      notification.error({ message: FACEBOOK_PIXEL_UPDATE_FAILED });
    } else if (
      facebookPixelId === get(tenantDetails, 'setting.facebook_pixel_id', '')
    ) {
      notification.error({ message: FACEBOOK_PIXEL_EXIST });
      setButtonLoading(false);
    } else {
      updateSettingsData(body, FB_PIXEL_TAG_FROM, SCREEN_MODE_EDIT);
    }
    setButtonLoading(false);
  };

  const removeFacebookPixel = () => {
    confirm({
      title: REMOVE_FACEBOOK_PIXEL,
      onOk() {
        setIsModal(false);
        const body = {
          facebook_pixel_id: '',
        };
        updateSettingsData(body, FB_PIXEL_TAG_FROM, SCREEN_MODE_DELETE);
      },
    });
  };

  const handlePixelLogo = () => {
    return <img src={mobileView ? PixelLogoMobile : PixelLogo} alt="logo" />;
  };

  const handlePixelTitle = () => {
    return <p className="box-heading-text">Facebook Pixel</p>;
  };

  const handlePixelDescription = () => {
    return (
      <span className="box-content-description">
        Measure, Optimise and build audiences for your ad campaigns with the
        Facebook pixel.
      </span>
    );
  };

  const handlePixelTooltip = () => {
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
          {isEmpty(get(tenantDetails, 'setting.facebook_pixel_id', ''))
            ? 'Connect'
            : 'Edit'}
        </Button>
      </div>
    );
  };

  const handlePixel = () => {
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
                    <Col span={6}>{handlePixelLogo()}</Col>
                    <Col span={18}>
                      <Row className="box-text-main-row">
                        <Col span={22}>{handlePixelTitle()}</Col>
                        <Col span={2}> {handlePixelTooltip()}</Col>
                      </Row>
                      <Row className="box-description-main-row">
                        {handlePixelDescription()}
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
                      <Col span={20}>{handlePixelLogo()}</Col>
                      <Col span={4} className="flexbox-end">
                        {handlePixelTooltip()}
                      </Col>
                    </Row>
                    <Row
                      className="box-text-main-row"
                      style={{ display: 'block' }}
                    >
                      <Row>{handlePixelTitle()}</Row>
                      <Row>{handlePixelDescription()}</Row>
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
    <div className="add-product-main-container">
      {handlePixel()}
      <Modal
        open={isModal}
        footer={false}
        onCancel={handleCancel}
        className="settings-payment-modal"
        width={700}
      >
        <ModalHeader title={FACEBOOK_PIXEL_TITLE} />
        <Form
          name="Analytic"
          layout="vertical"
          initialValues={{
            remember: true,
          }}
          form={form}
          onFinish={onSubmit}
          autoComplete="off"
        >
          <Form.Item
            className="property-key"
            label="Enter Facebook Pixel Id"
            name="facebook_pixel_id"
            rules={[
              {
                required: true,
                message: 'Please Enter Facebook Pixel Id!',
              },
            ]}
          >
            <Input placeholder="Facebook Pixel Id" />
          </Form.Item>
          <Form.Item className="delete-modal-pixel">
            <div className="flex-end mt-20">
              <Space>
                <Button
                  type="danger"
                  disabled={isEmpty(
                    get(tenantDetails, 'setting.facebook_pixel_id', '')
                  )}
                  onClick={() => removeFacebookPixel()}
                >
                  {BUTTON_DELETE_TEXT}
                </Button>
                <Button
                  loading={btnloading}
                  htmlType="submit"
                  type="primary"
                  className="ten"
                >
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

export default FacebookPixel;
