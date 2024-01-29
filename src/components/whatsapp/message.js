import React, { useState, useEffect, useContext } from 'react';
import {
  Table,
  Row,
  Col,
  notification,
  Spin,
  Tooltip,
  Tag,
  Button,
  Modal,
  Upload,
  Drawer,
  Select,
  Space,
} from 'antd';
import { useLocation } from 'react-router-dom';
import { BranchesOutlined, UploadOutlined } from '@ant-design/icons';
import { get, map, flatten, filter, orderBy } from 'lodash';
import { serialize } from 'object-to-formdata';
import axios from 'axios';
import { TenantContext } from '../context/tenant-context';
import { utcToIst } from '../../shared/date-helper';
import { paginationstyler } from '../../shared/attributes-helper';
import { FAILED_TO_LOAD } from '../../shared/constant-values';

const { Option } = Select;

const dummyRequest = ({ onSuccess }) => {
  setTimeout(() => {
    onSuccess('ok');
  }, 0);
};

const Account = (properties) => {
  const { account } = properties;
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [tenantDetails] = useContext(TenantContext);
  const [visible, setVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [showReportDrawer, setShowReportDrawer] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [reportDetails, setReportDetails] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [tableData, setTableData] = useState([]);
  const refresh = get(location, 'state.refresh', false);

  const deliveryReportColumns = [
    {
      title: 'Job ID',
      key: 'id',
      dataIndex: 'id',
    },
    {
      title: 'Campaign Name',
      key: 'job_name',
      dataIndex: 'job_name',
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
    },
    {
      title: 'created At',
      key: 'creation_date',
      dataIndex: 'creation_date',
      render: (text) => utcToIst(text),
    },
    {
      title: 'Action',
      key: 'delivery_reports',
      dataIndex: 'delivery_reports',
      render: (text) => (
        <span className="">
          <Tooltip title="View Delivery Report">
            <Tag color="volcano">
              <BranchesOutlined
                onClick={() => {
                  setReportDetails(text);
                  setShowReportDrawer(true);
                }}
              />
            </Tag>
          </Tooltip>
        </span>
      ),
    },
  ];

  const handleStatus = (text) => {
    let statusText = '';
    if (text === 1) {
      statusText = 'Sent successfully';
    } else if (text === 2) {
      statusText = 'Number to short';
    } else if (text === 3) {
      statusText = 'Error or Failure to Send Message';
    } else {
      statusText = 'Not a WhatsApp Number';
    }
    return statusText;
  };

  const reportDetailColumns = [
    {
      title: 'Mobile',
      key: 'mobile',
      dataIndex: 'mobile',
    },
    {
      title: 'Delivery Status',
      key: 'status',
      dataIndex: 'status',
      render: (text) => handleStatus(text),
    },
  ];

  const handleFileList = ({ fileList: fileListName }) => {
    setFileList(fileListName);
    if (fileListName) {
      // setEnable(false);
    }
  };

  const handleUpload = (file) => {
    const uploadFormat = get(file, 'name', '').split('.')[1];
    const acceptedFormats = ['xlsx', 'xls', 'csv'];
    if (!acceptedFormats.includes(uploadFormat)) {
      notification.error({ message: 'Upload the proper file format' });
      setFileList([]);
    }
  };

  const fetchData = () => {
    const tenantUid = localStorage.getItem('tenantUid');
    const whatsAppApiUrl = get(tenantDetails, 'WhatsAppAPI', '');
    setLoading(true);
    axios
      .get(`${whatsAppApiUrl}/users/get-account-job`, {
        params: { tenantUid },
      })
      .then((jobResp) => {
        const data = get(jobResp, 'data.data', []);
        if (data.length) {
          setTableData(data);
          setSelectedAccount('');
          const orderByData = orderBy(data, ['id'], ['desc']);
          setJobData(orderByData);
          setLoading(false);
        } else {
          setLoading(false);
          setSelectedAccount('');
          setJobData([]);
          setTableData([]);
        }
      })
      .catch((error) => {
        setJobData([]);
        setLoading(false);
        notification.error({
          message: get(error, 'response.data.message', FAILED_TO_LOAD),
        });
      });
  };

  const handleSelectAccount = (value) => {
    if (value) {
      setSelectedAccount(value);
      const filteredData = filter(tableData, ['mobile', value], []);
      const orderByData = orderBy(filteredData, ['id'], ['desc']);
      setJobData(flatten(orderByData));
    } else {
      fetchData();
      setSelectedAccount('');
    }
  };

  const handleOk = async () => {
    const tenantUid = localStorage.getItem('tenantUid');
    setConfirmLoading(true);
    const files = {
      file: fileList[0].originFileObj,
    };
    const whatsAppApiUrl = get(tenantDetails, 'WhatsAppAPI', '');
    const formData = serialize({
      ...{ referenceId: tenantUid },
      ...files,
    });
    axios({
      method: 'POST',
      url: `${whatsAppApiUrl}/send-messages-by-excel?`,
      data: formData,
    })
      .then(() => {
        setConfirmLoading(false);
        notification.success({
          message: 'Bulk Message Job created successfully',
        });
        setVisible(false);
        fetchData();
      })
      .catch(() => {
        setConfirmLoading(false);
        notification.error({
          message: 'Failed to create Job for Bulk Message',
        });
      });
  };

  useEffect(() => {
    if (tenantDetails) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantDetails]);
  useEffect(() => {
    if (refresh) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);
  useEffect(() => {
    paginationstyler();
  }, [jobData, reportDetails]);

  return (
    <Spin spinning={loading}>
      <div className="box">
        <div className="box__header bg-gray-lighter">
          <Space>
            <h3 className="box-title">Whatsapp messages</h3>
            <Button type="primary" onClick={() => fetchData()}>
              Refresh
            </Button>
          </Space>
          <div className="download-item-customer">
            {/* <div>
              <Button
                type="primary"
                className="download-excel customers-action-import"
                onClick={() => setVisible(true)}
              >
                Bulk message
                <UploadOutlined />
              </Button>
            </div> */}
            <div>
              <Select
                onChange={handleSelectAccount}
                virtual={false}
                className="location-select search-location-select"
                maxTagCount="responsive"
                value={selectedAccount || 'Choose a account'}
                placeholder="Choose a account"
                filterOption={(input, option) =>
                  option.children
                    .toLowerCase()
                    .includes(input.toLowerCase()) === true
                }
                allowClear
                getPopupContainer={(triggerNode) => triggerNode.parentElement}
              >
                {account &&
                  map(account, (item) => (
                    <Option key={item.id} value={item.mobile}>
                      {item.mobile}
                    </Option>
                  ))}
              </Select>
            </div>
          </div>
        </div>
        <div className="box__content p-0" style={{ marginBottom: 16 }}>
          <Table
            className="grid-table orders-table-styles"
            columns={deliveryReportColumns}
            dataSource={jobData}
            // pagination={userData.length <= 0 ? null : pagination}
            // fetchCustomerData={fetchCustomerData}
            // loading={tableLoading}
            // onChange={handleTableChange}
            // rowSelection={rowSelection}
            // rowKey="user_uid"
            scroll={{ x: 780 }}
          />
        </div>
      </div>
      <Modal
        title="Upload Customer Data"
        okText="Import"
        visible={visible}
        onCancel={() => setVisible(false)}
        maskClosable
        className="bulk-modal import-customer-upload-model"
        zIndex={99998}
        footer={[
          //   <Button danger type="default" onClick={handleValidate}>
          //     Validate
          //   </Button>,
          <Button
            type="primary"
            loading={confirmLoading}
            // disabled={!enable}
            onClick={handleOk}
          >
            Send
          </Button>,
          <Button danger type="default">
            Reset
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
              <div className="customer-file-upload-popup">
                <Upload
                  customRequest={dummyRequest}
                  beforeUpload={handleUpload}
                  onChange={handleFileList}
                  fileList={fileList}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>
      <Drawer
        title="Report Details"
        width={750}
        visible={showReportDrawer}
        onClose={() => setShowReportDrawer(false)}
        closable={() => setShowReportDrawer(false)}
        className="related-prdt-drawer"
        zIndex={9999999}
      >
        <div className="product_table">
          <Table
            className="grid-table orders-table-styles"
            dataSource={reportDetails}
            columns={reportDetailColumns}
            // loading={isLoading}
            // pagination={pagination}
            // onChange={handleTableChange}
          />
        </div>
      </Drawer>
    </Spin>
  );
};

export default Account;
