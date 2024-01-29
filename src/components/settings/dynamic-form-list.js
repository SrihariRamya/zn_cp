import React, { useContext, useState } from 'react';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { Form, Switch, TimePicker, Row, Button, Col } from 'antd';
import moment from 'moment';
import { TenantContext } from '../context/tenant-context';
import { ReactComponent as DeleteIcon } from '../../assets/icons/clic/noun-delete.svg';
import { TENANT_MODE_CLIC } from '../../shared/constant-values';

function DynamicFormList(properties) {
  const { formListName, form, format, deliverySlotActive, from } = properties;
  const [check, setCheck] = useState(false);
  const mobileView = useContext(TenantContext)[4];

  const getFormItemRules = ({ startTime, listName, key, endTime }, fields) => {
    const rulesData = [];
    if (startTime) {
      rulesData.push({
        validator: (_, value) => {
          const checkValue = moment(value).isValid()
            ? moment(value).format('HH:mm:ss')
            : null;
          let flag = false;
          fields.map((item) => {
            if (value && item.name !== key) {
              const stTime = moment(
                form.getFieldValue([listName, item.name, 'start_time'])
              ).format('HH:mm:ss');
              const edTime = moment(
                form.getFieldValue([listName, item.name, 'end_time'])
              ).format('HH:mm:ss');
              if (
                checkValue === stTime ||
                moment(checkValue, 'HH:mm:ss').isBetween(
                  moment(stTime, 'HH:mm:ss'),
                  moment(edTime, 'HH:mm:ss'),
                  'time'
                )
              ) {
                flag = true;
              }
            }
            return null;
          });

          return flag
            ? Promise.reject(new Error('Slot already exits'))
            : Promise.resolve();
        },
      });
    }
    if (endTime) {
      rulesData.push({
        validator: (_, value) => {
          const checkValue = moment(value).isValid()
            ? moment(value).format('HH:mm:ss')
            : null;
          const startTimeValue = moment(
            form.getFieldValue([listName, key, 'start_time'])
          );
          if (value && moment(value).isSame(startTimeValue, 'time')) {
            return Promise.reject(
              new Error('Start time and end time are same')
            );
          }
          if (value && moment(value).isBefore(startTimeValue, 'time')) {
            return Promise.reject(
              new Error('End time must be after start time')
            );
          }
          let flag = false;
          fields.map((item) => {
            if (value && item.name !== key) {
              const starterTime = moment(
                form.getFieldValue([listName, item.name, 'start_time'])
              ).format('HH:mm:ss');
              const endingTime = moment(
                form.getFieldValue([listName, item.name, 'end_time'])
              ).format('HH:mm:ss');
              if (
                moment(starterTime, 'HH:mm:ss').isSameOrBefore(
                  moment(checkValue, 'HH:mm:ss')
                ) &&
                moment(checkValue, 'HH:mm:ss').isSameOrAfter(
                  moment(endingTime, 'HH:mm:ss')
                )
              ) {
                if (
                  moment(endingTime, 'HH:mm:ss').isSameOrBefore(
                    moment(startTimeValue, 'HH:mm:ss')
                  ) === false
                )
                  flag = true;
              } else if (
                moment(checkValue, 'HH:mm:ss').isBetween(
                  moment(starterTime, 'HH:mm:ss'),
                  moment(endingTime, 'HH:mm:ss'),
                  'time'
                )
              ) {
                flag = true;
              }
            }
            return null;
          });
          return flag
            ? Promise.reject(new Error('Already Slot Exists'))
            : Promise.resolve();
        },
      });
    }
    return rulesData;
  };

  const onChanged = () => {
    setCheck(!check);
  };

  const onAddChanged = () => {
    const fieldValues = form.getFieldsValue();
    const list = fieldValues[formListName];
    const addMoreLocation = [
      ...list,
      {
        is_active: true,
      },
    ];
    fieldValues[formListName] = addMoreLocation;
    form.setFieldsValue(fieldValues);
  };

  const onStartTimeChange = (time, key, listName) => {
    const addEndTime = moment(time).add(30, 'minutes');
    form.setFields([
      {
        name: [listName, key, 'end_time'],
        value: addEndTime,
        errors: [],
      },
    ]);
  };

  return (
    <Form.List name={formListName}>
      {(fields, { add, remove }) => {
        return (
          <Row className="delivery-slot-list">
            <Col
              xs={24}
              sm={24}
              style={fields.length === 0 && { display: 'none' }}
            >
              {fields.map((field, index) => {
                return (
                  <div key={field.key}>
                    <Row style={!mobileView && { flexWrap: 'nowrap' }}>
                      <Col
                        xs={24}
                        sm={24}
                        md={14}
                        lg={14}
                        xl={14}
                        style={{ display: 'flex', gap: '20px' }}
                        className="form-col"
                      >
                        {from !== TENANT_MODE_CLIC && (
                          <Form.Item
                            name={[field.name, 'is_active']}
                            valuePropName="checked"
                            fieldKey={[field.fieldKey, 'is_active']}
                          >
                            <Switch
                              disabled={deliverySlotActive}
                              onChange={onChanged}
                              size="small"
                              className="switch-container"
                            />
                          </Form.Item>
                        )}
                        <Form.Item
                          rules={[
                            {
                              required: true,
                              message: 'enter start time',
                            },
                            ...getFormItemRules(
                              {
                                startTime: true,
                                listName: formListName,
                                key: field.name,
                              },
                              fields
                            ),
                          ]}
                          name={[field.name, 'start_time']}
                          fieldKey={[field.fieldKey, 'start_time']}
                          className="delivery-slot-timer-form"
                        >
                          <TimePicker
                            shouldUpdate
                            disabled={
                              (from !== TENANT_MODE_CLIC &&
                                !form.getFieldValue([
                                  formListName,
                                  field.name,
                                  'is_active',
                                ])) ||
                              deliverySlotActive
                            }
                            allowClear={false}
                            format={format}
                            placeholder="Start time"
                            onChange={(time) =>
                              onStartTimeChange(time, field.name, formListName)
                            }
                            className="delivery-slot-timer"
                            inputReadOnly
                          />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'end_time']}
                          rules={[
                            {
                              required: true,
                              message: 'enter end time',
                            },
                            ...getFormItemRules(
                              {
                                endTime: true,
                                listName: formListName,
                                key: field.name,
                              },
                              fields
                            ),
                          ]}
                          fieldKey={[field.fieldKey, 'end_time']}
                          className="delivery-slot-timer-form"
                        >
                          <TimePicker
                            disabled={
                              (from !== TENANT_MODE_CLIC &&
                                !form.getFieldValue([
                                  formListName,
                                  field.name,
                                  'is_active',
                                ])) ||
                              deliverySlotActive
                            }
                            allowClear={false}
                            placeholder="End time"
                            className="delivery-slot-timer"
                            format={format}
                            hideDisabledOptions
                            disabledHours={() => {
                              const minHour = form.getFieldValue([
                                formListName,
                                field.name,
                                'start_time',
                              ])
                                ? form
                                    .getFieldValue([
                                      formListName,
                                      field.name,
                                      'start_time',
                                    ])
                                    .hours()
                                : -1;
                              const maxHour = 24;
                              return Array.from(
                                { length: 24 },
                                (v, k) => k
                              ).filter(
                                (hour) => hour < minHour || hour > maxHour
                              );
                            }}
                            inputReadOnly
                          />
                        </Form.Item>
                        {from === TENANT_MODE_CLIC ? (
                          <Form.Item>
                            <DeleteIcon
                              style={{
                                margin: '8px 16px',
                                cursor: 'pointer',
                              }}
                              disabled={deliverySlotActive}
                              onClick={() => {
                                remove(field.name);
                                form.validateFields([]);
                              }}
                            />
                          </Form.Item>
                        ) : (
                          <Form.Item>
                            <Button
                              className="btn-delivery-close"
                              onClick={() => {
                                remove(field.name);
                                form.validateFields([]);
                              }}
                              icon={<CloseOutlined />}
                              disabled={deliverySlotActive}
                            />
                          </Form.Item>
                        )}
                      </Col>
                      <Col
                        xs={24}
                        sm={24}
                        md={8}
                        lg={8}
                        xl={8}
                        className="btn-col flexbox-center-mobile"
                        style={
                          mobileView &&
                          fields.length !== index + 1 && { display: 'none' }
                        }
                      >
                        {fields.length === index + 1 ? (
                          <Form.Item>
                            <Button
                              className={
                                from === TENANT_MODE_CLIC
                                  ? 'clic-btn-delivery'
                                  : 'btn-delivery text-green-dark'
                              }
                              type="primary"
                              onClick={() => {
                                onAddChanged();
                              }}
                              icon={<PlusOutlined />}
                              disabled={deliverySlotActive}
                            >
                              <span>Add Slot</span>
                            </Button>
                          </Form.Item>
                        ) : (
                          <Form.Item>
                            <Button
                              className={
                                from === TENANT_MODE_CLIC
                                  ? 'clic-btn-delivery'
                                  : 'btn-delivery text-green-dark'
                              }
                              type="primary"
                              style={{ visibility: 'hidden' }}
                              icon={<PlusOutlined />}
                              disabled={deliverySlotActive}
                            >
                              <span>Add Slot</span>
                            </Button>
                          </Form.Item>
                        )}
                      </Col>
                    </Row>
                  </div>
                );
              })}
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}
              xl={24}
              className="flexbox-center-mobile"
            >
              {fields.length === 0 ? (
                <Row justify={from === TENANT_MODE_CLIC ? 'end' : 'start'}>
                  <Form.Item>
                    <Button
                      className={
                        from === TENANT_MODE_CLIC
                          ? 'clic-btn-delivery'
                          : 'btn-delivery text-green-dark'
                      }
                      type="primary"
                      onClick={() => {
                        onAddChanged();
                      }}
                      icon={<PlusOutlined />}
                      disabled={deliverySlotActive}
                    >
                      <span>Add Slot</span>
                    </Button>
                  </Form.Item>
                </Row>
              ) : null}
            </Col>
          </Row>
        );
      }}
    </Form.List>
  );
}

export default DynamicFormList;
