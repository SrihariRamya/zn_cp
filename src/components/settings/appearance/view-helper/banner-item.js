import { Row } from 'antd';
import { get, isEmpty } from 'lodash';
import React from 'react';
import Slider from 'react-slick';

const sliderSettings = {
  dots: false,
  infinite: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  initialSlide: 0,
  autoplay: true,
  autoplaySpeed: 3000,
  speed: 2000,
  className: 'banner-slider',
  customPaging: () => (
    <div
      className="carousel-active"
      style={{
        color: 'blue',
        border: '1px solid #B8B8B8',
        height: '12px',
        width: '15px',
        borderRadius: '50%',
        margin: '8px',
      }}
    />
  ),
};

function BannerItem({ section, style }) {
  if (isEmpty(section.sectionArray)) {
    return (
      <Row
        style={{
          width: '100%',
          minHeight: '200px',
          backgroundColor: 'bisque',
          ...style,
        }}
        align="center"
        justify="middle"
      >
        <h1>Click to select banner properties</h1>
      </Row>
    );
  }
  return (
    <Slider slidesToShow={1} {...sliderSettings}>
      {get(section, 'sectionArray', []).map((item) => (
        <img
          src={get(item, 'bannerMapped.img', get(item, 'preview', ''))}
          alt="banner.jpg"
          style={{ width: '100%' }}
        />
      ))}
    </Slider>
  );
}

export default BannerItem;
