/* eslint-disable no-nested-ternary */
import { Row } from 'antd';
import { get, isEmpty } from 'lodash';
import Slider from 'react-slick';
import React from 'react';
import ProductTemplateItem from '../template/product/product-template-item';

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

function ProductItemSlider({ render, column, columnLength, webLayout }) {
  const titleStyle = !isEmpty(get(column, 'section.section_title_style', {}))
    ? get(column, 'section.section_title_style', {})
    : {};
  const textStyle = !isEmpty(
    get(column, 'section.section_body_style.text_style', {})
  )
    ? get(column, 'section.section_body_style.text_style', {})
    : {};
  const buttonStyle = !isEmpty(
    get(column, 'section.section_body_style.button_style', {})
  )
    ? get(column, 'section.section_body_style.button_style', {})
    : {};
  const buttonHoverStyle = !isEmpty(
    get(column, 'section.section_body_style.button_hover_style', {})
  )
    ? get(column, 'section.section_body_style.button_hover_style', {})
    : {};
  const productNameStyle = !isEmpty(
    get(column, 'section.section_body_style.product_name_style', {})
  )
    ? get(column, 'section.section_body_style.product_name_style', {})
    : {};
  const productDescriptionStyle = !isEmpty(
    get(column, 'section.section_body_style.product_description_style', {})
  )
    ? get(column, 'section.section_body_style.product_description_style', {})
    : {};
  const productTemplateStyle = !isEmpty(
    get(column, 'section.section_body_style.product_template_style', {})
  )
    ? get(column, 'section.section_body_style.product_template_style', {})
    : {};
  const productButtonStyle = !isEmpty(
    get(column, 'section.section_body_style.product_button_style', {})
  )
    ? get(column, 'section.section_body_style.product_button_style', {})
    : {};
  const scroll =
    get(column, 'section.section_body_style.scroll', 'false') === 'true';
  const ProductTemplate = !isEmpty(get(column, 'section.template', {}))
    ? get(column, 'section.template', {})
    : {};
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

  return (
    <div
      // eslint-disable-next-line no-nested-ternary
      className={`${webLayout ? (render === 'preview' ? 'p-20' : 'p-10') : ''}`}
    >
      {get(column, 'section.section_title') && (
        <div
          className={`${
            webLayout
              ? render === 'preview'
                ? 'ptb-30'
                : 'ptb-20'
              : 'section-title-preview'
          }`}
          style={titleStyle}
        >
          {`${get(column, 'section.section_title', '')}`}
        </div>
      )}
      {!get(column, 'section.sectionArray.length') ? (
        <Row align="center" justify="middle">
          Click here to select product item!
        </Row>
      ) : (
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
                {get(column, 'section.sectionArray', []).map((data) => (
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
                {get(column, 'section.sectionArray', []).map((data) => (
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
                    colStyle="section-col"
                    videoStyleClass={videoStyleClass()}
                  />
                ))}
              </Row>
            )}
          </div>
        </Row>
      )}
    </div>
  );
}

export default ProductItemSlider;
