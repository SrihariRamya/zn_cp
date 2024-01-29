import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  Tag,
  Divider,
  Space,
  Row,
  Col,
  Typography,
  Card,
  Spin,
  Button,
  notification,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import _, { find, get, isEmpty } from 'lodash';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import Woffer from '../../assets/icons/woffer.svg';
import './product.less';
import { getProducts, deleteProduct } from '../../utils/api/url-helper';
import {
  DeleteAlert,
  DeleteAlertImage,
  DeleteAlertAssociated,
  DeleteAlertMessage,
} from '../../shared/sweetalert-helper';
import {
  PRODUCT_DELETE_SUCCESS,
  PRODUCT_DELETE_FAILED,
} from '../../shared/constant-values';
import imagePath from '../../shared/image-helper';
import { TenantContext } from '../context/tenant-context';
import { parseJSONSafely } from '../../shared/function-helper';
import { withRouter } from '../../utils/react-router/index';

const { Title } = Typography;

const errorMessage = {
  best_seller: 'best seller',
  banner: 'banner',
  sliderBoxProduct: 'sliderBoxProduct',
  sections: 'sections',
};

const getAttributeByName = (data, attribute) => {
  if (data && attribute) {
    return data.variant_attributes.filter(
      (item) => item?.zm_attribute?.name === attribute
    );
  }
  return '';
};

