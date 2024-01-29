/* eslint-disable camelcase */
import { Col, Input } from 'antd';
import React, { useEffect, useState } from 'react';

const FieldName = ({ setChangeType, setValue, activeElement, type }) => {
  const { field_name = '' } = activeElement.element[`${type}_properties`];
  const [fieldName, setFieldName] = useState(field_name);
  const handleChangeFieldName = (event) => {
    setFieldName(event.target.value);
  };

  useEffect(() => {
    setChangeType('field_name');
    setValue(fieldName);
  }, [fieldName]);
  return (
    <Col span={24}>
      <table>
        <tbody>
          <tr>
            <td>Field Name</td>
            <td>
              <Input
                value={fieldName}
                onChange={handleChangeFieldName}
                placeholder="field_name"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Col>
  );
};

export default FieldName;
