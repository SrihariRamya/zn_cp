import { Col, Modal, Collapse, Input } from 'antd';
import { get, isEmpty } from 'lodash';
import React, { useState, useContext, useEffect } from 'react';
import SerpPreview from 'react-serp-preview';
import { onBeforeUpload } from '../../../shared/image-validation';
import { getBase64 } from '../../../shared/attributes-helper';
import { CustomUpload } from '../../../shared/form-helpers';
import { TenantContext } from '../../context/tenant-context';
import { useComponentContext } from '../context/components';

const { Panel } = Collapse;

function SeoComponent() {
  const { seoProperties, setSeoProperties } = useComponentContext();
  const { TextArea } = Input;
  const [fileList, setFileList] = useState([]);
  const tenantConfig = useContext(TenantContext)[3];
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileUploadCount, setFileUploadCount] = useState(0);
  const [imgUrl, setImgUrl] = useState(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
      setPreviewTitle(
        file.name || file.url.slice(Math.max(0, file.url.lastIndexOf('/') + 1))
      );
    }
    setImgUrl(file.url || file.preview);
    setPreviewVisible(true);
  };

  const closeImage = () => {
    setPreviewVisible(false);
  };

  useEffect(() => {
    if (!isEmpty(seoProperties)) {
      const imageName = get(seoProperties, 'seo_preview_image', '')
        ? get(seoProperties, 'seo_preview_image', '').split('/')
        : '';
      const imageData = get(seoProperties, 'seo_preview_image', '')
        ? [
            {
              url: get(seoProperties, 'seo_preview_image', ''),
              status: 'done',
              name: get(seoProperties, 'seo_preview_image', ''),
            },
          ]
        : [];
      setFileList(imageData);
      if (imageName) setPreviewTitle(imageName.at(-1));
    }
  }, []);

  const handleOnchange = (value) => {
    setFileList(value);
    const insertNew = seoProperties;
    insertNew.seo_preview_image = '';
    insertNew.file = value;
    setSeoProperties(insertNew);
  };

  return (
    <Col span={6} className="drawer-content text-center">
      <h2
        style={{ color: '#6E56EC', background: '#F5F7FD', padding: '20px' }}
        className="text-center"
      >
        SEO
      </h2>
      <div className="appearance-properties page-builder-seo-container">
        <div className="header-text">SEO Properties</div>
        <div>
          <Collapse collapsible defaultActiveKey={['1']}>
            <Panel header="Details" key="1">
              <div className="mtb-10">
                <div>Title</div>
                <Input
                  placeholder="Page Title"
                  value={seoProperties?.seo_title}
                  onChange={(event) => {
                    setSeoProperties({
                      ...seoProperties,
                      seo_title: event.target.value,
                    });
                  }}
                />
              </div>
              <div className="mtb-10">
                <div>Description</div>
                <TextArea
                  placeholder="Meta Description"
                  value={seoProperties?.seo_description}
                  onChange={(event) => {
                    setSeoProperties({
                      ...seoProperties,
                      seo_description: event.target.value,
                    });
                  }}
                />
              </div>
              <div className="mt-10">
                <div>Image</div>
                <CustomUpload
                  setFileList={handleOnchange}
                  fileListState={fileList}
                  beforeUpload={(file) => onBeforeUpload(file, fileList)}
                  handlePreview={handlePreview}
                  setFileUploadCount={setFileUploadCount}
                  fileUploadCount={fileUploadCount}
                  width={200}
                  height={200}
                  maxItem={1}
                />
              </div>
            </Panel>
          </Collapse>
        </div>
        <div className="mt-10">
          <Collapse defaultActiveKey={['1']}>
            <Panel header="View" key="1">
              <SerpPreview
                title={seoProperties?.seo_title || 'Page Title'}
                metaDescription={
                  seoProperties?.seo_description || 'Meta Description'
                }
                url={`${get(tenantConfig, 'customer_url', '')}${
                  seoProperties?.document_path || 'Page'
                }`}
                width="600"
              />
            </Panel>
          </Collapse>
        </div>
        <Modal
          open={previewVisible}
          title={previewTitle}
          footer={undefined}
          onCancel={closeImage}
        >
          <img alt={previewTitle} style={{ width: '100%' }} src={imgUrl} />
        </Modal>
      </div>
    </Col>
  );
}
export default SeoComponent;
