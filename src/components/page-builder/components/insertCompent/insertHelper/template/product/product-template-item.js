import React, { useContext } from 'react';
import { Card, Tooltip, Checkbox, Row, Select, Col, Button, Space } from 'antd';
import { WhatsAppOutlined, CalendarOutlined } from '@ant-design/icons';
import { get, findIndex, filter, find } from 'lodash';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import imagePath from '../../../../../../../shared/image-helper';
import AddCartActionButton from './add-cart-action-button';
import {
  APPEARANCE_TEMPLATE_NAME_1,
  APPEARANCE_TEMPLATE_NAME_2,
  CURRENCY_TYPE,
  TENANT_MODE_CLIC,
} from '../../../../../../../shared/constant-values';
import { TenantContext } from '../../../../../../context/tenant-context';
import VideoORImage from '../../../../../../../shared/video-or-image-helper';

const { Option } = Select;

const getAttributeByName = (value, attribute, checkid) => {
  if (
    value && attribute && attribute === 'Units' ? value.id === checkid : true
  ) {
    return filter(
      value?.variant_attributes,
      (item) => item?.zm_attribute?.name === attribute
    );
  }
  return '';
};

const getVariantDetail = (attributeList, attributeName) => {
  const item = find(attributeList, (attribute) => {
    return attribute?.zm_attribute?.name === attributeName;
  });
  return item?.attribute_value;
};

