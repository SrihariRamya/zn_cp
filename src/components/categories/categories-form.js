import {
  ArrowLeftOutlined,
  PlusOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Table,
  Modal,
  Checkbox,
  Collapse,
  Tabs,
  Col,
  Tooltip,
  Tour,
} from 'antd';
import React, { useContext, useState, useRef, useEffect } from 'react';
import SerpPreview from 'react-serp-preview';
import { get } from 'lodash';
import ImageUploadModal from '../products/image-modal';
import {
  CAT_ATTRIBUTE_INFO,
  CAT_SEO_INFO,
  SCREEN_MODE_ADD,
  SCREEN_MODE_EDIT,
} from '../../shared/constant-values';
import { TenantContext } from '../context/tenant-context';

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;

function CategoriesForm(properties) {
  const [tenantDetails] = useContext(TenantContext);
  const [metaArray, setMetaArray] = useState([]);
  const [subCategoryMetaArray, setSubCategoryMetaArray] = useState([]);
  const reference1 = useRef(null);
  const formReference = useRef(null);
  const [currentSteps, setCurrentSteps] = useState(0);

  const {
    onClose,
    visible,
    drawerLoading,
    title,
    form,
    onFinish,
    setOpenTourModal,
    onValuesChange,
    setFileListArray,
    handlePreview,
    fileLists,
    setFileUploadCount,
    selectCategoryData,
    type,
    selectedData,
    onFinishAttributes,
    form1,
    dataType,
    drawerColumn,
    rowSelectionAttribute,
    attributeData,
    seoMetaDescription,
    seoPageTitle,
    catCustomUrl,
    subCatCustomUrl,
    setSeoPageTitle,
    setSeoMetaDescription,
    handleCatCustomUrl,
    handleSubCatCustomUrl,
    previewVisible,
    previewTitle,
    handleCancel,
    imgUrl,
    openTourModal,
    activeTab,
    setActiveTab,
    handleDeleteAttribute,
    selectedAttribute,
    uploadObject,
    setUploadObject,
    subcategoryTab,
    categoryTab,
    subCatUploadObject,
    setSubCatUploadObject,
    subCatFileLists,
    setSubCatFileList,
    subCategoryInput,
    setSubCategoryInput,
  } = properties;

  useEffect(() => {
    if (openTourModal && window.innerWidth < 760) {
      const getTourElement = document.querySelector('.ant-tour');
      getTourElement.classList.add('tour-width-mobile');
    }
  }, []);

  const handleSkip = () => {
    setOpenTourModal(false);
  };

  const handleNext = () => {
    const current = currentSteps;
    setCurrentSteps(current + 1);
  };
  const handlePrevious = () => {
    const current = currentSteps;
    setCurrentSteps(current - 1);
  };
  const handleSave = () => {
    formReference.current.submit();
  };

  const steps = [
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Adding a category image is simple! You can import from{' '}
            <b style={{ color: '#0B3D60' }}>
              Facebook, Instagram, Google Photos,
            </b>{' '}
            or select images from your local file folder. If you don&apos;t have
            one, no worries; use Adobe Express to design your own.
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <Button type="primary" onClick={handleNext}>
                Next
              </Button>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.image-modal-categories');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Adding a category image is simple! You can import from Facebook,
            Instagram, Google Photos, or select images from your local file
            folder. If you don&apos;t have one, no worries; use Adobe Express to
            design your own.
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={handlePrevious}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('#category-name-text');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Create sub-categories under your main categories to offer a refined
            shopping experience. e.g Electronics - &apos;Mobiles&apos;, Clothing
            - &apos;T-Shirts&apos;. Click &apos;Add Sub-Category&apos; to begin.
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={handlePrevious}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.category-checkbox');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Create sub-categories under your main categories to offer a refined
            shopping experience. e.g Electronics - &apos;Mobiles&apos;, Clothing
            - &apos;T-Shirts&apos;. Click &apos;Add Sub-Category&apos; to begin.
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={handlePrevious}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.checkbox-container');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
  ];

  const handleActiveTab = (event) => {
    setActiveTab(event);
  };

  const attributeTitle = () => (
    <div className="center">
      <p className="mr-8">Add Attributes</p>
      <Tooltip title={CAT_ATTRIBUTE_INFO}>
        <InfoCircleOutlined />
      </Tooltip>
    </div>
  );

  const seoTitle = () => (
    <div className="center">
      <p className="mr-8">SEO</p>
      <Tooltip title={CAT_SEO_INFO}>
        <InfoCircleOutlined />
      </Tooltip>
    </div>
  );
  const subCategoryInputCheckbox = () => {
    setSubCategoryInput(!subCategoryInput);
    if (openTourModal) {
      setCurrentSteps(3);
    }
  };

  return (
    <div>
      <Drawer
        width={900}
        onClose={onClose}
        open={visible}
        maskClosable={false}
        destroyOnClose
        closable={false}
        className="category-adding-drawer"
      >
        <Spin spinning={drawerLoading}>
          <div>
            <div className="category-title-container">
              <div>
                <ArrowLeftOutlined onClick={onClose} />
              </div>
              <div className="category-title">{title}</div>
            </div>
            <Form
              ref={formReference}
              form={form}
              className="user-form"
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={() => setOpenTourModal(false)}
              initialValues={{ coverage_list: [] }}
              onValuesChange={onValuesChange}
              scrollToFirstError
            >
              <Tabs
                type="card"
                activeKey={activeTab}
                onChange={handleActiveTab}
                className="category-theme-tabs"
              >
                <TabPane
                  disabled={categoryTab}
                  tab="Add category"
                  key="category"
                >
                  {activeTab === 'category' && (
                    <div className="zupain-form">
                      <Row>
                        <Col
                          sm={24}
                          xs={24}
                          md={8}
                          span={8}
                          className="cat-img-alignment"
                        >
                          <Form.Item
                            name="image"
                            ref={reference1}
                            className="image-modal-categories"
                          >
                            <ImageUploadModal
                              item={uploadObject}
                              uploadObject={uploadObject}
                              setUploadObject={setUploadObject}
                              metaArray={metaArray}
                              setMetaArray={setMetaArray}
                              mobileView={false}
                              visibility="image-only"
                              setFileList={setFileListArray}
                              handlePreview={handlePreview}
                              setFileUploadCount={setFileUploadCount}
                              fileListState={fileLists}
                              width={200}
                              height={185}
                              editType={
                                uploadObject[0]?.url?.length > 0 ||
                                uploadObject[0]?.productImageInfo?.product_image
                                  ?.length > 0
                              }
                              openTourModal={openTourModal}
                              setOpenTourModal={setOpenTourModal}
                              setCurrentStep={setCurrentSteps}
                            />
                          </Form.Item>
                        </Col>
                        <Col sm={24} xs={24} md={16} span={16}>
                          <div id="category-name-text">
                            <Form.Item
                              label="Categories"
                              name="categoryName"
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter Category',
                                },
                              ]}
                            >
                              <Input placeholder="Enter Category" />
                            </Form.Item>
                          </div>
                          {type !== 'EDIT' && (
                            <div className="checkbox-container">
                              <div className="category-checkbox">
                                <Checkbox
                                  checked={subCategoryInput}
                                  onClick={() => subCategoryInputCheckbox()}
                                />{' '}
                                &nbsp;<span>Add subcategory</span>
                              </div>
                              <div>
                                {subCategoryInput && (
                                  <Form.Item
                                    label="Subcategory"
                                    name="subCategoryName"
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please enter Subcategory',
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Enter Subcategory" />
                                  </Form.Item>
                                )}
                              </div>
                            </div>
                          )}
                        </Col>
                      </Row>
                    </div>
                  )}
                </TabPane>
                <TabPane
                  disabled={subcategoryTab}
                  tab="Add subcategory"
                  key="subCategory"
                >
                  {activeTab === 'subCategory' && (
                    <div>
                      <Row>
                        <Col
                          sm={24}
                          xs={24}
                          md={8}
                          span={8}
                          className="cat-img-alignment"
                        >
                          <Form.Item name="subcategoryImage">
                            <ImageUploadModal
                              item={subCatUploadObject}
                              uploadObject={subCatUploadObject}
                              setUploadObject={setSubCatUploadObject}
                              metaArray={subCategoryMetaArray}
                              setMetaArray={setSubCategoryMetaArray}
                              mobileView={false}
                              visibility="image-only"
                              setFileList={setSubCatFileList}
                              fileListState={subCatFileLists}
                              setFileUploadCount={setFileUploadCount}
                              handlePreview={handlePreview}
                              width={200}
                              height={185}
                              editType={
                                subCatUploadObject[0]?.url?.length > 0 ||
                                subCatUploadObject[0]?.productImageInfo
                                  ?.product_image?.length > 0
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col sm={24} xs={24} md={8} span={16}>
                          <div>
                            <Form.Item
                              label="Subcategory"
                              name="subCategoryName"
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter Subcategory',
                                },
                              ]}
                            >
                              <Input placeholder="Enter Subcategory" />
                            </Form.Item>
                          </div>
                          <div>
                            <Form.Item
                              label="Categories"
                              name="categoryID"
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter categories',
                                },
                              ]}
                            >
                              <Select
                                className="select-height"
                                placeholder="Please select a category"
                                virtual={false}
                                allowClear
                              >
                                {selectCategoryData?.map((categoryName) => (
                                  <Option
                                    key={get(categoryName, 'category_uid', '')}
                                    value={get(
                                      categoryName,
                                      'category_uid',
                                      ''
                                    )}
                                  >
                                    {get(categoryName, 'category_name', '')}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}
                </TabPane>
              </Tabs>
              <Collapse
                className="category-collapse"
                collapsible
                expandIconPosition="end"
              >
                <Panel header={attributeTitle()} key="1">
                  <div>
                    <Form
                      onFinish={onFinishAttributes}
                      form={form1}
                      layout="vertical"
                      id="add-attributes"
                    >
                      <div>
                        <div className="zupain-form">
                          <Row
                            gutter={{
                              xs: 8,
                              sm: 16,
                              md: 24,
                              lg: 32,
                            }}
                            justify="space-around"
                          >
                            <Col xs={24} sm={24} md={10} lg={10}>
                              <Form.Item
                                label="Add Attributes"
                                name="attributes"
                                className="hide_required"
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please enter attribute',
                                  },
                                ]}
                              >
                                <Input placeholder="Enter Attributes" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={9} lg={9}>
                              <Form.Item
                                name="attributeType"
                                label="Data Type"
                                className="hide_required"
                                hasFeedback
                              >
                                <Select
                                  placeholder="Select"
                                  className="select-height"
                                  allowClear
                                >
                                  {dataType?.map((data) => (
                                    <Option
                                      key={data?.id}
                                      value={get(data, 'data_type', '')}
                                    >
                                      {get(data, 'data_type', '')}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col
                              xs={24}
                              sm={24}
                              md={5}
                              lg={5}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'flex-end',
                              }}
                            >
                              <Form.Item>
                                <Button
                                  type="primary"
                                  onClick={onFinishAttributes}
                                >
                                  <PlusOutlined />
                                  Add
                                </Button>
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </Form>
                    {selectedAttribute?.length > 0 && (
                      <button
                        onClick={(event) =>
                          handleDeleteAttribute(
                            event,
                            selectedAttribute,
                            'multiple'
                          )
                        }
                        type="button"
                        className="attribute-delete"
                      >
                        Delete all
                      </button>
                    )}
                    &nbsp;
                    <Table
                      columns={drawerColumn}
                      dataSource={attributeData}
                      rowKey="attribute_id"
                      rowSelection={rowSelectionAttribute}
                      scroll={{ x: 500 }}
                      className="six category"
                    />
                  </div>
                </Panel>
              </Collapse>
              &nbsp;
              <Collapse
                className="category-collapse"
                collapsible
                expandIconPosition="end"
              >
                <Panel header={seoTitle()} key="1">
                  <div className="seven">
                    <SerpPreview
                      title={seoPageTitle}
                      metaDescription={seoMetaDescription}
                      url={`${get(
                        tenantDetails,
                        'customer_url',
                        ''
                      )}/product-list?categoryId=${catCustomUrl}${
                        selectedData?.sub_category_uid
                          ? `&subCategoryId=${subCatCustomUrl}`
                          : ''
                      }`}
                    />
                    &nbsp;
                    <Form.Item label="Page Title" name="seoTitle">
                      <Input
                        onChange={(a) => setSeoPageTitle(a.target.value)}
                        placeholder="Page Title"
                      />
                    </Form.Item>
                    <Form.Item label="Meta Description" name="seoDescription">
                      <TextArea
                        style={{ width: '100%' }}
                        rows={4}
                        onChange={(a) => setSeoMetaDescription(a.target.value)}
                        className="p-desc"
                        placeholder="Meta Description"
                      />
                    </Form.Item>
                    <Form.Item
                      className="seo-input-addon"
                      name="seoCatCustomPath"
                    >
                      <span className="seo-lable">Category Url Handle</span>
                      <span className="seo-url">{`${get(
                        tenantDetails,
                        'customer_url',
                        ''
                      )}/product-list?categoryId=`}</span>
                      <Input
                        onChange={handleCatCustomUrl}
                        placeholder="Url Handle"
                      />
                    </Form.Item>
                    {((type === SCREEN_MODE_EDIT &&
                      get(selectedData, 'sub_category_uid', '')) ||
                      type === SCREEN_MODE_ADD) && (
                      <Form.Item
                        name="seoSubCatCustomPath"
                        className="seo-input-addon"
                      >
                        <span className="seo-lable">
                          Sub-Category Url Handle
                        </span>
                        <span className="seo-url">{`${get(
                          tenantDetails,
                          'customer_url',
                          ''
                        )}/product-list?categoryId=${catCustomUrl}&subCategoryId=`}</span>
                        <Input
                          onChange={handleSubCatCustomUrl}
                          placeholder="Url Handle"
                        />
                      </Form.Item>
                    )}
                  </div>
                </Panel>
              </Collapse>
              &nbsp;
              <div className="text-right" style={{ marginBottom: '16px' }}>
                <Button
                  size="large"
                  onClick={onClose}
                  style={{ marginRight: '8px' }}
                >
                  Cancel
                </Button>
                <Button
                  size="large"
                  type="primary"
                  htmlType="submit"
                  className="eight"
                >
                  Save
                </Button>
                <Tour
                  open={openTourModal}
                  onClose={() => setOpenTourModal(false)}
                  steps={steps}
                  current={currentSteps}
                  className="milestone-tour"
                />
              </div>
            </Form>
          </div>
        </Spin>
      </Drawer>
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={undefined}
        onCancel={handleCancel}
      >
        <img alt={previewTitle} style={{ width: '100%' }} src={imgUrl} />
      </Modal>
    </div>
  );
}

export default CategoriesForm;
