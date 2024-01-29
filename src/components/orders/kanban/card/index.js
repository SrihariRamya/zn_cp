import React, { useContext, useEffect, useState } from 'react';
import { Card, Dropdown, notification, Menu, Row, Col, Space } from 'antd';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { get } from 'lodash';
import { DownOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ReactComponent as CardMenu } from '../../../../assets/icons/cardMenu.svg';
import { ReactComponent as MicrosoftExcel } from '../../../../assets/icons/microsoftexcel.svg';
import { ReactComponent as CancelRequest } from '../../../../assets/icons/cancelrequest.svg';
import { ReactComponent as Confirmed } from '../../../../assets/icons/confirmed.svg';
import { ReactComponent as Reject } from '../../../../assets/icons/reject.svg';
import { ReactComponent as Pdf } from '../../../../assets/icons/pdf.svg';
import { TenantContext } from '../../../context/tenant-context';
import { STATUS_EDIT_FAILED } from '../../../../shared/constant-values';
import { editCancelRequest } from '../../../../utils/api/url-helper';
import { handleValidDate } from '../../../../shared/function-helper';

function CardItem(properties) {
  const {
    cardDetails,
    fetchData,
    singleOrderPdf,
    downloadExcel,
    dropdownScrollSlug,
    setDropdownScrollSlug,
    setCardDropdownSlug,
  } = properties;
  const [tenantDetails] = useContext(TenantContext);
  const [cardDropdownVisible, setCardDropdownVisible] = useState(false);
  const [cardRequestDropdownVisible, setCardRequestDropdownVisible] =
    useState(false);

  const handleRequestStatus = () => {
    return (
      <>
        <Menu.Item
          key={1}
          data-value={1}
          className="active mt-8"
          style={{ backgroundColor: '#23A26D1A' }}
        >
          <div className="milestone-data" style={{ color: '#23A26D' }}>
            <Space size={8}>
              <Confirmed />
              Accept
            </Space>
          </div>
        </Menu.Item>
        <Menu.Item
          key={2}
          data-value={2}
          className="active mt-10"
          style={{ backgroundColor: '#F841411A' }}
        >
          <div className="milestone-data" style={{ color: '#F84141' }}>
            <Space size={8}>
              <Reject />
              Reject
            </Space>
          </div>
        </Menu.Item>
      </>
    );
  };

  const editRequestStatus = (value, record) => {
    editCancelRequest({ ...record, type: value.key }, record.order_id)
      .then(() => {
        fetchData();
      })
      .catch(() => {
        notification.error({
          message: STATUS_EDIT_FAILED,
        });
      });
  };

  const toggleDropdowns = (slug) => {
    if (slug === 'Req') {
      setCardRequestDropdownVisible(true);
    } else {
      setCardDropdownVisible(true);
    }
    setCardDropdownSlug(true);
  };

  useEffect(() => {
    setDropdownScrollSlug(false);
    setCardDropdownVisible(false);
    setCardRequestDropdownVisible(false);
    setCardDropdownSlug(false);
  }, [dropdownScrollSlug]);

  return (
    <div className="chat-card-container">
      <Card>
        <div className="card-flex-bwn">
          <div className="card-product-details">
            <div className="order-id">
              <Link to={`/orders/${get(cardDetails, 'order_uid', '')}`}>
                {cardDetails.order_id}
              </Link>
            </div>
            {get(cardDetails, 'zm_milestone.milestone_code', '') === 'REQ' && (
              <div className="order-cancel-req">
                <Dropdown
                  open={cardRequestDropdownVisible}
                  onClick={() => toggleDropdowns('Req')}
                  overlay={
                    <Menu
                      className="order_dropdown_kanban"
                      onClick={(event) => editRequestStatus(event, cardDetails)}
                    >
                      {handleRequestStatus()}
                    </Menu>
                  }
                >
                  <span style={{ color: '#F84141' }}>
                    <div>
                      <CancelRequest />
                    </div>
                    <div>Cancel Req</div>
                    <div>
                      <DownOutlined />
                    </div>
                  </span>
                </Dropdown>
              </div>
            )}
            <div className="orders-amt">
              <CurrencyFormatter
                value={get(cardDetails, 'total_price', 0)}
                type={get(tenantDetails, 'setting.currency', '')}
                language={get(tenantDetails, 'setting.currency_locale', '')}
              />
            </div>
            <div>{get(cardDetails, 'zm_user.user_name', '')}</div>
            <div>
              Payment method-{' '}
              {get(cardDetails, 'zt_order_payment.zm_payment_method.slug', '')}
            </div>
            <div>
              {handleValidDate(
                get(cardDetails, 'modified_date', ''),
                tenantDetails
              )}
            </div>
          </div>
          <div className="card-menus">
            <Dropdown
              open={cardDropdownVisible}
              onClick={() => toggleDropdowns('download')}
              overlay={
                <Menu style={{ marginRight: '10px' }}>
                  <Menu.Item onClick={() => downloadExcel(cardDetails)}>
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
                    onClick={() => singleOrderPdf(cardDetails.order_uid)}
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
              getPopupContainer={(triggerNode) => triggerNode.parentElement}
              placement="topRight"
              arrow
            >
              <span className="card-menu-icon">
                <CardMenu />
              </span>
            </Dropdown>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CardItem;
