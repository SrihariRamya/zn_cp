import React, { useEffect, useState, useContext } from 'react';
import { Spin, Switch, notification, Modal, Table, Space, Tabs } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { find, get } from 'lodash';
import { getAll, update } from './kl-notification-helper';
import {
  getNotificationCount,
  getWhatsapp,
} from '../../../utils/api/url-helper';
import {
  CHANNEL_EMAIL,
  CHANNEL_PUSH,
  CHANNEL_SMS,
  CHANNEL_WHATSAPP,
  FAILED_TO_LOAD,
} from '../../../shared/constant-values';
import { TenantContext } from '../../context/tenant-context';

const { Column, ColumnGroup } = Table;
const { TabPane } = Tabs;

const Notifications = () => {
  const [, , , tenantConfig] = useContext(TenantContext);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalValue, setModalValue] = useState({ type: '', content: '' });
  const [notificationCount, setNotificationCount] = useState({
    sms: 0,
    email: 0,
    whatsapp: 0,
    push: 0,
  });
  const [apiUrl, SetApiUrl] = useState('');
  const [whatsappData, setWhatsappData] = useState([]);

  const getCount = () => {
    getNotificationCount()
      .then((response) => {
        const countData = get(response, 'data.count', []);

        const smsCount = find(
          countData,
          (value) => value.channel_id === CHANNEL_SMS
        )?.count;
        const whatsappCount = find(
          countData,
          (value) => value.channel_id === CHANNEL_WHATSAPP
        )?.count;
        const emailCount = find(
          countData,
          (value) => value.channel_id === CHANNEL_EMAIL
        )?.count;
        const pushCount = find(
          countData,
          (value) => value.channel_id === CHANNEL_PUSH
        )?.count;
        setNotificationCount({
          sms: smsCount,
          email: emailCount,
          whatsapp: whatsappCount,
          push: pushCount,
        });
      })
      .catch((error) => {
        notification.error(error.message || FAILED_TO_LOAD);
      });
  };

  const fetchData = () => {
    setLoading(true);
    const parameters = { params: { template_type: 'all' } };
    const getApiUrl = get(tenantConfig, 'klAppUrl', '');
    SetApiUrl(getApiUrl);
    getAll(getApiUrl, parameters, {}, 2)
      .then((response) => {
        const templateData = response.data;
        const filteredData =
          templateData &&
          templateData.filter(
            (item) =>
              item.template_name !== 'Tenant_Create' &&
              item.template_name !== 'Forget-Password'
          );

        setTableData(filteredData);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        notification.error({ message: 'Failed to load the data.' });
      });
  };
  const getWhatsappList = () => {
    setLoading(true);
    getWhatsapp()
      .then((response) => {
        const templateData = get(response, 'data');
        setWhatsappData(templateData);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        notification.error({ message: 'Failed to load the data.' });
      });
  };

  useEffect(() => {
    fetchData();
    getCount();
    getWhatsappList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTemplateStatusChange = (checked, templateType, templateId) => {
    setLoading(true);
    const payload = {
      is_enabled: checked,
      template_type: templateType,
      id: templateId,
      app_id: 2,
    };
    update(apiUrl, payload, {}, '/update-status')
      .then(() => {
        fetchData();
        notification.success({
          message: 'Template status updated successfully.',
        });
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(
            error,
            'response.data.message',
            'Failed to update template status.'
          ),
        });
      });
  };

  const handlePreview = (type, content) => {
    setModalVisible(true);
    setModalValue({ type, content });
  };

  const column = [
    {
      title: 'Template Name',
      dataIndex: 'template_name',
    },
    {
      title: 'Campaign Name',
      dataIndex: 'campaign_name',
    },

    {
      title: 'Type',
      dataIndex: 'type',
    },
    {
      title: 'Number of Whatsapp Messages',
      dataIndex: 'no_of_message',
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
    },
  ];

  return (
    <Spin spinning={loading}>
      <div className="box">
        <div className="box-content-background">
          <Tabs defaultActiveKey="list" type="card" className="custom-tabs">
            <TabPane tab="List" key="list">
              <div style={{ marginLeft: '2em', marginRight: '2em' }}>
                <Table className="grid-table" bordered dataSource={tableData}>
                  <Column
                    title="Template Name"
                    dataIndex="template_name"
                    key="template_name"
                  />
                  <ColumnGroup title="WhatsApp">
                    <Column
                      title="Action"
                      align="center"
                      dataIndex="whatsapp_template"
                      key="whatsapp_template"
                      render={(text) => {
                        if (text?.template_name) {
                          if (text?.whatsapp_content) {
                            return (
                              <Space size="middle">
                                <EyeOutlined
                                  style={{ color: 'rgb(12, 99, 99)' }}
                                  onClick={() => {
                                    handlePreview(
                                      'Whatsapp',
                                      text.whatsapp_content
                                    );
                                  }}
                                />
                              </Space>
                            );
                          }
                        }
                        return true;
                      }}
                    />
                    <Column
                      title="Status"
                      align="center"
                      dataIndex="whatsapp_template"
                      key="whatsapp_template"
                      render={(text) => (
                        <div>
                          {text?.whatsapp_content ? (
                            <Switch
                              checked={text.is_enabled}
                              onChange={(checked) =>
                                onTemplateStatusChange(
                                  checked,
                                  'whatsapp',
                                  text.template_id
                                )
                              }
                              size="small"
                            />
                          ) : (
                            ''
                          )}
                        </div>
                      )}
                    />
                  </ColumnGroup>
                  <ColumnGroup title="SMS">
                    <Column
                      title="Action"
                      align="center"
                      dataIndex="sms_template"
                      key="sms_template"
                      render={(text) => {
                        if (text?.template_name) {
                          if (text?.sms_content) {
                            return (
                              <Space size="middle">
                                <EyeOutlined
                                  style={{ color: 'rgb(12, 99, 99)' }}
                                  onClick={() => {
                                    handlePreview('SMS', text.sms_content);
                                  }}
                                />
                              </Space>
                            );
                          }
                        }
                        return true;
                      }}
                    />
                    <Column
                      title="Status"
                      align="center"
                      dataIndex="sms_template"
                      key="sms_template"
                      render={(text) => (
                        <div>
                          {text?.sms_content ? (
                            <Switch
                              checked={text.is_enabled}
                              onChange={(checked) =>
                                onTemplateStatusChange(
                                  checked,
                                  'sms',
                                  text.template_id
                                )
                              }
                              size="small"
                            />
                          ) : (
                            ''
                          )}
                        </div>
                      )}
                    />
                  </ColumnGroup>
                  <ColumnGroup title="Email">
                    <Column
                      title="Action"
                      align="center"
                      dataIndex="email_template"
                      key="email_template"
                      render={(text) => {
                        if (text?.template_name) {
                          if (text?.email_content) {
                            return (
                              <Space size="middle">
                                <EyeOutlined
                                  style={{ color: 'rgb(12, 99, 99)' }}
                                  onClick={() => {
                                    handlePreview('Email', text.email_content);
                                  }}
                                />
                              </Space>
                            );
                          }
                        }
                        return true;
                      }}
                    />
                    <Column
                      title="Status"
                      align="center"
                      dataIndex="email_template"
                      key="email_template"
                      render={(text) => (
                        <div>
                          {text?.email_content ? (
                            <Switch
                              checked={text.is_enabled}
                              onChange={(checked) =>
                                onTemplateStatusChange(
                                  checked,
                                  'email',
                                  text.template_id
                                )
                              }
                              size="small"
                            />
                          ) : null}
                        </div>
                      )}
                    />
                  </ColumnGroup>
                  <ColumnGroup title="Push">
                    <Column
                      title="Action"
                      align="center"
                      key="push_notification_template"
                      render={(text) => {
                        if (
                          text?.push_notification_template?.notification_content
                        ) {
                          return (
                            <Space size="middle">
                              <EyeOutlined
                                style={{ color: 'rgb(12, 99, 99)' }}
                                onClick={() => {
                                  handlePreview(
                                    'Push Notification',
                                    text?.push_notification_template
                                      ?.notification_content
                                  );
                                }}
                              />
                            </Space>
                          );
                        }
                        return true;
                      }}
                    />
                    <Column
                      title="Status"
                      align="center"
                      dataIndex="push_notification_template"
                      key="push_notification_template"
                      render={(text) => (
                        <div>
                          {text?.notification_content ? (
                            <Switch
                              checked={text.is_enabled}
                              onChange={(checked) =>
                                onTemplateStatusChange(
                                  checked,
                                  'push_notification',
                                  text.template_id
                                )
                              }
                              size="small"
                            />
                          ) : null}
                        </div>
                      )}
                    />
                  </ColumnGroup>
                </Table>
                {modalVisible && (
                  <div>
                    <Modal
                      width={500}
                      title={`${modalValue.type} Template view`}
                      visible
                      onOk={() => {
                        setModalVisible(false);
                      }}
                      onCancel={() => {
                        setModalVisible(false);
                      }}
                    >
                      {modalValue.type === 'Email' ? (
                        <p
                          // eslint-disable-next-line react/no-danger
                          dangerouslySetInnerHTML={{
                            __html: modalValue.content,
                          }}
                        />
                      ) : (
                        <span>{modalValue.content}</span>
                      )}
                    </Modal>
                  </div>
                )}
              </div>
            </TabPane>
            <TabPane tab="Summary" key="summary">
              <Tabs defaultActiveKey="sms" type="card" className="custom-tabs">
                <TabPane tab="SMS" key={CHANNEL_SMS}>
                  <div>
                    Number of Messages Sent: {notificationCount.sms || 0}
                  </div>
                </TabPane>
                <TabPane tab="E-mail" key={CHANNEL_EMAIL}>
                  <div>
                    Number of Messages Sent: {notificationCount.email || 0}
                  </div>
                </TabPane>
                <TabPane tab="Whatsapp" key={CHANNEL_WHATSAPP}>
                  <div>
                    Number of Messages Sent: {notificationCount.whatsapp || 0}
                  </div>
                  <div className="mt-10">
                    <Table
                      dataSource={whatsappData}
                      columns={column}
                      loading={loading}
                    />
                  </div>
                </TabPane>
                <TabPane tab="Push Notification" key={CHANNEL_PUSH}>
                  <div>
                    Number of Messages Sent: {notificationCount.push || 0}
                  </div>
                </TabPane>
              </Tabs>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </Spin>
  );
};

export default Notifications;
