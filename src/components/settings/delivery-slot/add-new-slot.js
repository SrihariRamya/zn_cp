import {
  Button,
  Checkbox,
  Col,
  Divider,
  Modal,
  Row,
  Space,
  Switch,
  TimePicker,
  notification,
} from 'antd';
import { filter, map, some, uniq } from 'lodash';
import moment from 'moment';
import React, { useState } from 'react';
import { TENANT_MODE_CLIC } from '../../../shared/constant-values';

const CheckboxGroup = Checkbox.Group;

const showError = (message) => {
  notification.error({ message });
};

function AddNewSlot(properties) {
  const plainOptions = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const defaultCheckedList = [];
  const {
    form,
    deliverySlotActive,
    setEnableSave,
    formListData,
    mobileView,
    setDayListMobile,
    dataList,
    from,
  } = properties;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [slotExist, setSlotExist] = useState(false);
  const [checkedList, setCheckedList] = useState(defaultCheckedList);
  const checkAll = plainOptions.length === checkedList.length;
  const indeterminate =
    checkedList.length > 0 && checkedList.length < plainOptions.length;
  const handleBetweenValidation = (
    list,
    updatedStartTime,
    updatedEndTime,
    field
  ) => {
    const resultStartTime = field === 'input' ? updatedStartTime : startTime;
    const resultEndTime = field === 'input' ? updatedEndTime : endTime;
    const fieldValues = mobileView ? formListData : form.getFieldsValue();
    const error = [];
    filter(list, (days) => {
      const previousList = fieldValues[days];
      const stTime = moment(resultStartTime, 'HH:mm:ss');
      const edTime = moment(resultEndTime, 'HH:mm:ss');
      const hasOverlap = some(previousList, (previous) => {
        const checkValue = moment(previous.start_time, 'HH:mm:ss');
        return checkValue.isBetween(stTime, edTime);
      });
      if (hasOverlap) {
        error.push(`${days}`);
      }
      return !hasOverlap;
    });
    filter(list, (days) => {
      const previousList = fieldValues[days];
      const starterTime = moment(resultStartTime, 'HH:mm:ss');
      const endingTime = moment(resultEndTime, 'HH:mm:ss');

      const overlapping = some(previousList, (previous) => {
        const checkValue = moment(previous.end_time, 'HH:mm:ss');

        const overlap =
          (starterTime.isSameOrBefore(checkValue) &&
            endingTime.isSameOrAfter(checkValue)) ||
          checkValue.isBetween(starterTime, endingTime) ||
          (checkValue.isSameOrAfter(starterTime) &&
            checkValue.isSameOrBefore(endingTime));

        if (overlap) {
          error.push(`${days}`);
        }

        return overlap;
      });

      return overlapping;
    });
    const result = uniq(error);
    if (error.length > 0) {
      showError(`Same slot already exist for ${result.join(', ')}`);
      setSlotExist(true);
    } else {
      setSlotExist(false);
    }
  };
  const onChange = (list) => {
    handleBetweenValidation(list);
    setCheckedList(list);
  };
  const onCheckAllChange = (event) => {
    const list = event.target.checked ? plainOptions : [];
    handleBetweenValidation(list);
    setCheckedList(list);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setEnableSave(true);
    setIsModalOpen(false);
    setCheckedList([]);
    setStartTime('');
    setEndTime('');
    setIsActive(true);
    setDayListMobile([]);
  };

  const handleTime = (event, type) => {
    let updatedStartTime;
    let updatedEndTime;

    if (type === 'start') {
      updatedStartTime = event;
      updatedEndTime = moment(event).add(30, 'minutes');
      setStartTime(updatedStartTime);
      setEndTime(updatedEndTime);
    } else {
      updatedEndTime = event;
      setEndTime(updatedEndTime);
    }

    if (checkedList.length > 0) {
      handleBetweenValidation(
        checkedList,
        updatedStartTime || startTime,
        updatedEndTime || endTime,
        'input'
      );
    }
  };

  const handleClickTime = (type) => {
    if (type === 'start') {
      setStartTime('');
    } else {
      setEndTime('');
    }
  };
  const handleAddTimeSlots = () => {
    if (endTime) {
      const startTimeValue = moment(startTime);
      if (endTime && moment(endTime).isSame(startTimeValue, 'time')) {
        return showError('Start time and end time are same');
      }
      if (endTime && moment(endTime).isBefore(startTimeValue, 'time')) {
        return showError('End time must be after start time');
      }
    }
    if (checkedList.length === 0) {
      showError('Kindly select a slot');
    } else if (slotExist) {
      showError('Same slot already taken');
    } else {
      const fieldValues = mobileView ? formListData : form.getFieldsValue();
      map(dataList, (data) => {
        map(checkedList, (list) => {
          if (data.day_name === list) {
            const result = {
              is_active: isActive,
              start_time: startTime,
              end_time: endTime,
              day_uid: data.day_uid,
            };
            fieldValues[list] = [...fieldValues[list], result];
          }
        });
      });

      form.setFieldsValue(fieldValues);
      setDayListMobile(fieldValues);
      setEnableSave(true);
      setIsModalOpen(false);
      setCheckedList([]);
      setStartTime('');
      setEndTime('');
      setIsActive(true);
    }
    return '';
  };

  return (
    <div className="add-new-slot">
      <Button type="primary" onClick={showModal} disabled={!deliverySlotActive}>
        Add New Slots
      </Button>
      <Modal
        title="Add Slot"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={false}
        className="settings-payment-modal"
        centered
      >
        <Row>
          {from !== TENANT_MODE_CLIC && (
            <Col
              xs={6}
              sm={6}
              md={10}
              lg={10}
              xl={10}
              className="flexbox-center"
            >
              <Switch
                size="small"
                className="switch-container"
                onChange={(event) => setIsActive(event)}
                checked={isActive}
              />
            </Col>
          )}
          <Col
            xs={9}
            sm={9}
            md={from === TENANT_MODE_CLIC ? 12 : 6}
            lg={from === TENANT_MODE_CLIC ? 12 : 6}
            xl={from === TENANT_MODE_CLIC ? 12 : 6}
          >
            <TimePicker
              shouldUpdate
              allowClear={false}
              placeholder="Start time"
              className="delivery-slot-timer"
              format="h:mm a"
              onChange={(event) => handleTime(event, 'start')}
              onClick={() => handleClickTime('start')}
              value={startTime}
              inputReadOnly
            />
          </Col>
          <Col
            xs={9}
            sm={9}
            md={from === TENANT_MODE_CLIC ? 12 : 6}
            lg={from === TENANT_MODE_CLIC ? 12 : 6}
            xl={from === TENANT_MODE_CLIC ? 12 : 6}
          >
            <TimePicker
              allowClear={false}
              placeholder="End time"
              className="delivery-slot-timer"
              hideDisabledOptions
              format="h:mm a"
              onChange={(event) => handleTime(event, 'end')}
              onClick={() => handleClickTime('end')}
              value={endTime}
              disabledTime={() => {
                const minHour = startTime;
                const maxHour = 24;
                return Array.from({ length: 24 }, (v, k) => k).filter(
                  (hour) => hour < minHour || hour > maxHour
                );
              }}
              inputReadOnly
            />
          </Col>
        </Row>
        <Divider />
        <Row className="delivery-slot-checkbox">
          <Checkbox
            indeterminate={indeterminate}
            onChange={onCheckAllChange}
            checked={checkAll}
            disabled={startTime === '' && endTime === ''}
          >
            Check all
          </Checkbox>
          <CheckboxGroup
            options={plainOptions}
            value={checkedList}
            onChange={onChange}
            style={{ display: 'flex', columnGap: '45px' }}
            disabled={startTime === '' && endTime === ''}
          />
        </Row>
        <Space className="flexbox-end">
          <Button onClick={handleCancel} type="default">
            Cancel
          </Button>
          <Button onClick={handleAddTimeSlots} type="primary">
            Add
          </Button>
        </Space>
      </Modal>
    </div>
  );
}

export default AddNewSlot;
