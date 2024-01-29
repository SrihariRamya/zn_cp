import React, { useState, useEffect } from 'react';
import {
  Breadcrumb,
  Button,
  Modal,
  Input,
  Tag,
  Switch,
  Table,
  Tooltip,
  Space,
} from 'antd';
import {
  LogoutOutlined,
  MessageOutlined,
  SearchOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { notification } from 'antd/lib';
import { debounce, get } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { paginationstyler } from '../../shared/attributes-helper';
import {
  FAILED_TO_LOAD,
  GUPSHUP_PARTNER_APP_TITLE,
  GUPSHUP_PARTNER_STATUS_CONFIRM,
  GUPSHUP_PARTNER_STATUS_WARNING,
  INITIAL_PAGE,
  PAGE_LIMIT,
} from '../../shared/constant-values';
import { setAsDefaultApp, getAllPartnerApp } from '../../utils/api/url-helper';
import CreatePartnerAccount from './create-partner-account';

const { confirm, warning } = Modal;

function PartnerAppList() {
  const history = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [appList, setAppList] = useState();
  const [pagination, setPagination] = useState({
    current: INITIAL_PAGE,
    pageSize: PAGE_LIMIT,
  });
  const [modalVisible, setModalVisible] = useState(false);

  const fetchData = (parameters) => {
    const {
      pagination: { pageSize, current },
      searchKey,
    } = parameters;
    const queryParameter = {
      limit: pageSize,
      offset: current,
    };
    if (searchKey) {
      queryParameter.searchWord = searchKey;
    }
    setLoading(true);
    getAllPartnerApp(queryParameter)
      .then((response) => {
        setAppList(get(response, 'data.rows', []));
        setPagination({
          ...parameters.pagination,
          total: response?.data?.count,
        });
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({ message: error?.error || FAILED_TO_LOAD });
      });
  };

  useEffect(() => {
    fetchData({
      pagination: { pageSize: PAGE_LIMIT, current: INITIAL_PAGE },
    });
  }, []);

  useEffect(() => {
    paginationstyler();
  }, [appList]);

  const onSearchDebounce = debounce((value) => {
    fetchData({
      pagination: { pageSize: PAGE_LIMIT, current: INITIAL_PAGE },
      searchKey: value,
    });
  }, 1000);

  const onSearch = (value) => {
    setSearchWord(value || '');
    onSearchDebounce(value);
  };

  const setAsDefaultAppfunc = (value) => {
    const parameters = {
      is_default: true,
    };
    setLoading(true);
    setAsDefaultApp(get(value, 'partner_app_uid', ''), parameters)
      .then(() => {
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
    if (status) {
      confirm({
        title: GUPSHUP_PARTNER_STATUS_CONFIRM,
        onOk() {
          setAsDefaultAppfunc(value);
        },
      });
    } else {
      warning({
        title: GUPSHUP_PARTNER_STATUS_WARNING,
        onOk() {},
      });
    }
  };

  const columns = [
    {
      title: 'Business Name',
      dataIndex: 'bot_name',
      key: 'bot_name',
      width: '30%',
      render: (text) => (
        <div className="product-name-div">
          <div style={{ color: 'black' }} className="product-link product-name">
            {text}
          </div>
        </div>
      ),
    },
    {
      title: 'Stage',
      dataIndex: 'is_verified',
      align: 'center',
      render: (text, _row) => {
        return (
          <Tag color={_row?.is_verified ? 'green' : 'blue'}>
            {_row?.is_verified ? 'live' : 'Go live'}
          </Tag>
        );
      },
    },
    {
      title: 'ON/OFF',
      dataIndex: 'is_default',
      align: 'center',
      render: (text, _row) => {
        return (
          <Tooltip title={!_row?.is_verified && 'App not verified'}>
            <Switch
              className="switch-container"
              checked={text}
              disabled={!_row?.is_verified}
              onClick={(value) => activeUpdate(value, _row)}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Action',
      align: 'center',
      render: (data) => (
        <span>
          <Space>
            {data?.is_verified ? (
              <LogoutOutlined
                onClick={() => history(`${data?.app_id}/template`)}
              />
            ) : (
              <Tooltip title="App not verified">
                <LogoutOutlined disabled style={{ cursor: 'none' }} />
              </Tooltip>
            )}
            {data?.is_verified ? (
              <MessageOutlined
                onClick={() => history(`${data?.app_id}/messages`)}
              />
            ) : (
              <Tooltip title="App not verified">
                <MessageOutlined disabled style={{ cursor: 'none' }} />
              </Tooltip>
            )}
          </Space>
        </span>
      ),
    },
  ];

  const handleTableChange = (paginationAlias) => {
    const { current, pageSize } = paginationAlias;
    fetchData({
      pagination: { pageSize, current },
    });
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handlereFreshPage = () => {
    setModalVisible(false);
    fetchData({
      pagination: { pageSize: PAGE_LIMIT, current: INITIAL_PAGE },
    });
  };

  return (
    <div>
      <div className="search-container inventory-search-box">
        <Breadcrumb>
          <Breadcrumb.Item>
            <h1>
              <UserSwitchOutlined /> {GUPSHUP_PARTNER_APP_TITLE}
            </h1>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div>
          <Input
            placeholder="Search"
            onChange={(event_) => onSearch(event_.target.value)}
            value={searchWord}
            className="custom-search"
            suffix={<SearchOutlined className="site-form-item-icon" />}
          />
        </div>
        <div>
          <Button
            type="primary"
            className="add-btn"
            onClick={() => setModalVisible(true)}
          >
            Add your whatsapp number
          </Button>
        </div>
      </div>
      <div>
        <Table
          className="grid-table product-grid-table product-table"
          rowKey={(record) => record.product_uid}
          columns={columns}
          dataSource={appList}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </div>
      <Modal
        open={modalVisible}
        title="Create Your Whatsapp Business Account"
        footer={false}
        destroyOnClose
        onCancel={handleCloseModal}
      >
        <CreatePartnerAccount handlereFreshPage={handlereFreshPage} />
      </Modal>
    </div>
  );
}

export default PartnerAppList;
