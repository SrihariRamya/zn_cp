import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  Input,
  Space,
  Table,
  notification,
  Button,
  Spin,
  Breadcrumb,
  Tag,
  Dropdown,
  Menu,
  Select,
  Popover,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  CaretDownOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import './search.less';
import moment from 'moment';
import _ from 'lodash';
import FilterFilled from '../../assets/icons/filter.svg';
import ExcelDownload from '../../shared/excel';
import save from '../../assets/save.svg';
import {
  ENQUIRY_DELETE_SUCCESS,
  FAILED_TO_LOAD,
  ENQUIRY_DELETE_FAIL,
  DOWNLOAD_FAILED,
} from '../../shared/constant-values';
import { handleUrlChanges } from '../../shared/common-url-helper';
import { ReactComponent as Search } from '../../assets/icons/search.svg';
import {
  getSearchEnquiries,
  deleteSearchEnquiries,
  getSearchByLocation,
} from '../../utils/api/url-helper';
import { TenantContext } from '../context/tenant-context';
import {
  DeleteAlert,
  DeleteAlertImage,
  DeleteAlertMessage,
} from '../../shared/sweetalert-helper';
import { paginationstyler } from '../../shared/attributes-helper';
import { getFilterData } from '../../shared/table-helper';
import { withRouter } from '../../utils/react-router/index'

