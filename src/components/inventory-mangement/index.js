import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Input,
  Table,
  notification,
  Breadcrumb,
  Tag,
  Avatar,
  Button,
  Select,
} from 'antd';
import { get, debounce, isNaN } from 'lodash';
import { SearchOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { FAILED_TO_LOAD } from '../../shared/constant-values';
import { handleUrlChanges } from '../../shared/common-url-helper';
import { getInventoryDetails, getStore } from '../../utils/api/url-helper';
import imagePath from '../../shared/image-helper';
import { paginationstyler } from '../../shared/attributes-helper';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const { Option } = Select;

function InventoryManagement(properties) {
  const history = useNavigate();
  const location = useLocation();
  const [roleInfo] = useState(localStorage.getItem('roleName'));
  const canWrite = get(properties, 'roleData.can_write', false);
  const [loading, setLoading] = useState(false);
  const [storeProductData, setStoreProductData] = useState([]);
  const [storeID] = useState(localStorage.getItem('storeID'));
  const [storeUid, setStoreUid] = useState(get(location, 'state.store_uid'));
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchWord, setSearchWord] = useState('');
  const [tableChange, setTableChange] = useState(false);
  const [storeDetail, setStoreDetail] = useState([]);

  const firstUpdate = useRef(true);

  const query = useQuery();
  const currentPage = query.get('page');
  const moduleName = 'inventory';
  const firstPage = 1;

  const fetchInventoryData = (parameters = {}) => {
    setLoading(true);
    const {
      pagination: { pageSize, current },
      searchKey,
      storeUID,
    } = parameters;
    const queryParameter = {
      limit: pageSize,
      offset: current,
    };
    queryParameter.store_uid = storeID || storeUID || storeUid;
    if (searchKey) {
      queryParameter.searchWord = searchKey;
    }
    getInventoryDetails(queryParameter)
      .then((response) => {
        setStoreProductData(get(response, 'data.rows', []));
        setPagination({
          ...parameters.pagination,
          total: response.data.count,
        });
        setLoading(false);
        setTableChange(false);
      })
      .catch((error_) => {
        setLoading(false);
        setTableChange(false);
        notification.error({ message: error_.message || FAILED_TO_LOAD });
      });
  };

  useEffect(() => {
    if (roleInfo === 'tenant_admin') {
      getStore()
        .then((data) => {
          const storeData = get(data, 'data.rows', []);
          setStoreDetail(storeData);
          if (!storeUid) {
            setStoreUid(get(storeData, '[0].store_uid'));
            fetchInventoryData({
              pagination: { pageSize: 10, current: 1 },
              storeUID: get(storeData, '[0].store_uid'),
            });
          }
        })
        .catch((error) => {
          notification.error({ message: error.message || FAILED_TO_LOAD });
        });
    }
  }, []);

  const fetchData = useCallback(
    (parameters) => {
      fetchInventoryData(parameters || { pagination });
    },
    [pagination]
  );

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    const current = isNaN(currentPage) ? false : Number(currentPage);
    const newPagination = {
      ...pagination,
      ...(current && { current }),
    };

    if (!tableChange && !firstUpdate.current) {
      const addPagination = currentPage
        ? newPagination
        : { ...pagination, current: 1 };

      fetchInventoryData({
        pagination: addPagination,
        searchWord,
      });
    }
    if (firstUpdate.current) {
      firstUpdate.current = false;
      const parameters = current
        ? { pagination: newPagination, searchWord: searchWord || '' }
        : false;
      fetchData(parameters);
    }
  }, [currentPage]);

  const globalSearch = debounce((value) => {
    setTableChange(true);
    setSearchWord(value || '');
    handleUrlChanges(firstPage, history, moduleName);
    fetchInventoryData({
      pagination: { pageSize: 10, current: 1 },
      searchKey: value,
    });
  }, 1000);

  const handleTableChange = (paginationAlias) => {
    setTableChange(true);
    const { current } = paginationAlias;
    handleUrlChanges(current, history, moduleName);
    fetchInventoryData({
      pagination: paginationAlias,
      searchKey: searchWord,
    });
  };
  const columns = [
    {
      dataIndex: 'product_image',
      width: 10,
      render: (text) =>
        text ? (
          <Avatar shape="square" size={30} src={text} />
        ) : (
          <Avatar shape="square" size={30} src={imagePath(text)} />
        ),
    },
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      width: 250,
      render: (text) => <span className="text-green-dark">{text}</span>,
    },
    {
      title: 'Variant',
      dataIndex: 'attribute_value',
      render: (text) => <Tag className="text-green-dark">{text}</Tag>,
    },
    {
      title: 'In Stock',
      dataIndex: 'instock_total',
    },
    {
      title: 'Out Stock',
      dataIndex: 'outstock_total',
    },
    {
      title: 'Availability',
      dataIndex: 'availability',
    },
  ];

  useEffect(() => {
    paginationstyler();
  }, [storeProductData]);

  const onChange = (value) => {
    setStoreUid(value);
    fetchInventoryData({
      pagination: { pageSize: 10, current: 1 },
      storeUID: value,
    });
  };
  return (
    <>
      <div className="search-container inventory-search-box">
        <Breadcrumb>
          <Breadcrumb.Item>
            <h1>
              <UserSwitchOutlined /> Inventory Management
            </h1>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div>
          <Input
            placeholder="Search"
            onChange={(event_) => globalSearch(event_.target.value)}
            className="custom-search"
            suffix={<SearchOutlined className="site-form-item-icon" />}
          />
        </div>
        <div>
          <Link
            state={{ store_uid: storeID || storeUid }}
            to={`/inventory/${storeID || storeUid}/add`}
          >
            <Button
              type="primary"
              className="add-btn"
              hidden={!canWrite}
              disabled={roleInfo === 'tenant_admin' && !storeUid}
            >
              ADD Inventory
            </Button>
          </Link>
          <Link
            state={{ store_uid: storeID || storeUid }}
            to={{
              pathname: `/inventory/${storeID || storeUid}/subtract`,
            }}
          >
            <Button
              type="primary"
              className="add-btn"
              hidden={!canWrite}
              disabled={roleInfo === 'tenant_admin' && !storeUid}
            >
              Subtract Inventory
            </Button>
          </Link>
        </div>
      </div>
      <div className="box mobile-side-padding">
        <div className="box__header inventory-header-box" />
        <div className="box__content p-0">
          {roleInfo === 'tenant_admin' && (
            <Select
              showSearch
              virtual={false}
              className="invt-select"
              placeholder="Select a store"
              onChange={onChange}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase()) ===
                true
              }
              disabled={storeDetail.length === 1}
              value={storeUid}
              style={{ width: '25%', marginTop: '10px' }}
            >
              {storeDetail.map((store) => (
                <Option value={store.store_uid}>{store.store_name}</Option>
              ))}
            </Select>
          )}
          <div style={{ marginTop: '10px' }}>
            <Table
              className="grid-table"
              columns={columns}
              dataSource={storeProductData}
              pagination={pagination}
              loading={loading}
              onChange={handleTableChange}
              scroll={{ x: 780 }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
export default InventoryManagement;
