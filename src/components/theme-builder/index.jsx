import {
  Button,
  Col,
  Drawer,
  Modal,
  Row,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  notification,
  Typography,
  Popconfirm,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { find, get, isEmpty } from 'lodash';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductLandingPage from './pages';
import dataSource from './data-source.json';
import './index.css';
import Settings from './settings/setting';
import {
  getThemeBuilder,
  putThemeBuilderTemplate,
  createThemeBuilderTemplate,
  deleteThemeBuilderTemplate,
  activeThemeBuilderTemplate,
} from '../../utils/api/url-helper';
import { AppearanceProvider } from '../context/appearance-context';
import ThemeBackgroundColor from './pages/theme-background';

function ThemeBuilder() {
  const navigate = useNavigate();
  const [themeBuilderData, setThemeBuilderData] = useState([]);
  const [activeElement, setActiveElement] = useState({});
  const [propertiesType, setPropertiesType] = useState('');
  const [sectionValues, setSectionValues] = useState([]);
  const [loader, setLoader] = useState(true);
  const [templateUid, setTemplateUid] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const fetchCurrentThemeBuilderData = useCallback(async () => {
    setLoader(true);
    const templateUidData = new URLSearchParams(window?.location.search).get(
      'template_uid'
    );
    setTemplateUid(templateUidData);
    const findCurrentTheme = find(themeBuilderData, (index) =>
      find(
        index.themeBuilderTemplate,
        (index__) => index__.theme_builder_template_uid === templateUidData
      )
    );
    const findCurrentThemeBuilderData = find(
      get(findCurrentTheme, 'themeBuilderTemplate'),
      (index__) => index__.theme_builder_template_uid === templateUidData
    );
    setTemplateName(
      get(findCurrentThemeBuilderData, 'theme_builder_template_name', '')
    );
    setSectionValues(
      get(findCurrentThemeBuilderData, 'theme_builder_template', [])
    );

    setLoader(false);
  }, [themeBuilderData]);

  useEffect(() => {
    fetchCurrentThemeBuilderData();
  }, [fetchCurrentThemeBuilderData, navigate]);

  const fetchThemeBuilderData = () => {
    setLoader(true);
    getThemeBuilder()
      .then((data) => {
        setThemeBuilderData(get(data, 'data', []));
        setLoader(false);
      })
      .catch((error) => {
        notification.error({
          message: get(error.message) || 'Not able to update template!',
        });
      });
    setLoader(true);
  };
  useEffect(() => {
    fetchThemeBuilderData();
  }, []);

  const columns = [
    {
      title: 'Pages',
      dataIndex: 'theme_builder_name',
      key: 'theme_builder_uid',
      render: (item) => <span className="text-green-dark">{item}</span>,
    },
  ];

  const activeUpdate = async (event, element) => {
    try {
      setLoader(true);
      await activeThemeBuilderTemplate({
        is_active: event,
        theme_builder_template_uid: get(element, 'theme_builder_template_uid'),
        theme_builder_uid: get(element, 'theme_builder_uid'),
      });
      fetchThemeBuilderData();
    } catch (error) {
      notification.error({
        message: get(error, 'error', 'Not able to update template!'),
      });
    }
  };
  const deleteTemplate = async (id) => {
    try {
      await deleteThemeBuilderTemplate(id);
      notification.success({ message: 'Template deleted successfully!' });
      fetchThemeBuilderData();
    } catch (error) {
      notification.error({
        message:
          get(error, 'error') || 'some error occurred while deleting template!',
      });
    }
  };
  const navigateRoute = (index_) => {
    navigate(`/theme-builder?template_uid=${index_}`);
    fetchThemeBuilderData();
  };
  const expandedRowRender = (d) => {
    const column = [
      {
        title: 'Template Name',
        dataIndex: 'theme_builder_template_name',
        key: 'theme_builder_uid',
      },
      {
        title: 'Is Active',
        dataIndex: 'is_active',
        key: 'theme_builder_uid',
        render: (index_, element) => {
          return (
            <Switch
              checked={index_}
              onChange={(event) => activeUpdate(event, element)}
            />
          );
        },
      },
      {
        title: 'Is Default',
        dataIndex: 'is_default',
        key: 'theme_builder_uid',
        render: (index_) => {
          // eslint-disable-next-line unicorn/no-null
          if (!index_) return null;
          return <Tag color="grey">Yes</Tag>;
        },
      },
      {
        title: 'Action',
        dataIndex: 'theme_builder_template_uid',
        key: 'theme_builder_template_uid',
        render: (index_) => {
          return (
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigateRoute(index_)}
              />
              <Popconfirm
                placement="rightTop"
                title="Are you sure want to delete this template"
                onConfirm={() => deleteTemplate(index_)}
                okText="Yes"
                cancelText="No"
              >
                <Button icon={<DeleteOutlined />} type="danger" />
              </Popconfirm>
            </Space>
          );
        },
      },
    ];
    return (
      <Table
        columns={column}
        dataSource={d.themeBuilderTemplate}
        pagination={false}
      />
    );
  };

  const handleOk = async () => {
    try {
      const themeBuilderUid = get(
        find(themeBuilderData, (index) =>
          find(
            index.themeBuilderTemplate,
            (index__) => index__.theme_builder_template_uid === templateUid
          )
        ),
        'theme_builder_uid'
      );
      await createThemeBuilderTemplate({
        theme_builder_uid: themeBuilderUid,
        theme_builder_template: sectionValues,
        theme_builder_template_name: templateName,
      });
      notification.success({
        message: 'created successfully!',
      });
      setLoader(true);
      navigate('/theme-builder');
      fetchThemeBuilderData();
      setIsModalOpen(false);
    } catch (error) {
      setIsModalOpen(true);
      notification.error({
        message: get(error, 'error', 'Not able to create template!'),
      });
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showConfirm = () => {
    Modal.confirm({
      title: 'Do you Want to save these template?',
      icon: <ExclamationCircleFilled />,
      content:
        'Default template cannot be saved. Are you ready to create new one?',
      visible: isModalOpen,
      async onOk() {
        await handleOk();
      },
      onCancel() {
        handleCancel();
      },
    });
  };

  const saveTemplate = async () => {
    try {
      const response = await putThemeBuilderTemplate(templateUid, {
        theme_builder_template: sectionValues,
        theme_builder_template_name: templateName,
      });
      notification.success({
        message: get(response, 'data') || 'updated successfully!',
      });
    } catch (error) {
      if (error?.error === 'Default template cannot be changed!') {
        showConfirm();
        setIsModalOpen(true);
      } else {
        notification.error({
          message: get(error, 'error', 'Not able to update template!'),
        });
      }
    }
  };

  return (
    <Spin spinning={loader}>
      <AppearanceProvider>
        <div
          className="productLandingPage"
          style={{
            background: 'white',
          }}
        >
          {isEmpty(window?.location?.search) ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '20px 0px',
                margin: '20px 0px',
              }}
            >
              <Table
                style={{ display: 'flex', alignItems: 'center' }}
                columns={columns}
                dataSource={themeBuilderData}
                expandable={{
                  expandedRowRender,
                }}
                scroll={{ x: 1000 }}
              />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div>
                <Row style={{ padding: '10px 20px' }} justify="space-between">
                  <Col>
                    <Typography.Title
                      editable={{
                        onChange: setTemplateName,
                      }}
                    >
                      {templateName}
                    </Typography.Title>
                  </Col>
                  <Col>
                    <Space>
                      <ThemeBackgroundColor
                        setSectionValues={setSectionValues}
                        activeElement={activeElement}
                        sectionValues={sectionValues}
                      />
                      <Button type="primary" onClick={() => saveTemplate()}>
                        Save
                      </Button>
                      <Button
                        type="danger"
                        danger
                        disabled={loader}
                        onClick={() => {
                          setLoader(true);
                          navigate('/theme-builder');
                          fetchThemeBuilderData();
                        }}
                      >
                        Cancel
                      </Button>
                    </Space>
                  </Col>
                </Row>
                <Row
                  style={{
                    background: get(
                      sectionValues,
                      '[0].section_style.backgroundColor'
                    ),
                  }}
                  justify="center"
                >
                  <Col
                    style={{
                      border: '1px solid orange',
                      padding: '10px 140px',
                    }}
                    span={24}
                  >
                    <ProductLandingPage
                      pages={sectionValues}
                      dataSource={dataSource}
                      setActiveElement={setActiveElement}
                      activeElement={activeElement}
                      sectionValues={sectionValues}
                      setSectionValues={setSectionValues}
                      setPropertiesType={setPropertiesType}
                      propertiesType={propertiesType}
                      value={sectionValues}
                    />
                  </Col>
                </Row>
              </div>
            </div>
          )}
        </div>
        <Drawer
          visible={!isEmpty(activeElement)}
          onClose={() => setActiveElement({})}
          width="400px"
        >
          <Settings
            value={sectionValues[0]}
            dataSource={dataSource}
            setActiveElement={setActiveElement}
            activeElement={activeElement}
            sectionValues={sectionValues}
            setSectionValues={setSectionValues}
            setPropertiesType={setPropertiesType}
            propertiesType={propertiesType}
          />
        </Drawer>
      </AppearanceProvider>
    </Spin>
  );
}

export default ThemeBuilder;
