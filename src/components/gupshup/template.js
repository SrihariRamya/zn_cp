import React, { useState, useEffect } from 'react';
import {
  Breadcrumb,
  Button,
  Input,
  List,
  Modal,
  Space,
  Switch,
  Table,
  Tabs,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { notification } from 'antd/lib';
import { debounce, get, isEmpty } from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { paginationstyler } from '../../shared/attributes-helper';
import {
  FAILED_TO_LOAD,
  GUPSHUP_PARTNER_APPROVE_COMFIRM_TEXT,
  GUPSHUP_PARTNER_ACTIVE_COMFIRM_TEXT,
  GUPSHUP_PARTNER_TEMPLATE_TITLE,
  GUPSHUP_TEMPLATE_STATUS_ALL,
  GUPSHUP_TEMPLATE_STATUS_APPROVED,
  GUPSHUP_TEMPLATE_STATUS_DEFAULT,
  GUPSHUP_TEMPLATE_STATUS_PENDING,
  GUPSHUP_TEMPLATE_STATUS_REJECTED,
  INITIAL_PAGE,
  PAGE_LIMIT,
  GUPSHUP_TEMPLATE_DEFAULT_ALREADY_MESSAGE,
  GUPSHUP_TEMPLATE_DEFAULT_EDIT_MESSAGE,
  GUPSHUP_TEMPLATE_TO_APPROVE_SCCESSS_MESSAGE,
  GUPSHUP_TEMPLATE_DEFAULT_ADD_CARD,
} from '../../shared/constant-values';
import { ReactComponent as PlansAndWallet } from '../../assets/icons/plan-and-wallet.svg';
import './gupshup.less';
import { ReactComponent as EditIcon } from '../../assets/icons/clic/noun-edit.svg';
import {
  createTemplate,
  getTemplate,
  getTemplates,
  updateTemplateStatus,
} from '../../utils/api/url-helper';
import TemplateItem from './template-item';
import TemplatePreview from './template-preview';
import { ReactComponent as EyeIcon } from '../../assets/icons/clic/noun-eye.svg';
import { ReactComponent as ConfirmIcon } from '../../assets/smallImage/confirm.svg';
import { ReactComponent as PendingIcon } from '../../assets/icons/ic_template_pending.svg';
import { ReactComponent as RejectedIcon } from '../../assets/icons/ic_template_rejected.svg';
import AddTemplateCard from './add-template-card';

const { TabPane } = Tabs;
const { confirm, warning } = Modal;

const templateStatus = (text) => {
  let value = {};
  switch (text) {
    case GUPSHUP_TEMPLATE_STATUS_REJECTED: {
      value = {
        icon: <RejectedIcon className="template-status-icon" />,
        value: 'Rejected by WhatsApp',
      };
      break;
    }
    case GUPSHUP_TEMPLATE_STATUS_PENDING: {
      value = {
        icon: <PendingIcon className="template-status-icon" />,
        value: 'Approval pending from WhatsApp',
      };
      break;
    }
    case GUPSHUP_TEMPLATE_STATUS_APPROVED: {
      value = {
        icon: <ConfirmIcon className="template-status-icon" />,
        value: 'Approved by WhatsApp',
      };
      break;
    }
    default: {
      value = {
        icon: <ConfirmIcon style={{ width: '20px' }} />,
        color: 'green',
      };
    }
  }
  return value;
};

function GupshupTemplate() {
  const { appId } = useParams();
  const [loading, setLoading] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [templates, setTemplates] = useState([]);
  const [totalTemplateCount, setTotalTemplateCount] = useState();
  const [activeTab, setActiveTab] = useState(GUPSHUP_TEMPLATE_STATUS_DEFAULT);
  const [pagination, setPagination] = useState({
    current: INITIAL_PAGE,
    pageSize: PAGE_LIMIT,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const navigate = useNavigate();

  const fetchData = (parameters) => {
    const {
      pagination: { pageSize, current },
      searchKey,
    } = parameters;
    const queryParameter = {
      app_id: appId,
      limit: pageSize,
      offset: current,
    };
    if (searchKey) {
      queryParameter.searchWord = searchKey;
    }
    if (activeTab) {
      queryParameter.status = activeTab;
    }
    setLoading(true);
    getTemplates(queryParameter)
      .then((response) => {
        const responseData = get(response, 'data.rows', []);
        if (activeTab === GUPSHUP_TEMPLATE_STATUS_DEFAULT) {
          if (current === INITIAL_PAGE) {
            setTemplates([GUPSHUP_TEMPLATE_DEFAULT_ADD_CARD, ...responseData]);
          } else {
            setTemplates([...templates, ...responseData]);
          }
        } else {
          setTemplates(get(response, 'data.rows', []));
        }
        setPagination({
          ...parameters.pagination,
          total: get(response, 'data.count', []),
        });
        setTotalTemplateCount(get(response, 'data.count', []));
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({ message: error?.message || FAILED_TO_LOAD });
      });
  };

  useEffect(() => {
    fetchData({
      pagination: { pageSize: PAGE_LIMIT, current: INITIAL_PAGE },
    });
  }, [activeTab]);

  useEffect(() => {
    paginationstyler();
  }, [templates]);

  const onSearchDebounce = debounce((value) => {
    fetchData({
      pagination: { pageSize: PAGE_LIMIT, current: INITIAL_PAGE },
      searchKey: value,
    });
  }, 1000);

  const onSearch = (value) => {
    setSearchWord(value || '');
    setTemplates([]);
    onSearchDebounce(value);
  };

  const handleActiveTab = (event) => {
    setTemplates([]);
    setActiveTab(event);
  };

  const loadMoreData = () => {
    fetchData({
      pagination: { pageSize: PAGE_LIMIT, current: pagination.current + 1 },
    });
  };

  const handleTableChange = (paginationAlias) => {
    const { current, pageSize } = paginationAlias;
    fetchData({
      pagination: { pageSize, current },
    });
  };

  const handleRedirectEdit = (id) => {
    if (id) {
      navigate(`/gupshup/${appId}/template/edit/${id}`);
    } else {
      navigate(`/gupshup/${appId}/template/create`);
    }
  };

  const handlePreview = (value) => {
    setSelectedTemplate(value);
    setModalVisible(true);
  };

  const updateTemplateStatusFunction = (status, value) => {
    const parameters = {
      is_active: status,
    };
    setLoading(true);
    updateTemplateStatus(get(value, 'template_uid', ''), parameters)
      .then((response) => {
        notification.success({ message: response?.message });
        fetchData({
          pagination: { pageSize: PAGE_LIMIT, current: INITIAL_PAGE },
        });
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({ message: error?.error });
      });
  };

  const activeUpdate = async (status, value) => {
    confirm({
      title: GUPSHUP_PARTNER_ACTIVE_COMFIRM_TEXT,
      onOk() {
        updateTemplateStatusFunction(status, value);
      },
    });
  };

  const columns = [
    {
      title: 'Template Name',
      dataIndex: 'template_name',
      key: 'template_name',
      render: (text) => (
        <div style={{ color: 'black' }} className="product-name">
          {text}
        </div>
      ),
    },
    {
      title: 'Template Type',
      dataIndex: 'template_type',
      key: 'template_type',
      render: (text) => <div>{text}</div>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      render: (text) => {
        const templateStatusVaule = templateStatus(text);
        return (
          <Space>
            <div style={{ marginTop: '4px' }}> {templateStatusVaule.icon}</div>
            <div>{templateStatusVaule.value}</div>
          </Space>
        );
      },
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      align: 'center',
      hidden: !(
        activeTab === GUPSHUP_TEMPLATE_STATUS_APPROVED ||
        activeTab === GUPSHUP_TEMPLATE_STATUS_ALL
      ),
      render: (text, _row) => {
        return (
          <Switch
            className="switch-container"
            checked={text}
            disabled={_row?.status !== GUPSHUP_TEMPLATE_STATUS_APPROVED}
            onClick={(value) => activeUpdate(value, _row)}
          />
        );
      },
    },
    {
      title: 'Action',
      align: 'center',
      render: (row) => (
        <Space>
          <EyeIcon
            onClick={() => handlePreview(row)}
            style={{ cursor: 'pointer' }}
          />
          {row?.status !== GUPSHUP_TEMPLATE_STATUS_PENDING && (
            <EditIcon
              onClick={() => handleRedirectEdit(row?.template_uid)}
              style={{ cursor: 'pointer' }}
            />
          )}
        </Space>
      ),
    },
  ].filter((item) => !item.hidden);

  const handleCancel = () => {
    setModalVisible(false);
  };

  const createTemplateFunction = (value) => {
    const queryParameter = {
      ...value,
      app_id: appId,
      example_content: isEmpty(value?.example_content)
        ? []
        : value.example_content,
      example_header: [],
    };
    setLoading(true);
    createTemplate(queryParameter)
      .then(() => {
        setLoading(false);
        notification.success({
          message: GUPSHUP_TEMPLATE_TO_APPROVE_SCCESSS_MESSAGE,
        });
        fetchData({
          pagination: { pageSize: PAGE_LIMIT, current: INITIAL_PAGE },
        });
      })
      .catch((error) => {
        setLoading(false);
        notification.error({ message: error?.message || FAILED_TO_LOAD });
      });
  };

  const handleApproveTemplate = (value) => {
    confirm({
      title: GUPSHUP_PARTNER_APPROVE_COMFIRM_TEXT,
      onOk() {
        createTemplateFunction(value);
      },
    });
  };

  const verfiyTemplateConfirmation = (value) => {
    if (value?.is_already_used) {
      warning({
        title: GUPSHUP_TEMPLATE_DEFAULT_ALREADY_MESSAGE,
        onOk() {},
      });
    } else {
      confirm({
        title: GUPSHUP_TEMPLATE_DEFAULT_EDIT_MESSAGE,
        onOk() {
          navigate(
            `/gupshup/${appId}/template/edit/${value?.template?.template_uid}`
          );
        },
      });
    }
  };

  const verifyTemplate = (id) => {
    const queryParameter = {
      template_uid: id,
      app_id: appId,
    };
    setLoading(true);
    getTemplate(queryParameter)
      .then((response) => {
        verfiyTemplateConfirmation(response?.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({ message: error?.message || FAILED_TO_LOAD });
      });
  };

  return (
    <div className="template-list-main-container">
      <div className="search-container inventory-search-box">
        <Breadcrumb>
          <Breadcrumb.Item>
            <h1>
              <PlansAndWallet /> {GUPSHUP_PARTNER_TEMPLATE_TITLE}
            </h1>
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className="mt-10 flex-bwn">
        <Tabs
          type="card"
          activeKey={activeTab}
          onChange={handleActiveTab}
          className="theme-tabs-settings"
        >
          <TabPane tab="Explore" key={GUPSHUP_TEMPLATE_STATUS_DEFAULT} />
          <TabPane tab="All" key={GUPSHUP_TEMPLATE_STATUS_ALL} />
          <TabPane tab="Pending" key={GUPSHUP_TEMPLATE_STATUS_PENDING} />
          <TabPane tab="Approved" key={GUPSHUP_TEMPLATE_STATUS_APPROVED} />
          <TabPane tab="Rejected" key={GUPSHUP_TEMPLATE_STATUS_REJECTED} />
        </Tabs>
        <div>
          <Input
            placeholder="Search"
            onChange={(event_) => onSearch(event_.target.value)}
            className="custom-search"
            value={searchWord}
            suffix={<SearchOutlined className="site-form-item-icon" />}
          />
        </div>
        {activeTab !== GUPSHUP_TEMPLATE_STATUS_DEFAULT && (
          <div>
            <Button type="primary" onClick={() => handleRedirectEdit('')}>
              Add Template
            </Button>
          </div>
        )}
      </div>
      {activeTab === GUPSHUP_TEMPLATE_STATUS_DEFAULT ? (
        <div>
          <div id="scrollableDiv" className="template-list-container">
            <InfiniteScroll
              dataLength={templates?.length || 0}
              next={loadMoreData}
              hasMore={templates?.length < totalTemplateCount}
              scrollableTarget="scrollableDiv"
            >
              <List
                itemLayout="horizontal"
                dataSource={templates}
                grid={{
                  gutter: 0,
                  xs: 1,
                  sm: 2,
                  md: 3,
                  lg: 3,
                  xl: 4,
                  xxl: 5,
                }}
                className="products-listlook"
                loading={loading}
                renderItem={(data, index) => {
                  return (
                    <List.Item key={data?.template_uid}>
                      {index === 0 ? (
                        <AddTemplateCard
                          data={data}
                          handleRedirectEdit={handleRedirectEdit}
                        />
                      ) : (
                        <TemplateItem
                          template={data}
                          handlePreview={handlePreview}
                          handleApproveTemplate={handleApproveTemplate}
                          handleRedirectEdit={verifyTemplate}
                        />
                      )}
                    </List.Item>
                  );
                }}
              />
            </InfiniteScroll>
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <Table
            className="grid-table product-grid-table product-table"
            rowKey={(record) => record.product_uid}
            columns={columns}
            dataSource={templates}
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
          />
        </div>
      )}
      <Modal
        title=""
        visible={modalVisible}
        footer={false}
        className="preview-modal"
        onCancel={handleCancel}
        closable={false}
      >
        <TemplatePreview template={selectedTemplate} />
      </Modal>
    </div>
  );
}

export default GupshupTemplate;
