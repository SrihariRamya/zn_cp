import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Spin,
  Switch,
  notification,
  Modal,
  Button,
  Form,
  Input,
  Popconfirm,
  Empty,
  Tooltip,
  Divider,
  Tabs,
  Tour,
} from 'antd';
import { CopyOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { filter, get, isEmpty, map, trim } from 'lodash';
import CopyToClipboard from 'react-copy-to-clipboard';
import CryptoJS from 'crypto-js';
import ModalHeader from '../../../shared/modal-header-helper';
import Dunzo from '../../../assets/images/dunzo.jpg';
import Shiprocket from '../../../assets/logos/shiprocket-logo.svg';
import ShiprocketMobile from '../../../assets/logos/shiprocket-logo-mobile.svg';
import Delhivery from '../../../assets/logos/delhivery-logo.svg';
import DelhiveryMobile from '../../../assets/logos/delhivery-logo-mobile.svg';
import Shippo from '../../../assets/logos/shoppo-logo.png';
import {
  disableTabEnterKey,
  enableTabEnterKey,
} from '../../../shared/function-helper';

import {
  FAILED_TO_LOAD,
  SHIPMENT_METHOD_SLUG_SHIPROCKET,
  SHIPMENT_METHOD_SLUG_DELHIVERY,
  SHIPMENT_UPDATE_FAILED,
  SHIPMENT_UPDATE_SUCCESS,
  SHIPMENT_METHOD_SLUG_SHIPPO,
} from '../../../shared/constant-values';
import { MilestoneContext } from '../../context/milestone-context';
import { ReactComponent as ModalBg } from '../../../assets/delhiveryModal.svg';

import {
  getAllShipmentMethods,
  updateShipmentMethod,
  putOnboardSubGuide,
  createInitialAddress,
} from '../../../utils/api/url-helper';
import { ReactComponent as QuestionIcon } from '../../../assets/icons/question-icon.svg';

const { TabPane } = Tabs;

const shipmentImage = {
  dunzo: Dunzo,
  shiprocket: Shiprocket,
  delhivery: Delhivery,
  shippo: Shippo,
};
const shipmentImageMobile = {
  dunzo: Dunzo,
  shiprocket: ShiprocketMobile,
  delhivery: DelhiveryMobile,
  shippo: Shippo,
};

function CredentialButton(parameters) {
  const { data, onSubmit } = parameters;
  if (get(data, 'slug') === SHIPMENT_METHOD_SLUG_DELHIVERY) {
    return (
      <div className="connect-btn-styles">
        <Button
          id="shipment-btn"
          htmlType="submit"
          type="primary"
          onClick={() => {
            onSubmit(data, 'delhivery');
          }}
        >
          {isEmpty(get(data, 'api_token', '')) ? (
            <> Login </>
          ) : (
            <> Edit API Login</>
          )}
        </Button>
      </div>
    );
  }
  if (get(data, 'slug') === SHIPMENT_METHOD_SLUG_SHIPROCKET) {
    return (
      <div className="connect-btn-styles">
        <Button
          id="shipment-btn"
          htmlType="submit"
          type="primary"
          onClick={() => {
            onSubmit(data, 'shiprocket');
          }}
        >
          {!isEmpty(get(data, 'email', '')) &&
          !isEmpty(get(data, 'password', '')) ? (
            <> Edit User Login</>
          ) : (
            <> User Login </>
          )}
        </Button>
      </div>
    );
  }
  if (get(data, 'slug') === SHIPMENT_METHOD_SLUG_SHIPPO) {
    return (
      <div className="connect-btn-styles">
        <Button
          id="shipment-btn"
          htmlType="submit"
          type="primary"
          onClick={() => {
            onSubmit(data, 'shippo');
          }}
        >
          {isEmpty(get(data, 'api_token', '')) ? (
            <> Add Api token </>
          ) : (
            <> Edit Api Token</>
          )}
        </Button>
      </div>
    );
  }
  // eslint-disable-next-line unicorn/no-null
  return null;
}

function completeTour() {
  putOnboardSubGuide({
    completed: true,
    slug: 'shipment',
  });
}

function Shipment(properties) {
  const { mobileView } = properties;
  const [openTourModal, setOpenTourModal] = useState(false);
  const [tourCurrentStep, setTourCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shipmentMethods, setShipmentMethods] = useState([]);
  const [indianPaymentMethods, setIndianPaymentMethods] = useState([]);
  const [otherPaymentMethods, setOtherPaymentMethods] = useState([]);
  const [updateId, setUpdateId] = useState({ Id: undefined });
  const [credentialModal, setCredentialModal] = useState(false);
  const [shiprocketCredential, setShiprocketCredential] = useState({});
  const [delhiveryCredential, setDelhiveryCredential] = useState({});
  const [shippoCredential, setShippoCredential] = useState({});
  const [credentialDisable, setCredentialDisable] = useState(true);
  const [shipRocketToken, setShipRocketToken] = useState('');
  const { hostname } = window.location;
  const [delhiveryCredentialModal, setDelhiveryCredentialModal] =
    useState(false);
  const [shippoModal, setshippoModal] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [completeModal, setCompleteModal] = useState(false);
  const formReference = useRef();
  const { fetchTourData } = useContext(MilestoneContext);
  const navigate = useNavigate();

  const fetchShipmentMethodData = () => {
    setLoading(true);
    const apiArray = [getAllShipmentMethods()];
    Promise.all(apiArray)
      .then(async (response) => {
        const tourDataValues = await fetchTourData();
        const couponData = get(tourDataValues, 'data.[4]');
        const couponTourDatas = get(couponData, 'subGuide.[0]');
        const isOneShipmentCreated = get(couponTourDatas, 'completed', false);
        if (!mobileView) {
          setOpenTourModal(!isOneShipmentCreated);
        }
        setShipRocketToken(get(response, '[0].shipRocketToken'));
        const dataSource = get(response, '[0].data', []);
        get(response, '[0].data', []).map((item) => {
          const returnData = item;
          if (returnData.password) {
            const bytes = CryptoJS.AES.decrypt(
              get(item, 'password', ''),
              get(response, '[0].shipRocketToken', '')
            );
            returnData.password = bytes.toString(CryptoJS.enc.Utf8);
          }
          return returnData;
        });
        const shipmentMethodData = filter(
          dataSource,
          (item) => item.slug !== 'self_ship'
        );
        const indianMethods = new Set(['Shiprocket', 'Delhivery']);
        const otherMethods = new Set(['Shippo Shipment']);

        const india = shipmentMethodData.filter((pay) =>
          indianMethods.has(pay.method_name)
        );
        const other = shipmentMethodData.filter((pay) =>
          otherMethods.has(pay.method_name)
        );
        setIndianPaymentMethods(india);
        setOtherPaymentMethods(other);
        setShipmentMethods(shipmentMethodData);
        setLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error || FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchShipmentMethodData();
  }, []);

  const updateShipmentMode = async (value) => {
    const { Id, checked, email, password, forceActivate, apiToken } = value;
    setLoading(true);
    updateShipmentMethod(Id, {
      is_active: checked,
      email,
      password,
      force_activate: forceActivate,
      api_token: trim(apiToken),
      active_address: 0,
    })
      .then(async (resp) => {
        if (get(resp, 'success', false)) {
          if (openTourModal) {
            setCompleteModal(true);
            setOpenTourModal(false);
            await putOnboardSubGuide({
              completed: true,
              slug: 'shipment',
            });
            setTimeout(() => {
              setCompleteModal(false);
              navigate('/dashboard');
            }, 4000);
          }
          notification.success({ message: SHIPMENT_UPDATE_SUCCESS });
          setCredentialModal(false);
          setDelhiveryCredentialModal(false);
          setshippoModal(false);
          setCredentialDisable(true);
          fetchShipmentMethodData();
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        if (
          get(error, 'message', '').includes('Login to activate shiprocket')
        ) {
          setUpdateId({
            Id,
            checked: true,
          });
          setCredentialModal(true);
        } else if (
          get(error, 'message', '').includes('Login to activate delhivery')
        ) {
          setUpdateId({
            Id,
            checked: true,
          });
          setDelhiveryCredentialModal(true);
        } else {
          notification.error({
            message: get(error, 'message', '') || SHIPMENT_UPDATE_FAILED,
          });
        }
      });
  };

  const CredentialModalCancel = () => {
    setShiprocketCredential({});
    setDelhiveryCredential({});
    setCredentialModal(false);
    setDelhiveryCredentialModal(false);
    setshippoModal(false);
    setLoading(false);
  };

  const submitDelhivey = (data, type) => {
    switch (type) {
      case 'shiprocket': {
        setShiprocketCredential(data);
        setUpdateId({
          Id: get(data, 'shipment_method_id'),
          method: get(data, 'method_name'),
          checked: get(data, 'is_active', false),
        });
        setCredentialModal(true);
        break;
      }
      case 'delhivery': {
        setDelhiveryCredential(data);
        setUpdateId({
          Id: get(data, 'shipment_method_id'),
          method: get(data, 'method_name'),
          checked: get(data, 'is_active', false),
        });
        if (openTourModal) {
          setOpenTourModal(false);
          setDelhiveryCredentialModal(true);
          setTimeout(() => {
            setOpenTourModal(true);
            setCurrentStep(1);
          }, 1000);
        } else {
          setDelhiveryCredentialModal(true);
        }
        break;
      }
      case 'shippo': {
        setShippoCredential(data);
        setshippoModal(true);
        setUpdateId({
          Id: get(data, 'shipment_method_id'),
          method: get(data, 'method_name'),
          checked: get(data, 'is_active', false),
        });
        break;
      }
      default: {
        break;
      }
    }
  };

  const onFinish = async (values) => {
    if (get(updateId, 'method', '') === 'Shippo Shipment') {
      shippoCredential.api_token = values.apiToken;
      const parameters = { values, shipmentMethod: shippoCredential };
      createInitialAddress(parameters)
        .then((resp) => {
          if (resp.success) {
            updateShipmentMode({
              ...values,
              ...updateId,
              forceActivate: false,
            });
            setLoading(false);
          }
        })
        .catch((error) => {
          notification.error({
            message:
              get(error, 'message.detail', false) ||
              'The data you sent was not accepted as valid',
          });
          setLoading(false);
        });
    } else {
      updateShipmentMode({
        ...values,
        ...updateId,
        forceActivate: false,
      });
    }
  };

  useEffect(() => {
    if (openTourModal) {
      disableTabEnterKey();
    } else {
      enableTabEnterKey();
    }
  }, [openTourModal]);

  useEffect(() => {
    if (openTourModal) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [openTourModal]);

  useEffect(() => {
    if (credentialModal && tourCurrentStep === 3) {
      setTourCurrentStep(tourCurrentStep + 1);
    }
  }, [credentialModal, tourCurrentStep]);

  const handleSkip = () => {
    setOpenTourModal(false);
    completeTour();
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  const previousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onLogin = () => {
    const delhiveryData = shipmentMethods.find(
      (item) => item.slug === 'delhivery'
    );
    setDelhiveryCredential(delhiveryData);
    setUpdateId({
      Id: get(delhiveryData, 'shipment_method_id'),
      method: get(delhiveryData, 'method_name'),
      checked: get(delhiveryData, 'is_active', false),
    });
    if (openTourModal) {
      setOpenTourModal(false);
      setDelhiveryCredentialModal(true);
      setTimeout(() => {
        setOpenTourModal(true);
        setCurrentStep(1);
      }, 1000);
    }
  };

  const steps = [
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Click the &apos;Submit&apos; button to initiate the setup process.
          </span>
          <div className="milestone-footer-store">
            <Tooltip title="Help and resources">
              <span className="question-icon-milestone">
                <QuestionCircleOutlined />
                Learn how
              </span>
            </Tooltip>
            <span className="footer-inner-left-span">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <Button type="primary" onClick={() => onLogin()}>
                Login
              </Button>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.delhivery-container-box');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            To seamlessly integrate Delhivery, fetch your unique{' '}
            <b style={{ color: '#0B3D60' }}>
              API Token from your Delhivery account.
            </b>
          </span>
          <div className="milestone-footer-store">
            <Tooltip title="Help and resources">
              <span className="question-icon-milestone">
                <QuestionCircleOutlined />
                Learn how
              </span>
            </Tooltip>
            <span className="footer-inner-left-span">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <Button type="primary" onClick={nextStep}>
                Next
              </Button>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.apiTextField');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Once you have them, enter the details and click &apos;Submit&apos;.
          </span>
          <div className="milestone-footer-store">
            <Button className="skip-btn-tour" onClick={() => handleSkip()}>
              Skip
            </Button>
            <span className="footer-inner-left-span">
              <Button onClick={previousStep}>Previous</Button>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('#shipment-save-btn');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
  ];

  const handleShipmentTitle = (item) => {
    return <p className="box-heading-text">{get(item, 'method_name', '')}</p>;
  };

  const handleShipmentDescription = (item) => {
    return (
      <span className="box-content-description">
        {get(item, 'description', '')}
      </span>
    );
  };

  const handleShipmentTooltip = () => {
    return (
      <Tooltip title="Help and resources.">
        <QuestionIcon className="question-icon" />
      </Tooltip>
    );
  };

  const handleShipmentLogo = (item) => {
    return (
      <img
        className="pament-method-img"
        src={
          mobileView ? shipmentImageMobile[item.slug] : shipmentImage[item.slug]
        }
        alt="logout"
      />
    );
  };

  const handleShipmentSwitch = (item) => {
    return (
      <Popconfirm
        title="Are you sure to change shipment status?"
        onConfirm={() => {
          const slug = get(item, 'slug', '');
          const isDelhivery = slug === 'delhivery';
          const isShippo = slug === 'shippo';
          updateShipmentMode({
            checked: !get(item, 'is_active', ''),
            Id: get(item, 'shipment_method_id', ''),
            method: get(item, 'shipment_method'),
            forceActivate: true,
            apiToken: isDelhivery || isShippo ? get(item, 'api_token', '') : '',
          });
        }}
        okText="Yes"
        cancelText="No"
      >
        <Switch
          id="enable-shiprocket"
          checked={get(item, 'is_active', '')}
          disabled={
            get(item, 'slug', '') === 'dunzo' ||
            (get(item, 'slug', '') === 'shippo' &&
              isEmpty(get(item, 'api_token', '')))
          }
          className="switch-container"
        />
      </Popconfirm>
    );
  };

  const handleShipmentButton = (item) => {
    return <CredentialButton data={item} onSubmit={submitDelhivey} />;
  };

  const handleShipmentList = (type) => {
    const method =
      type === 'india' ? indianPaymentMethods : otherPaymentMethods;
    return (
      <div className="card-container report">
        <Row
          className="all-payments"
          gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
        >
          {method ? (
            map(method, (item) => {
              return (
                <Col
                  key={get(item, 'shipment_method_id')}
                  xs={24}
                  sm={24}
                  md={12}
                  lg={6}
                  xl={6}
                  style={{ marginBottom: '30px' }}
                >
                  <Card
                    className={`payment-setup-box ${
                      item.slug === 'delhivery' ? 'delhivery-container-box' : ''
                    }`}
                  >
                    {mobileView ? (
                      <Row>
                        <Col span={6}>{handleShipmentLogo(item)}</Col>
                        <Col span={18}>
                          <Row className="box-text-main-row">
                            <Col span={22}>{handleShipmentTitle(item)}</Col>
                            <Col span={2}> {handleShipmentTooltip()}</Col>
                          </Row>
                          <Row className="box-description-main-row">
                            {handleShipmentDescription(item)}
                          </Row>
                          <Divider />
                          <Row>
                            <Col span={18}>{handleShipmentButton(item)}</Col>
                            <Col span={6}>{handleShipmentSwitch(item)}</Col>
                          </Row>
                        </Col>
                      </Row>
                    ) : (
                      <>
                        <Row>
                          <Col span={20}>{handleShipmentLogo(item)}</Col>
                          <Col span={4} className="flexbox-end">
                            {handleShipmentTooltip()}
                          </Col>
                        </Row>
                        <Row
                          className="box-text-main-row"
                          style={{ display: 'block' }}
                        >
                          <Row>{handleShipmentTitle(item)}</Row>
                          <Row>{handleShipmentDescription(item)}</Row>
                        </Row>
                        <Divider />
                        <Row>
                          <Col span={20}>{handleShipmentButton(item)}</Col>
                          <Col
                            span={4}
                            className="flexbox-center"
                            style={{ height: '40px' }}
                          >
                            {handleShipmentSwitch(item)}
                          </Col>
                        </Row>
                      </>
                    )}
                  </Card>
                </Col>
              );
            })
          ) : (
            <Empty />
          )}
        </Row>
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      <Tour
        open={openTourModal}
        onClose={() => setOpenTourModal(false)}
        steps={steps}
        current={currentStep}
        zIndex={1003}
      />
      <div>
        <Tabs className="theme-tabs-settings theme-tabs-line">
          <TabPane tab="India" key="india">
            {handleShipmentList('india')}
          </TabPane>
          <TabPane tab="US" key="us">
            {handleShipmentList('other')}
          </TabPane>
        </Tabs>
        <Modal
          title={false}
          open={credentialModal}
          footer={false}
          destroyOnClose
          onCancel={CredentialModalCancel}
          className="settings-payment-modal"
          width={700}
        >
          <ModalHeader title="API User Login" />
          <Form
            onChange={() => setCredentialDisable(false)}
            onFinish={onFinish}
            ref={formReference}
          >
            <Form.Item
              label="Email"
              name="email"
              initialValue={get(shiprocketCredential, 'email')}
              rules={[
                {
                  required: true,
                  message: 'Please enter your email!',
                },
                {
                  type: 'email',
                  message: 'Please enter a valid email address',
                },
              ]}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input id="shipment-email" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              initialValue={get(shiprocketCredential, 'password')}
              rules={[
                {
                  required: true,
                  message: 'Please enter your password!',
                },
              ]}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input.Password
                readOnly
                id="shipment-password"
                onFocus={(event) => event.target.removeAttribute('readonly')}
              />
            </Form.Item>
            <div id="xtoken-url">
              <Row>
                <Col
                  xs={12}
                  sm={12}
                  md={12}
                  lg={8}
                  xl={8}
                  className="clippad-col"
                >
                  <Form.Item label="X-auth-token:">
                    <CopyToClipboard
                      text={shipRocketToken}
                      onCopy={() =>
                        notification.success({
                          message: 'x-auth-token is copied!',
                        })
                      }
                    >
                      <Button
                        style={{ width: 'auto', padding: '0px 0px 2px 15px' }}
                      >
                        <CopyOutlined />
                      </Button>
                    </CopyToClipboard>
                  </Form.Item>
                </Col>
                <Col
                  xs={12}
                  sm={12}
                  md={12}
                  lg={10}
                  xl={10}
                  className="clippad-col"
                >
                  <Form.Item label="Webhooks URL:">
                    <CopyToClipboard
                      text={`https://${hostname}/api/v1/shipment/ship-rocket/callback`}
                      onCopy={() =>
                        notification.success({
                          message: 'Webhooks url is copied!',
                        })
                      }
                    >
                      <Button
                        style={{ width: 'auto', padding: '0px 0px 2px 15px' }}
                      >
                        <CopyOutlined />
                      </Button>
                    </CopyToClipboard>
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div className="box-content-description">
              <span className="box-note-text">Note : </span>Should add webhooks
              in your shiprocket account, so that the customer can track their
              shipment status. <br /> Shiprocket {'>'} Setting {' >'} API {'>'}{' '}
              Webhooks
            </div>
            <Form.Item className="flex-end">
              <Button
                id="shipment-save-btn"
                type="primary"
                htmlType="submit"
                className="mr-10"
                disabled={credentialDisable}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={false}
          open={delhiveryCredentialModal}
          footer={false}
          destroyOnClose
          onCancel={CredentialModalCancel}
          className="settings-payment-modal"
          width={700}
        >
          <ModalHeader title="Delhivery API Credential" />
          <Form
            onChange={() => setCredentialDisable(false)}
            onFinish={onFinish}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Form.Item
              className="apiTextField"
              label="API Token"
              name="apiToken"
              initialValue={get(delhiveryCredential, 'api_token')}
              rules={[
                {
                  required: true,
                  message: 'Please enter your api token!',
                },
              ]}
            >
              <Input id="shipment-api-token" placeholder="API Token" />
            </Form.Item>
            <div className="box-content-description">
              <span className="box-note-text">Note : </span> Follow the steps to
              get your Delhivery account live API token (Setting {' >'} API
              setup {' >'} Request live API token), once API token is updated
              here your Delhivery account will be activated
            </div>
            <Form.Item className="flex-end">
              <Button
                id="shipment-save-btn"
                type="primary"
                htmlType="submit"
                className="mr-10"
                disabled={credentialDisable}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={false}
          open={shippoModal}
          footer={false}
          destroyOnClose
          onCancel={CredentialModalCancel}
          className="settings-payment-modal"
          width={700}
        >
          <ModalHeader title="Token API Credential" />
          <Form
            onChange={() => setCredentialDisable(false)}
            onFinish={onFinish}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Form.Item
              label="API Token"
              name="apiToken"
              initialValue={get(shippoCredential, 'api_token', '')}
              rules={[
                {
                  required: true,
                  message: 'Please enter your api token!',
                },
              ]}
            >
              <Input id="shipment-api-token" placeholder="API Token" />
            </Form.Item>
            <div className="box-content-description">
              <span className="box-note-text">Note : </span>Follow the steps to
              get a Shippo API token, sign up on the Shippo website, log in to
              the dashboard, navigate to API settings, and generate a new token.
              Copy the token and paste it here
            </div>
            <Row>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Name"
                  initialValue={get(shippoCredential, 'shippo_name', '')}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter a name',
                    },
                  ]}
                >
                  <Input name="name" placeholder="Enter the Name" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="company"
                  label="Company"
                  initialValue={get(shippoCredential, 'shippo_company', '')}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter a company name',
                    },
                  ]}
                >
                  <Input name="company" placeholder="company name" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="email"
                  initialValue={get(shippoCredential, 'shippo_email', '')}
                  label="Email Address"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter a email address',
                    },
                    {
                      type: 'email',
                      message: 'Please enter a valid email address',
                    },
                  ]}
                >
                  <Input placeholder="Email Address" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="phone"
                  initialValue={get(shippoCredential, 'shippo_phone', '')}
                  label="Phone Number"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter a phone number',
                    },
                  ]}
                >
                  <Input
                    name="phone"
                    type="number"
                    placeholder="Phone Number"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="street1"
                  label="Address"
                  initialValue={get(shippoCredential, 'shippo_street1', '')}
                  rules={[
                    {
                      required: true,
                      message: 'Please provide address in address field',
                    },
                  ]}
                >
                  <Input
                    name="street1"
                    placeholder="House/Floor No., Building Name or Street, Locality"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="city"
                  label="City"
                  initialValue={get(shippoCredential, 'shippo_city', '')}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter the city',
                    },
                  ]}
                >
                  <Input name="city" placeholder="City" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="state"
                  label="State"
                  initialValue={get(shippoCredential, 'shippo_state', '')}
                  rules={[
                    {
                      required: true,
                      message: 'Please Enter the state',
                    },
                  ]}
                >
                  <Input name="state" placeholder="State" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="country"
                  label="Country"
                  initialValue="US"
                  rules={[
                    {
                      required: true,
                      message: 'Please Enter the country',
                    },
                  ]}
                >
                  <Input readOnly placeholder="Country" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="pin"
                  label="Pincode"
                  initialValue={get(shippoCredential, 'shippo_zip', '')}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter a pincode',
                    },
                  ]}
                >
                  <Input name="pin" type="number" placeholder="Pincode" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item className="flex-end">
              <Button
                id="shipment-save-btn"
                type="primary"
                htmlType="submit"
                className="mr-10"
                disabled={credentialDisable}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          open={completeModal}
          footer={false}
          maskClosable
          centered
          closeIcon={false}
          className="milestone-modal-store"
          zIndex={1005}
        >
          <span>
            <ModalBg />
          </span>
          <span>Shipment Updated successfully</span>
        </Modal>
      </div>
    </Spin>
  );
}

export default Shipment;
