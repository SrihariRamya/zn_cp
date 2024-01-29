import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  Input,
  Form,
  Spin,
  Row,
  Col,
  Space,
  Button,
  notification,
  Modal,
  Breadcrumb,
  Tour,
} from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { capitalize, get, isEmpty, map } from 'lodash';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import ImageUploadModal from '../../products/image-modal';
import { ReactComponent as ModalBg } from '../../../assets/policyModalBG.svg';
import {
  getDocumentByID,
  uploadFile,
  updateDocument,
  putOnboardSubGuide,
} from '../../../utils/api/url-helper';
import {
  FAILED_TO_LOAD,
  DOCUMENT_UPDATE_SUCCESS,
  DOCUMENT_UPDATE_FAILED,
  TENANT_MODE_CLIC,
  TENANT_MODE_NORMAL,
} from '../../../shared/constant-values';
import { getBase64 } from '../../../shared/attributes-helper';
import { TenantContext } from '../../context/tenant-context';
import SettingsMobileHeading from '../setting-mobile-heading';
import { MilestoneContext } from '../../context/milestone-context';

const uploadCallback = (file) => {
  return new Promise((resolve, reject) => {
    const files = { file: [file] };
    if (file) {
      const data = new FormData();
      data.append('storyImage', file);
      uploadFile(files)
        .then((response) => {
          resolve({ data: { link: response.image } });
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
};

function PageEditor() {
  const navigate = useNavigate();
  const mobileView = useContext(TenantContext)[4];
  const [form] = Form.useForm();
  const documentID = get(useParams(), 'id', '');
  const [documentData, setDocumentData] = useState([]);
  const [editorState, setEditorState] = useState();
  const [newEditorState, setNewEditorState] = useState();
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [enableSave, setEnableSave] = useState(false);
  const { fetchTourData } = useContext(MilestoneContext);
  const [emoji, setEmoji] = useState(false);

  const [previewTitle, setPreviewTitle] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const tenantDetails = useContext(TenantContext)[0];
  const stateData = get(tenantDetails, 'state_details.state_name', '');
  const districtData = get(tenantDetails, 'district_details.district_name', '');
  const settingData = get(tenantDetails, 'setting', {});
  const address1 = get(settingData, 'address_1', '');
  const address2 = get(settingData, 'address_2', '');
  const internationalCity = get(settingData, 'international_city', '');
  const internationalState = get(settingData, 'international_state', '');
  const district = isEmpty(address1) ? '' : capitalize(districtData);
  const districtName = isEmpty(internationalCity)
    ? district
    : internationalCity;
  const state = isEmpty(address1) ? '' : capitalize(stateData);
  const stateName = isEmpty(internationalState) ? state : internationalState;
  const pincode = get(settingData, 'pincode', '') || '';
  const country = get(settingData, 'country', '');
  const [openTourModal, setOpenTourModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completeModal, setCompleteModal] = useState(false);

  const [metaArray, setMetaArray] = useState([]);
  const [icon, setIcon] = useState([]);
  const [uploadObject, setUploadObject] = useState([
    { id: 1, isDisable: true, url: '' },
  ]);
  const [editDocumentModal, setEditDocumentModal] = useState(false);

  function completeTour() {
    if (openTourModal) {
      putOnboardSubGuide({
        completed: true,
        slug: 'policy',
      });
    }
  }

  const handleSkip = () => {
    setOpenTourModal(false);
    completeTour();
  };

  const previousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    getDocumentByID(documentID)
      .then((response) => {
        const documentValue = get(response, 'data[0].document', '');
        setDocumentData(get(response, 'data[0]', []));
        let replacedContent = '';
        if (!isEmpty(documentValue)) {
          const placeholderRegex =
            /\[tenant_name]|\[phone_number]|\[email]|\[address]|\[bussiness_name]/g;
          replacedContent = documentValue.replaceAll(
            placeholderRegex,
            (match) => {
              switch (match) {
                case '[tenant_name]': {
                  return get(tenantDetails, 'tenant_name', '');
                }
                case '[email]': {
                  return get(tenantDetails, 'setting.email_address', '');
                }
                case '[phone_number]': {
                  return get(tenantDetails, 'setting.phone', '');
                }
                case '[bussiness_name]': {
                  return get(tenantDetails, 'business_name', '');
                }
                case '[address]': {
                  return `${address1} ${address2} ${districtName} ${pincode} ${stateName} ${country}`;
                }
                default: {
                  return match;
                }
              }
            }
          );
        }
        const blocksFromHtml = htmlToDraft(replacedContent || '');
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        setEditorState(EditorState.createWithContent(contentState));
        setNewEditorState(get(response, 'data[0].document', ''));
        const fieldValues = get(response, 'data[0]', []);
        fieldValues.document_path = get(
          response,
          'data[0].document_path',
          ''
        ).replace('/', '');
        form.setFieldsValue(fieldValues);
        const settings = get(response, 'data[0]', []);
        let fileImage = [];
        if (settings?.icon !== '') {
          map(uploadObject, (item) => {
            item.productImageInfo = { product_image: settings.icon };
          });
          fileImage = [
            {
              name: get(settings, 'icon_name', ''),
              status: 'done',
              url: settings.icon,
            },
          ];
          setIcon(fileImage);
        }

        setLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error.message || FAILED_TO_LOAD });
        setLoading(false);
      });
  }, [documentID, form]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchTourData().then((data) => {
      const policyData = get(data, 'data.[0]');
      const policyDataTour = get(policyData, 'subGuide.[1]');
      const policyDataCompleted = get(policyDataTour, 'completed');
      setOpenTourModal(!policyDataCompleted);
    });
  }, []);

  const onEditorStateChange = (stateValue) => {
    setEditorState(stateValue);
    setNewEditorState(
      draftToHtml(convertToRaw(stateValue.getCurrentContent()))
    );
    setEnableSave(true);
  };

  const onFinish = (fields) => {
    const values = fields;
    if (icon.length > 0) {
      values.icon = icon;
    }
    setButtonLoading(true);
    let formData = {};
    const files = {};
    if (Array.isArray(values.icon) && values.icon.length > 0) {
      const fileData = values.icon.map((item) => item.originFileObj);
      if (fileData) {
        files.file = fileData;
      }
    }
    formData = {
      document_id: documentID,
      document: newEditorState || '',
      is_active: get(documentData, 'is_active', ''),
      document_name: values?.document_name,
      document_path: `/${values?.document_path}`,
      icon,
    };
    if (emoji) {
      setButtonLoading(false);
      return notification.error({
        message: "Emoji's are not allowed",
      });
    }
    updateDocument(formData, files, formData.document_id)
      .then((response) => {
        setButtonLoading(false);
        if (response.success) {
          notification.success({ message: DOCUMENT_UPDATE_SUCCESS });
          if (openTourModal) {
            setOpenTourModal(false);
            setCompleteModal(true);
            setTimeout(() => {
              setCompleteModal(false);
              navigate('/dashboard');
            }, 4000);
          }
          fetchData();
        }
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'error', DOCUMENT_UPDATE_FAILED),
        });
        setButtonLoading(false);
      });
  };

  const onReset = () => {
    const parameters = new URLSearchParams();
    parameters.append('page', 'documentations');

    navigate({
      pathname: '/settings',
      search: parameters.toString(),
    });
  };

  const imageValidator = {
    validator: (rule, value) => {
      if (isEmpty(value)) return Promise.resolve();
      if (
        value &&
        (value[0].type === 'image/svg+xml' || typeof value === 'string')
      ) {
        return Promise.resolve();
      }
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('Please upload a svg file');
    },
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url.slice(Math.max(0, file.url.lastIndexOf('/') + 1))
    );
  };

  const handleOnValuesChange = (changedValues) => {
    if (changedValues) {
      setEnableSave(true);
    }
  };
  const handleImageCol = () => {
    setEnableSave(true);
  };

  const handleSave = () => {
    onFinish(form.getFieldsValue());
    setOpenTourModal(false);
    completeTour();
  };

  const handleNext = () => {
    const presentSteps = currentStep;
    setCurrentStep(presentSteps + 1);
  };

  const steps = [
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            &quot;Add icon for about us page! If you don&apos;t have one, no
            worries; use <b style={{ color: '#0B3D60' }}>Adobe Express</b> to
            design your own! &quot;
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <Button type="primary" onClick={() => handleNext()}>
                Next
              </Button>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.image-upload-container');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            <b style={{ color: '#0B3D60' }}>
              We&apos;ve pre-filled some content to save you time.
            </b>{' '}
            Want to make any changes? Add and just click &apos;save&apos;. your
            policies, your way!
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={previousStep}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={handleSave}
                  disabled={!enableSave}
                >
                  Save
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.editor-container');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
  ];

  const cancelModal = () => {
    setCompleteModal(false);
  };

  const emojiRegex = /\p{Emoji}|:[\w]+:/u;
  const handlePastedText = (text) => {
    if (emojiRegex.test(text)) {
      setButtonLoading(false);
      setEmoji(true);
    }
    return setEmoji(false);
  };
  const handleChange = (value) => {
    const contentState = value.getCurrentContent();
    const plainText = contentState.getPlainText();
    if (emojiRegex.test(plainText)) {
      return setEmoji(true);
    }
    return setEmoji(false);
  };

  return (
    <Spin spinning={loading}>
      <div
        className={
          get(tenantDetails, 'tenant_mode, "') === TENANT_MODE_CLIC &&
          'document-page-editor'
        }
      >
        {mobileView && (
          <div>
            <div className="mt-10">
              <Breadcrumb separator=">" className="breadcrum-settings-main">
                <Breadcrumb.Item className="table-tax">
                  <Link to="/"> Home </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item className="table-tax">
                  <Link to="/settings?page=documentations">Documentations</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Edit Document</Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <SettingsMobileHeading
              heading="Documentation Pages"
              Tooltip="false"
              setScreenState={setEditDocumentModal}
            />
          </div>
        )}
        <div className="mt-10">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              is_active: get(documentData, 'is_active', false),
            }}
            onValuesChange={handleOnValuesChange}
          >
            <div
              style={{ padding: '0px 16px', width: '100%' }}
              className="flex-end"
            >
              <div>
                <Form.Item>
                  <Button type="default" onClick={onReset}>
                    Cancel
                  </Button>
                </Form.Item>
              </div>
              <div style={{ marginLeft: '10px' }}>
                <Form.Item>
                  <Space>
                    <Button
                      loading={buttonLoading}
                      htmlType="submit"
                      type="primary"
                      disabled={!enableSave}
                    >
                      Save
                    </Button>
                  </Space>
                </Form.Item>
              </div>
            </div>
            <Row style={mobileView && { padding: '0px 25px' }}>
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={4}
                xl={4}
                className={mobileView && 'flex-end'}
              >
                {get(tenantDetails, 'tenant_mode', '') ===
                  TENANT_MODE_NORMAL && (
                  <Col span={20} onClick={handleImageCol}>
                    <p className="box-title-text">Icon</p>
                    <Form.Item
                      name="icon"
                      rules={[imageValidator]}
                      className="image-upload-container"
                    >
                      <ImageUploadModal
                        item={uploadObject}
                        uploadObject={uploadObject}
                        setUploadObject={setUploadObject}
                        metaArray={metaArray}
                        setMetaArray={setMetaArray}
                        mobileView={mobileView}
                        visibility="image-only"
                        setFileList={setIcon}
                        handlePreview={handlePreview}
                        fileListState={icon}
                        width={165}
                        height={165}
                        editType={
                          uploadObject[0]?.url?.length > 0 ||
                          uploadObject[0]?.productImageInfo?.product_image
                            ?.length > 0
                        }
                        textValue="settings"
                        openTourModal={openTourModal}
                        setOpenTourModal={setOpenTourModal}
                        setCurrentStep={setCurrentStep}
                        editDocumentModal={editDocumentModal}
                      />
                    </Form.Item>
                  </Col>
                )}
              </Col>
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={
                  get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL
                    ? 20
                    : 24
                }
                xl={
                  get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL
                    ? 20
                    : 24
                }
              >
                <Form.Item
                  name="document_name"
                  label="Document Name"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter your documentation name!',
                    },
                  ]}
                >
                  <Input maxLength={30} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  name="document_path"
                  label="Document Path"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter your documentation path!',
                    },
                    () => ({
                      validator(_, value) {
                        const pattern = /[^\w.\\~-]+/;
                        if (!pattern.test(value)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            'Documentation path can only include ("-", ".", "_", "~") these special characters'
                          )
                        );
                      },
                    }),
                  ]}
                >
                  <Input
                    addonBefore="/"
                    maxLength={30}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Row style={{ width: '100%' }}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <Form.Item className="editor-container">
                    <Editor
                      editorState={editorState}
                      toolbarClassName="toolbarClassName"
                      wrapperClassName="wrapperClassName"
                      editorClassName="editorClassName"
                      onEditorStateChange={onEditorStateChange}
                      handlePastedText={handlePastedText}
                      onChange={() => handleChange(editorState)}
                      toolbar={{
                        options: [
                          'inline',
                          'blockType',
                          'fontSize',
                          'fontFamily',
                          'list',
                          'textAlign',
                          'colorPicker',
                          'link',
                          'embedded',
                          'image',
                          'remove',
                          'history',
                        ],
                        blockType: {
                          inDropdown: true,
                          options: [
                            'Normal',
                            'H1',
                            'H2',
                            'H3',
                            'H4',
                            'H5',
                            'H6',
                            'Blockquote',
                            'Code',
                          ],
                          className: undefined,
                          component: undefined,
                          dropdownClassName: undefined,
                        },
                        image: {
                          uploadEnabled: true,
                          uploadCallback,
                          previewImage: true,
                          inputAccept:
                            'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                          alt: { present: false, mandatory: false },
                          defaultSize: {
                            height: '150px',
                            width: '150px',
                          },
                        },
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Row>
          </Form>
        </div>
      </div>
      <Tour
        open={openTourModal}
        onClose={() => setOpenTourModal(false)}
        steps={steps}
        current={currentStep}
        placement="topRight"
      />
      <Modal
        title={previewTitle}
        open={previewVisible}
        footer={false}
        onCancel={() => {
          setPreviewVisible(false);
        }}
      >
        <img alt={previewImage} style={{ width: '100%' }} src={previewImage} />
      </Modal>
      <Modal
        open={completeModal}
        footer={false}
        maskClosable
        centered
        onCancel={cancelModal}
        closeIcon={false}
        className="milestone-modal-store"
        zIndex={1005}
      >
        <span>
          <ModalBg />
        </span>
        <span>Store policies added successfully</span>
      </Modal>
    </Spin>
  );
}

export default PageEditor;
