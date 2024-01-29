import React, { useContext } from 'react';
import { Col, Row } from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import { get } from 'lodash';
import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  PinterestShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from 'react-share';
import { TenantContext } from '../context/tenant-context';
import { ReactComponent as FacebookIcon } from '../../assets/images/facebook.svg';
import { ReactComponent as LinkedinIcon } from '../../assets/images/linkedin.svg';
import { ReactComponent as WhatsappIcon } from '../../assets/images/whatsapp.svg';
import { ReactComponent as TwitterIcon } from '../../assets/images/twitter.svg';
import { ReactComponent as EmailIcon } from '../../assets/images/mail.svg';
import { ReactComponent as PinterestIcon } from '../../assets/images/pinterest.svg';
import { ReactComponent as CopyOutlined } from '../../assets/images/copy.svg';

function SocialShare(properties) {
  const { adminEvent } = properties;
  const mobileView = useContext(TenantContext)[4];

  const commenRender = () => (
    <>
      <Col>
        <FacebookShareButton url={get(properties, 'url')}>
          <FacebookIcon onClick={() => adminEvent('Facebook Share')} />
        </FacebookShareButton>
      </Col>
      <Col>
        <WhatsappShareButton url={get(properties, 'url')}>
          <WhatsappIcon />
        </WhatsappShareButton>
      </Col>
      <Col>
        <TwitterShareButton url={get(properties, 'url')}>
          <TwitterIcon />
        </TwitterShareButton>
      </Col>
      <Col>
        <LinkedinShareButton url={get(properties, 'url')}>
          <LinkedinIcon />
        </LinkedinShareButton>
      </Col>
      <Col>
        <EmailShareButton
          url={get(properties, 'url')}
          subject={get(properties, 'name')}
          body={get(properties, 'description')}
        >
          <EmailIcon />
        </EmailShareButton>
      </Col>
      <Col>
        <PinterestShareButton
          url={get(properties, 'url')}
          media={get(properties, 'image_url')}
          description={get(properties, '.description')}
        >
          <PinterestIcon />
        </PinterestShareButton>
      </Col>
    </>
  );

  return (
    <>
      {!mobileView && (
        <Row align="middle" className="popover-row">
          {commenRender()}
          <Col>
            <Paragraph
              copyable={{
                text: get(properties, 'url'),
                icon: [<CopyOutlined key="social" />],
              }}
            />
          </Col>
        </Row>
      )}
      {mobileView && (
        <Row align="middle">
          {commenRender()}
          <Col>
            <Paragraph
              style={{ fontSize: '20px' }}
              copyable={{
                text: get(properties, 'url'),
                icon: [<CopyOutlined key="social" />],
              }}
            />
          </Col>
        </Row>
      )}
    </>
  );
}

export default SocialShare;
