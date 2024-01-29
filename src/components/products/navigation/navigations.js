import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import {
  Button,
  notification,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Breadcrumb,
  Input,
} from 'antd';
import { get, debounce, isEmpty } from 'lodash';
import React, { useState, useEffect } from 'react';
import {
  FAILED_TO_LOAD,
  MENU_DELETE_FAILED,
  MENU_DELETE_SUCCESS,
  MENU_STATUS_UPDATE_FAILED,
  MENU_STATUS_UPDATE_SUCCESS,
} from '../../../shared/constant-values';
import { paginationstyler } from '../../../shared/attributes-helper';

import {
  deleteMenu,
  getAllMenu,
  updateMenuStatus,
} from '../../../utils/api/url-helper';
import AddNavigationMenu from './add-navigation-menu';

const Navigation = () => {
  const [open, setOpen] = useState(false);
  const [menuArray, setMenuArray] = useState([]);
  const [editObject, setEditObject] = useState({});
  const [loading, setLoading] = useState(false);
  const [navigationSorter, setNavigationSorter] = useState({});
  const [currentPage, setCurrentPage] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const fetchData = (parameters = {}) => {
    const {
      pagination: { pageSize, current },
      searchWord,
    } = parameters;
    const parameter = {
      limit: pageSize,
      offset: current,
      sorter: JSON.stringify(navigationSorter),
    };
    if (searchWord) {
      parameter.searchWord = searchWord;
    }
    setLoading(true);
    getAllMenu(parameter)
      .then((response) => {
        setLoading(false);
        const data = get(response, 'data.rows', []);
        const totalCount = get(response, 'data.count', 0);
        setMenuArray(data);
        setPagination({
          ...parameters.pagination,
          current,
          total: totalCount,
        });
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', '') || FAILED_TO_LOAD,
        });
      });
  };

  const handleStatusChange = (status, row) => {
    updateMenuStatus(row.menu_uid, { status })
      .then(() => {
        notification.success({ message: MENU_STATUS_UPDATE_SUCCESS });
        fetchData({
          pagination: { ...pagination, current: 1 },
        });
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', '') || MENU_STATUS_UPDATE_FAILED,
        });
      });
  };
  const handleTableChange = (paginationAlias, filters, sorted) => {
    const { current } = paginationAlias;
    setPagination({
      ...pagination,
      current,
    });
    if (!isEmpty(sorted.order)) {
      setNavigationSorter({
        columnKey: sorted.columnKey,
        order: sorted.order === 'ascend' ? 'ascend' : 'descend',
      });
      setCurrentPage(current);
    } else {
      setNavigationSorter({
        columnKey: sorted.columnKey,
        order: sorted.order === '',
      });
      setCurrentPage(current);
    }
    setCurrentPage(current);
  };

  const handleEdit = (a) => {
    setOpen(true);
    setEditObject(a);
  };
  useEffect(() => {
    if (Object.keys(navigationSorter).length > 0) {
      fetchData({
        pagination: { pageSize: 10, current: currentPage },
        searchWord: searchKey,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationSorter]);

  useEffect(() => {
    if (menuArray) {
      paginationstyler();
    }
  }, [menuArray]);

  const handleDelete = (a) => {
    deleteMenu(a.menu_uid)
      .then(() => {
        notification.success({ message: MENU_DELETE_SUCCESS });
        fetchData({
          pagination: { ...pagination, current: 1 },
        });
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', '') || MENU_DELETE_FAILED,
        });
      });
  };

  const columns = [
    {
      title: 'Menu Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (a, row) => (
        <Switch
          size="small"
          checked={a}
          onChange={(values) => handleStatusChange(values, row)}
        />
      ),
    },
    {
      title: 'Actions',
      width: 30,
      render: (a) => (
        <Space>
          <Tag
            className="delete-tag"
            color="green"
            onClick={() => handleEdit(a)}
          >
            <Tooltip title="Edit">
              <EditOutlined />
            </Tooltip>
          </Tag>

          <Tag
            color="red"
            className="delete-tag"
            style={{ marginRight: '0px' }}
            onClick={() => handleDelete(a)}
          >
            <Tooltip title="Delete">
              <DeleteOutlined />
            </Tooltip>
          </Tag>
        </Space>
      ),
    },
  ];
  const globalSearch = debounce((value) => {
    fetchData({
      pagination: { pageSize: 10, current: 1 },
      searchWord: value,
    });
  }, 1000);

  const handelSearch = (value) => {
    setSearchKey(value || '');
    globalSearch(value);
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    fetchData({
      pagination: { pageSize: 10, current: 1 },
    });
    setEditObject({});
  };

  useEffect(() => {
    fetchData({
      pagination: { pageSize: 10, current: 1 },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="search-container">
        <div>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <FolderOutlined />
                Menu
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div>
          <Input
            allowClear
            placeholder="Search"
            value={searchKey}
            onChange={(event_) => handelSearch(event_.target.value)}
            className="custom-search"
            suffix={<SearchOutlined className="site-form-item-icon" />}
          />
        </div>
        <div>
          <Button type="primary" onClick={showDrawer}>
            <Space>
              <PlusOutlined />
              Add Menu
            </Space>
          </Button>
        </div>
      </div>
      <div className="box" style={{ padding: '0px 10px' }}>
        <Table
          className="grid-table orders-table-styles"
          style={{ marginBottom: 16 }}
          columns={columns}
          pagination={pagination}
          dataSource={menuArray}
          loading={loading}
          scroll={{ x: 780 }}
          onChange={handleTableChange}
        />
      </div>
      {open && (
        <AddNavigationMenu
          open={open}
          onClose={onClose}
          setMenuArray={setMenuArray}
          menuArray={menuArray}
          editData={editObject}
        />
      )}
    </div>
  );
};

export default Navigation;
