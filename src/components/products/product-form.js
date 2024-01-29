import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Select,
  notification,
  Space,
  Row,
  Col,
  Spin,
  InputNumber,
  Modal,
  Collapse,
  Checkbox,
  Tree,
  Tag,
} from 'antd';
import {
  CloseOutlined,
  SearchOutlined,
  PlusOutlined,
  // DoubleRightOutlined,
} from '@ant-design/icons';
import {
  get,
  map,
  capitalize,
  filter,
  compact,
  isEmpty,
  cloneDeep,
  concat,
  forEach,
  isNaN,
  isNil,
  forOwn,
  debounce,
  reduce,
  includes,
} from 'lodash';
import moment from 'moment';
import { getData } from 'country-list';
import SerpPreview from 'react-serp-preview';
import { Tour } from 'antd/lib';
import { ReactComponent as BackIcon } from '../../assets/icons/back-icon.svg';
import { ReactComponent as ProductIcon } from '../../assets/icons/add-product-icon.svg';
import { ReactComponent as ProductModalBackground } from '../../assets/ModalTourBackground/productTourBackground.svg';
import NoImage from '../../assets/images/no-image.png';
import { TenantContext } from '../context/tenant-context';
import { MilestoneContext } from '../context/milestone-context';
import {
  getCategory,
  getAllAttributes,
  createProduct,
  getProducts,
  updateProduct,
  putOnboardSubGuide,
} from '../../utils/api/url-helper';
import getAttributeIdByName from '../../shared/attributes-helper';
import './product.less';
import {
  SYNTAX_JSON_ERROR,
  CATEGORY_GET_FAILED,
  PHOTOROOMTUTORIALVIDEO,
  EMOJIS_RESTRICT,
} from '../../shared/constant-values';
import {
  seoImageCompressor,
  disableTabEnterKey,
  enableTabEnterKey,
} from '../../shared/function-helper';
import RichText from '../rich-text';
import AddCategory from './add-category';
import ImageUploadModal from './image-modal';
import Variant from './variant/variant';

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;
const uuidRegex =
  /^[\da-f]{8}-[\da-f]{4}-[0-5][\da-f]{3}-[089ab][\da-f]{3}-[\da-f]{12}$/i;

const validateMessages = {
  // eslint-disable-next-line no-template-curly-in-string
  required: '${label} is required!',
};

const getFormItemRules = (
  { required, whitespace, number, positiveNumber, minMax },
  x
) => {
  const rulesData = [];
  if (required) {
    rulesData.push({ required: true });
  }
  if (
    whitespace ||
    ['mixed', 'string'].includes(x?.data_type || x?.attribute?.data_type)
  ) {
    rulesData.push({
      validator(_, value) {
        if (
          value &&
          (!value.toString().slice(0, 1).trim() ||
            !value.toString().slice(-1).trim())
        ) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Whitespace around the value not allowed.');
        }
        return Promise.resolve();
      },
    });
  }
  if (number) {
    rulesData.push({ type: 'number', message: 'Please enter a valid number' });
  }
  if (positiveNumber) {
    rulesData.push({
      validator: (_, value) => {
        if (value && value < 0) {
          return Promise.reject(
            new Error('Value should not be a negative number')
          );
        }
        return Promise.resolve();
      },
    });
  }
  if (minMax) {
    rulesData.push({
      validator: (_, value) => {
        if (!value || value <= 50) {
          return Promise.resolve();
        }
        return Promise.reject(
          new Error('GST% value should be between 0 to 50.')
        );
      },
    });
  }

  return rulesData;
};
const replaceZerosWithNull = (object) => {
  forOwn(object, (value, key) => {
    if (value === '0' || value === 'NaN') {
      object[key] = undefined;
    }
  });
};

