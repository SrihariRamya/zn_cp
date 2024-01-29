import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Switch,
} from 'antd';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BOOKINGS_BREAD_TITLE,
  BOOKINGS_DELIVERY_DATES_TEXT,
  BOOKINGS_MAX_SLOT_TEXT,
  BOOKINGS_SLOTS_BREAD_TITLE,
  SLOT_FORMAT,
  TENANT_MODE_CLIC,
} from '../../../shared/constant-values';
import DynamicFormList from '../../settings/dynamic-form-list';
import AddNewSlot from '../../settings/delivery-slot/add-new-slot';

function AddBookingSlot(properties) {
  const {
    deliverySlotActive = true,
    formListData,
    onFinish,
    setEnableSave,
    onValuesChange,
    handeleSaveCancel,
    enableSave,
    buttonLoading,
    onSwitchChange,
    getSwitchValue,
    mobileView,
    setDayListMobile,
    dataList,
  } = properties;
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(formListData);
  }, [formListData]);

  const onFieldsChange = () => {
    setEnableSave(
      !form.getFieldsError().some((field) => field?.errors?.length > 0)
    );
  };

  return (
    <div className="clic-booking-container">
      <div>
        <Breadcrumb separator=">">
          <Breadcrumb.Item>
            <Link to="/bookings">{BOOKINGS_BREAD_TITLE}</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item className="table-tax">
            {BOOKINGS_SLOTS_BREAD_TITLE}
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <Form
        name="deliverySlot"
        form={form}
        onFinish={onFinish}
        initialValues={formListData}
        onValuesChange={onValuesChange}
        onFieldsChange={onFieldsChange}
      >
        <div className="booking-slot-container">
          <Row>
            <Col span={8}>
              <Row>
                <Space>
                  <Form.Item
                    name="deliveryslot_max_day_is_active"
                    valuePropName="checked"
                  >
                    <Switch disabled={!deliverySlotActive} />
                  </Form.Item>
                  <div>{BOOKINGS_DELIVERY_DATES_TEXT}</div>
                </Space>
              </Row>
              <Row className="mt-10">
                <Form.Item name="deliveryslot_max_day">
                  <Input
                    style={{ width: '100%' }}
                    disabled={!deliverySlotActive}
                    suffix="Days"
                  />
                </Form.Item>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Space>
                  <Form.Item
                    name="max_orders_per_slot_is_active"
                    valuePropName="checked"
                  >
                    <Switch disabled={!deliverySlotActive} />
                  </Form.Item>
                  <div>{BOOKINGS_MAX_SLOT_TEXT}</div>
                </Space>
              </Row>
              <Row className="mt-10">
                <Form.Item name="max_orders_per_slot">
                  <Input
                    disabled={!deliverySlotActive}
                    className="deliveryslot-input"
                    suffix="Orders"
                  />
                </Form.Item>
              </Row>
            </Col>
            <Col span={8}>
              <div
                className="flex-end"
                style={{ marginTop: '44px', marginRight: '8px' }}
              >
                <Space>
                  <Form.Item>
                    <Button type="default" onClick={handeleSaveCancel}>
                      cancel
                    </Button>
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={!enableSave}
                      loading={buttonLoading}
                    >
                      Save
                    </Button>
                  </Form.Item>
                </Space>
              </div>
            </Col>
          </Row>
        </div>
        <Row
          className="flexbox-end"
          style={{ marginBottom: '10px', marginTop: '10px' }}
        >
          <AddNewSlot
            form={form}
            deliverySlotActive={deliverySlotActive}
            setEnableSave={setEnableSave}
            formListData={formListData}
            mobileView={mobileView}
            setDayListMobile={setDayListMobile}
            dataList={dataList}
            from={TENANT_MODE_CLIC}
          />
        </Row>
        <div className="delivery-slot-list-container">
          <Row className="deliverySlot-left-row">
            <Col flex={3}>
              <Card>
                <Row>
                  <Col span={1}>
                    <Form.Item>
                      <Switch
                        size="small"
                        onChange={(checked) =>
                          onSwitchChange(checked, 'Sunday')
                        }
                        checked={getSwitchValue('Sunday')}
                        disabled={!deliverySlotActive}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={3} offset={1}>
                    <h4 className="delivert-slot-days-text">Sunday</h4>
                  </Col>
                  <Col offset={4} xs={24} sm={24} md={12} lg={15} xl={15}>
                    <DynamicFormList
                      form={form}
                      formListName="Sunday"
                      format={SLOT_FORMAT}
                      deliverySlotActive={!deliverySlotActive}
                      from={TENANT_MODE_CLIC}
                    />
                  </Col>
                </Row>
              </Card>
              <Card>
                <Row>
                  <Col span={1}>
                    <Form.Item>
                      <Switch
                        size="small"
                        onChange={(checked) =>
                          onSwitchChange(checked, 'Monday')
                        }
                        checked={getSwitchValue('Monday')}
                        disabled={!deliverySlotActive}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={3} offset={1}>
                    <h4 className="delivert-slot-days-text">Monday</h4>
                  </Col>
                  <Col offset={4} xs={24} sm={24} md={12} lg={15} xl={15}>
                    <DynamicFormList
                      form={form}
                      formListName="Monday"
                      format={SLOT_FORMAT}
                      deliverySlotActive={!deliverySlotActive}
                      from={TENANT_MODE_CLIC}
                    />
                  </Col>
                </Row>
              </Card>
              <Card>
                <Row>
                  <Col span={1}>
                    <Form.Item>
                      <Switch
                        size="small"
                        onChange={(checked) =>
                          onSwitchChange(checked, 'Tuesday')
                        }
                        checked={getSwitchValue('Tuesday')}
                        disabled={!deliverySlotActive}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={3} offset={1}>
                    <h4 className="delivert-slot-days-text">Tuesday</h4>
                  </Col>
                  <Col offset={4} xs={24} sm={24} md={12} lg={15} xl={15}>
                    <DynamicFormList
                      form={form}
                      formListName="Tuesday"
                      format={SLOT_FORMAT}
                      deliverySlotActive={!deliverySlotActive}
                      from={TENANT_MODE_CLIC}
                    />
                  </Col>
                </Row>
              </Card>
              <Card>
                <Row>
                  <Col span={1}>
                    <Form.Item>
                      <Switch
                        size="small"
                        onChange={(checked) =>
                          onSwitchChange(checked, 'Wednesday')
                        }
                        checked={getSwitchValue('Wednesday')}
                        disabled={!deliverySlotActive}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={3} offset={1}>
                    <h4 className="delivert-slot-days-text">Wednesday</h4>
                  </Col>
                  <Col offset={4} xs={24} sm={24} md={12} lg={15} xl={15}>
                    <DynamicFormList
                      form={form}
                      formListName="Wednesday"
                      format={SLOT_FORMAT}
                      deliverySlotActive={!deliverySlotActive}
                      from={TENANT_MODE_CLIC}
                    />
                  </Col>
                </Row>
              </Card>
              <Card>
                <Row>
                  <Col span={1}>
                    <Form.Item>
                      <Switch
                        size="small"
                        onChange={(checked) =>
                          onSwitchChange(checked, 'Thursday')
                        }
                        checked={getSwitchValue('Thursday')}
                        disabled={!deliverySlotActive}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={3} offset={1}>
                    <h4 className="delivert-slot-days-text">Thursday</h4>
                  </Col>
                  <Col offset={4} xs={24} sm={24} md={12} lg={15} xl={15}>
                    <DynamicFormList
                      form={form}
                      formListName="Thursday"
                      format={SLOT_FORMAT}
                      deliverySlotActive={!deliverySlotActive}
                      from={TENANT_MODE_CLIC}
                    />
                  </Col>
                </Row>
              </Card>
              <Card>
                <Row>
                  <Col span={1}>
                    <Form.Item>
                      <Switch
                        size="small"
                        onChange={(checked) =>
                          onSwitchChange(checked, 'Friday')
                        }
                        checked={getSwitchValue('Friday')}
                        disabled={!deliverySlotActive}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={3} offset={1}>
                    <h4 className="delivert-slot-days-text">Friday</h4>
                  </Col>
                  <Col offset={4} xs={24} sm={24} md={12} lg={15} xl={15}>
                    <DynamicFormList
                      form={form}
                      formListName="Friday"
                      format={SLOT_FORMAT}
                      deliverySlotActive={!deliverySlotActive}
                      from={TENANT_MODE_CLIC}
                    />
                  </Col>
                </Row>
              </Card>
              <Card>
                <Row>
                  <Col span={1}>
                    <Form.Item>
                      <Switch
                        size="small"
                        onChange={(checked) =>
                          onSwitchChange(checked, 'Saturday')
                        }
                        checked={getSwitchValue('Saturday')}
                        disabled={!deliverySlotActive}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={3} offset={1}>
                    <h4 className="delivert-slot-days-text">Saturday</h4>
                  </Col>
                  <Col offset={4} xs={24} sm={24} md={12} lg={15} xl={15}>
                    <DynamicFormList
                      form={form}
                      formListName="Saturday"
                      format={SLOT_FORMAT}
                      deliverySlotActive={!deliverySlotActive}
                      from={TENANT_MODE_CLIC}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </Form>
    </div>
  );
}
export default AddBookingSlot;
