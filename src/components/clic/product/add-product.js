import {
  Breadcrumb,
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Spin,
  notification,
} from 'antd';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { forEach, get, isEmpty } from 'lodash';
import { v4 as uuid } from 'uuid';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { CustomUpload } from '../../../shared/form-helpers';
import {
  createClicProduct,
  getClicLeads,
  getClicProduct,
  updateClicProduct,
} from '../../../utils/api/url-helper';
import {
  BUTTON_CANCEL_TEXT,
  BUTTON_CREATE_TEXT,
  BUTTON_SAVE_TEXT,
  CLIC_UPLOAD_FILE_FORM_PRODUCT,
  FAILED_TO_LOAD,
  PRODUCTS_BREAD_TITLE,
  PRODUCT_CHECK_OPTION_FIELD_ERROR,
  PRODUCT_CHECK_OPTION_LABEL,
  PRODUCT_CREATE_ERROR,
  PRODUCT_CREATE_FAILED,
  PRODUCT_CREATE_SUCCESS,
  PRODUCT_FEILD_TYPE_CHECKBOX,
  PRODUCT_FEILD_TYPE_RADIO,
  PRODUCT_UPDATE_ERROR,
  PRODUCT_UPDATE_FAILED,
  PRODUCT_UPDATE_SUCCESS,
  SCREEN_MODE_ADD,
  SCREEN_MODE_EDIT,
  BUTTON_NO_TEXT,
  BUTTON_YES_TEXT,
} from '../../../shared/constant-values';
import { getBase64 } from '../../../shared/attributes-helper';
import AddInputFieldList from './add-input-field';

const uuidRegex =
  /^[\da-f]{8}-[\da-f]{4}-[0-5][\da-f]{3}-[089ab][\da-f]{3}-[\da-f]{12}$/i;

const filterSelectedLead = (leadData, values) => {
  return leadData.filter((value) =>
    values.some((item) => value.leads_uid === item && value.key === 'enquire')
  );
};

const constructImageData = (data) => {
  const webImage = [];
  const mobImage = [];
  forEach(data, (image) => {
    if (image.image_source === 'Web') {
      webImage.push({
        ...image,
        status: 'done',
        url: image.product_image,
        name: image.name || '',
      });
    } else {
      mobImage.push({
        ...image,
        status: 'done',
        url: image.product_image,
        name: image.name || '',
      });
    }
  });
  return { webImage, mobImage };
};

