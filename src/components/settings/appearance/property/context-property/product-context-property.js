import { LoadingOutlined } from '@ant-design/icons';
import { Col, Input, Row, Form, Select, Spin, Collapse } from 'antd';
import { filter, find, get, isEmpty, map } from 'lodash';
import React, { useEffect, useState, useCallback, useContext } from 'react';

import { v4 as uuid } from 'uuid';
import { getProducts } from '../../../../../utils/api/url-helper';
import Template from '../../template';
import SectionOtherProperty from './section-title/section-other-property';
import SectionTitleProperty from './section-title/section-title-property';
import ProductTitleProperty from './clic-product-property/product-title-property';
import ProductDescriptionProperty from './clic-product-property/product-description-property';
import ProductButtonProperty from './clic-product-property/product-button-property';
import { TenantContext } from '../../../../context/tenant-context';
import { TENANT_MODE_CLIC } from '../../../../../shared/constant-values';
import ProductTemplateProperty from './clic-product-property/product-template-property';
import { defaultImage } from '../../../../../shared/image-helper';

const { Panel } = Collapse;

function ProductContextProperty({
  contextProperties,
  editorContext,
  setEditorContext,
  setContextProperties,
  webLayout,
}) {
  const [productList, setProductList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [color, setColor] = useState('');
  const selectProductId = webLayout
    ? 'select-product-web'
    : 'select-product-mobile';
  const [tenantDetails] = useContext(TenantContext);
  const isClicMode = get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC;
  useEffect(() => {
    setLoader(true);
    setColor(get(contextProperties, 'section_title_style.color', ''));
    getProducts()
      .then((data) => {
        const production = get(data, 'data.rows', []);
        setProductList(filter(production, { product_status: true }));
        setLoader(false);
      })
      .catch(() => {
        setLoader(true);
      });
    return () => {
      if (setContextProperties) {
        setContextProperties({});
      }
    };
  }, [contextProperties, setContextProperties]);
  const insertEditorContext = useCallback(
    (event) => {
      const { value } = event.target;
      setEditorContext(
        map(editorContext, (item) => {
          map(item.column, (element) => {
            if (
              get(element, 'section.appearance_section_uid') ===
              get(contextProperties, 'appearance_section_uid')
            ) {
              element.section.section_title = value;
            }
            return element;
          });
          return item;
        })
      );
    },
    [contextProperties, editorContext, setEditorContext]
  );
  return (
    <Spin spinning={loader} indicator={LoadingOutlined}>
      <div className="appearance-properties">
        <Form
          labelCol={{
            xxl: 10,
            xl: 10,
            lg: 10,
            md: 24,
            sm: 24,
            xs: 24,
          }}
          wrapperCol={{
            xxl: 16,
            xl: 16,
            lg: 16,
            md: 24,
            sm: 24,
            xs: 24,
          }}
        >
          <div className="mt-10">
            <div className="header-text">Product Properties</div>
            {webLayout && !isClicMode && (
              <div className="mt-10">
                <Collapse collapsible defaultActiveKey={['1']}>
                  <Panel header="Template" key="1">
                    <Template
                      contextProperties={contextProperties}
                      editorContext={editorContext}
                      setEditorContext={setEditorContext}
                      setContextProperties={setContextProperties}
                    />
                  </Panel>
                </Collapse>
              </div>
            )}
            <div className="mt-10" id={selectProductId}>
              <Collapse collapsible defaultActiveKey={['1']}>
                <Panel header="Product" key="1">
                  <Form.Item
                    initialValue={get(
                      contextProperties,
                      'sectionArray',
                      []
                    ).map((index) => index.product_uid)}
                    name={`products_${get(
                      contextProperties,
                      'appearance_section_uid',
                      ''
                    )}`}
                    wrapperCol={{
                      span: 24,
                    }}
                  >
                    <Select
                      mode="multiple"
                      virtual={false}
                      className="select-tags"
                      style={{ width: '100%' }}
                      placeholder="Select Product"
                      loading={loader}
                      getPopupContainer={() =>
                        document.getElementById(selectProductId)
                      }
                      disabled={
                        loader ||
                        (webLayout &&
                          !isClicMode &&
                          isEmpty(get(contextProperties, 'template', {})))
                      }
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.key
                          ?.toLowerCase()
                          ?.includes(input?.toLowerCase()) === true
                      }
                      onChange={(event) => {
                        const productFilter = map(event, (item) => {
                          const productObject = find(
                            productList,
                            (index) => get(index, 'product_uid') === item
                          );
                          return {
                            ...productObject,
                            appearance_section_array_uid: uuid(),
                          };
                        });
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
                                element.section.sectionArray = productFilter;
                                element.section.sectionArray.zm_product =
                                  productFilter;
                                return element;
                              }
                              return element;
                            });
                            return item;
                          })
                        );
                      }}
                    >
                      {productList.map((element) => {
                        return (
                          <Select.Option
                            value={get(element, 'product_uid', '')}
                            key={get(element, 'product_name', '')}
                          >
                            <Row
                              align="middle"
                              justify="space-between"
                              gutter={[16, 16]}
                            >
                              <Col>{get(element, 'product_name', '')}</Col>
                              <Col>
                                <img
                                  alt={get(element, 'product_name', '')}
                                  width="25px"
                                  src={
                                    isEmpty(
                                      get(
                                        element,
                                        'product_image[0].product_image',
                                        []
                                      )
                                    )
                                      ? defaultImage
                                      : get(
                                          element,
                                          'product_image[0].product_image'
                                        )
                                  }
                                />
                              </Col>
                            </Row>
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Panel>
              </Collapse>
            </div>
            <div className="mt-10">
              <div className="header-text">Section Title</div>
              <Collapse collapsible defaultActiveKey={['1']}>
                <Panel header="Title" key="1">
                  <Form.Item
                    initialValue={get(contextProperties, 'section_title')}
                    name={`title_${get(contextProperties, 'id')}`}
                    label="Product Title :"
                  >
                    <Input
                      placeholder="Enter product title"
                      onChange={(event) => {
                        insertEditorContext(event);
                      }}
                    />
                  </Form.Item>
                </Panel>
              </Collapse>
              {get(contextProperties, 'section_title', '') && (
                <div className="mt-10">
                  <Collapse collapsible defaultActiveKey={['1']}>
                    <Panel header="Properties" key="1">
                      <SectionTitleProperty
                        contextProperties={contextProperties}
                        setEditorContext={setEditorContext}
                        editorContext={editorContext}
                        color={color}
                        setColor={setColor}
                      />
                    </Panel>
                  </Collapse>
                </div>
              )}
              {isClicMode ? (
                <div className="mt-10">
                  <div className="header-text">Product Properties</div>
                  <Collapse collapsible defaultActiveKey={['1']}>
                    <Panel header="Product Name" key="1">
                      <ProductTitleProperty
                        contextProperties={contextProperties}
                        setEditorContext={setEditorContext}
                        editorContext={editorContext}
                        color={color}
                        setColor={setColor}
                      />
                    </Panel>
                  </Collapse>
                  <div className="mt-10">
                    <Collapse collapsible defaultActiveKey={['1']}>
                      <Panel header="Product Description" key="1">
                        <ProductDescriptionProperty
                          contextProperties={contextProperties}
                          setEditorContext={setEditorContext}
                          editorContext={editorContext}
                          color={color}
                          setColor={setColor}
                        />
                      </Panel>
                    </Collapse>
                  </div>
                  <div className="mt-10" style={{ display: 'none' }}>
                    <Collapse collapsible defaultActiveKey={['1']}>
                      <Panel header="Button" key="1">
                        <ProductButtonProperty
                          contextProperties={contextProperties}
                          setEditorContext={setEditorContext}
                          editorContext={editorContext}
                          color={color}
                          setColor={setColor}
                        />
                      </Panel>
                    </Collapse>
                  </div>
                  <div className="mt-10">
                    <Collapse collapsible defaultActiveKey={['1']}>
                      <Panel header="Template Background" key="1">
                        <ProductTemplateProperty
                          contextProperties={contextProperties}
                          setEditorContext={setEditorContext}
                          editorContext={editorContext}
                          color={color}
                          setColor={setColor}
                        />
                      </Panel>
                    </Collapse>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-10">
                    <div className="header-text">Section Button</div>
                    <Collapse collapsible defaultActiveKey={['1']}>
                      <Panel header="Color" key="1">
                        <SectionOtherProperty
                          contextProperties={contextProperties}
                          setEditorContext={setEditorContext}
                          editorContext={editorContext}
                          color={color}
                          setColor={setColor}
                        />
                      </Panel>
                    </Collapse>
                  </div>
                  <div className="mt-10">
                    <div className="header-text">Section View</div>
                    <Collapse collapsible defaultActiveKey={['1']}>
                      <Panel header="Scroll" key="1">
                        <SectionOtherProperty
                          contextProperties={contextProperties}
                          setEditorContext={setEditorContext}
                          editorContext={editorContext}
                          color={color}
                          setColor={setColor}
                          noButtonProps={!webLayout}
                          from="View"
                        />
                      </Panel>
                    </Collapse>
                  </div>
                </>
              )}
            </div>
          </div>
        </Form>
      </div>
    </Spin>
  );
}

export default ProductContextProperty;
