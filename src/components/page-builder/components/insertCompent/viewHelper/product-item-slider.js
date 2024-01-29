/* eslint-disable no-nested-ternary */
import { Row } from 'antd';
import { get, isEmpty, map } from 'lodash';
import Slider from 'react-slick';
import React from 'react';
import ProductTemplateItem from '../insertHelper/template/product/product-template-item';
import { useComponentContext } from '../../../context/components';

const sliderSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToScroll: 1,
  autoplaySpeed: 3000,
  autoplay: false,
  centerPadding: '20px',
  className: 'category-slider',
};

function ProductItemSlider(properties) {
  const { component, render, column, columnLength, webLayout } = properties;
  const { componentValues } = useComponentContext();
  let ColumnWidth;
  map(componentValues.row, (list) => {
    map(list.column, (col) => {
      if (component?.parentUid === col?.columnUid) {
        ColumnWidth = col?.columnStyle?.width;
      }
    });
  });
  const titleStyle = isEmpty(component, 'componentProperties.title_style', {})
    ? {}
    : get(component, 'componentProperties.title_style', {});
  const textStyle = isEmpty(
    get(component, 'componentProperties.body_style.text_style', {})
  )
    ? {}
    : get(component, 'componentProperties.body_style.text_style', {});
  const buttonStyle = isEmpty(
    get(component, 'componentProperties.body_style.button_style', {})
  )
    ? {}
    : get(component, 'componentProperties.body_style.button_style', {});
  const buttonHoverStyle = isEmpty(
    get(component, 'componentProperties.body_style.button_hover_style', {})
  )
    ? {}
    : get(component, 'componentProperties.body_style.button_hover_style', {});
  const productNameStyle = isEmpty(
    get(component, 'componentProperties.body_style.product_name_style', {})
  )
    ? {}
    : get(component, 'componentProperties.body_style.product_name_style', {});
  const productDescriptionStyle = isEmpty(
    get(
      component,
      'componentProperties.body_style.product_description_style',
      {}
    )
  )
    ? {}
    : get(
        component,
        'componentProperties.body_style.product_description_style',
        {}
      );
  const productTemplateStyle = isEmpty(
    get(component, 'componentProperties.body_style.product_template_style', {})
  )
    ? {}
    : get(
        component,
        'componentProperties.body_style.product_template_style',
        {}
      );
  const productButtonStyle = isEmpty(
    get(component, 'componentProperties.body_style.product_button_style', {})
  )
    ? {}
    : get(component, 'componentProperties.body_style.product_button_style', {});
  const scroll =
    get(component, 'componentProperties.body_style.scroll', 'false') === 'true';
  const ProductTemplate = isEmpty(get(column, 'section.template', {}))
    ? {}
    : get(column, 'section.template', {});
  const noOfSlides = render === 'preview' ? 5 : 2;
  const videoStyleClass = () => {
    if (webLayout) {
      if (columnLength <= 1) {
        return render === 'preview'
          ? 'product-video'
          : 'product-video-ntScroll';
      }
      return render === 'preview'
        ? 'product-video-nt'
        : 'product-video-ntScrolls';
    }
    if (columnLength <= 1) {
      return render === 'preview'
        ? 'product-video-mobile'
        : 'product-video-mobileScroll';
    }
    return render === 'preview'
      ? 'product-video-nt-mobile'
      : 'product-video-ntScrolls-mobile';
  };
  const renderClass = render === 'preview' ? 'p-20' : 'p-10';
  const renderClassTitle = render === 'preview' ? 'ptb-30' : 'ptb-20';
  return (
    <div className={`${webLayout ? renderClass : ''}`}>
      {get(component, 'componentProperties.title') && (
        <div
          className={`${
            webLayout ? renderClassTitle : 'section-title-preview'
          }`}
          style={titleStyle}
        >
          {`${get(component, 'componentProperties.title', '')}`}
        </div>
      )}
      {get(component, 'componentProperties.value.length') ? (
        <Row
          style={{ width: '100%' }}
          className={`template-product-rowslider ${webLayout ? '' : 'mobile'}`}
          gutter={webLayout ? [16, 16] : [{ xs: 4, sm: 4, md: 2, lg: 2 }, 2]}
        >
          <div style={{ width: '100%' }} className="product-list">
            {scroll ? (
              <Slider
                slidesToShow={
                  webLayout ? Math.floor(noOfSlides / columnLength) : 2
                }
                {...sliderSettings}
              >
                {get(component, 'componentProperties.value', []).map((data) => (
                  <ProductTemplateItem
                    key={get(data, 'product_uid')}
                    data={get(data, 'zm_product', data)}
                    textStyle={textStyle}
                    buttonStyle={buttonStyle}
                    buttonHoverStyle={buttonHoverStyle}
                    productNameStyle={productNameStyle}
                    productDescriptionStyle={productDescriptionStyle}
                    productButtonStyle={productButtonStyle}
                    productTemplateStyle={productTemplateStyle}
                    spanCount={24}
                    template={ProductTemplate}
                    maxWidth="auto"
                    columnLength={columnLength}
                    preview={render === 'preview'}
                    webLayout={webLayout}
                    videoStyleClass={videoStyleClass()}
                  />
                ))}
              </Slider>
            ) : (
              <Row
                gutter={
                  webLayout ? 16 / 8 : [{ xs: 4, sm: 4, md: 2, lg: 2 }, 2]
                }
              >
                {get(component, 'componentProperties.value', []).map((data) => (
                  <ProductTemplateItem
                    key={get(column, 'section.appearance_section_uid')}
                    data={get(data, 'zm_product', data)}
                    textStyle={textStyle}
                    buttonStyle={buttonStyle}
                    buttonHoverStyle={buttonHoverStyle}
                    productNameStyle={productNameStyle}
                    productDescriptionStyle={productDescriptionStyle}
                    productButtonStyle={productButtonStyle}
                    productTemplateStyle={productTemplateStyle}
                    spanCount={5}
                    template={ProductTemplate}
                    maxWidth="284px"
                    webLayout={webLayout}
                    columnLength={columnLength}
                    preview={render === 'preview'}
                    colStyle={
                      ColumnWidth <= '25%' ? 'section-col2' : 'section-col1'
                    }
                    videoStyleClass={videoStyleClass()}
                  />
                ))}
              </Row>
            )}
          </div>
        </Row>
      ) : (
        <Row align="center" justify="middle">
          Click here to select product item!
        </Row>
      )}
    </div>
  );
}

export default ProductItemSlider;
