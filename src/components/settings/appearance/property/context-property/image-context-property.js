import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Slider, Select, Form, Collapse } from 'antd';
import { v4 as uuid } from 'uuid';
import { filter, find, flatten, get, isEmpty, map } from 'lodash';
import React, { useEffect, useState, useContext } from 'react';
import { categoryDefaultImage } from '../../../../../shared/image-helper';
import {
  getCategory,
  getProducts,
  getSubCategory,
} from '../../../../../utils/api/url-helper';
import { TenantContext } from '../../../../context/tenant-context';
import { TENANT_MODE_NORMAL } from '../../../../../shared/constant-values';

const { Option } = Select;
const { Panel } = Collapse;

const urlValidator = {
  validator(_, value) {
    // eslint-disable-next-line no-useless-escape
    const regExString = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$/;
    if (value && !value.match(regExString)) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('Invalid URL');
    }
    return Promise.resolve();
  },
};
function ImageContextProperty({
  contextProperties,
  editorContext,
  setEditorContext,
  setContextProperties,
}) {
  const [form] = Form.useForm();
  const [hrefContent, setHrefContent] = useState('');
  const [action, setAction] = useState(get(contextProperties, 'image_action'));
  const [categoryList, setCategoryList] = useState([]);
  const [categorySelectLoader, setCategorySelectLoader] = useState(true);
  const [productList, setProductList] = useState([]);
  const [productListLoader, setProductListLoader] = useState(true);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [subCategoryListLoader, setSubCategoryListLoader] = useState(true);
  const [tenantDetails] = useContext(TenantContext);
  const isNormalTenant =
    get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL;

  useEffect(() => {
    setHrefContent(
      get(contextProperties, 'section_image_content.Location', '')
    );
    setAction(get(contextProperties, 'image_action'));
    form.setFieldsValue({
      select_action: get(contextProperties, 'image_action'),
      web_url: get(contextProperties, 'sectionArray[0].url_path'),
      image_url: get(contextProperties, 'section_image_content.Location', ''),
      image_width: get(contextProperties, 'width'),
      select_category: get(contextProperties, 'sectionArray[0].category_uid'),
      select_sub_category: get(
        contextProperties,
        'sectionArray[0].sub_category_uid'
      ),
      select_product: get(contextProperties, 'sectionArray[0].product_uid'),
    });
    return () => {
      if (setContextProperties) {
        setContextProperties({});
      }
    };
  }, [setContextProperties, contextProperties, form]);

  useEffect(() => {
    try {
      getCategory().then((categoryData) => {
        setCategoryList(get(categoryData, 'data.rows'));
        setCategorySelectLoader(false);
      });
      getProducts().then((data) => {
        const production = get(data, 'data.rows', []);
        setProductList(filter(production, { product_status: true }));
        setProductListLoader(false);
      });
      getSubCategory().then((subCatList) => {
        setSubCategoryList(
          flatten(get(subCatList, 'data').map((index) => index.subCategory))
        );
        setSubCategoryListLoader(false);
      });
    } catch (error) {
      setSubCategoryListLoader(false);
      setProductListLoader(false);
      setCategorySelectLoader(false);
    }
  }, []);
  const deleteHandler = () => {
    setHrefContent('');
    form.setFieldsValue({ image_url: null });
    setEditorContext(
      map(editorContext, (item) => {
        map(item.column, (element) => {
          if (
            get(element, 'section.appearance_section_uid') ===
            get(contextProperties, 'appearance_section_uid')
          ) {
            element.section.section_image_content.Location = null;
            element.section.preview = null;
          }
          return element;
        });
        return item;
      })
    );
  };
  return (
    <div className="appearance-properties">
      <div>
        <Row justify="space-between">
          <div className="header-text">Image Content Property</div>
          <Button key="4" danger onClick={deleteHandler} type="danger">
            <DeleteOutlined />
          </Button>
        </Row>
      </div>
      <Form layout="vertical" form={form}>
        <div className="mt-10">
          <Collapse collapsible defaultActiveKey={['1']}>
            <Panel header="Link" key="1">
              <Row align="bottom" gutter={[16, 16]}>
                <Col span={20}>
                  <Form.Item name="image_url" wrapperCol={24}>
                    <Input
                      onChange={(event) => {
                        const { value } = event.target;
                        setHrefContent(value);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={4} className="mb-12">
                  <Button
                    type="primary"
                    onClick={() => {
                      setEditorContext(
                        map(editorContext, (item) => {
                          map(item.column, (element) => {
                            if (
                              get(element, 'section.appearance_section_uid') ===
                              get(contextProperties, 'appearance_section_uid')
                            ) {
                              element.section.section_image_content.Location = hrefContent;
                              element.section.width = 100;
                              element.section.preview = hrefContent;
                            }
                            return element;
                          });
                          return item;
                        })
                      );
                      form.setFieldsValue({ image_width: 100 });
                    }}
                  >
                    <PlusOutlined />
                  </Button>
                </Col>
              </Row>
            </Panel>
          </Collapse>
        </div>
        <div className="mt-10">
          <Collapse collapsible defaultActiveKey={['1']}>
            <Panel header="Size" key="1">
              <Row align="center" justify="space-between">
                <Col span={4}>
                  <div style={{ margin: '4px 0px' }}>Size</div>
                </Col>
                <Col span={20}>
                  <Form.Item name="image_width" wrapperCol={24}>
                    <Slider
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentElement
                      }
                      onAfterChange={(size) => {
                        setEditorContext(
                          map(editorContext, (item) => {
                            map(item.column, (element) => {
                              if (
                                get(
                                  element,
                                  'section.appearance_section_uid'
                                ) ===
                                get(contextProperties, 'appearance_section_uid')
                              ) {
                                element.section.width = size;
                              }
                              return element;
                            });
                            return item;
                          })
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>
          </Collapse>
        </div>
        <div className="mt-10">
          <Collapse collapsible defaultActiveKey={['1']}>
            <Panel header="Action" key="1">
              <Row align="center" justify="space-between">
                <Col span={24}>
                  <Form.Item
                    label="Select Action"
                    name="select_action"
                    wrapperCol={24}
                  >
                    <Select
                      placeholder="Select action"
                      virtual={false}
                      onChange={(event) => {
                        setAction(event);
                        setEditorContext(
                          map(editorContext, (item) => {
                            map(item.column, (element) => {
                              if (
                                get(
                                  element,
                                  'section.appearance_section_uid'
                                ) ===
                                get(contextProperties, 'appearance_section_uid')
                              ) {
                                element.section.image_action = event;
                              }
                              return element;
                            });
                            return item;
                          })
                        );
                      }}
                      style={{ width: '100%' }}
                    >
                      <Option value="Web">Open web page</Option>
                      {isNormalTenant && (
                        <>
                          <Option value="category">Open category page</Option>
                          <Option value="subCategory">
                            Open sub category page
                          </Option>
                          <Option value="product">Open product page</Option>
                        </>
                      )}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <div className="mt-10">
                    {action === 'Web' && (
                      <Col span={24}>
                        <Form.Item
                          label="Add Web URL"
                          name="web_url"
                          rules={[urlValidator]}
                          wrapperCol={24}
                        >
                          <Input
                            onChange={(event) => {
                              const { value } = event.target;
                              setEditorContext(
                                map(editorContext, (item) => {
                                  map(item.column, (element) => {
                                    if (
                                      get(
                                        element,
                                        'section.appearance_section_uid'
                                      ) ===
                                      get(
                                        contextProperties,
                                        'appearance_section_uid'
                                      )
                                    ) {
                                      element.section.sectionArray = [
                                        {
                                          appearance_section_array_uid: uuid(),
                                          url_path: value,
                                        },
                                      ];
                                    }
                                    return element;
                                  });
                                  return item;
                                })
                              );
                            }}
                          />
                        </Form.Item>
                      </Col>
                    )}
                    {action === 'category' && (
                      <Col span={24}>
                        <Form.Item name="select_category" wrapperCol={24}>
                          <Select
                            onChange={(event) => {
                              setEditorContext(
                                map(editorContext, (item) => {
                                  map(item.column, (element) => {
                                    if (
                                      get(
                                        element,
                                        'section.appearance_section_uid'
                                      ) ===
                                      get(
                                        contextProperties,
                                        'appearance_section_uid'
                                      )
                                    ) {
                                      element.section.sectionArray = [
                                        {
                                          appearance_section_array_uid: uuid(),
                                          category_uid: event,
                                        },
                                      ];
                                    }
                                    return element;
                                  });
                                  return item;
                                })
                              );
                            }}
                            style={{ width: '100%' }}
                            loading={categorySelectLoader}
                            disabled={categorySelectLoader}
                            virtual={false}
                          >
                            {categoryList.map((item) => {
                              return (
                                <Select.Option
                                  key={get(item, 'category_uid', '')}
                                >
                                  <Row
                                    align="middle"
                                    justify="space-between"
                                    gutter={[16, 16]}
                                  >
                                    <Col>{get(item, 'category_name', '')}</Col>
                                    <Col>
                                      <img
                                        alt={get(item, 'image', '')}
                                        width="25px"
                                        src={
                                          !isEmpty(get(item, 'image'))
                                            ? get(item, 'image')
                                            : categoryDefaultImage
                                        }
                                      />
                                    </Col>
                                  </Row>
                                </Select.Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                    )}
                    {action === 'subCategory' && (
                      <Col span={24}>
                        <Form.Item name="select_sub_category" wrapperCol={24}>
                          <Select
                            onChange={(event) => {
                              setEditorContext(
                                map(editorContext, (item) => {
                                  map(item.column, (element) => {
                                    if (
                                      get(
                                        element,
                                        'section.appearance_section_uid'
                                      ) ===
                                      get(
                                        contextProperties,
                                        'appearance_section_uid'
                                      )
                                    ) {
                                      element.section.sectionArray = [
                                        {
                                          appearance_section_array_uid: uuid(),
                                          sub_category_uid: event,
                                          category_uid: get(
                                            find(subCategoryList, {
                                              sub_category_uid: event,
                                            }),
                                            'category_uid'
                                          ),
                                        },
                                      ];
                                    }
                                    return element;
                                  });
                                  return item;
                                })
                              );
                            }}
                            style={{ width: '100%' }}
                            loading={subCategoryListLoader}
                            disabled={subCategoryListLoader}
                            virtual={false}
                          >
                            {subCategoryList.map((item) => {
                              return (
                                <Select.Option
                                  key={get(item, 'sub_category_uid', '')}
                                >
                                  <Row
                                    align="middle"
                                    justify="space-between"
                                    gutter={[16, 16]}
                                  >
                                    <Col>
                                      {get(item, 'sub_category_name', '')}
                                    </Col>
                                    <Col>
                                      <img
                                        alt={get(item, 'image', '')}
                                        width="25px"
                                        src={
                                          !isEmpty(get(item, 'image', ''))
                                            ? get(item, 'image')
                                            : categoryDefaultImage
                                        }
                                      />
                                    </Col>
                                  </Row>
                                </Select.Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                    )}
                    {action === 'product' && (
                      <Col span={24}>
                        <Form.Item name="select_product" wrapperCol={24}>
                          <Select
                            onChange={(event) => {
                              setEditorContext(
                                map(editorContext, (item) => {
                                  map(item.column, (element) => {
                                    if (
                                      get(
                                        element,
                                        'section.appearance_section_uid'
                                      ) ===
                                      get(
                                        contextProperties,
                                        'appearance_section_uid'
                                      )
                                    ) {
                                      element.section.sectionArray = [
                                        {
                                          appearance_section_array_uid: uuid(),
                                          product_uid: event,
                                        },
                                      ];
                                    }
                                    return element;
                                  });
                                  return item;
                                })
                              );
                            }}
                            style={{ width: '100%' }}
                            loading={productListLoader}
                            disabled={productListLoader}
                            virtual={false}
                          >
                            {productList.map((item) => {
                              return (
                                <Select.Option
                                  key={get(item, 'product_uid', '')}
                                >
                                  <Row
                                    align="middle"
                                    justify="space-between"
                                    gutter={[16, 16]}
                                  >
                                    <Col>{get(item, 'product_name', '')}</Col>
                                    <Col>
                                      <img
                                        alt={get(item, 'image', '')}
                                        width="25px"
                                        src={
                                          !isEmpty(
                                            get(
                                              item,
                                              'product_image[0].product_image',
                                              ''
                                            )
                                          )
                                            ? get(
                                                item,
                                                'product_image[0].product_image'
                                              )
                                            : categoryDefaultImage
                                        }
                                      />
                                    </Col>
                                  </Row>
                                </Select.Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                    )}
                  </div>
                </Col>
              </Row>
            </Panel>
          </Collapse>
        </div>
      </Form>
    </div>
  );
}

export default ImageContextProperty;
