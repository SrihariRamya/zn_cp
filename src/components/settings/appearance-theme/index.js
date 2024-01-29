import { SearchOutlined } from '@ant-design/icons';
import {
  Breadcrumb,
  Button,
  Col,
  Divider,
  Input,
  List,
  Modal,
  notification,
  Row,
  Spin,
} from 'antd';
import { debounce, get, isEmpty } from 'lodash';
import React, { useState, useEffect, useCallback, useContext } from 'react';
import Tour from 'reactour';
import { useNavigate } from 'react-router-dom';
import { paginationstyler } from '../../../shared/attributes-helper';
import {
  APPEARANCE_LAYOUT_NAME_ERROR,
  APPEARANCE_LAYOUT_LIBRARY_INFO_TEXT,
  APPEARANCE_LAYOUT_LIBRARY_TITLE,
  APPEARANCE_TITLE,
  BUTTON_CREATE_TEXT,
  BUTTON_SAVE_TEXT,
  CREATE_APPEARANCE_TITLE,
  DELETE_APPEARANCE_LAYOUT,
  FAILED_TO_LOAD,
  RENAME_APPEARANCE_TITLE,
  SCREEN_MODE_ADD,
  SCREEN_MODE_EDIT,
  TENANT_MODE_NORMAL,
  EXPLORE,
  APPEARANCE_LAYOUT_SOURCE_WEB,
  APPEARANCE_THEME_UPDATE_SUCCESS,
} from '../../../shared/constant-values';
import {
  createAppearanceTheme,
  deleteAppearanceTheme,
  duplicateAppearanceTheme,
  getAppearanceTheme,
  updateAppearanceTheme,
  getOnboardGuide,
  getAppearance,
} from '../../../utils/api/url-helper';
import AppearanceThemeList from './theme-list';
import {
  disableTabEnterKey,
  enableTabEnterKey,
} from '../../../shared/function-helper';
import { TenantContext } from '../../context/tenant-context';

