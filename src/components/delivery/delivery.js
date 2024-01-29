import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';
import {
  Form,
  Input,
  Button,
  Table,
  notification,
  Breadcrumb,
  Tag,
  Spin,
  Space,
} from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { get, debounce } from 'lodash';
import { useLocation } from 'react-router-dom';
import * as _ from 'lodash';
import {
  getDelivery,
  createDeliveryCharge,
  deleteDeliveryCharge,
} from '../../utils/api/url-helper';
import { ReactComponent as Charge } from '../../assets/icons/charge.svg';
import {
  DELIVERYCHARGE_DELETE_SUCCESS,
  DELIVERYCHARGE_DELETE_FAILED,
  FAILED_TO_LOAD,
  DELIVERYCHARGE_ADD_FAILED,
  DELIVERYCHARGE_ADD_SUCCESS,
} from '../../shared/constant-values';
import { handleUrlChanges } from '../../shared/common-url-helper';
import getFormItemRules from '../../shared/form-helpers';
import {
  DeleteAlert,
  DeleteAlertImage,
  DeleteAlertMessage,
} from '../../shared/sweetalert-helper';
import { paginationstyler } from '../../shared/attributes-helper';
import { getFilterData } from '../../shared/table-helper';
import { TenantContext } from '../context/tenant-context';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const DeliveryCharge = (properties) => {
  const { history } = properties;
  const canWrite = get(properties, 'roleData.can_write', false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [deliveryData, setDeliveryData] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [tableChange, setTableChange] = useState(false);
  const [filterValue, setFilterValue] = useState({});
  const [deliverySorter, setDeliverySorter] = useState({});
  const [currentPageValue, setCurrentPageValue] = useState(1);
  const [tenantDetails] = useContext(TenantContext);
  const { currency, currency_locale: currencyLocale } = get(
    tenantDetails,
    'setting',
    {}
  );

  const firstUpdate = useRef(true);

  const query = useQuery();
  const currentPageCount = query.get('page');
  const moduleName = 'delivery-charge';
  const firstPage = 1;

  const fetchDeliveryData = (
    parameters = {},
    flag2,
    showError = false,
    rejectError = true
  ) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      const {
        pagination: { pageSize, current },
        searchKey,
      } = parameters;

      const queryParameters = {
        limit: pageSize,
        offset: flag2 ? 1 : current,
        sorter: JSON.stringify(deliverySorter),
        filters: JSON.stringify(filterValue),
      };

      if (searchKey) queryParameters.searchWord = searchKey;
      queryParameters.firstTableParams = 'zt_delivery_charge';
      getDelivery(queryParameters)
        .then((response) => {
          const DeliveryDataSet = get(response, ['data'], []);
          setDeliveryData(DeliveryDataSet.rows);
          setPagination({
            ...parameters.pagination,
            current: flag2 ? 1 : current,
            total: DeliveryDataSet.count,
          });
          setLoading(false);
          setTableChange(false);
          resolve();
        })
        .catch((error_) => {
          setTableChange(false);
          if (showError)
            notification.error({ message: error_.message || FAILED_TO_LOAD });
          if (rejectError) reject(error_);
        });
    });
  };

  const fetchData = useCallback((parameters) => {
    setLoading(true);
    fetchDeliveryData(parameters || { pagination })
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      fetchDeliveryData({
        pagination: addPagination,
        searchKey: searchWord,
      });
    }
    if (firstUpdate.current) {
      firstUpdate.current = false;
      const parameters = current
        ? { pagination: newPagination, searchKey: searchWord || '' }
        : false;
      fetchData(parameters);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageCount]);

  const onFinish = (values) => {
    setDisabled(true);
    createDeliveryCharge(values)
      .then(() => {
        notification.success({ message: DELIVERYCHARGE_ADD_SUCCESS });
        setDisabled(false);
        form.resetFields();
        fetchData();
      })
      .catch((error) => {
        notification.error({
          message: Object.prototype.hasOwnProperty.call(error, 'error')
            ? error.error
            : DELIVERYCHARGE_ADD_FAILED,
        });
        setDisabled(false);
      });
  };

  const globalSearch = debounce((value) => {
    setTableChange(true);
    setSearchWord(value);
    handleUrlChanges(firstPage, history, moduleName);
    fetchDeliveryData({
      pagination: { pageSize: 10, current: 1 },
      searchKey: value,
    });
  }, 1000);

  const handleDelete = async (event, key) => {
    const text =
      'Are you sure you want to delete this delivery charge from the list?';
    const result = await DeleteAlert(text);
    if (result.isConfirmed) {
      setLoading(true);
      deleteDeliveryCharge(key.delivery_uid)
        .then((response) => {
          if (response.success) {
            const { current } = pagination;
            const currentPage =
              deliveryData.length === 1 && current > 1 ? current - 1 : current;
            DeleteAlertImage(DELIVERYCHARGE_DELETE_SUCCESS);
            fetchDeliveryData({
              pagination: { ...pagination, current: currentPage },
            });
          } else DeleteAlertMessage(DELIVERYCHARGE_DELETE_FAILED);
          setLoading(false);
        })
        .catch(() => {
          DeleteAlertMessage(DELIVERYCHARGE_DELETE_FAILED);
          setLoading(false);
        });
    }
  };

  const handleTableChange = (paginationAlias, filters, sorted) => {
    setTableChange(true);
    const { current } = paginationAlias;
    handleUrlChanges(current, history, moduleName);
    if (!_.isEmpty(sorted.order)) {
      setDeliverySorter({
        columnKey: sorted.field,
        order: sorted.order === 'ascend' ? 'ascend' : 'descend',
      });
      setCurrentPageValue(current);
    } else {
      setDeliverySorter({
        columnKey: sorted.field,
        order: sorted.order === '',
      });
      setCurrentPageValue(current);
    }
  };
  useEffect(() => {
    if (Object.keys(deliverySorter).length > 0) {
      fetchDeliveryData({
        pagination: { pageSize: 10, current: currentPageValue },
        searchKey: searchWord,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliverySorter]);

  const columns = [
    {
      title: 'Distance',
      dataIndex: 'distance',
      key: 'distance',
      render: (distance) => (
        <span className="text-green-dark">{distance} KM</span>
      ),
      sorter: true,
      ...getFilterData(
        'Distance',
        'distance',
        'text',
        setFilterValue,
        filterValue
      ),
    },
    {
      title: 'Charges',
      dataIndex: 'delivery_charge',
      key: 'delivery_charge',
      render: (amt) => (
        <h4 className="text-grey-light">
          <CurrencyFormatter
            value={amt}
            type={currency}
            language={currencyLocale}
          />
        </h4>
      ),
      sorter: true,
      ...getFilterData(
        'Charges',
        'delivery_charge',
        'text',
        setFilterValue,
        filterValue
      ),
    },
    {
      title: 'Actions',
      render: (details) => (
        <span>
          &nbsp;
          <Tag color="red" onClick={(event) => handleDelete(event, details)}>
            <DeleteOutlined />
          </Tag>
        </span>
      ),
    },
  ];

  useEffect(() => {
    paginationstyler();
  }, [deliveryData]);

  return (
    <Spin spinning={loading}>
      <div className="search-container">
        <div>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <Charge />
                Delivery Charges
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
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
      <div className="box" style={{ padding: '0px 10px' }}>
        <div className="box__header">
          <h3 className="box-title">Delivery Charges Configurator</h3>
        </div>
        <div className="box__content box-content-background delivery-box-content">
          <Form
            form={form}
            className="user-form delivery-charge-filt-form"
            layout="vertical"
            onFinish={onFinish}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '300px 300px 100px',
                gridGap: '10px',
              }}
            >
              <Form.Item
                label="Distance"
                name="distance"
                rules={[
                  {
                    required: true,
                    message: 'Please enter the distance!',
                  },
                  ...getFormItemRules({
                    onlyNumber: true,
                    whitespace: true,
                    positiveNumber: true,
                  }),
                ]}
              >
                <Input allowClear suffix="KM" placeholder="Enter Distance" />
              </Form.Item>
              <Form.Item
                label="Delivery Charges"
                name="delivery_charge"
                rules={[
                  {
                    required: true,
                    message: 'Please enter the delivery charge!',
                  },
                  ...getFormItemRules({
                    onlyNumber: true,
                    whitespace: true,
                    positiveNumber: true,
                  }),
                ]}
              >
                <Input allowClear placeholder="Enter Delivery Charges" />
              </Form.Item>
              <Form.Item>
                <Button
                  htmlType="submit"
                  type="primary"
                  hidden={!canWrite}
                  disabled={disabled}
                  style={{ marginTop: '30px' }}
                >
                  {disabled ? 'Submitting' : 'Add'}
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
        <div className="box__content p-0">
          <Table
            className="grid-table orders-table-styles"
            columns={
              canWrite
                ? columns
                : columns.filter(
                    (response) => get(response, 'title', '') !== 'Actions'
                  )
            }
            dataSource={deliveryData}
            rowKey="order_delivery_id"
            pagination={pagination}
            fetchDeliveryData={fetchDeliveryData}
            loading={loading}
            onChange={handleTableChange}
            scroll={{ x: 780 }}
          />
        </div>
      </div>
    </Spin>
  );
};

export default DeliveryCharge;
