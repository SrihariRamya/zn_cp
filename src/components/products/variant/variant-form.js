import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Select, notification } from 'antd';
import { Col, Row } from 'antd/lib';
import {
  concat,
  filter,
  find,
  flatMap,
  forEach,
  isEmpty,
  join,
  map,
  reduce,
} from 'lodash';
import { ReactComponent as DeleteFilled } from '../../../assets/icons/delete-variant.svg';
import getAttributeIdByName from '../../../shared/attributes-helper';

const isNameUnique = (value, index, fields) => {
  const name = value;
  if (!name) {
    return Promise.resolve();
  }
  const isDuplicate = filter(fields, (field, index_) => index_ !== index).some(
    (field) => field.name === name
  );
  if (isDuplicate) {
    return Promise.reject(new Error('Variant name already exist'));
  }
  return Promise.resolve();
};

const initialFormFields = (length) => {
  return Array.from({ length }, () => ({ name: '', options: [] }));
};

const generateCombinations = async (arrays) => {
  const result = reduce(
    arrays,
    (combinations, array) => {
      return flatMap(combinations, (combination) => {
        return map(array, (item) => concat(combination, item));
      });
    },
    [[]]
  );
  const formattedResult = result.map((combination) => join(combination, '/'));
  return formattedResult;
};

const handleKeyTag = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
};

