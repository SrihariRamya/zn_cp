import React, { useEffect } from 'react';
import {
  Row,
  Col,
  Divider,
  Switch,
  Space,
  Input,
  Button,
  Form,
  TimePicker,
  Tabs,
} from 'antd';
import DynamicFormList from '../dynamic-form-list';
import { ReactComponent as DeliveryIcon } from '../../../assets/icons/delivery-slot-icon.svg';
import SettingsMobileHeading from '../setting-mobile-heading';
import AddNewSlot from './add-new-slot';
import { DAYS, TENANT_MODE_NORMAL } from '../../../shared/constant-values';

function DeliverySlotList(properties) {
  const format = 'hh:mm A';
  const [form] = Form.useForm();

  const {
    from,
    deliverySlotActive,
    formListData,
    onFinish,
    onFieldsChange,
    onValuesChange,
    handeleSaveCancel,
    enableSave,
    buttonLoading,
    onSwitchChange,
    getSwitchValue,
    deliveryManagement,
    mobileView,
    setScreenState,
    setEnableSave,
    setDayListMobile,
    setActiveTab,
    activeTab,
    dataList,
  } = properties;

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  useEffect(() => {
    form.setFieldsValue(formListData);
  }, [formListData]);

  const handleDeliverySlotSwitch = () => {
    return (
      <Switch
        checked={deliverySlotActive}
        onChange={(event) => deliveryManagement(event)}
        size="small"
        className="switch-container"
      />
    );
  };

  const handleAllDeliverySlots = (value) => {
    switch (value) {
      case 'Sunday': {
        return (
          <Row>
            <Col
              xs={6}
              sm={6}
              md={4}
              lg={4}
              xl={4}
              className={mobileView && 'flexbox-center'}
              style={mobileView && { marginBottom: '13px' }}
            >
              <p className="delivery-slot-heading">Sunday</p>
            </Col>
            <Col
              xs={12}
              sm={12}
              md={2}
              lg={2}
              xl={2}
              className={mobileView && 'flexbox-start'}
            >
              <Row>
                <Space
                  size={8}
                  style={{ display: 'flex', alignItems: 'baseline' }}
                >
                  <Form.Item>
                    <Switch
                      size="small"
                      onChange={(checked) => onSwitchChange(checked, 'Sunday')}
                      checked={getSwitchValue('Sunday')}
                      disabled={!deliverySlotActive}
                      className="switch-container"
                    />
                  </Form.Item>
                </Space>
              </Row>
            </Col>
            <Col xs={24} sm={24} md={18} lg={18} xl={18}>
              <DynamicFormList
                form={form}
                from={from}
                formListName="Sunday"
                format={format}
                deliverySlotActive={!deliverySlotActive}
                mobileView={mobileView}
              />
            </Col>
          </Row>
        );
      }
      case 'Monday': {
        return (
          <Row>
            <Col
              xs={6}
              sm={6}
              md={4}
              lg={4}
              xl={4}
              className={mobileView && 'flexbox-center'}
              style={mobileView && { marginBottom: '13px' }}
            >
              <p className="delivery-slot-heading">Monday</p>
            </Col>
            <Col
              xs={12}
              sm={12}
              md={2}
              lg={2}
              xl={2}
              className={mobileView && 'flexbox-start'}
            >
              <Row>
                <Space
                  size={8}
                  style={{ display: 'flex', alignItems: 'baseline' }}
                >
                  <Form.Item>
                    <Switch
                      size="small"
                      onChange={(checked) => onSwitchChange(checked, 'Monday')}
                      checked={getSwitchValue('Monday')}
                      disabled={!deliverySlotActive}
                      className="switch-container"
                    />
                  </Form.Item>
                </Space>
              </Row>
            </Col>
            <Col xs={24} sm={24} md={18} lg={18} xl={18}>
              <DynamicFormList
                form={form}
                from={from}
                formListName="Monday"
                format={format}
                deliverySlotActive={!deliverySlotActive}
              />
            </Col>
          </Row>
        );
      }
      case 'Tuesday': {
        return (
          <Row>
            <Col
              xs={6}
              sm={6}
              md={4}
              lg={4}
              xl={4}
              className={mobileView && 'flexbox-center'}
              style={mobileView && { marginBottom: '13px' }}
            >
              <p className="delivery-slot-heading">Tuesday</p>
            </Col>
            <Col
              xs={12}
              sm={12}
              md={2}
              lg={2}
              xl={2}
              className={mobileView && 'flexbox-start'}
            >
              <Row>
                <Space
                  size={8}
                  style={{ display: 'flex', alignItems: 'baseline' }}
                >
                  <Form.Item>
                    <Switch
                      size="small"
                      onChange={(checked) => onSwitchChange(checked, 'Tuesday')}
                      checked={getSwitchValue('Tuesday')}
                      disabled={!deliverySlotActive}
                      className="switch-container"
                    />
                  </Form.Item>
                </Space>
              </Row>
            </Col>
            <Col xs={24} sm={24} md={18} lg={18} xl={18}>
              <DynamicFormList
                form={form}
                from={from}
                formListName="Tuesday"
                format={format}
                deliverySlotActive={!deliverySlotActive}
              />
            </Col>
          </Row>
        );
      }
      case 'Wednesday': {
        return (
          <Row>
            <Col
              xs={7}
              sm={7}
              md={4}
              lg={4}
              xl={4}
              className={mobileView && 'flexbox-center'}
              style={mobileView && { marginBottom: '13px' }}
            >
              <p className="delivery-slot-heading">Wednesday</p>
            </Col>
            <Col
              xs={12}
              sm={12}
              md={2}
              lg={2}
              xl={2}
              className={mobileView && 'flexbox-start'}
            >
              <Row>
                <Space
                  size={8}
                  style={{ display: 'flex', alignItems: 'baseline' }}
                >
                  <Form.Item>
                    <Switch
                      size="small"
                      onChange={(checked) =>
                        onSwitchChange(checked, 'Wednesday')
                      }
                      checked={getSwitchValue('Wednesday')}
                      disabled={!deliverySlotActive}
                      className="switch-container"
                    />
                  </Form.Item>
                </Space>
              </Row>
            </Col>
            <Col xs={24} sm={24} md={18} lg={18} xl={18}>
              <DynamicFormList
                form={form}
                from={from}
                formListName="Wednesday"
                format={format}
                deliverySlotActive={!deliverySlotActive}
              />
            </Col>
          </Row>
        );
      }
      case 'Thursday': {
        return (
          <Row>
            <Col
              xs={6}
              sm={6}
              md={4}
              lg={4}
              xl={4}
              className={mobileView && 'flexbox-center'}
              style={mobileView && { marginBottom: '13px' }}
            >
              <p className="delivery-slot-heading">Thursday</p>
            </Col>
            <Col
              xs={12}
              sm={12}
              md={2}
              lg={2}
              xl={2}
              className={mobileView && 'flexbox-start'}
            >
              <Row>
                <Space
                  size={8}
                  style={{ display: 'flex', alignItems: 'baseline' }}
                >
                  <Form.Item>
                    <Switch
                      size="small"
                      onChange={(checked) =>
                        onSwitchChange(checked, 'Thursday')
                      }
                      checked={getSwitchValue('Thursday')}
                      disabled={!deliverySlotActive}
                      className="switch-container"
                    />
                  </Form.Item>
                </Space>
              </Row>
            </Col>
            <Col xs={24} sm={24} md={18} lg={18} xl={18}>
              <DynamicFormList
                form={form}
                from={from}
                formListName="Thursday"
                format={format}
                deliverySlotActive={!deliverySlotActive}
              />
            </Col>
          </Row>
        );
      }
      case 'Friday': {
        return (
          <Row>
            <Col
              xs={6}
              sm={6}
              md={4}
              lg={4}
              xl={4}
              className={mobileView && 'flexbox-center'}
              style={mobileView && { marginBottom: '13px' }}
            >
              <p className="delivery-slot-heading">Friday</p>
            </Col>
            <Col
              xs={12}
              sm={12}
              md={2}
              lg={2}
              xl={2}
              className={mobileView && 'flexbox-start'}
            >
              <Row>
                <Space
                  size={8}
                  style={{ display: 'flex', alignItems: 'baseline' }}
                >
                  <Form.Item>
                    <Switch
                      size="small"
                      onChange={(checked) => onSwitchChange(checked, 'Friday')}
                      checked={getSwitchValue('Friday')}
                      disabled={!deliverySlotActive}
                      className="switch-container"
                    />
                  </Form.Item>
                </Space>
              </Row>
            </Col>
            <Col xs={24} sm={24} md={18} lg={18} xl={18}>
              <DynamicFormList
                form={form}
                from={from}
                formListName="Friday"
                format={format}
                deliverySlotActive={!deliverySlotActive}
              />
            </Col>
          </Row>
        );
      }
      case 'Saturday': {
        return (
          <Row>
            <Col
              xs={6}
              sm={6}
              md={4}
              lg={4}
              xl={4}
              className={mobileView && 'flexbox-center'}
              style={mobileView && { marginBottom: '13px' }}
            >
              <p className="delivery-slot-heading">Saturday</p>
            </Col>
            <Col
              xs={12}
              sm={12}
              md={2}
              lg={2}
              xl={2}
              className={mobileView && 'flexbox-start'}
            >
              <Row>
                <Space
                  size={8}
                  style={{ display: 'flex', alignItems: 'baseline' }}
                >
                  <Form.Item>
                    <Switch
                      size="small"
                      onChange={(checked) =>
                        onSwitchChange(checked, 'Saturday')
                      }
                      checked={getSwitchValue('Saturday')}
                      disabled={!deliverySlotActive}
                      className="switch-container"
                    />
                  </Form.Item>
                </Space>
              </Row>
            </Col>
            <Col xs={24} sm={24} md={18} lg={18} xl={18}>
              <DynamicFormList
                form={form}
                from={from}
                formListName="Saturday"
                format={format}
                deliverySlotActive={!deliverySlotActive}
              />
            </Col>
          </Row>
        );
      }
      default: {
        // eslint-disable-next-line no-console
        console.log('nothing');
      }
    }
    return '';
  };

  return (
    <div className="box mobile-side-padding delivery-slot-setting-styles">
      <Row className="box__header bg-gray-lighter">
        <Col xs={15} sm={15} md={20} lg={20} xl={20}>
          {mobileView && (
            <Row>
              <Col span={16} className="flexbox-start">
                <SettingsMobileHeading
                  heading="Delivery Slot"
                  Tooltip="false"
                  setScreenState={setScreenState}
                />
              </Col>
              <Col span={4} className="flexbox-start">
                {handleDeliverySlotSwitch()}
              </Col>
            </Row>
          )}
          {!mobileView && (
            <p className={mobileView ? 'delivery-slot-header-mob' : ''}>
              <span className="delivery-slot-heading">
                Delivery Slot Management
              </span>
              <span className="box-switch">{handleDeliverySlotSwitch()}</span>
            </p>
          )}
        </Col>
        <Col
          className="settings-btn-div"
          xs={9}
          sm={9}
          md={4}
          lg={4}
          xl={4}
          style={{ gap: '5px' }}
        >
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              disabled={!enableSave}
              loading={buttonLoading}
              onClick={() => form.submit()}
            >
              Save
            </Button>
          </Form.Item>
          <Form.Item>
            <Button danger onClick={handeleSaveCancel}>
              cancel
            </Button>
          </Form.Item>
        </Col>
      </Row>
      <Row className="flexbox-end" style={{ marginBottom: '10px' }}>
        <AddNewSlot
          form={form}
          deliverySlotActive={deliverySlotActive}
          setEnableSave={setEnableSave}
          formListData={formListData}
          mobileView={mobileView}
          setDayListMobile={setDayListMobile}
          dataList={dataList}
          from={TENANT_MODE_NORMAL}
        />
      </Row>
      <div className={mobileView ? '' : 'box__content box-content-background'}>
        <Form
          name="deliverySlot"
          form={form}
          onFinish={onFinish}
          initialValues={formListData}
          onValuesChange={onValuesChange}
          onFieldsChange={onFieldsChange}
        >
          <Row className="deliverySlot-left-row">
            <Col flex={2} className="mobile-view-box-div">
              {mobileView && (
                <div style={{ display: 'flex' }}>
                  <DeliveryIcon />
                  <p className="flexbox-center">Delivery Slot Management</p>
                </div>
              )}
              <Space direction="vertical" size={18}>
                <div className="delivery-slot-card">
                  <Row>
                    <Col xs={20} sm={20} md={20} lg={20} xl={20}>
                      <h4 className="delivery-slot-heading">
                        Show my delivery dates upto
                      </h4>
                    </Col>
                    <Col xs={4} sm={4} md={4} lg={4} xl={4}>
                      <Form.Item
                        name="deliveryslot_max_day_is_active"
                        valuePropName="checked"
                      >
                        <Switch
                          disabled={!deliverySlotActive}
                          size="small"
                          className="switch-container"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={24} sm={24} md={20} lg={24} xl={24}>
                      <Form.Item name="deliveryslot_max_day">
                        <Input disabled={!deliverySlotActive} suffix="Days" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                <div className="delivery-slot-card">
                  <Row>
                    <Col xs={20} sm={20} md={20} lg={20} xl={20}>
                      <h4 className="delivery-slot-heading">
                        Our order processing time
                      </h4>
                    </Col>
                    <Col xs={4} sm={4} md={4} lg={4} xl={4}>
                      <Form.Item
                        name="deliveryslot_order_processing_time_is_active"
                        valuePropName="checked"
                      >
                        <Switch
                          disabled={!deliverySlotActive}
                          size="small"
                          className="switch-container"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item name="deliveryslot_order_processing_time">
                        <TimePicker
                          style={{ width: '100%' }}
                          showNow={false}
                          format="HH:mm"
                          disabled={!deliverySlotActive}
                          inputReadOnly
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                <div className="delivery-slot-card">
                  <Row>
                    <Col xs={20} sm={20} md={20} lg={20} xl={20}>
                      <h4 className="delivery-slot-heading">
                        Maximum orders per slot
                      </h4>
                    </Col>
                    <Col xs={4} sm={4} md={4} lg={4} xl={4}>
                      <Form.Item
                        name="max_orders_per_slot_is_active"
                        valuePropName="checked"
                      >
                        <Switch
                          disabled={!deliverySlotActive}
                          size="small"
                          className="switch-container"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item name="max_orders_per_slot">
                        <Input disabled={!deliverySlotActive} suffix="Orders" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </Space>
            </Col>
            <Col flex={3}>
              {mobileView ? (
                <Tabs
                  className="custom-settings-tab mt-10"
                  activeKey={activeTab}
                  onChange={handleTabChange}
                >
                  {DAYS.map((day) => (
                    <Tabs.TabPane key={day.toLowerCase()} tab={day}>
                      {handleAllDeliverySlots(day)}
                    </Tabs.TabPane>
                  ))}
                </Tabs>
              ) : (
                <>
                  {handleAllDeliverySlots('Sunday')}
                  <Divider />
                  {handleAllDeliverySlots('Monday')}
                  <Divider />
                  {handleAllDeliverySlots('Tuesday')}
                  <Divider />
                  {handleAllDeliverySlots('Wednesday')}
                  <Divider />
                  {handleAllDeliverySlots('Thursday')}
                  <Divider />
                  {handleAllDeliverySlots('Friday')}
                  <Divider />
                  {handleAllDeliverySlots('Saturday')}
                </>
              )}
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}

export default DeliverySlotList;
