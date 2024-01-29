/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable unicorn/no-null */
/* eslint-disable unicorn/consistent-function-scoping */
import React, { useContext, useEffect } from 'react';
import {
  Table,
  Tag,
  Input,
  Form,
  Button,
  Select,
  DatePicker,
  Radio,
} from 'antd';
import { compact, kebabCase, times, get } from 'lodash';
import { EditOutlined } from '@ant-design/icons';
import moment from 'moment';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { labelColor } from '../../../shared/function-helper';
import { TenantContext } from '../../context/tenant-context';
import { paginationstyler } from '../../../shared/attributes-helper';

const { Option } = Select;
function CreateSyncTable(properties) {
  const {
    saveDisabled,
    setEdit,
    isEditing,
    loading,
    edit,
    activeTab,
    handleRowEdit,
    dataSource,
    pagination,
    handleTableChange,
    rowSelection,
    handleTableRadioChange,
    isMarketPlaceActive,
  } = properties;
  const [tenantDetails] = useContext(TenantContext);

  const daysGenerator = () => {
    const days = times(30, String).map((value) => `${Number(value) + 1} days`);
    const months = times(5, String).map(
      (value) => `${Number(value) + 1} weeks`
    );
    return [...days, ...months];
  };

  useEffect(() => {
    paginationstyler();
  }, [dataSource]);

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      width: 150,
    },
    {
      title: 'Variant',
      dataIndex: 'variant_name',
      width: 100,
      render: (text) => <Tag className="variant-tag">{text}</Tag>,
    },
    {
      title: 'Store Name',
      dataIndex: 'store_name',
      width: 150,
    },
    {
      title: 'Store Price',
      dataIndex: 'Store_Price',
      width: 150,
      render: (currency) => (
        <span>
          <CurrencyFormatter
            value={currency}
            type={get(tenantDetails, 'setting.currency', '')}
            language={get(tenantDetails, 'setting.currency_locale', '')}
          />
        </span>
      ),
    },
    {
      title: 'MRP Price',
      dataIndex: 'mrp_price',
      width: 150,
      render: (currency) => (
        <span>
          <CurrencyFormatter
            value={currency}
            type={get(tenantDetails, 'setting.currency', '')}
            language={get(tenantDetails, 'setting.currency_locale', '')}
          />
        </span>
      ),
    },
    {
      title: 'Active/In Active',
      dataIndex: 'active',
      width: 190,
      render: (text, record) => (
        <Radio.Group
          buttonStyle="solid"
          value={!!text}
          onChange={(event) => handleTableRadioChange(event, record)}
        >
          <Radio.Button name="enable" value>
            Active
          </Radio.Button>
          <Radio.Button name="disable" value={false}>
            In Active
          </Radio.Button>
        </Radio.Group>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      render: (text) => <Tag color={labelColor[kebabCase(text)]}>{text}</Tag>,
    },
    // {
    //   title: 'Action',
    //   dataIndex: 'action',
    //   fixed: 'right',
    //   width: edit?.editKey ? 130 : 80,
    //   render: (record, fields) => {
    //     const editable = isEditing(fields.id);
    //     return editable ? (
    //       <span className="save-btn">
    //         <div style={{ display: 'flex' }}>
    //           <Form.Item>
    //             <Button
    //               size="small"
    //               type="primary"
    //               htmlType="submit"
    //               className="save-btn"
    //               disabled={saveDisabled}
    //               loading={loading.tableLoader}
    //             >
    //               Save
    //             </Button>
    //           </Form.Item>
    //           <Form.Item>
    //             <Button
    //               size="small"
    //               type="default"
    //               onClick={() => setEdit({ ...edit, editKey: '' })}
    //               className="cancel-btn"
    //             >
    //               Cancel
    //             </Button>
    //           </Form.Item>
    //         </div>
    //       </span>
    //     ) : (
    //       <span>
    //         <Tag color="green" onClick={() => handleRowEdit(fields)}>
    //           <EditOutlined disabled={edit.editKey !== ''} />
    //         </Tag>
    //       </span>
    //     );
    //   },
    // },
  ];

  const getInputType = (dataIndex) => {
    if (['LPP', 'BPP', 'Reduction_Amount'].includes(dataIndex)) return 'number';
    if (['Delivery_Time'].includes(dataIndex)) return 'select';
    if (['Start_Date', 'End_Date'].includes(dataIndex)) return 'datePicker';
    return '';
  };

  const mergedColumns = columns.map((col) => {
    if (
      !['approved', 'rejected', 'failed'].includes(activeTab) &&
      ['notes'].includes(col.dataIndex)
    )
      return null;
    if (
      !['pending', 'approved'].includes(activeTab) &&
      ['action'].includes(col.dataIndex)
    )
      return null;
    if (['action'].includes(col.dataIndex) && !isMarketPlaceActive) return null;
    if (['notes'].includes(col.dataIndex) && activeTab === 'approved')
      return null;
    if (
      ['active'].includes(col.dataIndex) &&
      (!['approved'].includes(activeTab) || !isMarketPlaceActive)
    )
      return null;
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: getInputType(col.dataIndex),
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const disabledDate = (current) => {
    return current && current < moment().startOf('day');
  };

  const getEditableComponent = (index, children) => {
    switch (index) {
      case 'number': {
        return <Input type="number" />;
      }

      case 'select': {
        return (
          <Select virtual={false} size="small" allowClear>
            {daysGenerator().map((result) => (
              <Option value={result} key={result}>
                {result}
              </Option>
            ))}
          </Select>
        );
      }

      case 'datePicker': {
        return (
          <DatePicker
            showTime
            placeholder=""
            disabledDate={disabledDate}
            size="medium"
            format="YYYY-MM-DD"
          />
        );
      }
      default: {
        return children;
      }
    }
  };

  function EditableCell({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    myNumber,
    ...restProperties
  }) {
    return (
      <td {...restProperties}>
        {record?.id === edit.editKey ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `${title} is required!`,
              },
            ]}
          >
            {getEditableComponent(inputType, children)}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  }
  return (
    <Table
      components={{
        body: {
          cell: EditableCell,
        },
      }}
      className="grid-table box"
      rowKey={(record) => record?.marketplace_product_uid}
      rowSelection={
        ['pending'].includes(activeTab) && isMarketPlaceActive
          ? rowSelection
          : null
      }
      scroll={{ x: 800 }}
      columns={compact(mergedColumns)}
      dataSource={dataSource}
      pagination={pagination}
      loading={loading.tableLoader}
      onChange={handleTableChange}
    />
  );
}

export default CreateSyncTable;
