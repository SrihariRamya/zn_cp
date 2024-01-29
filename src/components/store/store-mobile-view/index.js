import React from 'react';
import { Link } from 'react-router-dom';
import {
  Input,
  Space,
  Breadcrumb,
  Avatar,
  Tag,
  Switch,
  Alert,
  Row,
  Col,
  Popover,
  FloatButton,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  CloseCircleOutlined,
  WarningFilled,
} from '@ant-design/icons';
import '../store.less';
import { get, isEmpty, map } from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import { INITIAL_PAGE } from '../../../shared/constant-values';
import { defaultImage } from '../../../shared/image-helper';
import { ReactComponent as Stores } from '../../../assets/icons/store-icon.svg';
import { ReactComponent as CardMenu } from '../../../assets/icons/cardMenu.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/edit-icon.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/images/delete-icon.svg';

function StoreMobileView(parameters) {
  const {
    searchWord,
    globalSearch,
    closedStoreMessage,
    storeCount,
    storeDetails,
    page,
    fetchStoreData,
    adminEvent,
    handleDelete,
    setClosedStoreMessage,
    loading,
    handleByStatus,
  } = parameters.parameters;
  const loadMoreData = () => {
    const pageSize = 10;
    const current = page + INITIAL_PAGE;
    const slug = true;
    fetchStoreData({ pagination: { pageSize, current }, slug });
  };

  const menuContent = (item) => {
    return (
      <Space direction="vertical">
        <div>
          <Link to={`/stores/edit-store/${get(item, 'store_uid', '')}`}>
            <Tag className="share-tag grid-share-icon">
              <EditIcon onClick={() => adminEvent('Store Edit')} />
              <span className="menu-items-align b-12p l-0p">Edit</span>
            </Tag>
          </Link>
        </div>
        <div>
          <Tag
            className="share-tag grid-share-icon"
            onClick={(event) => handleDelete(event, item)}
          >
            <DeleteIcon onClick={() => adminEvent('Store Delete')} />
            <span className="menu-items-align b-12p l-0p">Delete</span>
          </Tag>
        </div>
      </Space>
    );
  };
  const handleByEdit = (item) => {
    return (
      <Popover
        content={menuContent(item)}
        arrow={false}
        placement="leftTop"
        trigger="hover"
        overlayClassName="store-popover"
      >
        <CardMenu width={20} />
      </Popover>
    );
  };
  return (
    <div className="mobile-store-container">
      <div className="mobile-store-header-container">
        <div className="mobile-store-global-search">
          <Input
            allowClear
            placeholder="Search"
            value={searchWord}
            onChange={(event_) => globalSearch(event_.target.value)}
            className="custom-search"
            suffix={<SearchOutlined className="mobile-site-form-item-icon" />}
          />
        </div>
        <div className="mobile-store-title">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <Stores />
                Stores
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      {!isEmpty(closedStoreMessage) && (
        <Alert
          className="store-alert alert-top"
          message={
            <>
              <WarningFilled twoToneColor="#634343" />
              {closedStoreMessage}
            </>
          }
          closeText={
            <CloseCircleOutlined onClick={() => setClosedStoreMessage('')} />
          }
          closable
        />
      )}
      <div
        id="scroll-store-id"
        className={`store-list-container ${
          isEmpty(closedStoreMessage) && 'store-top'
        }`}
      >
        <InfiniteScroll
          dataLength={get(storeDetails, 'length', 0)}
          next={() => loadMoreData()}
          hasMore={get(storeDetails, 'length', 0) < storeCount}
          scrollableTarget="scroll-store-id"
        >
          <Spin spinning={loading}>
            {map(storeDetails, (item) => {
              return (
                <div className="store-content-details mt-10">
                  {!get(item, 'is_store_open', '') && (
                    <div className="offline-tag-container">
                      <div className="offline-tag">OFFLINE</div>
                      <div className="tag-end" />
                    </div>
                  )}
                  <Row justify="space-between">
                    <Col span={6}>
                      <Space direction="vertical">
                        <Link
                          to={`/stores/edit-store/${get(
                            item,
                            'store_uid',
                            ''
                          )}`}
                        >
                          <Avatar
                            shape="square"
                            size={93}
                            src={get(item, 'image', '') || defaultImage}
                          />
                        </Link>
                        <span className="store-status">
                          Status &nbsp;
                          <Switch
                            checked={!item?.is_store_open}
                            onChange={() => handleByStatus(item)}
                            className="switch-container"
                            size="small"
                          />
                        </span>
                      </Space>
                    </Col>
                    <Col span={16}>
                      <Space direction="vertical">
                        <Row>{get(item, 'store_name', '')}</Row>
                        <Row>{get(item, 'store_person_name', '')}</Row>
                        <Row>{get(item, 'store_person_number', '')}</Row>
                        <Row className="store-address">
                          {get(item, 'store_location', '')}
                        </Row>
                      </Space>
                    </Col>
                  </Row>
                  <div className="store-edit">{handleByEdit(item)}</div>
                </div>
              );
            })}
          </Spin>
        </InfiniteScroll>
      </div>
      <div className="mobile-store-add-btn">
        <Link to="/stores/add-store">
          <FloatButton
            icon={<PlusOutlined />}
            description="Add Store"
            shape="square"
          />
        </Link>
      </div>
    </div>
  );
}

export default StoreMobileView;
