/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable  */
import React, { useState, useContext, useEffect } from "react";
import SerpPreview from "react-serp-preview";
import { Row, Input, Modal, Collapse, Col } from "antd";
import { get, isEmpty } from "lodash";
import { TenantContext } from "../../context/tenant-context";
import { CustomUpload } from "../../../shared/form-helpers";
import { getBase64 } from "../../../shared/attributes-helper";
import { onBeforeUpload } from "../../../shared/image-validation";

const { Panel } = Collapse;

const SeoCustomization = ({
  seoProperties,
  setSeoProperties,
  setFileList,
  fileListState,
}) => {
  const { TextArea } = Input;
  const [tenantDetails, , , tenantConfig] = useContext(TenantContext);
  const [imgUrl, setImgUrl] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [, setFileUploadCount] = useState(0);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
      setPreviewTitle(
        file.name || file.url.substring(file.url.lastIndexOf("/") + 1),
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
      const imageName = get(seoProperties, "seo_preview_image", "")
        ? get(seoProperties, "seo_preview_image", "").split("/")
        : "";
      const imageData = get(seoProperties, "seo_preview_image", "")
        ? [
            {
              url: get(seoProperties, "seo_preview_image", ""),
              status: "done",
              name: get(seoProperties, "seo_preview_image", ""),
            },
          ]
        : [];
      setFileList(imageData);
      setPreviewTitle(imageName && imageName[imageName.length - 1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="appearance-properties">
      <div className="header-text">SEO Properties</div>
      <div>
        <Collapse collapsible defaultActiveKey={["1"]}>
          <Panel header="Details" key="1">
            <Row>
              <Col span={8}>
                <div className="mtb-10">Title</div>
              </Col>
              <Col span={16}>
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
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <div className="mtb-10">Description</div>
              </Col>
              <Col span={16}>
                <TextArea
                  placeholder="Meta Description"
                  className="mt-10"
                  value={seoProperties?.seo_description}
                  onChange={(event) => {
                    setSeoProperties({
                      ...seoProperties,
                      seo_description: event.target.value,
                    });
                  }}
                />
              </Col>
            </Row>
            <Row className="mt-10">
              <Col span={8}>
                <div className="mtb-10">Image</div>
              </Col>
              <Col span={16}>
                <CustomUpload
                  setFileList={setFileList}
                  fileListState={fileListState}
                  beforeUpload={(file) => onBeforeUpload(file, fileListState)}
                  handlePreview={handlePreview}
                  setFileUploadCount={setFileUploadCount}
                  width={200}
                  height={200}
                  maxItem={1}
                />
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </div>
      <div className="mt-10">
        <Collapse defaultActiveKey={["1"]}>
          <Panel header="View" key="1">
            <SerpPreview
              title={seoProperties?.seo_title || "Page Title"}
              metaDescription={
                seoProperties?.seo_description || "Meta Description"
              }
              url={`${get(tenantDetails, "customer_url", "")}${
                seoProperties?.document_path || "Page"
              }`}
              width="600"
            />
          </Panel>
        </Collapse>
      </div>
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={closeImage}
      >
        <img alt={previewTitle} style={{ width: "100%" }} src={imgUrl} />
      </Modal>
    </div>
  );
};

export default SeoCustomization;
