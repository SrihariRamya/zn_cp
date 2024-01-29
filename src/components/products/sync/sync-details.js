/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable unicorn/no-null */
/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable camelcase */
/* eslint-disable unicorn/consistent-function-scoping */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  Space,
  Row,
  Col,
  Typography,
  Spin,
  Tabs,
  Form,
  notification,
  Button,
  Radio,
  Modal,
} from 'antd';
import moment from 'moment';
import { get, isEmpty, some } from 'lodash';
import {
  UnorderedListOutlined,
  ReloadOutlined,
  DoubleRightOutlined,
} from '@ant-design/icons';
import {
  getMarketProductSync,
  updateMarketSync,
  syncMoveTo,
  getMarketPlace,
  activeMarketPlace,
} from '../../../utils/api/url-helper';
import {
  FAILED_TO_LOAD,
  MARKET_SYNC_UPDATE_SUCCESS,
  MARKET_SYNC_UPDATE_FAIL,
  MARKET_SYNC_MOVE_SUCCESS,
  MARKET_SYNC_MOVE_FAIL,
} from '../../../shared/constant-values';
import CreateSyncTable from './sync-table';
import '../product.less';
import JingleBidTerms from './jb-terms-and-conditions';
import { withRouter } from '../../../utils/react-router/index';

const { Title } = Typography;
const { TabPane } = Tabs;

