/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable  */
import { LoadingOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Menu,
  Row,
  Space,
  Modal,
  notification,
  Spin,
  Tabs,
} from 'antd';
import { v4 as uuid } from 'uuid';
import { DragDropContext } from 'react-beautiful-dnd';
import { find, forEach, get, isEmpty, map, slice } from 'lodash';
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import RowProperty from './property/row-property/row-property';
import ContextDndComponent from './dnd-component/context-dnd-component';
import SettingMenu from './property/setting-property/settings-properties';
import RowDndComponent from './dnd-component/row-dnd-component';
import '../settings.less';
import {
  createOrUpdateAppearance,
  getAppearance,
  getAppearanceWidget,
  duplicateAppearanceTheme,
} from '../../../utils/api/url-helper';
import EditorDndComponent from './dnd-component/editor-dnd-component';
import {
  APPEARANCE_UPDATE_SUCCESS,
  APPEARANCE_UPDATE_LAYOUT_ERROR,
  EXPLORE,
  TENANT_MODE_CLIC,
  TENANT_MODE_NORMAL,
} from '../../../shared/constant-values';
import HeaderDetails from './dnd-component/header';
import FooterDetails from './dnd-component/footer';
import SeoCustomization from './seo-customization';
import { seoImageCompressor } from '../../../shared/function-helper';
import { ReactComponent as WebIcon } from '../../../assets/icons/clic/noun-web.svg';
import { ReactComponent as MobileIcon } from '../../../assets/icons/clic/noun-mobile.svg';
import { ReactComponent as ArrowIcon } from '../../../assets/icons/clic/Icon awesome-arrows.svg';
import { ReactComponent as SaveIcon } from '../../../assets/icons/clic/noun-save.svg';
import { ReactComponent as EyeIcon } from '../../../assets/icons/clic/noun-eye.svg';
import ClicFooter from './dnd-component/clic-footer';
import { TenantContext } from '../../context/tenant-context';
import LayoutPreviewModal from './layout-preview-modal';

const LMC = [
  {
    id: uuid(),
    appearance_row_uid: uuid(),
    style: { backgroundColor: '#ffffff' },
    column: [
      {
        id: uuid(),
        appearance_column_uid: uuid(),
        span: 24,
        style: { backgroundColor: '#ffffff' },
        section: {},
      },
    ],
  },
  {
    id: uuid(),
    appearance_row_uid: uuid(),
    style: { backgroundColor: '#ffffff' },
    column: [
      {
        id: uuid(),
        appearance_column_uid: uuid(),
        span: 12,
        style: { backgroundColor: '#ffffff' },
        section: {},
      },
      {
        id: uuid(),
        appearance_column_uid: uuid(),
        span: 12,
        style: { backgroundColor: '#ffffff' },
        section: {},
      },
    ],
  },
];

const sectionObject = {
  section_title: '',
  section_title_style: {
    color: '#000000',
    fontSize: '24px',
    textAlign: 'left',
    fontWeight: 'bold',
  },
  section_body_style: {
    text_style: {
      color: 'black',
    },
    button_style: {
      backgroundColor: '#38523B',
      color: 'white',
      borderColor: 'white',
    },
    button_hover_style: {
      backgroundColor: 'white',
      color: '#38523B',
      borderColor: '#38523B',
    },
    scroll: 'true',
    product_name_style: {
      color: '#232323',
      fontSize: '16px',
      textAlign: 'left',
      fontWeight: 'bold',
    },
    product_description_style: {
      color: '#232323',
      fontSize: '13px',
      textAlign: 'right',
      fontWeight: 'bold',
    },
    product_button_style: {
      backgroundColor: '#fff',
      color: '#232323',
      borderColor: '#232323',
    },
    product_template_style: {
      backgroundColor: '#fff',
    },
  },
  sectionArray: [],
  section_image_content: {},
  section_video_content: {},
};

const { confirm } = Modal;