const { Option } = Select;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchEnquiries = (properties) => {
  const { history } = properties;
  const canWrite = _.get(properties, 'roleData.can_write', false);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedID, setSelectedID] = useState();
  const [searchWord, setSearchWord] = useState('');
  const [filterValue, setFilterValue] = useState();
  const [tenantDetails] = useContext(TenantContext);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [dateValue, setDateValue] = useState();
  const [status, setstatus] = useState('All');
  const [enableSave, setEnableSave] = useState(false);
  const [city, setCity] = useState([]);
  const [cityField, setCityField] = useState([]);
  const [tableChange, setTableChange] = useState(false);
  const [filterData, setFilterData] = useState({});
  const [sorter, setSorter] = useState({});
  const [curentValue, setCurrentValue] = useState(1);

  const firstUpdate = useRef(true);

  const query = useQuery();
  const currentPageCount = query.get('page');
  const moduleName = 'search-enquiries';
  const firstPage = 1;

  const dropdowns = [
    { value: 0, description: 'All' },
    { value: 7, description: 'Last 7 days' },
    { value: 30, description: 'Last 30 days' },
    { value: 90, description: 'Last 3 Month' },
    { value: 180, description: 'Last 6 Month' },
  ];

  const fetchSearchEnquiriesData = (
    parameters = {},
    showError = false,
    rejectError = true
  ) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      const filter = {};
      let cityFilter = {};
      const searchParameter = {};
      const {
        pagination: { pageSize, current },
        date,
        name,
        searchKey,
      } = parameters;
      if (date) {
        searchParameter.today = date.today;
        searchParameter.dateBy = date.dateBy;
      }
      if (!_.isEmpty(name)) {
        searchParameter.name = name;
      }
      cityFilter = _.omit(parameters, ['pagination', 'name']);
      if (searchKey) {
        searchParameter.searchWord = searchKey;
      }
      searchParameter.firstTableParams = 'zt_product_search';
      if (filterData.creation_date) {
        searchParameter.creationDate = true;
      }
      if (_.get(filterData, 'user_name', '') || _.get(filterData, 'city', '')) {
        searchParameter.secondTableParams = true;
      }

      getSearchEnquiries({
        limit: pageSize,
        offset: current,
        sorter: JSON.stringify(sorter),
        filters: JSON.stringify(filterData),
        ...filter,
        ...cityFilter,
        ...searchParameter,
      })
        .then((response) => {
          const searchEnquiriesData = _.get(response, 'data', []);
          setTableData(searchEnquiriesData.rows);
          setPagination({
            ...parameters.pagination,
            current,
            total: searchEnquiriesData.count,
          });
          setLoading(false);
          setTableChange(false);
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
      getSearchByLocation(),
      fetchSearchEnquiriesData(parameters || { pagination }),
    ])
      .then((response) => {
        const locationDetail = _.get(response, '[0].data', []);
        const filterLocation = _.map(locationDetail, (name) => {
          return _.pick(name.zm_user, ['user_uid', 'city']);
        });
        setCity(filterLocation);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (value) => {
    setTableChange(true);
    setCityField(value);

    handleUrlChanges(firstPage, history, moduleName);
    fetchSearchEnquiriesData({
      pagination: { pageSize: 10, current: 1 },
      searchKey: searchWord,
      date: dateValue,
      name: value,
    });
  };

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    const current = !isNaN(currentPageCount) ? Number(currentPageCount) : false;
    const newPagination = {
      ...pagination,
      ...(current && { current }),
    };
    if (!tableChange && !firstUpdate.current) {
      const addPagination = currentPageCount
        ? newPagination
        : { ...pagination, current: 1 };

      fetchSearchEnquiriesData({
        pagination: addPagination,
        searchKey: searchWord,
        date: dateValue,
        name: cityField,
      });
    }

    if (firstUpdate.current) {
      firstUpdate.current = false;
      const parameters = current
        ? {
            pagination: newPagination,
            searchKey: searchWord || '',
            date: dateValue || '',
            name: cityField || '',
          }
        : false;
      fetchData(parameters);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageCount]);

  const onSearchDebounce = _.debounce((value) => {
    setTableChange(true);
    handleUrlChanges(firstPage, history, moduleName);
    fetchSearchEnquiriesData({
      pagination: { pageSize: 10, current: 1 },
      searchKey: value,
      date: dateValue,
      name: cityField,
    });
  }, 1000);

  const onSearch = (value) => {
    setSearchWord(value || '');
    onSearchDebounce(value);
  };

  const handleTableChange = (paginationAlias, filters, sorters) => {
    setTableChange(true);
    const { current } = paginationAlias;
    handleUrlChanges(current, history, moduleName);
    if (!_.isEmpty(sorters.order) && sorters) {
      setSorter({
        columnKey: sorters.columnKey,
        order: sorters.order === 'ascend' ? 'ascend' : 'descend',
      });
      setCurrentValue(current);
    } else {
      setSorter({
        columnKey: sorters.columnKey,
        order: sorters.order === '',
      });
    }
    setCurrentValue(current);
  };

  useEffect(() => {
    if (Object.keys(sorter).length > 0) {
      fetchSearchEnquiriesData({
        pagination: { pageSize: 10, current: curentValue },
        searchKey: searchWord,
        date: dateValue,
        name: cityField,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorter]);

  const handleDownload = () => {
    let tableDataValue = [];
    try {
      if (selectedID.length) {
        tableDataValue = selectedID.map((value) => {
          const dataValue = {
            Id: value.product_search_id,
            Searched_Words: value.product_code,
            Date: moment(value.creation_date).format(
              _.get(tenantDetails, 'setting.date_format', 'DD-MM-YYYY hh:mm')
            ),
            Location: value.zm_user.city,
            Searched_User: value.zm_user.user_name,
          };
          return dataValue;
        });
      }
      setEnableSave(true);
      ExcelDownload(tableDataValue, 'Search enquiries');
    } catch {
      notification.error({ message: DOWNLOAD_FAILED });
    }
  };

  const resetFilters = () => {
    setTableChange(true);
    setFilterValue();
    setstatus('ALL');
    setCityField([]);
    setDateValue();
    handleUrlChanges(firstPage, history, moduleName);
    fetchSearchEnquiriesData({
      pagination: { ...pagination, current: 1 },
      searchKey: searchWord,
      name: cityField,
    });
  };

  const handleDaysFilter = (value) => {
    value = value === 0 ? 0 : value.key;
    if (value === '0' || value === 0) {
      setstatus('All');
      value = 'All';
    } else if (value === '90') {
      setstatus('Last 3 Month');
    } else if (value === '30') {
      setstatus('Last 30 days');
    } else if (value === '180') {
      setstatus('Last 6 Month');
    } else {
      setstatus('Last 7 days');
    }
    if (value === 'All') {
      fetchData();
    } else {
      setTableChange(true);
      setFilterValue(value);
      const dateBy = moment().subtract(value, 'days').format();
      const today = moment().format();
      const get = { dateBy, today };
      setDateValue(get);
      setLoading(true);
      handleUrlChanges(firstPage, history, moduleName);
      fetchSearchEnquiriesData({
        pagination: { ...pagination, current: 1 },
        searchKey: searchWord,
        date: get,
        name: cityField,
      });
    }
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRow) => {
      setSelectedID(selectedRow);
      setEnableSave(!!selectedRowKeys.length);
    },
  };

  const handleDelete = async (_event, method, key) => {
    const productsID =
      method === 'single'
        ? [key.search_uid]
        : selectedID.map((x) => x.search_uid);
    const text =
      'Are you sure you want to delete the selected enquiries from the list?';
    const result = await DeleteAlert(text);
    if (result.isConfirmed) {
      setLoading(true);
      deleteSearchEnquiries(productsID)
        .then((response) => {
          if (response.success) {
            const { current } = pagination;
            const currentPage =
              tableData.length === 1 && current > 1 ? current - 1 : current;
            DeleteAlertImage(ENQUIRY_DELETE_SUCCESS);

            setEnableSave(false);
            setSearchWord('');
            resetFilters();
            fetchSearchEnquiriesData({
              pagination: { ...pagination, current: currentPage },
            });
          } else DeleteAlertMessage(ENQUIRY_DELETE_FAIL);
          setLoading(false);
        })
        .catch(() => {
          DeleteAlertMessage(ENQUIRY_DELETE_FAIL);
          setLoading(false);
        });
    }
  };

  const columns = [
    {
      title: 'Searched Words',
      dataIndex: 'product_code',
      key: 'product_code',
      render: (data) => <span className="text-green-dark">{data}</span>,
      sorter: true,
      ...getFilterData(
        'Searched Words',
        'product_code',
        'text',
        setFilterData,
        filterData
      ),
    },
    {
      title: 'Date',
      dataIndex: 'creation_date',
      sorter: true,
      key: 'creation_date',
      render: (a) => (
        <span>
          {moment(a).format(
            _.get(tenantDetails, 'setting.date_format', 'DD-MM-YYYY hh:mm')
          )}
        </span>
      ),
      ...getFilterData(
        'Date',
        'creation_date',
        'dateTime',
        setFilterData,
        filterData
      ),
    },
    {
      title: 'Location',
      dataIndex: ['zm_user', 'city'],
      key: 'city',
      sorter: true,
      ...getFilterData('Location', 'city', 'text', setFilterData, filterData),
    },
    {
      title: 'App User',
      align: 'center',
      dataIndex: ['zm_user', 'user_name'],
      key: 'userName',
      sorter: true,
      ...getFilterData(
        'App User',
        'user_name',
        'text',
        setFilterData,
        filterData
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (a) => {
        return (
          <Button
            className="search-delete"
            // disabled={!includes(selectedKey, a.product_search_id)}
          >
            <Tooltip title="Delete">
              <DeleteOutlined
                style={{ color: 'red' }}
                onClick={(event_) => handleDelete(event_, 'single', a)}
              />
            </Tooltip>
          </Button>
        );
      },
    },
  ];

  useEffect(() => {
    paginationstyler();
  }, [tableData]);

  const timeLineDropdown = () => {
    return (
      <Dropdown
        className="Search_Dropdown"
        trigger="click"
        overlay={
          <Menu onClick={handleDaysFilter} className="date-filter">
            {dropdowns.map((result) => (
              <Menu.Item
                key={result.value}
                className={
                  result.description === status
                    ? 'bg-gray-lightcolor text-green-dark active'
                    : 'text-grey-light active'
                }
              >
                {result.description === 'All' ? (
                  <span>
                    {' '}
                    {result.description}&nbsp; <CaretDownOutlined />{' '}
                  </span>
                ) : (
                  result.description
                )}
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <span className="ant-dropdown-link" style={{ color: 'gray' }}>
          <span>{status}</span>
          <CaretDownOutlined />
        </span>
      </Dropdown>
    );
  };

  return (
    <Spin spinning={loading}>
      <div className="search-container">
        <div>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <Search />
                Search Enquiries
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div>
          <Input
            allowClear
            placeholder="Search"
            value={searchWord}
            onChange={(event_) => onSearch(event_.target.value)}
            className="custom-search"
            suffix={<SearchOutlined className="site-form-item-icon" />}
          />
        </div>
        <div />
      </div>
      <div className="box" style={{ padding: '0px 10px' }}>
        <div className="box__header search-enquiry-box-header">
          <div>
            <Space>
              {/* <Select
                className="location-select search-location-select"
                mode="multiple"
                onChange={handleChange}
                value={cityField}
                maxTagCount="responsive"
                placeholder={
                  <Space>
                    &nbsp;{' '}
                    <img src={FilterFilled} alt="." className="text-primary" />
                    &nbsp; Filter by location
                  </Space>
                }
                allowClear
                filterOption={(input, option) =>
                  option?.value
                    ?.toLowerCase()
                    ?.includes(input?.toLowerCase()) === true
                }
              >
                {_.compact(city).map((item) => (
                  <Option value={item.city}>{item.city || 'Blank'} </Option>
                ))}
              </Select> */}

              <div className="mobile-display-none">{timeLineDropdown()}</div>
              <div className="desk-display-none filter-orders-mobile">
                <Popover content={timeLineDropdown()} trigger="click">
                  <FilterOutlined />
                </Popover>
              </div>
              <Tag
                icon={<CloseCircleOutlined />}
                color="error"
                visible={filterValue}
                onClick={resetFilters}
                className="clear-filter-search"
              >
                <span>
                  Clear&nbsp;
                  <span className="mobile-display-none">filters</span>
                </span>
              </Tag>
            </Space>
          </div>
          <div className="search-query-header-btn">
            <Space className="search_btns">
              <Button
                type="primary"
                onClick={handleDownload}
                disabled={!enableSave}
                className="disable-primary download-primary"
              >
                <Space>
                  <img src={save} alt="Download" />
                  Download
                </Space>
              </Button>
              <Button
                hidden={!canWrite}
                type="danger"
                danger
                onClick={(event) => handleDelete(event, 'multiple', '')}
                disabled={!enableSave}
                className="disable-danger delete-danger"
              >
                {' '}
                <Space>
                  <DeleteOutlined />
                  Delete
                </Space>
              </Button>
            </Space>
          </div>
        </div>
        <div className="box__content p-0">
          <Table
            className="grid-table orders-table-styles"
            rowKey={(record) => record.product_search_id}
            columns={
              canWrite
                ? columns
                : columns.filter(
                    (response) => _.get(response, 'title', '') !== 'Actions'
                  )
            }
            dataSource={tableData}
            pagination={pagination}
            rowSelection={rowSelection}
            onChange={handleTableChange}
            scroll={{ x: 780 }}
          />
        </div>
      </div>
    </Spin>
  );
};
export default withRouter(SearchEnquiries);
