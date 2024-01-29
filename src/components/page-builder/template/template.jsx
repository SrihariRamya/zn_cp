import { Row, Col, Card, Divider, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import './template.less';
import React from 'react';
import { get, map } from 'lodash';
import { defaultImage } from '../../../shared/image-helper';
import { useComponentContext } from '../context/components';
import { componentInitialJson } from '../helper';

function Templates(properties) {
  const { setActiveMenuItem } = properties;
  const navigate = useNavigate();
  const { defaultTemplate, pageList, pageBuilderLoader } =
    useComponentContext();

  const onClickTemplate = async (type, object) => {
    switch (type) {
      case 'blank': {
        localStorage.setItem('templateType', 'create');
        localStorage.setItem(
          'templateJson',
          JSON.stringify(componentInitialJson())
        );
        navigate({
          pathname: `/page-builder/${uuid()}`,
        });

        break;
      }
      case 'template': {
        localStorage.setItem('templateType', 'create');
        localStorage.setItem(
          'templateJson',
          JSON.stringify(get(object, 'page_json', {}))
        );

        navigate({
          pathname: `/page-builder/${uuid()}`,
        });
        break;
      }
      case 'update': {
        localStorage.setItem('templateType', 'update');
        navigate({
          pathname: `/page-builder/${get(object, 'page_uid', '')}`,
        });
        break;
      }
      default: {
        break;
      }
    }
    setActiveMenuItem('insert');
  };

  return (
    <Spin spinning={pageBuilderLoader}>
      <div className="page-builder-template">
        <div className="template-heading">Get Started</div>
        <Row className="template-top-row mt-10">
          <br />
          <Col span={4} onClick={() => onClickTemplate('blank')}>
            <Card className="template-card">
              <PlusOutlined />
            </Card>
            <p className="card-title mt-10">Blank</p>
          </Col>
          {map(defaultTemplate, (list, index) => {
            return (
              <Col span={4} onClick={() => onClickTemplate('template', list)}>
                <Card className="template-card overflow-hidden ">
                  <img
                    src={get(list, 'page_image', defaultImage)}
                    alt="pic"
                    className="img-background-cover"
                  />
                </Card>
                <p className="card-title mt-10">
                  {get(list, 'page_name', `project&nbsp;${index + 1}`)}
                </p>
              </Col>
            );
          })}
        </Row>
        <Divider />
        <Row className="template-middle-row">
          <Col span={12}>
            <div className="template-heading">All</div>
          </Col>
        </Row>
        <Divider />
        <Row className="template-row">
          {map(pageList, (page) => {
            return (
              <>
                <Col
                  span={6}
                  onClick={() => onClickTemplate('update', page)}
                  className="mt-10"
                >
                  <Card
                    className={
                      page.is_publish === 1
                        ? 'border-styles template-card-down  overflow-hidden '
                        : 'template-card-down  overflow-hidden'
                    }
                  >
                    <img
                      src={get(page, 'page_image', '') || defaultImage}
                      alt="pic"
                      className="img-background-cover"
                    />
                  </Card>
                </Col>
                <p className="card-title mt-10">{page.page_name}</p>
              </>
            );
          })}
        </Row>
      </div>
    </Spin>
  );
}

export default Templates;
