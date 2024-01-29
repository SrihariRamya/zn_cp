import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Space,
  Spin,
  Modal,
  notification,
  Row,
  Col,
  Card,
} from 'antd';
import { get } from 'lodash';
import {
  PlusOutlined,
  ArrowRightOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  FAILED_TO_LOAD,
  REPORT_ADD_SUCCESS,
  REPORT_ADD_FAILED,
  REPORT_UPDATE_SUCCESS,
  REPORT_UPDATE_FAILED,
  REPORT_DELETE_SUCCESS,
  REPORT_DELETE_FAILED,
  DELETE_CONFIRMATION_DATA,
} from '../../shared/constant-values';
import {
  DeleteAlert,
  DeleteAlertImage,
  DeleteAlertMessage,
} from '../../shared/sweetalert-helper';
import {
  getAllReports,
  createCustomReport,
  getAllCustomReports,
  deleteCustomReport,
  updateCustomReport,
} from '../../utils/api/url-helper';

const { Meta } = Card;
const { Option } = Select;
const { TextArea } = Input;
function Customreport({ properties }) {
  const canWrite = get(properties, 'roleData.can_write', false);
  const [loading, setLoading] = useState(false);
  const [reportDatas, setReportData] = useState([]);
  const [editId, setEditId] = useState();
  const [customReportData, setCustomReportData] = useState([]);
  const [selectedReportData, setSelectedReportData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [form] = Form.useForm();
  const history = useNavigate();

  const fetchData = () => {
    setLoading(true);
    const apiArray = [getAllReports(), getAllCustomReports()];
    Promise.all(apiArray)
      .then((response) => {
        setReportData(get(response, '[0].data', []));
        setCustomReportData(get(response, '[1].data', []));
        setLoading(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);
  const showModal = (value) => {
    setTitle(value);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedReportData();
    setIsModalVisible(false);
  };
  const handleViewChange = (value) => {
    form.setFieldsValue({ report_data: [] });
    const result =
      reportDatas &&
      reportDatas.filter((response) => response.view_name === value);
    setSelectedReportData(get(result, '[0].report_columns', ''));
  };

  const onFinish = (values) => {
    setLoading(true);
    if (editId) {
      const updateData = {
        id: editId,
        custom_report_view_name: values.report_group,
        custom_report_columns: values.report_data,
        custom_report_name: values.report_name,
        custom_report_description: values.report_description,
      };
      updateCustomReport(updateData)
        .then((response) => {
          if (response.success) {
            notification.success({ message: REPORT_UPDATE_SUCCESS });
            form.resetFields();
            setEditId();
            setIsModalVisible(false);
            setLoading(false);
            fetchData();
          } else {
            form.resetFields();
            setEditId();
            setLoading(false);
            setIsModalVisible(false);
            notification.error({ message: REPORT_UPDATE_FAILED });
          }
        })
        .catch((error) => {
          form.resetFields();
          setEditId();
          setIsModalVisible(false);
          notification.error({
            message: get(error, 'error', REPORT_ADD_FAILED),
          });
        });
    } else {
      const formData = {
        custom_report_name: values.report_name,
        custom_report_description: values.report_description,
        custom_report_view_name: values.report_group,
        custom_report_columns: values.report_data,
      };
      createCustomReport(formData)
        .then((result) => {
          if (result.success) {
            notification.success({ message: REPORT_ADD_SUCCESS });
            form.resetFields();
            setLoading(false);
            setIsModalVisible(false);
            fetchData();
          } else {
            form.resetFields();
            setIsModalVisible(false);
            notification.error({ message: REPORT_ADD_FAILED });
          }
        })
        .catch((error) => {
          setLoading(false);
          form.resetFields();
          setIsModalVisible(false);
          notification.error({
            message: get(error, 'error', REPORT_ADD_FAILED),
          });
        });
    }
  };
  const handleDelete = async (id) => {
    const result = await DeleteAlert(DELETE_CONFIRMATION_DATA);
    if (result.isConfirmed) {
      setLoading(true);
      deleteCustomReport(id)
        .then((response) => {
          if (response.success) {
            DeleteAlertImage(REPORT_DELETE_SUCCESS);
            fetchData();
          } else DeleteAlertMessage(REPORT_DELETE_FAILED);
          setLoading(false);
        })
        .catch(() => {
          DeleteAlertMessage(REPORT_DELETE_FAILED);
          setLoading(false);
        });
    }
  };

  const handleReportEdit = (id) => {
    setEditId(id);
    const updateFormDatas =
      customReportData &&
      customReportData.filter((response) => response.id === id);
    const formData = {
      report_name: get(updateFormDatas, '[0].custom_report_name', ''),
      report_description: get(
        updateFormDatas,
        '[0].custom_report_description',
        ''
      ),
      report_group: get(updateFormDatas, '[0].custom_report_view_name', ''),
      report_data: get(updateFormDatas, '[0].custom_report_columns', ''),
    };
    form.setFieldsValue(formData);
    const viewName = form.getFieldValue('report_group');
    const reportColumnsDatas =
      reportDatas &&
      reportDatas.filter((response) => response.view_name === viewName);
    setSelectedReportData(get(reportColumnsDatas[0], 'report_columns', ''));
    showModal('Edit Custom Report');
  };
  const handleViewReport = (data) => {
    const reportData = {
      view_name: data.custom_report_view_name,
      report_id: data.id,
      report_name: data.custom_report_name,
      report_columns: data.custom_report_columns,
      report_column_names: reportDatas,
      tagname: 'customReport',
      attrib_columns: 'custom_report_columns',
    };
    history({
      pathname: `/reports/report-details`,
      state: { reportData },
    });
  };
  return (
    <Spin spinning={loading}>
      <div className="box">
        <div className="box__header bg-gray-lighter">
          <h3 className="box-title">Custom Reports</h3>
          <div>
            <Button
              hidden={!canWrite}
              type="primary"
              className="add-btn"
              icon={<PlusOutlined />}
              onClick={() => {
                showModal('Add Custom Report');
              }}
            >
              Add Custom Report
            </Button>
          </div>
        </div>
        <div className="box-content-background">
          <div className="card-container report">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              {customReportData &&
                customReportData.map((data) => (
                  <Col
                    className="gutter-row"
                    xs={24}
                    sm={24}
                    md={6}
                    lg={6}
                    xl={6}
                  >
                    <Card
                      actions={[
                        <span className="report-icons">
                          <DeleteOutlined
                            hidden={!canWrite}
                            onClick={() => handleDelete(data.id)}
                            style={{ color: 'red' }}
                          />

                          <EditOutlined
                            hidden={!canWrite}
                            onClick={() => handleReportEdit(data.id)}
                            style={{ color: 'green' }}
                          />

                          <ArrowRightOutlined
                            onClick={() => handleViewReport(data)}
                          />
                        </span>,
                      ]}
                    >
                      <Meta
                        title={
                          <span className="text-green-dark">
                            {get(data, 'custom_report_name', '')}
                          </span>
                        }
                        description={
                          <span className="text-grey-light">
                            {get(data, 'custom_report_description', '')}
                          </span>
                        }
                      />
                    </Card>
                  </Col>
                ))}
            </Row>
          </div>
        </div>
      </div>
      <Modal
        footer={null}
        title={title}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="report_name"
            label="Report Name"
            rules={[
              {
                required: true,
                message: 'Please enter Report Name',
              },
            ]}
          >
            <Input placeholder="Please Enter Report Name" />
          </Form.Item>
          <Form.Item
            name="report_description"
            label="Report Description"
            rules={[
              {
                required: true,
                message: 'Please enter Report description',
              },
            ]}
          >
            <TextArea
              placeholder="Please Enter Report description"
              style={{ width: '100%' }}
              rows={4}
              className="p-desc"
            />
          </Form.Item>
          <Form.Item
            name="report_group"
            label="Select Group"
            rules={[
              {
                required: true,
                message: 'Please Select Group',
              },
            ]}
          >
            <Select
              placeholder="Select Group"
              virtual={false}
              onChange={handleViewChange}
              allowClear
            >
              {reportDatas &&
                reportDatas.map((data) => (
                  <Option value={data.view_name}>
                    {data.view_name.replaceAll(/[^A-Za-z]/g, ' ')}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="report_data"
            mode="multiple"
            label="Select Data"
            rules={[
              {
                required: true,
                message: 'Please Select Data',
              },
            ]}
          >
            <Select
              allowClear
              virtual={false}
              maxTagCount="responsive"
              mode="multiple"
              style={{ height: '100%' }}
              placeholder="Select Data"
            >
              {selectedReportData &&
                selectedReportData.map((responce) => (
                  <Option value={responce.field}>{responce.columnName}</Option>
                ))}
            </Select>
          </Form.Item>
          <div className="flex-end">
            <Form.Item>
              <Space className="f_btns">
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
                <Button onClick={handleCancel} danger>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </Spin>
  );
}

export default Customreport;