function ProductForm(properties) {
  const history = useNavigate();
  const location = useLocation();
  const [categoryData, setCategoryData] = useState([]);
  const canWrite = get(properties, 'roleData.can_write', false);
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [defaultAttributes, setDefaultAttributes] = useState([]);
  const [filteredAttributesData, setFilteredAttributesData] = useState([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileListState, setFileList] = useState([]);
  const [videoFileListState, setVideoFileList] = useState([]);
  const [fileUploadCount, setFileUploadCount] = useState(0);
  const [mobilefileListState, setMobileFileList] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [formData, setFormData] = useState();
  const [form] = Form.useForm();
  const { id } = useParams();
  const [action, setAction] = useState('add');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
  const [, , , tenantConfig] = useContext(TenantContext);
  const mobileView = useContext(TenantContext)[4];
  const [productData, setProductData] = useState({});
  const [storeId] = useState(localStorage.getItem('storeID'));
  const [openTourModal, setOpenTourModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [editorState, setEditorState] = useState('');
  const [tableData, setTableData] = useState([]);
  const [disabledSave, setDisabledSave] = useState(false);
  const [variantOptions, setVariantOptions] = useState([]);
  const [variantFormData, setVariantFormData] = useState({});
  const [categoryModal, setCategoryModal] = useState(false);
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [category, setCategory] = useState();
  const [subCategoryIdState, setSubCategoryIdState] = useState();
  const [categoryArray, setCategoryArray] = useState([]);
  const [categoryError, setCategoryError] = useState(false);
  const [metaArray, setMetaArray] = useState([]);
  const [uploadObject, setUploadObject] = useState([
    { id: 1, isDisable: true, url: '' },
    { id: 2, isDisable: false, url: '' },
    { id: 3, isDisable: false, url: '' },
    { id: 4, isDisable: false, url: '' },
    { id: 5, isDisable: false, url: '' },
    { id: 6, isDisable: false, url: '' },
    { id: 7, isDisable: false, url: '' },
  ]);
  const [duplicateCategoryData, setDuplicateCategoryData] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [uncheckIndex, setUncheckIndex] = useState([]);

  const formReference = useRef(null);
  const { onBoardData, fetchTourData } = useContext(MilestoneContext);
  const [completeModal, setCompleteModal] = useState(false);
  const [closeTourModal, setCloseTourModal] = useState(false);
  const [tutorialModal, setTutorialModal] = useState(false);
  const videoReference = useRef(null);

  const fetchCategory = () => {
    getCategory()
      .then((categoryValues) => {
        setCategoryList(get(categoryValues, 'data.rows'));
        setDuplicateCategoryData(get(categoryValues, 'data.rows'));
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'error', CATEGORY_GET_FAILED),
        });
      });
  };

  const handleClickCategorySave = () => {
    if (category || subCategoryIdState) {
      const duplicateArray = [...categoryArray];
      setCategoryModal(false);
      if (category && subCategoryIdState) {
        duplicateArray.push(category, subCategoryIdState);
      } else if (subCategoryIdState) {
        duplicateArray.push(subCategoryIdState);
      } else if (category) {
        duplicateArray.push(category);
      }
      setCategoryArray(duplicateArray);
      setCategoryError(false);
      if (openTourModal) {
        setCurrentStep(4);
      }
    } else {
      if (openTourModal) {
        setCurrentStep(3);
      }
      notification.error({ message: 'Select a Category' });
    }
  };

  const showCategoryModal = () => {
    setCategoryModal(true);
  };
  const handleCategoryOk = () => {
    setCategoryModal(false);
  };
  const handleCategoryCancel = () => {
    if (closeTourModal) {
      setOpenTourModal(true);
      setCloseTourModal(false);
    }
    if (openTourModal) {
      setCurrentStep(2);
    }
    setCategoryModal(false);
  };

  const showAddCategoryModal = () => {
    setAddCategoryModal(true);
    if (openTourModal) {
      setOpenTourModal(false);
      setCloseTourModal(true);
    }
  };

  const handleAddCategoryCancel = () => {
    setAddCategoryModal(false);
    fetchCategory();
    if (closeTourModal) {
      setOpenTourModal(true);
      setCloseTourModal(false);
    }
  };

  const handleSkip = () => {
    setOpenTourModal(false);
  };

  const nextStep = (values) => {
    if (values === 'openCategoryModal') {
      showCategoryModal();
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 1200);
    } else if (values === 'closeCategoryModal') {
      handleClickCategorySave();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  const previousStep = (values) => {
    switch (values) {
      case 'openCategoryModal': {
        setCategoryModal(true);
        break;
      }
      case 'closeCategoryModal': {
        setCategoryModal(false);
        break;
      }
      case 'prevModalOpen': {
        setCategoryModal(true);
        break;
      }
      default: {
        setCategoryModal(false);
      }
    }
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
    }, 1000);
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
            Adding a product image is simple! You can import from{' '}
            <b style={{ color: '#0B3D60' }}>
              Facebook, Instagram, Google Photos,
            </b>{' '}
            or select images from your local file folder. If you don&apos;t have
            one, no worries; use{' '}
            <b style={{ color: '#0B3D60' }}>Adobe Express</b> to design your
            own.
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <Button type="primary" onClick={nextStep}>
                Next
              </Button>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.upload-container');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            &quot;It&apos;s all in a name! Give your product an
            attention-grabbing and informative name that stands out!&quot;.{' '}
            <b style={{ color: '#0B3D60' }}>
              A great product name sets the stage for a successful sale.
            </b>
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={previousStep}>Previous</Button>
                <Button
                  style={{ marginLeft: '10px' }}
                  type="primary"
                  onClick={nextStep}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.product_name');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            &quot;Tell the world what makes your product special. This is your
            space to craft a compelling description. Highlight its features,
            benefits, and why it&apos;s a must-have.{' '}
            <b style={{ color: '#0B3D60' }}>
              Great descriptions lead to satisfied customers! &quot;
            </b>
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={previousStep}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={() => nextStep('openCategoryModal')}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.product-text-field');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Organize your products with ease. Categories help customers find
            what they need. Whether it&apos;s clothing, electronics, or
            something unique, categorizing products streamlines their shopping
            experience.
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={() => previousStep('closeCategoryModal')}>
                  Previous
                </Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={() => nextStep('closeCategoryModal')}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.product-modal-tour');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Determine your product&apos;s value. Enter the selling price for
            your item. Make it competitive and appealing to your customers.{' '}
            <b style={{ color: '#0B3D60' }}>Pricing is key to your success! </b>
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={() => previousStep('prevModalOpen')}>
                  Previous
                </Button>
                <Button
                  style={{ marginLeft: '10px' }}
                  type="primary"
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
        const elements = document.querySelectorAll('.selling-price-products');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
  ];

  useEffect(() => {
    if (openTourModal) {
      disableTabEnterKey();
    } else {
      enableTabEnterKey();
    }
  }, [openTourModal]);
  const fetchData = async () => {
    if (get(location, 'state')) {
      setEditorState(location?.state?.meta?.caption);
      setFileList(location?.state?.meta?.addImage);
      setVideoFileList(location?.state?.meta?.addVideo);
    }
    if (get(location, 'state.selectedFiles')) {
      const imageArray = [];
      await Promise.all(
        map(get(location, 'state.selectedFiles', []), async (item) => {
          imageArray.push({
            url: item.image_url || item.baseUrl,
            status: 'done',
            name: item.name,
            localMedia: item.localMedia,
            mimeType: item.mimeType,
          });
        })
      );
      setFileList(imageArray);
    }
    if (get(location, 'state.value')) {
      setFileList([
        {
          url:
            location?.state?.value?.image_url ||
            location?.state?.value?.baseUrl,
          name: location?.state?.value?.filename,
          localMedia: true,
          mimeType: location?.state?.value?.mimeType,
        },
      ]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategory();
  }, []);

  useEffect(() => {
    if (get(location, 'state.item')) {
      form.setFieldsValue({
        product_name:
          location?.state?.item?.message || location?.state?.item?.caption,
      });
      setFileList([
        {
          url:
            location?.state?.item?.media_url ||
            location?.state?.item?.full_picture,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (openTourModal) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [openTourModal]);

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const constructVariantsData = (data) => {
    const variantData = map(data, (attribute) => {
      const variantObject = Object?.fromEntries(
        attribute?.variant_attributes?.map((item) => [
          item.attribute_id,
          item?.zm_attribute?.data_type === 'date' && item?.attribute_value
            ? moment(item.attribute_value)
            : item.attribute_value,
        ])
      );
      variantObject.in_stock = attribute.in_stock;
      variantObject.id = attribute.id;
      return variantObject;
    });
    return variantData;
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const constructImageData = (data) => {
    const webImage = [];
    const mobImage = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const [index, image] of data.entries()) {
      if (image.image_source === 'Web') {
        webImage.push({
          ...image,
          status: 'done',
          url: get(image, 'product_image', ''),
          name: get(image, 'name', ''),
          id: { id: index + 1 },
          type:
            get(image, 'name', '').includes('video-') ||
            get(image, 'name', '').includes('.mp4')
              ? 'video/mp4'
              : 'image',
          uploadId: get(image, 'name', ''),
        });
      } else {
        mobImage.push({
          ...image,
          status: 'done',
          url: get(image, 'product_image', ''),
          name: get(image, 'name', ''),
          id: { id: index + 1 },
          type:
            get(image, 'name', '').includes('video-') ||
            get(image, 'name', '').includes('.mp4')
              ? 'video/mp4'
              : 'image',
          uploadId: get(image, 'name', ''),
        });
      }
    }
    return { webImage, mobImage };
  };

  const handleSelectChange = (catId) => {
    setCategoryArray([]);
    setSubCategoryIdState();
    setCategory(catId);
    form.setFieldsValue({ sub_category_uid: undefined });
    const subCategory = categoryList.filter(
      (item) => item.category_uid === catId.category_uid
    );
    setSubCategoryData(get(subCategory, '[0].sub_category', []));
    const categoryAttribute = filter(
      get(subCategory, '[0].category_attribute', []),
      (record) => record.sub_category_uid === null
    );
    setFilteredAttributesData([...defaultAttributes, ...categoryAttribute]);
  };

  const handleSubcategoryChange = (value) => {
    setCategoryArray([]);
    setSubCategoryIdState(value);
    const subCatData = subCategoryData.filter(
      (index) => index.sub_category_uid === value.sub_category_uid
    );
    if (subCatData.length > 0) {
      setFilteredAttributesData([
        ...defaultAttributes,
        ...subCatData[0].sub_category_attribute,
      ]);
      // form.setFieldsValue({ product_variants: [{}] });
    }
  };

  const goBackToPrevious = () => {
    history(-1);
  };
  useEffect(() => {
    if (!isEmpty(formData)) {
      formData.product_variants = constructVariantsData(
        formData.product_variants
      );
      const imageData = constructImageData(formData.product_image);
      const array2 = get(imageData, 'webImage', []);
      const uploadedLength = array2.length;
      map(uploadObject, (list, index) => {
        list.productImageInfo = { ...array2[index] };
        return list;
      });
      map(uploadObject, (list, index) => {
        if (!isEmpty(list.productImageInfo)) {
          list.isDisable = true;
        }
        if (uploadedLength === index) {
          list.isDisable = true;
        }
      });

      formData.product_image = get(imageData, 'webImage', []);
      formData.product_mobile_image = get(imageData, 'mobImage', []);
      setFileUploadCount(get(imageData, 'webImage', []).length);
      setFileList(formData.product_image);
      setMobileFileList(formData.product_mobile_image);
      form.setFieldsValue(formData);
    }
  }, [subCategoryId, formData]);
  const fetchProductData = () => {
    if (id) {
      if (uuidRegex.test(id)) {
        setAction('edit');
        const apiArray = [
          getCategory(),
          getProducts({
            product_uid: id,
            store_uid: storeId,
            apiType: 'ByProductId',
          }),
          getAllAttributes({ is_default: true }),
        ];
        setLoading(true);
        setInitialLoading(true);
        Promise.all(apiArray)
          .then(async (resp) => {
            const categorylist = get(resp, '[0].data.rows', []);
            const tourDataValues = onBoardData;
            const productDatas = get(tourDataValues, 'data.[4]');
            const productTourDatas = get(productDatas, 'subGuide.[1]');
            if (!mobileView) {
              setOpenTourModal(!productTourDatas);
            }

            const data = get(resp, '[2].data', []).filter((item) => {
              return item.name !== 'Unit Slug';
            });
            const cloneProductData = cloneDeep(
              get(resp, '[1].data.rows[0]', {})
            );
            const productsVairants = get(
              cloneProductData,
              'product_variants',
              []
            );
            const clonedColumn = [];
            const variantData = reduce(
              get(cloneProductData, 'variant_option', []),
              (result, item) => {
                result.name.push(item.option_name);
                result.options.push(
                  item.variant_option_values?.map((value) => value.option_value)
                );

                return result;
              },
              { name: [], options: [] }
            );
            setVariantFormData(variantData);
            setVariantOptions(variantData);
            // const constructVariantImageData = (imgData) => {
            //   const webImage = [];
            //   forEach(imgData, (image) => {
            //     webImage.push({
            //       ...image,
            //       status: 'done',
            //       url: image.product_variant_image,
            //       name: image.name || '',
            //     });
            //   });
            //   return { webImage };
            // };
            // eslint-disable-next-line no-restricted-syntax
            for (const variantItem of productsVairants) {
              let objectVariable = {};
              map(get(variantItem, 'variant_attributes', []), (item, index) => {
                objectVariable = {
                  ...objectVariable,
                  [item.attribute_id]: item.attribute_value.toString(),
                  id: item.product_variant_id,
                };
                if (
                  get(variantItem, 'variant_attributes', []).length ===
                  index + 1
                ) {
                  // variantImg =
                  //   !isEmpty(objectVariable[imageId]) &&
                  //   constructVariantImageData(
                  //     parseJSONSafely(objectVariable[imageId])
                  //   );
                  // objectVariable[imageId] = get(variantImg, 'webImage', []);
                  clonedColumn.push(objectVariable);
                }
              });
            }
            await forEach(clonedColumn, replaceZerosWithNull);
            setTableData(clonedColumn);
            setEditorState(get(cloneProductData, 'text_content', ''));
            setDefaultAttributes(data);
            setFilteredAttributesData(data);
            setCategoryData(get(resp, '[0].data.rows', []));
            setCategoryId(get(resp, '[1].data.rows[0].category_uid', ''));
            setSubCategoryId(
              get(resp, '[1].data.rows[0].sub_category_uid', '')
            );

            const duplicateArray = [...categoryArray];
            map(categorylist, (cate) => {
              if (
                cate.category_uid ===
                get(resp, '[1].data.rows[0].category_uid', '')
              ) {
                duplicateArray.push(cate);
                map(cate.sub_category, (subcate) => {
                  if (
                    subcate.sub_category_uid ===
                    get(resp, '[1].data.rows[0].sub_category_uid', '')
                  ) {
                    duplicateArray.push(subcate);
                  }
                });
              }
            });
            setCategoryArray(duplicateArray);

            setProductData(cloneProductData);
            setFormData(get(resp, '[1].data.rows[0]', {}));
            setSeoTitle(get(cloneProductData, 'seo_title') || 'Page Title');
            setSeoDescription(
              get(cloneProductData, 'seo_description') || 'Meta Description'
            );
            setCustomUrl(
              get(cloneProductData, 'seo_custom_path') ||
                get(cloneProductData, 'product_uid') ||
                'Url'
            );
            setInitialLoading(false);
            setLoading(false);
          })
          .catch((error_) => {
            setInitialLoading(false);
            setLoading(false);
            notification.error({ message: error_.message });
          });
      } else {
        history('/');
      }
    } else {
      setAction('add');
      const apiArray = [getCategory(), getAllAttributes({ is_default: true })];
      setLoading(true);
      setInitialLoading(true);
      Promise.all(apiArray)
        .then((resp) => {
          const tourDataValues = onBoardData;
          const productDataValues = get(tourDataValues, 'data.[2]');
          const paymentTourDatas = get(
            productDataValues,
            'subGuide.[1].completed'
          );
          if (!mobileView) {
            setOpenTourModal(!paymentTourDatas);
          }
          const data = get(resp, '[1].data', []).filter((item) => {
            return item.name !== 'Unit Slug';
          });
          setCategoryData(get(resp, '[0].data.rows', []));
          setDuplicateCategoryData(get(resp, '[0].data.rows', []));
          setDefaultAttributes(data);
          setFilteredAttributesData(data);
          setInitialLoading(false);
          setLoading(false);
        })
        .catch((error_) => {
          setInitialLoading(false);
          setLoading(false);
          notification.error({ message: error_.message });
        });
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id, properties.history, form]);
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const checkData = (changedData) => {
    setVariantOptions(changedData);
  };
  const onFinish = async (valuesList) => {
    if (openTourModal) {
      putOnboardSubGuide({
        completed: true,
        slug: 'product',
      });
      fetchTourData();
    }
    const fields = valuesList;

    if (categoryArray.length > 0) {
      fields.category_uid = categoryArray[0]?.category_uid;
      fields.sub_category_uid = categoryArray[1]?.sub_category_uid;
    }

    map(fileListState, (fb) => {
      delete fb?.isCheck;
      delete fb?.uploadId;
      delete fb?.indexId;
      delete fb?.id;
    });

    const filterData = filter(
      fileListState,
      (item) => item.localMedia === true
    );
    const imageSource = map(filterData, (item) => item);
    const values = {
      ...fields,
      seo_title: fields?.seo_title?.trim(),
      seo_description: fields?.seo_description?.trim(),
      seo_custom_path: fields?.seo_custom_path?.trim(),
      product_name: fields?.product_name?.trim(),
      product_brand: fields?.product_brand?.trim(),
      product_code: fields?.product_code?.trim(),
      description: fields?.description?.trim(),
      key_features: fields?.key_features?.trim(),
      manufacturer_details: fields?.manufacturer_details?.trim(),
      marketed_by: fields?.marketed_by?.trim(),
      text_content: editorState,
      image_source: JSON.stringify([...imageSource]),
    };
    setLoading(true);
    setOpenTourModal(false);

    const imgId = getAttributeIdByName(
      defaultAttributes,
      ['name', 'Image'],
      '[0].attribute_id'
    ).toString();
    const variantNameId = getAttributeIdByName(
      defaultAttributes,
      ['name', 'Units'],
      '[0].attribute_id'
    ).toString();

    const variants = map(tableData, (item, index) => {
      const { ...variantAttributes } = item;
      const formattedAttributes = map(
        variantAttributes,
        (value, attributeId) => {
          return {
            attribute_id: attributeId,
            attribute_value: value,
          };
        }
      );

      return {
        variant_attributes: formattedAttributes.filter(
          (items) => items.attribute_id !== 'id'
        ),
        order_key: index + 1,
        in_stock: item.in_stock,
        id: item.id,
      };
    });

    const variantImage = [];
    // eslint-disable-next-line no-unused-vars
    variants.map((variantObject) => {
      variantObject.variant_attributes.map((attribute) => {
        if (attribute.attribute_id === imgId && action === 'edit') {
          attribute.attribute_value = JSON.stringify(attribute.attribute_value);
        }
        return attribute;
      });
      return variantObject;
    });
    try {
      values.product_variants = JSON.stringify(variants);
      values.product_option = isEmpty(variants)
        ? '[]'
        : JSON.stringify(variantOptions);
    } catch {
      notification.error({
        message: SYNTAX_JSON_ERROR,
      });
    }

    const imageFile = fileListState
      ? fileListState.map((item) => item?.originFileObj)
      : [];
    const mergeImageVideo = compact(imageFile);

    const fileImage = map(fileListState, (item) => item.originFileObj);
    const removeFalselyFile = compact(fileImage);
    const seoPreviewImage = await seoImageCompressor(removeFalselyFile[0]);
    const files = {
      files: mergeImageVideo,
      mobFiles: mobilefileListState.map((item) => item.originFileObj),
      variantImage,
      seo_image: seoPreviewImage,
    };
    if (imgId) {
      values.product_image_id = imgId;
    }
    if (variantNameId) {
      values.variant_name_id = variantNameId;
    }

    const { previousPath } = location;
    if (action === 'edit' && id) {
      try {
        const videoImage = compact(concat(fileListState, videoFileListState));
        values.product_image = JSON.stringify(
          videoImage.filter((item) => !item.originFileObj)
        );
        values.product_mobile_image = JSON.stringify(
          mobilefileListState.filter((item) => !item.originFileObj)
        );
      } catch {
        notification.error({
          message: SYNTAX_JSON_ERROR,
        });
      }
      updateProduct(values, files, id)
        .then((response) => {
          const { data } = response;
          setLoading(false);
          if (data.success) {
            notification.success({ message: 'Product updated Successfully' });
            history(previousPath || '/products');
          } else {
            notification.error({
              message: data.message || 'Product update Failed!',
            });
          }
        })
        .catch((error_) => {
          setLoading(false);
          notification.error({
            message: error_.message || 'Failed to create the product.',
          });
        });
    } else if (action === 'add') {
      delete values.product_image;
      delete values.product_mobile_image;
      createProduct(values, files)
        .then((response) => {
          const { data } = response;
          setLoading(false);
          if (get(response, 'data.success')) {
            if (get(properties, 'location.aboutProps', '')) {
              const { page, storeID } = get(
                properties,
                'location.aboutProps',
                ''
              );
              return history(`/inventory/${storeID}/${page}`);
            }
            if (openTourModal) {
              setOpenTourModal(false);
              setCompleteModal(true);
              putOnboardSubGuide({
                completed: true,
                slug: 'product',
              });
              setTimeout(() => {
                setCompleteModal(false);
                history(previousPath || '/dashboard');
                return notification.success({
                  message: 'Product Created Successfully',
                });
              }, 4000);
            } else {
              history(previousPath || '/products');
              putOnboardSubGuide({
                completed: true,
                slug: 'product',
              });
              return notification.success({
                message: 'Product Created Successfully',
              });
            }
          } else {
            return notification.error({
              message: data.message || 'Product Creation Failed!',
            });
          }
          return '';
        })
        .catch((error_) => {
          setLoading(false);
          notification.error({
            message: error_.message || 'Failed to create the product.',
          });
        });
    }
  };
  useEffect(() => {
    if (videoFileListState || fileListState) {
      if (videoFileListState?.length > 0) {
        const concatArray = concat(videoFileListState, fileListState);
        setFileUploadCount(concatArray?.length);
      } else {
        setFileUploadCount(fileListState?.length);
      }
    }
  }, [videoFileListState, fileListState]);

  const handleFinsh = async (fields) => {
    if (includes(editorState, '<img')) {
      notification.error({ message: 'Image not allowed in description' });
      return;
    }
    if (categoryArray.length === 0) {
      setCategoryError(true);
      return;
    }

    const sellingPriceId = getAttributeIdByName(
      defaultAttributes,
      ['name', 'Selling Price'],
      '[0].attribute_id'
    ).toString();
    const discountPercentageId = getAttributeIdByName(
      defaultAttributes,
      ['name', 'Discount in %'],
      '[0].attribute_id'
    ).toString();
    const filteredData = filter(
      tableData,
      (object) =>
        object[discountPercentageId] === 0 ||
        isNaN(object[discountPercentageId]) ||
        isNil(object[discountPercentageId])
    );
    const filteredDat = tableData.filter(
      (object) =>
        // eslint-disable-next-line no-prototype-builtins
        !object.hasOwnProperty(sellingPriceId)
    );
    const dataFilter = filter(
      filteredData,
      (object) =>
        object[sellingPriceId] === 0 ||
        isNaN(object[sellingPriceId]) ||
        isNil(object[sellingPriceId])
    );
    if (dataFilter.length > 0 || filteredDat.length > 0) {
      notification.error({ message: 'Selling Price is required for variant' });
    } else {
      onFinish(fields).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
    }
  };

  useEffect(() => {
    const mrpId = getAttributeIdByName(
      defaultAttributes,
      ['name', 'MRP Price'],
      '[0].attribute_id'
    );

    const sellingPriceId = getAttributeIdByName(
      defaultAttributes,
      ['name', 'Selling Price'],
      '[0].attribute_id'
    );

    const discountPercentageId = getAttributeIdByName(
      defaultAttributes,
      ['name', 'Discount in %'],
      '[0].attribute_id'
    );

    const discountAmountId = getAttributeIdByName(
      defaultAttributes,
      ['name', `Discount Amount`],
      '[0].attribute_id'
    );
    if (tableData.length > 0) {
      if (
        !isNaN(Number(tableData[0][sellingPriceId])) ||
        isNil(tableData[0][sellingPriceId])
      ) {
        form.setFieldsValue({ price: tableData[0][sellingPriceId] });
      }
      if (!isNaN(Number(tableData[0][mrpId])) || isNil(tableData[0][mrpId])) {
        form.setFieldsValue({
          // eslint-disable-next-line unicorn/no-null
          mrp: tableData[0][mrpId] === '0' ? null : tableData[0][mrpId],
        });
      }
      if (
        !isNaN(Number(tableData[0][discountPercentageId])) ||
        isNil(tableData[0][discountPercentageId])
      ) {
        form.setFieldsValue({
          discount:
            tableData[0][discountPercentageId] === '0'
              ? // eslint-disable-next-line unicorn/no-null
                null
              : tableData[0][discountPercentageId],
        });
      }
      if (
        !isNaN(Number(tableData[0][discountAmountId])) ||
        isNil(tableData[0][discountAmountId])
      ) {
        form.setFieldsValue({
          discount_amount:
            tableData[0][discountAmountId] === '0'
              ? // eslint-disable-next-line unicorn/no-null
                null
              : tableData[0][discountAmountId],
        });
      }
    }
    // else {
    //   form.resetFields(['price', 'mrp', 'discount', 'discount_amount']);
    // }
    // if (action !== 'edit' && productData.product_variants?.length > 0)
  }, [tableData]);

  const onValuesChange = (values) => {
    const sellingPrice = Number(form.getFieldValue(['price']));
    const mrpPrice = Number(form.getFieldValue(['mrp']));

    const valuesOfForm = form.getFieldsValue();
    if (values.discount) {
      if (values.discount === 100) {
        form.setFieldsValue({ price: 0 });
      } else if (valuesOfForm.mrp >= 0) {
        const sellingAmount = Number(
          mrpPrice - (mrpPrice * values.discount) / 100
        ).toFixed(2);
        form.setFieldsValue({
          price: sellingAmount,
        });
      } else {
        const mrpPrices = (sellingPrice / (1 - values.discount / 100)).toFixed(
          2
        );
        form.setFieldsValue({
          mrp: mrpPrices,
        });
      }
    }
    if (values.mrp || values.price) {
      if (values.mrp && sellingPrice) {
        const discountPercentage = Math.round(
          ((values.mrp - sellingPrice) / mrpPrice) * 100
        );
        form.setFieldsValue({
          discount: Number(discountPercentage).toFixed(2),
        });
      }
      if (values.price && mrpPrice > 0) {
        const discountPercentage = Math.round(
          ((mrpPrice - values.price) / mrpPrice) * 100
        );
        form.setFieldsValue({
          discount: discountPercentage.toFixed(2),
        });
      }
    }
  };

  const debouncedOnValuesChange = debounce(onValuesChange, 300);

  const onValuesDebounce = (values) => {
    debouncedOnValuesChange(values);
  };

  const handleCustomUrl = (a) => {
    setCustomUrl(a.target.value.replaceAll(/\s+/g, '-'));
    form.setFieldsValue({
      seo_custom_path: a.target.value.replaceAll(/\s+/g, '-'),
    });
  };

  const onChangeValue = (value) => {
    setEditorState(value);
  };

  const handleChangeCategorySearch = (event) => {
    const searchArray = [...duplicateCategoryData];
    const searchedData = searchArray.filter((item) =>
      item.category_name.toLowerCase().includes(event.toLowerCase())
    );
    setCategoryList(searchedData);
  };

  function buildTree(data) {
    return data.map((categorylist) => {
      const categoryNode = {
        key: get(categorylist, 'category_uid', ''),
        title: (
          <Row className="mt-10">
            <Col span={22}>
              <Row>
                <Space>
                  <Col>
                    {isNil(get(categorylist, 'image', '')) ||
                    isEmpty(get(categorylist, 'image', '')) ? (
                      <img src={NoImage} alt="NoImg" className="cate-image" />
                    ) : (
                      <img
                        src={get(categorylist, 'image', '')}
                        alt="NoImg"
                        className="cate-image"
                      />
                    )}
                  </Col>
                  <Col>
                    <p> {get(categorylist, 'category_name', '')}</p>
                    <span>
                      {get(categorylist, 'product_category_count', '')}
                      &nbsp;products
                    </span>
                  </Col>
                </Space>
              </Row>
            </Col>

            <Col span={2}>
              <Checkbox
                className="category-checkbox"
                onChange={() => handleSelectChange(categorylist)}
                value={get(categorylist, 'category_uid', '')}
                key={get(categorylist, 'category_uid', '')}
                checked={
                  get(categorylist, 'category_uid', '') ===
                  get(category, 'category_uid', '')
                }
              />
              <br />
            </Col>
          </Row>
        ),
        children: [],
      };

      if (
        get(categorylist, 'sub_category', '') &&
        get(categorylist, 'sub_category').length > 0
      ) {
        categoryNode.children = get(categorylist, 'sub_category').map(
          (subCategory) => {
            return {
              key: get(subCategory, 'sub_category_uid', ''),
              title: (
                <Row>
                  <Col span={20}>
                    {get(subCategory, 'sub_category_name', '')}
                  </Col>
                  <Col>
                    <Checkbox
                      className="subcate-checkbox"
                      onChange={() => handleSubcategoryChange(subCategory)}
                      value={get(subCategory, 'sub_category_uid', '')}
                      key={get(subCategory, 'sub_category_uid', '')}
                      checked={
                        get(subCategory, 'sub_category_uid', '') ===
                          get(subCategoryIdState, 'sub_category_uid', '') &&
                        get(subCategory, 'category_uid', '') ===
                          get(category, 'category_uid', '')
                      }
                    />
                  </Col>
                </Row>
              ),
            };
          }
        );
      }

      return categoryNode;
    });
  }

  const treeData = buildTree(categoryList);

  const handleCloseTag = (type) => {
    if (type === 'category') {
      setCategoryArray([]);
      setCategory();
      setSubCategoryIdState();
    }
    if (type === 'subcategory') {
      const duplicateArray = [...categoryArray];
      duplicateArray.pop();
      setCategoryArray(duplicateArray);
      setSubCategoryIdState();
    }
  };
  const handleClosePhotoroomModal = () => {
    setTutorialModal(false);
  };

  return (
    <Spin style={{ maxHeight: '100%' }} spinning={loading}>
      <div className="search-container">
        <div />
      </div>
      <div className="box">
        <div className="box__content box-content-background">
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <BackIcon onClick={goBackToPrevious} cursor="pointer" />
                <ProductIcon />
                <span className="text-green-dark add-product-title">
                  {capitalize(action)} Product
                </span>
              </Space>
            </Col>
            <Col>
              <Space className="f_btns add-product-fsave">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-btn"
                  onClick={() => form.submit()}
                  disabled={disabledSave}
                  hidden={!canWrite}
                >
                  save
                </Button>
              </Space>
            </Col>
          </Row>
          <Form
            ref={formReference}
            form={form}
            name="product_form"
            validateMessages={validateMessages}
            layout="vertical"
            onFinish={handleFinsh}
            onFinishFailed={() => setOpenTourModal(false)}
            autoComplete="off"
            onValuesChange={onValuesDebounce}
            scrollToFirstError
            className="mt-10"
          >
            <div className="add-product-main-div">
              <Row>
                {/* <Col span={24}>
                  <Button
                    style={{ marginLeft: '10px' }}
                    type="primary"
                    icon={<DoubleRightOutlined />}
                    onClick={() => setTutorialModal(true)}
                  >
                    Try with AI
                  </Button>
                </Col> */}
                <Col
                  xs={24}
                  sm={24}
                  md={10}
                  lg={8}
                  xl={8}
                  className="upload-container"
                >
                  <ImageUploadModal
                    setFileList={setFileList}
                    fileListState={fileListState}
                    fileUploadCount={fileUploadCount}
                    setFileUploadCount={setFileUploadCount}
                    accept="video/*, image/*"
                    item={uploadObject}
                    setUploadObject={setUploadObject}
                    uploadObject={uploadObject}
                    metaArray={metaArray}
                    setMetaArray={setMetaArray}
                    mobileView={mobileView}
                    uncheckIndex={uncheckIndex}
                    setUncheckIndex={setUncheckIndex}
                    setOpenTourModal={setOpenTourModal}
                    setCurrentStep={setCurrentStep}
                    openTourModal={openTourModal}
                  />
                </Col>
                <Col xs={24} sm={24} md={14} lg={16} xl={16}>
                  <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                      <Form.Item
                        className="product_name"
                        label="Product Name"
                        name="product_name"
                        rules={[
                          ...getFormItemRules({ required: true }),
                          () => ({
                            validator: (_, value) => {
                              const isEmoji = /\p{Extended_Pictographic}/u.test(
                                value
                              );
                              if (isEmoji) {
                                return Promise.reject(
                                  new Error(EMOJIS_RESTRICT)
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <Input placeholder="Enter product name" />
                      </Form.Item>
                    </Col>
                    <Col
                      xs={24}
                      sm={24}
                      md={12}
                      lg={12}
                      xl={12}
                      className={!mobileView && 'm-15'}
                    >
                      <Form.Item
                        label="GST in %"
                        name="gst"
                        rules={getFormItemRules({
                          number: true,
                          positiveNumber: true,
                          minMax: true,
                        })}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          precision={2}
                          step={0.1}
                          placeholder="Enter Price %"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <span className="dark-color">Product Description</span>
                  <div className="mt-10 product-text-field">
                    <RichText
                      loading={initialLoading}
                      editorState={editorState}
                      setEditorState={setEditorState}
                      onChangeValue={onChangeValue}
                    />
                  </div>
                  <Row className="mt-10">
                    <Col
                      xs={24}
                      sm={24}
                      md={8}
                      lg={8}
                      xl={8}
                      className="category-product"
                    >
                      <div
                        style={{
                          color: '#909090',
                          fontFamily: 'Nunito, sans-serif',
                        }}
                      >
                        <span style={{ color: 'red', marginRight: '2px' }}>
                          *
                        </span>
                        Category
                      </div>
                      <Row
                        onClick={showCategoryModal}
                        className={
                          categoryError
                            ? 'product-category-row-error'
                            : 'product-category-row'
                        }
                      >
                        {categoryArray.length > 0 ? (
                          <div className="product-tag-div">
                            <Form.Item name="category_uid">
                              {categoryArray[0] && (
                                <Tag
                                  closeIcon
                                  onClose={() => handleCloseTag('category')}
                                  className="tag-styles"
                                >
                                  {categoryArray[0]?.category_name}
                                </Tag>
                              )}
                            </Form.Item>
                            <Form.Item name="sub_category_uid">
                              {categoryArray[1] && (
                                <Tag
                                  closeIcon
                                  onClose={() => handleCloseTag('subcategory')}
                                  className="tag-styles"
                                >
                                  {categoryArray[1]?.sub_category_name}
                                </Tag>
                              )}
                            </Form.Item>
                          </div>
                        ) : (
                          <span className="category-placeholder">
                            Enter category
                          </span>
                        )}
                      </Row>
                      {categoryError && (
                        <span style={{ color: 'red' }}>
                          Category is required!
                        </span>
                      )}
                    </Col>
                    <div
                      style={
                        mobileView
                          ? { display: 'flex' }
                          : { display: 'contents' }
                      }
                      className="mt-10"
                    >
                      <Col
                        xs={11}
                        sm={11}
                        md={5}
                        lg={5}
                        xl={5}
                        className={!mobileView && 'm-15'}
                        style={mobileView && { marginRight: '22px' }}
                      >
                        <Form.Item
                          label="Price"
                          name="mrp"
                          rules={[
                            () => ({
                              validator: (_, value) => {
                                const selling = form.getFieldValue('price');
                                if (value && selling && value < selling) {
                                  // eslint-disable-next-line prefer-promise-reject-errors
                                  return Promise.reject(
                                    'MRP should not be lesser than Selling Price.'
                                  );
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        >
                          <InputNumber
                            disabled={tableData.length > 0}
                            style={{ width: '100%' }}
                            placeholder="Enter price"
                            min={0}
                          />
                        </Form.Item>
                      </Col>
                      <Col
                        xs={11}
                        sm={11}
                        md={5}
                        lg={5}
                        xl={5}
                        className={!mobileView && 'm-15'}
                      >
                        <Form.Item label="Discount %" name="discount">
                          <InputNumber
                            disabled={tableData.length > 0}
                            style={{ width: '100%' }}
                            placeholder="Enter discount %"
                            min={0}
                            max={100}
                          />
                        </Form.Item>
                      </Col>
                    </div>
                    <Col
                      xs={24}
                      sm={24}
                      md={6}
                      lg={6}
                      xl={6}
                      className={!mobileView && 'm-15'}
                    >
                      <Form.Item
                        className="selling-price-products"
                        label="Selling Price"
                        name="price"
                        rules={[
                          {
                            required: true,
                            message: 'Selling Price is required',
                          },
                          () => ({
                            validator: (_, value) => {
                              const mrpAmount = form.getFieldValue('mrp');
                              if (value && mrpAmount && value > mrpAmount) {
                                // eslint-disable-next-line prefer-promise-reject-errors
                                return Promise.reject(
                                  'Selling Price should not be greater than Selling Price.'
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <InputNumber
                          disabled={tableData.length > 0}
                          style={{ width: '100%' }}
                          placeholder="Enter selling price"
                          min={0}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Collapse className="mt-10" expandIconPosition="right">
                <Panel header="Add Variants (to products like size, color, etc.)">
                  <Variant
                    filteredAttributesData={filteredAttributesData}
                    setTableData={setTableData}
                    getFormItemRules={getFormItemRules}
                    tableData={tableData}
                    setDefaultAttributes={setDefaultAttributes}
                    defaultAttributes={defaultAttributes}
                    checkData={checkData}
                    variantOptions={variantOptions}
                    variantFormData={variantFormData}
                    setDisabledSave={setDisabledSave}
                    action={action}
                    setLoading={setLoading}
                  />
                </Panel>
              </Collapse>
              <Collapse className="mt-10" expandIconPosition="right">
                <Panel header="Additional Details">
                  <Row>
                    <Col xs={11} sm={11} md={8} lg={8} xl={8}>
                      <Form.Item label="Shelf Life" name="shelf_life">
                        <Input placeholder="Shelf Life" />
                      </Form.Item>
                    </Col>
                    <Col
                      xs={11}
                      sm={11}
                      md={8}
                      lg={8}
                      xl={8}
                      className={!mobileView && 'm-15'}
                      style={mobileView && { marginLeft: '20px' }}
                    >
                      <Form.Item
                        label="Country of Origin"
                        name="country_of_origin"
                      >
                        <Select
                          showSearch
                          virtual={false}
                          autoComplete="newpassword"
                          placeholder="Country of Origin"
                        >
                          {getData().map((country) => (
                            <Option key={country.code} value={country.name}>
                              {country.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col
                      xs={24}
                      sm={24}
                      md={8}
                      lg={8}
                      xl={8}
                      className={!mobileView && 'm-15'}
                    >
                      <Form.Item label="Seller" name="seller">
                        <Input placeholder="Seller" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={24} sm={24} md={8} lg={8}>
                      <Form.Item label="Marketed By" name="marketed_by">
                        <Input
                          style={{ width: '100%' }}
                          rows={4}
                          className="p-desc"
                          placeholder="Marketed By"
                        />
                      </Form.Item>
                    </Col>
                    <Col
                      xs={24}
                      sm={24}
                      md={8}
                      lg={8}
                      xl={8}
                      className={!mobileView && 'm-15'}
                    >
                      <Form.Item label="Product ID" name="product_code">
                        <Input placeholder="Enter product ID" />
                      </Form.Item>
                    </Col>
                    <Col
                      xs={24}
                      sm={24}
                      md={8}
                      lg={8}
                      className={!mobileView && 'm-15'}
                    >
                      <Form.Item
                        label="Enter Manufacturer Details"
                        name="manufacturer_details"
                      >
                        <Input
                          style={{ width: '100%' }}
                          rows={4}
                          className="p-desc"
                          placeholder="Manufacturer Details"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
              <Collapse className="mt-10" expandIconPosition="right">
                <Panel header="Add SEO">
                  <Row>
                    <SerpPreview
                      title={seoTitle}
                      metaDescription={seoDescription}
                      url={`${get(tenantConfig, 'customer_url', '')}/${
                        get(productData, 'product_name', '').replaceAll(
                          /\s+/g,
                          '-'
                        ) || 'Product-Name'
                      }/pd/${customUrl}`}
                      className="product-seo-styles"
                    />
                  </Row>
                  &nbsp;
                  <Form.Item label="Page Title" name="seo_title">
                    <Input
                      onChange={(a) => setSeoTitle(a.target.value)}
                      placeholder="Page Title"
                    />
                  </Form.Item>
                  <Form.Item label="Meta Description" name="seo_description">
                    <TextArea
                      style={{ width: '100%' }}
                      rows={4}
                      onChange={(a) => setSeoDescription(a.target.value)}
                      className="p-desc"
                      placeholder="Meta Description"
                    />
                  </Form.Item>
                  <Form.Item label="Url Handle" name="seo_custom_path">
                    <Input
                      addonBefore={`${get(tenantConfig, 'customer_url', '')}/${
                        get(productData, 'product_name', '').replaceAll(
                          /\s+/g,
                          '-'
                        ) || 'Product-Name'
                      }/pd/`}
                      onChange={handleCustomUrl}
                      placeholder="Url Handle"
                    />
                  </Form.Item>
                </Panel>
              </Collapse>
              <Form.Item className="mt-10 flex-end">
                <Space className="f_btns">
                  <Button
                    htmlType="submit"
                    type="primary"
                    disabled={disabledSave}
                    hidden={!canWrite}
                    className="ten add-product-save-btn"
                  >
                    save
                  </Button>
                </Space>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
      {/* Category List Modal */}
      <Modal
        open={categoryModal}
        onOk={handleCategoryOk}
        onCancel={handleCategoryCancel}
        footer={false}
        closable={false}
        className="category-modal-main"
        centered
      >
        {addCategoryModal ? (
          <AddCategory
            handleAddCategoryCancel={handleAddCategoryCancel}
            setAddCategoryModal={setAddCategoryModal}
            setCategoryList={setCategoryList}
            categoryList={categoryList}
            fetchCategory={fetchCategory}
            categoryData={categoryData}
            categoryId={categoryId}
            setOpenTourModal={setOpenTourModal}
            setCloseTourModal={setCloseTourModal}
            closeTourModal={closeTourModal}
          />
        ) : (
          <div className="product-modal-tour">
            <Row>
              <Col span={12}>
                <div className="flex-start">
                  <p className="ml-10 category-heading">Select Category</p>
                </div>
              </Col>
              <Col span={12}>
                <div className="flex-end">
                  <CloseOutlined
                    onClick={handleCategoryCancel}
                    style={{ color: 'red' }}
                  />
                </div>
              </Col>
            </Row>
            <div>
              <Input
                placeholder="Search"
                allowClear
                className="custom-search mt-10"
                suffix={<SearchOutlined className="site-form-item-icon" />}
                onChange={(event_) =>
                  handleChangeCategorySearch(event_.target.value)
                }
              />
            </div>
            <div className="category-list mt-10">
              <Tree defaultExpandAll showLine treeData={treeData} />
            </div>
            <div className="flex-end mt-10">
              <Button className="cancel-btn">Cancel</Button>
              <Button className="save-btn" onClick={handleClickCategorySave}>
                Save
              </Button>
            </div>
            <div className="flex-center mt-10">
              <Button onClick={showAddCategoryModal} className="add-cate-btn">
                <PlusOutlined /> Add New Category/SubCategory
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={completeModal}
        footer={false}
        maskClosable
        centered
        closeIcon={false}
        className="milestone-modal-store"
        zIndex={1005}
      >
        <span>
          <ProductModalBackground />
        </span>
        <span>Product added successfully</span>
      </Modal>
      <Tour
        open={openTourModal}
        onClose={() => setOpenTourModal(false)}
        steps={steps}
        current={currentStep}
        placement={mobileView ? `bottom` : `right`}
      />
      {/* photo room tutorial */}
      <Modal
        open={tutorialModal}
        onCancel={handleClosePhotoroomModal}
        footer={false}
        centered
      >
        <div>
          <video
            ref={videoReference}
            controls
            width="100%"
            height="100%"
            kind="captions"
            autoPlay
            muted
            loop
          >
            <track kind="captions" />
            <source
              kind="captions"
              src={PHOTOROOMTUTORIALVIDEO}
              type="video/mp4"
            />
          </video>
        </div>
      </Modal>
    </Spin>
  );
}

export default ProductForm;