function ProductTemplateItem(properties) {
  const {
    data,
    textStyle,
    buttonStyle,
    buttonHoverStyle,
    productNameStyle,
    productDescriptionStyle,
    productButtonStyle,
    productTemplateStyle = {},
    template,
    spanCount,
    selectedTemplate,
    handleTemplate,
    isTemplate,
    maxWidth,
    webLayout,
    columnLength,
    preview,
    colStyle,
    videoStyleClass,
  } = properties;
  const [tenantDetails] = useContext(TenantContext);
  const currency =
    get(tenantDetails, 'setting.currency', false) || CURRENCY_TYPE;
  const isClicMode = get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC;

  const handleCheckBoxChange = (event) => {
    handleTemplate(event.target.value);
  };

  return (
    <Col
      key={get(data, 'product_uid', '')}
      span={webLayout ? spanCount : 12}
      style={webLayout && { minWidth: '220px', maxWidth: `${maxWidth}` }}
      className={!webLayout && colStyle}
    >
      <Card
        hoverable
        className="product-list-item"
        style={isClicMode ? { ...productTemplateStyle } : {}}
      >
        {!isClicMode && (
          <div className={`product-img-container${webLayout ? '' : '-mobile'}`}>
            <VideoORImage
              imageOrVideoSrc={imagePath(get(data, 'product_image', []))}
              preload="auto"
              draggable={false}
              videoClassName={videoStyleClass}
              imageAltName={get(data, 'product_name', '')}
              imageClassName="product-img"
            />
          </div>
        )}
        {isTemplate && (
          <div className="product-checkbox-contaniner">
            <Checkbox
              className="checkbox"
              value={template}
              checked={
                get(selectedTemplate, 'id', 'id') === get(template, 'id', '')
              }
              onChange={handleCheckBoxChange}
            />
          </div>
        )}
        {!isClicMode && (
          <div className="product-details-contaniner">
            <div
              className={`offer-name ${preview && !webLayout && 'preview'}`}
              style={textStyle}
            >
              <span>
                <Tooltip
                  placement="topLeft"
                  title={
                    get(data, 'product_name', '') > 24 &&
                    get(data, 'product_name', '')
                  }
                >
                  {get(data, 'product_name', 'Product Name')}
                </Tooltip>
              </span>
            </div>
            {!webLayout && (
              <div>
                <Row>
                  <div
                    className={`discount-amount ${
                      preview && !webLayout && 'preview'
                    }`}
                    style={{
                      color: get(buttonStyle, 'backgroundColor', ''),
                    }}
                  >
                    <span>
                      <CurrencyFormatter
                        value={get(
                          getAttributeByName(
                            get(
                              get(data, 'product_variants', ''),
                              `[${findIndex(
                                get(data, 'product_variants', '')
                              )}]`,
                              ''
                            ),
                            'Selling Price'
                          ),
                          '[0].attribute_value',
                          '000'
                        )}
                        type={currency}
                      />
                    </span>
                  </div>
                </Row>
                <Row>
                  <div
                    className={`discount-cut ${
                      preview && !webLayout && 'preview'
                    }`}
                  >
                    <span>
                      <CurrencyFormatter
                        value={get(
                          getAttributeByName(
                            get(
                              get(data, 'product_variants', ''),
                              `[${findIndex(
                                get(data, 'product_variants', '')
                              )}]`,
                              ''
                            ),
                            'MRP Price'
                          ),
                          '[0].attribute_value',
                          '000'
                        )}
                        type={currency}
                      />
                    </span>
                  </div>
                </Row>
                <div className="product-select-contaniner">
                  <Select
                    value={get(data, 'product_variants[0].id', '') || undefined}
                    virtual={false}
                    placeholder="Select Product Variant"
                    className="product-quantity"
                    disabled
                  >
                    {get(data, 'product_variants', []).map((variant) => (
                      <Option key={variant.id} value={variant.id}>
                        {getVariantDetail(variant.variant_attributes, 'Units')}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="product-button-contaniner">
                  <div>
                    <Button
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        ...buttonStyle,
                      }}
                    >
                      {columnLength > 1 ? 'Add' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {get(template, 'template_name', '') ===
              APPEARANCE_TEMPLATE_NAME_1 &&
              webLayout && (
                <div>
                  <div className="offer-gm">
                    <span className="text-grey-light">
                      {get(
                        getAttributeByName(
                          get(
                            get(data, 'product_variants', ''),
                            `[${findIndex(get(data, 'product_variants', ''))}]`,
                            ''
                          ),
                          'Units',
                          get(data, 'product_variants[0].id', '')
                        ),
                        '[0].attribute_value',
                        'Variant 1'
                      )}
                    </span>
                  </div>
                  <Row>
                    <Col span={11}>
                      <Row>
                        <span
                          className={
                            webLayout
                              ? 'discount-amount'
                              : 'mobile-discount-amount'
                          }
                          style={{
                            color: get(buttonStyle, 'backgroundColor', ''),
                          }}
                        >
                          <CurrencyFormatter
                            value={get(
                              getAttributeByName(
                                get(
                                  get(data, 'product_variants', ''),
                                  `[${findIndex(
                                    get(data, 'product_variants', '')
                                  )}]`,
                                  ''
                                ),
                                'Selling Price'
                              ),
                              '[0].attribute_value',
                              '000'
                            )}
                            type={currency}
                          />
                        </span>
                      </Row>
                      <Row>
                        <span className="discount-cut">
                          <CurrencyFormatter
                            value={get(
                              getAttributeByName(
                                get(
                                  get(data, 'product_variants', ''),
                                  `[${findIndex(
                                    get(data, 'product_variants', '')
                                  )}]`,
                                  ''
                                ),
                                'MRP Price'
                              ),
                              '[0].attribute_value',
                              '00'
                            )}
                            type={currency}
                          />
                        </span>
                      </Row>
                    </Col>
                    <Col span={13}>
                      <div className="product-button-contaniner">
                        <AddCartActionButton
                          template={template}
                          buttonStyle={buttonStyle}
                          buttonHoverStyle={buttonHoverStyle}
                          buttonText={webLayout ? 'Add to cart' : 'Add'}
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
              )}
            {get(template, 'template_name', '') ===
              APPEARANCE_TEMPLATE_NAME_2 &&
              webLayout && (
                <div>
                  <Row>
                    <div
                      className="discount-amount"
                      style={{
                        color: get(buttonStyle, 'backgroundColor', ''),
                      }}
                    >
                      <span>
                        <CurrencyFormatter
                          value={get(
                            getAttributeByName(
                              get(
                                get(data, 'product_variants', ''),
                                `[${findIndex(
                                  get(data, 'product_variants', '')
                                )}]`,
                                ''
                              ),
                              'Selling Price'
                            ),
                            '[0].attribute_value',
                            '000'
                          )}
                          type={currency}
                        />
                      </span>
                    </div>
                    <div className="discount-cut">
                      <span>
                        <CurrencyFormatter
                          value={get(
                            getAttributeByName(
                              get(
                                get(data, 'product_variants', ''),
                                `[${findIndex(
                                  get(data, 'product_variants', '')
                                )}]`,
                                ''
                              ),
                              'MRP Price'
                            ),
                            '[0].attribute_value',
                            '000'
                          )}
                          type={currency}
                        />
                      </span>
                    </div>
                  </Row>
                  <div className="product-select-contaniner">
                    <Select
                      value={
                        get(data, 'product_variants[0].id', '') || undefined
                      }
                      virtual={false}
                      placeholder="Select Product Variant"
                      className="product-quantity"
                      disabled
                    >
                      {get(data, 'product_variants', []).map((variant) => (
                        <Option key={variant.id} value={variant.id}>
                          {getVariantDetail(
                            variant.variant_attributes,
                            'Units'
                          )}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <div className="product-button-contaniner">
                    <AddCartActionButton
                      template={template}
                      buttonStyle={buttonStyle}
                      buttonHoverStyle={buttonHoverStyle}
                    />
                  </div>
                </div>
              )}
          </div>
        )}
        {isClicMode && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <img
                  src={imagePath(get(data, 'product_image', []))}
                  alt="img"
                  style={{ width: '100%', height: '100%' }}
                />
              </Col>
              <Col span={12}>
                <p style={{ ...productNameStyle }}>
                  {get(data, 'product_name', false) || 'Product Name'}
                </p>
                <hr />
                <p style={{ ...productDescriptionStyle }}>
                  {get(data, 'product_description', false) ||
                    'Product Description'}
                </p>
              </Col>
              <Col span={24}>
                <div className="template-btn-container">
                  <Space>
                    <Button
                      icon={<WhatsAppOutlined />}
                      style={{ ...productButtonStyle }}
                    />
                    <Button style={{ ...productButtonStyle }}>
                      Enquire Now
                    </Button>
                    <Button
                      icon={<CalendarOutlined />}
                      style={{ ...productButtonStyle }}
                    />
                  </Space>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Card>
    </Col>
  );
}
export default ProductTemplateItem;
