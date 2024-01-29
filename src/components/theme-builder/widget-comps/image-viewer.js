import { Card, Col, Image, Row, Modal, Tabs } from 'antd';
import { find, get, map, reverse, slice } from 'lodash';
import React, { useEffect, useState } from 'react';
import { defaultImage } from '../../../shared/image-helper';
import VideoPreview from './video-preview';

const VIDEO_TYPES = ['mp4', 'webm'];

function ImageViewer({ properties, dataSource }) {
  const mobileView = false;
  const [carouselRequired, setCarouselRequired] = useState(
    get(
      properties,
      'column_properties.image_properties.carouselRequired',
      false
    )
  );
  const [carouselAlign, setCarouselAlign] = useState(
    get(
      properties,
      'column_properties.image_properties.carouselAlign',
      'bottom'
    )
  );
  useEffect(() => {
    setCarouselRequired(
      get(
        properties,
        'column_properties.image_properties.carouselRequired',
        false
      )
    );
    setCarouselAlign(
      get(
        properties,
        'column_properties.image_properties.carouselAlign',
        'bottom'
      )
    );
  }, [
    properties,
    properties?.column_properties?.image_properties?.carouselAlign,
    properties?.column_properties?.image_properties?.carouselRequired,
  ]);
  const data = dataSource;
  const productImages = reverse(slice(get(data, 'product_image'), 0, 10));

  const [hovered, setHoveredImg] = useState(
    get(data, 'product_image[0].product_image')
  );
  const [isImgHover, setIsImgHover] = useState(false);
  const [imageId, setImageId] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [activeTab] = useState('video');
  const DEVICE_TYPE = 'Web';
  const productImage = find(
    productImages,
    (element) => element.image_source === DEVICE_TYPE
  );
  const getProductImage = get(productImage, 'product_image', '');

  const handleMouseEnter = (event) => {
    setHoveredImg(event.product_image);
    setImageId(event.product_image_id);
    setIsImgHover(true);
  };
  const handleMouseLeave = () => {
    setIsImgHover(true);
  };
  const handleModalTab = () => {
    return (
      <Tabs activeKey={activeTab}>
        <Tabs.TabPane tab="Video" key="video">
          <VideoPreview videoSrc={hovered || getProductImage} data={data} />
        </Tabs.TabPane>
      </Tabs>
    );
  };

  const handleVideoMouseEnter = () => {
    setShowModal(true);
  };
  const handleClickMobileVideo = (event) => {
    setHoveredImg(event.product_image);
    setImageId(event.product_image_id);
    setIsImgHover(true);
    setShowModal(true);
  };

  const CarouselComponentVertical = () => {
    return (
      <Row
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection:
            (carouselAlign === 'left' && 'column') ||
            (carouselAlign === 'right' && 'column-reverse'),
        }}
      >
        <div>
          {map(productImages, (prodimg) => {
            return (
              prodimg.image_source === DEVICE_TYPE && (
                <Card
                  bodyStyle={{
                    padding: '3px',
                    margin: '3px',
                    display: 'flex',
                    alignContent: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  hoverable
                >
                  {get(prodimg, 'product_image', '')
                    .split('.')
                    .some((type) => VIDEO_TYPES.includes(type)) ? (
                    <div>
                      <video
                        style={{
                          width: mobileView ? '33px' : '50px',
                          height: mobileView ? '33px' : '50px',
                          objectFit: 'fill',
                          // width: "60px", height: "60px", objectFit: "fill"
                        }}
                        onMouseEnter={() => handleMouseEnter(prodimg)}
                        onMouseLeave={() => handleMouseLeave()}
                        onClick={() => handleClickMobileVideo(prodimg)}
                      >
                        <track kind="captions" />
                        <source
                          kind="captions"
                          src={
                            get(prodimg, 'product_image', '') || defaultImage
                          }
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  ) : (
                    <div>
                      <Image
                        onMouseEnter={() => handleMouseEnter(prodimg)}
                        onMouseLeave={handleMouseLeave}
                        src={get(prodimg, 'product_image', '') || defaultImage}
                        preview={false}
                        alt={get(prodimg, 'product_name', '')}
                        style={{
                          width: mobileView ? '33px' : '50px',
                          height: mobileView ? '33px' : '50px',
                        }}
                      />
                    </div>
                  )}
                </Card>
              )
            );
          })}
        </div>
      </Row>
    );
  };

  const CarouselComponentHorizontal = () => {
    return (
      <Row align="middle">
        {map(productImages, (prodimg) => {
          return (
            prodimg.image_source === DEVICE_TYPE && (
              <Card
                bodyStyle={{
                  padding: '3px',
                  margin: '3px',
                  display: 'flex',
                  alignContent: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                hoverable
              >
                {get(prodimg, 'product_image', '')
                  .split('.')
                  .some((type) => VIDEO_TYPES.includes(type)) ? (
                  <video
                    style={{
                      width: mobileView ? '33px' : '50px',
                      height: mobileView ? '33px' : '50px',
                      objectFit: 'fill',
                    }}
                    onMouseEnter={() => handleMouseEnter(prodimg)}
                    onMouseLeave={() => handleMouseLeave()}
                    onClick={() => handleClickMobileVideo(prodimg)}
                  >
                    <track kind="captions" />
                    <source
                      kind="captions"
                      src={get(prodimg, 'product_image', '') || defaultImage}
                      type="video/mp4"
                    />
                  </video>
                ) : (
                  <div>
                    <Image
                      onMouseEnter={() => handleMouseEnter(prodimg)}
                      onMouseLeave={handleMouseLeave}
                      src={get(prodimg, 'product_image', '') || defaultImage}
                      preview={false}
                      alt={get(prodimg, 'product_name', '')}
                      style={{
                        width: mobileView ? '33px' : '50px',
                        height: mobileView ? '33px' : '50px',
                      }}
                    />
                  </div>
                )}
              </Card>
            )
          );
        })}
      </Row>
    );
  };

  const ImageComponent = () => {
    return (
      <Row
        justify="center"
        align="center"
        style={
          (carouselAlign === 'top' || carouselAlign === 'bottom') && {
            height: '55vh',
            width: '55vh',
          }
        }
      >
        <Col
          span={24}
          className="image-container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image.PreviewGroup
            key={imageId}
            style={{
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {isImgHover ? (
              <>
                {hovered
                  ?.split('.')
                  .some((type) => VIDEO_TYPES.includes(type)) ? (
                  <video
                    className="video-preview-clip"
                    width="100%"
                    height="100%"
                    autoPlay
                    loop
                    muted
                    style={{ objectFit: 'fill' }}
                    preload="auto"
                    onClick={() => handleVideoMouseEnter()}
                    kind="captions"
                  >
                    <track kind="captions" />
                    <source
                      alt="video"
                      kind="captions"
                      src={
                        isImgHover ? hovered : getProductImage || defaultImage
                      }
                      type="video/mp4"
                      className="main-image"
                    />
                  </video>
                ) : (
                  <Image
                    preview={false}
                    src={isImgHover ? hovered : getProductImage || defaultImage}
                    alt="img"
                    className="main-image"
                  />
                )}
              </>
            ) : (
              <>
                {getProductImage
                  ?.split('.')
                  .some((type) => VIDEO_TYPES.includes(type)) ? (
                  <video
                    className="video-preview-clip"
                    width="100%"
                    height="100%"
                    preload="auto"
                    autoPlay
                    muted
                    loop
                    onClick={() => handleVideoMouseEnter()}
                    kind="captions"
                  >
                    <track kind="captions" />
                    <source
                      alt="video"
                      kind="captions"
                      src={getProductImage || defaultImage}
                      type="video/mp4"
                      className="main-image"
                    />
                  </video>
                ) : (
                  <Image
                    src={getProductImage || defaultImage}
                    alt="img"
                    className="main-image"
                    preview={false}
                  />
                )}
              </>
            )}
          </Image.PreviewGroup>
        </Col>
      </Row>
    );
  };

  const OnlyImageComponent = () => {
    return (
      <Row justify="center" align="center" className="products_scroll">
        <Col span={20}>
          <Row gutter={[30, 30]} span={20}>
            {map(productImages, (prodimg) => {
              return (
                prodimg.image_source === DEVICE_TYPE && (
                  <Col span={12}>
                    {get(prodimg, 'product_image', '')
                      .split('.')
                      .some((type) => VIDEO_TYPES.includes(type)) ? (
                      <div>
                        <video
                          width="100%"
                          // height="auto"
                          style={{ objectFit: 'fill', height: '30vh' }}
                          onMouseEnter={() => handleMouseEnter(prodimg)}
                          onMouseLeave={() => handleMouseLeave()}
                          onClick={() => handleClickMobileVideo(prodimg)}
                        >
                          <track kind="captions" />
                          <source
                            kind="captions"
                            src={
                              get(prodimg, 'product_image', '') || defaultImage
                            }
                            type="video/mp4"
                          />
                        </video>
                      </div>
                    ) : (
                      <div>
                        <Image
                          src={
                            get(prodimg, 'product_image', '') || defaultImage
                          }
                          alt={get(prodimg, 'product_name', '')}
                          preview={false}
                          style={{
                            border: '1px solid #C1C1C1',
                            borderRadius: '5px',
                          }}
                        />
                      </div>
                    )}
                  </Col>
                )
              );
            })}
          </Row>
        </Col>
      </Row>
    );
  };
  if (carouselRequired) {
    return <OnlyImageComponent />;
  }

  return (
    <>
      {(carouselAlign === 'top' || carouselAlign === 'bottom') && (
        <Col span={24}>
          {carouselAlign === 'top' && (
            <div
              style={{
                height: '15vh',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {' '}
              <CarouselComponentHorizontal />
            </div>
          )}
          <div
            style={{
              height: '60vh',
              display: 'flex',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
            }}
          >
            <ImageComponent />
          </div>
          {carouselAlign === 'bottom' && (
            <div
              style={{
                height: '15vh',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                alignContent: 'center',
              }}
            >
              {' '}
              <CarouselComponentHorizontal />
            </div>
          )}
        </Col>
      )}

      {(carouselAlign === 'left' || carouselAlign === 'right') && (
        <Col
          span={24}
          style={{
            height: '75vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection:
              (carouselAlign === 'left' && 'row') ||
              (carouselAlign === 'right' && 'row-reverse') ||
              (carouselAlign === 'top' && 'column') ||
              (carouselAlign === 'bottom' && 'column-reverse'),
          }}
        >
          <Col span={4} xs={6}>
            <CarouselComponentVertical />
          </Col>
          <Col
            span={20}
            xs={18}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Row
              justify="center"
              align="middle"
              style={{ alignContent: 'center', height: '50vh', width: '50vh' }}
            >
              <ImageComponent />
            </Row>
          </Col>
        </Col>
      )}

      <Modal
        visible={showModal}
        onCancel={() => {
          setShowModal(false);
        }}
        footer={false}
        width={850}
        style={{
          top: 100,
        }}
        destroyOnClose
        maskClosable={false}
        className="video-modal remove-address"
      >
        {handleModalTab()}
      </Modal>
    </>
  );
}

export default ImageViewer;
