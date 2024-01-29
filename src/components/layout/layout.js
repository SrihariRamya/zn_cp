import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  NavLink,
  Link,
  useLocation,
  useNavigate,
  Outlet,
} from 'react-router-dom';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { serialize } from 'object-to-formdata';
import { capitalize, filter, get, isEmpty, map } from 'lodash';
import {
  CaretDownOutlined,
  UserOutlined,
  RightCircleTwoTone,
  LeftCircleTwoTone,
  CloseCircleOutlined,
  WarningFilled,
  ShopOutlined,
  PlusOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Tag,
  Space,
  Spin,
  notification,
  Row,
  Alert,
  Button,
  Modal,
  Radio,
  Input,
  Upload,
  Image,
} from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import ZupainHelp from '../zupain-help';
import menuData from './menu';
import './layout.less';
import { FAILED_TO_LOAD } from '../../shared/constant-values';
import { RoleContext } from '../context/role-access-context';
import { WalletContext } from '../context/wallet-context';
import LogoPlaceHolder from '../../assets/images/logo-placeholder.png';
import { TenantContext } from '../context/tenant-context';
import { getStatus } from '../../shared/role-access-helper';
import {
  getAllModulesRoles,
  showAppearanceOrNot,
  userWalletBalance,
} from '../../utils/api/url-helper';
import { eventTrack } from '../../shared/function-helper';
import { ReactComponent as UserIcon } from './assets/userIcon.svg';
import { ReactComponent as SettingsIcon } from './assets/settings.svg';
import { ReactComponent as ReportIcon } from './assets/reportIcon.svg';
import { ReactComponent as LogoutIcon } from './assets/log-out.svg';
import { ReactComponent as UploadIcon } from './assets/uploadIcon.svg';

const { TextArea } = Input;

const { Header, Sider, Content } = Layout;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.originFileObj || file);
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', (event) => {
      reject(event.error);
    });
  });

