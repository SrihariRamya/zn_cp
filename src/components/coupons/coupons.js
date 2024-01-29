import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
} from 'react';
import {
  Breadcrumb,
  Button,
  Input,
  notification,
  Space,
  Tag,
  Typography,
  Switch,
  Avatar,
  Tooltip,
  Modal,
  Row,
  Col,
  List,
  Card,
  Divider,
  Pagination,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import './coupon.less';
import moment from 'moment';
import { useLocation, useNavigate } from 'react-router-dom';
import { get, debounce, map, isNaN, isNull, isEmpty } from 'lodash';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import {
  FAILED_TO_LOAD,
  COUPON_DELETE_SUCCESS,
  COUPON_DELETE_FAILED,
  COUPON_ADD_SUCCESS,
  COUPON_UPDATE_SUCCESS,
  INITIAL_PAGE,
  CURRENCY_LANGUAGE,
  CURRENCY_TYPE,
} from '../../shared/constant-values';
import { handleUrlChanges } from '../../shared/common-url-helper';
import Create from './add-coupon';
import { TenantContext } from '../context/tenant-context';
import { ReactComponent as CouponLogo } from '../../assets/icons/coupon-logo.svg';
import { ReactComponent as EditIcon } from '../../assets/images/edit-icon.svg';
import { ReactComponent as DeleteIcon } from '../../assets/images/delete-icon.svg';
import { ReactComponent as DefaultCouponIcon } from '../../assets/icons/default-coupon-icon.svg';
import {
  getAllCoupons,
  deleteCoupon,
  updateCouponStatus,
  putOnboardSubGuide,
  fetchProductList,
} from '../../utils/api/url-helper';
import {
  DeleteAlert,
  DeleteAlertAssociated,
  DeleteAlertImage,
  DeleteAlertMessage,
} from '../../shared/sweetalert-helper';
import { paginationstyler } from '../../shared/attributes-helper';
import {
  disableTabEnterKey,
  enableTabEnterKey,
  couponTypes,
} from '../../shared/function-helper';
import { ReactComponent as CouponIcon } from '../../assets/icons/coupon-success.svg';
import { MilestoneContext } from '../context/milestone-context';
import { ReactComponent as CouponBackground } from '../../assets/ModalTourBackground/couponBackground.svg';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Coupons(properties) {
  const history = useNavigate();
  const canWrite = get(properties, 'roleData.can_write', false);
  const mobileView = useContext(TenantContext)[4];

  const { Text } = Typography;
  const [openTourModal, setOpenTourModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const [couponData, setCouponData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [tenantDetails] = useContext(TenantContext);
  const [pagination, setPagination] = useState({
    current: INITIAL_PAGE,
    pageSize: 12,
  });
  const [searchText, setSearchText] = useState('');
  const [tableChange, setTableChange] = useState(false);
  const [couponType, setCouponType] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [isCouponTypesVisible, setIsCouponTypesVisible] = useState(false);
  const [couponValidity, setCouponValidity] = useState('');
  const [couponTypeId, setCouponTypeId] = useState('');
  const [existCouponProducts, setExistCouponProducts] = useState([]);
  const [productItems, setProductItems] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileListState, setFileList] = useState([]);
  const firstUpdate = useRef(true);
  const query = useQuery();
  const currentPage = query.get('page');
  const moduleName = 'coupons';
  const firstPage = INITIAL_PAGE;
  const couponFilter = {};
  const couponSorter = {};
  const { fetchTourData } = useContext(MilestoneContext);
  const [completeModal, setCompleteModal] = useState(false);

  useEffect(() => {
    fetchProductList()
      .then(async (response) => {
        const tourDataValues = await fetchTourData();
        const couponDataValues = get(tourDataValues, 'data.[5]');
        const couponTourDatas = get(couponDataValues, 'subGuide.[0]');
        const couponTourCompleted = get(couponTourDatas, 'completed');
        if (couponTourCompleted === false && !mobileView) {
          setIsVisible(true);
          setCouponType('amount-cut-off');
        }
        setProductItems(get(response, 'data.products', []));
        setCategoryItems(get(response, 'data.categories', []));
      })
      .catch((error) => {
        notification.error({ message: error?.error || FAILED_TO_LOAD });
      });
  }, []);

  useEffect(() => {
    if (openTourModal) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [openTourModal]);

  useEffect(() => {
    if (!isVisible && !openTourModal) {
      document.body.style.overflow = 'auto';
    }
  }, [isVisible, openTourModal]);

  useEffect(() => {
    if (openTourModal) {
      disableTabEnterKey();
    } else {
      enableTabEnterKey();
    }
  }, [openTourModal]);

  const fetchCouponData = async (parameters = {}) => {
    setLoading(true);
    const {
      pagination: { current, pageSize },
      searchWord,
    } = parameters;
    const queryParameter = {
      limit: pageSize,
      offset: current,
      sorter: JSON.stringify(couponSorter),
      filters: JSON.stringify(couponFilter),
    };
    if (searchWord) {
      queryParameter.searchWord = searchWord;
    }
    if (couponFilter.expiry_date) {
      queryParameter.creationDate = true;
    }
    queryParameter.firstTableParams = 'zm_coupon';
    const apiArray = [getAllCoupons(queryParameter)];
    Promise.all(apiArray)
      .then((response) => {
        setCouponData(get(response, '[0]data.rows', []));
        setPagination({
          ...parameters.pagination,
          total: get(response, '[0]data.count', 0),
        });
        setLoading(false);
        setTableChange(false);
      })
      .catch(() => {
        setTableChange(false);
        notification.error({ message: FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  const handleOk = () => {
    setSearchText('');
    fetchCouponData({ pagination });
    setIsVisible(false);
    setIsEditVisible(false);
    setUpdatedData({});
    putOnboardSubGuide({
      completed: true,
      slug: 'coupon',
    });
    setOpenTourModal(false);
  };

  const fetchData = useCallback(
    (parameters) => {
      fetchCouponData(parameters || { pagination });
    },
    [pagination]
  );

  const handleCancel = () => {
    setIsVisible(false);
    setIsEditVisible(false);
    setUpdatedData({});
    setOpenTourModal(false);
    setCouponDiscount('');
    setCouponValidity('');
  };

  const showModal = () => {
    setIsCouponTypesVisible(true);
  };

  const handleEdit = (event, key) => {
    setUpdatedData(key);
    setCouponType(get(key, 'coupon_type', ''));
    setExistCouponProducts(
      get(key, 'coupon_products', []).map((item) => item.product_coupon_uid)
    );
    setCouponDiscount(get(key, 'coupon_discount_type', ''));
    setCouponValidity(get(key, 'coupon_validity', ''));
    setIsVisible(true);
    setIsEditVisible(true);
  };

  const handleTableChange = (paginationAlias) => {
    handleUrlChanges(paginationAlias, history, moduleName);
    fetchCouponData({
      pagination: { pageSize: 12, current: paginationAlias },
    });
  };

  useEffect(() => {
    if (Object.keys(couponSorter).length > 0) {
      fetchCouponData({
        pagination: { pageSize: 12, current: INITIAL_PAGE },
        searchWord: searchText,
      });
    }
  }, [couponSorter]);

  const paginationFetch = (current, currentPageValue) => {
    if (couponData.length === 1 && current > 1) {
      handleTableChange({ current: currentPageValue, pageSize: 12 });
    } else {
      fetchCouponData({
        pagination: { ...pagination, current: currentPageValue },
      });
    }
  };

  const couponHardDelete = async (id, current, currentPageValue) => {
    const title = 'This Coupon is associated with order';
    const text = 'Are you sure? you want to delete this coupon from the list?';
    const result = await DeleteAlertAssociated(title, text);
    if (result.isConfirmed) {
      setLoading(true);
      deleteCoupon(id, { forceDelete: true }).then(() => {
        setLoading(false);
        DeleteAlertImage(COUPON_DELETE_SUCCESS);
        paginationFetch(current, currentPageValue);
      });
    } else {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (event, key) => {
    const text = 'Are you sure you want to delete this coupon from the list?';
    const result = await DeleteAlert(text, event);
    if (result.isConfirmed) {
      const { current } = pagination;
      const currentPageValue =
        couponData.length === 1 && current > 1 ? current - 1 : current;
      try {
        const response = await deleteCoupon(key?.coupon_id);
        if (response.success) {
          DeleteAlertImage(COUPON_DELETE_SUCCESS);
        }
        paginationFetch(current, currentPageValue);
      } catch (error) {
        let parsedResponse = {};
        try {
          parsedResponse = await error.json();
        } catch {
          parsedResponse = error;
        }
        if (get(parsedResponse, 'message', '') === 'Coupon/Order Associated') {
          await couponHardDelete(key?.coupon_id, current, currentPageValue);
        } else {
          setLoading(false);
          DeleteAlertMessage({ title: COUPON_DELETE_FAILED, icon: 'error' });
        }
      }
    }
  };

  useEffect(() => {
    const current = isNaN(currentPage) ? false : Number(currentPage);
    const newPagination = {
      ...pagination,
      ...(current && { current }),
    };

    if (!tableChange && !firstUpdate.current) {
      const addPagination = currentPage
        ? newPagination
        : { ...pagination, current: INITIAL_PAGE };

      fetchCouponData({
        pagination: addPagination,
        searchWord: searchText,
      });
    }
    if (firstUpdate.current) {
      firstUpdate.current = false;
      const parameters = current
        ? { pagination: newPagination, searchWord: searchText || '' }
        : false;
      fetchData(parameters);
    }
  }, [currentPage]);

  const couponSearchDebounce = debounce((value) => {
    setTableChange(true);
    handleUrlChanges(firstPage, history, moduleName);
    fetchCouponData({
      pagination: { pageSize: 12, current: INITIAL_PAGE },
      searchWord: value,
    });
  }, 1000);

  const couponSearch = (value) => {
    setSearchText(value || '');
    couponSearchDebounce(value);
  };

  const statusUpdate = debounce((status, data) => {
    const { coupon_uid: id } = data;
    updateCouponStatus(id, { status })
      .then((response) => {
        if (get(response, 'success', false)) {
          notification.success({
            message: 'Coupon status updated successfully',
          });
          fetchData();
        }
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: error.message || 'Failed to update coupon status',
        });
      });
  }, 500);

  const couponStatus = (status, data) => {
    setLoading(true);
    statusUpdate(status, data);
  };

  const onChangeCouponType = (type, id) => {
    setIsVisible(true);
    setIsCouponTypesVisible(false);
    setCouponType(type);
    setCouponTypeId(id);
  };

  const handleCloseModal = () => {
    setIsCouponTypesVisible(false);
    setIsVisible(false);
    setIsEditVisible(false);
    setUpdatedData({});
    setOpenTourModal(false);
    setFileList([]);
  };

  useEffect(() => {
    paginationstyler();
  }, [couponData]);

  const couponTypeMap = {
    'amount-cut-off': `
    ${isEditVisible ? 'Edit' : 'Add'} order discount coupon`,
    'coupon-on-specific': `${
      isEditVisible ? 'Edit' : 'Add'
    } discount on product / category coupon`,
    'free-shipping': 'Free shipping coupon',
  };

  const couponDiscountType = {
    'amount-cut-off': `Order Discount coupon`,
    'coupon-on-specific': 'Discount on product / category ',
    'free-shipping': 'Free shipping',
  };

  const couponProperties = {
    couponTypeTitle: couponTypeMap[couponType] || '',
    couponType,
    couponTypeId,
    couponDiscount,
    couponValidity,
    existCouponProducts,
    setExistCouponProducts,
    setCouponDiscount,
    setCouponValidity,
    setIsVisible,
    productItems,
    categoryItems,
    isModalOpen,
    setIsModalOpen,
    fileListState,
    setFileList,
    completeModal,
    setCompleteModal,
  };

  const addCouponButton = () => {
    return (
      <div className="coupons-add-btn-div coupons-add-btn">
        <Button
          id="add-coupon"
          type="primary"
          onClick={showModal}
          hidden={!canWrite}
        >
          <PlusOutlined />
          Create coupon
        </Button>
      </div>
    );
  };

  const emptyTableData = () => {
    return (
      <>
        <DefaultCouponIcon />
        <div className="mt-20p">
          <Text className="default-coupon-text"> No Coupons Yet !</Text>
        </div>
        <div className="mb-20">
          <Text className="coupon-msg">
            &ldquo;Use coupon to offer discounts to your customers&ldquo;
          </Text>
        </div>
        {addCouponButton()}
      </>
    );
  };
  const handleClose = () => {
    setIsModalOpen(false);
  };

  const cancelModal = () => {
    setCompleteModal(false);
  };

  return (
    <>
      {!isVisible && (
        <>
          <div className="search-container">
            <div>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Space className="coupon-title">
                    <CouponLogo />
                    <Text>Coupons</Text>
                  </Space>
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <div className="coupons-search-div box-seller-table">
              <Input
                allowClear
                placeholder="Search by coupon code"
                className="custom-search coupon-search"
                value={searchText}
                onChange={(event_) => couponSearch(event_.target.value)}
                suffix={<SearchOutlined className="site-form-item-icon" />}
              />
            </div>
            {addCouponButton()}
          </div>
          <div className="coupon-table">
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 1,
                md: 1,
                lg: 1,
                xl: 3,
                xxl: 3,
              }}
              loading={loading}
              dataSource={couponData}
              locale={{
                emptyText: emptyTableData(),
              }}
              renderItem={(item) => {
                const expiryDate = moment(
                  get(item, 'expiry_date', ''),
                  'YYYY-MM-DD'
                );
                const daysLeft = expiryDate.diff(
                  moment().format('YYYY-MM-DD'),
                  'days'
                );
                const userCouponCount = get(item, 'user_coupon_count', 0);
                const salesTillData = item?.sales_till_data;
                const couponImage = get(item, 'image', '');
                return (
                  <List.Item>
                    <Card className="custom-coupon-card" bordered={false}>
                      <>
                        <Row>
                          <Col span={2}>
                            {isEmpty(couponImage) ? (
                              <CouponLogo />
                            ) : (
                              <Avatar
                                shape="square"
                                size={30}
                                src={couponImage}
                              />
                            )}
                          </Col>
                          <Col span={9}>
                            <Text className="coupon-heading">
                              {item?.coupon_code}
                            </Text>
                          </Col>
                          <Col span={5}>
                            <Switch
                              className="switch-container"
                              onClick={(event) => couponStatus(event, item)}
                              checked={get(item, 'is_active', false)}
                            />
                          </Col>
                          <Col span={3} />
                          <Col span={2} className="b-6p">
                            <Tag
                              className="delete-coupon-icon"
                              onClick={(event) => handleEdit(event, item)}
                            >
                              <Tooltip title="Edit">
                                <EditIcon />
                              </Tooltip>
                            </Tag>
                          </Col>
                          {/* <Col span={3} className="share-col b-6p">
                            <Popover
                              overlayClassName="share-popover"
                              trigger="click"
                              content={
                                <SocialShare
                                  url={`${get(
                                    tenantDetails,
                                    'customer_url',
                                    ''
                                  )}`}
                                  name={get(item, 'coupon_type', '')}
                                  image_url={get(item, 'image', '')}
                                  description={get(item, 'description', '')}
                                  adminEvent={adminEvent}
                                />
                              }
                              placement="bottom"
                            >
                              <Tooltip title="Social Share">
                                <Tag className="delete-coupon-icon">
                                  <ShareIcon />
                                </Tag>
                              </Tooltip>
                            </Popover>
                          </Col> */}
                          <Col span={2} className="b-6p">
                            <Tag
                              className="delete-coupon-icon"
                              onClick={(event) =>
                                handleDeleteCoupon(event, item)
                              }
                            >
                              <Tooltip title="Delete">
                                <DeleteIcon />
                              </Tooltip>
                            </Tag>
                          </Col>
                        </Row>
                        <Row>
                          <Text className="coupon-typography">
                            {couponDiscountType[item?.coupon_type]}
                          </Text>
                        </Row>
                        <Row className="coupon-time">
                          <Text className="coupon-typography grey-text">
                            <span
                              className={`${
                                daysLeft > 0 ? 'grey-text' : 'red-clr'
                              }`}
                            >
                              {daysLeft > 0
                                ? `${daysLeft} days left |`
                                : 'Expired'}{' '}
                            </span>{' '}
                            Start date :{' '}
                            {moment(item?.start_date).format(
                              get(
                                tenantDetails,
                                'setting.date_format',
                                'DD-MM-YYYY hh:mm'
                              )
                            )}{' '}
                            | End date :{' '}
                            {moment(item?.expiry_date).isValid()
                              ? moment(item?.expiry_date).format(
                                  get(
                                    tenantDetails,
                                    'setting.date_format',
                                    'DD-MM-YYYY hh:mm'
                                  )
                                )
                              : ''}
                          </Text>
                        </Row>
                        <Divider />
                        <Row>
                          <Col span={12}>
                            <Text className="coupon-heading grey-text">
                              {!isNull(salesTillData) && 'Sales till date'}
                            </Text>
                          </Col>
                          <Col span={12} className="text-align-right">
                            <Text className="coupon-heading grey-text">
                              {userCouponCount > 0 && 'Used by'}
                            </Text>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={12}>
                            {!isNull(salesTillData) && (
                              <div className="sales-total-price">
                                <CurrencyFormatter
                                  value={item?.sales_till_data}
                                  language={
                                    get(
                                      tenantDetails,
                                      'setting.currency_locale',
                                      false
                                    ) || CURRENCY_LANGUAGE
                                  }
                                  type={
                                    get(
                                      tenantDetails,
                                      'setting.currency',
                                      false
                                    ) || CURRENCY_TYPE
                                  }
                                />
                              </div>
                            )}
                          </Col>
                          <Col span={12} className="text-align-right">
                            {userCouponCount > 0 && (
                              <Text className="sales-total-price">
                                {userCouponCount}
                              </Text>
                            )}
                          </Col>
                        </Row>
                      </>
                    </Card>
                  </List.Item>
                );
              }}
            />
          </div>
          {couponData.length > 0 ? (
            <div className="grid-view-pagination-long">
              <Pagination {...pagination} onChange={handleTableChange} />
            </div>
          ) : undefined}
        </>
      )}
      {isCouponTypesVisible && (
        <Modal
          open={isCouponTypesVisible}
          onCancel={handleCloseModal}
          maskClosable={false}
          footer={false}
          forceRender
          title="Select coupon type"
          className="coupon-modal"
        >
          <Row>
            {map(couponTypes, (item) => (
              <Col span={24} className="tag-col">
                <Tag.CheckableTag
                  className="coupon-tag"
                  key={item.value}
                  onChange={() => onChangeCouponType(item.value, item.id)}
                >
                  <Row>
                    <Col span={24}>
                      <Text className="coupon-type-label">{item.label}</Text>
                    </Col>
                    <Col>
                      <Text className="coupon-description">
                        <div>{item.description}</div>
                      </Text>
                    </Col>
                  </Row>
                </Tag.CheckableTag>
              </Col>
            ))}
          </Row>
        </Modal>
      )}
      {isVisible && (
        <Create
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          openTourModal={openTourModal}
          setOpenTourModal={setOpenTourModal}
          handleOk={handleOk}
          handleCancel={handleCancel}
          isEditVisible={isEditVisible}
          updatedData={updatedData || []}
          {...couponProperties}
        />
      )}
      <Modal open={isModalOpen} footer={false} onCancel={handleClose}>
        <div className="text-align-center">
          <div>
            <CouponIcon />
          </div>
          <Text className="coupon-success">
            {isEditVisible ? COUPON_UPDATE_SUCCESS : COUPON_ADD_SUCCESS}
          </Text>
        </div>
      </Modal>
      <Modal
        open={completeModal}
        footer={false}
        maskClosable
        centered
        onCancel={cancelModal}
        closeIcon={false}
        className="milestone-modal-store"
        zIndex={1005}
      >
        <span>
          <CouponBackground />
        </span>
        <span>Coupon added successfully</span>
      </Modal>
    </>
  );
}

export default Coupons;
