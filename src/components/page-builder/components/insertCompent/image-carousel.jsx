/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useRef } from 'react';
import { Carousel, Row, Col } from 'antd';
import { get, map } from 'lodash'; // Import lodash map function
import { LeftCircleFilled, RightCircleFilled } from '@ant-design/icons';
import { handleCarouselImages } from '../../../../shared/function-helper';

function ImageCarouselComponent(properties) {
  const { comp } = properties;
  const { componentStyle } = comp;

  const carouselReference = useRef(null);

  const handlePreviousClick = () => {
    if (carouselReference.current) {
      carouselReference.current.prev();
    }
  };

  const handleNextClick = () => {
    if (carouselReference.current) {
      carouselReference.current.next();
    }
  };

  const carouselArray = get(comp, 'componentProperties.value', '');
  const imageArray = map(carouselArray, (item) => {
    return item;
  });

  return (
    <div className="carousel">
      <Row>
        <div className="banner-ht">
          <div
            role="presentation"
            onClick={handlePreviousClick}
            className="banner-arrow banner-left-arrow"
          >
            <LeftCircleFilled />
          </div>
        </div>
        <Col span={24} className="mb-12">
          <div
            style={{
              height: `${componentStyle.height}`,
              width: `${componentStyle.width}`,
            }}
          >
            <Carousel autoplay ref={carouselReference}>
              {map(imageArray, (image, index) => (
                <div key={index}>
                  <img
                    className="carousel-image"
                    src={handleCarouselImages(image)}
                    alt={`carousel-${index + 1}`}
                  />
                </div>
              ))}
            </Carousel>
          </div>
        </Col>
        <div className="banner-ht">
          <div
            role="presentation"
            onClick={handleNextClick}
            className="banner-arrow banner-right-arrow"
          >
            <RightCircleFilled />
          </div>
        </div>
      </Row>
    </div>
  );
}

export default ImageCarouselComponent;
