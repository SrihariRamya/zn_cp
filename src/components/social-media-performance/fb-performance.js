import React from 'react';
import {
  Avatar,
  Button,
  Card,
  Col,
  Image,
  Modal,
  Row,
  Select,
  Table,
} from 'antd';
import { get, isEmpty } from 'lodash';
import { utcToIst } from '../../shared/date-helper';
import { ReactComponent as LikeIcon } from '../../assets/icons/like-icon.svg';
import { ReactComponent as Comment } from '../../assets/icons/comment.svg';
import { ReactComponent as ViewEye } from '../../assets/icons/view-eye.svg';
import { defaultImage } from '../../shared/image-helper';

const FacebookPerformance = (properties) => {
  const {
    fbData,
    viewFbPerformance,
    fbInsight,
    closeInsight,
    fbPagination,
    getPagePosts,
    fbPageData,
    selectedPageId,
    disconnect,
    setSelectedPageId,
  } = properties;

  const onChange = (value) => {
    setSelectedPageId(value);
  };

  const columns = [
    {
      title: 'Image',
      key: 'full_picture',
      dataIndex: 'full_picture',
      render: (text) => text && <Avatar shape="square" size={25} src={text} />,
    },
    {
      title: 'Caption',
      key: 'message',
      dataIndex: 'message',
    },
    {
      title: 'Type',
      dataIndex: '',
      key: '',
      render: () => <span>Product</span>,
    },
    {
      title: 'Action',
      dataIndex: 'id',
      key: 'id',
      render: (id) => {
        return (
          <Button type="primary" onClick={() => viewFbPerformance(id)}>
            View
          </Button>
        );
      },
    },
    {
      title: 'Post Date',
      dataIndex: 'created_time',
      key: 'created_time',
      render: (text) => utcToIst(text),
    },
  ];

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
      <Table dataSource={fbData} columns={columns} pagination={false} />
      <div className="d-flex">
        {fbPagination?.previous && (
          <Button
            type="primary"
            onClick={() => getPagePosts(fbPagination?.previous)}
          >
            {'< Previous'}
          </Button>
        )}{' '}
        {fbPagination?.next && (
          <Button
            type="primary"
            onClick={() => getPagePosts(fbPagination?.next)}
          >
            {'Next >'}
          </Button>
        )}
      </div>
      <Modal
        title="Performance View"
        centered
        visible={get(fbInsight, 'count', false)}
        footer={false}
        onCancel={closeInsight}
        width={660}
      >
        <Row>
          <Col>
            <Image
              style={{ height: '11rem', width: '11rem', borderRadius: '10px' }}
              preview={false}
              src={get(fbInsight, 'count.full_picture', defaultImage)}
            />
          </Col>
          <Col>
            <Card className="count-card" size="small">
              <LikeIcon className="insight-icon" />
              <h4>Like</h4>
              <br />
              <h1>{get(fbInsight, 'count.likes.summary.total_count', 0)}</h1>
            </Card>
          </Col>
          <Col>
            <Card className="count-card" size="small">
              <Comment className="insight-icon" />
              <h4>Comment</h4>
              <br />
              <h1>{get(fbInsight, 'count.comments.summary.total_count', 0)}</h1>
            </Card>
          </Col>
          <Col>
            <Card className="count-card" size="small">
              <ViewEye className="insight-icon" />
              <h4>View</h4>
              <br />
              <h1>{get(fbInsight, 'data.data[3].values[0].value', 0)}</h1>
            </Card>
          </Col>
          <Row>
            <h4>Product Name:</h4>&nbsp;
            <h4>{get(fbInsight, 'count.message', '')}</h4>
          </Row>
        </Row>
      </Modal>
    </>
  );
};

export default FacebookPerformance;