const AppearanceTab = (properties) => {
  const {
    callEditorContext,
    callEditorContext1,
    callEditorContext2,
    callEditorContext3,
    callSetMenu,
    openTourModal,
    setTourCurrentStep,
  } = properties;
  const history = useNavigate();
  const [context, setContext] = useState([]);
  const [webLayout, setWebLayout] = useState(true);
  const [layoutSource, setLayoutSource] = useState('Web');
  const [menu, setMenu] = useState('lanes');
  const [editorContext, setEditorContext] = useState([]);
  const [initialData, setInitialData] = useState('');
  const [rowProperties, setRowProperties] = useState({});
  const [contextProperties, setContextProperties] = useState({});
  const [laneMenuContent] = useState(LMC);
  const [visible, setVisible] = useState(false);
  const [columnMenu, setColumnMenu] = useState({});
  const [loader, setLoader] = useState(false);
  const [settingProperties, setSettingProperties] = useState([]);
  const [seoProperties, setSeoProperties] = useState({});
  const [themeId] = useState(window.location.href.split('/')[4]);
  const [fileListState, setFileList] = useState([]);
  const [buttonDisable, setButtonDisable] = useState(false);
  const [tenantDetails] = useContext(TenantContext);

  const isNormalTenantMode =
    get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL;
  const [dataChanged, setDataChanged] = useState({
    status: false,
    source: 'web',
  });
  const tabsLists = [
    {
      key: 'Web',
      name: 'Web Layout',
      icon: WebIcon,
    },
    {
      key: 'Mobile',
      name: 'Mobile Layout',
      icon: MobileIcon,
    },
  ];

  const isClicMode = get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC;
  const goBack = () => {
    history(-1)
  }
  const getAppearanceData = useCallback(async () => {
    try {
      setLoader(true);
      const parameters = {
        appearance_source: layoutSource,
        appearance_theme_uid: themeId,
        document_path: EXPLORE,
      };
      const response = await Promise.all([
        getAppearance(parameters),
        getAppearanceWidget(),
      ]);
      setSettingProperties(get(response, '[0].data.themeData', []));
      setSeoProperties(get(response, '[0].data.seoData', {}));
      const editData = get(response, '[0].data.appearance', []);
      setEditorContext(editData);
      try {
        setInitialData(JSON.stringify(editData));
      } catch {
        setInitialData('');
      }
      setContext(get(response, '[1].data', []));
      setLoader(false);
    } catch (error) {
      notification.error({
        message: get(
          error,
          'message',
          'Some error occurred while retrieving data'
        ),
      });
      setLoader(false);
    }
  }, [layoutSource]);

  useEffect(() => {
    getAppearanceData();
  }, [getAppearanceData]);

  useEffect(() => {
    if (callEditorContext) {
      setEditorContext([LMC[0]]);
    }
  }, [callEditorContext]);

  useEffect(() => {
    if (callEditorContext2) {
      setEditorContext([]);
    }
  }, [callEditorContext2]);

  useEffect(() => {
    if (callEditorContext3) {
      setEditorContext([LMC[0]]);
    }
  }, [callEditorContext3]);

  useEffect(() => {
    if (callEditorContext1) {
      const data = editorContext[0];
      const appearanceWidget = find(
        context,
        (index) => index.widget_type === 'text'
      );
      const returnObject = {
        appearance_section_uid: uuid(),
        appearance_widget: appearanceWidget,
        appearance_widget_uid: appearanceWidget.appearance_widget_uid,
        contentType: appearanceWidget.widget_type,
        content: appearanceWidget.widget_title,
        ...sectionObject,
        section_text_content: '<p><br></p>',
      };
      data.column[0].section = returnObject;
      setEditorContext([data]);
    }
  }, [callEditorContext1]);

  useEffect(() => {
    if (callSetMenu) {
      setMenu(callSetMenu);
    }
  }, [callSetMenu]);

  useEffect(() => {
    let editorData;
    try {
      editorData = JSON.stringify(editorContext);
    } catch {
      editorData = '';
    }
    if (initialData === editorData) {
      setDataChanged({
        status: false,
        source: layoutSource,
      });
    } else {
      setDataChanged({ status: true, source: layoutSource });
    }
  }, [editorContext, initialData]);

  const submitHandler = useCallback(async (currentTheme) => {
    setLoader(true);
    const fileList = [];
    editorContext.map((item, rowIndex) => {
      return get(item, 'column', []).map((col, colIndex) => {
        let returnItem = [];
        if (
          get(col, 'section.appearance_widget.widget_type') === 'image' &&
          !isEmpty(col.section.fileList)
        ) {
          returnItem = [
            new File(
              [col.section.fileList[0].originFileObj],
              `${rowIndex}*${colIndex}`,
              {
                type: col.section.fileList[0].originFileObj.type,
              }
            ),
          ];
        }
        if (
          get(col, 'section.appearance_widget.widget_type') === 'video' &&
          !isEmpty(col.section.fileList)
        ) {
          returnItem.push(
            new File(
              [col.section.fileList[0].originFileObj],
              `${rowIndex}*${colIndex}`,
              {
                type: col.section.fileList[0].originFileObj.type,
              }
            )
          );
        }
        fileList.push(...returnItem);
        return { image: get(col, 'section.fileList[0]', {}) };
      });
    });
    const returnObject = editorContext.map((item, rowIndex) => ({
      appearance_row_uid: item.appearance_row_uid,
      style: get(item, 'style', {}),
      position: rowIndex + 1,
      column: get(item, 'column', []).map((col, columnIndex) => ({
        appearance_row_uid: item.appearance_row_uid,
        appearance_column_uid: col.appearance_column_uid,
        span: col.span,
        style: col.style,
        position: columnIndex + 1,
        section: !isEmpty(
          get(col, 'section.appearance_widget.widget_type')
        ) && {
          appearance_section_uid: col.section.appearance_section_uid,
          span: col.section.span,
          contentType: get(col, 'section.appearance_widget.widget_type'),
          appearance_column_uid: col.appearance_column_uid,
          section_title: col.section.section_title,
          section_text_content: col.section.section_text_content,
          section_title_style: col.section.section_title_style,
          section_body_style: col.section.section_body_style,
          template_uid: get(col, 'section.template.template_uid', ''),
          image_action: col.section.image_action,
          section_image_content: isEmpty(col.section.fileList)
            ? col.section.section_image_content
            : null,
          section_video_content: isEmpty(col.section.fileList)
            ? col.section.section_video_content
            : null,
          width: col.section.width,
          height: col.section.height,
          appearance_widget_uid: col.section.appearance_widget_uid,
          sectionArray: get(col, 'section.sectionArray', []).map(
            (secArray, secArrayPosition) => ({
              appearance_section_array_uid:
                secArray.appearance_section_array_uid,
              appearance_section_uid: col.section.appearance_section_uid,
              category_uid: secArray.category_uid,
              product_uid: secArray.product_uid,
              sub_category_uid: secArray.sub_category_uid,
              banner_id: secArray.banner_id,
              position: secArrayPosition + 1,
              url_path: secArray.url_path,
            })
          ),
        },
      })),
    }));
    const file =
      fileListState && fileListState.map((item) => item.originFileObj);
    const seoPreviewImage = await seoImageCompressor(file[0]);
    createOrUpdateAppearance(
      {
        object: returnObject,
        settingStyle: settingProperties,
        seoProperties,
        appearance_source: layoutSource,
        currentTheme,
        themeId,
      },
      {
        files: fileList,
        seo_image:
          seoPreviewImage ||
          file ||
          get(seoProperties, 'seo_preview_image', '') ||
          [],
      }
    )
      .then(() => {
        getAppearanceData();
        notification.success({ message: APPEARANCE_UPDATE_SUCCESS });
        setLoader(false);
        setButtonDisable(false);
        if (currentTheme) goBack();
      })
      .catch((error) => {
        notification.error({
          message: get(
            error,
            'error',
            'Some error occurred while updating data'
          ),
        });
        setLoader(false);
      });
  });
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const rowContent = find(editorContext, (item) =>
      find(
        get(item, 'column', []),
        (it) => it.appearance_column_uid === destination.droppableId
      )
    );
    if (
      get(destination, 'droppableId') === 'editor' &&
      get(source, 'droppableId') === 'row'
    ) {
      const { backgroundColor, column } = laneMenuContent[source.index];
      const columnArray = [];
      forEach(column, (index) => {
        const returnObject = {
          appearance_column_uid: uuid(),
          span: index.span,
          section: {},
          style: {
            backgroundColor: '#FFFFFF',
          },
        };
        columnArray.push(returnObject);
      });
      setEditorContext([
        ...slice(editorContext, 0, destination.index),
        {
          appearance_row_uid: uuid(),
          column: columnArray,
          style: {
            backgroundColor,
          },
        },
        ...slice(editorContext, destination.index, editorContext.length),
      ]);
      if (openTourModal) {
        setTourCurrentStep(3);
      }
    } else if (
      get(destination, 'droppableId') === 'editor' &&
      get(source, 'droppableId') === 'editor'
    ) {
      const copyArray = editorContext;
      const [removed] = copyArray.splice(source.index, 1);
      copyArray.splice(destination.index, 0, removed);
      setEditorContext(copyArray);
    } else if (
      rowContent &&
      get(source, 'droppableId') === 'content-draggable'
    ) {
      setEditorContext(
        editorContext.map((item) => {
          item.column.map((index) => {
            if (
              get(item, 'appearance_row_uid') ===
              get(rowContent, 'appearance_row_uid') &&
              get(index, 'appearance_column_uid') ===
              get(destination, 'droppableId')
            ) {
              const returnObject = {
                appearance_section_uid: uuid(),
                appearance_widget: context[source.index],
                appearance_widget_uid:
                  context[source.index].appearance_widget_uid,
                contentType: context[source.index].widget_type,
                content: context[source.index].widget_title,
                ...sectionObject,
                section_text_content:
                  context[source.index].widget_type === 'text' && '<p><br></p>',
              };
              index.section = returnObject;
            }
            return index;
          });
          return item;
        })
      );
      if (openTourModal) {
        setTourCurrentStep(5);
        setMenu('settings');
      }
    }
    setButtonDisable(true);
  };

  const updateLayout = () => {
    if (
      isEmpty(editorContext) ||
      buttonDisable ||
      (menu === 'lanes' && !isEmpty(rowProperties))
    ) {
      notification.error({
        message: APPEARANCE_UPDATE_LAYOUT_ERROR,
      });
    } else {
      setLoader(true);
      const parameters = {
        id: themeId,
        layout: webLayout ? 'Mobile' : 'Web',
        appearanceChange: true,
      };
      confirm({
        title: <h3>Are you sure to copy layout!</h3>,
        className: 'clic-confirm-modal',
        content: (
          <>
            <p style={{ marginTop: '20px' }}>
              This action will copy the lanes from the{' '}
              {webLayout ? 'Web' : 'Mobile'} section to the{' '}
              {webLayout ? 'Mobile' : 'Web'} section
            </p>
            <p style={{ marginTop: '20px' }}>
              If there are already lanes in the {webLayout ? 'Mobile' : 'Web'}{' '}
              section, the copied lanes will be added below them
            </p>
          </>
        ),
        width: 700,
        okText: 'Yes',
        cancelText: 'No',
        onCancel() {
          setLoader(false);
        },
        onOk() {
          duplicateAppearanceTheme(parameters)
            .then((resp) => {
              if (resp.success) {
                notification.success({
                  message: `Copy ${webLayout ? 'Web to Mobile layout' : 'Mobile to Web layout'
                    } Successfully`,
                });
                setLoader(false);
                getAppearanceData();
              } else setLoader(false);
            })
            .catch(() => {
              notification.error({
                message: 'Some error occurred while updating data',
              });
              setLoader(false);
            });
        },
      });
    }
  };

  const onKeyChange = (key) => {
    if (dataChanged.status) {
      setWebLayout(dataChanged.source === 'Web');
      setLayoutSource(dataChanged.source);
      if (dataChanged.source !== key) {
        notification.error({
          message:
            'You have unsaved changes, It will be lost if you switch the tab',
        });
      }
    } else {
      setWebLayout(key === 'Web');
      setLayoutSource(key);
    }
  };

  return (
    <>
      <Spin indicator={LoadingOutlined} spinning={loader}>
        <div id="appearance">
          <LayoutPreviewModal
            layoutSource={layoutSource}
            webLayout={webLayout}
            visible={visible}
            setVisible={setVisible}
            settingProperties={settingProperties}
            editorContext={editorContext}
          />
          <div className="appearance-tab-container">
            <div className="flex-bwn">
              <div className="tab-list-container flex">
                <Tabs
                  defaultActiveKey="Web"
                  onChange={onKeyChange}
                  activeKey={layoutSource}
                  addIcon={LoadingOutlined}
                >
                  {map(tabsLists, (tab) => (
                    <Tabs.TabPane
                      key={tab?.key}
                      tab={
                        <span className="flex-center">
                          <tab.icon /> &nbsp; &nbsp;
                          {tab?.name}
                        </span>
                      }
                    />
                  ))}
                </Tabs>
                {!isClicMode && (
                  <div
                    className="switch-layout-button"
                    role="presentation"
                    onClick={() => {
                      updateLayout();
                    }}
                  >
                    {webLayout ? (
                      <WebIcon style={{ margin: '0px 16px 0px 4px' }} />
                    ) : (
                      <MobileIcon style={{ margin: '0px 16px 0px 4px' }} />
                    )}
                    <ArrowIcon />
                    {webLayout ? (
                      <MobileIcon style={{ margin: '0px 4px 0px 16px' }} />
                    ) : (
                      <WebIcon style={{ margin: '0px 4px 0px 16px' }} />
                    )}
                  </div>
                )}
              </div>
              <div>
                <Space>
                  <Form.Item>
                    <Space>
                      <div className="prview-icon-container">
                        <EyeIcon onClick={() => setVisible(true)} />
                      </div>
                      <div className="prview-icon-container mr-10">
                        <SaveIcon onClick={() => submitHandler(false)} />
                      </div>
                      <Button
                        id="appearance-save-btn"
                        type="primary"
                        onClick={() => submitHandler(true)}
                      >
                        Save & publish
                      </Button>
                    </Space>
                  </Form.Item>
                  <Form.Item>
                    <Button onClick={getAppearanceData}>cancel</Button>
                  </Form.Item>
                </Space>
              </div>
            </div>
          </div>
          <DragDropContext
            onDragEnd={(response) => {
              onDragEnd(response);
            }}
          >
            <div className="box mobile-side-padding">
              <div className="box-content-background apperance-box-content">
                <Row>
                  <Col
                    xs={24}
                    sm={24}
                    md={15}
                    lg={15}
                    xl={15}
                    className="appearance editor"
                    style={
                      editorContext.length && {
                        overflowY: 'scroll',
                        overflowX: 'hidden',
                        maxHeight: '700px',
                        padding: '0px',
                        backgroundColor: get(
                          find(
                            settingProperties,
                            (item) =>
                              get(item, 'variable_name') ===
                              '--layout-body-background'
                          ),
                          'variable_value',
                          '#FFFFFF'
                        ),
                      }
                    }
                  >
                    {isNormalTenantMode && (
                      <HeaderDetails
                        settingProperties={settingProperties}
                        webLayout={webLayout}
                      />
                    )}
                    <Row align="center">
                      <EditorDndComponent
                        settingProperties={settingProperties}
                        laneMenuContent={laneMenuContent}
                        editorContext={editorContext}
                        identifier="editor"
                        setRowProperties={setRowProperties}
                        setContextProperties={setContextProperties}
                        setEditorContext={setEditorContext}
                        menu={menu}
                        setMenu={setMenu}
                        columnMenu={columnMenu}
                        rowProperties={rowProperties}
                        contextProperties={contextProperties}
                        webLayout={webLayout}
                      />
                    </Row>
                    {isClicMode ? (
                      <ClicFooter
                        isWebLayout={webLayout}
                        settingProperties={settingProperties}
                      />
                    ) : (
                      <FooterDetails
                        settingProperties={settingProperties}
                        webLayout={webLayout}
                      />
                    )}
                  </Col>
                  <Col
                    span={8}
                    id="appearance-scroll"
                    className="appearance scroll"
                  >
                    <Menu
                      mode="horizontal"
                      onClick={(event) => {
                        setMenu(event.key);
                        setRowProperties({});
                        setContextProperties({});
                      }}
                      defaultSelectedKeys={[menu]}
                      selectedKeys={[menu]}
                    >
                      <Menu.Item key="lanes">Lanes</Menu.Item>
                      <Menu.Item key="sections">Content</Menu.Item>
                      {webLayout && (
                        <Menu.Item key="settings" id="appearance-settings">
                          Settings
                        </Menu.Item>
                      )}
                      <Menu.Item key="seo">SEO</Menu.Item>
                    </Menu>
                    {menu === 'lanes' && isEmpty(rowProperties) && (
                      <div id="appearance-lane-component">
                        <RowDndComponent
                          identifier="row"
                          laneMenuContent={laneMenuContent}
                          setRowProperties={setRowProperties}
                          menu={menu}
                        />
                      </div>
                    )}
                    {menu === 'lanes' && !isEmpty(rowProperties) && (
                      <RowProperty
                        rowProperties={rowProperties}
                        setRowProperties={setRowProperties}
                        setEditorContext={setEditorContext}
                        editorContext={editorContext}
                        columnMenu={columnMenu}
                        setColumnMenu={setColumnMenu}
                        webLayout={webLayout}
                      />
                    )}
                    {menu === 'sections' && (
                      <div id="appearance-context-component">
                        <ContextDndComponent
                          contextProperties={contextProperties}
                          context={context}
                          editorContext={editorContext}
                          setEditorContext={setEditorContext}
                          setContextProperties={setContextProperties}
                          getAppearanceData={getAppearanceData}
                          webLayout={webLayout}
                        />
                      </div>
                    )}
                    {menu === 'settings' && webLayout && (
                      <SettingMenu
                        settingProperties={settingProperties}
                        setSettingProperties={setSettingProperties}
                        isNormalTenantMode={isNormalTenantMode}
                      />
                    )}
                    {menu === 'seo' && (
                      <SeoCustomization
                        seoProperties={seoProperties}
                        setSeoProperties={setSeoProperties}
                        setFileList={setFileList}
                        fileListState={fileListState}
                      />
                    )}
                  </Col>
                </Row>
              </div>
            </div>
          </DragDropContext>
        </div>
      </Spin>
    </>
  );
};

export default AppearanceTab;
