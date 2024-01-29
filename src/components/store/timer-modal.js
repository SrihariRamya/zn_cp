import {
  Row,
  Col,
  Form,
  Radio,
  Space,
  Input,
  Modal,
  Button,
  Tooltip,
  DatePicker,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import { InfoCircleOutlined } from '@ant-design/icons';
import { get, includes, isEmpty, isUndefined, map } from 'lodash';
import { extractDate, disabledPreviousDate } from '../../shared/date-helper';
import {
  storeOffline,
  STORE_OFFLINE_STATUS_NOTE,
  STORE_INITIAL_STATUS_MESSAGE,
  DATE_AND_TIME_WITH_SECOND_FORMAT,
} from '../../shared/constant-values';

const { Text } = Typography;
const { RangePicker } = DatePicker;

function TimerModal(parameters) {
  const { handleStoreOpen, statusStoreUid, setStatusVisible } = parameters;
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [textColor, setTextColor] = useState('');
  const [colorModal, setColorModal] = useState(false);
  const [offlineValue, setOfflineValue] = useState('0');

  const handleClick = () => {
    setEditMode(true);
  };
  const onFinish = async (values) => {
    const currentTime = new Date();
    let startDate;
    let expiryDate;
    values.offline_time = offlineValue === '0' ? '' : values?.offline_time;
    if (offlineValue === 'custom') {
      startDate = extractDate(get(values, 'custom_offline_validity.[0]', ''));
      expiryDate = extractDate(get(values, 'custom_offline_validity.[1]', ''));
    } else {
      startDate = extractDate(currentTime);
      if (includes(values?.offline_time, 30)) {
        expiryDate = extractDate(
          new Date(currentTime.getTime() + values.offline_time * 60_000)
        );
      } else {
        const minutes = values.offline_time * 60;
        expiryDate = extractDate(
          new Date(currentTime.getTime() + minutes * 60_000)
        );
      }
    }
    if (
      isUndefined(values?.offline_message) ||
      isEmpty(values?.offline_message)
    ) {
      values.offline_message = STORE_INITIAL_STATUS_MESSAGE;
    }
    values.offline_end_time_stamp = offlineValue === '0' ? '' : expiryDate;
    values.offline_start_time_stamp = offlineValue === '0' ? '' : startDate;
    values.offline_color = textColor;
    await handleStoreOpen({ values, ...statusStoreUid });
    setStatusVisible(false);
    setEditMode(false);
    setTextColor('');
    form.resetFields();
    setTimeout(() => {
      setOfflineValue('0');
    }, 1000);
  };
  return (
    <div className="status-timing-container">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row>
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Radio.Group
              onChange={(event) => setOfflineValue(event.target.value)}
              value={offlineValue}
            >
              <Form.Item name="offline_time" label="Go offline for next">
                <Space direction="vertical">
                  {map(storeOffline, (item) => (
                    <Radio
                      key={get(item, 'id', '')}
                      value={get(item, 'value', '')}
                    >
                      {get(item, 'name', '')}
                    </Radio>
                  ))}
                </Space>
              </Form.Item>
            </Radio.Group>
          </Col>
        </Row>
        {offlineValue === 'custom' && (
          <div className="responsive-range-picker">
            <Form.Item name="custom_offline_validity">
              <RangePicker
                showTime
                size="large"
                format={DATE_AND_TIME_WITH_SECOND_FORMAT}
                disabledDate={disabledPreviousDate}
                inputReadOnly
              />
            </Form.Item>
          </div>
        )}
        <div className="store-color-picker">
          <Row
            className="color-picker-container"
            onClick={() => setColorModal(true)}
          >
            <span
              style={{
                backgroundColor: isEmpty(textColor) ? '#222' : textColor,
              }}
              className="store-bg-color"
            />
            &nbsp;
            <div>{isEmpty(textColor) ? '#000000' : textColor}</div>
          </Row>
        </div>
        <Form.Item
          name="offline_message"
          label={
            <>
              Store Status Message &nbsp;
              <Tooltip title={STORE_OFFLINE_STATUS_NOTE}>
                <InfoCircleOutlined className="cursor-pointer" />
              </Tooltip>
            </>
          }
        >
          {editMode ? (
            <Input placeholder="Enter display message when your online store is closed or offline" />
          ) : (
            <div className="store-mesg">
              <Text onClick={handleClick} style={{ cursor: 'pointer' }}>
                {STORE_INITIAL_STATUS_MESSAGE}
              </Text>
            </div>
          )}
        </Form.Item>
        <Form.Item>
          <Row justify="end">
            <Button type="primary" htmlType="submit">
              Confirm
            </Button>
          </Row>
        </Form.Item>
      </Form>
      <Modal
        title="Color Picker"
        visible={colorModal}
        open={colorModal}
        onCancel={() => setColorModal(false)}
        onOk={() => setColorModal(false)}
        width={269}
        destroyOnClose
        className="color-picker-modal"
      >
        <SketchPicker
          color={textColor}
          onChange={(event) => {
            setTextColor(get(event, 'hex', ''));
          }}
        />
      </Modal>
    </div>
  );
}

export default TimerModal;
