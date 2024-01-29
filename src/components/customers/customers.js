import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react';
import {
  Input,
  Table,
  notification,
  Tag,
  Spin,
  Avatar,
  Menu,
  Dropdown,
  Typography,
  Space,
  Button,
  Modal,
  Upload,
  Row,
  Col,
  Radio,
  Popover,
  List,
  Tabs,
  Tooltip,
} from 'antd';
import _, { filter, get, isEmpty, map } from 'lodash';
import moment from 'moment';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DownloadOutlined,
  SearchOutlined,
  TaobaoSquareFilled,
  UploadOutlined,
} from '@ant-design/icons';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
// import FilterFilled from '../../assets/icons/filter.svg';
import { ReactComponent as Customer } from '../../assets/icons/customer.svg';
import { ReactComponent as UploadIcon } from '../../assets/icons/upload-icon.svg';
import { ReactComponent as SheetIcon } from '../../assets/icons/sheet-icon.svg';
import { ReactComponent as FileIcon } from '../../assets/icons/file-icon.svg';
import { ReactComponent as DeleteIcon } from '../../assets/images/delete-icon.svg';
import {
  getCustomersLocation,
  getOrderDetail,
  customerPdf,
  getCustomer,
  getCustomerDownload,
  bulkCustomersUpload,
  getCustomerCartList,
} from '../../utils/api/url-helper';
import { handleUrlChanges } from '../../shared/common-url-helper';
import ExcelDownload, { ExcelUpload } from '../../shared/excel';
import {
  DOWNLOAD_EXCEL_FAILED_MESSAGE,
  FAILED_TO_LOAD,
  FILE_TYPE_SHEET,
  ORDER_CHECKOUT,
} from '../../shared/constant-values';
import { TenantContext } from '../context/tenant-context';
import { paginationstyler } from '../../shared/attributes-helper';
import { getFilterData } from '../../shared/table-helper';
import CustomerMobileView from './customer-mobile-view';

