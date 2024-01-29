import React, { useState, useEffect, useRef } from 'react';
import {
  Breadcrumb,
  Col,
  DatePicker,
  Empty,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import { notification } from 'antd/lib';
import { get, isEmpty, map } from 'lodash';
import { useParams } from 'react-router-dom';
import { CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Doughnut, Line } from 'react-chartjs-2';
import moment from 'moment';
import { ExcelDownload } from '../../shared/excel';
import {
  downloadImage,
  endDateCondition,
  startDateCondition,
} from '../../shared/function-helper';
import {
  getMessagesStatusCount,
  getMessagesTemplate,
  getMessagesDateWiseCount,
} from '../../utils/api/url-helper';
import { paginationstyler } from '../../shared/attributes-helper';
import {
  CUSTOMIZE_VALUE,
  DATE_WITHOUT_TIME_FORMAT,
  DETAULT_TIME_PERIOD_COUNT,
  DOWNLOAD_EXCEL_FAILED_MESSAGE,
  DOWNLOAD_IMAGE_MENU_ITEM,
  FAILED_TO_LOAD,
  GUPSHUP_PARTNER_TEMPLATE_MESSAGE_TITLE,
  INITIAL_PAGE,
  LAST_WEEK_VALUE,
  MESSAGES_COUNT_LIST,
  MESSAGE_CATEGORY_COUNT_INFO_TEXT,
  MESSAGE_CATEGORY_COUNT_TITLE,
  MESSAGE_DOWNLOAD_FROM_DOUGHNUT,
  MESSAGE_DOWNLOAD_FROM_LINE,
  MESSAGE_DOWNLOAD_FROM_TABLE,
  MESSAGE_STATUS_COUNT_INFO_TEXT,
  MESSAGE_STATUS_COUNT_TITLE,
  ORDER_BY_ASCEND,
  PAGE_LIMIT,
  TABLE_PAGINATE_ACTION,
  TEMPLATE_STATUS_COUNT_INFO_TEXT,
  TEMPLATE_STATUS_COUNT_TITLE,
  selectOptionData,
} from '../../shared/constant-values';
import { ReactComponent as PlansAndWallet } from '../../assets/icons/plan-and-wallet.svg';
import './gupshup.less';
import EmptyData from '../../shared/empty-data';
import MessageStatusCountCard from './message-status-count-card';
import CardExtraContent from './card-extra-content';

const { RangePicker } = DatePicker;

const statusChartData = (value) => ({
  labels: value?.labels,
  datasets: [
    {
      label: 'Sent',
      data: value?.send_count,
      borderColor: 'rgba(145, 202, 255, 1)',
      backgroundColor: 'rgba(145, 202, 255, 1)',
    },
    {
      label: 'Delivered',
      data: value?.delivered_count,
      backgroundColor: 'rgba(183, 235, 143, 1)',
      borderColor: 'rgba(183, 235, 143, 1)',
    },
    {
      label: 'Read',
      data: value?.read_count,
      backgroundColor: 'rgba(255, 223, 144, 1)',
      borderColor: 'rgba(255, 223, 144, 1)',
    },
    {
      label: 'Failed',
      data: value?.failed_count,
      backgroundColor: 'rgba(255, 163, 158, 1)',
      borderColor: 'rgba(255, 163, 158, 1)',
    },
  ],
});

function GupshupMessage() {
  const { appId } = useParams();
  const [loading, setLoading] = useState(false);
  const [statusCount, setStatusCount] = useState({});
  const [categoryCount, setCategoryCount] = useState([]);
  const [statusChart, setStatusChart] = useState({});
  const [templates, setTemplates] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [messageDoughnutData, setMessageDoughnutData] = useState([]);
  const [pagination, setPagination] = useState({
    current: INITIAL_PAGE,
    pageSize: PAGE_LIMIT,
  });
  const [messageStatusCustomized, setMessageStatusCustomized] = useState(false);
  const [filterValue, setFilterValue] = useState(LAST_WEEK_VALUE);
  const messageLineReference = useRef();
  const messageDoughutReference = useRef();

  const handleMessageStatusCount = (data) => {
    const sendCounts = [];
    const readCounts = [];
    const deliverycounts = [];
    const failedCounts = [];
    const labels = [];
    map(data, (item) => {
      if (moment(item?.creation_date).isValid()) {
        labels.push(
          moment(item.creation_date).format(DATE_WITHOUT_TIME_FORMAT)
        );
      }
      sendCounts.push(Number(item?.sent_count));
      readCounts.push(Number(item?.read_count));
      deliverycounts.push(Number(item?.delivered_count));
      failedCounts.push(Number(item?.failed_count));
    });
    if (isEmpty(labels)) {
      setStatusChart({});
    } else {
      setStatusChart({
        labels,
        send_count: sendCounts,
        read_count: readCounts,
        delivered_count: deliverycounts,
        failed_count: failedCounts,
      });
    }
  };

  const fetchData = ({ startDate, endDate }) => {
    setLoading(true);
    const parameter = {
      app_id: appId,
      startDate,
      endDate,
    };
    const apiArray = [
      getMessagesStatusCount(parameter),
      getMessagesTemplate(parameter),
      getMessagesDateWiseCount(parameter),
    ];
    Promise.all(apiArray)
      .then((response) => {
        setStatusCount(get(response, '[0].data.status_count', {}));
        setTemplates(get(response, '[1].data', []));
        setPagination({
          current: INITIAL_PAGE,
          pageSize: PAGE_LIMIT,
        });
        if (
          Number(get(response, '[0].data.category_count.utility_count', 0)) !==
          0
        ) {
          setCategoryCount([
            Number(get(response, '[0].data.category_count.utility_count', 0)),
            Number(get(response, '[0].data.category_count.marketing_count', 0)),
          ]);
          setMessageDoughnutData(get(response, '[0].data.category_count'));
        }
        setLineChartData(get(response, '[2].data', []));
        handleMessageStatusCount(get(response, '[2].data', []));
        setLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error || FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  useEffect(() => {
    const startDate = startDateCondition(
      LAST_WEEK_VALUE,
      DETAULT_TIME_PERIOD_COUNT
    );
    const endDate = endDateCondition(
      LAST_WEEK_VALUE,
      DETAULT_TIME_PERIOD_COUNT
    );
    fetchData({
      startDate,
      endDate,
      pagination: { pageSize: PAGE_LIMIT, current: INITIAL_PAGE },
    });
  }, []);

  useEffect(() => {
    paginationstyler();
  }, [templates]);

  const templateColumns = [
    {
      title: 'Temaplate Name',
      dataIndex: 'template_name',
      key: 'template_name',
      ellipsis: true,
      sorter: true,
      width: 250,
      render: (text, row) => (
        <div style={{ color: 'black' }} className="product-name">
          {get(row, 'template_details[0].template_name', '')}
        </div>
      ),
    },
    {
      title: 'Sent',
      dataIndex: 'sent_count',
      key: 'sent_count',
      align: 'center',
      render: (text) => <span className="text-grey-light">{text}</span>,
    },
    {
      title: 'Delivered',
      dataIndex: 'delivered_count',
      key: 'delivered_count',
      align: 'center',
      render: (text) => <span className="text-grey-light">{text}</span>,
    },
    {
      title: 'Read',
      dataIndex: 'read_count',
      key: 'read_count',
      align: 'center',
      render: (text) => <span className="text-grey-light">{text}</span>,
    },
    {
      title: 'Failed',
      dataIndex: 'failed_count',
      key: 'failed_count',
      align: 'center',
      render: (text) => <span className="text-grey-light">{text}</span>,
    },
    {
      title: 'Read Rate (in %)',
      dataIndex: 'read_rate',
      key: 'read_rate',
      align: 'center',
      render: (text) => (
        <span className="text-grey-light">{`${Number(text)}`}</span>
      ),
    },
  ];

  const doughnutChartData = {
    labels: ['Utility (UC)', 'Marketing (MC)'],
    datasets: [
      {
        label: 'category',
        data: categoryCount,
        backgroundColor: ['#0B3D60', '#C8BFE7'],
        borderColor: ['#FFFFFF'],
        borderWidth: 3,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      tooltip: {
        enabled: true,
      },
      legend: {
        display: true,
        position: 'left',
        labels: {
          font: {
            size: 14,
          },
        },
      },
    },
  };

  const statusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',
        labels: statusChart?.labels,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleOnselectChange = (value, data) => {
    setFilterValue(value);
    if (value === CUSTOMIZE_VALUE) {
      setMessageStatusCustomized(true);
    } else {
      const startDate = startDateCondition(value, data);
      const endDate = endDateCondition(value, data);
      setCategoryCount([]);
      setStatusChart({});
      fetchData({ startDate, endDate });
    }
  };

  const handleClickCloseIcon = () => {
    setMessageStatusCustomized(false);
    handleOnselectChange(LAST_WEEK_VALUE, DETAULT_TIME_PERIOD_COUNT);
  };

  const sortTemplateData = (sortedInfo) => {
    if (!sortedInfo) return templates;
    const { columnKey, order } = sortedInfo;
    return templates.sort((a, b) => {
      if (order === ORDER_BY_ASCEND) {
        return a[columnKey] > b[columnKey] ? 1 : -1;
      }
      return a[columnKey] < b[columnKey] ? 1 : -1;
    });
  };

  const handleTableChange = (paginationAlias, filters, sorter, { action }) => {
    if (action === TABLE_PAGINATE_ACTION) {
      const { current, pageSize } = paginationAlias;
      setPagination({
        current,
        pageSize,
      });
    } else {
      setPagination({
        current: INITIAL_PAGE,
        pageSize: PAGE_LIMIT,
      });
      setTemplates(sortTemplateData(sorter));
    }
  };

  const downloadTableToExcel = async () => {
    if (templates.length > 0) {
      const downloadData = [];
      templates.map((item) => {
        return downloadData.push({
          'Template Name': get(item, 'template_details[0].template_name', ''),
          'Sent Count': Number(item?.sent_count),
          'Delivered Count': Number(item?.delivered_count),
          'Read Count': Number(item?.read_count),
          'Failed Count': Number(item?.failed_count),
          'Read Rate (in %)': Number(item?.read_rate),
        });
      });
      ExcelDownload(downloadData, 'Tempalte Message');
    } else {
      notification.error({ message: DOWNLOAD_EXCEL_FAILED_MESSAGE });
    }
  };

  const downloadLineToExcel = async () => {
    if (lineChartData.length > 0) {
      const downloadData = [];
      map(lineChartData, (item) => {
        downloadData.push({
          Date: moment(item?.creation_date).isValid()
            ? moment(item.creation_date).format(DATE_WITHOUT_TIME_FORMAT)
            : '',
          'Sent Count': Number(item?.sent_count),
          'Delivered Count': Number(item?.delivered_count),
          'Read Count': Number(item?.read_count),
          'Failed Count': Number(item?.failed_count),
        });
      });
      ExcelDownload(downloadData, 'Message Count');
    } else {
      notification.error({ message: DOWNLOAD_EXCEL_FAILED_MESSAGE });
    }
  };

  const downloadDoughnutToExcel = async () => {
    if (isEmpty(messageDoughnutData)) {
      notification.error({ message: DOWNLOAD_EXCEL_FAILED_MESSAGE });
    } else {
      const downloadData = [
        {
          'Utility (UC)': messageDoughnutData.utility_count,
          'Marketing (MC)': messageDoughnutData.marketing_count,
        },
      ];
      ExcelDownload(downloadData, 'Conversation Count by Category');
    }
  };

  const downloadChart = ({ ref, from, name, isLine }) => {
    if (from === DOWNLOAD_IMAGE_MENU_ITEM) {
      return downloadImage({
        ref,
        name: `${name}.png`,
      });
    }
    if (isLine) return downloadLineToExcel();
    return downloadDoughnutToExcel();
  };

  const handleDownload = (from, downloadfrom) => {
    switch (from) {
      case MESSAGE_DOWNLOAD_FROM_LINE: {
        downloadChart({
          ref: messageLineReference,
          from: downloadfrom,
          name: 'Message Count',
          isLine: true,
        });
        break;
      }
      case MESSAGE_DOWNLOAD_FROM_DOUGHNUT: {
        downloadChart({
          ref: messageDoughutReference,
          from: downloadfrom,
          name: 'Conversation Count by Category',
          isLine: false,
        });
        break;
      }
      case MESSAGE_DOWNLOAD_FROM_TABLE: {
        downloadTableToExcel();
        break;
      }
      default: {
        break;
      }
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="template-message-list-main-container">
        <div className="flex-bwn mt-10">
          <Breadcrumb>
            <Breadcrumb.Item>
              <h1>
                <PlansAndWallet /> {GUPSHUP_PARTNER_TEMPLATE_MESSAGE_TITLE}
              </h1>
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="float-right date-filltr-container">
            {messageStatusCustomized === false ? (
              <Select
                defaultValue={LAST_WEEK_VALUE}
                className="select-common-cls"
                virtual={false}
                value={filterValue}
                onChange={handleOnselectChange}
                options={selectOptionData}
              />
            ) : (
              <div className="button">
                <RangePicker
                  format="DD-MM-YYYY"
                  onChange={(date) => handleOnselectChange('customized', date)}
                />
                &nbsp;&nbsp;
                <CloseOutlined onClick={handleClickCloseIcon} />
              </div>
            )}
          </div>
        </div>
        <div className="message-list-container">
          <Row>
            {MESSAGES_COUNT_LIST.map((item) => {
              return (
                <Col span={6} key={item.key}>
                  <MessageStatusCountCard
                    loading={loading}
                    metaData={item}
                    value={statusCount}
                  />
                </Col>
              );
            })}
          </Row>
        </div>
        <div className="template-table-container">
          <div className="flex-bwn">
            <div className="title">{TEMPLATE_STATUS_COUNT_TITLE}</div>
            <div>
              <Space>
                <Tooltip title={TEMPLATE_STATUS_COUNT_INFO_TEXT}>
                  <InfoCircleOutlined className="cursor-pointer" />
                </Tooltip>
                <CardExtraContent
                  from={MESSAGE_DOWNLOAD_FROM_TABLE}
                  handleDownload={handleDownload}
                  isImage={false}
                />
              </Space>
            </div>
          </div>
          <div className="mt-10">
            <Table
              className="grid-table product-grid-table product-table"
              columns={templateColumns}
              dataSource={templates}
              pagination={pagination}
              onChange={handleTableChange}
              locale={{
                emptyText: <EmptyData value="6%" />,
              }}
            />
          </div>
        </div>
        {statusChart && (
          <Row>
            <Col span={12}>
              <div className="line-chart-container">
                <div className="flex-bwn">
                  <div className="title">{MESSAGE_STATUS_COUNT_TITLE}</div>
                  <div>
                    <Space>
                      <Tooltip title={MESSAGE_STATUS_COUNT_INFO_TEXT}>
                        <InfoCircleOutlined className="cursor-pointer" />
                      </Tooltip>
                      <CardExtraContent
                        isImage
                        from={MESSAGE_DOWNLOAD_FROM_LINE}
                        handleDownload={handleDownload}
                      />
                    </Space>
                  </div>
                </div>
                <div
                  className={
                    isEmpty(statusChart)
                      ? 'message-no-count-container'
                      : 'message-count-container'
                  }
                >
                  {isEmpty(statusChart) ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ padding: '16%' }}
                    />
                  ) : (
                    <Line
                      ref={messageLineReference}
                      data={statusChartData(statusChart)}
                      options={statusOptions}
                    />
                  )}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="category-list-contianer">
                <div className="flex-bwn mb-10">
                  <div className="title">{MESSAGE_CATEGORY_COUNT_TITLE}</div>
                  <div>
                    <Space>
                      <Tooltip title={MESSAGE_CATEGORY_COUNT_INFO_TEXT}>
                        <InfoCircleOutlined className="cursor-pointer" />
                      </Tooltip>
                      <CardExtraContent
                        isImage
                        from={MESSAGE_DOWNLOAD_FROM_DOUGHNUT}
                        handleDownload={handleDownload}
                      />
                    </Space>
                  </div>
                </div>

                <div className="bar-doughnut">
                  {isEmpty(categoryCount) ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ padding: '16%' }}
                    />
                  ) : (
                    <Doughnut
                      ref={messageDoughutReference}
                      data={doughnutChartData}
                      options={doughnutChartOptions}
                    />
                  )}
                </div>
              </div>
            </Col>
          </Row>
        )}
      </div>
    </Spin>
  );
}

export default GupshupMessage;
