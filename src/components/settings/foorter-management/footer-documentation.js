import React from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Switch,
  Row,
  Col,
  Card,
  Radio,
} from 'antd';
import {
  PlusOutlined,
  PlusCircleFilled,
  DeleteFilled,
} from '@ant-design/icons';
import { cloneDeep, get, includes, remove, filter } from 'lodash';
import { ReactComponent as DeleteIcon } from '../../../assets/images/delete-icon.svg';

const { Option } = Select;

function FooterDocumentation(properties) {
  const {
    activeData,
    onQuickChange,
    quickDisable,
    openDocumentation,
    quickLink,
    setSocialEnable,
    socialEnable,
    setSocialRemove,
    getDisableValues,
    urlValidator,
    checkDisabled,
    documentData,
    addQuickLink,
    removeQuickLinks,
    mobileView,
  } = properties;

  const Column3Component = () => {
    return quickLink.map((item, index) => (
      <Row key={get(item, 'id', '')}>
        <Col xs={24} sm={24} md={7} lg={7} xl={7}>
          <div style={{ position: 'relative' }}>
            <Form.Item
              className="social-media-status"
              name={`quickLink_active_${item.id}`}
              valuePropName="checked"
            >
              <Switch
                className="switch-container mob-switch"
                disabled={quickDisable}
                onClick={(checked) =>
                  checked
                    ? setSocialEnable([...socialEnable, `column-${item.id}`])
                    : (setSocialEnable(
                        remove(
                          cloneDeep(socialEnable),
                          (x) => x !== `column-${item.id}`
                        )
                      ),
                      setSocialRemove(`column-${item.id}`))
                }
              />
            </Form.Item>
            <Form.Item
              name={`quickLink_listName_${item.id}`}
              label={`Label ${item.id}`}
              rules={[
                {
                  required: includes(socialEnable, `column-${item.id}`),
                  message: 'Please input the label!',
                },
              ]}
            >
              <Input placeholder={`Label ${item.id}`} disabled={quickDisable} />
            </Form.Item>
          </div>
        </Col>
        <Col md={1} lg={1} xl={1} />
        <Col
          xs={index > 2 ? 20 : 24}
          sm={index > 2 ? 20 : 24}
          md={7}
          lg={7}
          xl={7}
        >
          <div className="mb-5p">
            <Radio.Group
              value={!getDisableValues(get(item, 'id', 0) - 1, 'document')}
              onChange={(event) => checkDisabled(item, event.target.value)}
            >
              <Radio value>Pages</Radio>
              <Radio value={false}>URL</Radio>
            </Radio.Group>
          </div>
          {!getDisableValues(get(item, 'id', 0) - 1, 'document') && (
            <Form.Item
              name={`quickLink_document_${item.id}`}
              rules={[
                {
                  required:
                    includes(socialEnable, `column-${item.id}`) &&
                    !getDisableValues(get(item, 'id', 0) - 1, 'document'),
                  message: 'Please select the documentation!',
                },
              ]}
            >
              <Select
                placeholder="Select page"
                showSearch
                virtual={false}
                className="select-height"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children
                    ?.toLowerCase()
                    ?.indexOf(input?.toLowerCase()) >= 0
                }
                disabled={
                  quickDisable ||
                  getDisableValues(get(item, 'id', 0) - 1, 'document')
                }
              >
                {filter(documentData, (value) => value.is_active).map(
                  (document) => (
                    <Option
                      key={get(document, 'document_id', '')}
                      value={get(document, 'document_id', '')}
                    >
                      {get(document, 'document_name', '')}
                    </Option>
                  )
                )}
              </Select>
            </Form.Item>
          )}
          {getDisableValues(get(item, 'id', 0) - 1, 'document') && (
            <Form.Item
              name={`quickLink_hyperlink_${item.id}`}
              rules={[
                {
                  required:
                    includes(socialEnable, `column-${item.id}`) &&
                    !getDisableValues(get(item, 'id', 0) - 1, 'hyperlink'),
                  message: 'Please input the link!',
                },
                urlValidator,
              ]}
            >
              <Input
                placeholder="Enter URL"
                disabled={
                  quickDisable ||
                  getDisableValues(get(item, 'id', 0) - 1, 'hyperlink')
                }
              />
            </Form.Item>
          )}
        </Col>
        {index >= 2 && (
          <Col
            xs={index > 2 ? 4 : 0}
            sm={index > 2 ? 4 : 0}
            span={3}
            className="center"
          >
            {index > 2 ? (
              <DeleteIcon
                className="mt-10 cursor-pointer"
                onClick={() => removeQuickLinks(item.id)}
              />
            ) : undefined}
          </Col>
        )}
        <Col span={24}>
          {index >= 2 &&
            (index === quickLink.length - 1 ? (
              <Button
                onClick={() => addQuickLink()}
                icon={<PlusOutlined />}
                type="primary"
              >
                Add another label
              </Button>
            ) : undefined)}
        </Col>
      </Row>
    ));
  };
  return (
    <div id="column3">
      <div className="block-header-footer-management mt-10">
        <span className="active-class base-line">
          <span className="switch-class mr-20p">Column 3</span>
          <Form.Item
            name={[get(activeData, '[2].header', ''), 'is_active']}
            valuePropName="checked"
          >
            <Switch className="switch-container" onChange={onQuickChange} />
          </Form.Item>
        </span>
      </div>
      <Card>
        <Row justify="space-between" align="middle" className="mb-10">
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Form.Item name="quick_links" label="Column Title">
              <Input placeholder="Quick links" disabled={quickDisable} />
            </Form.Item>
          </Col>
          <Col>
            <Button
              onClick={() => openDocumentation()}
              style={{ display: 'none' }}
              icon={<PlusOutlined />}
              type={mobileView ? '' : 'primary'}
              className={mobileView ? 'mob-doc-btn' : ''}
            >
              Add new page
            </Button>
          </Col>
        </Row>
        <Column3Component />
      </Card>
    </div>
  );
}

export default FooterDocumentation;
