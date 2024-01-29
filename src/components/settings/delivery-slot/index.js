import React, { useEffect, useState, useContext } from 'react';
import { Spin, notification } from 'antd';
import {
  get,
  pick,
  omit,
  toPairs,
  find,
  map,
  forOwn,
  has,
  cloneDeep,
} from 'lodash';
import moment from 'moment';
import './delivery-slot.less';
import {
  getAllDeliverySlots,
  getTenant,
  createOrUpdateDeliverySlot,
} from '../../../utils/api/url-helper';
import {
  DAYS,
  DELIVERY_SLOT_ADD_FAILED,
  FAILED_TO_LOAD,
  TENANT_MODE_CLIC,
  TENANT_MODE_NORMAL,
} from '../../../shared/constant-values';
import { TenantContext } from '../../context/tenant-context';
import NormalDeliverySlot from './delivey-solt-list';
import AddBookingSlot from '../../clic/booking/add-booking-slot';

function DeliverySlot(properties) {
  const { mobileView, setScreenState } = properties;
  const [activeTab, setActiveTab] = useState('sunday');
  const format = 'hh:mm A';
  const [tenantDetails] = useContext(TenantContext);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [enableSave, setEnableSave] = useState(false);
  const [deliverySlotData, setDeliverySlotData] = useState([]);
  const [closedData, setClosedData] = useState({});
  const [formListData, setFormListData] = useState({});
  const [deliverySlotActive, setDeliverySlotActive] = useState(false);
  const [dayListMobile, setDayListMobile] = useState([]);
  const [dataList, setDataList] = useState([]);

  const settingsDetail = [
    'deliveryslot_management_active',
    'deliveryslot_max_day',
    'deliveryslot_max_day_is_active',
    'deliveryslot_order_processing_time_is_active',
    'deliveryslot_order_processing_time',
    'max_orders_per_slot_is_active',
    'max_orders_per_slot',
  ];

  const fetchData = () => {
    setLoading(true);
    const apiArray = [getAllDeliverySlots(), getTenant()];
    Promise.all(apiArray)
      .then((response) => {
        const data = get(response, '[0].data', []);
        setDataList(data);
        const dayList = {};
        get(response, '[0].data', []).map((item) => {
          if (item.is_active) {
            dayList[item.day_name] = 'Open';
          } else {
            dayList[item.day_name] = 'Closed';
          }
          return null;
        });
        const newData = {
          Sunday: [],
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
        };
        get(response, '[0].data', []).map((item) => {
          item.delivery_slots.map((slot) => {
            slot.start_time = moment(
              get(slot, 'start_time', ''),
              format
            ).isValid()
              ? moment(slot.start_time, format)
              : '';
            slot.end_time = moment(get(slot, 'end_time', ''), format).isValid()
              ? moment(slot.end_time, format)
              : '';
            return newData[item.day_name].push(slot);
          });
          return null;
        });
        const settingData = pick(
          get(response, '[1].data.setting', {}),
          settingsDetail
        );
        if (get(tenantDetails, 'tenant_mode', false) === TENANT_MODE_CLIC) {
          setDeliverySlotActive(true);
        } else {
          setDeliverySlotActive(
            get(settingData, 'deliveryslot_management_active', false)
          );
        }
        settingData.deliveryslot_order_processing_time = moment(
          settingData.deliveryslot_order_processing_time,
          'HH:mm'
        ).isValid()
          ? moment(settingData.deliveryslot_order_processing_time, 'HH:mm')
          : '';
        setFormListData({ ...newData, ...settingData });
        setClosedData(dayList);
        setDeliverySlotData(data);
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

  const onValuesChange = (changedValues) => {
    if (changedValues) {
      setEnableSave(true);
    }
  };

  const onSwitchChange = (checked, dayName) => {
    setEnableSave(true);
    deliverySlotData.forEach((element) => {
      if (element.day_name === dayName) {
        element.is_active = checked;
      }
    });
    if (checked) {
      setClosedData({ ...closedData, [dayName]: 'Open' });
    } else {
      setClosedData({ ...closedData, [dayName]: 'Closed' });
    }
  };

  const getSwitchValue = (dayName) => {
    const data = deliverySlotData.find((item) => item.day_name === dayName);
    return get(data, 'is_active', '');
  };

  const onFinish = (values) => {
    const finalList = dayListMobile.length > 0 ? dayListMobile : formListData;
    setLoading(true);
    setButtonLoading(true);
    const mappingDataWeb = [];
    const daysData = [];
    let addSettingsData = {};
    if (deliverySlotActive) {
      const newData = omit(values, settingsDetail);
      const settingsData = pick(values, settingsDetail);
      addSettingsData = {
        ...settingsData,
        deliveryslot_management_active: deliverySlotActive,
        deliveryslot_order_processing_time: moment(
          get(settingsData, 'deliveryslot_order_processing_time', '')
        ).isValid()
          ? moment(
              get(settingsData, 'deliveryslot_order_processing_time', '')
            ).format('HH:mm')
          : '',
      };
      deliverySlotData.forEach((item) => {
        item.zm_delivery_slot = newData[item.day_name]
          ? [...newData[item.day_name]]
          : [];
      });
      deliverySlotData.forEach((item) => {
        const detData = pick(item, ['day_uid', 'is_active']);
        get(item, 'zm_delivery_slot', []).forEach((data) => {
          const value = { ...data };
          value.start_time = moment(get(data, 'start_time', '')).isValid()
            ? moment(get(data, 'start_time', '')).format('HH:mm')
            : '';
          value.end_time = moment(get(data, 'end_time', '')).isValid()
            ? moment(get(data, 'end_time', '')).format('HH:mm')
            : '';
          value.day_uid = item.day_uid;
          mappingDataWeb.push(value);
        });
        daysData.push(detData);
      });
    } else {
      addSettingsData = {
        deliveryslot_management_active: deliverySlotActive,
      };
    }
    let allValues;
    if (mobileView) {
      const previousData = pick(finalList, DAYS);
      const valuesData = pick(values, DAYS);
      const formatingData = map(toPairs(valuesData), (item) => {
        const dayName = get(item, '[0]');
        const updatedSchedule = map(get(item, '[1]'), (index) => {
          const matchingData = find(
            dataList,
            (index1) => get(index1, 'day_name') === dayName
          );
          return {
            start_time: get(index, 'start_time', ''),
            end_time: get(index, 'end_time', ''),
            is_active: get(index, 'is_active', ''),
            day_uid: get(matchingData, 'day_uid'),
          };
        });

        return [dayName, updatedSchedule];
      });
      const transformedObject = Object.fromEntries(formatingData);
      forOwn(transformedObject, (value, day) => {
        if (has(previousData, day)) {
          previousData[day] = cloneDeep(value);
        }
      });
      const result = Object.values(previousData).flat();
      allValues = map(result, (list) => ({
        start_time: moment(get(list, 'start_time', '')).format('HH:mm'),
        end_time: moment(get(list, 'end_time', '')).format('HH:mm'),
        is_active: get(list, 'is_active'),
        day_uid: get(list, 'day_uid'),
      }));
    }
    const mappingData = mobileView ? allValues : mappingDataWeb;
    const formData = {
      mappingData,
      addSettingsData,
      daysData,
      tenant_id: get(tenantDetails, 'zmTenantTenantId', ''),
    };
    createOrUpdateDeliverySlot(formData)
      .then((response) => {
        const { success, message } = response;
        if (success) {
          notification.success({ message });
          fetchData();
          setLoading(false);
          setButtonLoading(false);
          setEnableSave(false);
        }
      })
      .catch((error) => {
        notification.error({
          message: error.message || DELIVERY_SLOT_ADD_FAILED,
        });
        setLoading(false);
        setButtonLoading(false);
      });
  };

  const handeleSaveCancel = () => {
    fetchData();
  };

  const deliveryManagement = (event) => {
    setDeliverySlotActive(event);
    setEnableSave(true);
  };

  return (
    <Spin spinning={loading}>
      <div className="delivery-slot-main-container">
        {get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC && (
          <AddBookingSlot
            enableSave={enableSave}
            formListData={formListData}
            buttonLoading={buttonLoading}
            deliverySlotActive={deliverySlotActive}
            setEnableSave={(value) => setEnableSave(value)}
            onValuesChange={onValuesChange}
            onFinish={onFinish}
            handeleSaveCancel={handeleSaveCancel}
            onSwitchChange={onSwitchChange}
            getSwitchValue={getSwitchValue}
            from={TENANT_MODE_CLIC}
            mobileView={mobileView}
            setScreenState={setScreenState}
            setFormListData={setFormListData}
            setDayListMobile={setDayListMobile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            dataList={dataList}
          />
        )}
        {get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL && (
          <NormalDeliverySlot
            loading={loading}
            buttonLoading={buttonLoading}
            enableSave={enableSave}
            formListData={formListData}
            deliverySlotActive={deliverySlotActive}
            closedData={closedData}
            setEnableSave={(value) => setEnableSave(value)}
            onValuesChange={onValuesChange}
            onFinish={onFinish}
            handeleSaveCancel={handeleSaveCancel}
            onSwitchChange={onSwitchChange}
            getSwitchValue={getSwitchValue}
            deliveryManagement={deliveryManagement}
            from={TENANT_MODE_NORMAL}
            mobileView={mobileView}
            setScreenState={setScreenState}
            setFormListData={setFormListData}
            setDayListMobile={setDayListMobile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            dataList={dataList}
          />
        )}
      </div>
    </Spin>
  );
};

export default DeliverySlot;
