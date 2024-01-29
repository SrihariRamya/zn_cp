/* eslint-disable import/no-unresolved */
import React, { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useParams } from 'react-router';
import {
  Form,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  notification,
} from 'antd';
import { InputNumber, Tooltip } from 'antd/lib';
import {
  debounce,
  get,
  isEmpty,
  isNil,
  isUndefined,
  map,
  merge,
  omitBy,
  reduce,
} from 'lodash';
import { getStoresByProduct } from 'utils/api/url-helper';
import { DeleteAlert } from 'shared/sweetalert-helper';
import { FormOutlined } from '@ant-design/icons';
import moment from 'moment';
import EditForm from './edit-form';
import { ReactComponent as DeleteFilled } from '../../../assets/icons/delete-variant.svg';
import { ReactComponent as EditFilled } from '../../../assets/icons/edit-variant.svg';
import getAttributeIdByName from '../../../shared/attributes-helper';

function EditableCell(properties) {
  const {
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    attributeIds,
    column,
    ...restProperties
  } = properties;
  const inputNode = (
    <InputNumber
      style={{ width: '135px' }}
      controls={false}
      onKeyDown={(event) => {
        if (event.key === '-' || event.key === '.' || event.key === 'e') {
          event.preventDefault();
        }
      }}
      min={0}
      placeholder={`Enter ${title}`}
    />
  );

  return (
    <td {...restProperties}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            title === 'Selling Price' && {
              required: true,
              message: `Please Enter ${title}!`,
            },
            title === 'Discount %' && {
              pattern: /^(\d{1,2}|100)$/,
              message: 'Discount % should be less than 100.',
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        <div>{children}</div>
      )}
    </td>
  );
}

