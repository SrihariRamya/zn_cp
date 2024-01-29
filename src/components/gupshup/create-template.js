import { UserSwitchOutlined } from '@ant-design/icons';
import {
  Alert,
  Breadcrumb,
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
  notification,
} from 'antd';
import React, { useEffect, useState } from 'react';
import './gupshup.less';
import { useNavigate, useParams } from 'react-router-dom';
import { forEach, get, isEmpty, map } from 'lodash';
import { parseJSONSafely } from '../../shared/function-helper';
import {
  BUTTON_CANCEL_TEXT,
  BUTTON_SAVE_TEXT,
  FAILED_TO_LOAD,
  GUPSHUP_TEMPLATE_TO_APPROVE_SCCESSS_MESSAGE,
} from '../../shared/constant-values';
import {
  createTemplate,
  getTemplate,
  getTemplates,
  updateTemplate,
} from '../../utils/api/url-helper';
import TemplatePreview from './template-preview';

const { Option } = Select;

const handleKeyDown = (event) => {
  if (event.ctrlKey && event.key === 'z') {
    event.preventDefault();
  }
};

function CreateGupshupTemplate() {
  const [form] = Form.useForm();
  const history = useNavigate();
  const { templateId, appId } = useParams();
  const [template, setTemplate] = useState({});
  const [loading, setLoading] = useState(false);
  const [alreadyUsed, setAlreadyUsed] = useState(false);
  const [exampleContent, setExampleContent] = useState([]);
  const [variables, setVariables] = useState([]);
  const [previewData, setPreviewData] = useState({});
  const [templates, setTemplates] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [syncTemplate, setSyncTemplate] = useState(false);

  const matchContentValue = (inputString) => {
    const pattern = /{{[^{}]*(?:{[^{}]+}[^{}]*)*}}/g;
    const matches = [];
    const newExampleContent = [];
    let count = 0;
    forEach(inputString.match(pattern) || [], (foundMatch) => {
      matches.push(foundMatch);
      newExampleContent.push(exampleContent[count]);
      count += 1;
    });
    setVariables(matches);
    setPreviewData({
      ...previewData,
      content: inputString,
      example_content: JSON.stringify(newExampleContent || []),
    });
    setExampleContent(newExampleContent);
  };

  const setInitialValue = (data) => {
    matchContentValue(data?.content);
    setExampleContent(parseJSONSafely(data?.example_content) || []);
    setPreviewData({
      ...previewData,
      content: data?.content,
      footer: data?.footer,
      example_content: data?.example_content,
      example_header: data?.example_header,
      header: data?.header,
    });
  };

  const fetchTemplate = () => {
    const queryParameter = {
      template_uid: templateId,
      app_id: appId,
    };
    setLoading(true);
    getTemplate(queryParameter)
      .then((response) => {
        setTemplate(response?.data?.template);
        form.setFieldsValue(response?.data?.template);
        setAlreadyUsed(response?.data?.is_already_used || false);
        setInitialValue(response?.data?.template);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({ message: error?.message || FAILED_TO_LOAD });
      });
  };

  const fetchTemplates = () => {
    const queryParameter = {
      app_id: appId,
    };
    setLoading(true);
    getTemplates(queryParameter)
      .then((response) => {
        setTemplates(response?.data?.rows);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({ message: error?.message || FAILED_TO_LOAD });
      });
  };

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    } else {
      fetchTemplates();
    }
  }, []);

  const handleOnChange = (value, from) => {
    switch (from) {
      case 'content': {
        if (value) {
          matchContentValue(value);
        } else {
          setPreviewData({
            ...previewData,
            content: '',
            example_content: [],
          });
          setExampleContent([]);
        }
        break;
      }
      case 'header': {
        setPreviewData({
          ...previewData,
          header: value,
        });
        break;
      }
      case 'footer': {
        setPreviewData({
          ...previewData,
          footer: value,
        });
        break;
      }
      default: {
        break;
      }
    }
  };

  const handleVariableOnchnage = (value, index) => {
    if (!isEmpty(exampleContent)) {
      const newVariablesArray = exampleContent.map((item, index_) =>
        index_ === index ? value : item
      );
      setExampleContent(newVariablesArray);
      setPreviewData({
        ...previewData,
        example_content: JSON.stringify(newVariablesArray),
      });
    }
  };

  const handleAddVariable = () => {
    const textToAdd = `{{${variables.length + 1}}}`;
    let newInputValue = '';
    newInputValue = isEmpty(get(previewData, 'content', ''))
      ? textToAdd
      : previewData.content.slice(0, cursorPosition) +
        textToAdd +
        previewData.content.slice(cursorPosition);
    form.setFieldsValue({
      content: newInputValue,
    });
    const oldExampleContent = isEmpty(get(previewData, 'example_content', []))
      ? []
      : parseJSONSafely(previewData.example_content);
    setPreviewData({
      ...previewData,
      content: newInputValue,
      example_content: [...oldExampleContent, ''],
    });
    setExampleContent([...exampleContent, '']);
    setCursorPosition(cursorPosition + textToAdd.length);
    setVariables([...variables, textToAdd]);
  };

  const handleTextAreaClick = (event) => {
    setCursorPosition(event.target.selectionStart);
  };

  const goBack = () => {
    history(-1);
  };

  const updateTemplateFunction = (value) => {
    const queryParameter = {
      app_id: appId,
      ...value,
      example_content: isEmpty(exampleContent)
        ? []
        : JSON.stringify(exampleContent),
      example_header: [],
    };
    setLoading(true);
    updateTemplate(templateId, queryParameter)
      .then(() => {
        notification.success({
          message: GUPSHUP_TEMPLATE_TO_APPROVE_SCCESSS_MESSAGE,
        });
        setLoading(false);
        goBack();
      })
      .catch((error) => {
        setLoading(false);
        notification.error({ message: error?.message || FAILED_TO_LOAD });
      });
  };

  const createTemplateFunction = (value) => {
    const queryParameter = {
      app_id: appId,
      ...value,
      example_content: isEmpty(exampleContent)
        ? []
        : JSON.stringify(exampleContent),
      example_header: [],
    };
    setLoading(true);
    createTemplate(queryParameter)
      .then(() => {
        notification.success({
          message: GUPSHUP_TEMPLATE_TO_APPROVE_SCCESSS_MESSAGE,
        });
        setLoading(false);
        goBack();
      })
      .catch((error) => {
        setLoading(false);
        notification.error({ message: error?.message || FAILED_TO_LOAD });
      });
  };

  const onFinish = (value) => {
    if (templateId) {
      updateTemplateFunction(value);
    } else {
      createTemplateFunction(value);
    }
  };

  const handleSelectChange = (value) => {
    if (value && templates.length > 0) {
      const selecteSyncTemplate = templates.find(
        (item) => item.template_uid === value
      );
      setInitialValue(selecteSyncTemplate);
      form.setFieldsValue(selecteSyncTemplate);
      setSyncTemplate(true);
    }
  };

  const handleSelectOnClear = () => {
    setPreviewData({});
    setExampleContent([]);
    setVariables([]);
    form.resetFields();
    setSyncTemplate(false);
  };

  return (
    <Spin spinning={loading}>
      <div className="gushups-create-template-container">
        <div className="search-container inventory-search-box">
          <Breadcrumb>
            <Breadcrumb.Item>
              <h1>
                <UserSwitchOutlined /> Create Templates
              </h1>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        {alreadyUsed && (
          <div className="mt-10">
            <Alert
              description="Any scheduled or in-progress campaigns with this template may fail when you edit this approved template"
              type="warning"
              showIcon
            />
          </div>
        )}
        <Row>
          <Col className="p-10" span={14}>
            <div className="template-left-side-container">
              <Form form={form} onFinish={onFinish} layout="vertical">
                {!templateId && (
                  <Form.Item name="template_name" label="Sync Template">
                    <Select
                      className="mt-10"
                      placeholder="Select sync template"
                      virtual={false}
                      onClear={handleSelectOnClear}
                      onChange={handleSelectChange}
                      allowClear
                    >
                      {map(templates, (item) => (
                        <Option value={get(item, 'template_uid')}>
                          {get(item, 'template_name')}
                        </Option>
                      ))}
                    </Select>{' '}
                  </Form.Item>
                )}
                <Form.Item
                  name="element_name"
                  label="Template Name"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter template name',
                    },
                    {
                      pattern: '^[a-z0-9_]+$',
                      message:
                        'Template names can only contain small letters, numbers and underscores',
                    },
                  ]}
                >
                  <Input disabled={!!templateId} className="mt-10" />
                </Form.Item>
                {!alreadyUsed && (
                  <Form.Item
                    name="vertical"
                    label="Template Label"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter template label',
                      },
                      {
                        min: 3,
                        message: 'template label must be minimum 3 characters.',
                      },
                    ]}
                  >
                    <Input disabled={alreadyUsed} className="mt-10" />
                  </Form.Item>
                )}
                <Form.Item
                  name="header"
                  rules={[
                    {
                      max: 60,
                      message: 'Header must be maximum 60 characters.',
                    },
                  ]}
                  label="Header"
                >
                  <Input
                    onChange={(event) =>
                      handleOnChange(event.target.value, 'header')
                    }
                    className="mt-10"
                  />
                </Form.Item>
                <Form.Item
                  name="content"
                  label="Body"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter your body content',
                    },
                    {
                      max: 1024,
                      message: 'Conent must be maximum 1024 characters.',
                    },
                    {
                      validator(_, value) {
                        const pattern = /{{}}/g;
                        if (value) {
                          const match = value.match(pattern);
                          if (!isEmpty(match)) {
                            return Promise.reject(
                              new Error('Invalid template body content ')
                            );
                          }
                          return Promise.resolve();
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input.TextArea
                    onKeyDown={handleKeyDown}
                    onChange={(event) =>
                      handleOnChange(event.target.value, 'content')
                    }
                    onBlur={handleTextAreaClick}
                    rows={10}
                    className="mt-10"
                  />
                </Form.Item>
                <div className="mb-10">
                  {(exampleContent.length <
                    parseJSONSafely(template?.example_content || []).length &&
                    templateId) ||
                  (!templateId && !syncTemplate) ? (
                    <Button className="mt-10" onClick={handleAddVariable}>
                      Add variable
                    </Button>
                  ) : undefined}
                  {!isEmpty(variables) && (
                    <div className="mt-10 variable-list-container">
                      <div>Define sample variable value for body</div>
                      <div className="variable-list">
                        {variables.map((item, index) => {
                          return (
                            <Row key={`${item}`}>
                              <Col span={4}>
                                <Input
                                  value={item}
                                  disabled
                                  className="mt-10"
                                />
                              </Col>
                              <Col className="ml-10" span={12}>
                                <Input
                                  onChange={(event) =>
                                    handleVariableOnchnage(
                                      event.target.value,
                                      index
                                    )
                                  }
                                  defaultValue={exampleContent[index]}
                                  className="mt-10"
                                />
                              </Col>
                            </Row>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <Form.Item
                  name="footer"
                  rules={[
                    {
                      max: 60,
                      message: 'Footer must be maximum 60 characters.',
                    },
                  ]}
                  validateTrigger="onBlur"
                  label="Footer"
                >
                  <Input
                    onChange={(event) =>
                      handleOnChange(event.target.value, 'footer')
                    }
                    className="mt-10"
                  />
                </Form.Item>
                <div className="flex-end mt-20">
                  <Form.Item>
                    <Space className="f_btns">
                      <Button danger onClick={goBack}>
                        {BUTTON_CANCEL_TEXT}
                      </Button>
                      <Button type="primary" htmlType="submit">
                        {BUTTON_SAVE_TEXT}
                      </Button>
                    </Space>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </Col>
          <Col className="p-10" span={10}>
            <TemplatePreview template={previewData} from="screen" />
          </Col>
        </Row>
      </div>
    </Spin>
  );
}

export default CreateGupshupTemplate;
