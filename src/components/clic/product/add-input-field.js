import React from 'react';
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Space,
  Switch,
} from 'antd';
import { map } from 'lodash';
import { uuid } from 'uuidv4';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/clic/noun-delete.svg';
import {
  PRODUCT_FEILD_TYPE_CHECKBOX,
  PRODUCT_FEILD_TYPE_RADIO,
} from '../../../shared/constant-values';

const AddInputFieldList = ({ fields, setAddInputs }) => {
  const handleDelete = (item) => {
    setAddInputs(fields.filter((value) => value.id !== item.id));
  };

  const handleOptionsDelete = (item, options, type) => {
    setAddInputs(
      fields.map((value) => {
        if (item.id === value.id && value.type === type) {
          const filterOptions = value.options.filter(
            (optionValue) => optionValue.id !== options.id
          );
          value.options = filterOptions;
        }
        return value;
      })
    );
  };

  const handleRequiredFieldChange = (data, item) => {
    setAddInputs(
      fields.map((value) => {
        if (item.id === value.id) item.required = data;
        return value;
      })
    );
  };

  const handleInputChange = (event, item) => {
    setAddInputs(
      fields.map((value) => {
        if (item.id === value.id) item.label = event.target.value;
        return value;
      })
    );
  };

  const handleOptionsInputChange = (event, item, index) => {
    setAddInputs(
      fields.map((value) => {
        if (item.id === value.id) {
          value.options[index].label = event.target.value;
          value.options[index].value = event.target.value;
        }
        return value;
      })
    );
  };

  const handleAddMoreOptions = (type, item) => {
    setAddInputs(
      fields.map((value) => {
        if (item.id === value.id && item.type === type) {
          value.options = [
            ...value.options,
            { id: uuid(), label: '', value: '' },
          ];
        }
        return value;
      })
    );
  };

  return (
    <div className="add-input-main-container">
      {map(fields, (item) => {
        return (
          <Col span={24}>
            <Row
              gutter={[16, 16]}
              align="middle"
              className="mt-10 input-container"
            >
              <Col span={12}>
                <Form.Item
                  name={item.id}
                  initialValue={item?.label}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter title',
                    },
                    {
                      validator() {
                        const uniqueValues = new Set(
                          fields.map((v) => v.label)
                        );

                        if (uniqueValues.size < fields.length) {
                          // eslint-disable-next-line prefer-promise-reject-errors
                          return Promise.reject(
                            'Please enter unique title value'
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    value={item.label}
                    disabled={item?.disabled || false}
                    placeholder="Enter Title"
                    onChange={(event) => handleInputChange(event, item)}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                {!item?.disabled && (
                  <DeleteIcon
                    onClick={() => handleDelete(item)}
                    className="cursor-pointer"
                  />
                )}
              </Col>
              <Col span={8}>
                <Space>
                  <span>*&nbsp;Required Field</span>
                  <Switch
                    disabled={item?.disabled || false}
                    onChange={(event) => handleRequiredFieldChange(event, item)}
                    checked={item.required}
                  />
                </Space>
              </Col>
              <div>
                {item?.type === PRODUCT_FEILD_TYPE_RADIO && (
                  <div>
                    {item?.options.map((option, index) => (
                      <Row key={option?.id} className="m-5">
                        <Col span={4}>
                          <Radio style={{ margin: '8px 16px' }} />
                        </Col>
                        <Col span={14}>
                          <Form.Item
                            name={option.id}
                            initialValue={option?.value}
                            rules={[
                              {
                                required: true,
                                message: 'Please enter options',
                              },
                              {
                                validator() {
                                  const uniqueValues = new Set(
                                    item.options.map((v) => v?.value)
                                  );
                                  if (
                                    uniqueValues.size < item?.options?.length
                                  ) {
                                    // eslint-disable-next-line prefer-promise-reject-errors
                                    return Promise.reject(
                                      'Please enter unique option value'
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input
                              style={{ width: '100%' }}
                              value={option?.value}
                              placeholder="Enter Options"
                              onChange={(event) =>
                                handleOptionsInputChange(event, item, index)
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          {item?.options.length === index + 1 ? (
                            <div
                              className="flex-bwn"
                              style={{ margin: '3px 8px' }}
                            >
                              <Button
                                onClick={() => {
                                  handleAddMoreOptions(
                                    PRODUCT_FEILD_TYPE_RADIO,
                                    item
                                  );
                                }}
                              >
                                +
                              </Button>
                              <DeleteIcon
                                className="cursor-pointer"
                                onClick={() =>
                                  handleOptionsDelete(
                                    item,
                                    option,
                                    PRODUCT_FEILD_TYPE_RADIO
                                  )
                                }
                              />
                            </div>
                          ) : (
                            <DeleteIcon
                              className="cursor-pointer"
                              onClick={() =>
                                handleOptionsDelete(
                                  item,
                                  option,
                                  PRODUCT_FEILD_TYPE_RADIO
                                )
                              }
                            />
                          )}
                        </Col>
                      </Row>
                    ))}
                  </div>
                )}
                {item?.type === PRODUCT_FEILD_TYPE_CHECKBOX && (
                  <div>
                    {item.options.map((option, index) => (
                      <Row key={option?.id} className="m-5">
                        <Col span={4}>
                          <Checkbox style={{ margin: '8px 16px' }} />
                        </Col>
                        <Col span={14}>
                          <Form.Item
                            name={option.id}
                            initialValue={option?.value}
                            rules={[
                              {
                                required: true,
                                message: 'Please enter options',
                              },
                              {
                                validator() {
                                  const uniqueValues = new Set(
                                    item.options.map((v) => v?.value)
                                  );
                                  if (
                                    uniqueValues.size < item?.options?.length
                                  ) {
                                    // eslint-disable-next-line prefer-promise-reject-errors
                                    return Promise.reject(
                                      'Please enter unique option value'
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input
                              style={{ width: '100%' }}
                              value={option?.value}
                              onChange={(event) =>
                                handleOptionsInputChange(event, item, index)
                              }
                              placeholder="Enter Options"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          {item?.options.length === index + 1 ? (
                            <div
                              className="flex-bwn"
                              style={{ margin: '3px 8px' }}
                            >
                              <Button
                                onClick={() => {
                                  handleAddMoreOptions(
                                    PRODUCT_FEILD_TYPE_CHECKBOX,
                                    item
                                  );
                                }}
                              >
                                +
                              </Button>
                              <DeleteIcon
                                className="cursor-pointer"
                                onClick={() =>
                                  handleOptionsDelete(
                                    item,
                                    option,
                                    PRODUCT_FEILD_TYPE_CHECKBOX
                                  )
                                }
                              />
                            </div>
                          ) : (
                            <DeleteIcon
                              className="cursor-pointer"
                              onClick={() =>
                                handleOptionsDelete(
                                  item,
                                  option,
                                  PRODUCT_FEILD_TYPE_CHECKBOX
                                )
                              }
                            />
                          )}
                        </Col>
                      </Row>
                    ))}
                  </div>
                )}
              </div>
            </Row>
          </Col>
        );
      })}
    </div>
  );
};

export default AddInputFieldList;
