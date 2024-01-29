import React from 'react';
import {
  Modal,
  Button,
  Row,
  Col,
  Card,
  Avatar,
  Image,
  Divider,
  Input,
  Drawer,
} from 'antd';
import { get } from 'lodash';
import { ReactComponent as BackArrow } from '../../assets/icons/back-arrow.svg';
import { ReactComponent as GlobeIcon } from '../../assets/icons/globe-icon.svg';
import ProfileIcon from '../../assets/images/profile-icon.png';
import imagePath from '../../shared/image-helper';
import { ReactComponent as ThumbsUpIcon } from '../../assets/icons/thumbs-up.svg';
import { ReactComponent as HeartIcon } from '../../assets/icons/heart-icon.svg';
import { ReactComponent as LikeIcon } from '../../assets/icons/like.svg';
import { ReactComponent as ShareIcon } from '../../assets/icons/share-icon.svg';
import { ReactComponent as CommentIcon } from '../../assets/icons/comment-icon.svg';
import { ReactComponent as InstaLikeIcon } from '../../assets/icons/insta-like-icon.svg';
import { ReactComponent as InstaShareIcon } from '../../assets/icons/insta-share-icon.svg';
import { ReactComponent as InstaCommentIcon } from '../../assets/icons/insta-comment-icon.svg';
import { ReactComponent as InstaSaveIcon } from '../../assets/icons/save-icon.svg';
import { ReactComponent as VerificationBadge } from '../../assets/icons/verification-badge.svg';
import { ReactComponent as InstaMenuIcon } from '../../assets/icons/insta-menu-icon.svg';
import { ReactComponent as InstaProfileIcon } from '../../assets/icons/insta-profile-logo.svg';

import ZupainLogo from '../../assets/images/zupain-logo.png';

import { VIDEO_TYPES } from '../../shared/constant-values';

const { TextArea } = Input;