function AppearanceTheme() {
  const history = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [currentTheme, setCurrentTheme] = useState({});
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoader, setInitialLoader] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [searchWord, setSearchWord] = useState('');
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationMode, setConfirmationMode] = useState('');
  const [selectedTheme, setSelectedTheme] = useState({});
  const [mode, setMode] = useState(SCREEN_MODE_ADD);
  const [openTourModal, setOpenTourModal] = useState(false);
  const [tourCurrentStep, setTourCurrentStep] = useState(0);

  const [tenantDetails] = useContext(TenantContext);
  const normalTenantMode =
    get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL;

  const handleRouterChange = useCallback((id) => {
    history({
      pathname: `/appearance/${id}`,
    });
  });

  const createTheme = () => {
    const parameters = {
      theme_name: isEmpty(themeName)
        ? ''
        : themeName.trim().split(/ +/).join(' '),
    };
    setLoading(true);
    createAppearanceTheme(parameters)
      .then((resp) => {
        setLoading(false);
        handleRouterChange(get(resp, 'data.appearance_theme_uid'));
      })
      .catch(() => {
        setLoading(false);
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const fetchAppearanceTheme = (parameters) => {
    setLoading(true);
    const {
      pagination: { pageSize, current },
      searchKey,
    } = parameters;
    const parameter = {
      limit: pageSize,
      offset: current,
    };
    if (searchKey) {
      parameter.searchWord = searchKey;
    }
    getAppearanceTheme(parameter)
      .then((resp) => {
        setThemes(get(resp, 'data.themes.rows', []));
        setCurrentTheme(get(resp, 'data.currentTheme', {}));
        setPagination({
          ...parameters.pagination,
          total: get(resp, 'data.themes.count', 0),
        });
        setLoading(false);
        setInitialLoader(false);
        if (normalTenantMode) {
          getOnboardGuide().then((response) => {
            const guide = response.data.find((index) =>
              index.subGuide.find((index_) => index_.slug === 'appearance')
            );
            const subGuide = guide.subGuide.find(
              (index_) => index_.slug === 'appearance'
            );
            const isAppearanceCompleted = get(subGuide, 'completed', false);
            setOpenTourModal(!isAppearanceCompleted);
          });
        }
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
        setLoading(false);
        setInitialLoader(false);
      });
  };

  useEffect(() => {
    paginationstyler();
  }, [themes]);

  useEffect(() => {
    fetchAppearanceTheme({
      pagination: { pageSize: 5, current: 1 },
    });
  }, []);

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
    setConfirmationModal(false);
    setSelectedTheme({});
    if (openTourModal) {
      setOpenTourModal(false);
    }
  });

  const handleOnchange = useCallback((event) => {
    const { value } = event.target;
    setThemeName(value);
  });

  const handleCreateModal = useCallback(() => {
    setThemeName('');
    setMode(SCREEN_MODE_ADD);
    setIsModalVisible(true);
  });

  useEffect(() => {
    if (isModalVisible && openTourModal && tourCurrentStep === 0) {
      setTourCurrentStep(tourCurrentStep + 1);
    }
  }, [isModalVisible]);

  const onSearchDebounce = debounce((value) => {
    fetchAppearanceTheme({
      pagination: { pageSize: 5, current: 1 },
      searchKey: value,
    });
  }, 1000);

  const onSearch = useCallback((value) => {
    setSearchWord(value || '');
    onSearchDebounce(value);
  });

  const updateTheme = (theme) => {
    const parameters = {};
    if (theme) {
      parameters.current_theme = true;
    } else {
      parameters.theme_name = isEmpty(themeName)
        ? ''
        : themeName.trim().split(/ +/).join(' ');
    }
    setLoading(true);
    updateAppearanceTheme(
      get(selectedTheme, 'appearance_theme_uid', ''),
      parameters
    )
      .then(() => {
        setLoading(false);
        setSelectedTheme({});
        fetchAppearanceTheme({
          pagination: { pageSize: 5, current: 1 },
        });
      })
      .catch(() => {
        setLoading(false);
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const handleSave = useCallback(() => {
    if (isEmpty(themeName.trim())) {
      notification.error({ message: APPEARANCE_LAYOUT_NAME_ERROR });
    } else if (mode === SCREEN_MODE_ADD) {
      createTheme();
      setIsModalVisible(false);
    } else {
      updateTheme(false);
      setIsModalVisible(false);
    }
  });

  const deleteTheme = () => {
    const parameters = {
      id: get(selectedTheme, 'appearance_theme_uid', ''),
    };
    setLoading(true);
    deleteAppearanceTheme(parameters)
      .then(() => {
        setLoading(false);
        fetchAppearanceTheme({
          pagination: { pageSize: 5, current: 1 },
        });
        setSelectedTheme({});
        notification.success({ message: DELETE_APPEARANCE_LAYOUT });
      })
      .catch(() => {
        setLoading(false);
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const duplicateTheme = () => {
    const parameters = {
      id: get(selectedTheme, 'appearance_theme_uid', ''),
    };
    setLoading(true);
    duplicateAppearanceTheme(parameters)
      .then(() => {
        setLoading(false);
        fetchAppearanceTheme({
          pagination: { pageSize: 5, current: 1 },
        });
        setSelectedTheme({});
      })
      .catch(() => {
        setLoading(false);
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const handleConfirm = useCallback(() => {
    switch (confirmationMode) {
      case 'publish': {
        updateTheme(true);

        break;
      }
      case 'delete': {
        deleteTheme();

        break;
      }
      case 'duplicate': {
        duplicateTheme();

        break;
      }
      default: {
        break;
      }
    }
    setConfirmationModal(false);
  });

  const handleConfirmationModal = useCallback((item, handleMode) => {
    setSelectedTheme(item);
    setConfirmationMode(handleMode);
    setConfirmationModal(true);
  });

  const handleRename = useCallback((item) => {
    setMode(SCREEN_MODE_EDIT);
    setThemeName(get(item, 'theme_name', ''));
    setSelectedTheme(item);
    setIsModalVisible(true);
  });

  const TourSteps = [
    {
      selector: '#create-new-appearance-btn',
      content: `Now it's time to put your architect hats on!`,
    },
    {
      selector: '.ant-modal-content',
      content: `Create different appearances for different occasions for your online store`,
    },
    {
      selector: '#layout-name',
      content: `Give a relevant name to the appearances you created`,
      action: (node) => {
        if (node) {
          node.focus();
        }
      },
    },
    {
      selector: '#create-btn',
      content: `You're good to go`,
      action: (node) => {
        if (node) {
          node.addEventListener('click', () => {
            handleSave();
            setOpenTourModal(false);
          });
        }
      },
    },
  ];

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

  const updateRedisTheme = (themeId) => {
    const parameters = {
      appearance_source: APPEARANCE_LAYOUT_SOURCE_WEB,
      appearance_theme_uid: themeId,
      document_path: EXPLORE,
      removeRedis: true,
    };
    setInitialLoader(true);
    getAppearance(parameters)
      .then(() => {
        notification.success({ message: APPEARANCE_THEME_UPDATE_SUCCESS });
        setInitialLoader(false);
      })
      .catch(() => {
        setInitialLoader(false);
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  return (
    <Spin
      spinning={initialLoader}
      wrapperClassName={
        normalTenantMode ? 'normal-tenant-theme' : 'clic-tenant-theme'
      }
    >
      <div className="box  appearance-theme-container">
        <div>
          <div>
            <Breadcrumb>
              <Breadcrumb.Item>{APPEARANCE_TITLE}</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
        {!isEmpty(currentTheme) && !initialLoader && (
          <div className="mb-10 current-theme-head">
            <div className="demo-btn" style={{ display: 'none' }}>
              <Button onClick={() => history('appearance/id/demo')}>
                Demo
              </Button>
            </div>
            <div className="box__content bo1x-content-background current-theme-list">
              <AppearanceThemeList
                handleRouterChange={handleRouterChange}
                loading={loading}
                currentStatus
                data={currentTheme}
                handleConfirm={handleConfirmationModal}
                handleRename={handleRename}
                updateRedisTheme={updateRedisTheme}
              />
            </div>
          </div>
        )}
        <div className="mt-10 box__content box-content-background theme-name-list">
          <div className="theme-title-container">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={24} md={12} lg={14} xl={15}>
                <div className="theme-title">
                  {APPEARANCE_LAYOUT_LIBRARY_TITLE}
                </div>
                <div className="mt-10 theme-sub-title">
                  {APPEARANCE_LAYOUT_LIBRARY_INFO_TEXT}
                </div>
              </Col>
              <Col xs={16} sm={16} md={6} lg={6} xl={6}>
                <Input
                  allowClear
                  placeholder="Search"
                  value={searchWord}
                  onChange={(event_) => onSearch(event_.target.value)}
                  className="custom-search"
                  suffix={<SearchOutlined className="site-form-item-icon" />}
                />
              </Col>
              <Col xs={8} sm={8} md={3} lg={3} xl={3}>
                <Button
                  id="create-new-appearance-btn"
                  type="primary"
                  onClick={handleCreateModal}
                >
                  Create New
                </Button>
              </Col>
            </Row>
          </div>
          <Divider className="divider" />
          <List
            id="layout-list"
            loading={loading}
            itemLayout="horizontal"
            dataSource={themes}
            pagination={{
              onChange: (page) => {
                fetchAppearanceTheme({
                  pagination: {
                    pageSize: 5,
                    current: page,
                  },
                  searchKey: searchWord,
                });
              },
              ...pagination,
              position: 'bottom',
              style: { display: themes.length > 0 ? 'block' : 'none' },
            }}
            renderItem={(item, index) => (
              <List.Item>
                <AppearanceThemeList
                  index={index}
                  data={item}
                  handleRouterChange={handleRouterChange}
                  currentStatus={false}
                  loading={loading}
                  handleConfirm={handleConfirmationModal}
                  handleRename={handleRename}
                />
              </List.Item>
            )}
          />
        </div>
      </div>
      <Modal
        title={
          mode === SCREEN_MODE_ADD
            ? CREATE_APPEARANCE_TITLE
            : RENAME_APPEARANCE_TITLE
        }
        visible={isModalVisible}
        okText={
          mode === SCREEN_MODE_ADD ? (
            <span id="create-btn">{BUTTON_CREATE_TEXT}</span>
          ) : (
            BUTTON_SAVE_TEXT
          )
        }
        destroyOnClose
        width={350}
        onOk={handleSave}
        handleCancel={handleCancel}
        onCancel={handleCancel}
        okButtonProps={{ disabled: isEmpty(themeName) }}
        className={
          normalTenantMode
            ? 'normal-tenant-theme'
            : 'clic-tenant-theme clic-confirm-modal'
        }
      >
        <h4>Name</h4>
        <Input
          id="layout-name"
          placeholder="Layout Name"
          onChange={handleOnchange}
          value={themeName}
        />
      </Modal>
      <div className="shipment-modal-container">
        <Modal
          visible={confirmationModal}
          footer={false}
          destroyOnClose
          onCancel={handleCancel}
          className="clic-confirm-modal"
        >
          <h3 className="courier-modal-title">
            {confirmationMode === 'publish' &&
              `Are you sure you want set ${get(
                selectedTheme,
                'theme_name',
                ''
              )} as current layout`}
            {confirmationMode === 'delete' &&
              'Are you sure you want to delete layout'}
            {confirmationMode === 'duplicate' &&
              'Are you sure you want to duplicate the layout'}
          </h3>
          <span className="courier-modal-button">
            <Button id="no" onClick={handleCancel}>
              No
            </Button>
            <Button
              id="yes"
              loading={loading}
              onClick={handleConfirm}
              type="primary"
              style={{ marginLeft: '10px' }}
            >
              Yes
            </Button>
          </span>
        </Modal>
      </div>
      <Tour
        steps={TourSteps}
        isOpen={openTourModal}
        onRequestClose={() => setOpenTourModal(false)}
        goToStep={tourCurrentStep}
        disableFocusLock
        prevStep={() => {
          if (tourCurrentStep === 1) {
            setIsModalVisible(false);
          }
          if (tourCurrentStep > 0) {
            setTourCurrentStep(tourCurrentStep - 1);
          }
        }}
        nextStep={() => {
          if (tourCurrentStep === 0) {
            handleCreateModal();
          } else if (tourCurrentStep < TourSteps.length) {
            setTourCurrentStep(tourCurrentStep + 1);
          }
        }}
        accentColor="#38523B"
        closeWithMask={false}
      />
    </Spin>
  );
}
export default AppearanceTheme;
