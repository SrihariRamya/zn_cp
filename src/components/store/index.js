/* eslint-disable camelcase */
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Input,
  Space,
  Table,
  notification,
  Button,
  Breadcrumb,
  Avatar,
  Typography,
  Switch,
  Tooltip,
  Alert,
  Row,
  Col,
  Select,
  Tag,
  Modal,
  Drawer,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  CloseCircleOutlined,
  WarningFilled,
} from '@ant-design/icons';
import './store.less';
import {
  get,
  omit,
  isEmpty,
  debounce,
  compact,
  map,
  pick,
  kebabCase,
} from 'lodash';
import FirstTimeUser from '../../shared/first-time-user';
import { TenantContext } from '../context/tenant-context';
import { ReactComponent as Stores } from '../../assets/icons/store-icon.svg';
import {
  getStore,
  deleteStore,
  getMarketPlace,
  addStoreToMarketPlace,
  editStoreStatus,
  getStoreStatus,
  getStoreByLocation,
  setOneStoreStatus,
} from '../../utils/api/url-helper';
import {
  STORE_DELETE_SUCCESS,
  STORE_DELETE_FAILED,
  FAILED_TO_LOAD,
  INITIAL_PAGE,
  STORE_FIRST_TIME_USER_TITLE,
  STORE_FIRST_TIME_USER_DESCRIPTION,
} from '../../shared/constant-values';
import { handleUrlChanges } from '../../shared/common-url-helper';
import FilterFilled from '../../assets/icons/filter.svg';
import {
  DeleteAlert,
  DeleteAlertImage,
  DeleteAlertAssociated,
} from '../../shared/sweetalert-helper';
import { paginationstyler } from '../../shared/attributes-helper';
import { eventTrack, labelColor } from '../../shared/function-helper';
import { defaultImage } from '../../shared/image-helper';
import { withRouter } from '../../utils/react-router/index';
import StoreMobileView from './store-mobile-view';
import StoreDefaultImage from '../../assets/images/store-default-image.png';
import { ReactComponent as EditIcon } from '../../assets/images/edit-icon.svg';
import { ReactComponent as DeleteIcon } from '../../assets/images/delete-icon.svg';
import TimerModal from './timer-modal';

const { Option } = Select;
const { Text } = Typography;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const formatMarketData = (value) => {
  const marketPlaceStore = value.marketplace_store_details;
  if (marketPlaceStore) {
    const marketplace_store_activity = get(
      marketPlaceStore,
      'marketplace_store_activity'
    );
    const active = get(marketPlaceStore, 'active');
    const id = get(marketPlaceStore, 'id');
    value.marketPlaceExists = true;
    value.marketPlaceStoreUpdateId = id;
    value.active = active;
    value.marketplace_store_activity_uid =
      marketplace_store_activity[0]?.marketplace_store_activity_uid;
    value.marketplace_uid = marketPlaceStore?.marketplace_uid;
    value.marketplace_store_uid = marketPlaceStore?.marketplace_store_uid;
    value.status = marketplace_store_activity[0]?.status;
  } else {
    value.marketplace_uid = '';
    value.active = false;
    value.status = '';
    value.marketPlaceExists = false;
  }
  return value;
};

const adminEvent = (text) => {
  const parameter = {
    value: text,
  };
  eventTrack(`${text} Click`, parameter);
};

