import React, { useState, useEffect, useContext } from 'react';
import {
  Breadcrumb,
  Space,
  Input,
  Button,
  Table,
  notification,
  Avatar,
  Switch,
  Tag,
  Tooltip,
  Popover,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  FolderOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { get, isEmpty, debounce } from 'lodash';
import {
  getAllCollections,
  deleteCollection,
  updateCollectionStatus,
} from '../../../utils/api/url-helper';
import AddCollection from './add-collection';
import { paginationstyler } from '../../../shared/attributes-helper';
import {
  COLLECTION_STATUS_UPDATED,
  COLLECTION_STATUS_UPDATED_FAILED,
  COLLECTION_DELETED_FAILED,
  COLLECTION_DELETED_SUCCESS,
} from '../../../shared/constant-values';
import SocialShare from '../../social-share';
import { TenantContext } from '../../context/tenant-context';
import { collectionDefaultImage } from '../../../shared/image-helper';

const Collections = () => {
  const [tenantDetails] = useContext(TenantContext);

  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [tableLoading, setTableLoading] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [title, setTitle] = useState('Create');
  const [currentPage, setCurrentPage] = useState('');
  const [collectionSorter, setCollectionSorter] = useState({});
  const [searchKey, setSearchKey] = useState('');
  const [editData, setEditData] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  const handleEdit = (data) => {
    setTitle('Edit');
    setOpenDrawer(true);
    setEditData(data);
    setIsEdit(true);
  };

  const handleTableChange = (paginationAlias, filters, sorted) => {
    const { current } = paginationAlias;
    setPagination({
      ...pagination,
      current,
    });
    if (!isEmpty(sorted.order)) {
      setCollectionSorter({
        columnKey: sorted.columnKey,
        order: sorted.order === 'ascend' ? 'ascend' : 'descend',
      });
      setCurrentPage(current);
    } else {
      setCollectionSorter({
        columnKey: sorted.columnKey,
        order: sorted.order === '',
      });
      setCurrentPage(current);
    }
    setCurrentPage(current);
  };

  const handleAddCollection = () => {
    setOpenDrawer(true);
  };

  const onClose = () => {
    setIsEdit(false);
    setOpenDrawer(false);
    setEditData({});
    setTitle('Create');
  };

  const fetchData = (parameters = {}) => {
    const {
      pagination: { pageSize, current },
      searchWord,
    } = parameters;
    const parameter = {
      limit: pageSize,
      offset: current,
      sorter: JSON.stringify(collectionSorter),
    };
    setTableLoading(true);
    if (searchWord) {
      parameter.searchWord = searchWord;
    }
    getAllCollections(parameter)
      .then((response) => {
        const data = get(response, 'data.rows', []);
        const totalCount = get(response, 'data.count', 0);
        setTableData(data);
        setPagination({
          ...parameters.pagination,
          current,
          total: totalCount,
        });
        setTableLoading(false);
      })
      .catch((error_) => {
        notification.error({ message: error_.message });
        setTableLoading(false);
      });
  };

  useEffect(() => {
    if (Object.keys(collectionSorter).length > 0) {
      fetchData({
        pagination: { pageSize: 10, current: currentPage },
        searchWord: searchKey,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionSorter]);

  useEffect(() => {
    fetchData({
      pagination: { pageSize: 10, current: 1 },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    paginationstyler();
  }, [tableData]);

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

  const handleAdd = () => {
    setIsEdit(false);
  };

  const handleStatusChange = (event, data) => {
    const { collection_uid: id } = data;
    const parameter = {
      status: event,
    };
    setTableLoading(true);
    updateCollectionStatus(id, parameter)
      .then((item) => {
        fetchData({
          pagination: { ...pagination, current: 1 },
        });
        notification.success({
          message: get(item, 'message', '' || COLLECTION_STATUS_UPDATED),
        });
        setTableLoading(false);
      })
      .catch((error) => {
        setTableLoading(false);
        notification.success({
          message: get(
            error,
            'message',
            '' || COLLECTION_STATUS_UPDATED_FAILED
          ),
        });
      });
  };

  const handleDelete = (data) => {
    const { collection_uid: id } = data;
    setTableLoading(true);
    deleteCollection(id)
      .then((deleteData) => {
        fetchData({
          pagination: { ...pagination, current: 1 },
        });
        notification.success({
          message: get(deleteData, 'message', '' || COLLECTION_DELETED_SUCCESS),
        });
        setTableLoading(false);
      })
      .catch((error) => {
        setTableLoading(false);
        notification.success({
          message: get(error, 'message', '' || COLLECTION_DELETED_FAILED),
        });
      });
  };

  const RefreshPage = () => {
    fetchData({
      pagination: { ...pagination, current: 1 },
    });
  };

  const Columns = [
    {
      title: 'Collection Image',
      dataIndex: 'image',
      hidden: false,
      render: (text) => (
        <Avatar shape="square" size={40} src={text || collectionDefaultImage} />
      ),
    },
    {
      title: 'Collection',
      dataIndex: 'title',
      key: 'title',
      render: (data) => <span className="text-green-dark ml-1rem">{data}</span>,
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (checkbox, record) => {
        return (
          <div>
            <Switch
              checked={checkbox}
              onChange={(event) => handleStatusChange(event, record)}
              size="small"
            />
          </div>
        );
      },
    },
    {
      title: 'Action',
      align: 'center',
      render: (data, record) => {
        return (
          <span className="edit-box">
            {record.status ? (
              <Popover
                overlayClassName="share-popover"
                content={
                  <SocialShare
                    url={`${get(
                      tenantDetails,
                      'customer_url',
                      ''
                    )}/collection-list?collectionId=${get(
                      record,
                      'collection_uid',
                      ''
                    )}&viewType=grid`}
                    name={get(record, 'title', '')}
                    image_url={
                      get(record, 'seo_preview_image', '') ||
                      get(record, 'image', '')
                    }
                    description={get(record, 'seo_description', '')}
                  />
                }
                placement="bottom"
                trigger="click"
              >
                <Tooltip title="Social Share">
                  <Tag className="delete-tag" color="blue">
                    <ShareAltOutlined />
                  </Tag>
                </Tooltip>
              </Popover>
            ) : null}
            <Tag
              className="delete-tag"
              color="green"
              onClick={() => handleEdit(record)}
            >
              <Tooltip title="Edit">
                <EditOutlined />
              </Tooltip>
            </Tag>
            &nbsp;
            <Tag
              color="red"
              onClick={() => handleDelete(record)}
              className="delete-tag"
            >
              <Tooltip title="Delete">
                <DeleteOutlined />
              </Tooltip>
            </Tag>
          </span>
        );
      },
    },
  ];

  return (
    <>
      {' '}
      <div className="search-container">
        <div>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <FolderOutlined />
                Collections
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
          <Button type="primary" onClick={handleAddCollection}>
            <Space>
              <PlusOutlined />
              Create Collection
            </Space>
          </Button>
        </div>
      </div>
      <div className="box" style={{ padding: '0px 10px' }}>
        <div>
          <Table
            className="store-grid-table table-header-min orders-table-styles"
            columns={Columns}
            rowKey={(record) => record.store_uid}
            dataSource={tableData}
            pagination={pagination}
            loading={tableLoading}
            onChange={handleTableChange}
            rowClassName={(record) => {
              return record.is_central ? 'active-green' : '';
            }}
            scroll={{ x: 780 }}
          />
        </div>
      </div>
      {openDrawer && (
        <AddCollection
          openDrawer={openDrawer}
          onClose={onClose}
          heading={title}
          editData={editData}
          isEdit={isEdit}
          handleAdd={handleAdd}
          fetchTableData={RefreshPage}
        />
      )}
    </>
  );
};

export default Collections;
