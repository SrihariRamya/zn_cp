import React, { useState } from 'react';
import { Col, Row } from 'antd/lib';
import VariantForm from './variant-form';
import VariantTable from './variant-table';

function Variant(properties) {
  const {
    filteredAttributesData,
    getFormItemRules,
    defaultAttributes,
    setDefaultAttributes,
    tableData,
    setTableData,
    variantOptions,
    variantFormData,
    setDisabledSave,
    action,
    setLoading,
    checkData,
  } = properties;
  const [formattedData, setFormattedData] = useState([]);
  const [isDelete, setIsDelete] = useState('');
  return (
    <Row style={{ gap: '40px' }} className="variant-form-row">
      <Col xs={16} sm={16} md={8} lg={6} xl={6}>
        <VariantForm
          filteredAttributesData={filteredAttributesData}
          setDefaultAttributes={setDefaultAttributes}
          defaultAttributes={defaultAttributes}
          setFormattedData={setFormattedData}
          setTableData={setTableData}
          tableData={tableData}
          formattedData={formattedData}
          getFormItemRules={getFormItemRules}
          setIsDelete={setIsDelete}
          isDelete={isDelete}
          checkData={checkData}
          variantOptions={variantOptions}
          variantFormData={variantFormData}
          setDisabledSave={setDisabledSave}
        />
      </Col>
      <Col md={8} lg={17} xl={17}>
        <VariantTable
          filteredAttributesData={filteredAttributesData}
          setDefaultAttributes={setDefaultAttributes}
          tableData={tableData}
          defaultAttributes={defaultAttributes}
          getFormItemRules={getFormItemRules}
          setTableData={setTableData}
          setIsDelete={setIsDelete}
          isDelete={isDelete}
          setDisabledSave={setDisabledSave}
          action={action}
          setLoading={setLoading}
        />
      </Col>
    </Row>
  );
}

export default Variant;
