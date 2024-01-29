import { Table } from 'antd';
import React, { useEffect } from 'react';
import { paginationstyler } from '../../shared/attributes-helper';

const TableComponent = (properties) => {
  const {
    className = '',
    loading = false,
    tableData,
    pagination,
    columns,
    handleTableChange,
  } = properties;

  useEffect(() => {
    paginationstyler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);

  return (
    <Table
      className={className}
      columns={columns}
      loading={loading}
      dataSource={tableData}
      onChange={handleTableChange}
      pagination={pagination}
    />
  );
};

export default TableComponent;
