import React, { useEffect, useState } from 'react';
import {
  Modal,
  Layout,
  List,
  Form,
  Input,
  Space,
  Button,
  notification,
  Spin,
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { filter, get, map } from 'lodash';
import ImageUploadModal from '../../products/image-modal';
import { trimPayloadFields } from '../../../shared/form-helpers';
import {
  createCustomMedia,
  getSocialMedias,
} from '../../../utils/api/url-helper';
import customAddImg from '../../../assets/icons/custom-add-icon.svg';

const { Header } = Layout;

function AddSocialMedia(properties) {
  const [form] = Form.useForm();
  const {
    socialMediaModel,
    setSocialMediaModel,
    handleUpdateSocialMedia,
    fetchData,
  } = properties;
  const [socialMediaList, setSocialMediaList] = useState([]);
  const [customMedia, setCustomMedia] = useState(false);
  const [uploadObject, setUploadObject] = useState([
    { id: 1, isDisable: true, url: '' },
  ]);
  const [metaArray, setMetaArray] = useState([]);
  const [fileLists, setFileLists] = useState([]);
  const [buttonDisable, setButtonDisable] = useState(false);
  const [loding, setLoding] = useState(false);

  const handleCustomSocialMedia = () => {
    setCustomMedia(true);
  };

  const onCloseSocialMedia = () => {
    setSocialMediaModel(false);
  };

  const onCloseCustomMedia = () => {
    setCustomMedia(false);
  };

  const fetchInitialData = () => {
    getSocialMedias({ is_active: 0 })
      .then((response) => {
        const dataSource = [
          {
            staticItem: true,
            key: 'static-1',
            content: (
              <>
                <img
                  src={customAddImg}
                  alt="add-icon"
                  onClick={() => handleCustomSocialMedia()}
                  aria-hidden
                  className="cursor-pointer"
                />
                <p>Custom</p>
              </>
            ),
          },
          ...get(response, 'data.rows'),
        ];
        setSocialMediaList(dataSource);
      })
      .catch(() => {
        notification.error({ message: 'Failed to get social media details.' });
      });
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSocialMedia = (value) => {
    setSocialMediaModel(false);
    handleUpdateSocialMedia(value);
  };

  const resetValues = () => {
    form.resetFields();
    setButtonDisable(false);
    setFileLists([]);
    map(uploadObject, (item) => {
      item.url = '';
    });
    onCloseSocialMedia();
    onCloseCustomMedia();
  };

  const handleAddSocialMedia = () => {
    return (
      <Layout>
        <Header>
          <div className="coupon-row" style={{ padding: '0px 20px' }}>
            <p>Select social media to add link</p>
            <CloseOutlined
              onClick={() => onCloseSocialMedia()}
              height="2em"
              style={{ color: 'red' }}
            />
          </div>
        </Header>
        <Layout>
          <div style={{ padding: '20px' }}>
            <List
              grid={{
                gutter: 16,
                xs: 5,
                sm: 5,
                md: 5,
                lg: 5,
                xl: 5,
                xxl: 5,
              }}
              dataSource={socialMediaList}
              renderItem={(item, index) => (
                <List.Item key={index}>
                  {index === 0 ? (
                    item?.content
                  ) : (
                    <img
                      src={item?.image}
                      width="50px"
                      height="50px"
                      alt="Social media images"
                      className="cursor-pointer"
                      onClick={() => handleSocialMedia(item)}
                      aria-hidden
                    />
                  )}
                </List.Item>
              )}
            />
          </div>
        </Layout>
      </Layout>
    );
  };

  const onFinishCustomMedia = (values) => {
    setButtonDisable(true);
    setLoding(true);
    const { header } = values;
    const newdata = filter(fileLists, (item) => item.localMedia === true);
    const imageSource = map(newdata, (item) => item);

    const body = {
      social_media_name: header,
      image_source: JSON.stringify([...imageSource]),
      customize: true,
      is_active: 1,
    };
    const file = {
      files: map(fileLists, (item) => item.originFileObj),
    };
    const trimFormValues = {};
    trimPayloadFields(body, trimFormValues);
    createCustomMedia(trimFormValues, file)
      .then((response) => {
        if (response.data.success) {
          setLoding(false);
          notification.success({ message: 'Social media added successfully' });
          resetValues();
          fetchData();
        }
      })
      .catch((error) => {
        notification.error({
          message: get(error, 'message', 'Failed to create social media'),
        });
      });
  };

  const handleClose = () => {
    setFileLists([]);
    map(uploadObject, (item) => {
      item.url = '';
    });
    form.resetFields();
    onCloseCustomMedia();
    setButtonDisable(false);
  };

  const handleCustomMedia = () => {
    return (
      <Layout>
        <Header>
          <div className="coupon-row" style={{ padding: '0px 20px' }}>
            <p>Select social media to add link</p>
            <CloseOutlined
              onClick={() => onCloseCustomMedia()}
              height="2em"
              style={{ color: 'red' }}
            />
          </div>
        </Header>
        <Layout>
          <div style={{ padding: '20px' }}>
            <Form form={form} layout="vertical" onFinish={onFinishCustomMedia}>
              <div>
                <Form.Item name="image">
                  <ImageUploadModal
                    item={uploadObject}
                    uploadObject={uploadObject}
                    setUploadObject={setUploadObject}
                    metaArray={metaArray}
                    setMetaArray={setMetaArray}
                    mobileView={false}
                    visibility="image-only"
                    setFileList={setFileLists}
                    fileListState={fileLists}
                    width={200}
                    height={185}
                    editType={
                      uploadObject[0]?.url?.length > 0 ||
                      uploadObject[0]?.productImageInfo?.product_image?.length >
                        0
                    }
                  />
                </Form.Item>
                <Form.Item
                  label="Header"
                  name="header"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter header',
                    },
                  ]}
                >
                  <Input placeholder="Enter Header" />
                </Form.Item>
              </div>
              <Space className="flex-end">
                <Button danger type="default" onClick={() => handleClose()}>
                  Cancel
                </Button>
                <Button
                  htmlType="submit"
                  disabled={buttonDisable}
                  type="primary"
                >
                  Save
                </Button>
              </Space>
            </Form>
          </div>
        </Layout>
      </Layout>
    );
  };

  return (
    <Spin spinning={loding}>
      <div>
        <Modal
          open={socialMediaModel}
          footer={false}
          className="upload-modal-main-social"
          width={650}
          closable={false}
          centered
        >
          {handleAddSocialMedia()}
        </Modal>
        <Modal
          open={customMedia}
          footer={false}
          className="upload-modal-main-social"
          width={650}
          closable={false}
          centered
        >
          {handleCustomMedia()}
        </Modal>
      </div>
    </Spin>
  );
}

export default AddSocialMedia;
