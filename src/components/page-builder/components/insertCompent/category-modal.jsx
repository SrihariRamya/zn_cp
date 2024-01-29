import React, { useState, useEffect } from 'react';
import { Col, Collapse, Form, Input, Modal, Row, Select, Spin } from 'antd';
import { cloneDeep, filter, find, get, map } from 'lodash';
import { LoadingOutlined } from '@ant-design/icons';
import { getCategory } from '../../../../utils/api/url-helper';
import { defaultImage } from '../../../../shared/image-helper';
import { useComponentContext } from '../../context/components';
import SectionTitleProperty from './insertHelper/context-property/section-title/section-title-property';
import SectionOtherProperty from './insertHelper/context-property/section-title/section-other-property';
import { getComponent } from '../../helper';

const { Panel } = Collapse;
function CategoryModal(properties) {
  const { visible, onCancel } = properties;
  const {
    componentValues,
    updateComponentState,
    componentProperties,
    setComponentProperties,
    isNewProductComponent,
  } = useComponentContext();
  const handleOk = () => {
    if (isNewProductComponent) {
      const productData = getComponent('category');
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
  const [categoryList, setCategoryList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [color, setColor] = useState('');
  const webLayout = true;
  const selectCategoryId = webLayout
    ? 'select-category-web'
    : 'select-category-mobile';
  useEffect(() => {
    setLoader(true);
    setColor(get(componentProperties, 'title_style.color', ''));
    getCategory({ filterCondition: 'apearanceList' })
      .then((data) => {
        setCategoryList(get(data, 'data.rows', []));
        setLoader(false);
      })
      .catch(() => {
        setLoader(true);
      });
  }, []);

  const handleIntialValue = () => {
    return map(
      filter(
        get(componentProperties, 'value', []),
        (category) => get(category, 'zm_category') !== null
      ),
      (index) => index.category_uid
    );
  };

  return (
    <Modal
      title="Category Modal"
      onOk={handleOk}
      open={visible}
      onCancel={onCancel}
      okText={isNewProductComponent ? 'Insert' : 'Update'}
      width="65vw"
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
          >
            <div className="mt-10" id={selectCategoryId}>
              <div className="header-text">Section Properties</div>
              <Collapse collapsible defaultActiveKey={['1']}>
                <Panel header="Category" key="1">
                  <Form.Item
                    initialValue={handleIntialValue()}
                    name="category_"
                    wrapperCol={{
                      span: 24,
                    }}
                  >
                    <Select
                      className="select-tags"
                      mode="multiple"
                      virtual={false}
                      style={{ width: '100%' }}
                      placeholder="Select categories"
                      loading={loader}
                      disabled={loader}
                      getPopupContainer={() =>
                        document.querySelector(`#${selectCategoryId}`)
                      }
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.key
                          ?.toLowerCase()
                          ?.includes(input?.toLowerCase()) === true
                      }
                      onChange={(event) => {
                        const categoryFilter = filter(categoryList, (index) =>
                          find(event, (index_) => index_ === index.category_uid)
                        );
                        setComponentProperties({
                          ...componentProperties,
                          value: categoryFilter,
                        });
                      }}
                    >
                      {map(categoryList, (item) => {
                        return (
                          <Select.Option
                            value={get(item, 'category_uid', '')}
                            key={get(item, 'category_name', '')}
                          >
                            <Row
                              align="middle"
                              justify="space-between"
                              gutter={[16, 16]}
                            >
                              <Col>{get(item, 'category_name', '')}</Col>
                              <Col>
                                <img
                                  alt={get(item, 'category_name', '')}
                                  width="25px"
                                  src={
                                    get(item, 'image', false) || defaultImage
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
                    name="title_"
                    label="Title"
                  >
                    <Input
                      size="large"
                      onChange={(event) => {
                        setComponentProperties({
                          ...componentProperties,
                          title: get(event, 'target.value'),
                        });
                      }}
                      placeholder="Enter category title"
                    />
                  </Form.Item>
                </Panel>
              </Collapse>
              <div className="mt-10">
                <Collapse collapsible defaultActiveKey={['1']}>
                  <Panel header="Properties" key="1">
                    <SectionTitleProperty
                      setComponentProperties={setComponentProperties}
                      componentProperties={componentProperties}
                      color={color}
                      setColor={setColor}
                    />
                  </Panel>
                </Collapse>
              </div>
            </div>
            <div className="mt-10">
              <div className="header-text">Section Button</div>
              <Collapse collapsible defaultActiveKey={['1']}>
                <Panel header="Color" key="1">
                  <SectionOtherProperty
                    setComponentProperties={setComponentProperties}
                    componentProperties={componentProperties}
                    color={color}
                    setColor={setColor}
                    noButtonProps={!webLayout}
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
                    noButtonProps={!webLayout}
                    from="View"
                  />
                </Panel>
              </Collapse>
            </div>
          </Form>
        </div>
      </Spin>
    </Modal>
  );
}

export default CategoryModal;