const { Meta } = Card;
function ShareOnSocialMedia(properties) {
  const {
    isSocialMediaModel,
    facebookPostData,
    setIsSocialMediaModel,
    socialMediaCaptionValue,
    setSocialMediaCaptionValue,
    postOnFacebook,
    mediaType,
    mobileView,
    postOnInstagram,
    loading,
  } = properties;
  const fbPostImage = get(facebookPostData, 'product_image');
  const handleInputChange = (event) => {
    setSocialMediaCaptionValue(event.target.value);
  };

  const customDrawerStyle = {
    marginTop: '130px',
    zIndex: '99',
  };
  const customMaskStyle = {
    background: 'none',
  };

  const shareSocialMediaPost = () => {
    const saveMediaPost =
      mediaType === 'FB'
        ? postOnFacebook(facebookPostData)
        : postOnInstagram(facebookPostData);
    return saveMediaPost;
  };

  const imageRender = () => {
    return (
      <div>
        {imagePath(fbPostImage)
          ?.split('.')
          ?.some((type) => VIDEO_TYPES.includes(type)) ? (
          <video
            width="376px"
            height="243px"
            kind="captions"
            className="video-src product-video"
          >
            <track kind="captions" />
            <source
              kind="captions"
              src={imagePath(fbPostImage)}
              type="video/mp4"
            />
          </video>
        ) : (
          <Image
            style={{
              position: 'relative',
              right: '13px',
            }}
            preview={false}
            width={376}
            height={243}
            src={imagePath(fbPostImage)}
          />
        )}
      </div>
    );
  };

  return (
    <div>
      {!mobileView && (
        <Modal
          closable={false}
          title={
            <div className="drawer-title-div">
              <span className="back-icon-align">
                <BackArrow onClick={() => setIsSocialMediaModel(false)} />
              </span>
              <span className="ml-30p">
                {mediaType === 'FB' ? 'Facebook post' : 'Instagram post'}
              </span>
            </div>
          }
          open={isSocialMediaModel}
          width={1000}
          footer={[
            <Button
              key="save"
              type="primary"
              className="social-share-save"
              loading={loading}
              onClick={() => shareSocialMediaPost()}
            >
              {mediaType === 'FB' ? 'Post' : 'Share'}
            </Button>,
          ]}
          className="social-share-modal social-media-footer"
          onCancel={() => setIsSocialMediaModel(false)}
        >
          <Row>
            <Col span={10}>
              {mediaType === 'FB' && (
                <Card className="facebook-card">
                  <Meta
                    avatar={<Avatar src={ProfileIcon} />}
                    title="Page-Name"
                    description={
                      <div>
                        <span className="sponsored-text"> Sponsored</span>
                        <span>
                          <GlobeIcon className="globe-icon" />
                        </span>
                      </div>
                    }
                  />
                  <div className="fb-description-text">
                    <div>Entered text will be displayed here.</div>
                    <div>#hashtags #tags #product</div>
                  </div>
                  {imageRender()}
                  <Row className="mt-10">
                    <Col span={10} className="r-17p">
                      <span>
                        <ThumbsUpIcon />
                      </span>
                      <span className="heart-icon">
                        <HeartIcon />
                      </span>
                      <span className="count-span">541</span>
                    </Col>
                    <Col span={14} className="comments-text">
                      <span className="mr-10">26 Comments</span>
                      <span>87 Shares</span>
                    </Col>
                  </Row>
                  <Divider className="divider-cls" />
                  <Row className="mt-10 common-row-text">
                    <Col span={8}>
                      <span>
                        <LikeIcon />
                      </span>
                      <span className="icon-text">Like</span>
                    </Col>
                    <Col span={8}>
                      <span>
                        <CommentIcon />
                      </span>
                      <span className="icon-text">Comment</span>
                    </Col>
                    <Col span={8} className="share-icon-col">
                      <span>
                        <ShareIcon />
                      </span>
                      <span className="icon-text">Share</span>
                    </Col>
                  </Row>
                </Card>
              )}
              {mediaType === 'IG' && (
                <Card className="facebook-card insta-card">
                  <Meta
                    avatar={<Avatar src={ZupainLogo} />}
                    title={
                      <Row>
                        <Col span={3} className="insta-profile-name mt-5">
                          Zupain
                        </Col>
                        <Col span={19} className="verification-badge mt-5">
                          <VerificationBadge />
                        </Col>
                        <Col span={2} className="insta-menu">
                          <InstaMenuIcon />
                        </Col>
                      </Row>
                    }
                    className="mb-10"
                  />
                  {imageRender()}
                  <div className="caption-div">
                    <Row className="mt-10">
                      <Col span={2}>
                        <InstaLikeIcon />
                      </Col>
                      <Col span={2}>
                        <InstaCommentIcon />
                      </Col>
                      <Col span={2} className="t-2p">
                        <InstaShareIcon />
                      </Col>
                      <Col span={16} />
                      <Col span={2}>
                        <InstaSaveIcon />{' '}
                      </Col>
                    </Row>
                    <div className="caption-text">
                      <div>157 likes</div>
                      <div>
                        Zupain{' '}
                        <span className="fw-400">
                          Tired of slow and ineffective Phone? Say hello to
                          Apple IPhone 13 mini
                        </span>
                        <span className="more-text"> … more</span>
                      </div>
                    </div>
                    <div className="more-text ">View all 8 comments</div>
                    <div className="translation-text">
                      <span>2 hours ago •</span>
                      <span className="fw-500">See translation</span>
                    </div>
                  </div>
                </Card>
              )}
            </Col>
            <div>
              <Col xs={4} sm={4} md={8} lg={13} className="input-text-col">
                <TextArea
                  value={socialMediaCaptionValue}
                  className="input-text-area"
                  placeholder="Write a caption"
                  onChange={handleInputChange}
                  showCount
                  maxLength={2200}
                  style={{
                    resize: 'none',
                  }}
                />
              </Col>
            </div>
          </Row>
        </Modal>
      )}
      {mobileView && (
        <Drawer
          style={customDrawerStyle}
          maskStyle={customMaskStyle}
          title={
            <div className="drawer-title-div">
              <span className="back-icon-align">
                <BackArrow onClick={() => setIsSocialMediaModel(false)} />
              </span>
              <span className="ml-30p social-media-title">
                {mediaType === 'FB' ? 'Facebook post' : 'Instagram post'}
              </span>
            </div>
          }
          open={isSocialMediaModel}
          onClose={() => setIsSocialMediaModel(false)}
          width={800}
          maskClosable={false}
          closable={false}
          className="products-inventory-drawer social-media-drawer"
        >
          <Row>
            <Col span={2} className="r-2p">
              <InstaProfileIcon />
            </Col>
            <Col span={20}>
              <TextArea
                value={socialMediaCaptionValue}
                className="caption-text-input"
                placeholder="Write a caption"
                onChange={handleInputChange}
                autoSize={{
                  minRows: 3,
                  maxRows: 5,
                }}
              />
            </Col>
            <Col span={2} className="align-right">
              <Image
                preview={false}
                width={30}
                height={38}
                src={imagePath(fbPostImage)}
              />
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col span={24} className="post-btn-col">
              <Button
                key="save"
                type="primary"
                className="social-share-save"
                loading={loading}
                onClick={() => shareSocialMediaPost()}
              >
                {mediaType === 'FB' ? 'Post' : 'Share'}
              </Button>
            </Col>
          </Row>
        </Drawer>
      )}
    </div>
  );
}

export default ShareOnSocialMedia;