function VariantTable(properties) {
  const {
    filteredAttributesData,
    defaultAttributes,
    tableData,
    setTableData,
    setIsDelete,
    setDisabledSave,
    action,
    setLoading,
  } = properties;

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [editData, setEditData] = useState();
  const { id } = useParams();
  const variantId = getAttributeIdByName(
    defaultAttributes,
    ['name', 'Units'],
    '[0].attribute_id'
  );

  const stockId = getAttributeIdByName(
    defaultAttributes,
    ['name', 'Low Stock Level'],
    '[0].attribute_id'
  );
  const mrpId = getAttributeIdByName(
    defaultAttributes,
    ['name', 'MRP Price'],
    '[0].attribute_id'
  ).toString();

  const sellingPriceId = getAttributeIdByName(
    defaultAttributes,
    ['name', 'Selling Price'],
    '[0].attribute_id'
  ).toString();

  const discountId = getAttributeIdByName(
    defaultAttributes,
    ['name', 'Discount in %'],
    '[0].attribute_id'
  ).toString();
  const attributeIds = {
    mrpId,
    sellingPriceId,
    discountId,
  };
  const manufactureDataId = getAttributeIdByName(
    defaultAttributes,
    ['name', 'Manufacture date'],
    '[0].attribute_id'
  ).toString();
  const isEditing = (record) => record[variantId] === editingKey;
  const edit = (record) => {
    form.setFieldsValue({
      [variantId]: '',
      [mrpId]: '',
      [discountId]: '',
      [sellingPriceId]: '',
      ...record,
    });
    setEditingKey(record[variantId]);
  };
  const cancel = () => {
    setEditingKey('');
  };
  const fetchInventoryData = async (deleteData) => {
    const variantIds = await map(deleteData, (item) => {
      return item.id;
    });
    const parameter = {
      product_uid: id,
      product_variant_id: variantIds,
    };
    return new Promise((resolve, reject) => {
      getStoresByProduct(parameter)
        .then((response) => {
          const { data } = response;
          const { rows } = data;
          resolve(rows);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const handleDeleteSingleVariant = (data) => {
    const newData = tableData.filter(
      (item) => item[variantId] !== data[variantId]
    );
    setTableData(newData);
    setIsDelete(true);
  };
  const handleDeleteBulk = () => {
    if (selectedRowKeys.length === tableData.length) {
      setTableData([]);
      setSelectedRowKeys([]);
    } else {
      const filteredData = tableData.filter(
        (item) => !selectedRowKeys.includes(item)
      );
      setTableData(filteredData);
      setSelectedRowKeys([]);
    }
    setIsDelete(true);
  };

  const handleDelete = async (data, type) => {
    setLoading(true);
    const deletedData = type === 'single' ? [data] : data;
    const inventoryData = await fetchInventoryData(deletedData);
    setLoading(false);
    let text = '';
    text = isEmpty(inventoryData)
      ? `Are you sure to delete variant ${deletedData.map(
          (item) => item[variantId]
        )}?`
      : `Variant ${inventoryData.map(
          (item) => item.attribute_value
        )} is associated with inventory. Are you sure to delete?`;
    const result = await DeleteAlert(text, deletedData?.length);
    if (result.isConfirmed) {
      if (type === 'single') {
        handleDeleteSingleVariant(data);
      } else {
        handleDeleteBulk();
      }
    }
  };

  const onValuesChange = (changedValues, allValues) => {
    const sellingPrice = Number(allValues[sellingPriceId]);
    const mrpPrice = Number(allValues[mrpId]);
    const discountPercent = Number(allValues[discountId]);

    switch (true) {
      case changedValues[discountId] !== undefined: {
        if (changedValues[discountId] === 100) {
          if (mrpPrice || sellingPrice) {
            form.setFieldsValue({ [sellingPriceId]: 0 });
          }
        } else if (mrpPrice >= 0) {
          const sellingAmount = Number(
            mrpPrice - (mrpPrice * changedValues[discountId]) / 100
          ).toFixed(2);
          form.setFieldsValue({ [sellingPriceId]: sellingAmount });
        } else if (
          changedValues[discountId] !== 0 &&
          (mrpPrice || sellingPrice)
        ) {
          const mrpPrices = (
            sellingPrice /
            (1 - changedValues[discountId] / 100)
          ).toFixed(2);
          form.setFieldsValue({ [mrpId]: mrpPrices });
        }
        break;
      }

      case changedValues[mrpId] !== undefined ||
        changedValues[sellingPriceId] !== undefined: {
        if (changedValues[mrpId] && sellingPrice) {
          const discountPercentage = Math.round(
            ((changedValues[mrpId] - sellingPrice) / mrpPrice) * 100
          );
          form.setFieldsValue({
            [discountId]: Number(discountPercentage),
          });
        } else if (changedValues[sellingPriceId] && mrpPrice > 0) {
          const discountPercentage = Math.round(
            ((mrpPrice - changedValues[sellingPriceId]) / mrpPrice) * 100
          );
          form.setFieldsValue({ [discountId]: discountPercentage });
        } else if (changedValues[mrpId] && discountPercent) {
          const sellingAmount = Number(
            mrpPrice - (mrpPrice * discountPercent) / 100
          ).toFixed(2);
          form.setFieldsValue({ [sellingPriceId]: sellingAmount });
        } else if (changedValues[sellingPriceId] && discountPercent) {
          const mrpPrices = (
            sellingPrice /
            (1 - discountPercent / 100)
          ).toFixed(2);
          form.setFieldsValue({ [mrpId]: mrpPrices });
        }
        break;
      }

      default: {
        break;
      }
    }
  };

  const debouncedOnValuesChange = debounce(onValuesChange, 300);

  const onValuesDebounce = (changedValues, allValues) => {
    debouncedOnValuesChange(changedValues, allValues);
  };
  const customValidation = async () => {
    const values = await form.getFieldsValue();
    let validationError = '';
    const isMrpNull = isNil(values[mrpId]);
    if (!isMrpNull && Number(values[mrpId]) < Number(values[sellingPriceId])) {
      validationError = 'Selling Price cannot be greater than MRP';
      setDisabledSave(true);
    }
    return validationError;
  };

  const save = async (data) => {
    const priceError = await customValidation();
    if (isEmpty(priceError)) {
      try {
        const row = await form.getFieldsValue();
        const newData = [...tableData];
        const index = newData.findIndex(
          (item) => data[variantId] === item[variantId]
        );
        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            ...row,
          });
          setTableData(newData);
          setEditingKey('');
        } else {
          newData.push(row);
          setTableData(newData);
          setEditingKey('');
        }
      } catch (error) {
        notification.error({ message: error });
      }
    } else {
      notification.error({ message: priceError });
    }
  };
  const handleEditForm = (editObject) => {
    if (editObject) {
      reduce(
        Object.entries(editObject),
        (accumulator, [attributeId, value]) => {
          const attribute = filteredAttributesData.find(
            (attribute_) => attribute_.attribute_id.toString() === attributeId
          );
          if (
            attribute?.name !== 'MRP Price' ||
            attribute?.name !== 'Selling Price' ||
            attribute?.name !== 'Discount in %'
          ) {
            switch (get(attribute, 'data_type')) {
              case 'float':
              case 'percentage': {
                editObject[attributeId] = Number.parseFloat(value) || undefined;
                break;
              }
              case 'number': {
                editObject[attributeId] =
                  Number.parseInt(value, 10) || undefined;
                break;
              }
              case 'boolean': {
                editObject[attributeId] = value === '1' || value === 'true';
                break;
              }
              default: {
                editObject[attributeId] = value;
              }
            }
          }
          return accumulator;
        },
        {}
      );
      const momentDate = moment(editObject[manufactureDataId]);
      if (editObject[manufactureDataId]) {
        editObject[manufactureDataId] = momentDate;
      }
      setEditData(editObject);
      setShowEditForm(true);
    }
  };

  const handleStock = (value, row) => {
    const updatedData = tableData.map((item) => {
      if (item[variantId] === row[variantId]) {
        item[stockId] = value;
      }
      return item;
    });
    setTableData(updatedData);
  };
  const columns = [
    {
      title: 'Out Of Stock',
      hidden: false,
      name: 'stock',
      align: 'center',
      width: '12%',
      dataIndex: getAttributeIdByName(
        defaultAttributes,
        ['name', 'Low Stock Level'],
        '[0].attribute_id'
      ).toString(),
      render: (text, record) => (
        <Switch
          onClick={(value) => handleStock(value, record)}
          checked={Number(text)}
          size="small"
        />
      ),
    },
    {
      title: 'Variant Name',
      dataIndex: getAttributeIdByName(
        defaultAttributes,
        ['name', 'Units'],
        '[0].attribute_id'
      ).toString(),
      editable: false,
      width: '15%',
    },
    {
      title: 'MRP Price',
      dataIndex: getAttributeIdByName(
        defaultAttributes,
        ['name', 'MRP Price'],
        '[0].attribute_id'
      ).toString(),
      editable: true,
      width: '15%',
      render: (text) => {
        if (text === undefined) {
          return <div>Enter Price</div>;
        }
        return text;
      },
    },
    {
      title: 'Discount %',
      dataIndex: getAttributeIdByName(
        defaultAttributes,
        ['name', 'Discount in %'],
        '[0].attribute_id'
      ).toString(),
      editable: true,
      width: '15%',
      render: (text) => {
        if (text === undefined) {
          return <div>Enter Discount</div>;
        }
        return text;
      },
    },
    {
      title: 'Selling Price',
      dataIndex: getAttributeIdByName(
        defaultAttributes,
        ['name', 'Selling Price'],
        '[0].attribute_id'
      ).toString(),
      editable: true,
      width: '15%',
      render: (text) => {
        if (text === undefined) {
          return (
            <div /* className="input-variant-style" */>Enter Selling Price</div>
          );
        }
        return text;
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      align: 'center',
      width: '15%',
      render: (_, record) => {
        const editable = isEditing(record);
        if (editable) {
          return (
            <span>
              <Typography.Link
                onClick={() => save(record)}
                className="new-font-family"
                style={{
                  marginRight: 8,
                }}
              >
                Save
              </Typography.Link>
              <Popconfirm
                className="new-font-family"
                title="Sure to cancel?"
                onConfirm={cancel}
              >
                <Typography.Link className="new-font-family">
                  Cancel
                </Typography.Link>
              </Popconfirm>
            </span>
          );
        }
        return (
          <Space>
            <Tooltip title="Edit variant">
              <EditFilled
                disabled={editingKey !== ''}
                className="new-font-family"
                style={{ cursor: 'pointer' }}
                onClick={() => edit(record)}
              />
            </Tooltip>
            {action === 'edit' ? (
              <Typography.Link onClick={() => handleDelete(record, 'single')}>
                <DeleteFilled />
              </Typography.Link>
            ) : (
              <Tooltip title="Delete Variant">
                <Popconfirm
                  title="Sure to delete?"
                  onConfirm={() => handleDeleteSingleVariant(record)}
                >
                  <Typography.Link>
                    <DeleteFilled />
                  </Typography.Link>
                </Popconfirm>
              </Tooltip>
            )}
            <Tooltip title="Edit additional attributes">
              <Typography.Link onClick={() => handleEditForm(record)}>
                <FormOutlined />
              </Typography.Link>
            </Tooltip>
          </Space>
        );
      },
    },
  ];
  const handleUpdate = (values) => {
    setShowEditForm(false);
    const formData = merge(editData, omitBy(values[0], isUndefined));
    const updatedData = map(tableData, (item) => {
      if (item[1] === formData[1]) {
        return { ...item };
      }
      return item;
    });
    setTableData(updatedData);
  };
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'number',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  const rowSelection = {
    onChange: (selectedRowKey, selectedRow) => {
      setSelectedRowKeys(selectedRow);
    },
    getCheckboxProps: (record) => ({
      1: record[1],
      checked: selectedRowKeys.includes(record[1]),
    }),
  };

  return (
    <div className="variant-table-container">
      {!isEmpty(tableData) && (
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          {!isEmpty(tableData) && isEmpty(selectedRowKeys) ? (
            <p style={{ color: 'red' }}> Selling Price is mandatory *</p>
          ) : (
            <Tag
              color="red"
              style={{
                fontSize: '16px',
                cursor: 'pointer',
              }}
              className="new-font-family"
              onClick={() => handleDelete(selectedRowKeys, 'bulk')}
            >
              Delete
            </Tag>
          )}
        </div>
      )}

      <div className="mt-10 variant-scroll">
        <Form form={form} onValuesChange={onValuesDebounce} component={false}>
          <div className="variant-table">
            <Table
              className="table-form"
              components={{
                body: {
                  // eslint-disable-next-line react/no-unstable-nested-components
                  cell: (properties_) => (
                    <EditableCell
                      {...properties_}
                      attributeIds={attributeIds}
                      column={mergedColumns}
                    />
                  ),
                },
              }}
              columns={mergedColumns}
              rowKey={(record) => record[1]}
              rowSelection={rowSelection}
              bordered={false}
              dataSource={tableData}
              pagination={false}
              scroll={{
                y: 750,
                x: 1006,
              }}
            />
          </div>
        </Form>
      </div>
      {showEditForm && (
        <EditForm
          showEditForm={showEditForm}
          setShowEditForm={setShowEditForm}
          setEditData={setEditData}
          onFinish={handleUpdate}
          editData={editData}
          filteredAttributesData={filteredAttributesData}
          defaultAttributes={defaultAttributes}
          productData={{}}
        />
      )}
    </div>
  );
}

export default VariantTable;
