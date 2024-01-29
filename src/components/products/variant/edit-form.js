import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Switch,
} from 'antd';
import { filter, get, includes, map, toUpper } from 'lodash';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { HighlightOutlined } from '@ant-design/icons';
import { SketchPicker } from 'react-color';
import getAttributeIdByName, {
  getBase64,
} from '../../../shared/attributes-helper';
import { CustomUpload } from '../../../shared/form-helpers';
import { TenantContext } from '../../context/tenant-context';
import {
  VARIANT_MEDIA_COUNT,
  VIDEO_TYPES,
} from '../../../shared/constant-values';
// import ImageUploadModal from '../image-modal';

function EditForm(properties) {
  const [variantForm] = Form.useForm();
  const {
    filteredAttributesData,
    showEditForm,
    setShowEditForm,
    onFinish,
    editData,
    defaultAttributes,
  } = properties;
  const tenantDetails = useContext(TenantContext)[0];

  const [productTax, setProductTax] = useState();
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [color, setColor] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentColorKey, setCurrentColorKey] = useState();
  const [previousState, setPreviousState] = useState('');
  const [previousColorKey, setPreviousColorKey] = useState('');
  const [variantImg, setVariantImg] = useState([]);
  const [formReference, setFormReference] = useState(variantForm);
  // const [fileUploadCount, setFileUploadCount] = useState(0);
  // const [uploadObject, setUploadObject] = useState([
  //   { id: 1, isDisable: true, url: '' },
  //   { id: 2, isDisable: false, url: '' },
  //   { id: 3, isDisable: false, url: '' },
  //   { id: 4, isDisable: false, url: '' },
  //   { id: 5, isDisable: false, url: '' },
  //   { id: 6, isDisable: false, url: '' },
  //   { id: 7, isDisable: false, url: '' },
  // ]);
  // const [metaArray, setMetaArray] = useState([]);
  // const [uncheckIndex, setUncheckIndex] = useState([]);

  const formValues = { name: 0, key: 0, isListField: true, fieldKey: 0 };

  const handleCancel = () => {
    setShowEditForm(false);
    variantForm.resetFields();
  };

  const handleChange = (value) => {
    setColor(value?.hex);
    const colorCodeId = getAttributeIdByName(
      defaultAttributes,
      ['name', 'Color Code'],
      '[0].attribute_id'
    );
    formReference.setFields([
      {
        name: [currentColorKey, colorCodeId],
        value: value?.hex,
        errors: [],
      },
    ]);
  };

  const handleColorCancel = () => {
    const colorCodeId = getAttributeIdByName(
      defaultAttributes,
      ['name', 'Color Code'],
      '[0].attribute_id'
    );
    formReference.setFields([
      {
        name: [previousColorKey, colorCodeId],
        value: previousState,
        errors: [],
      },
    ]);
    setColor(previousState);
    setIsModalVisible(false);
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

  const handleOk = () => {
    setPreviousState(color);
    setIsModalVisible(false);
  };

  const getFormItemRules = (
    { required, whitespace, number, positiveNumber, minMax },
    items
    // eslint-disable-next-line unicorn/consistent-function-scoping
  ) => {
    const rulesData = [];
    switch ((required, whitespace, number, positiveNumber, minMax)) {
      case required: {
        rulesData.push({ required: true });
        break;
      }
      case whitespace:
      case ['mixed', 'string'].includes(
        items?.data_type || items?.attribute?.data_type
      ): {
        rulesData.push({
          validator(_, value) {
            if (
              value &&
              (!value.toString().slice(0, 1).trim() ||
                !value.toString().slice(-1).trim())
            ) {
              const error = new Error(
                'Whitespace around the value not allowed.'
              );
              // eslint-disable-next-line prefer-promise-reject-errors
              return Promise.reject(error);
            }
            return Promise.resolve();
          },
        });
        break;
      }
      case number: {
        rulesData.push({
          type: 'number',
          message: 'Please enter a valid number',
        });
        break;
      }
      case positiveNumber: {
        rulesData.push({
          validator: (_, value) => {
            if (value && value < 0) {
              const error = new Error('Value should not be a negative number');
              // eslint-disable-next-line prefer-promise-reject-errors
              return Promise.reject(error);
            }
            return Promise.resolve();
          },
        });
        break;
      }
      case minMax: {
        rulesData.push({
          validator: (_, value) => {
            if (!value || value <= 50) {
              return Promise.resolve();
            }
            const error = new Error('GST% value should be between 0 to 50.');
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject(error);
          },
        });
        break;
      }
      default: {
        break;
      }
    }
    return rulesData;
  };

  const removeTime = () => {
    if (get(tenantDetails, 'setting.date_format', 'DD-MM-YYYY') === 'LL')
      return get(tenantDetails, 'setting.date_format', 'DD-MM-YYYY');
    return 'DD-MM-YYYY';
  };

  const showModal = (field) => {
    const colorCodeId = getAttributeIdByName(
      defaultAttributes,
      ['name', 'Color Code'],
      '[0].attribute_id'
    );
    const currentColorCode = color || editData[colorCodeId];
    setColor(currentColorCode);
    setPreviousState(currentColorCode);
    setCurrentColorKey(field.name);
    setPreviousColorKey(field.name);
    setIsModalVisible(true);
  };
  const getInputDependencies = (items, fields, field) => {
    const dependencyData = [];
    const currentKey = get(field, 'key');
    const priceCircle = [
      'MRP Price',
      'Selling Price',
      'Discount in %',
      `Discount in ₹`,
    ];
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getIdByName = (name) =>
      get(filter(defaultAttributes, ['name', name]), '[0].attribute_id', '');
    if (get(items, 'name') === 'Units') {
      // eslint-disable-next-line no-restricted-syntax
      for (const item of fields) {
        dependencyData.push([
          'product_variants',
          get(item, 'key'),
          getIdByName('Units'),
        ]);
      }
    }
    if (priceCircle.includes(get(items, 'name'))) {
      const uniqPriceCircle = filter(
        priceCircle,
        (item) => item !== get(items, 'name')
      );
      // eslint-disable-next-line no-restricted-syntax
      for (const item of uniqPriceCircle)
        dependencyData.push([
          'product_variants',
          currentKey,
          getIdByName(item),
        ]);
    }
    return dependencyData;
  };

  const getAdditionalRules = (items) => {
    const rulesData = [];
    switch (get(items, 'data_type')) {
      case 'number':
      case 'float': {
        rulesData.push(
          {
            type: 'number',
            message: 'Please enter a valid number',
          },
          {
            validator: (_) => {
              const value = variantForm.getFieldValue(_.field.split('.'));
              if (value && value < 0) {
                return Promise.reject(
                  new Error('Value should not be a negative number')
                );
              }
              return Promise.resolve();
            },
          }
        );
        break;
      }
      default: {
        break;
      }
    }
    return rulesData;
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const getProperties = (dataType) => {
    const inputProperties = {};

    if (dataType === 'percentage' || dataType === 'float') {
      inputProperties.precision = 2;
      inputProperties.step = 0.1;
    }
    return inputProperties;
  };

  const productTaxChange = (checked, field) => {
    const includingTaxId = getAttributeIdByName(
      defaultAttributes,
      ['name', 'Including TAX'],
      '[0].attribute_id'
    );
    formReference.setFields([
      {
        name: ['product_variants', field.key, includingTaxId],
        value: Number(checked),
      },
    ]);
    setProductTax(Number(checked));
  };

  const formItemByType = (items, field) => {
    if (get(items, 'name') === 'Including TAX') {
      return (
        <Switch
          size="small"
          onChange={(checked) => {
            productTaxChange(checked, field);
          }}
          checked={productTax}
          placeholder={get(items, 'name') || get(items, 'attribute.name')}
        />
      );
    }
    if (get(items, 'name') === 'Image') {
      return (
        <CustomUpload
          width={1280}
          height={1280}
          maxItem={VARIANT_MEDIA_COUNT}
          handlePreview={handlePreview}
          setFileList={setVariantImg}
          fileListState={variantImg}
          skipResize
        />
      );
    }
    if (get(items, 'name') === 'Description') {
      return (
        <Input.TextArea
          style={{ width: '90%' }}
          {...getProperties(get(items, 'data_type'))}
          rows={5}
          placeholder={get(items, 'name') || get(items, 'attribute.name')}
        />
      );
    }
    if (get(items, 'data_type') === 'date') {
      return (
        <DatePicker
          size="large"
          style={{ width: '90%' }}
          format={removeTime()}
          placeholder={get(items, 'name') || get(items, 'attribute.name')}
        />
      );
    }
    if (get(items, 'name') === 'Color Code') {
      const colorCodeId = getAttributeIdByName(
        defaultAttributes,
        ['name', 'Color Code'],
        '[0].attribute_id'
      );
      variantForm.setFields([
        {
          name: ['product_variants', field.key, colorCodeId],
          value: color,
          errors: [],
        },
      ]);
      const currentColorCode = variantForm.getFieldValue([
        'product_variants',
        field.key,
        colorCodeId,
      ]);
      return (
        <Input
          style={{ width: '90%' }}
          onClick={() => showModal(field)}
          placeholder={get(items, 'name') || get(items, 'attribute.name')}
          readOnly
          suffix={
            currentColorCode && (
              <HighlightOutlined
                style={{ color: currentColorCode, fontSize: '20px' }}
              />
            )
          }
        />
      );
    }
    if (includes(['number', 'float', 'percentage'], get(items, 'data_type'))) {
      return (
        <InputNumber
          style={{ width: '90%' }}
          {...getProperties(get(items, 'data_type'))}
          placeholder={get(items, 'name') || get(items, 'attribute.name')}
        />
      );
    }
    return (
      <Input
        style={{ width: '90%' }}
        placeholder={get(items, 'name') || get(items, 'attribute.name')}
      />
    );
  };

  const formItemFields = (items, field, fields) => {
    const labelName = get(items, 'name') || get(items, 'attribute.name');
    return (
      <Col span={get(items, 'name') === 'Image' ? 6 : 12}>
        <Form.Item
          {...field}
          label={labelName === 'Units' ? 'Variant' : labelName}
          name={[
            get(field, 'name'),
            get(items, 'attribute_id') || get(items, 'attribute.id'),
          ]}
          key={[
            field.fieldKey,
            get(items, 'name') || get(items, 'attribute.name'),
          ]}
          dependencies={getInputDependencies(items, fields, field)}
          rules={[
            ...getFormItemRules({
              required: !(
                labelName === 'Manufacture date' ||
                labelName === 'Color Code' ||
                labelName === 'Including TAX' ||
                labelName === 'Discount in %' ||
                labelName === `Discount Amount` ||
                labelName === 'MRP Price' ||
                labelName === 'Length (in cm)' ||
                labelName === 'Width (in cm)' ||
                labelName === 'Height (in cm)' ||
                labelName === 'Weight (in kg)' ||
                labelName === 'Image' ||
                labelName === 'Description'
              ),
            }),
            ...getAdditionalRules(items),
          ]}
        >
          {formItemByType(items, field)}
        </Form.Item>
      </Col>
    );
  };
  const showLowStock = (items, objectField, fields) => {
    if (get(items, 'name') !== 'Low Stock Level') {
      return formItemFields(items, objectField, fields);
    }
    return '';
  };

  const saveFormReference = useCallback((node) => {
    if (node !== null) {
      setFormReference(node);
    }
  }, []);
  useEffect(() => {
    variantForm.setFieldsValue([editData]);
    formReference.setFieldsValue([editData]);
    if (
      editData[
        getAttributeIdByName(
          defaultAttributes,
          ['name', 'Image'],
          '[0].attribute_id'
        )
      ]
    ) {
      setVariantImg(
        editData[
          getAttributeIdByName(
            defaultAttributes,
            ['name', 'Image'],
            '[0].attribute_id'
          )
        ]
      );
    }
    if (
      editData[
        getAttributeIdByName(
          defaultAttributes,
          ['name', 'Including TAX'],
          '[0].attribute_id'
        )
      ]
    ) {
      productTaxChange(
        editData[
          getAttributeIdByName(
            defaultAttributes,
            ['name', 'Including TAX'],
            '[0].attribute_id'
          ).toString()
        ],
        formValues
      );
      setProductTax(true);
    }
  }, [editData, variantForm]);
  return (
    <div>
      <Modal
        title={`Edit ${toUpper(editData[1])} Variant`}
        destroyOnClose
        open={showEditForm}
        onCancel={() => handleCancel()}
        // eslint-disable-next-line unicorn/no-null
        footer={null}
        style={{ top: '10px' }}
        width={600}
      >
        <Form
          ref={saveFormReference}
          name="product_variants"
          form={variantForm}
          onFinish={onFinish}
          layout="vertical"
        >
          <Row>
            {map(filteredAttributesData, (attributes) => {
              if (
                attributes.attribute_id !==
                  getAttributeIdByName(
                    defaultAttributes,
                    ['name', 'Units'],
                    '[0].attribute_id'
                  ) &&
                attributes.attribute_id !==
                  getAttributeIdByName(
                    defaultAttributes,
                    ['name', 'MRP Price'],
                    '[0].attribute_id'
                  ) &&
                attributes.attribute_id !==
                  getAttributeIdByName(
                    defaultAttributes,
                    ['name', 'Selling Price'],
                    '[0].attribute_id'
                  ) &&
                attributes.attribute_id !==
                  getAttributeIdByName(
                    defaultAttributes,
                    ['name', 'Discount in %'],
                    '[0].attribute_id'
                  ) &&
                attributes.attribute_id !==
                  getAttributeIdByName(
                    defaultAttributes,
                    ['name', 'Discount Amount'],
                    '[0].attribute_id'
                  )
              ) {
                return showLowStock(attributes, formValues, [formValues]);
              }
              // eslint-disable-next-line unicorn/no-null
              return null;
            })}
          </Row>
          <Row style={{ justifyContent: 'end' }}>
            <Col span={3}>
              <Form.Item>
                <Space className="f_btns">
                  <Button htmlType="submit" type="primary">
                    Update
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Modal
        open={previewVisible}
        title={previewTitle}
        // eslint-disable-next-line unicorn/no-null
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        {previewImage.split('.').some((type) => VIDEO_TYPES.includes(type)) ? (
          <video width="100%" height="auto" preload="auto" autoPlay controls>
            <track kind="captions" />
            <source kind="captions" src={previewImage} type="video/mp4" />
          </video>
        ) : (
          <img
            alt={previewTitle}
            style={{ width: '100%' }}
            src={previewImage}
          />
        )}
      </Modal>
      <Modal
        title="Color Picker"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleColorCancel}
        width="269px"
        // destroyOnClose
      >
        <SketchPicker color={color} onChange={handleChange} />
      </Modal>
    </div>
  );
}

export default EditForm;
