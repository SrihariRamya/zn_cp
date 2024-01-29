import React, { useEffect } from 'react';
import {
  Input,
  Form,
  Button,
  notification,
  Modal,
  Space,
  Row,
  Col,
  Divider,
  Tooltip,
  Card,
} from 'antd';
import { get, isEmpty } from 'lodash';
import { SwapOutlined } from '@ant-design/icons';
import {
  GOOGLE_TAG_MANAGER_TITLE,
  GOOGLE_TAG_COMFIRM_POP_TITLE,
  BUTTON_DELETE_TEXT,
  BUTTON_SAVE_TEXT,
  GOOGLE_TAG_EXIST,
  GOOGLE_TAG_FROM,
  SCREEN_MODE_EDIT,
  GOOGLE_TAG_UPDATE_FAILED,
  SCREEN_MODE_DELETE,
} from '../../../shared/constant-values';
import TagManagerLogo from '../../../assets/logos/tag-manger-logo.svg';
import TagManagerLogoMObile from '../../../assets/logos/tag-manager-logo-mobile.svg';
import { ReactComponent as QuestionIcon } from '../../../assets/icons/question-icon.svg';
import ModalHeader from '../../../shared/modal-header-helper';

const { confirm } = Modal;

function GoogleTagManager(properties) {
  const { updateSettingsData, tenantDetails, mobileView, isModal, setIsModal } =
    properties;
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      google_tag_id: get(tenantDetails, 'setting.google_tag_id', ''),
    });
  }, [tenantDetails]);

  const onSubmit = (values) => {
    const googleTagId = values?.google_tag_id.replaceAll(/\s/g, '');
    const body = {
      google_tag_id: googleTagId,
    };
    if (isEmpty(googleTagId)) {
      notification.error({ message: GOOGLE_TAG_UPDATE_FAILED });
    } else if (
      googleTagId === get(tenantDetails, 'setting.google_tag_id', '')
    ) {
      notification.error({ message: GOOGLE_TAG_EXIST });
    } else {
      updateSettingsData(body, GOOGLE_TAG_FROM, SCREEN_MODE_EDIT);
    }
    return '';
  };

  const removeFacebookPixel = () => {
    confirm({
      title: GOOGLE_TAG_COMFIRM_POP_TITLE,
      onOk() {
        const body = {
          google_tag_id: '',
        };
        updateSettingsData(body, GOOGLE_TAG_FROM, SCREEN_MODE_DELETE);
      },
    });
  };

  const handleTagManagerLogo = () => {
    return (
      <img
        src={mobileView ? TagManagerLogoMObile : TagManagerLogo}
        alt="logout"
      />
    );
  };

  const handleTagManagerTitle = () => {
    return <p className="box-heading-text">Google Tag Manager</p>;
  };

  const handleTagManagerDescription = () => {
    return (
      <span className="box-content-description">
        &quot;Unify, Track, and Optimize with Google Tag Manager.&quot;
      </span>
    );
  };

  const handleTagManagerTooltip = () => {
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
          {isEmpty(get(tenantDetails, 'setting.google_tag_id', ''))
            ? 'Connect'
            : 'Edit'}
        </Button>
      </div>
    );
  };

  const handleTagManager = () => {
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
                    <Col span={6}>{handleTagManagerLogo()}</Col>
                    <Col span={18}>
                      <Row className="box-text-main-row">
                        <Col span={22}>{handleTagManagerTitle()}</Col>
                        <Col span={2}> {handleTagManagerTooltip()}</Col>
                      </Row>
                      <Row className="box-description-main-row">
                        {handleTagManagerDescription()}
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
                      <Col span={20}>{handleTagManagerLogo()}</Col>
                      <Col span={4} className="flexbox-end">
                        {handleTagManagerTooltip()}
                      </Col>
                    </Row>
                    <Row
                      className="box-text-main-row"
                      style={{ display: 'block' }}
                    >
                      <Row>{handleTagManagerTitle()}</Row>
                      <Row>{handleTagManagerDescription()}</Row>
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
      {handleTagManager()}
      <Modal
        open={isModal}
        footer={false}
        onCancel={handleCancel}
        className="settings-payment-modal"
        width={700}
      >
        <ModalHeader title={GOOGLE_TAG_MANAGER_TITLE} />
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
            label="Google Tag Manager Id"
            name="google_tag_id"
            rules={[
              {
                required: true,
                message: 'Please Enter Google Tag Manager Id!',
              },
            ]}
          >
            <Input placeholder="Google Tag Manager Id" />
          </Form.Item>
          <Form.Item>
            <div className="flex-end mt-20">
              <Space>
                <Button
                  type="danger"
                  disabled={isEmpty(
                    get(tenantDetails, 'setting.google_tag_id', '')
                  )}
                  onClick={() => removeFacebookPixel()}
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

export default GoogleTagManager;
