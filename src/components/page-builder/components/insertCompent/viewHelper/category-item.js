import { Button, Card, Col, Row, Tooltip } from 'antd';
import { get, isEmpty } from 'lodash';
import React, { useState } from 'react';
import Slider from 'react-slick';
import { defaultImage } from '../../../../../shared/image-helper';

const sliderSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToScroll: 1,
  autoplaySpeed: 3000,
  autoplay: true,
  className: 'category-slider',
};

function IndividualCategory(properties) {
  const {
    data,
    textStyle,
    buttonStyle,
    buttonHoverStyle,
    maxWidth,
    spanCount,
    webLayout = true,
    render,
  } = properties;
  const [hover, setHover] = useState(false);
  const calculatedStyle = {
    ...buttonStyle,
    ...(hover ? buttonHoverStyle : {}),
  };
  return (
    <Col
      style={
        webLayout
          ? { minWidth: '220px', maxWidth: `${maxWidth}` }
          : { display: 'block', paddingLeft: '4px', paddingRight: '4px' }
      }
      key={get(data, 'category_uid', '')}
      span={webLayout ? spanCount : 8}
      className="category-list"
    >
      {webLayout ? (
        <Card hoverable className="category-list-item">
          <div>
            <div
              className={`category-img-container${webLayout ? '' : '-mobile'}`}
            >
              <img
                draggable={false}
                className="category-img"
                alt={get(data, 'category_name', '')}
                src={get(data, 'image', '') || defaultImage}
                style={{ height: '225px' }}
              />
            </div>

            <div className="offer-name" style={textStyle}>
              <span>
                <Tooltip
                  placement="topLeft"
                  title={
                    get(data, 'category_name', '') > 24 &&
                    get(data, 'category_name', '')
                  }
                >
                  {get(data, 'category_name', '')}
                </Tooltip>
              </span>
            </div>
            <div className="view-button-container">
              <Button
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={calculatedStyle}
              >
                View All
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div>
          <div
            className={`category-img-container${webLayout ? '' : '-mobile'}`}
          >
            <img
              draggable={false}
              className="category-img"
              alt={get(data, 'category_name', '')}
              src={get(data, 'image', '') || defaultImage}
            />
          </div>

          <div
            className={`category-offer-name ${
              render === 'preview' && 'preview-text'
            }`}
            style={textStyle}
          >
            <span>
              <Tooltip
                placement="topLeft"
                title={
                  get(data, 'category_name', '') > 24 &&
                  get(data, 'category_name', '')
                }
              >
                {get(data, 'category_name', '')}
              </Tooltip>
            </span>
          </div>
        </div>
      )}
    </Col>
  );
}

function CategoryItem(properties) {
  const component = get(properties, 'component');
  const columnLength = get(properties, 'columnLength');
  const render = get(properties, 'render');
  const webLayout = get(properties, 'webLayout');
  const noOfSlides = render === 'preview' ? 5 : 2;
  const slidesToView = Math.floor(noOfSlides / columnLength);
  const titleStyle = isEmpty(
    get(component, 'componentProperties.title_style', {})
  )
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
  return (
    <div>
      {get(component, 'componentProperties.title') && (
        <div
          className={`${render === 'preview' ? 'ptb-30' : 'ptb-20'}`}
          style={titleStyle}
        >
          {`${get(component, 'componentProperties.title', '')}`}
        </div>
      )}
      {get(component, 'componentProperties.value.length') ? (
        <Row>
          <div style={{ width: '100%' }}>
            {get(
              component,
              'componentProperties.body_style.scroll',
              'false'
            ) === 'true' ? (
              <Row
                style={{ width: '100%' }}
                gutter={
                  webLayout ? [16, 16] : [{ xs: 4, sm: 4, md: 16, lg: 16 }, 16]
                }
                className={`template-product-rowslider ${
                  webLayout ? '' : 'mobile'
                }`}
              >
                <Slider
                  slidesToShow={webLayout ? slidesToView : 3}
                  {...sliderSettings}
                >
                  {get(component, 'componentProperties.value', []).map(
                    (data) =>
                      get(data, 'zm_category') !== null && (
                        <IndividualCategory
                          key={get(data, 'category_uid')}
                          data={get(data, 'zm_category', data)}
                          textStyle={textStyle}
                          buttonStyle={buttonStyle}
                          maxWidth="auto"
                          buttonHoverStyle={buttonHoverStyle}
                          spanCount={24}
                          webLayout={webLayout}
                          render={render}
                        />
                      )
                  )}
                </Slider>
              </Row>
            ) : (
              <Row
                style={webLayout ? { padding: '8px' } : {}}
                gutter={webLayout ? 16 : [{ xs: 4, sm: 4, md: 16, lg: 16 }, 8]}
              >
                {get(component, 'componentProperties.value', []).map(
                  (data) =>
                    get(data, 'zm_category') !== null && (
                      <IndividualCategory
                        key={get(data, 'category_uid')}
                        data={get(data, 'zm_category', data)}
                        textStyle={textStyle}
                        buttonStyle={buttonStyle}
                        buttonHoverStyle={buttonHoverStyle}
                        maxWidth="284px"
                        spanCount={5}
                        webLayout={webLayout}
                        render={render}
                      />
                    )
                )}
              </Row>
            )}
          </div>
        </Row>
      ) : (
        <Row align="center" justify="middle">
          Click here to select category item!
        </Row>
      )}
    </div>
  );
}

export default CategoryItem;