function AddProduct(properties) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { id } = useParams();
  const [mode, setMode] = useState(SCREEN_MODE_ADD);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [productData, setProductData] = useState({});
  const [leads, setLeads] = useState([]);
  const [selectedLeads, setSlectedLeads] = useState([]);
  const [fileListState, setFileList] = useState([]);
  const [fileUploadCount, setFileUploadCount] = useState(0);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [addInputs, setAddInputs] = useState([]);
  const [disableInputButton, setDisableInputButton] = useState(true);

  const setAddInputDisable = (leadData, values) => {
    const disableInput = filterSelectedLead(leadData, values);
    setDisableInputButton(isEmpty(disableInput));
  };

  const onChange = (checkedValues) => {
    const disableInput = filterSelectedLead(leads, checkedValues);
    if (disableInput.length === 0 && !isEmpty(addInputs)) {
      Modal.confirm({
        title: 'Are you sure want to unselect the enquiry option?',
        icon: <ExclamationCircleOutlined />,
        okText: BUTTON_YES_TEXT,
        cancelText: BUTTON_NO_TEXT,
        className: 'clic-confirm-modal',
        onOk() {
          setSlectedLeads(checkedValues);
          setDisableInputButton(true);
          setAddInputs([]);
        },
      });
    } else {
      setSlectedLeads(checkedValues);
      setAddInputDisable(leads, checkedValues);

      if (disableInput) {
        const value = {
          id: uuid(),
          type: 'input',
          disabled: true,
          label: 'Enter Your Phone number',
          required: true,
          flag: 'Phone_number',
        };
        const isPhoneNumber = addInputs.filter(
          (item) => item.flag !== 'phone_number'
        );
        if (isEmpty(isPhoneNumber)) setAddInputs([...addInputs, value]);
      }
    }
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url.slice(Math.max(0, file.url.lastIndexOf('/') + 1))
    );
  };

  useEffect(() => {
    if (!isEmpty(productData)) {
      form.setFieldsValue(productData);
      const enquiryInput = get(productData, 'product_leads', []);
      forEach(enquiryInput, (item) => {
        if (!isEmpty(JSON.parse(get(item, 'enquiry_fields', [])))) {
          setAddInputs(JSON.parse(get(item, 'enquiry_fields', [])));
        }
      });
    }
  }, [productData]);

  const fetchProductData = () => {
    if (id) {
      if (uuidRegex.test(id)) {
        setMode(SCREEN_MODE_EDIT);
        const apiArray = [getClicProduct(id), getClicLeads()];
        setLoading(true);
        Promise.all(apiArray)
          .then((resp) => {
            setLeads(get(resp, '[1].data', []));
            const leadData = get(resp, '[0].data.product_leads', []).map(
              (item) => {
                return item?.lead?.leads_uid;
              }
            );
            setAddInputDisable(get(resp, '[1].data', []), leadData);
            setSlectedLeads(leadData);
            const product = get(resp, '[0].data', {});
            const imageData = constructImageData(product?.product_image);
            product.product_image = get(imageData, 'webImage', []);
            product.product_mobile_image = get(imageData, 'mobImage', []);
            setFileList(product.product_image);
            setProductData(product);
            setLoading(false);
          })
          .catch((error_) => {
            setLoading(false);
            notification.error({
              message: get(error_, 'message', false) || FAILED_TO_LOAD,
            });
          });
      } else {
        navigate('/');
      }
    } else {
      setMode(SCREEN_MODE_ADD);
      const apiArray = [getClicLeads()];
      setLoading(true);
      Promise.all(apiArray)
        .then((resp) => {
          setLeads(get(resp, '[0].data', []));
          setLoading(false);
        })
        .catch((error_) => {
          setLoading(false);
          notification.error({
            message: get(error_, 'message', false) || FAILED_TO_LOAD,
          });
        });
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id, properties.history, form]);

  const updateProduct = (values, files, productId) => {
    setButtonLoading(true);
    updateClicProduct(values, files, productId)
      .then((response) => {
        const { data } = response;
        setButtonLoading(false);
        if (data.success) {
          navigate(-1);
          notification.success({ message: PRODUCT_UPDATE_SUCCESS });
        } else {
          notification.error({
            message: get(data, 'message', false) || PRODUCT_UPDATE_FAILED,
          });
        }
      })
      .catch((error_) => {
        setButtonLoading(false);
        notification.error({
          message: get(error_, 'message', false) || PRODUCT_UPDATE_ERROR,
        });
      });
  };

  const createProduct = (values, files) => {
    setButtonLoading(true);
    createClicProduct(values, files)
      .then((response) => {
        const { data } = response;
        setButtonLoading(false);
        if (get(response, 'data.success')) {
          navigate(-1);
          return notification.success({
            message: PRODUCT_CREATE_SUCCESS,
          });
        }
        return notification.error({
          message: data.message || PRODUCT_CREATE_FAILED,
        });
      })
      .catch((error_) => {
        setButtonLoading(false);
        notification.error({
          message: get(error_, 'message', false) || PRODUCT_CREATE_ERROR,
        });
      });
  };

  const onFinish = (fields) => {
    if (isEmpty(selectedLeads)) {
      notification.error({
        message: PRODUCT_CHECK_OPTION_FIELD_ERROR,
      });
    } else {
      const filterId = leads.filter((data) =>
        selectedLeads.includes(data?.leads_uid)
      );
      const lead = [];
      forEach(filterId, (index) => {
        if (index.key === 'enquire') {
          lead.push({
            leads_uid: index?.leads_uid,
            enquiry_fields: addInputs,
          });
        } else {
          lead.push({
            leads_uid: index?.leads_uid,
          });
        }
      });
      const values = {
        product_name: fields?.product_name?.trim(),
        price: fields?.price,
        clic_description: fields?.clic_description,
        lead: JSON.stringify(lead),
      };

      const files = {
        files: fileListState.map((item) => item?.originFileObj),
      };
      if (mode === SCREEN_MODE_EDIT && id) {
        values.product_image = JSON.stringify(
          fileListState.filter((item) => !item?.originFileObj)
        );
        updateProduct(values, files, id);
      } else if (mode === SCREEN_MODE_ADD) {
        createProduct(values, files);
      }
    }
  };

  const handleButtonClick = (type) => {
    const value = { id: uuid(), type, label: '', required: false };
    if (
      type === PRODUCT_FEILD_TYPE_RADIO ||
      type === PRODUCT_FEILD_TYPE_CHECKBOX
    ) {
      value.options = [{ id: uuid(), value: '', label: '' }];
    }
    const newValues = [...addInputs, value];
    setAddInputs(newValues);
  };

  return (
    <Spin spinning={loading}>
      <div className="clic-product-container">
        <div>
          <div>
            <Breadcrumb separator=">">
              <Breadcrumb.Item className="table-tax">
                <Link to="/products">{PRODUCTS_BREAD_TITLE}</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item className="table-tax">
                {mode === SCREEN_MODE_EDIT ? 'Edit Product' : 'Add Product'}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="add-product-main-container">
            <div className="add-product-container add-product-wrapper">
              <Form layout="vertical" form={form} onFinish={onFinish}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Row>
                      <Col span={24}>
                        <Form.Item name="product_image">
                          <div className="image-form-container">
                            <CustomUpload
                              width={1280}
                              height={1280}
                              maxItem={1}
                              setFileList={setFileList}
                              handlePreview={handlePreview}
                              fileListState={fileListState}
                              fileUploadCount={fileUploadCount}
                              setFileUploadCount={setFileUploadCount}
                              from={CLIC_UPLOAD_FILE_FORM_PRODUCT}
                              skipResize
                            />
                          </div>
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          label="Product Name"
                          name="product_name"
                          rules={[
                            {
                              required: true,
                              message: 'Please enter product name',
                            },
                          ]}
                        >
                          <Input placeholder="Enter your product name" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          label="Product Description"
                          name="clic_description"
                        >
                          <Input placeholder="Enter your product description" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          label="Price"
                          name="price"
                          rules={[
                            {
                              required: true,
                              message: 'Please enter product price',
                            },
                          ]}
                        >
                          <InputNumber
                            type="number"
                            style={{ width: '100%' }}
                            placeholder="Enter Price"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <div className="option-text">
                          {PRODUCT_CHECK_OPTION_LABEL}
                        </div>
                        <div className="checkbot-container">
                          <Checkbox.Group
                            value={selectedLeads}
                            onChange={onChange}
                          >
                            <Row>
                              {leads.map((lead) => (
                                <div span={12} key={lead?.leads_uid}>
                                  <Checkbox value={lead?.leads_uid}>
                                    {lead?.name}
                                  </Checkbox>
                                </div>
                              ))}
                            </Row>
                          </Checkbox.Group>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={11} offset={1}>
                    <div className="add-fields">
                      <h4>Add Fields</h4>
                      <div>
                        <div className="input-fields">
                          <span className="input-text">Input</span>
                          <Button
                            onClick={() => handleButtonClick('input')}
                            disabled={disableInputButton}
                          >
                            +
                          </Button>
                        </div>
                        <div className="input-fields">
                          <span className="input-text">Radio Button</span>
                          <Button
                            onClick={() => handleButtonClick('radio')}
                            disabled={disableInputButton}
                          >
                            +
                          </Button>
                        </div>
                        <div className="input-fields">
                          <span className="input-text">Checkbox</span>
                          <Button
                            onClick={() => handleButtonClick('checkbox')}
                            disabled={disableInputButton}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Col>
                  {!isEmpty(addInputs) && (
                    <AddInputFieldList
                      fields={addInputs}
                      setAddInputs={setAddInputs}
                      mode={mode}
                      id={id}
                    />
                  )}
                  <Col span={24}>
                    <Form.Item>
                      <div className="flex-end mt-20">
                        <Space>
                          <Button
                            danger
                            type="default"
                            onClick={() => navigate(-1)}
                          >
                            {BUTTON_CANCEL_TEXT}
                          </Button>
                          <Button
                            loading={buttonLoading}
                            htmlType="submit"
                            type="primary"
                            className="ten"
                          >
                            {mode === SCREEN_MODE_EDIT
                              ? BUTTON_SAVE_TEXT
                              : BUTTON_CREATE_TEXT}
                          </Button>
                        </Space>
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={false}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt={previewTitle} style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Spin>
  );
}
export default AddProduct;
