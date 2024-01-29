import React, { useState, useEffect } from 'react';
import {
  Breadcrumb,
  Space,
  Image,
  Dropdown,
  Menu,
  Modal,
  Select,
  Button,
  List,
  Row,
  Col,
  Tabs,
  DatePicker,
} from 'antd';
import { get } from 'lodash';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { Link, useNavigate } from 'react-router-dom';
import { ReactComponent as Order } from '../../../assets/icons/order.svg';
import { VIEW_PAYMENT_PROOF } from '../../../shared/constant-values';
import { ReactComponent as CardMenu } from '../../../assets/icons/cardMenu.svg';
import Kanban from '../kanban';
import { ReactComponent as Pdf } from '../../../assets/icons/pdf.svg';
import { ReactComponent as MicrosoftExcel } from '../../../assets/icons/microsoftexcel.svg';
import { handleValidDate } from '../../../shared/function-helper';

function OrderMobileView(parameters) {
  const {
    filterData,
    tenantDetails,
    handleDropDown,
    downloadExcel,
    singleOrderPdf,
    pagination,
    handleTableChange,
    filterReset,
    filterStatus,
    orderTitle,
    setActiveKey,
    activeKey,
    shiprocketOrderButton,
    menuValue,
    menuChange,
    selectOptionData,
    handleDateRangeChange,
    multipleOrderPDF,
    downloadOrderExcel,
    setOrderRecord,
    setIsModalVisible,
    setSelectedID,
    isKanbanOrder,
    setIsKanbanOrder,
    setEditStatusData,
    setVisible,
    setOrderUID,
    setStoreUID,
    handleEditStatus,
    setOrderId,
  } = parameters;
  const navigate = useNavigate();
  const { total, pageSize } = pagination;
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [paymentProof, setPaymentProof] = useState();
  const [isChecked, setIsChecked] = useState(true);
  const { RangePicker } = DatePicker;
  const [isFixed, setIsFixed] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState('');

  const handleFilterOrders = (key) => {
    const defaultName = orderTitle.find((item) => item.key === key).value;
    setActiveKey(key);
    if (key === 'Reset') {
      return filterReset(key);
    }
    return filterStatus(key, defaultName);
  };

  const handlePaymentProof = (item) => {
    setPaymentProof(item);
    setPaymentVisible(true);
  };

  const onClose = () => {
    setPaymentVisible(false);
    setIsChecked(true);
  };

  // const switchChange = (checked) => {
  //   setIsChecked(checked);
  // };

  useEffect(() => {
    const handleScroll = () => {
      if (get(window, 'scrollY', 0) > 20) {
        setIsFixed(true);
        setDropdownVisible('');
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const tabHeaderStyle = {
    width: isFixed && '100%',
    zIndex: '1000',
    overflowX: 'auto',
    padding: isFixed && '0 15px 0 5px',
    top: isFixed ? '38px' : 'auto',
    backgroundColor: isFixed && '#fff',
    position: isFixed ? 'fixed' : 'relative',
    boxShadow: isFixed && '0px 5px 5px rgb(204, 204, 204)',
    borderTop: isFixed && '0.25px solid rgb(204, 204, 204)',
  };

  const toggleDropdown = (id) => {
    setDropdownVisible(id);
  };

  const headerStyle = {
    width: '96vw',
    zIndex: '100',
    backgroundColor: '#fff',
    position: 'fixed',
  };

  return (
    <div className="search-container order-list-mobile-container">
      <Row style={isChecked ? {} : headerStyle}>
        <Col span={12}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <Order />
                Orders
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        {/* <Col span={12}>
          <div className="flex-end-content">
            <Switch
              defaultChecked={false}
              checked={isChecked}
              checkedChildren="List"
              unCheckedChildren="Kanban"
              onChange={switchChange}
              style={{ backgroundColor: '#0B3D60' }}
            />
          </div>
        </Col> */}
      </Row>

      {isChecked ? (
        <>
          <Row>
            <Col span={12}>
              <div className="float-right">
                <Select
                  value={menuValue}
                  onChange={menuChange}
                  options={selectOptionData}
                  allowClear
                  placeholder="All"
                />
                <div style={{ marginTop: '10px' }}>
                  {menuValue === 'Customize' && (
                    <RangePicker onChange={handleDateRangeChange} />
                  )}
                </div>
              </div>
            </Col>
            <Col span={12}>
              {shiprocketOrderButton && (
                <div className="flex-end-content">
                  <Button
                    type="primary"
                    onClick={() => navigate('/shiprocket/orders')}
                  >
                    Shiprocket Order
                  </Button>
                </div>
              )}
            </Col>
          </Row>
          <div className="filter-order-status" style={tabHeaderStyle}>
            <Tabs
              activeKey={activeKey}
              items={orderTitle}
              onTabClick={handleFilterOrders}
            />
          </div>
          <div className="order-card-list">
            <List
              dataSource={filterData}
              pagination={
                filterData.length > 0 && {
                  onChange: (current) =>
                    handleTableChange({ current, pageSize, total }, '', {}),
                  ...pagination,
                }
              }
              rowKey="order_hdr_id"
              renderItem={(item) => (
                <List.Item>
                  <Row>
                    <Col span={14} className="f-center">
                      <Row className="order-id">
                        <Link to={`/orders/${get(item, 'order_uid', '')}`}>
                          {item.order_id}
                        </Link>
                      </Row>
                      <Row>{get(item, 'zm_user.user_name', '')}</Row>
                      <Row>
                        {get(
                          item,
                          'zt_order_payment.zm_payment_method.slug',
                          ''
                        )}
                      </Row>
                      <Row>
                        {handleValidDate(
                          get(item, 'modified_date', ''),
                          tenantDetails
                        )}
                      </Row>
                    </Col>
                    <Col span={10}>
                      <Row className="order-button">
                        <Col span={22}>
                          {handleDropDown(
                            get(item.zm_milestone, 'milestone_description', ''),
                            item
                          )}
                        </Col>
                        <Col span={2} className="card-menu">
                          <Dropdown
                            visible={
                              dropdownVisible === get(item, 'order_uid', '')
                            }
                            onClick={() =>
                              toggleDropdown(get(item, 'order_uid', ''))
                            }
                            overlay={
                              <Menu style={{ marginRight: '25px' }}>
                                <Menu.Item onClick={() => downloadExcel(item)}>
                                  <Row gutter={24}>
                                    <Col span={4}>
                                      <MicrosoftExcel />
                                    </Col>
                                    <Col span={20} className="card-download">
                                      Download Excel
                                    </Col>
                                  </Row>
                                </Menu.Item>
                                <Menu.Item
                                  onClick={() => singleOrderPdf(item.order_uid)}
                                >
                                  <Row gutter={24}>
                                    <Col span={4}>
                                      <Pdf />
                                    </Col>
                                    <Col span={20} className="card-download">
                                      Download PDF
                                    </Col>
                                  </Row>
                                </Menu.Item>
                              </Menu>
                            }
                            placement="bottomLeft"
                          >
                            <span className="card-menu-icon">
                              <CardMenu />
                            </span>
                          </Dropdown>
                        </Col>
                      </Row>
                      <Row className="order-amt">
                        <CurrencyFormatter
                          value={get(item, 'total_price', 0)}
                          type={get(tenantDetails, 'setting.currency', '')}
                          language={get(
                            tenantDetails,
                            'setting.currency_locale',
                            ''
                          )}
                        />
                      </Row>
                      {get(item, 'zt_order_payment.user_payment_proof', '') && (
                        <Row
                          style={{
                            color: '#472DC5',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                          onClick={() => handlePaymentProof(item)}
                        >
                          {VIEW_PAYMENT_PROOF}
                        </Row>
                      )}
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          </div>
          <Modal open={paymentVisible} onCancel={onClose} footer={false}>
            <div className="payment-proof">
              {get(paymentProof, 'zt_order_payment.user_payment_proof', '') ? (
                <Image
                  src={get(
                    paymentProof,
                    'zt_order_payment.user_payment_proof',
                    ''
                  )}
                />
              ) : (
                <span>
                  {get(
                    paymentProof,
                    'zt_order_payment.user_transaction_id',
                    ''
                  )}
                </span>
              )}
            </div>
          </Modal>
        </>
      ) : (
        <Kanban
          isChecked={isChecked}
          singleOrderPdf={singleOrderPdf}
          downloadExcel={downloadExcel}
          multipleOrderPDF={multipleOrderPDF}
          downloadOrderExcel={downloadOrderExcel}
          setSelectedID={setSelectedID}
          shiprocketOrderButton={shiprocketOrderButton}
          setEditStatusData={setEditStatusData}
          setVisible={setVisible}
          setOrderUID={setOrderUID}
          setStoreUID={setStoreUID}
          handleEditStatus={handleEditStatus}
          setOrderId={setOrderId}
          setOrderRecord={setOrderRecord}
          setIsModalVisible={setIsModalVisible}
          isKanbanOrder={isKanbanOrder}
          setIsKanbanOrder={setIsKanbanOrder}
        />
      )}
    </div>
  );
}

export default OrderMobileView;
