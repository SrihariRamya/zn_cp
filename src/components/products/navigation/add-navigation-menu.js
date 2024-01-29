import {
  ArrowLeftOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Drawer,
  Form,
  Space,
  Input,
  Card,
  Table,
  Tag,
  Tooltip,
  notification,
  Spin,
  Select,
  Radio,
  Row,
  Col,
} from 'antd';
import { filter, get, map, flatten, isEmpty, uniqBy, orderBy } from 'lodash';
import React, { useState, useEffect } from 'react';
import {
  FAILED_TO_LOAD,
  MENU_ADD_FAILED,
  MENU_ADD_SUCCESS,
  MENU_ITEMS_EMPTY,
  MENU_UPDATE_SUCCESS,
  menuType,
} from '../../../shared/constant-values';
import {
  createMenuList,
  getAllCollections,
  getB2cCategory,
} from '../../../utils/api/url-helper';

const AddNavigationMenu = (properties) => {
  const { onClose, open, editData } = properties;
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [selectedMenuData, setSelectedMenuData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chooseType, setChooseType] = useState('');
  const [categoryData, setCategoryData] = useState([]);
  const [collectionData, setCollectionData] = useState([]);

  const onFinish = (values) => {
    if (isEmpty(selectedMenuData)) {
      return notification.error({
        message: MENU_ITEMS_EMPTY,
      });
    }
    const parameters = {
      name: values.name,
      menuItems: selectedMenuData,
    };
    if (!isEmpty(editData)) {
      parameters.menu_uid = editData.menu_uid;
      parameters.status = editData.status;
    }
    createMenuList(parameters)
      .then(() => {
        notification.success({
          message: `${isEmpty(editData) ? MENU_ADD_SUCCESS : MENU_UPDATE_SUCCESS
            }`,
        });
        onClose();
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', '') || MENU_ADD_FAILED,
        });
      });
    return '';
  };

  const onFinishInside = () => {
    const values = form1.getFieldsValue()
    const storedData = [];
    if (values.MenuType === menuType.collection) {
      const filteredData = filter(collectionData, [
        'collection_uid',
        values?.collection_uid,
      ]);
      const mapped = filteredData?.map((x) => {
        const data = {};
        data.collection_uid = x?.collection_uid;
        data.menu_type = values.MenuType;
        data.menuTitle = x.title;
        data.menu_id = x.collection_uid;
        return data;
      });
      storedData.push(mapped || []);
    }
    if (values.MenuType === menuType.category) {
      const filteredData = filter(categoryData, (item) =>
        values?.menu.includes(item.category_uid)
      );
      const mapped = filteredData?.map((x) => {
        const data = x;
        data.menu_type = values.MenuType;
        data.menuTitle = x.category_name;
        data.menu_id = x.category_uid;
        return data;
      });
      storedData.push(mapped || []);
    }
    const flattenData = flatten(storedData);
    if (selectedMenuData) {
      setSelectedMenuData(
        uniqBy([...selectedMenuData, ...flattenData], 'menu_id')
      );
    } else {
      setSelectedMenuData(uniqBy(flattenData, 'menu_id'));
    }
    form1.resetFields(['menu', 'collection_uid']);
  };

  const handleDelete = (values) => {
    const updatedData = filter(
      selectedMenuData,
      (item) => item.menu_id !== values.menu_id
    );
    setSelectedMenuData(updatedData);
  };

  const fetchData = () => {
    setLoading(true);
    const apiArray = [getB2cCategory(), getAllCollections()];
    Promise.all(apiArray)
      .then((response) => {
        const catData = get(response, '[0].data', []);
        setLoading(false);
        setCategoryData(catData);
        setCollectionData(get(response, '[1].data.rows', []));
      })
      .catch((error) =>
        notification.error({
          message: get(error, 'message', '') || FAILED_TO_LOAD,
        })
      );
  };

  const handleEnableOnChange = (event) => {
    setChooseType(event.target.value);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isEmpty(editData)) {
      const { menu_items: menuItems } = editData;
      form.setFieldsValue({
        name: editData?.name,
      });
      const storedData = [];
      map(menuItems, (values) => {
        if (values.menu_type === menuType.collection) {
          const filteredData = filter(collectionData, [
            'collection_uid',
            values?.collection_uid,
          ]);
          const mapped = map(filteredData, (x) => {
            const data = {};
            data.id = values?.id;
            data.collection_uid = x?.collection_uid;
            data.menu_type = values.menu_type;
            data.menuTitle = x.title;
            data.menu_id = x.collection_uid;
            return data;
          });
          return storedData.push(mapped || []);
        }
        if (values.menu_type === menuType.category) {
          const filteredData = filter(categoryData, (item) =>
            values?.category_uid.includes(item.category_uid)
          );
          const mapped = map(filteredData, (x) => {
            const data = {};
            data.id = values?.id;
            data.category_uid = x.category_uid;
            data.menu_type = values.menu_type;
            data.menuTitle = x.category_name;
            data.menu_id = x.category_uid;
            return data;
          });
          return storedData.push(mapped || []);
        }
        return '';
      });
      const flattenData = orderBy(flatten(storedData), ['id'], ['asc']);
      setSelectedMenuData(flattenData);
    }
  }, [categoryData, collectionData, editData, form]);

  const columns = [
    {
      title: 'Menu Items',
      dataIndex: 'menuTitle',
      key: 'menuTitle',
      width: '33%',
    },
    {
      title: 'Menu Type',
      dataIndex: 'menu_type',
      key: 'menu_type',
      width: '43%',
    },
    {
      title: 'Actions',
      width: '23%',
      render: (a) => (
        <Space>
          <Tag
            color="red"
            className="delete-tag"
            style={{ marginRight: '0px' }}
            onClick={() => handleDelete(a)}
          >
            <Tooltip title="Delete">
              <DeleteOutlined />
            </Tooltip>
          </Tag>
        </Space>
      ),
    },
  ];

  const handleClose = () => {
    onClose();
    setSelectedMenuData([]);
    form.setFieldsValue({
      name: '',
    });
    form.resetFields();
    form1.resetFields();
  };
  const resetFilters = () => {
    setSelectedMenuData([]);
    fetchData();
    setChooseType('');
    form1.resetFields(['MenuType']);
  };

  return (
    <Drawer
      width={800}
      onClose={onClose}
      visible={open}
      maskClosable={false}
      destroyOnClose
      closable={false}
      className="category-adding-drawer"
    >
      <Spin spinning={loading}>
        <div>
          <Space>
            <ArrowLeftOutlined onClick={onClose} />
            <span className="text-green-dark">
              {' '}
              {isEmpty(editData) ? 'Add Menu' : 'Edit Menu'}
            </span>
          </Space>
        </div>
        <div style={{ marginTop: '20px' }}>
          <Form
            form={form}
            className="user-form user-add-form delivery-form"
            layout="vertical"
            onFinish={onFinish}
          >
            <div className="">
              <Form.Item
                label="Menu Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Title is required',
                  },
                ]}
              >
                <Input
                  type="text"
                  placeholder="Enter the menu title.."
                  style={{ width: '100%' }}
                />
              </Form.Item>
              {/* inner form */}
              <Card>
                <Form
                  form={form1}
                  className="user-form user-add-form delivery-form"
                  layout="vertical"
                  onFinish={onFinishInside}
                >
                  <Form.Item
                    label="Choose Collection / Category"
                    name="MenuType"
                    rules={[
                      {
                        required: true,
                        message: 'Menu type is required',
                      },
                    ]}
                  >
                    <Radio.Group
                      className="theme-radio radio-theme-delivery"
                      defaultValue={chooseType}
                      onChange={(event) => handleEnableOnChange(event)}
                      name="MenuType"
                    >
                      <div className="form-display">
                        <Radio value="collection">Collection</Radio>
                        <Radio value="category">Category</Radio>
                      </div>
                    </Radio.Group>
                  </Form.Item>
                  <Row gutter={24} /* className="form-display" */>
                    <Col span={10}>
                      {chooseType === menuType.category && (
                        <Form.Item label="Main Menu" name="menu">
                          <Select
                            allowClear
                            showSearch
                            virtual={false}
                            placeholder="Select Category"
                            mode="multiple"
                            optionFilterProp="children"
                            maxTagCount="responsive"
                            filterOption={(inputData, optionData) =>
                              optionData.children
                                .toLowerCase()
                                .includes(inputData.toLowerCase()) === true
                            }
                          >
                            {categoryData.map((cat) => (
                              <Select.Option
                                value={cat.category_uid}
                                key={cat.category_uid}
                              >
                                {cat.category_name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      )}
                      {chooseType === menuType.collection && (
                        <Form.Item label="Main Menu" name="collection_uid">
                          <Select
                            allowClear
                            showSearch
                            placeholder="Select Collection"
                            optionFilterProp="children"
                            autoComplete="dontshow"
                            virtual={false}
                            // maxTagCount="responsive"
                            // onClear={handleStateClear}
                            filterOption={(inputData, optionData) =>
                              optionData.children
                                .toLowerCase()
                                .includes(inputData.toLowerCase()) === true
                            }
                          >
                            {collectionData.map((cat) => (
                              <Select.Option
                                value={cat.collection_uid}
                                key={cat.collection_uid}
                              >
                                {cat.title}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      )}
                    </Col>
                    {chooseType && (
                      <Col span={4}>
                        <div style={{ marginTop: '30px' }}>
                          <Form.Item>
                            <Space className="f_btns">
                              <Button onClick={onFinishInside} type="primary">
                                Save
                              </Button>
                            </Space>
                          </Form.Item>
                        </div>
                      </Col>
                    )}
                  </Row>
                  <div className="row-header">
                    <Row className="row-tittle">
                      <Space>
                        <span className="m-10 text-green-dark">
                          Selected Menu Items
                        </span>
                        {!isEmpty(selectedMenuData) && (
                          <Tag
                            icon={<CloseCircleOutlined />}
                            color="error"
                            style={{ borderRadius: '15px' }}
                            visible={selectedMenuData}
                            onClick={resetFilters}
                          >
                            Clear All
                          </Tag>
                        )}
                      </Space>
                    </Row>
                  </div>
                  <div className=" collection-product mt-10">
                    <Table
                      className="grid-table orders-table-styles"
                      style={{ marginBottom: 16 }}
                      columns={columns}
                      dataSource={selectedMenuData}
                    />
                  </div>
                </Form>
              </Card>
              {/* inner form ends */}
              &nbsp;
              <div className="text-right" style={{ marginBottom: '16px' }}>
                <Button
                  size="large"
                  type="primary"
                  htmlType="submit"
                  style={{ marginRight: '8px' }}
                  className="eight"
                >
                  {isEmpty(editData) ? 'Save' : 'Update'}
                </Button>
                <Button size="large" danger onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </Spin>
    </Drawer>
  );
};

export default AddNavigationMenu;
