import {
  Button,
  Card,
  Col,
  Divider,
  notification,
  Pagination,
  Popover,
  Row,
  Spin,
  Typography,
} from 'antd';
import _, { get } from 'lodash';
import React, { useState, useContext } from 'react';
import {
  getSubDistrict,
  deleteDeliveryByCriteria,
} from '../../../utils/api/url-helper';
import {
  DELIVERYCHARGE_DELETE_SUCCESS,
  DELIVERYCHARGE_DELETE_FAILED,
  CURRENCYSYMBOLS,
} from '../../../shared/constant-values';
import { TenantContext } from '../../context/tenant-context';
import { ReactComponent as DeleteIcon } from '../../../assets/images/delete-icon.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/edit-icon.svg';

function Details(detailProperties) {
  const {
    setEditData,
    deliveryData,
    getDelivery,
    pagination,
    setPagination,
    mobileView,
  } = detailProperties;
  const [subData, setSubData] = useState([]);
  const [tenantDetails] = useContext(TenantContext);
  const currencyValue =
    CURRENCYSYMBOLS[get(tenantDetails, 'setting.currency', '')];

  const handleSubMenu = async (id) => {
    await getSubDistrict(id).then((response) => {
      const district = _.get(response, 'dataValue', []);
      const arrayData = district.map((item) => {
        return {
          label: item.sub_district_name,
          key: item.sub_district_id,
        };
      });
      setSubData(arrayData);
    });
  };

  const deleteDelivery = (id) => {
    deleteDeliveryByCriteria(id)
      .then(async () => {
        const { current } = pagination;
        const currentPageAlias =
          deliveryData.length === 1 && current > 1 ? current - 1 : current;
        getDelivery({
          pagination: { ...pagination, current: currentPageAlias },
        });
        notification.success({
          message: DELIVERYCHARGE_DELETE_SUCCESS,
        });
      })
      .catch(() => {
        notification.error({ message: DELIVERYCHARGE_DELETE_FAILED });
      });
  };
  const handlePagination = (page) => {
    getDelivery({
      pagination: { pageSize: 10, current: page },
    });
    setPagination({ ...pagination, current: page });
  };
  return (
    <Spin spinning={false}>
      {mobileView ? (
        deliveryData.length > 0 &&
        deliveryData.map((data) => {
          return (
            <div className="edit-delivery-charges-card" key={data.criteria_id}>
              <Row>
                <Col span={20} className="flexbox-start">
                  <p className="edit-title">
                    Charges by Location:₹{data.delivery_charge}
                  </p>
                </Col>
                <Col span={2} className="inner-card">
                  <Button
                    type="primary"
                    icon={<EditIcon />}
                    onClick={() => setEditData(data)}
                  />
                </Col>
                <Col span={2} className="flexbox-center inner-card">
                  <Button
                    type="danger"
                    danger
                    icon={<DeleteIcon />}
                    onClick={() => deleteDelivery(data.criteria_id)}
                  />
                </Col>
              </Row>
            </div>
          );
        })
      ) : (
        <>
          <Card
            style={{
              width: '100%',
              backgroundColor: '#f0f0f0',
            }}
          >
            <div className="item-list">
              {deliveryData.length > 0 &&
                deliveryData.map((data) => {
                  return (
                    <Card key={data.criteria_id}>
                      <div className="inner-card">
                        <Typography.Link>{`${currencyValue} ${data.delivery_charge}`}</Typography.Link>
                      </div>
                      <Divider />
                      <div style={{ height: '160px' }}>
                        <div className=" radio-theme-delivery details-list">
                          {data.location_mapped.map((items) => {
                            return (
                              <Popover
                                content={
                                  subData.length > 0 ? (
                                    <div className="pop-over-subDistrict">
                                      <div className="pop-over-inner-subDistrict">
                                        {subData.map((item) => (
                                          <p key={get(item, 'key', '')}>
                                            {item.label}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    ''
                                  )
                                }
                                placement="right"
                                trigger="click"
                              >
                                <div className="listing-items">
                                  {items.district_id ? (
                                    <Button
                                      onClick={() =>
                                        handleSubMenu(items.district_id)
                                      }
                                    >
                                      {items.district_mapped.district_name}
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() =>
                                        handleSubMenu(items.international_city)
                                      }
                                    >
                                      {items.international_city}
                                    </Button>
                                  )}
                                </div>
                              </Popover>
                            );
                          })}
                        </div>
                      </div>
                      <Divider />
                      <div className="inner-card">
                        <Button
                          type="primary"
                          icon={<EditIcon />}
                          onClick={() => setEditData(data)}
                        />
                        <Button
                          type="danger"
                          danger
                          icon={<DeleteIcon />}
                          onClick={() => deleteDelivery(data.criteria_id)}
                        />
                      </div>
                    </Card>
                  );
                })}
            </div>
          </Card>
          {deliveryData.length > 0 && (
            <div className="details-pagination-main">
              <Pagination
                {...pagination}
                onChange={handlePagination}
                className="details-pagination"
              />
            </div>
          )}
        </>
      )}
    </Spin>
  );
}

export default Details;
