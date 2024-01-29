import { LoadingOutlined } from '@ant-design/icons';
import { Col, Input, Row, Form, Select, Spin, Collapse } from 'antd';
import { find, get, map } from 'lodash';
import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { getCategory } from '../../../../../utils/api/url-helper';
import SectionOtherProperty from './section-title/section-other-property';
import SectionTitleProperty from './section-title/section-title-property';
import { defaultImage } from '../../../../../shared/image-helper';

const { Panel } = Collapse;

const CategoryContextProperty = ({
  contextProperties,
  editorContext,
  setEditorContext,
  setContextProperties,
  webLayout,
}) => {
  const [categoryList, setCategoryList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [color, setColor] = useState('');
  const selectCategoryId = webLayout
    ? 'select-category-web'
    : 'select-category-mobile';
  useEffect(() => {
    setLoader(true);
    setColor(get(contextProperties, 'section_title_style.color', ''));
    getCategory({ filterCondition: 'apearanceList' })
      .then((data) => {
        setCategoryList(get(data, 'data.rows', []));
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
  }, [setContextProperties, contextProperties]);

  const handleIntialValue = () => {
    return get(contextProperties, 'sectionArray', [])
      .filter((category) => get(category, 'zm_category') !== null)
      .map((index) => index.category_uid);
  };
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
          <div className="mt-10" id={selectCategoryId}>
            <div className="header-text">Section Properties</div>
            <Collapse collapsible defaultActiveKey={['1']}>
              <Panel header="Category" key="1">
                <Form.Item
                  initialValue={handleIntialValue()}
                  name={`category_${get(
                    contextProperties,
                    'appearance_section_uid',
                    ''
                  )}`}
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
                      document.getElementById(selectCategoryId)
                    }
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option?.key
                        ?.toLowerCase()
                        ?.includes(input?.toLowerCase()) === true
                    }
                    onChange={(event) => {
                      const categoryFilter = map(event, (item) => {
                        const categoryObject = find(
                          categoryList,
                          (index) => get(index, 'category_uid') === item
                        );
                        return {
                          ...categoryObject,
                          appearance_section_array_uid: uuid(),
                        };
                      });
                      setEditorContext(
                        map(editorContext, (item) => {
                          map(item.column, (element) => {
                            if (
                              get(element, 'section.appearance_section_uid') ===
                              get(contextProperties, 'appearance_section_uid')
                            ) {
                              element.section.sectionArray = categoryFilter;
                              return element;
                            }
                            return element;
                          });
                          return item;
                        })
                      );
                    }}
                  >
                    {categoryList.map((item) => {
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
                                src={get(item, 'image', false) || defaultImage}
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
                  label="Title"
                >
                  <Input
                    size="large"
                    onChange={(event) => {
                      const { value } = event.target;
                      setEditorContext(
                        map(editorContext, (item) => {
                          map(item.column, (column) => {
                            if (
                              get(column, 'section.appearance_section_uid') ===
                              get(contextProperties, 'appearance_section_uid')
                            ) {
                              column.section.section_title = value;
                            }
                            return column;
                          });
                          return item;
                        })
                      );
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
        </Form>
      </div>
    </Spin>
  );
};

export default CategoryContextProperty;
