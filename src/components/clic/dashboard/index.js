import React, { useEffect, useState } from 'react';
import {
  Space,
  Breadcrumb,
  Select,
  Col,
  Row,
  List,
  Avatar,
  Divider,
  notification,
  DatePicker,
  Tooltip,
} from 'antd';
import './clic-dashboard.less';
import { get, map } from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import moment from 'moment';
import {
  AVERAGE_TIME_OF_CONVERT_TITLE,
  COMMENTED_POSTS,
  DASHBOARD_BREAD_TITLE,
  FILTER_VALUES,
  IN_ENQUIR_VALUE,
  IN_WHATSAPP_VALUE,
  NUMBER_OF_ENQUIRING,
  NUMBER_OF_MESSAGES_TITLE,
  NUMBER_OF_POSTS_TITLE,
  NUMBER_OF_VISITORS,
  STAGES_OF_LEADS_TITLE,
  TOP_ENQUIRE_PRODUCTS_TITLE,
  TOP_PRODUCTS_TITLE,
  ALL,
  TODAY,
  YESTERDAY,
  CUSTOM,
} from '../../../shared/constant-values';
import { ReactComponent as InstagramIcon } from '../../../assets/icons/instagram-icon.svg';
import { ReactComponent as FacebookIcon } from '../../../assets/icons/facebook-logo.svg';
import { ReactComponent as WhatsappIcon } from '../../../assets/icons/whatsapp-logo.svg';
import {
  getEnquiryCount,
  getTopEnquireProducts,
  getTopProducts,
} from '../../../utils/api/url-helper';
import { defaultImage } from '../../../shared/image-helper';

const { RangePicker } = DatePicker;