const tabArray = [
  {
    title: 'In Progress',
    key: 'in-progress',
  },
  {
    title: 'Approved',
    key: 'approved',
  },
  {
    title: 'Rejected',
    key: 'rejected',
  },
  {
    title: 'Failed',
    key: 'failed',
  },
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SyncDetails(properties) {
  const { history } = properties;
  const [form] = Form.useForm();
  const initial = {
    editKey: '',
    editData: '',
  };
  const loader = {
    componentLoader: false,
    tableLoader: false,
    buttonLoader: false,
  };
  const [loading, setLoading] = useState(loader);
  const [dataSource, setDataSource] = useState([]);
  const [edit, setEdit] = useState(initial);
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('in-progress');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [roleInfo] = useState(localStorage.getItem('roleName'));
  const [marketPlaceDetails, setMarketPlaceDetails] = useState({});
  const query = useQuery();
  const currentPage = query.get('page') || 1;
  const currentTab = query.get('tab') || 'in-progress';
  const isTenantAdmin = roleInfo === 'tenant_admin';

  const formatDate = (inputValue, fmt = '') =>
    moment(inputValue).isValid() ? moment(inputValue).format(fmt) : '';

  const getAttributeByName = (data, attribute) => {
    if (data && attribute) {
      return data.filter((item) => item?.zm_attribute?.name === attribute);
    }
    return '';
  };

  const formatProductData = (data = []) => {
    return data.map((value) => {
      const {
        // eslint-disable-next-line
        marketplace_product_details = [],
        marketplace_store_product_details,
        product_variant_id,
        marketplace_product_activity,
      } = value;
      const findVariant = (variantArray, variant) => {
        // eslint-disable-next-line
        const { variant_attributes = [] } =
          (variantArray || []).find(
            (variableId) => variableId?.id === variant
          ) || {};
        return get(
          getAttributeByName(variant_attributes, 'Units'),
          '[0].attribute_value',
          ''
        );
      };

      const {
        // eslint-disable-next-line
        Category_Name,
        marketplace_product_activity_uid,
        LPP,
        BPP,
        in_stock,
        Reduction_Amount,
        status,
        mrp_price,
        // eslint-disable-next-line
        notes,
        is_dirty,
        Store_Price,
        Delivery_Time = '',
        active,
      } = marketplace_product_activity[0] || {};
      return {
        product_name: marketplace_product_details?.product_name,
        store_name: marketplace_store_product_details?.store_name,
        variant_name: findVariant(
          marketplace_product_details?.product_variants,
          product_variant_id
        ),
        Category_Name,
        marketplace_product_activity_uid,
        LPP,
        BPP,
        in_stock,
        Reduction_Amount,
        status,
        notes,
        is_dirty,
        mrp_price,
        Store_Price,
        Delivery_Time,
        active,
        Start_Date: marketplace_product_activity[0]?.Start_Date || '',
        End_Date: marketplace_product_activity[0]?.End_Date || '',
        ...value,
      };
    });
  };

  const fetchData = () => {
    setLoading({ ...loading, componentLoader: true, tableLoader: false });
    setDataSource([]);
    const parameters = {
      limit: pagination.pageSize,
      offset: Number(currentPage),
      status: currentTab.toUpperCase(),
    };
    getMarketProductSync(parameters)
      .then((response) => {
        if (response.success) {
          const formattedData = formatProductData(
            get(response, 'data.rows', [])
          );
          setPagination({
            ...pagination,
            current: Number(currentPage),
            total: get(response, 'data.count', ''),
          });
          setDataSource(formattedData);
          setLoading({ ...loading, componentLoader: false });
        } else setLoading({ ...loading, componentLoader: false });
      })
      .catch((error_) => {
        notification.error({ message: error_.message || FAILED_TO_LOAD });
        setLoading({ ...loading, componentLoader: false });
      });
  };
  const fetchMarketPlaceDetails = (type = null) => {
    getMarketPlace()
      .then((response) => {
        setMarketPlaceDetails(get(response, 'data', {}));
        if (!type) setLoading({ ...loading, componentLoader: false });
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
        if (!type) setLoading({ ...loading, componentLoader: false });
      });
  };

  useEffect(() => {
    fetchMarketPlaceDetails('initial');
  }, []);

  useEffect(() => {
    if (!isTenantAdmin) {
      history({
        pathname: '/products/',
      });
    }
    fetchData();
    setActiveTab(currentTab);
    setSelectedRowKeys([]);
  }, [currentPage, currentTab]);

  const isEditing = (record) => record === edit.editKey;

  const onValuesChange = (changedValues) => {
    if (changedValues) setSaveDisabled(false);
  };

  const handleRowEdit = (record) => {
    form.setFieldsValue({
      LPP: record.LPP || '',
      BPP: record.BPP || '',
      Reduction_Amount: record.Reduction_Amount || '',
      Start_Date: record.Start_Date ? moment(record.Start_Date) : '',
      End_Date: record.End_Date ? moment(record.End_Date) : '',
      Delivery_Time: record.Delivery_Time || '',
    });
    setEdit({ editKey: record.id, editData: record });
    setSaveDisabled(true);
  };

  const handleUpdate = (values, customParameters = null) => {
    let parameters = {};
    if (customParameters) {
      parameters = customParameters;
    } else {
      const {
        // eslint-disable-next-line
        product_uid,
        product_variant_id,
        store_uid,
        product_name,
        marketplace_uid,
        marketplace_product_uid,
        in_stock,
        // eslint-disable-next-line
        Store_Price,
        Category_Name,
        marketplace_product_activity_uid,
        active,
        mrp_price,
      } = edit.editData || {};
      parameters = {
        ...values,
        Start_Date: formatDate(values.Start_Date || null),
        End_Date: formatDate(values.End_Date || null),
        updateId: get(edit.editData, 'marketplace_product_activity[0].id'),
        activeTab,
        active,
        product_uid,
        product_variant_id,
        store_uid,
        product_name,
        marketplace_uid,
        marketplace_product_uid,
        in_stock,
        Store_Price,
        Category_Name,
        marketplace_product_activity_uid,
        mrp_price,
      };
    }
    setLoading({ ...loading, tableLoader: true });
    updateMarketSync(parameters)
      .then((response) => {
        if (response.success) {
          if (
            get(response, 'message', '').includes(
              'Market place sync request is already in progress'
            )
          ) {
            notification.error({
              message: response.message,
            });
            setLoading({ ...loading, tableLoader: false });
          } else {
            fetchData();
            setEdit(initial);
            notification.success({
              message: response?.message ?? MARKET_SYNC_UPDATE_SUCCESS,
            });
          }
        } else setLoading({ ...loading, tableLoader: false });
      })
      .catch((error_) => {
        setLoading({ ...loading, tableLoader: false });
        notification.error({
          message: error_.message || MARKET_SYNC_UPDATE_FAIL,
        });
      });
  };

  const handleTableRadioChange = (event, options) => {
    const { value } = event.target;
    const {
      product_uid,
      store_uid,
      // eslint-disable-next-line
      product_variant_id,
      product_name,
      marketplace_uid,
      marketplace_product_uid,
      in_stock,
      Store_Price,
      Category_Name,
      mrp_price,
    } = options || {};
    const parameters = {
      updateId: get(options, 'marketplace_product_activity[0].id'),
      activeTab,
      product_uid,
      store_uid,
      product_variant_id,
      product_name,
      marketplace_uid,
      marketplace_product_uid,
      in_stock,
      Store_Price,
      Category_Name,
      mrp_price,
      active: value,
    };
    handleUpdate(null, parameters);
  };

  const handlePushToJb = () => {
    const zupainParameters = [];
    const jbParameters = [];
    selectedRowKeys.forEach((value) => {
      const {
        // eslint-disable-next-line
        product_uid,
        product_name,
        store_uid,
        marketplace_uid,
        in_stock,
        Store_Price,
        Category_Name,
        mrp_price,
        // eslint-disable-next-line
        marketplace_product_uid,
        marketplace_product_activity_uid,
        active,
        product_variant_id,
        variant_name,
        marketplace_product_details: { product_image: productImage },
      } = value || {};
      const parameters = {
        product_uid,
        Product_Name: product_name,
        store_uid,
        marketplace_uid,
        in_stock,
        Store_Price,
        Category_Name,
        status: 'IN-PROGRESS',
        action: 'CREATE',
        marketplace_product_uid,
        marketplace_product_activity_uid,
        active,
        Active: active,
      };
      jbParameters.push({
        ...parameters,
        Product_Price: mrp_price,
        Product_Image: JSON.stringify(productImage),
        Variant_Name: variant_name,
        Variant_ID: product_variant_id,
      });
      zupainParameters.push({
        ...parameters,
        mrp_price,
        editId: get(value, 'marketplace_product_activity.[0].id', ''),
      });
    });
    setLoading({ ...loading, tableLoader: true });
    syncMoveTo({
      data: zupainParameters,
      jbData: jbParameters,
      moveTo: 'IN-PROGRESS',
    })
      .then((response) => {
        if (response.success) {
          fetchData();
          setEdit(initial);
          setSelectedRowKeys([]);
          notification.success({ message: MARKET_SYNC_MOVE_SUCCESS });
        } else setLoading({ ...loading, tableLoader: false });
      })
      .catch((error_) => {
        setLoading({ ...loading, tableLoader: false });
        notification.error({
          message: error_.message || MARKET_SYNC_MOVE_FAIL,
        });
      });
  };

  const handlePushTo = () => {
    const isNewPush = some(
      selectedRowKeys,
      (value) =>
        get(value, 'marketplace_product_activity[0].action') === 'CREATE'
    );
    if (isNewPush) {
      setVisible(true);
    } else {
      handlePushToJb();
    }
  };

  const handleModalOk = () => {
    setVisible(false);
    handlePushToJb();
  };

  const handleUrlChange = (current, tab) => {
    const parameters = new URLSearchParams();
    parameters.append('tab', tab);
    parameters.append('page', current);
    history({
      pathname: '/products/marketplace-sync/',
      search: parameters.toString(),
    });
  };

  const handleTableChange = ({ current }) => {
    handleUrlChange(current, activeTab);
  };

  const handleChangeActiveTab = (event) => {
    setEdit(initial);
    handleUrlChange(1, event);
  };

  const rowSelection = {
    selectedRowKeys: selectedRowKeys.map(
      (value) => value?.marketplace_product_uid
    ),
    onChange: (selectedKeys, selectedRow) => {
      setSelectedRowKeys(selectedRow);
    },
  };
  const handleRefresh = () => fetchData();

  const tabButton = () => (
    <Space>
      {['pending'].includes(activeTab) && (
        <Space>
          <Button
            type="primary"
            onClick={handlePushTo}
            icon={<DoubleRightOutlined />}
            disabled={isEmpty(selectedRowKeys)}
          >
            Push To Marketplace
          </Button>
        </Space>
      )}
      <Button
        type="primary"
        onClick={handleRefresh}
        icon={<ReloadOutlined />}
        disabled={loading.componentLoader || loading.tableLoader}
      >
        Refresh
      </Button>
    </Space>
  );

  const handleEnableOnChange = (event) => {
    const { value } = event.target;
    setLoading({ ...loading, componentLoader: true });
    activeMarketPlace({ ...marketPlaceDetails, active: value })
      .then((response) => {
        if (response.success) {
          fetchMarketPlaceDetails();
          const message = `Marketplace ${
            value ? 'enabled' : 'disabled'
          } successfully`;
          notification.success({ message });
        }
      })
      .catch((error_) => {
        setLoading({ ...loading, componentLoader: false });
        notification.error({
          message: error_.message || FAILED_TO_LOAD,
        });
      });
  };
  const isMarketPlaceActive = get(marketPlaceDetails, 'active', false);

  return (
    <Spin spinning={loading.componentLoader}>
      <div
        className="sync-header-bar-content"
        style={{ padding: '10px 10px 0px 10px' }}
      >
        <Space direction="vertical" className="mobile-display-flex">
          <Title level={5}>
            <Space align="center" className="product-sync-title-box">
              <UnorderedListOutlined />
              Sync Details
              {/* <div className="enable-radio">
                <Radio.Group
                  buttonStyle="solid"
                  value={isMarketPlaceActive}
                  onChange={(event) => handleEnableOnChange(event)}
                >
                  <Radio.Button name="enable" value>
                    Enable
                  </Radio.Button>
                  <Radio.Button name="disable" value={false}>
                    Disable
                  </Radio.Button>
                </Radio.Group>
              </div> */}
            </Space>
          </Title>
          <Breadcrumb separator=">">
            <Breadcrumb.Item className="breadcrumb-title">
              <Link to="/">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-title">
              <Link to="/products">Products</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-title">
              Sync Details
            </Breadcrumb.Item>
          </Breadcrumb>
        </Space>
      </div>
      <Row>
        <Col span={24}>
          <Tabs
            type="card"
            activeKey={activeTab}
            onChange={handleChangeActiveTab}
            tabBarExtraContent={tabButton()}
            className="theme-tabs product-sync-filter-options"
            style={{ padding: '10px 10px 0px 10px' }}
          >
            {tabArray.map((value) => (
              <TabPane tab={value.title} key={value.key} />
            ))}
          </Tabs>
          <Row>
            <Col span={24}>
              <Form
                form={form}
                className="table-form"
                autoComplete="off"
                onFinish={handleUpdate}
                onValuesChange={onValuesChange}
                style={{ padding: '10px 10px 0px 10px' }}
              >
                <CreateSyncTable
                  setEdit={setEdit}
                  isEditing={isEditing}
                  handleRowEdit={handleRowEdit}
                  handleTableChange={handleTableChange}
                  rowSelection={rowSelection}
                  edit={edit}
                  loading={loading}
                  saveDisabled={saveDisabled}
                  activeTab={activeTab}
                  dataSource={dataSource}
                  pagination={pagination}
                  formatDate={formatDate}
                  handleTableRadioChange={handleTableRadioChange}
                  isMarketPlaceActive={isMarketPlaceActive}
                />
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
      {visible && (
        <Modal
          title="Terms and Conditions"
          visible={visible}
          onOk={handleModalOk}
          onCancel={() => setVisible(false)}
        >
          <JingleBidTerms />
        </Modal>
      )}
    </Spin>
  );
}

export default withRouter(SyncDetails);
