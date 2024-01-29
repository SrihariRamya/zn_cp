/* eslint-disable camelcase */
import { Col } from 'antd';
import { get } from 'lodash';
import React, { useEffect, useState, useContext } from 'react';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { TenantContext } from '../../context/tenant-context';

const LabelComp = ({ properties, dataSource }) => {
  const [tenantDetails] = useContext(TenantContext);
  const tenantInfo = get(tenantDetails, 'setting', {});
  const {
    label: { label_name = '', labelStyle },
    dataField = '',
  } = properties.column_properties;
  const [label, setLabel] = useState('');
  const [asCurrencyFormat, setAsCurrencyFormat] = useState(false);

  useEffect(() => {
    if (dataField) {
      let result = dataSource[dataField];
      if (result) {
        if (typeof result === 'number') result = result.toString();
        if (result?.includes('{' || '}')) {
          const value = JSON.parse(result);
          setLabel(get(value, 'status', '{}'));
        } else {
          setLabel(result);
        }
      } else {
        setLabel(label_name);
      }
    } else {
      setLabel(label_name);
    }
    if (
      get(properties, 'column_properties.label.label_type', '') === 'currency'
    ) {
      setAsCurrencyFormat(true);
    } else {
      setAsCurrencyFormat(false);
    }
  }, [
    dataSource,
    dataSource.selling_price,
    dataSource.mrp_price,
    dataField,
    properties,
    label_name,
    properties.column_properties.label.label_name,
  ]);
  if (label?.includes('{' || '}')) return null;
  if (label === '0' && dataField === 'mrp_price') return null;
  if (label === '( 0% OFF )' && dataField === 'discount_price') return null;
  return (
    <Col span={24}>
      <p style={{ ...labelStyle }}>
        {asCurrencyFormat ? (
          <CurrencyFormatter
            value={label}
            type={get(tenantInfo, 'currency', 'INR')}
          />
        ) : (
          label
        )}
      </p>
    </Col>
  );
};
export default LabelComp;