function SiteLayout(properties) {
  const [tenantDetails, defaultImageData, ,] = useContext(TenantContext);
  const tenantConfig = useContext(TenantContext)[3];
  const mobileView = useContext(TenantContext)[4];
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [roleInfo, setRoleInfo] = useState(localStorage.getItem('roleName'));
  const [storeName, setStoreName] = useState(localStorage.getItem('storeName'));
  const [tenantUid, setTenantUid] = useState(localStorage.getItem('tenantUid'));
  const [menuDetails, setMenuDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleDetails] = useContext(RoleContext);
  const navigate = useNavigate();
  const [adminLogo, setAdminLogo] = useState('');
  const [roleData, setRoleData] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const location = useLocation();
  const [walletBalance, setWalletBalance] = useContext(WalletContext);
  const [walletLoading, setWalletLoading] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [radioReportValue, setRadioReportValue] = useState(1);
  const [openKeys, setOpenKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState('Dashboard');

  const [technicalIssue, setTechnicalIssue] = useState(true);
  const [authIssue, setAuthIssue] = useState(false);
  const [vulnerabilityIssue, setVulnerabilityIssue] = useState(false);
  const [paymentIssue, setPaymentIssue] = useState(false);
  const [privacyIssue, setPrivacyIssue] = useState(false);
  const [functionalityIssue, setFunctionalityIssue] = useState(false);
  const [feedbackReport, setFeedbackReport] = useState(false);
  const [otherReport, setOtherReport] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState([]);
  const [dragbox, setDragbox] = useState(true);
  const [textReportField, setTextReportField] = useState('');
  const [reportTitle, setReportTitle] = useState('');

  const [isHelpWindowOpen, setIsHelpWindowOpen] = useState(false);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.slice(Math.max(0, file.url.lastIndexOf('/') + 1))
    );
  };

  useEffect(() => {
    if (dragbox === false) {
      if (fileList.length > 0) {
        const fileCheck = document.querySelector('.ant-upload');
        fileCheck.classList.add('widthSpacing');
      } else {
        const fileCheck = document.querySelector('.ant-upload');
        fileCheck.classList.remove('widthSpacing');
      }
    }
    setDragbox(false);
  }, [fileList]);

  const handleChange = ({ fileList: newFileList }) => {
    const limitedFileList = newFileList.slice(0, 5);
    setFileList(limitedFileList);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const fetchData = useCallback(() => {
    showAppearanceOrNot()
      .then((data) => {
        if (isEmpty(get(data, 'showVariable'))) {
          setMenuDetails(
            filter(menuData, (item) => item.name !== 'Appearance')
          );
        } else {
          setMenuDetails(menuData);
        }
      })
      .catch(() => {
        setMenuDetails(menuData);
      });
  }, []);

  useEffect(() => {
    const adminLogoImage =
      get(tenantDetails, 'setting.admin_logo', '') ||
      get(defaultImageData, 'admin_logo', '');
    setAdminLogo(adminLogoImage);
  }, [tenantDetails, defaultImageData]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setLoading(true);
    getAllModulesRoles(roleDetails)
      .then((response) => {
        const modulesData = get(response, 'data', []);
        setRoleData(modulesData);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, [roleDetails]);

  const fetchWalletBalance = () => {
    const WalletBody = { user_id: tenantUid };
    setWalletLoading(true);
    userWalletBalance(WalletBody)
      .then((data) => {
        if (data.success) {
          setWalletLoading(false);
          setWalletBalance(get(data, 'data.wallet_balance', 0));
        }
        setUserName(localStorage.getItem('userName'));
        setRoleInfo(localStorage.getItem('roleName'));
        setStoreName(localStorage.getItem('storeName'));
        setTenantUid(localStorage.getItem('tenantUid'));
      })
      .catch(() => {
        setWalletLoading(false);
      });
  };

  const reportFunction = () => {
    setReportModal(true);
  };

  const reportModalCancel = () => {
    setReportModal(false);
    setFileList([]);
  };

  const reportOptions = [
    {
      value: 1,
      label: 'Technical Issues',
      state: technicalIssue,
      stateSetter: setTechnicalIssue,
      placeholder: 'Describe the issue to us',
    },
    {
      value: 2,
      label: 'Authentication and Account Management',
      state: authIssue,
      stateSetter: setAuthIssue,
      placeholder: 'Describe the issue to us',
    },
    {
      value: 3,
      label: 'Security and Vulnerability Issues',
      state: vulnerabilityIssue,
      stateSetter: setVulnerabilityIssue,
      placeholder: 'Describe the issue to us',
    },
    {
      value: 4,
      label: 'Transaction and Payment Issues',
      state: paymentIssue,
      stateSetter: setPaymentIssue,
      placeholder: 'Describe the issue to us',
    },
    {
      value: 5,
      label: 'Privacy Issue',
      state: privacyIssue,
      stateSetter: setPrivacyIssue,
      placeholder: 'Describe the issue to us',
    },
    {
      value: 6,
      label: 'Accessibility and Functionality Issues',
      state: functionalityIssue,
      stateSetter: setFunctionalityIssue,
      placeholder: 'Describe the issue to us',
    },
    {
      value: 7,
      label: 'Feedback and Support',
      state: feedbackReport,
      stateSetter: setFeedbackReport,
      placeholder: 'Describe the issue to us',
    },
    {
      value: 8,
      label: 'Other',
      state: otherReport,
      stateSetter: setOtherReport,
      placeholder: 'Write your issue here',
    },
  ];

  const reportChange = (event) => {
    setRadioReportValue(event.target.value);

    // eslint-disable-next-line no-restricted-syntax
    for (const option of reportOptions) {
      option.stateSetter(option.value === event.target.value);
    }
  };

  const TextAreaField = (event) => {
    const TextAreaValue = event.target.value;
    setTextReportField(TextAreaValue);
  };

  useEffect(() => {
    if (roleInfo === 'tenant_admin') {
      fetchWalletBalance();
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const helperFunction = () => (
    <>
      <Menu.Item>
        <Link to="/user-profile">
          <Space size={10}>
            <UserIcon />
            <span className="text-grey-light">Profile</span>
          </Space>
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Link to="/settings">
          <Space size={10}>
            <SettingsIcon />
            <span className="text-grey-light">Settings</span>
          </Space>
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Link to="/" onClick={handleLogout}>
          <Space size={10}>
            <span>
              <LogoutIcon />
            </span>
            <span className="text-grey-light">Logout</span>
          </Space>
        </Link>
      </Menu.Item>
      <Menu.Item>
        <button
          type="button"
          onClick={reportFunction}
          style={{ border: 'none', background: 'transparent' }}
        >
          <Space size={10}>
            <span>
              <ReportIcon />
            </span>
            <span className="text-grey-light">Report</span>
          </Space>
        </button>
      </Menu.Item>
    </>
  );

  const renderContent = () => {
    if (fileList.length > 0) {
      return '';
    }
    if (fileList.length === 0) {
      return (
        <p className="drag-items">
          <UploadIcon />
          Drag & drop files or Browse
        </p>
      );
    }
    return uploadButton;
  };

  const adminEvent = (events, text, url) => {
    const parameters = {
      value: text,
    };
    eventTrack(events, parameters);
    navigate(url);
  };

  const RadioOptionsValue = (value) => {
    setReportTitle(value);
  };

  const submitReport = async () => {
    setLoading(true);
    const adminUrl = get(tenantConfig, 'masterAdmin.master_url', '');
    const token = CryptoJS.AES.encrypt(
      `${get(tenantConfig, 'masterAdmin.MASTER_ADMIN_VALUE', '')}`,
      `${get(tenantConfig, 'masterAdmin.MASTER_ADMIN_SECRET', '')}`
    ).toString();
    try {
      const files = {
        files: map(fileList, (item) => item.originFileObj),
      };
      const reportData = {
        tenantUid,
        title: reportTitle,
        description: textReportField,
      };
      const formData = serialize({ ...reportData, ...files });
      const reportedData = await axios.post(
        `${adminUrl}report/create`,
        formData,
        {
          headers: {
            // eslint-disable-next-line no-template-curly-in-string
            'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
            masteradminheader: `Bearer ${token}`,
          },
        }
      );
      if (get(reportedData, 'data.success', false)) {
        setLoading(false);
        reportModalCancel();
        notification.success({
          message: get(reportedData, 'message', 'Reported Successfully'),
        });
      } else {
        setLoading(false);
        notification.error({
          message: 'Some error occurred while reporting',
        });
      }
    } catch (error) {
      setLoading(false);
      notification.error({
        message: error.message || 'Some error occurred while reporting',
      });
    }
  };

  const handleDeductAmount = () => {
    navigate('plan');
  };
  const activeStyle = {
    background: 'white',
    color: '#0B3D60',
    fontWeight: '700',
  };

  const handleOpenChange = (keys) => {
    setOpenKeys([keys.pop()]);
  };

  const selectedURL = capitalize(window.location.pathname.split('/')[1]);
  useEffect(() => {
    switch (selectedURL) {
      case 'Customer-engagement': {
        setSelectedKey('Customer Engagement');
        break;
      }
      case 'Search-enquiries': {
        setSelectedKey('Search Enquiries');
        break;
      }
      case 'Social-leads': {
        setSelectedKey('Social Leads');
        break;
      }
      case 'Whatsapp': {
        setSelectedKey('WhatsApp Tool');
        break;
      }
      case 'Page-builder': {
        setSelectedKey('Page Builder');
        break;
      }
      case 'Theme-builder': {
        setSelectedKey('Theme Builder');
        break;
      }
      case 'B2b-setup': {
        setSelectedKey('B2B Setup');
        break;
      }
      case 'Social-media-performance': {
        setSelectedKey('Social Media Performance');
        break;
      }
      case 'Privacy-policy': {
        setSelectedKey('Privacy Policy');
        break;
      }
      case 'Gupshup': {
        setSelectedKey('Whatsapp business');
        break;
      }
      case 'Plan': {
        setSelectedKey('Plans & Wallet');
        break;
      }
      default: {
        setSelectedKey(selectedURL);
      }
    }
  }, [selectedURL]);

  return (
    <Layout className="notify-layout" style={{ minHeight: '100vh' }}>
      <div
        className={`right-section-close-dev sidebar-close-tab-${menuVisible}`}
        onClick={() => setMenuVisible(!menuVisible)}
        aria-hidden="true"
      />
      <Sider className={`sidebar sidebar-visible-${menuVisible}`}>
        <div>
          <div className="logo">
            <img
              width="100%"
              className="adminLogo"
              src={get(adminLogo, '[0].url', adminLogo) || LogoPlaceHolder}
              onClick={() => adminEvent('admin_logo', 'Admin Logo')}
              aria-hidden="true"
              alt="logo"
            />
          </div>

          <Spin spinning={loading}>
            <Menu
              theme="dark"
              className="sidebar__menu"
              defaultSelectedKeys={['Dashboard']}
              selectedKeys={[selectedKey]}
              mode="inline"
              openKeys={openKeys}
              onOpenChange={handleOpenChange}
            >
              {map(menuDetails, (result) =>
                get(getStatus(roleData, result.key), 'module_view', false) ? (
                  <>
                    <SubMenu
                      key={result?.linkURL?.split('/')[1]}
                      style={selectedKey === result.name ? activeStyle : ''}
                      className={
                        get(result, 'subMenu', []).length === 0
                          ? 'sidebar-no-submenu'
                          : 'sidebar-submenu'
                      }
                      onTitleClick={() =>
                        navigate(result.linkURL) &&
                        adminEvent('side_menu', result.name)
                      }
                      title={
                        <>
                          <result.icon
                            className={
                              selectedKey === result.name
                                ? 'active-menu-icon'
                                : 'menu-icon'
                            }
                          />
                          <span className="submenu-name">{result.name}</span>
                        </>
                      }
                    >
                      {get(result, 'subMenu', []).map((option) => (
                        <Menu.Item className="sub-menu-text" key={option.name}>
                          <NavLink to={option.linkURL}>{option.name}</NavLink>
                        </Menu.Item>
                      ))}
                    </SubMenu>
                    {get(result, 'new') && (
                      <div
                        style={{
                          position: 'relative',
                          top: '-40px',
                          left: '140px',
                          fontSize: 'x-small',
                        }}
                      >
                        <div>New</div>
                      </div>
                    )}
                  </>
                ) : (
                  ''
                )
              )}
            </Menu>
          </Spin>
        </div>
        <div className="sidebar-powerby-text">
          <p className="footer-sub-text">Powered by</p>
          <h2 className="footer-text">Zupain</h2>
        </div>
        {menuVisible ? (
          <LeftCircleTwoTone
            twoToneColor="#0B3D60"
            className="sidebar-menu-icon"
            onClick={() => setMenuVisible(!menuVisible)}
          />
        ) : (
          <RightCircleTwoTone
            twoToneColor="#0B3D60"
            className="sidebar-menu-icon"
            onClick={() => setMenuVisible(!menuVisible)}
          />
        )}
      </Sider>
      <Layout className="site-layout">
        {location.pathname !== '/campaign' &&
          !location.pathname.includes('/page-builder') &&
          !location.pathname.includes('/appearance/') &&
          location.pathname !== '/zupain-select-customer' &&
          location.pathname !== '/page-builder' && (
            <Header
              className="site-layout-background top-header"
              style={{ padding: '0 24px' }}
            >
              <div className="right-side">
                {!mobileView && (
                  <Button
                    className="mr-10"
                    type="primary"
                    onClick={handleDeductAmount}
                  >
                    <WalletOutlined style={{ fontSize: '16px' }} /> Wallet Bal:
                    {walletBalance.toFixed(2)}
                  </Button>
                )}
                <a
                  target="_blank"
                  href={get(tenantDetails, 'customer_url', '')}
                  rel="noreferrer"
                >
                  <Button className="mr-10" type="primary">
                    <ShopOutlined style={{ fontSize: '16px' }} /> Visit my store
                  </Button>
                </a>
                <Avatar size={24}>
                  {userName
                    ?.split(' ', 2)
                    .map((x) => x[0].toUpperCase())
                    .join('')}
                </Avatar>
                <div>
                  <Tag className="order-tag-drop">
                    <Dropdown
                      trigger="click"
                      overlay={
                        <Menu
                          style={{
                            borderStyle: 'groove',
                            borderRadius: '8px',
                          }}
                          className="order_dropdown"
                        >
                          {helperFunction()}
                        </Menu>
                      }
                      placement="bottomRight"
                      arrow
                    >
                      <span>
                        <UserOutlined />
                        <CaretDownOutlined />
                      </span>
                    </Dropdown>
                  </Tag>
                </div>
              </div>
            </Header>
          )}
        <Content
          style={{ margin: '0px 0px 16px 16px' }}
          className={
            location.pathname.includes('/page-builder')
              ? 'page-builder-layout'
              : 'page-content'
          }
        >
          <>
            {!walletLoading &&
              roleInfo === 'tenant_admin' &&
              !isEmpty(walletBalance) && (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                  {Number(walletBalance) <= 100 && (
                    <Row className="">
                      <Alert
                        onClick={() =>
                          adminEvent(
                            'Low Balance Banner Click',
                            'Low Balance Banner'
                          )
                        }
                        className="wallet-alert"
                        message={
                          <>
                            <WarningFilled twoToneColor="#634343" />
                            {' *Low Balance, Please recharge your Wallet*'}
                          </>
                        }
                        closeText={<CloseCircleOutlined />}
                        closable
                      />
                    </Row>
                  )}
                </>
              )}
            <Outlet />
            <Modal
              className="report-modal"
              width={500}
              title="Report an Issue"
              open={reportModal}
              onCancel={reportModalCancel}
              centered
              okText="Report"
              onOk={submitReport}
            >
              <span>
                {' '}
                <Radio.Group
                  onChange={reportChange}
                  value={radioReportValue}
                  className="report-radio-group"
                >
                  {reportOptions.map((option) => (
                    <>
                      <Radio
                        value={option.value}
                        name={option.label}
                        onChange={() => RadioOptionsValue(option.label)}
                      >
                        {option.label}
                      </Radio>
                      {option.state ? (
                        <TextArea
                          style={{ height: '80px' }}
                          placeholder={option.placeholder}
                          autoSize={{ minRows: 2, maxRows: 6 }}
                          onChange={(event) => TextAreaField(event)}
                        />
                      ) : (
                        ''
                      )}
                    </>
                  ))}
                </Radio.Group>
                <p>Attachments</p>
                <Upload
                  action={() => {}}
                  listType="picture-card"
                  fileList={fileList}
                  onPreview={handlePreview}
                  onChange={handleChange}
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: true,
                  }}
                >
                  {renderContent()}
                </Upload>
                <Modal
                  visible={previewOpen}
                  title={previewTitle}
                  footer={false}
                  onCancel={handleCancel}
                >
                  <Image
                    alt="example"
                    style={{ width: '100%' }}
                    src={previewImage}
                  />
                </Modal>
              </span>
            </Modal>
          </>
          <ZupainHelp
            isHelpWindowOpen={isHelpWindowOpen}
            setIsHelpWindowOpen={setIsHelpWindowOpen}
          />
        </Content>
      </Layout>
    </Layout>
  );
}

export default SiteLayout;
