import React, { useEffect, useState, useContext } from 'react';
import { Form, Modal, Row, Select, Spin, Collapse, Col, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { cloneDeep, filter, find, get, isEmpty, map } from 'lodash';
import { useComponentContext } from '../../context/components';
import { TenantContext } from '../../../context/tenant-context';
import { defaultImage } from '../../../../shared/image-helper';
import { getProducts } from '../../../../utils/api/url-helper';
import SectionTitleProperty from './insertHelper/context-property/section-title/section-title-property';
import { TENANT_MODE_CLIC } from '../../../../shared/constant-values';
import Template from './insertHelper/template';
import SectionOtherProperty from './insertHelper/context-property/section-title/section-other-property';
import ProductTitleProperty from './insertHelper/context-property/clic-product-property/product-title-property';
import ProductDescriptionProperty from './insertHelper/context-property/clic-product-property/product-description-property';
import ProductButtonProperty from './insertHelper/context-property/clic-product-property/product-button-property';
import ProductTemplateProperty from './insertHelper/context-property/clic-product-property/product-template-property';
import { getComponent } from '../../helper';

const { Panel } = Collapse;

function ProductModal(properties) {
  const { visible, onCancel } = properties;
  const [productList, setProductList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [color, setColor] = useState('');
  const selectProductId = 'select-product-web';
  const [tenantDetails] = useContext(TenantContext);
  const isClicMode = get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC;
  const {
    componentValues,
    updateComponentState,
    componentProperties,
    setComponentProperties,
    isNewProductComponent,
  } = useComponentContext();
  const handleOk = () => {
    if (isNewProductComponent) {
      const productData = getComponent('product');
      productData.column[0].component[0].componentProperties =
        componentProperties;
      const newComponentValues = cloneDeep(componentValues);
      newComponentValues.row.push(productData);
      updateComponentState(newComponentValues);
    } else {
      const newComponentValues = cloneDeep(componentValues);
      newComponentValues.row.map((row) => {
        row.column.map((column) => {
          column.component.map((component) => {
            if (component.componentUid === componentProperties.componentUid) {
              component.componentProperties = componentProperties;
            }
            return component;
          });
          return column;
        });
        return row;
      });
      updateComponentState(newComponentValues);
    }
    setComponentProperties({});
    onCancel();
  };
  useEffect(() => {
    setLoader(true);
    getProducts()
      .then((data) => {
        const production = get(data, 'data.rows', []);
        setProductList(filter(production, { product_status: true }));
        setLoader(false);
      })
      .catch(() => {
        setLoader(true);
      });
  }, []);
  return (
    <Modal
      title="Product Modal"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width="65vw"
      okText={isNewProductComponent ? 'Insert' : 'Update'}
      destroyOnClose
    >
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
            initialValue={{
              product: map(
                get(componentProperties, 'value', []),
                (index) => index.product_uid
              ),
            }}
          >
            <div className="mt-10">
              <div className="header-text">Product Properties</div>
              {!isClicMode && (
                <div className="mt-10">
                  <Collapse collapsible defaultActiveKey={['1']}>
                    <Panel header="Template" key="1">
                      <Template
                        componentProperties={componentProperties}
                        setComponentProperties={setComponentProperties}
                      />
                    </Panel>
                  </Collapse>
                </div>
              )}
              <div className="mt-10" id={selectProductId}>
                <Collapse collapsible defaultActiveKey={['1']}>
                  <Panel header="Product" key="1">
                    <Form.Item
                      initialValue={map(
                        get(componentProperties, 'value', []),
                        (index) => index.product_uid
                      )}
                      name="product"
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
                          document.querySelector(`#${selectProductId}`)
                        }
                        disabled={
                          loader ||
                          (!isClicMode &&
                            isEmpty(get(componentProperties, 'template', {})))
                        }
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option?.key
                            ?.toLowerCase()
                            ?.includes(input?.toLowerCase()) === true
                        }
                        onChange={(event) => {
                          const productFilter = filter(productList, (index) =>
                            find(
                              event,
                              (index_) => index_ === index.product_uid
                            )
                          );
                          setComponentProperties({
                            ...componentProperties,
                            value: productFilter,
                          });
                        }}
                      >
                        {map(productList, (element) => {
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
                      initialValue={get(componentProperties, 'title')}
                      name="title"
                      label="Product Title :"
                    >
                      <Input
                        placeholder="Enter product title"
                        onChange={(event) => {
                          setComponentProperties({
                            ...componentProperties,
                            title: get(event, 'target.value'),
                          });
                        }}
                      />
                    </Form.Item>
                  </Panel>
                </Collapse>
                <div className="mt-10">
                  <Collapse collapsible defaultActiveKey={['1']}>
                    <Panel header="Properties" key="1">
                      <SectionTitleProperty
                        componentProperties={componentProperties}
                        setComponentProperties={setComponentProperties}
                        color={color}
                        setColor={setColor}
                      />
                    </Panel>
                  </Collapse>
                </div>
                {isClicMode ? (
                  <div className="mt-10">
                    <div className="header-text">Product Properties</div>
                    <Collapse collapsible defaultActiveKey={['1']}>
                      <Panel header="Product Name" key="1">
                        <ProductTitleProperty
                          componentProperties={componentProperties}
                          setComponentProperties={setComponentProperties}
                          color={color}
                          setColor={setColor}
                        />
                      </Panel>
                    </Collapse>
                    <div className="mt-10">
                      <Collapse collapsible defaultActiveKey={['1']}>
                        <Panel header="Product Description" key="1">
                          <ProductDescriptionProperty
                            componentProperties={componentProperties}
                            setComponentProperties={setComponentProperties}
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
                            componentProperties={componentProperties}
                            setComponentProperties={setComponentProperties}
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
                            componentProperties={componentProperties}
                            setComponentProperties={setComponentProperties}
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
                            componentProperties={componentProperties}
                            setComponentProperties={setComponentProperties}
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
                            setComponentProperties={setComponentProperties}
                            componentProperties={componentProperties}
                            color={color}
                            setColor={setColor}
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
    </Modal>
  );
}

export default ProductModal;
