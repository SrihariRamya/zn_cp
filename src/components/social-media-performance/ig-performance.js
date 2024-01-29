import React from 'react';
import { Button, Avatar, Table, Modal, Image, Card, Col, Row } from 'antd';
import { get } from 'lodash';
import { utcToIst } from '../../shared/date-helper';
import { defaultImage } from '../../shared/image-helper';
import { ReactComponent as LikeIcon } from '../../assets/icons/like-icon.svg';
import { ReactComponent as Comment } from '../../assets/icons/comment.svg';
import { ReactComponent as ViewEye } from '../../assets/icons/view-eye.svg';
import './performance.less';

function InstagramPerformance(properties) {
  const {
    igData,
    closeInsight,
    viewIgPerformance,
    igInsight,
    getInstaPosts,
    igPagination,
  } = properties;

  const columns = [
    {
      title: 'Image',
      dataIndex: 'media_url',
      key: 'media_url',
      render: (text) => text && <Avatar shape="square" size={25} src={text} />,
    },
    {
      title: 'Caption',
      dataIndex: 'caption',
      key: 'caption',
    },
    {
      title: 'Type',
      key: '',
      dataIndex: '',
      render: () => <span>Product</span>,
    },
    {
      title: 'Action',
      render: (text) => {
        return (
          <Button
            type="primary"
            onClick={() => viewIgPerformance(text.id, text.media_type)}
          >
            View
          </Button>
        );
      },
    },
    {
      title: 'Post Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => utcToIst(text),
    },
  ];

  return (
    <>
      <Table dataSource={igData} columns={columns} pagination={false} />
      <div className="d-flex">
        {igPagination?.before && (
          <Button
            type="primary"
            onClick={() => getInstaPosts(igPagination?.before)}
          >
            {'< Previous'}
          </Button>
        )}{' '}
        {igPagination?.after && (
          <Button
            type="primary"
            onClick={() => getInstaPosts(igPagination?.after)}
          >
            {'Next >'}
          </Button>
        )}
      </div>
      <Modal
        title="Performance View"
        centered
        visible={get(igInsight, 'count', false)}
        footer={false}
        onCancel={closeInsight}
        width={660}
      >
        <Row>
          <Col>
            {igInsight?.count?.media_type === 'VIDEO' ? (
              <video width="180" height="180" controls autoPlay muted>
                <track kind="captions" />
                <source src={get(igInsight, 'count.media_url', defaultImage)} />
              </video>
            ) : (
              <Image
                style={{
                  height: '11rem',
                  width: '11rem',
                  borderRadius: '10px',
                }}
                preview={false}
                src={get(igInsight, 'count.media_url', defaultImage)}
              />
            )}
          </Col>
          <Col>
            <Card className="count-card" size="small">
              <LikeIcon className="insight-icon" />
              <h4>Like</h4>
              <br />
              <h1>{get(igInsight, 'count.like_count', 0)}</h1>
            </Card>
          </Col>
          <Col>
            <Card className="count-card" size="small">
              <Comment className="insight-icon" />
              <h4>Comment</h4>
              <br />
              <h1>{get(igInsight, 'count.comments_count', 0)}</h1>
            </Card>
          </Col>
          <Col>
            <Card className="count-card" size="small">
              <ViewEye className="insight-icon" />
              <h4>View</h4>
              <br />
              <h1>{get(igInsight, 'data.data[1].values[0].value', 0)}</h1>
            </Card>
          </Col>
          <Row>
            <h4>Product Name:</h4>&nbsp;
            <h4>{get(igInsight, 'count.caption', '')}</h4>
          </Row>
        </Row>
      </Modal>
    </>
  );
}

export default InstagramPerformance;