function VariantForm(properties) {
  const {
    setTableData,
    defaultAttributes,
    getFormItemRules,
    tableData,
    setIsDelete,
    isDelete,
    variantOptions,
    variantFormData,
    checkData,
  } = properties;
  const [form] = Form.useForm();
  const [formFields, setFormFields] = useState([{ name: '', options: [] }]);
  const variantId = getAttributeIdByName(
    defaultAttributes,
    ['name', 'Units'],
    '[0].attribute_id'
  );
  const handleVariant = (nameArray, attributeArray) => {
    const result = [];
    map(nameArray, (name) => {
      const filterData = filter(tableData, (data) => data[variantId] === name);
      if (isEmpty(filterData)) {
        const dataObject = {};
        forEach(attributeArray, (attribute) => {
          dataObject[attribute.attribute_id] =
            attribute.attribute_id === variantId ? name : undefined;
        });
        result.push({ ...dataObject });
      } else {
        result.push({ ...filterData[0] });
      }
    });
    return result;
  };

  const handleAddField = () => {
    const lastVariantIndex = formFields.length - 1;
    const optionsValue = form.getFieldValue(['options', lastVariantIndex]);
    if (isEmpty(optionsValue)) {
      notification.error({
        message: 'Please enter Variant Options.',
      });
    } else if (formFields.length < 3) {
      setFormFields([...formFields, { name: '', options: [] }]);
    }
  };
  const checkSamePositionElements = () => {
    const values = form.getFieldsValue();
    const { options } = values;
    const updatedOptions = {};
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in options) {
      // eslint-disable-next-line array-callback-return
      map(options[key], (item) => {
        const findData = find(
          tableData,
          (data) => data[1].split('/')[key] === item
        );
        if (findData) {
          updatedOptions[key] = updatedOptions[key]
            ? [...updatedOptions[key], item]
            : [item];
        }
      });
    }

    if (isEmpty(tableData)) {
      form.resetFields();
      const initialFields = initialFormFields(1);
      setFormFields(initialFields);
    } else {
      form.setFieldsValue({
        options: updatedOptions,
      });
    }

    setIsDelete(false);
  };
  useEffect(() => {
    if (isDelete) {
      checkSamePositionElements();
    }
  }, [isDelete]);
  const getVariantOptionData = () => {
    const variantFormValues = form.getFieldsValue();
    const { name, options } = variantFormValues;
    const variantOptionData = map(name, (item, index) => {
      return {
        option_name: item,
        variant_option_values: map(
          options[index],
          (optionItem, optionIndex) => ({
            option_value: optionItem,
            order_key: optionIndex + 1,
          })
        ),
        order: index + 1,
      };
    });
    return variantOptionData;
  };
  const handleRemoveField = async (index) => {
    form.resetFields([
      ['name', index],
      ['options', index],
    ]);
    const newFormFields = [...formFields];
    newFormFields.splice(index, 1);
    setFormFields(newFormFields);
    const variantFormValues = form.getFieldsValue();
    const { options } = variantFormValues;
    const variantFormOptionData = getVariantOptionData();
    checkData(
      filter(
        variantFormOptionData,
        (item) => !isEmpty(item.variant_option_values)
      )
    );
    const optionData = filter(options, (item) => item !== undefined);
    const result = await generateCombinations(optionData);
    if (result) {
      const variantData = handleVariant(result, defaultAttributes);
      setTableData(variantData);
    }
  };

  const onValuesChange = async (changedValues) => {
    const variantFormOptionData = getVariantOptionData();
    checkData(variantFormOptionData);
    if (changedValues.options) {
      const variantFormValues = form.getFieldsValue();
      const { options } = variantFormValues;
      const optionData = filter(
        options,
        (item) => item !== undefined && item.length > 0
      );
      const result = await generateCombinations(optionData);
      const filteredResult = filter(result, (item) => item !== '');
      if (filteredResult) {
        const variantData = handleVariant(filteredResult, defaultAttributes);
        setTableData(variantData);
      }
    }
  };

  useEffect(() => {
    if (isEmpty(variantFormData.name)) {
      setFormFields(initialFormFields(1));
    } else {
      form.setFieldsValue(variantFormData);
      const { options } = variantFormData;
      const desiredLength = options.length;
      const initialFields = initialFormFields(desiredLength);
      setFormFields(initialFields);
    }
  }, [variantFormData]);

  return (
    <div className="variant-form">
      <Form
        form={form}
        name="dynamic_form_nest_item"
        layout="vertical"
        onValuesChange={onValuesChange}
        style={{
          maxWidth: 600,
        }}
        autoComplete="off"
        initialValues={{ users: formFields }}
      >
        {formFields.map((field, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index}>
            <div className="row-title">
              <span className="m-10 text-green-dark">{`Variant ${
                index + 1
              }`}</span>
            </div>
            <Card>
              <Row className="variant-name-section">
                <Col span={22}>
                  <Form.Item
                    name={['name', index]}
                    label="Variant Name"
                    rules={[
                      {
                        validator: (_, value) =>
                          isNameUnique(value, index, variantOptions),
                      },
                      ...getFormItemRules({
                        whitespace: true,
                      }),
                    ]}
                  >
                    <Input placeholder="Enter variant Name" type="text" />
                  </Form.Item>
                  <Form.Item
                    name={['options', index]}
                    label="Variant Options"
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const name = getFieldValue(['name', index]);
                          if (!name) {
                            if (value && value.length > 0) {
                              return Promise.reject(
                                new Error('Please enter Variant Name')
                              );
                            }
                            return Promise.resolve();
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <Select
                      mode="tags"
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                      className="tag-select"
                      onKeyDown={handleKeyTag}
                      tokenSeparators={[' ', ',', '/']}
                      placeholder="Enter variant Options"
                      dropdownStyle={{ display: 'none' }}
                      // eslint-disable-next-line unicorn/no-null
                      suffixIcon={null}
                    />
                  </Form.Item>
                </Col>
                {index === formFields.length - 1 && index !== 0 && (
                  <Col span={2}>
                    <DeleteFilled
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleRemoveField(index)}
                    />
                  </Col>
                )}
              </Row>
            </Card>
          </div>
        ))}
        {formFields.length < 3 && (
          <Form.Item
            className="mt-10"
            rules={[
              {
                validator: () => handleAddField,
              },
            ]}
          >
            <div>
              <Button
                className="variant-add-button"
                onClick={handleAddField}
                block
                icon={<PlusOutlined />}
              >
                Add Variant
              </Button>
            </div>
          </Form.Item>
        )}
      </Form>
    </div>
  );
}

export default VariantForm;