function ProductDetails(properties) {
  const canWrite = get(properties, 'roleData.can_write', false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [productData, setProductData] = useState({});
  const [selectedProduct, setSelectedProduct] = useState({});
  const [loading, setLoading] = useState(false);
  const [tenantDetails] = useContext(TenantContext);
  const { currency } = get(tenantDetails, 'setting', {});
  const [variableImg, setVariableImg] = useState([]);

  useEffect(() => {
    setLoading(true);
    getProducts({ product_uid: id, apiType: 'ByProductId' }).then((resp) => {
      setLoading(false);
      setProductData(_.get(resp, 'data.rows', {}));
      setSelectedProduct(_.get(resp, 'data.rows[0].product_variants[0]', {}));
    });
  }, [id]);

  const productHardDelete = async (productId, options) => {
    const { errMsg } = options;
    const title = `This Product is associated with ${errorMessage[errMsg]}`;
    const text = `Are you sure? The product will be deleted and ${errorMessage[errMsg]} will be unassociated?`;
    const result = await DeleteAlertAssociated(title, text);
    if (result.isConfirmed) {
      setLoading(true);
      const body = {
        id: [productId],
        forceDelete: true,
      };
      deleteProduct(body)
        .then(() => {
          setLoading(false);
          DeleteAlertImage(PRODUCT_DELETE_SUCCESS);
          navigate('/products');
        })
        .catch((error) => {
          notification.error({
            message: get(error, 'message', PRODUCT_DELETE_FAILED),
          });
        });
    } else {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    const text = 'Are you sure you want to delete this product from the list?';
    const result = await DeleteAlert(text);
    if (result.isConfirmed) {
      const parameters = {
        id: [id],
        forceDelete: false,
      };
      setLoading(true);
      deleteProduct(parameters)
        .then(() => {
          DeleteAlertImage(PRODUCT_DELETE_SUCCESS);
          setLoading(false);
          navigate('/products');
        })
        .catch((error_) => {
          let parsedResponse = {};
          try {
            parsedResponse = error_.json();
          } catch {
            parsedResponse = error_;
          }
          switch (parsedResponse.message) {
            case 'Product_BestSeller_Associated': {
              productHardDelete(id, {
                errMsg: 'best_seller',
              });

              break;
            }
            case 'Product_Banner_Associated': {
              productHardDelete(id, {
                errMsg: 'banner',
              });

              break;
            }
            case 'Product_SliderBoxProduct_Associated': {
              productHardDelete(id, {
                errMsg: 'sliderBoxProduct',
              });

              break;
            }
            case 'Product_Sections_Associated': {
              productHardDelete(id, {
                errMsg: 'sections',
              });

              break;
            }
            default: {
              setLoading(false);
              DeleteAlertMessage({
                title: PRODUCT_DELETE_FAILED,
                icon: 'error',
              });
            }
          }
        });
    }
  };

  const goBackToPreviousPage = () => {
    navigate(-1);
  };
  const handleVariant = (value) => {
    setSelectedProduct(value);
  };
  useEffect(() => {
    const x = get(
      find(
        get(selectedProduct, 'variant_attributes'),
        (item) => get(item, 'zm_attribute.name') === 'Image'
      ),
      'attribute_value'
    );
    if (x) {
      setVariableImg(parseJSONSafely(x));
    }
  }, [selectedProduct]);

  return (
    <Spin spinning={loading}>
      <div className="product-details-container-box">
        <div className="sync-header-bar-content">
          <Space direction="vertical">
            <Title level={5}>
              <Space align="center">
                <UnorderedListOutlined />
                Items
              </Space>
            </Title>
            <Breadcrumb separator=">">
              <Breadcrumb.Item className="breadcrumb-title">
                <Link to="/">Home</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-title">
                <Link to="/products">items</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-title">
                Product Details
              </Breadcrumb.Item>
            </Breadcrumb>
          </Space>
          <Space className="product-details-edit-option">
            <Link to={`/products/edit-product/${id}`}>
              <Button type="primary" icon={<EditOutlined />} hidden={!canWrite}>
                Edit Product
              </Button>
            </Link>
            <Button
              hidden={!canWrite}
              type="danger"
              danger
              className="add-btn delete-danger"
              icon={<DeleteOutlined />}
              onClick={handleDeleteProduct}
            >
              Delete
            </Button>
          </Space>
        </div>
        <Row>
          <Col span={24}>
            <Card className="card card-shadow">
              <Row className="row-padding">
                <Space>
                  <ArrowLeftOutlined onClick={goBackToPreviousPage} />
                  <h4 className="text-green-dark">
                    {_.get(productData, '[0].product_name', '')}
                  </h4>
                </Space>
                <Divider />
              </Row>
              <Row>
                <Col
                  className="col-padding"
                  xs={24}
                  sm={24}
                  md={7}
                  lg={7}
                  xl={7}
                >
                  <div>
                    <img
                      alt="img.jpg"
                      className="pr_img"
                      src={imagePath(
                        get(productData, '[0].product_image', []) || variableImg
                      )}
                      placeholder
                    />
                  </div>
                  <Title level={5} className="m-10 dark-light-color">
                    {_.get(productData, '[0].product_name', '')}
                  </Title>
                  <h6 className="catagory-title">
                    {_.get(
                      productData,
                      '[0].zm_sub_category.sub_category_name',
                      ''
                    )}
                  </h6>
                  <div className="m-10">
                    {get(
                      getAttributeByName(
                        get(productData, '[0].product_variants[0]', ''),
                        'Discount in %'
                      ),
                      '[0].attribute_value',
                      ''
                    ) === 0 ? (
                      <div>
                        <Tag color="grey">
                          <img
                            style={{ verticalAlign: 'middle' }}
                            src={Woffer}
                            alt="."
                          />{' '}
                          No offers
                        </Tag>
                      </div>
                    ) : (
                      <div>
                        <Tag color="#f50">
                          <img
                            style={{ verticalAlign: 'middle' }}
                            src={Woffer}
                            alt="."
                          />{' '}
                          {!isEmpty(selectedProduct) &&
                            get(
                              getAttributeByName(
                                selectedProduct,
                                'Discount in %'
                              ),
                              '[0].attribute_value',
                              ''
                            )}
                          %
                        </Tag>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex' }} className="m-10">
                    {_.get(productData, '[0].product_variants', []).map(
                      (value) => (
                        <Tag
                          key={value.id}
                          style={
                            value.id === selectedProduct.id && {
                              backgroundColor: '#e4f4e6',
                            }
                          }
                          onClick={() => handleVariant(value)}
                          className="text-green-dark"
                        >
                          {`${get(
                            getAttributeByName(value, 'Units'),
                            '[0].attribute_value',
                            ''
                          )}`}
                        </Tag>
                      )
                    )}
                  </div>
                  <div className="m-10">
                    <h4 className="detail-height">
                      {_.get(productData, '[0].description', '')}
                    </h4>
                  </div>
                  <Row className="row-header price-tag-product-box">
                    <Col span={12}>
                      <h5 className="ml-10 light-color">MRP</h5>
                      <h4 className="ml-10 light-color">
                        <CurrencyFormatter
                          value={
                            !isEmpty(selectedProduct) &&
                            get(
                              getAttributeByName(selectedProduct, 'MRP Price'),
                              '[0].attribute_value',
                              0
                            )
                          }
                          type={currency || 'INR'}
                        />
                      </h4>
                    </Col>
                    <Col span={12}>
                      <h5 className="l-sel light-color">Selling price</h5>
                      <Title level={3} className="text-green-dark">
                        <CurrencyFormatter
                          value={
                            !isEmpty(selectedProduct) &&
                            get(
                              getAttributeByName(
                                selectedProduct,
                                'Selling Price'
                              ),
                              '[0].attribute_value',
                              0
                            )
                          }
                          type={currency || 'INR'}
                        />
                      </Title>
                    </Col>
                  </Row>
                </Col>
                <Col
                  className="col2-padding mt-10"
                  xs={24}
                  sm={24}
                  md={17}
                  lg={17}
                  xl={17}
                >
                  <Title level={5} className="ml-10 dark-black-color">
                    Product Details
                  </Title>
                  <h5 className="ml-10 dark-color">Key Features</h5>
                  <div className="mt-30">
                    <p className="p-keyf">
                      {_.get(productData, '[0].key_features', '')}
                    </p>
                  </div>
                  <Divider />
                  <div className="ml-10">
                    <h5 className="mt-30 dark-color">Shelf life</h5>
                    <p className="mt-10 detail-text">
                      {_.get(productData, '[0].shelf_life', '')}
                    </p>
                  </div>
                  <Divider />
                  <div className="ml-10">
                    <h5 className="m-t_15 dark-color">Manufacturer Details</h5>
                    <p className="mt-10 detail-text">
                      {_.get(productData, '[0].manufacturer_details', '')}
                    </p>
                  </div>
                  <Divider />
                  <div className="ml-10">
                    <h5 className="m-t_15 dark-color">Marketed By</h5>
                    <p className="mt-10 detail-text">
                      {_.get(productData, '[0].marketed_by', '')}
                    </p>
                  </div>
                  <Divider />
                  <div className="ml-10">
                    <h5 className="m-t_15 dark-color">Country of Origin</h5>
                    <p className="mt-10 detail-text">
                      {_.get(productData, '[0].country_of_origin', '')}
                    </p>
                  </div>
                  <Divider />
                  <div className="ml-10">
                    <h5 className="m-t_15 dark-color">Seller</h5>
                    <p className="mt-10 detail-text">
                      {_.get(productData, '[0].seller', '')}
                    </p>
                  </div>
                  <Divider />
                  <div className="ml-10">
                    <h5 className="m-t_15 dark-color">Description</h5>
                    <p className="mt-10 detail-text">
                      {_.get(productData, '[0].description', '')}
                    </p>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}

export default withRouter(ProductDetails);