function Store(propertie) {
  const { history } = propertie;
  const navigate = useNavigate();
  const mobileView = useContext(TenantContext)[4];
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [searchWord, setSearchWord] = useState('');
  const [locationData, setLocationData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [tableChange, setTableChange] = useState(false);
  const [storeSorter, setStoreSorter] = useState({});
  const [storeCurrentValue, setStoreCurrentValue] = useState(1);
  const [marketPlace, setMarketPlace] = useState({});
  const [closedStoreMessage, setClosedStoreMessage] = useState('');
  const [roleInfo] = useState(localStorage.getItem('roleName'));
  const [storeCount, setStoreCount] = useState();
  const [page, setPage] = useState(INITIAL_PAGE);
  const [storeDetails, setStoreDetails] = useState([]);
  const [city, setCity] = useState([]);
  const [oneStoreUID, setOneStoreUID] = useState();
  const [storeVisible, setStoreVisible] = useState();
  const [statusVisible, setStatusVisible] = useState(false);
  const [statusStoreUid, setStatusStoreUid] = useState(false);
  const firstUpdate = useRef(true);
  const query = useQuery();
  const currentPage = query.get('page');
  const moduleName = 'stores';
  const firstPage = 1;
  const handleByStoreDetails = (storeData, slug) => {
    setStoreDetails(slug ? [...storeDetails, ...storeData] : storeData);
  };

  const handleByCurrentPage = (current) => {
    if (mobileView) {
      setPage(current);
    }
  };

  const fetchStoreData = (
    parameters = {},
    showError = false,
    rejectError = true
  ) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      let filter = {};
      const searchParameter = {};
      const {
        pagination: { pageSize, current },
        name,
        searchKey,
        storeSubDistrict,
        slug,
      } = parameters;
      if (!isEmpty(name)) {
        searchParameter.cityName = name;
      }
      filter = omit(parameters, ['pagination', 'name']);
      if (searchKey) {
        searchParameter.searchWord = searchKey;
      }
      if (storeSubDistrict) {
        searchParameter.storeSubDistrict = storeSubDistrict;
      }
      searchParameter.firstTableParams = 'zm_store';
      getStore({
        limit: pageSize,
        offset: current,
        sorter: JSON.stringify(storeSorter),
        ...filter,
        ...searchParameter,
      })
        .then((response) => {
          const stores = get(response, 'data', '');
          const storeData = stores.rows.map((x, key) => {
            x.key = key;
            x.address = [
              `${get(x, 'address_1', '')},`,
              !isEmpty(get(x, 'address_2', '')) &&
                `${get(x, 'address_2', '')},`,
              `${get(
                x,
                'store_subdistrict.sub_district.sub_district_name',
                ''
              )},`,
              `${+get(x, 'pincode', '')}.`,
            ];
            const marketData = formatMarketData(x);
            return { ...x, ...marketData };
          });
          setTableData(storeData);
          setStoreCount(stores.count);
          setPagination({
            ...parameters.pagination,
            total: stores.count,
          });
          handleByStoreDetails(storeData, slug);
          handleByCurrentPage(current);
          setLoading(false);
          setTableChange(false);
          setOneStoreUID(storeData?.[0]?.store_uid);
          setStoreVisible(storeData?.[0]?.is_one_store_enable);
          resolve(response);
        })
        .catch((error_) => {
          setLoading(false);
          setTableChange(false);
          if (showError) notification.error({ message: FAILED_TO_LOAD });
          if (rejectError) reject(error_);
        });
    });
  };
  const fetchData = useCallback((parameters) => {
    Promise.all([
      getStoreByLocation(),
      fetchStoreData(parameters || { pagination }),
    ])
      .then((response) => {
        const locationDetail = get(response, '[0].data', []);
        const filterLocation = map(locationDetail, (name) => {
          return pick(name.sub_district, [
            'sub_district_id',
            'sub_district_name',
          ]);
        });
        setCity(filterLocation);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, []);

  useEffect(() => {
    const current = Number.isNaN(currentPage) ? false : Number(currentPage);
    const newPagination = {
      ...pagination,
      ...(current && { current }),
    };
    if (!tableChange && !firstUpdate.current) {
      const addPagination = currentPage
        ? newPagination
        : { ...pagination, current: 1 };
      fetchStoreData({
        pagination: addPagination,
        name: locationData,
        searchKey: searchWord,
      });
    }

    if (firstUpdate.current) {
      firstUpdate.current = false;
      const parameters = current
        ? {
            pagination: newPagination,
            searchKey: searchWord || '',
            name: locationData || '',
          }
        : false;
      fetchData(parameters);
    }
  }, [currentPage]);

  const handleTableChange = (paginationAlias, filters, sorted) => {
    setTableChange(true);
    const { current } = paginationAlias;
    handleUrlChanges(current, history, moduleName);
    if (isEmpty(sorted.order)) {
      setStoreSorter({
        columnKey: sorted.columnKey,
        order: sorted.order === '',
      });
      setStoreCurrentValue(current);
    } else {
      setStoreSorter({
        columnKey: sorted.columnKey,
        order: sorted.order === 'ascend' ? 'ascend' : 'descend',
      });
      setStoreCurrentValue(current);
    }
  };
  useEffect(() => {
    if (Object.keys(storeSorter).length > 0) {
      fetchStoreData({
        pagination: { pageSize: 10, current: storeCurrentValue },
        name: locationData,
        searchKey: searchWord,
      });
    }
  }, [storeSorter]);

  useEffect(() => {
    Promise.all([getMarketPlace(), getStoreStatus()])
      .then((response) => {
        setMarketPlace(get(response, '[0].data', {}));
        setClosedStoreMessage(get(response, '[1].message', ''));
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, []);

  const globalSearchDebounce = debounce((value) => {
    setTableChange(true);
    handleUrlChanges(firstPage, history, moduleName);
    fetchStoreData({
      pagination: { pageSize: 10, current: 1 },
      name: locationData,
      searchKey: value,
    });
  }, 1000);

  const globalSearch = (value) => {
    setSearchWord(value || '');
    globalSearchDebounce(value);
  };

  const handleChange = (value) => {
    setTableChange(true);
    setLocationData(value);

    handleUrlChanges(firstPage, history, moduleName);
    fetchStoreData({
      pagination: { pageSize: 10, current: 1 },
      name: value,
      searchKey: searchWord,
    });
  };

  const paginationFetch = (current, currentPageValue) => {
    if (tableData.length === 1 && current > 1) {
      handleTableChange({ current: currentPageValue });
    } else {
      fetchStoreData({
        pagination: { ...pagination, current: currentPageValue },
      });
    }
  };

  const storeHardDelete = async (id, current, currentPageValue) => {
    const title =
      'This store is associated with one or more user(s)/pos machine(s)';
    const text =
      'Are you sure? The store will be deleted and user(s)/pos machines(s) will be unassociated?';
    const result = await DeleteAlertAssociated(title, text);
    if (result.isConfirmed) {
      setLoading(true);
      setSearchWord('');
      setLocationData([]);
      deleteStore(id.store_uid, { forceDelete: true }).then(() => {
        setLoading(false);
        DeleteAlertImage(STORE_DELETE_SUCCESS);
        paginationFetch(current, currentPageValue);
      });
    } else {
      setLoading(false);
    }
  };

  const handleDelete = async (event_, id) => {
    const text = 'Are you sure want to delete this store from the list?';
    const result = await DeleteAlert(text, 0);
    if (result.isConfirmed) {
      const { current } = pagination;
      const currentPageValue =
        tableData.length === 1 && current > 1 ? current - 1 : current;
      setLoading(true);
      deleteStore(id.store_uid)
        .then(() => {
          setLoading(false);
          setSearchWord('');
          setLocationData([]);
          notification.success({
            message: STORE_DELETE_SUCCESS,
          });
          paginationFetch(current, currentPageValue);
        })
        .catch((error__) => {
          let parsedResponse = {};
          try {
            parsedResponse = error__.json();
          } catch {
            parsedResponse = error__;
          }
          if (parsedResponse.message === 'POS/User Associated') {
            storeHardDelete(id, current, currentPageValue);
          } else {
            setLoading(false);
            notification.error({
              message: STORE_DELETE_FAILED,
            });
          }
        });
    }
  };

  const handleCheckbox = (event, record = {}) => {
    const {
      store_uid,
      store_name,
      address_1,
      address_2,
      store_location,
      store_person_number,
      gst_number = '',
      marketPlaceStoreUpdateId,
      marketplace_store_uid = '',
      marketplace_store_activity_uid = '',
      store_district,
      marketPlaceExists,
      marketplace_uid,
    } = record;
    const parameters = {
      marketplace_uid: marketPlace?.marketplace_uid,
      apiAction: marketPlaceExists ? 'update' : 'create',
      checked: event,
      store_uid,
      store_name,
      address_1,
      address_2,
      store_location,
      store_person_number,
      gst_number,
      marketPlaceStoreUpdateId,
      marketplace_store_uid,
      marketplace_store_activity_uid,
      district_name:
        isEmpty(get(record, 'international_code', '')) ||
        get(record, 'international_code', '') === 'IN'
          ? get(store_district, 'district_name', '')
          : get(record, 'international_city', ''),
    };
    setLoading(true);
    addStoreToMarketPlace(parameters)
      .then((response) => {
        if (response.success) {
          fetchStoreData({
            pagination: { pageSize: 10, current: Number(currentPage) || 1 },
            name: locationData,
            searchKey: searchWord,
          });
          notification.success({
            message: `Market Place ${
              marketplace_uid ? 'Updated' : 'Created'
            } Successfully`,
          });
        } else setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: error?.message || 'Failed to update Store',
        });
      });
  };

  const handleStoreVisible = (checked) => {
    setLoading(true);
    setOneStoreStatus(oneStoreUID, { is_one_store_enable: checked })
      .then(() => {
        setLoading(false);
        setStoreVisible(checked);
        notification.success({ message: 'Store status updated' });
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: error?.message || 'Failed to update One Store',
        });
      });
  };

  const handleStoreOpen = (record) => {
    adminEvent('Set Holiday');
    const { store_uid, is_store_open, values } = record;
    setLoading(true);
    editStoreStatus(
      {
        is_store_open: !is_store_open,
        offline_message: get(values, 'offline_message', ''),
        offline_end_time_stamp: get(values, 'offline_end_time_stamp', ''),
        offline_start_time_stamp: get(values, 'offline_start_time_stamp', ''),
        offline_color: get(values, 'offline_color', ''),
      },
      store_uid
    )
      .then((response) => {
        setClosedStoreMessage(response.message);
        setLoading(true);
        fetchStoreData({
          pagination: { pageSize: 10, current: Number(currentPage) || 1 },
          name: locationData,
          searchKey: searchWord,
        });
      })
      .catch((error) => {
        setStatusVisible(false);
        setLoading(false);
        notification.error({
          message: error?.message || 'Failed to update Store',
        });
      });
  };

  const handleByStatus = (record) => {
    if (record.is_store_open) {
      setStatusStoreUid(record);
      setStatusVisible(true);
    } else handleStoreOpen(record);
  };

  const columns = [
    {
      title: 'Store',
      dataIndex: 'store_name',
      key: 'store_name',
      render: (data, record) => (
        <Link to={`/stores/edit-store/${record.store_uid}`}>
          <Col>
            {!get(record, 'is_store_open', '') && (
              <Row>
                <div className="offline-tag">OFFLINE</div>
                <div className="tag-end" />
              </Row>
            )}
            <Avatar
              shape="square"
              size={55}
              src={get(record, 'image', '') || defaultImage}
              style={{ marginLeft: '13px' }}
            />
            {record.is_central ? (
              <div className="stores-ribbon">
                <div className="ribbon">
                  <span>central store</span>
                </div>
              </div>
            ) : (
              ''
            )}{' '}
            &nbsp;
            <span style={{ marginTop: '16px' }}>{data}</span>
          </Col>
        </Link>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_store_open',
      key: 'is_store_open',
      render: (text, record) => (
        <div onClick={() => adminEvent('Store Status')} aria-hidden="true">
          <Switch
            className="switch-container"
            checked={!text}
            onChange={() => handleByStatus(record)}
            size="small"
          />
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'store_person_name',
      key: 'store_person_name',
      render: (text) => <span className="text-grey-light"> {text} </span>,
    },
    {
      title: 'Phone Number',
      key: 'store_person_number',
      render: (data) => (
        <span className="text-grey-light">
          {get(data, 'country_code', '')} {get(data, 'store_person_number', '')}
        </span>
      ),
    },
    {
      align: 'center',
      title: 'Address',
      dataIndex: 'store_location',
      render: (a) => {
        return (
          <div className="address_text">
            <Text className="text-grey-light"> {a} </Text>
          </div>
        );
      },
    },
    {
      title: 'Jingls',
      dataIndex: 'active',
      key: 'active',
      width: 70,
      render: (checkbox, record) => {
        return (
          <div onClick={() => adminEvent('Columbus Active')} aria-hidden="true">
            <Switch
              className="switch-container"
              checked={checkbox}
              onChange={(event) => handleCheckbox(event, record)}
              size="small"
              disabled={['IN-PROGRESS'].includes(record?.status)}
            />
          </div>
        );
      },
    },
    {
      title: 'Jingls Status',
      dataIndex: 'status',
      key: 'status',
      width: 70,
      render: (text) => <Tag color={labelColor[kebabCase(text)]}>{text}</Tag>,
    },
    {
      title: 'Actions',
      align: 'right',
      key: 'action',
      render: (data) => {
        return (
          <span className="edit-boxs">
            <Link to={`/stores/edit-store/${data.store_uid}`}>
              <Tooltip title="Edit">
                <EditIcon onClick={() => adminEvent('Store Edit')} />
              </Tooltip>
            </Link>
            &nbsp;
            <Row
              onClick={(event) => handleDelete(event, data)}
              className="store-delete"
            >
              <Tooltip title="Delete">
                <DeleteIcon onClick={() => adminEvent('Store Delete')} />
              </Tooltip>
            </Row>
          </span>
        );
      },
    },
  ];

  useEffect(() => {
    paginationstyler();
  }, [tableData]);

  const filteredColumns = ['tenant_admin'].includes(roleInfo)
    ? columns
    : columns.filter((value) => value.title !== 'Market Place');

  const parameters = {
    searchWord,
    globalSearch,
    closedStoreMessage,
    setClosedStoreMessage,
    storeCount,
    storeDetails,
    page,
    setPage,
    fetchStoreData,
    adminEvent,
    handleDelete,
    loading,
    handleByStatus,
  };

  const showDrawer = () => {
    navigate('/stores/add-store');
  };

  const renderStoreHistoryData = () => {
    if (storeCount === 0) {
      return (
        <FirstTimeUser
          title={STORE_FIRST_TIME_USER_TITLE}
          description={STORE_FIRST_TIME_USER_DESCRIPTION}
          onClick={showDrawer}
          src={StoreDefaultImage}
          buttonTitle="Add Store"
        />
      );
    }
    if (mobileView) {
      return <StoreMobileView parameters={parameters} />;
    }
    return (
      <>
        <div className="store-header-container">
          <div className="store-title">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Space>
                  <Stores />
                  <div className="heading mb-5p fs-18p">Stores</div>
                </Space>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="store-global-search">
            <Input
              allowClear
              placeholder="Search"
              value={searchWord}
              onChange={(event_) => globalSearch(event_.target.value)}
              className="custom-search"
              suffix={<SearchOutlined className="site-form-item-icon" />}
            />
          </div>
        </div>
        {closedStoreMessage && (
          <Alert
            className="store-alert mt-5"
            message={
              <>
                <WarningFilled twoToneColor="#634343" />
                {closedStoreMessage}
              </>
            }
            closeText={<CloseCircleOutlined />}
            closable
          />
        )}
        <div className="box" style={{ padding: '0px 10px' }}>
          <Row justify="end">
            <Col style={{ display: 'none' }}>
              <Select
                className="location-select stores-loc-search-input"
                mode="multiple"
                onChange={handleChange}
                value={locationData}
                maxTagCount="responsive"
                placeholder={
                  <Space>
                    &nbsp;
                    <div>
                      <img
                        src={FilterFilled}
                        alt="."
                        className="text-primary"
                      />
                    </div>
                    &nbsp; Filter by location
                  </Space>
                }
                allowClear
                filterOption={(input, option) =>
                  option.children
                    .toLowerCase()
                    .includes(input.toLowerCase()) === true
                }
              >
                {compact(city).map((item) => (
                  <Option value={item.sub_district_id}>
                    {item.sub_district_name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <div className="box__header select-alignment add-store-btn">
                {storeCount === 1 && (
                  <div className="one-store" style={{ display: 'none' }}>
                    Store Visible
                    <Switch
                      checked={storeVisible}
                      onChange={(checked) => handleStoreVisible(checked)}
                      size="big"
                      className="one-store-switch"
                    />
                  </div>
                )}
                <div>
                  <Link to="/stores/add-store">
                    <Button type="primary">
                      <Space>
                        <PlusOutlined />
                        Add Store
                      </Space>
                    </Button>
                  </Link>
                </div>
              </div>
            </Col>
          </Row>

          <div>
            <Table
              className="store-grid-table table-header-min orders-table-styles"
              columns={filteredColumns}
              rowKey={(record) => record.store_uid}
              dataSource={tableData}
              pagination={pagination}
              loading={loading}
              onChange={handleTableChange}
              rowClassName={(record) => {
                return record.is_central ? 'active-green' : '';
              }}
              scroll={{ x: 780 }}
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {renderStoreHistoryData()}
      {mobileView ? (
        <Drawer
          placement="bottom"
          closable={false}
          onClose={() => setStatusVisible(false)}
          open={statusVisible}
          height={500}
          className="store-status-drawer"
        >
          <TimerModal
            handleStoreOpen={handleStoreOpen}
            statusStoreUid={statusStoreUid}
            setStatusVisible={setStatusVisible}
          />
        </Drawer>
      ) : (
        <Modal
          open={statusVisible}
          footer={false}
          width={700}
          onCancel={() => setStatusVisible(false)}
          className="store-status-modal"
        >
          <TimerModal
            handleStoreOpen={handleStoreOpen}
            statusStoreUid={statusStoreUid}
            setStatusVisible={setStatusVisible}
          />
        </Modal>
      )}
    </>
  );
}
export default withRouter(Store);
