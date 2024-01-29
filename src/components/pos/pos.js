import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Input,
  Button,
  Table,
  notification,
  Breadcrumb,
  Tag,
  Spin,
  Space,
  Select,
  Menu,
  Dropdown,
  Popover,
  Tooltip,
} from 'antd';
import { Link, useLocation } from 'react-router-dom';
import _ from 'lodash';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  CaretDownOutlined,
  PlusOutlined,
  CloseCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import FilterFilled from '../../assets/icons/filter.svg';
import './pos.less';
import {
  POS_DELETE_SUCCESS,
  POS_DELETE_FAILED,
  FAILED_TO_LOAD,
} from '../../shared/constant-values';
import { handleUrlChanges } from '../../shared/common-url-helper';
import { getPOS, deletePOS, getPOSLocation } from '../../utils/api/url-helper';
import { DeleteAlert, DeleteAlertImage } from '../../shared/sweetalert-helper';
import { paginationstyler } from '../../shared/attributes-helper';
import { getFilterData } from '../../shared/table-helper';
import { ReactComponent as PosIcon } from '../../assets/icons/pos.svg';

const { Option } = Select;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const POS = ({ history }) => {
  const [loading, setLoading] = useState(false);
  const [posData, setPosData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [status, setstatusData] = useState('All');
  const [filterValue, setFilterValue] = useState();
  const [dateValue, setDateValue] = useState();
  const [city, setCity] = useState([]);
  const [searchWord, setSearchWord] = useState('');
  const [posSorter, setPosSorter] = useState({});
  const [posFilterValue, setPosFilterValue] = useState({});
  const [locationData, setLocationData] = useState();
  const [tableChange, setTableChange] = useState(false);
  const [posCurrentValue, setPosCurrentValue] = useState(1);

  const firstUpdate = useRef(true);

  const query = useQuery();
  const currentPage = query.get('page');
  const moduleName = 'pos';
  const firstPage = 1;

  const fetchPosData = (parameters = {}, rejectError = true) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      const searchParameters = {};
      let cityFilter = {};
      const {
        pagination: { pageSize, current },
        date,
        name,
        searchKey,
      } = parameters;
      if (searchKey) {
        searchParameters.searchWord = searchKey;
      }
      if (date) {
        searchParameters.todayDate = date.todayDate;
        searchParameters.filterDate = date.filterDate;
      }
      if (!_.isEmpty(name)) {
        searchParameters.cityName = name;
      }
      cityFilter = _.omit(parameters, ['pagination', 'name']);
      if (_.get(posFilterValue, 'store_name', '')) {
        searchParameters.thirdTableParams = true;
      }
      searchParameters.firstTableParams = 'zm_pos_machine';
      getPOS({
        limit: pageSize,
        offset: current,
        sorter: JSON.stringify(posSorter),
        filters: JSON.stringify(posFilterValue),
        ...searchParameters,
        ...cityFilter,
      })
        .then((result) => {
          const posDataSet = _.get(result, 'data', []);
          setPosData(posDataSet.rows);
          setPagination({
            ...parameters.pagination,
            total: posDataSet.count,
          });
          setLoading(false);
          setTableChange(false);
          resolve(result);
        })
        .catch((error_) => {
          setLoading(false);
          setTableChange(false);
          notification.error({ message: FAILED_TO_LOAD });
          if (rejectError) reject(error_);
        });
    });
  };
  const fetchData = useCallback(
    (parameters) => {
      Promise.all([
        getPOSLocation(),
        fetchPosData(parameters || { pagination }),
      ])
        .then((response) => {
          const locationDetail = _.get(response, '[0].dataSet', []);
          const filterLocation = _.map(locationDetail, (data) => {
            if (data.zm_store_po) {
              if (_.get(data, 'zm_store_po.zm_store.store_subdistrict', null)) {
                const subDistrictValues = _.pick(
                  _.get(
                    data,
                    'zm_store_po.zm_store.store_subdistrict.sub_district',
                    null
                  ),
                  ['sub_district_id', 'sub_district_name']
                );
                return {
                  ...subDistrictValues,
                  store_uid: _.get(
                    data,
                    'zm_store_po.zm_store.subdistrict',
                    null
                  ),
                };
              }
            }
            return null;
          });
          setCity(_.uniqWith(filterLocation, _.isEqual));
        })
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [pagination]
  );

  const resetFilters = () => {
    setTableChange(true);
    setFilterValue();
    setLocationData([]);
    setstatusData('All');
    setDateValue();
    handleUrlChanges(firstPage, history, moduleName);
    fetchPosData({
      pagination: { ...pagination, current: 1 },
      searchKey: searchWord,
      name: locationData,
    });
  };

  const handleFilterDays = (value) => {
    value = value === 0 ? 0 : value.key;
    if (value === '0' || value === 0) {
      setstatusData('All');
      value = 'All';
    } else if (value === '90') {
      setstatusData('Last 3 Month');
    } else if (value === '30') {
      setstatusData('Last 30 days');
    } else if (value === '180') {
      setstatusData('Last 6 Month');
    } else {
      setstatusData('Last 7 days');
    }
    if (value === 'All') {
      fetchData();
    } else {
      setTableChange(true);
      setFilterValue(value);
      const filterDate = moment().subtract(value, 'days').format();
      const todayDate = moment().format();
      const getDate = { filterDate, todayDate };
      setDateValue(getDate);
      setLoading(true);
      handleUrlChanges(firstPage, history, moduleName);
      fetchPosData({
        pagination: { ...pagination, current: 1 },
        date: getDate,
        searchKey: searchWord,
        name: locationData,
      });
    }
  };

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    const current = !isNaN(currentPage) ? Number(currentPage) : false;
    const newPagination = {
      ...pagination,
      ...(current && { current }),
    };

    if (!tableChange && !firstUpdate.current) {
      const addPagination = currentPage
        ? newPagination
        : { ...pagination, current: 1 };

      fetchPosData({
        pagination: addPagination,
        name: locationData || '',
        searchKey: searchWord || '',
        date: dateValue || '',
      });
    }

    if (firstUpdate.current) {
      const parameters = current
        ? {
            pagination: newPagination,
            name: locationData || '',
            searchKey: searchWord || '',
            date: dateValue || '',
          }
        : false;
      firstUpdate.current = false;
      fetchData(parameters);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const dropdowns = [
    { value: 0, description: 'All' },
    { value: 7, description: 'Last 7 days' },
    { value: 30, description: 'Last 30 days' },
    { value: 90, description: 'Last 3 Month' },
    { value: 180, description: 'Last 6 Month' },
  ];

  const handleTableChanges = (paginationValue, filter, posSorted) => {
    setTableChange(true);
    const { current } = paginationValue;
    const posSort = {
      columnKey: posSorted.columnKey,
      order: posSorted.order === 'ascend' ? 'ascend' : 'descend',
    };
    const posSorting = {
      columnKey: posSorted.columnKey,
      order: posSorted.order === '',
    };
    handleUrlChanges(current, history, moduleName);
    if (!_.isEmpty(posSorted.order)) {
      setPosSorter(posSort);
      setPosCurrentValue(current);
    } else {
      setPosSorter(posSorting);
      setPosCurrentValue(current);
    }
  };
  useEffect(() => {
    if (Object.keys(posSorter).length > 0) {
      fetchPosData({
        pagination: { pageSize: 10, current: posCurrentValue },
        name: locationData,
        searchKey: searchWord,
        date: dateValue,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posSorter]);

  const globalSearchDebounce = _.debounce((value) => {
    setTableChange(true);
    handleUrlChanges(firstPage, history, moduleName);
    fetchPosData({
      pagination: { pageSize: 10, current: 1 },
      name: locationData || '',
      searchKey: value || '',
      date: dateValue || '',
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
    fetchPosData({
      pagination: { pageSize: 10, current: 1 },
      name: value || '',
      searchKey: searchWord || '',
      date: dateValue || '',
    });
  };

  const handleDelete = async (_event, key) => {
    const text = 'Are you sure want to delete this POS Machine from the list?';
    const result = await DeleteAlert(text);
    if (result.isConfirmed) {
      setLoading(true);
      deletePOS(key.pos_uid)
        .then(() => {
          const { current } = pagination;
          const currentPageNo =
            posData.length === 1 && current > 1 ? current - 1 : current;
          DeleteAlertImage(POS_DELETE_SUCCESS);
          setSearchWord('');
          resetFilters();
          fetchPosData({
            pagination: { ...pagination, current: currentPageNo },
          });
          setLoading(false);
        })
        .catch(async (error_) => {
          let responseBody;
          try {
            responseBody = await error_.json();
          } catch {
            responseBody = error_;
          }
          setLoading(false);
          notification.error({
            message: responseBody.message || POS_DELETE_FAILED,
          });
        });
    }
  };

  const columns = [
    {
      title: 'POS Name',
      dataIndex: 'pos_machine_name',
      key: 'pos_machine_name',
      width: 200,
      render: (a) => <b className="text-green-dark">{a}</b>,
      ...getFilterData(
        'POS Name',
        'pos_machine_name',
        'text',
        setPosFilterValue,
        posFilterValue
      ),
      sorter: true,
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 250,
      render: (a) => <b>{a}</b>,
      sorter: true,
      ...getFilterData(
        'IP Address',
        'ip_address',
        'text',
        setPosFilterValue,
        posFilterValue
      ),
    },
    {
      title: 'Model Number',
      dataIndex: 'model_number',
      key: 'model_number',
      width: 250,
      render: (a) => <b>{a}</b>,
      ...getFilterData(
        'Model Number',
        'model_number',
        'text',
        setPosFilterValue,
        posFilterValue
      ),
      sorter: true,
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      width: 250,
      render: (a) => <b>{a}</b>,
      ...getFilterData(
        'Serial Number',
        'serial_number',
        'text',
        setPosFilterValue,
        posFilterValue
      ),
      sorter: true,
    },
    {
      title: 'Store Mapped',
      dataIndex: 'zm_store_po',
      key: 'store_name',
      render: (a) => <b>{_.get(a, 'zm_store.store_name', '')}</b>,
      ...getFilterData(
        'Store Mapped',
        'store_name',
        'text',
        setPosFilterValue,
        posFilterValue
      ),
      sorter: true,
    },
    {
      title: 'Actions',
      width: 100,
      align: 'right',
      render: (data) => (
        <span className="edit-box">
          <Link to={`pos/edit-pos/${data.pos_uid}`}>
            <Tag color="green">
              <Tooltip title="Edit">
                <EditOutlined />
              </Tooltip>
            </Tag>
          </Link>
          &nbsp;
          <Tag
            color="red"
            onClick={(event) => handleDelete(event, data)}
            className="delete-tag"
          >
            <Tooltip title="Delete">
              <DeleteOutlined />
            </Tooltip>
          </Tag>
        </span>
      ),
    },
  ];

  useEffect(() => {
    paginationstyler();
  }, [posData]);

  const timeLineDropdown = () => {
    return (
      <Dropdown
        trigger="click"
        className="Search_Dropdown"
        overlay={
          <Menu onClick={handleFilterDays} className="date-filter">
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
                    {result.description}&nbsp;{' '}
                    <CaretDownOutlined className="text-grey-light down-arrow" />{' '}
                  </span>
                ) : (
                  result.description
                )}
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <span className="ant-dropdown-link text-grey-light">
          <span>{status}</span>
          <CaretDownOutlined />
        </span>
      </Dropdown>
    );
  };

  return (
    <Spin spinning={loading}>
      <div className="search-container">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Space>
              <PosIcon /> POS
            </Space>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="pos-header-search-bar">
          <Input
            allowClear
            placeholder="Search"
            value={searchWord}
            onChange={(event_) => globalSearch(event_.target.value)}
            className="custom-search"
            suffix={<SearchOutlined className="site-form-item-icon" />}
          />
        </div>
        <div className="pos-header-add-btn">
          <Button type="primary">
            <Link to="/pos/add-pos">
              <PlusOutlined />
              Add POS
            </Link>
          </Button>
        </div>
      </div>
      <div className="box" style={{ padding: '0px 10px' }}>
        <div className="box__header select-alignment">
          <div>
            <Space>
              <div className="mobile-display-none">{timeLineDropdown()}</div>
              <div className="desk-display-none filter-orders-mobile">
                <Popover content={timeLineDropdown()} trigger="click">
                  <FilterOutlined />
                </Popover>
              </div>
              <Select
                className="location-select pos-location-select"
                mode="multiple"
                virtual={false}
                onChange={handleChange}
                maxTagCount="responsive"
                placeholder={
                  <Space className="category-button-options">
                    &nbsp;{' '}
                    <img src={FilterFilled} alt="." className="text-primary" />
                    &nbsp; Filter by location
                  </Space>
                }
                value={locationData}
                allowClear
                filterOption={(input, option) =>
                  option.children[0]
                    ?.toLowerCase()
                    ?.includes(input?.toLowerCase()) === true
                }
              >
                <Option value="blank">Unassigned</Option>
                {_.compact(city).map((item) => (
                  <Option value={item.store_uid}>
                    {item.sub_district_name || 'Blank'}{' '}
                  </Option>
                ))}
              </Select>

              <Tag
                icon={<CloseCircleOutlined />}
                color="error"
                visible={filterValue}
                onClick={resetFilters}
              >
                <span>
                  Clear&nbsp;
                  <span className="mobile-display-none">filters</span>
                </span>
              </Tag>
            </Space>
          </div>
        </div>
        <div className="box__content p-0">
          <Table
            className="grid-table orders-table-styles"
            columns={columns}
            dataSource={posData}
            pagination={pagination}
            fetchCustomerData={fetchPosData}
            loading={loading}
            onChange={handleTableChanges}
            scroll={{ x: 780 }}
          />
        </div>
      </div>
    </Spin>
  );
};

export default POS;
