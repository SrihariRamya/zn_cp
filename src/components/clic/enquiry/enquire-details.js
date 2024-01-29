import React from 'react';
import { Checkbox, Form, Input, Radio } from 'antd';
import { get, map } from 'lodash';
import {
  PRODUCT_FEILD_TYPE_CHECKBOX,
  PRODUCT_FEILD_TYPE_INPUT,
  PRODUCT_FEILD_TYPE_RADIO,
} from '../../../shared/constant-values';

const EnquireDetails = (properties) => {
  const { field } = properties;
  return (
    <div>
      {field?.type === PRODUCT_FEILD_TYPE_INPUT && (
        <Form.Item
          label={field?.label}
          name={field?.vlaue}
          value={field?.value}
          key={field?.id}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <Input value={field?.value} disabled />
        </Form.Item>
      )}
      {field?.type === PRODUCT_FEILD_TYPE_RADIO && (
        <Form.Item
          label={field?.label}
          name={field?.label}
          key={field?.id}
          initialValue={field?.value}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <Radio.Group className="ec-form-item-radio">
            {map(get(field, 'options', []), (option) => (
              <>
                <Radio disabled value={option?.value} key={option?.id}>
                  {option?.label}
                </Radio>
              </>
            ))}
          </Radio.Group>
        </Form.Item>
      )}
      {field?.type === PRODUCT_FEILD_TYPE_CHECKBOX && (
        <Form.Item
          label={field?.label}
          name={field?.label}
          key={field?.id}
          initialValue={field?.value}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <Checkbox.Group>
            {map(get(field, 'options', []), (option) => (
              <>
                <Checkbox disabled value={option?.value} key={option?.id}>
                  {option?.label}
                </Checkbox>
              </>
            ))}
          </Checkbox.Group>
        </Form.Item>
      )}
    </div>
  );
};
export default EnquireDetails;
