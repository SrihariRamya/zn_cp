import React from 'react';
import { Button, Card, Skeleton, Tag, Row, Col } from 'antd';
import { get } from 'lodash';
import moment from 'moment';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/clic/noun-delete.svg';
import { ReactComponent as EditIcon } from '../../../assets/icons/clic/noun-edit.svg';
import { ReactComponent as CopyIcon } from '../../../assets/icons/clic/noun-copy.svg';

const { Meta } = Card;

function AppearanceThemeList(properties) {
  const {
    index,
    data,
    loading,
    currentStatus,
    handleRouterChange,
    handleConfirm,
    handleRename,
    updateRedisTheme,
  } = properties;
  return (
    <Card className="theme-list-card">
      <Skeleton avatar title={false} loading={!currentStatus && loading} active>
        <Meta
          title={false}
          description={
            <Row gutter={[16, 16]} align="middle">
              <Col xs={8} sm={8} md={9} lg={9} xl={11}>
                <Row className="theme-name-container">
                  {currentStatus && (
                    <Col span={6} xs={12} sm={12} md={6} lg={6}>
                      <Tag>Current layout</Tag>
                    </Col>
                  )}
                  <Col span={18} xs={12} sm={12} md={8} lg={8}>
                    <div className="theme-name">{data.theme_name}</div>
                  </Col>
                </Row>
              </Col>
              <Col xs={4} sm={4} md={2} lg={4} xl={4}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <EditIcon
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleRename(data)}
                    />
                  </Col>
                  <Col span={8}>
                    <CopyIcon
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleConfirm(data, 'duplicate')}
                    />
                  </Col>
                  <Col span={8}>
                    {!currentStatus && (
                      <DeleteIcon
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleConfirm(data, 'delete')}
                      />
                    )}
                  </Col>
                </Row>
              </Col>
              <Col xs={4} sm={4} md={4} lg={5} xl={5}>
                <Row>
                  <Col span={currentStatus ? 14 : 12}>
                    {currentStatus ? (
                      <Button
                        id={`layout-list-item-btn-${index}`}
                        onClick={() =>
                          updateRedisTheme(
                            get(data, 'appearance_theme_uid', '')
                          )
                        }
                      >
                        Update theme
                      </Button>
                    ) : (
                      <Button onClick={() => handleConfirm(data, 'publish')}>
                        Publish
                      </Button>
                    )}
                  </Col>
                  <Col span={currentStatus ? 10 : 12}>
                    <Button
                      id={`layout-list-item-btn-${index}`}
                      type="primary"
                      onClick={() =>
                        handleRouterChange(
                          get(data, 'appearance_theme_uid', '')
                        )
                      }
                    >
                      Customize
                    </Button>
                  </Col>
                </Row>
              </Col>
              <Col xs={12} sm={12} md={4} lg={4} xl={4}>
                <div className="theme-description">
                  {currentStatus ? 'Published:' : 'Last saved:'}
                  {currentStatus ? (
                    <span className="date-text">
                      {moment(get(data, 'current_theme_date')).isValid()
                        ? moment(get(data, 'current_theme_date')).fromNow()
                        : moment(get(data, 'creation_date')).fromNow()}
                    </span>
                  ) : (
                    <span className="date-text">
                      {moment(get(data, 'appearance_save_date')).isValid()
                        ? moment(get(data, 'appearance_save_date')).fromNow()
                        : moment(get(data, 'creation_date')).fromNow()}
                    </span>
                  )}
                </div>
              </Col>
            </Row>
          }
        />
      </Skeleton>
    </Card>
  );
}
export default AppearanceThemeList;
