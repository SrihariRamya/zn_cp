import React from 'react';
import { Form, Checkbox, Radio, Input } from 'antd';
import {
  PRODUCT_FEILD_TYPE_CHECKBOX,
  PRODUCT_FEILD_TYPE_INPUT,
  PRODUCT_FEILD_TYPE_RADIO,
} from '../../../shared/constant-values';

const InputFieldList = (properties) => {
  const { enquiryFeilds } = properties;
  const [form] = Form.useForm();
  return (
    <Form layout="vertical" form={form}>
      {enquiryFeilds.map((item) => {
        if (item.type === PRODUCT_FEILD_TYPE_INPUT) {
          return (
            <Form.Item
              key={item?.id}
              label={item?.label}
              name={item?.label.toLocaleLowerCase()}
              rules={[
                {
                  required: item?.required || false,
                },
              ]}
            >
              <Input disabled />
            </Form.Item>
          );
        }
        if (item.type === PRODUCT_FEILD_TYPE_RADIO) {
          return (
            <Form.Item
              key={item?.id}
              label={item?.label}
              name={item?.label.toLocaleLowerCase()}
              rules={[
                {
                  required: item?.required || false,
                },
              ]}
            >
              <Radio.Group>
                {item.options.map((option) => {
                  return (
                    <Radio value={option.value} key={option?.id}>
                      {option.label}
                    </Radio>
                  );
                })}
              </Radio.Group>
            </Form.Item>
          );
        }
        if (item.type === PRODUCT_FEILD_TYPE_CHECKBOX) {
          return (
            <Form.Item
              key={item?.id}
              label={item?.label}
              name={item?.label.toLocaleLowerCase()}
              rules={[
                {
                  required: item?.required || false,
                },
              ]}
            >
              <Checkbox.Group options={item.options} />
            </Form.Item>
          );
        }
        return null;
      })}
    </Form>
  );
};

export default InputFieldList;
