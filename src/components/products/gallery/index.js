import React, { useState, useEffect } from 'react';
import {
  Breadcrumb,
  Space,
  Upload,
  List,
  Button,
  Row,
  Card,
  Image,
  Checkbox,
  Spin,
  notification,
} from 'antd';
import {
  PlusOutlined,
  DownloadOutlined,
  FileImageOutlined,
  GoogleOutlined,
} from '@ant-design/icons';
import { get, isEmpty, map, debounce } from 'lodash';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getGalleryImage,
  createGallery,
  deleteGallery,
} from '../../../utils/api/url-helper';
import GoogelPhotos from './google-photos';

function ImageGallery() {
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadedImage, setUploadedImage] = useState([]);
  const [selectedKey, setSelectedKey] = useState('local');
  const [open, setOpen] = useState(false);
  const history = useNavigate();
  const location = useLocation();
  const fetchData = () => {
    const activeKey = isEmpty(get(location, 'search', ''))
      ? 'local'
      : get(location, 'search', '');
    if (activeKey.slice(1) === 'google') {
      setSelectedKey(activeKey.slice(1));
      setLoading(false);
    } else {
      getGalleryImage()
        .then((resp) => {
          if (resp.success) {
            setPreviewImages(get(resp, 'data', []));
            setUploadedImage([]);
            setLoading(false);
          }
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  const handleUpload = debounce(async (file) => {
    setLoading(true);
    setOpen(false);
    const getdata = get(file, 'fileList', {});
    const files = await {
      files: map(getdata, (item) => item.originFileObj),
    };
    if (isEmpty(uploadedImage)) {
      await setUploadedImage(files);
    }
  }, 100);

  const toggleOpen = () => {
    setOpen(!open);
  };

  const onChangeCheckbox = async (event, value) => {
    const { checked } = event.target;
    if (checked === true) {
      value.localMedia = true;
      setSelectedFiles([...selectedFiles, value]);
    } else {
      const findIndexValue = selectedFiles.findIndex(
        (item) => item.image_uid === value.image_uid
      );
      selectedFiles.splice(findIndexValue, 1);
      setSelectedFiles([...selectedFiles]);
    }
  };

  const handleDelete = () => {
    setLoading(true);
    const id = map(selectedFiles, (item) => item.image_uid);
    const parameters = {
      image_uid: id,
    };
    deleteGallery(parameters)
      .then((response) => {
        if (response.success) {
          setLoading(false);
          setUploadedImage([]);
          setSelectedFiles([]);
          fetchData();
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isEmpty(uploadedImage)) {
      createGallery('file', uploadedImage)
        .then(() => {
          setUploadedImage([]);
          setLoading(false);
          fetchData();
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [uploadedImage]);

  const onGalleryClick = (key) => {
    setSelectedKey(key);
    setSelectedFiles([]);
    setUploadedImage([]);
    history({
      pathname: '/gallery',
      search: key,
    });
  };

  return (
    <>
      {selectedKey === 'local' && (
        <div className="search-container">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>
                <DownloadOutlined />
                Import from local Images
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      )}
      {open && (
        <Row className="FAB-container">
          <Button
            className="google-photo"
            onClick={() => onGalleryClick('google')}
          >
            <GoogleOutlined /> Add Google Photos to gallery
          </Button>
          <Upload
            name="image"
            accept="image/*"
            onChange={handleUpload}
            showUploadList={false}
            multiple
          >
            <Button
              className="FAB-option"
              onClick={() => onGalleryClick('local')}
            >
              <FileImageOutlined /> Add photos from local to gallery
            </Button>
          </Upload>
        </Row>
      )}
      <div className="upload-bg" onClick={toggleOpen} aria-hidden="true">
        <PlusOutlined />
      </div>
      {loading ? (
        <div className="title-property">
          <Spin />
        </div>
      ) : (
        <>
          {selectedKey === 'google' && <GoogelPhotos />}
          {selectedKey === 'local' && (
            <div className="box promote-product-list-container">
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 5, xxl: 3 }}
                dataSource={previewImages}
                renderItem={(value) => (
                  <List.Item>
                    <Card hoverable className="gallery-card">
                      <div className="img-container">
                        <div
                          style={{
                            position: 'absolute',
                            top: '5px',
                            left: '5px',
                            zIndex: '99',
                          }}
                        >
                          <Checkbox
                            shape="circle"
                            onChange={(event) => onChangeCheckbox(event, value)}
                          />
                        </div>
                        <Image
                          preview={false}
                          src={value.image_url}
                          alt={value.name}
                        />
                      </div>
                      <Button
                        disabled={selectedFiles.length}
                        type="primary"
                        className="mt-10"
                        style={{ width: '100%' }}
                        onClick={() =>
                          history('/products/add-product', { state: { value } })
                        }
                      >
                        Add to Products
                      </Button>
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          )}
        </>
      )}
      {selectedFiles.length > 0 && (
        <div className="gallery-footer">
          <Button type="danger" danger onClick={handleDelete}>
            Delete
          </Button>
          <Button
            type="primary"
            onClick={() =>
              selectedFiles.length > 7
                ? notification.error({
                    message: 'Please Select less than 8 images',
                  })
                : history('/products/add-product', { state: { selectedFiles } })
            }
          >
            ADD TO PRODUCT
          </Button>
        </div>
      )}
    </>
  );
}
export default ImageGallery;
