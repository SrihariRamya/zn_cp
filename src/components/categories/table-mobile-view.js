import React from 'react';
import { List, Row, Col, Switch, Popover, Tag, Tree, Space } from 'antd';
import { get, isEmpty, isNil } from 'lodash';
import { defaultImage } from '../../shared/image-helper';
import SocialShare from '../social-share';
import { ReactComponent as CardMenu } from '../../assets/icons/cardMenu.svg';
import { ReactComponent as ShareIcon } from '../../assets/images/share-icon.svg';
import { ReactComponent as DeleteIcon } from '../../assets/images/delete-icon.svg';
import { ReactComponent as EditIcon } from '../../assets/images/edit-icon.svg';
import NoImage from '../../assets/images/no-image.png';

function TableMobileView(properties) {
  const {
    newFilterData,
    tenantDetails,
    handleEdit,
    handleDeleteCategory,
    pagination,
    handleStatusChange,
    handleProduct,
    handleTableChange,
  } = properties;

  const menuContent = (product) => {
    return (
      <>
        <div>
          <Tag
            className="share-tag grid-share-icon"
            onClick={(key) => handleEdit(key, product)}
          >
            <EditIcon />
            <span className="menu-items-align b-12p l-0p">Edit</span>
          </Tag>
        </div>

        <div>
          <Popover
            overlayClassName="category-share-popover"
            trigger="click"
            content={
              <SocialShare
                url={`${get(
                  tenantDetails,
                  'customer_url',
                  ''
                )}/product-list?categoryId=${get(product, 'category_uid', '')}${
                  get(product, 'sub_category_uid', '')
                    ? `&subCategoryId=${get(product, 'sub_category_uid', '')}`
                    : ''
                }&viewType=grid`}
                name={get(product, 'category_name', '')}
                image_url={get(product, 'image', '')}
                description=""
              />
            }
            placement="bottom"
          >
            <Tag color="white" className="share-tag grid-share-icon l-0p">
              <ShareIcon />
              <span className="menu-items-align">Social Share</span>
            </Tag>
          </Popover>
        </div>

        <div>
          <Tag
            className="share-tag grid-share-icon"
            onClick={(event_) =>
              handleDeleteCategory(product, 'single', event_)
            }
          >
            <DeleteIcon twoToneColor="#d9363e" />
            <span className="menu-items-align b-12p l-0p">Delete</span>
          </Tag>
        </div>
      </>
    );
  };

  const buildTree = (data) => {
    const categoryNode = {
      key: get(data, 'category_uid', ''),
      title: (
        <Row className="mt-10">
          <Col span={18}>
            <Row>
              <Space>
                <Col>
                  {isNil(get(data, 'image', '')) ||
                  isEmpty(get(data, 'image', '')) ? (
                    <img src={NoImage} alt="NoImg" className="cate-image" />
                  ) : (
                    <img
                      src={get(data, 'image', '')}
                      alt="NoImg"
                      className="cate-image"
                    />
                  )}
                </Col>
                <Col>
                  <p className="category-ellipse">
                    {get(data, 'category_name', '')}
                  </p>
                  <span>
                    {get(data, 'product_count', 0) > 0 ? (
                      `${get(data, 'product_count', 0)} Products`
                    ) : (
                      <button
                        type="button"
                        className="product-button"
                        onClick={() => handleProduct(data)}
                      >
                        Click to add product
                      </button>
                    )}
                  </span>
                </Col>
              </Space>
            </Row>
          </Col>
          <Col span={3} className="res-center">
            <Switch
              className="switch-container"
              checked={data.is_active}
              onChange={(values) => handleStatusChange(values, data)}
            />
          </Col>
          <Col span={3} className="res-center">
            <Popover
              arrow={false}
              overlayClassName="popover-menu popover-menu-item"
              content={menuContent(data)}
              placement="leftTop"
              trigger="click"
            >
              <CardMenu />
            </Popover>
          </Col>
        </Row>
      ),
      children: [],
    };
    if (
      Array.isArray(get(data, 'children')) &&
      get(data, 'children').length > 0
    ) {
      categoryNode.children = get(data, 'children', []).map((subCategory) => {
        return {
          key: get(subCategory, 'sub_category_uid', ''),
          title: (
            <Row>
              <Col span={16}>
                <div className="center">
                  <img
                    width="35px"
                    height="35px"
                    src={get(subCategory, 'image', '') || defaultImage}
                    alt="img"
                  />
                  &nbsp;&nbsp;
                  <div>
                    <p>{get(subCategory, 'category_name', '')}</p>
                    <div className="add-product-text">
                      {get(subCategory, 'product_count', 0) > 0 ? (
                        `${get(subCategory, 'product_count', 0)} Products`
                      ) : (
                        <button
                          type="button"
                          className="product-button"
                          onClick={() => handleProduct(subCategory)}
                        >
                          Click to add product
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
              <Col span={4} className="res-center">
                <Switch
                  className="switch-container"
                  checked={subCategory.is_active}
                  onChange={(values) => handleStatusChange(values, subCategory)}
                />
              </Col>
              <Col span={4} className="res-center">
                <Popover
                  arrow={false}
                  overlayClassName="popover-menu popover-menu-item"
                  content={menuContent(subCategory)}
                  placement="leftTop"
                  trigger="click"
                >
                  <CardMenu />
                </Popover>
              </Col>
            </Row>
          ),
        };
      });
    }
    return categoryNode;
  };

  return (
    <div className="search-container order-list-mobile-container">
      <div className="order-card-list category">
        <List
          dataSource={newFilterData}
          pagination={{
            align: 'center',
            onChange: (current) => {
              handleTableChange({ current }, '', {});
            },
            ...pagination,
          }}
          rowKey="order_hdr_id"
          renderItem={(item) => {
            const treeData = buildTree(item);
            return (
              <List.Item>
                <Tree showLine={!!item?.children} treeData={[treeData]} />
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}

export default TableMobileView;
