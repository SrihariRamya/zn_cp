/* eslint-disable no-nested-ternary */
import React from 'react';
import {
  List,
  Row,
  Card,
  Image,
  Tooltip,
  Typography,
  Button,
  Carousel,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { get, map } from 'lodash';
import { defaultImage } from '../../shared/image-helper';
import { ReactComponent as InstagramIcon } from '../../assets/icons/instagram-icon.svg';
import './promote-products.less';

const { Text } = Typography;

const InstaPostDetails = (properties) => {
  const history = useNavigate();
  const { igData, getInstaPosts } = properties;
  const paging = get(
    igData,
    'data.business_discovery.media.paging.cursors',
    ''
  );

  const addToProducts = (item) => {
    const addImage = [];
    const addVideo = [];
    if (item.children) {
      map(item.children.data, (value, index) => {
        return value.media_url.includes('mp4')
          ? addVideo.push({
              url: value.media_url,
              status: 'done',
              name: `${moment().format('DD-MM-YYYY-HH-mm-ss')}-video${
                index + 1
              }.mp4`,
              localMedia: true,
              type: 'video/mp4',
            })
          : addImage.push({
              url: value.media_url,
              status: 'done',
              localMedia: true,
              name: `${moment().format('DD-MM-YYYY-HH-mm-ss')}-image${
                index + 1
              }.jpg`,
              type: 'image/jpg',
            });
      });
    } else if (item.media_url.includes('mp4')) {
      addVideo.push({
        url: item.media_url,
        status: 'done',
        name: `${moment().format('DD-MM-YYYY-HH-mm-ss')}-video.mp4`,
        localMedia: true,
        type: 'video/mp4',
      });
    } else {
      addImage.push({
        url: item.media_url,
        status: 'done',
        localMedia: true,
        name: `${moment().format('DD-MM-YYYY-HH-mm-ss')}-image.jpg`,
        type: 'image/jpg',
      });
    }
    history('/products/add-product', {
      state: {
        meta: {
          caption: item.caption,
          addImage,
          addVideo,
        },
      },
    });
  };

  const mediaElement = (item) => {
    return item?.media_url?.includes('mp4') ? (
      <video width="200" height="180" controls autoPlay muted>
        <track kind="captions" />
        <source src={item.media_url} />
      </video>
    ) : (
      <Image preview={false} src={item.media_url || defaultImage} />
    );
  };

  return (
    <>
      {get(igData, 'data', '') && (
        <>
          <div className="box promote-product-list-container">
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 3,
                lg: 4,
                xl: 5,
                xxl: 7,
              }}
              dataSource={get(igData, 'data.business_discovery.media.data', '')}
              renderItem={(item) => (
                <Row>
                  <List.Item>
                    <Card className="mr-30">
                      <div className="img-container">
                        <InstagramIcon className="facebook-icon" />
                        <Carousel
                          effect="fade"
                          className="product-carousel meta-img"
                        >
                          {item.children ? (
                            map(item.children.data, (value) => {
                              return value.media_url.includes('mp4') ? (
                                <video
                                  width="200"
                                  height="180"
                                  controls
                                  autoPlay
                                  muted
                                >
                                  <track kind="captions" />
                                  <source
                                    src={value.media_url || defaultImage}
                                  />
                                </video>
                              ) : (
                                <Image
                                  preview={false}
                                  src={value.media_url || defaultImage}
                                />
                              );
                            })
                          ) : (
                            <div>{mediaElement(item)}</div>
                          )}
                        </Carousel>
                      </div>
                      <Tooltip title={item.caption}>
                        <Text
                          className="text-ellipsis  d-flex mt-10 mb-10"
                          ellipsis
                        >
                          <b>{item.caption}</b>
                        </Text>
                      </Tooltip>
                      <Row className="d-flex">
                        <Button
                          type="primary"
                          onClick={() => addToProducts(item)}
                        >
                          Add to Products{' '}
                        </Button>
                      </Row>
                    </Card>
                  </List.Item>
                </Row>
              )}
            />
          </div>
          <div className="d-flex">
            {paging?.before && (
              <Button
                type="primary"
                onClick={() => getInstaPosts(paging?.before)}
              >
                {'< Previous'}
              </Button>
            )}{' '}
            {paging?.after && (
              <Button
                type="primary"
                onClick={() => getInstaPosts(paging?.after)}
              >
                {'Next >'}
              </Button>
            )}
          </div>
        </>
      )}
      {get(igData, 'message', '') && <h4>{igData.message}</h4>}
    </>
  );
};

export default InstaPostDetails;