const ClicDashboard = () => {
  const [topEnquirProduct, setTopEnquirProduct] = useState([]);
  const [topProduct, setTopProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateValues, setDateValues] = useState({ startDate: '', endDate: '' });
  const [selectedFilterDate, setSelectedFilterDate] = useState(ALL);
  const [enquiryAgainstProduct, setEnquiryAgainstProduct] = useState();

  const numberOfMessages = [
    {
      lable: 'Whatsapp',
      icon: <WhatsappIcon round />,
      count: '0',
      color: '#29B53F',
    },
    {
      lable: 'Facebook',
      icon: <FacebookIcon />,
      count: '0',
      color: '#039BE5',
    },
    {
      lable: 'Instagram',
      icon: <InstagramIcon />,
      count: '0',
      color: '#6D45D3',
    },
  ];

  const stagesLeads = [
    { lable: 'New', value: '0' },
    { lable: 'Discarded', value: '0' },
    { lable: 'Converted', value: '0' },
  ];

  const handleDateFilter = (value) => {
    setSelectedFilterDate(value);
    if (value === TODAY) {
      setDateValues({
        startDate: moment().startOf('day').format(),
        endDate: moment().endOf('day').format(),
      });
    } else if (value === YESTERDAY) {
      setDateValues({
        startDate: moment().startOf('day').subtract(1, 'days').format(),
        endDate: moment().subtract(1, 'days').endOf('day').format(),
      });
    } else if (value === ALL) {
      setDateValues({ startDate: '', endDate: '' });
    }
  };

  const handleCustomDateFilter = (date) => {
    if (date) {
      setDateValues({
        startDate: moment(get(date, '[0]', '')).isValid()
          ? moment(get(date, '[0]', '')).startOf('day').format()
          : '',
        endDate: moment(get(date, '[1]', '')).isValid()
          ? moment(get(date, '[1]', '')).startOf('day').format()
          : '',
      });
    }
  };

  useEffect(() => {
    setLoading(true);
    let parameters = {};
    if (dateValues.startDate || dateValues.endDate)
      parameters = { ...dateValues };
    Promise.all([
      getTopEnquireProducts(parameters),
      getTopProducts(parameters),
      getEnquiryCount(parameters),
    ])
      .then((resp) => {
        setTopEnquirProduct(get(resp, '[0].data', []));
        setTopProduct(get(resp, '[1].data', []));
        setEnquiryAgainstProduct(get(resp, '[2].data', []));
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: error.message || 'Failed to fetch data',
        });
      });
  }, [selectedFilterDate, dateValues]);

  const renderProductName = (item) => {
    return (
      <>
        {get(item, 'product_name', '').length > 150 ? (
          <Tooltip placement="bottom" title={get(item, 'product_name', '')}>
            <div className="product-name product-name-len">
              {get(item, 'product_name', '')}
            </div>
          </Tooltip>
        ) : (
          <div className="product-name">{get(item, 'product_name', '')}</div>
        )}
      </>
    );
  };

  return (
    <div className="clic-dashboard-container">
      <div className="dashboard-title-container">
        <div>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>{DASHBOARD_BREAD_TITLE}</Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="mt-20 flex">
          <Select
            onChange={handleDateFilter}
            virtual={false}
            className="dashboard-select"
            defaultValue={selectedFilterDate}
            options={FILTER_VALUES}
          />
          {selectedFilterDate === CUSTOM && (
            <div className="ml-10">
              <RangePicker
                format="DD-MM-YYYY"
                onChange={handleCustomDateFilter}
              />
            </div>
          )}
        </div>
      </div>
      <div className="mt-20 dashboard-details-container">
        <Row>
          <Col span={7}>
            <div className="enquiry-container">
              <div className="top-enquiry-product-title">
                {TOP_ENQUIRE_PRODUCTS_TITLE}
              </div>
              <div id='id="top-enquiry"' className="top-enquiry-list-container">
                <InfiniteScroll
                  dataLength={topEnquirProduct?.length || 0}
                  // next={loadMoreData}
                  // hasMore={products?.length < totalProductCount}
                  // loader={
                  //   <Loader loading={ProductListLoad} height={50} width={50} />
                  // }
                  scrollableTarget="top-enquiry"
                >
                  <List
                    dataSource={topEnquirProduct}
                    loading={loading}
                    renderItem={(item) => {
                      return (
                        <>
                          <List.Item>
                            <div className="enquiry-item-container">
                              <div className="flex-bwn">
                                <Avatar
                                  src={
                                    item.product_image
                                      ? item.product_image
                                      : defaultImage
                                  }
                                  size={25}
                                />
                                {renderProductName(item)}
                              </div>
                            </div>
                          </List.Item>
                          <Divider />
                        </>
                      );
                    }}
                  />
                </InfiniteScroll>
              </div>
            </div>
          </Col>
          <Col span={10}>
            <Row style={{ marginTop: '0px' }}>
              <Col span={12}>
                <div className="visitor-container">
                  <div className="visitor-title">{NUMBER_OF_VISITORS}</div>
                  <div className="count-container">
                    <div className="display-value">0</div>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="visitor-container">
                  <div className="visitor-title">{COMMENTED_POSTS}</div>
                  <div className="count-container">
                    <div className="display-value">0</div>
                  </div>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <div className="number-enquiry-container">
                  <div className="enquiry-title ">{NUMBER_OF_ENQUIRING}</div>
                  <div className="flex-bwn">
                    <div className="count-container">
                      {enquiryAgainstProduct || 0}
                    </div>
                    <div className="flex-end algin-self-end ml-10 info-text">
                      Against Product
                    </div>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="number-enquiry-container">
                  <div className="enquiry-title ">{NUMBER_OF_ENQUIRING}</div>
                  <div className="flex-bwn">
                    <div className="count-container">0</div>
                    <div className="flex-end algin-self-end ml-10 info-text">
                      In Whatsapp
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
          <Col span={7}>
            <div className="top-product-container">
              <div className="top-product-title">{TOP_PRODUCTS_TITLE}</div>
              <div id='id="top-enquiry"' className="top-product-list-container">
                <InfiniteScroll
                  dataLength={topEnquirProduct?.length || 0}
                  // next={loadMoreData}
                  // hasMore={products?.length < totalProductCount}
                  // loader={
                  //   <Loader loading={ProductListLoad} height={50} width={50} />
                  // }
                  scrollableTarget="top-enquiry"
                >
                  <List
                    dataSource={topProduct}
                    loading={loading}
                    renderItem={(item) => {
                      return (
                        <>
                          <List.Item>
                            <div className="product-item-container">
                              <div className="flex-bwn">
                                <Avatar
                                  src={
                                    item.product_image
                                      ? item.product_image
                                      : defaultImage
                                  }
                                  size={25}
                                />
                                {renderProductName(item)}
                              </div>
                            </div>
                          </List.Item>
                          <Divider />
                        </>
                      );
                    }}
                  />
                </InfiniteScroll>
              </div>
            </div>
          </Col>
        </Row>
        <div className="mt-10">
          <Row>
            <Col span={7}>
              <div className="number-message-container">
                <div className="title">{NUMBER_OF_MESSAGES_TITLE}</div>
                {map(numberOfMessages, (item) => {
                  return (
                    <div className="p-10">
                      <div className="flex-bwn">
                        <div className="flex">
                          {item?.icon}
                          <div className="media-name-title">{item.lable}</div>
                        </div>
                        <div style={{ color: item.color, fontSize: '20px' }}>
                          {item.count}
                        </div>
                      </div>
                      <Divider
                        style={{ borderTop: `2px solid ${item.color}` }}
                      />
                    </div>
                  );
                })}
              </div>
            </Col>
            <Col span={8}>
              <div className="stage-leads-container">
                <div className="title">{STAGES_OF_LEADS_TITLE}</div>
                {map(stagesLeads, (item) => {
                  return (
                    <div className="p-10 mt-10 leads-item-container">
                      <div className="flex-bwn">
                        <div className="media-name-title">{item.lable}</div>
                        <div className="display-value">{item.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Col>
            <Col span={9}>
              <Row style={{ marginTop: '0px' }}>
                <Col span={12}>
                  <div className="number-times-container">
                    <div className="title">{AVERAGE_TIME_OF_CONVERT_TITLE}</div>
                    <div className="flex-bwn">
                      <div className="count-container">0</div>
                      <div className="flex-end algin-self-end ml-10 info-text">
                        {IN_ENQUIR_VALUE}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="number-times-container">
                    <div className="title">{AVERAGE_TIME_OF_CONVERT_TITLE}</div>
                    <div className="flex-bwn">
                      <div className="count-container">0</div>
                      <div className="flex-end algin-self-end ml-10 info-text">
                        {IN_WHATSAPP_VALUE}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <div className="number-post-container">
                    <div className="title ">{NUMBER_OF_POSTS_TITLE}</div>
                    <div className="flex mt-20">
                      <InstagramIcon />
                      <div className="ml-10 display-value">0</div>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="number-post-container">
                    <div className="title ">{NUMBER_OF_POSTS_TITLE}</div>
                    <div className="flex mt-20">
                      <FacebookIcon />
                      <div className="ml-10 display-value">0</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default ClicDashboard;
