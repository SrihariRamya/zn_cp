/* eslint-disable no-nested-ternary */
import React from 'react';
import {
  Select,
  List,
  Row,
  Card,
  Image,
  Tooltip,
  Typography,
  Button,
  Carousel,
  Empty,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { isEmpty, map } from 'lodash';
import moment from 'moment';
import { ReactComponent as FacebookLogo } from '../../assets/icons/facebook-logo.svg';
import { defaultImage } from '../../shared/image-helper';

const { Text } = Typography;

const FbPostPageDetail = (properties) => {
  const history = useNavigate();
  const {
    fbPageData,
    fbData,
    setSelectedPageId,
    disconnect,
    selectedPageId,
    pagination,
    getPagePosts,
  } = properties;

  const onChange = (value) => {
    setSelectedPageId(value);
  };

  const addToProducts = (item) => {
    const addImage = [];
    const addVideo = [];
    if (item.attachments.data[0].subattachments) {
      map(item.attachments.data[0].subattachments.data, (value, index) => {
        return addImage.push({
          url: value.media.image.src,
          status: 'done',
          name: `${moment().format('DD-MM-YYYY-HH-mm-ss')}-image${
            index + 1
          }.jpg`,
          localMedia: true,
          type: 'image/jpg',
        });
      });
    } else if (item.attachments.data[0].type === 'video_inline') {
      addVideo.push({
        url: item.attachments.data[0].media.source,
        status: 'done',
        name: `${moment().format('DD-MM-YYYY-HH-mm-ss')}-video.mp4`,
        localMedia: true,
        type: 'video/mp4',
      });
    } else {
      addImage.push({
        url: item.attachments.data[0].media.image.src,
        status: 'done',
        name: `${moment().format('DD-MM-YYYY-HH-mm-ss')}-image.jpg`,
        localMedia: true,
        type: 'image/jpg',
      });
    }
    history('/products/add-product', {
      state: {
        meta: {
          caption: item.message,
          addImage,
          addVideo,
        },
      },
    });
  };

  const mediaElement = (item) => {
    return item.attachments.data[0].type === 'video_inline' ? (
      <video width="200" height="180" controls autoPlay muted>
        <track kind="captions" />
        <source src={item.attachments.data[0].media.source || defaultImage} />
      </video>
    ) : (
      <Image
        preview={false}
        src={item.attachments.data[0].media?.image.src || defaultImage}
      />
    );
  };

  return (
    <>
      {!isEmpty(fbPageData) && (
        <>
          <p>Select a facebook page</p>
          <div className="page-align" style={{ marginBottom: '18px' }}>
            <Select
              className="mt-10"
              virtual={false}
              placeholder="Select a Page"
              optionFilterProp="children"
              value={selectedPageId}
              onChange={onChange}
              options={fbPageData}
            />
            <Button type="primary" onClick={() => disconnect()}>
              Disconnect
            </Button>
          </div>
        </>
      )}
      {!isEmpty(fbData) && (
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
              dataSource={fbData}
              renderItem={(item) => (
                <Row>
                  <List.Item>
                    <Card className="mr-30">
                      <div className="img-container">
                        <FacebookLogo className="facebook-icon" />
                        <Carousel
                          effect="fade"
                          className="product-carousel meta-img"
                        >
                          {item.attachments.data[0].subattachments ? (
                            map(
                              item.attachments.data[0].subattachments.data,
                              (value) => {
                                return (
                                  <Image
                                    preview={false}
                                    src={value.media.image.src || defaultImage}
                                  />
                                );
                              }
                            )
                          ) : (
                            <div>{mediaElement(item)}</div>
                          )}
                        </Carousel>
                      </div>
                      <Tooltip title={item.message}>
                        <Text
                          className="text-ellipsis d-flex mt-10 mb-10"
                          ellipsis
                        >
                          <b>{item.message}</b>
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
            {pagination?.previous && (
              <Button
                type="primary"
                onClick={() => getPagePosts(pagination?.previous)}
              >
                {'< Previous'}
              </Button>
            )}{' '}
            {pagination?.next && (
              <Button
                type="primary"
                onClick={() => getPagePosts(pagination?.next)}
              >
                {'Next >'}
              </Button>
            )}
          </div>
        </>
      )}
      {!isEmpty(fbPageData) && isEmpty(fbData) && <Empty />}
    </>
  );
};

export default FbPostPageDetail;