const { Link, Text } = Typography;
const { Dragger } = Upload;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}
function Customers() {
  const history = useNavigate();
  const mobileView = get(useContext(TenantContext), '[4]', '');
  const [isUploaded, setIsUploaded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const [downloadText, setDownloadText] = useState('');
  const [downloadButton, setDownloadButton] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [tenantDetails] = useContext(TenantContext);
  const [searchWord, setSearchWord] = useState('');
  const [tableChange, setTableChange] = useState(false);
  const [customerFilterData, setCustomerFilter] = useState({});
  const [sorting, setSorting] = useState({});
  const [curentValues, setCurrentValues] = useState(1);
  const [selectedUser, setSelectedUser] = useState([]);
  const [visible, setVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [enable, setEnable] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [defaultName, setDefaultName] = useState('All');
  const [bagDetails, setBagDetails] = useState([]);
  const [bagLoader, setBagLoader] = useState(false);

  const firstUpdate = useRef(true);

  const query = useQuery();
  const currentPage = query.get('page');
  const moduleName = 'customers';
  const firstPage = 1;
  const fetchCustomerData = (parameters = {}) => {
    setTableLoading(true);
    const searchParameter = {};
    const {
      pagination: { pageSize, current },
      searchKey,
      cityName,
    } = parameters;
    if (searchKey) {
      searchParameter.searchWord = searchKey;
    }
    if (cityName) {
      searchParameter.name = cityName;
    }
    searchParameter.firstTableParams = 'zm_customer_view';

    getCustomer({
      limit: pageSize,
      offset: current,
      tabName: defaultName,
      sorter: JSON.stringify(sorting),
      filters: JSON.stringify(customerFilterData),
      ...searchParameter,
    })
      .then((response) => {
        const customDataSet = _.get(response, 'data', []);
        const newData = _.get(customDataSet, 'rows', []);
        setUserData(newData);
        setPagination({
          ...parameters.pagination,

          total: customDataSet.count,
        });
        setTableLoading(false);
        setTableChange(false);
      })
      .catch((error_) => {
        setTableChange(false);
        notification.error({ message: error_.message || FAILED_TO_LOAD });
      });
    return '';
  };

  const fetchData = useCallback(
    (parameters) => {
      Promise.all([
        getCustomersLocation(),
        fetchCustomerData(parameters || { pagination }),
      ])
        .then(() => {})
        .catch(() => {
          notification.error({ message: FAILED_TO_LOAD });
        });
    },
    [pagination]
  );

  const handleTableChange = (paginationAlias, filters, sorters) => {
    setTableChange(true);
    const { current } = paginationAlias;
    handleUrlChanges(current, history, moduleName);
    const sort = { columnKey: sorters.columnKey, order: sorters.order };
    const customerSorting = {
      columnKey: sorters.field,
      order: sorters.order === '',
    };
    if (_.isEmpty(sorters.order)) {
      setSorting(customerSorting);
      setCurrentValues(current);
    } else {
      setSorting(sort);
      setCurrentValues(current);
    }
  };
  useEffect(() => {
    if (Object.keys(sorting).length > 0) {
      fetchCustomerData({
        pagination: { pageSize: 10, current: curentValues },
        searchKey: searchWord,
      });
    }
  }, [sorting]);

  const downloadPdf = (userDetails) => {
    setLoading(TaobaoSquareFilled);
    setDownloadText('Downloading');
    customerPdf(userDetails?.user_uid)
      .then((info) => {
        const urlBlob = window.URL.createObjectURL(new Blob([info.data]));
        const documentLink = document.createElement('a');
        documentLink.href = urlBlob;
        documentLink.setAttribute('download', 'Customer.pdf');
        document.body.append(documentLink);
        documentLink.click();
        setLoading(false);
        setDownloadText('');
      })
      .catch(() => {
        setDownloadText('');
        setLoading(false);
        notification.error({
          message: 'Failed to download customer details.',
        });
      });
  };

  const downloadExcel = async (data) => {
    setLoading(true);
    setDownloadText('Downloading');
    try {
      const customerInfo = await getOrderDetail({
        user_uid: data.user_uid,
        milestone_id: ORDER_CHECKOUT,
      });
      const orderInfos = await _.get(
        customerInfo,
        'data.orderDetailMultiple',
        []
      ).map((result) => {
        const response = result.find((_value, index) => index === 0);
        return {
          'Customer name': _.get(data, 'user_name', ''),
          'Phone Number': _.get(data, 'phone_number', ''),
          'Email Address': _.get(data, 'email_address', ''),
          City: _.get(data, 'city', ''),
          'Total Orders': _.get(data, 'total_orders', 0),
          'Total Sales': _.get(data, 'total_sales', 0),
          'Order ID': response.order_id,
          'Order Date': moment(_.get(response, 'creation_date', '')).format(
            _.get(tenantDetails, 'setting.date_format', 'DD-MM-YYYY hh:mm')
          ),
          'Delivery Address': `${
            _.get(response, 'address', '') ||
            _.get(response, 'complete_address', '')
          } - ${_.get(response, 'pincode', '')}`,
          'Order Type': _.get(response, 'customer_type', 'Online'),
          'Item total': _.get(response, 'order_price', 0),
          'GST Price': _.get(response, 'order_gst_amount', 0),
          'Delivery Charges': _.get(response, 'delivery_charge', 0),
          Total: _.get(response, 'total_price', 0),
        };
      });
      await ExcelDownload(orderInfos, 'Customer-Orders');
      setLoading(false);
      setDownloadText('');
    } catch {
      setDownloadText('');
      setLoading(false);
      notification.error({ message: DOWNLOAD_EXCEL_FAILED_MESSAGE });
    }
  };

  const fetchUserDetails = async (data) => {
    try {
      const customerInfo = data.map((value) => {
        return {
          'Customer name': _.get(value, 'user_name', ''),
          'Phone Number': _.get(value, 'phone_number', ''),
          'Email Address': _.get(value, 'email_address', ''),
          City: _.get(value, 'city', ''),
          'Total Orders': _.get(value, 'total_orders', 0),
          'Total Sales': _.get(value, 'total_sales', 0) || 0,
        };
      });
      await ExcelDownload(customerInfo, 'Customer-Data');
      setDownloadText('');
      setLoading(false);
      setDownloadButton(false);
    } catch {
      setDownloadText('');
      setLoading(false);
      setDownloadButton(false);
      notification.error({ message: 'Failed to download excel file.' });
    }
  };

  const downloadUserData = async (value) => {
    if (selectedUser.length > 0 && value === 'selected') {
      fetchUserDetails(selectedUser);
    } else {
      setLoading(true);
      setDownloadText('Downloading');
      setDownloadButton(true);
      getCustomer({
        sorter: JSON.stringify(sorting),
        filters: JSON.stringify(customerFilterData),
        firstTableParams: 'zm_customer_view',
        searchWord,
      }).then((response) => {
        fetchUserDetails(_.get(response, 'data.rows', []));
      });
    }
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRow1) => {
      setSelectedUser(selectedRow1);
    },
    getCheckboxProps: (record) => ({
      name: record.name,
    }),
  };

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    const current = Number.isNaN(currentPage) ? false : Number(currentPage);
    const newPagination = {
      ...pagination,
      ...(current && { current }),
    };
    if (!tableChange && !firstUpdate.current) {
      const addPagination = currentPage
        ? newPagination
        : { ...pagination, current: 1 };

      fetchCustomerData({
        pagination: addPagination,
        searchKey: searchWord,
      });
    }

    if (firstUpdate.current) {
      firstUpdate.current = false;
      const parameters = current
        ? {
            pagination: newPagination,
            searchKey: searchWord || '',
          }
        : false;
      fetchData(parameters);
    }
  }, [currentPage, defaultName]);

  const globalSearch = _.debounce((value) => {
    setTableChange(true);
    setSearchWord(value || '');
    handleUrlChanges(firstPage, history, moduleName);
    fetchCustomerData({
      pagination: { pageSize: 10, current: 1 },
      searchKey: value,
    });
  }, 1000);

  const onBagDetalis = (id) => {
    setBagLoader(true);
    getCustomerCartList(id)
      .then((resp) => {
        setBagLoader(false);
        setBagDetails(get(resp, 'data', []));
      })
      .catch(() => {
        notification.error({
          message: FAILED_TO_LOAD,
        });
        setBagLoader(false);
      });
  };

  const renderPopoverContent = () => (
    <Spin spinning={bagLoader}>
      <List
        dataSource={bagDetails}
        style={{
          overflowY: 'scroll',
          maxHeight: '250px',
          scrollbarColor: 'transparent transparent',
          scrollbarWidth: 'thin',
        }}
        renderItem={(item) => (
          <List.Item key={get(item, 'product_uid', '')}>
            <div
              style={{
                whiteSpace: 'break-spaces',
                maxWidth: '250px',
              }}
            >
              {get(item, 'product_name', '')}
            </div>
          </List.Item>
        )}
      />
    </Spin>
  );

  const customerColumns = [
    {
      title: 'Customer Name',
      key: 'user_name',
      width: 200,
      render: (record) => (
        <div>
          <Avatar>
            {_.get(record, 'user_name', '')?.charAt(0).toUpperCase()}
          </Avatar>{' '}
          <Link
            href={`/customers/${_.get(record, 'user_uid', '')}`}
            className="customer-link"
          >
            {_.get(record, 'user_name', '')}
          </Link>
        </div>
      ),
      sorter: true,
      ...getFilterData(
        'Customer Name',
        'user_name',
        'text',
        setCustomerFilter,
        customerFilterData
      ),
    },
    {
      title: 'Customer Type',
      dataIndex: 'customer_type',
      key: 'customer_type',
      width: 180,
      sorter: true,
    },
    {
      title: 'Mobile Number',
      key: 'phone_number',
      width: 180,
      render: (data) => (
        <span>
          {data.country_code} {data.phone_number}
        </span>
      ),
      sorter: true,
    },
    {
      title: 'Total Orders',
      dataIndex: 'total_orders',
      key: 'total_orders',
      render: (data, record) => (
        <span>
          {record.customer_type.includes('Not Signed IN') ? '-' : data}
        </span>
      ),
      width: 180,
      sorter: true,
    },
    {
      title: 'Total Sales',
      dataIndex: 'total_sales',
      key: 'total_sales',
      width: 180,
      sorter: true,
      render: (text, record) => (
        <Text className="text-grey-light">
          {record.customer_type.includes('Not Signed IN') ? (
            '-'
          ) : (
            <CurrencyFormatter
              value={text}
              type={get(tenantDetails, 'setting.currency', '')}
              language={get(tenantDetails, 'setting.currency_locale', '')}
            />
          )}
        </Text>
      ),
    },
    {
      title: defaultName === 'abandoned' ? 'Products in Cart' : 'Total Cart',
      dataIndex: 'total_carts',
      key: 'total_carts',
      render: (data, record) => (
        <Popover
          content={renderPopoverContent}
          title="Bag Details"
          trigger="hover"
        >
          <div
            className="cursor-pointer"
            onMouseEnter={() =>
              data > 0
                ? onBagDetalis(get(record, 'bag_uid', ''))
                : setBagDetails([])
            }
          >
            {data > 0 ? `${data} items` : 0}
          </div>
        </Popover>
      ),
      width: 100,
    },
    {
      title: 'Action',
      width: 100,
      align: 'center',
      render: (data) => (
        <span className="edit-box">
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item onClick={() => downloadPdf(data)}>
                  Download PDF
                </Menu.Item>
                <Menu.Item onClick={() => downloadExcel(data)}>
                  {' '}
                  Download Excel
                </Menu.Item>
              </Menu>
            }
            placement="bottomRight"
            arrow
          >
            <Tag color="blue">
              <DownloadOutlined />
            </Tag>
          </Dropdown>
        </span>
      ),
    },
  ];

  const filteredColumns = customerColumns.filter((col) => {
    if (defaultName === 'NotSignedIn') {
      return (
        col.dataIndex !== 'total_orders' &&
        col.dataIndex !== 'total_sales' &&
        col.title !== 'Action' &&
        col.dataIndex !== 'customer_type' &&
        col.dataIndex !== 'total_carts'
      );
    }
    if (defaultName === 'SignedIn') {
      return (
        col.dataIndex !== 'total_orders' &&
        col.dataIndex !== 'total_sales' &&
        col.dataIndex !== 'customer_type'
      );
    }
    if (defaultName === 'abandoned') {
      return (
        col.dataIndex !== 'total_orders' &&
        col.dataIndex !== 'total_sales' &&
        col.dataIndex !== 'customer_type' &&
        col.key !== 'phone_number' &&
        col.title !== 'Action'
      );
    }
    if (defaultName === 'Return') {
      return col.dataIndex !== 'customer_type';
    }
    return col;
  });
  const handleValidate = async () => {
    if (fileList.length === 0) {
      return notification.error({ message: 'Upload the Customer list file' });
    }
    if (
      !_.has(excelData, '[0].user_name', '') ||
      !_.has(excelData, '[0].phone_number', '')
    ) {
      return notification.error({
        message: 'Please fill the Customer Detail Sheet',
      });
    }
    const customerDetailCheck = [];
    const checkCustomers = excelData.every((excel) => {
      if (excel.user_name && excel.phone_number) return true;
      if (!excel.user_name) customerDetailCheck.push('User Name');
      if (!excel.phone_number) customerDetailCheck.push('Mobile Number');
      return false;
    });
    if (!checkCustomers) {
      return notification.error({
        message: `Please fill the ${customerDetailCheck.join(',')} field(s)`,
      });
    }
    const phoneCheck = _.sortBy(_.map(excelData, 'phone_number'));
    const emailPick = _.pickBy(excelData, (value) => value.email_address);
    const emailCheck = _.sortBy(_.map(emailPick, 'email_address'));
    const userPattern = /^\w+[\w ]*\w$/;
    const numberPattern = /^\d{10}$/;
    const emailPattern = /^\w+[\w!#$%&*+./=?^`{|}~-]+@[\w-]+\.+[\w-]{2,3}$/;
    const customerDetailValidate = [];
    const validateCustomers = excelData.every((excel) => {
      if (
        userPattern.test(excel.user_name) &&
        numberPattern.test(excel.phone_number) &&
        (!excel.email_address || emailPattern.test(excel.email_address))
      )
        return true;
      if (!userPattern.test(excel.user_name))
        customerDetailValidate.push('User Name');
      if (!numberPattern.test(excel.phone_number))
        customerDetailValidate.push('Mobile Number');
      if (excel.email_address && !emailPattern.test(excel.email_address))
        customerDetailValidate.push('Email');
      return false;
    });
    if (!validateCustomers) {
      return notification.error({
        message: `Please fill the valid ${customerDetailValidate.join(
          ','
        )} field(s)`,
      });
    }
    if (phoneCheck.length !== _.uniq(phoneCheck).length) {
      return notification.error({ message: `Duplicate Mobile Number` });
    }
    if (emailCheck.length !== _.uniq(emailCheck).length) {
      return notification.error({ message: `Duplicate Email Address` });
    }
    const files = {
      sheet: [fileList[0].originFileObj],
    };
    await bulkCustomersUpload({ validate: true }, files)
      .then((response) => {
        if (_.get(response, 'data.success', '')) {
          notification.success({
            message: 'Validation success',
          });
          setEnable(true);
        } else {
          notification.error({
            message: _.get(response, 'data.message', ''),
          });
        }
      })
      .catch((error_) => {
        setConfirmLoading(false);
        notification.error({
          message: error_.message || 'Some error occurred while uploading ',
        });
      });

    return '';
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    const files = {
      sheet: [fileList[0].originFileObj],
    };
    await bulkCustomersUpload({}, files)
      .then(() => {
        setConfirmLoading(false);
        fetchData();
        setVisible(false);
        setFileList([]);
        setExcelData([]);
        notification.success({
          message: 'Data has been successfully uploaded',
        });
        setEnable(false);
      })
      .catch((error_) => {
        setConfirmLoading(false);
        notification.error({
          message: error_.message || 'Some error occurred while uploading',
        });
      });
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const downloadExcelTemplate = async () => {
    getCustomerDownload()
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'customerupload.xlsx');
        document.body.append(link);
        link.click();
      })
      .catch(() => {
        notification.error({
          message: 'Failed to download customer details',
        });
      });
  };

  useEffect(() => {
    paginationstyler();
  }, [userData]);

  const fileResponse = (response) => {
    const customerDetails = _.get(response, '[0]', []).map((item) => {
      return {
        user_name: item['User Name'],
        phone_number: item['Mobile Number'],
        email_address: item['Email (Optional)'],
      };
    });
    setExcelData(customerDetails);
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const dummyRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok');
    }, 0);
  };

  const handleUpload = (file) => {
    const uploadFormat = _.get(file, 'name', '').split('.')[1];
    const acceptedFormats = ['xlsx', 'xls', 'csv'];
    if (!acceptedFormats.includes(uploadFormat)) {
      notification.error({ message: 'Upload the proper file format' });
      setFileList([]);
      setIsUploaded(true);
    }
    setIsUploaded(false);
    ExcelUpload(file, fileResponse);
  };

  const handleFileList = ({ fileList: fileListName }) => {
    setFileList(fileListName);
    if (fileListName) {
      setEnable(false);
    }
  };

  const handleCancel = () => {
    setFileList([]);
    setExcelData([]);
    setEnable(false);
    setConfirmLoading(false);
    setIsUploaded(true);
  };
  const handleClose = () => {
    setFileList([]);
    setExcelData([]);
    setVisible(false);
    setIsUploaded(true);
  };

  const showModal = () => {
    setVisible(true);
  };
  const filterStatus = (name) => {
    setDefaultName(name);
  };
  const splitCustomerArray = [
    {
      title: 'All Customers',
      value: 'All',
      key: 'All',
      label: 'All',
    },
    {
      title: 'New Customers (Not Signed IN)',
      value: 'NotSignedIn',
      key: 'NotSignedIn',
      label: 'New Customers (Not Signed IN)',
    },
    {
      title: 'New Customers (Signed IN)',
      value: 'SignedIn',
      key: 'SignedIn',
      label: 'New Customers (Signed IN)',
    },
    {
      title: 'Return Customers',
      value: 'Return',
      key: 'Return',
      label: 'Return Customers',
    },
    {
      title: 'Abandoned cart',
      value: 'abandoned',
      key: 'abandoned',
      label: 'Abandoned cart',
    },
  ];
  const filterOrders = () => {
    return (
      <div className="customer-filter-popup-content cutomer-tab">
        <Space>
          <Radio.Group className="theme-radio" value={defaultName}>
            {splitCustomerArray.map((customer) => (
              <Radio.Button
                value={customer.value}
                onClick={() => filterStatus(customer.value)}
              >
                <span>{get(customer, 'title', '')}</span>
              </Radio.Button>
            ))}
          </Radio.Group>
        </Space>
      </div>
    );
  };

  const handleFilterCustomer = (key) => {
    setDefaultName(key);
  };

  const handleDelete = (index, key) => {
    if (key === FILE_TYPE_SHEET) {
      const sheetFiles = filter(fileList, (__, index_) => index_ !== index);
      setFileList(sheetFiles);
      if (isEmpty(sheetFiles)) {
        setIsUploaded(true);
      }
    }
  };

  const fileListRender = () => {
    return (
      <div className="back-arrow">
        <Row>
          <Col className="d-flex file-name-text" span={24}>
            <FileIcon className="file-list-icon" />
          </Col>
          <Col span={24}>
            {map(fileList, (item, index) => (
              <div key={index} className="file-list-align">
                <Row className="d-flex file-name-text">
                  <Col span={2}>
                    <SheetIcon className="mt-10" />
                  </Col>
                  <Col span={11}>
                    <Tooltip title={get(item, 'name', '')}>
                      <div className="ellipse-div">
                        <Text>{get(item, 'name', '')}</Text>
                      </div>
                    </Tooltip>
                  </Col>
                  <Col span={3} className="back-arrow">
                    <DeleteIcon
                      onClick={() => handleDelete(index, FILE_TYPE_SHEET)}
                    />
                  </Col>
                </Row>
              </div>
            ))}
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Spin spinning={loading} tip={downloadText}>
      <div className="search-container">
        <div>
          <h1>
            <Customer />
            &nbsp; Customers
          </h1>
        </div>
        <div>
          <Input
            allowClear
            placeholder="Search"
            onChange={(event_) => globalSearch(event_.target.value)}
            className="custom-search"
            suffix={<SearchOutlined className="site-form-item-icon" />}
          />
        </div>
        <div />
      </div>
      <div className="box">
        {mobileView && (
          <div>
            <Tabs
              defaultActiveKey={defaultName}
              items={splitCustomerArray}
              onTabClick={handleFilterCustomer}
            />
          </div>
        )}
        <div className="box__header customer-box-header">
          <div className="filter-orders-desktop">{filterOrders()}</div>
          <div className="download-item-customer">
            <div>
              <Button
                type="primary"
                className="download-excel customers-action-import"
                onClick={showModal}
              >
                Import Customers
                <UploadOutlined />
              </Button>
              <Modal
                title="Import Customers"
                okText="Import"
                visible={visible}
                onCancel={handleClose}
                maskClosable={false}
                className="bulk-modal import-customer-upload-model"
                zIndex={99_998}
                footer={[
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={downloadExcelTemplate}
                    className="download-customer-temp-btn"
                  >
                    Download Template
                  </Button>,
                  <Button key="validate" onClick={handleValidate}>
                    Validate
                  </Button>,
                  <Button key="reset" onClick={handleCancel}>
                    Reset
                  </Button>,
                  <Button
                    type="primary"
                    loading={confirmLoading}
                    disabled={!enable}
                    onClick={handleOk}
                  >
                    Import
                  </Button>,
                ]}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                  }}
                >
                  <Row
                    gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                    className="customer-file-upload-popup-row"
                  >
                    <Col className="gutter-row" span={24}>
                      {isUploaded ? (
                        <div>
                          <Dragger
                            customRequest={dummyRequest}
                            beforeUpload={handleUpload}
                            onChange={handleFileList}
                            fileList={fileList}
                            maxCount={1}
                            className=" bulk-upload-tour"
                            showUploadList={false}
                          >
                            <p className="upload-text">Select File</p>
                            <div className="mt-30p">
                              <UploadIcon />
                              <p className="upload-margin">
                                Drag & drop files or{' '}
                                <span className="browse-text">Browse </span>
                              </p>
                            </div>
                          </Dragger>
                        </div>
                      ) : (
                        fileListRender()
                      )}
                    </Col>
                  </Row>
                </div>
              </Modal>
            </div>
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    disabled={selectedUser.length === 0}
                    onClick={() => downloadUserData('selected')}
                  >
                    Download Selected Data
                  </Menu.Item>
                  <Menu.Item onClick={() => downloadUserData()}>
                    {' '}
                    Download Complete Data
                  </Menu.Item>
                </Menu>
              }
              placement="bottomRight"
              arrow
            >
              <Button
                type="primary"
                disabled={downloadButton}
                className="download-excel customers-action-download"
              >
                {downloadButton ? 'Downloading' : 'Download To Excel'}
                <DownloadOutlined />
              </Button>
            </Dropdown>
          </div>
        </div>
        <div className="p-0" style={{ marginBottom: 16 }}>
          {mobileView ? (
            <CustomerMobileView
              userData={userData}
              handleTableChange={handleTableChange}
              pagination={pagination}
              tenantDetails={tenantDetails}
              defaultName={defaultName}
              downloadPdf={downloadPdf}
              downloadExcel={downloadExcel}
              renderPopoverContent={renderPopoverContent}
              onBagDetalis={onBagDetalis}
              setBagDetails={setBagDetails}
            />
          ) : (
            <Table
              className="customer-table orders-table-styles"
              columns={filteredColumns}
              dataSource={userData}
              pagination={get(userData, 'length', -1) <= 0 ? '' : pagination}
              fetchCustomerData={fetchCustomerData}
              loading={tableLoading}
              onChange={handleTableChange}
              rowSelection={rowSelection}
              rowKey="user_uid"
              scroll={{ x: 780 }}
            />
          )}
        </div>
      </div>
    </Spin>
  );
}

export default Customers;
