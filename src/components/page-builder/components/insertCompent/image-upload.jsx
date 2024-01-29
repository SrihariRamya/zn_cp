import React, { useEffect, useState } from 'react';
import { Modal, Button, Upload, Spin, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import _, { filter, forEach, get, map } from 'lodash';
import { v4 as uuid } from 'uuid';
import { getcategoryProducts } from '../../../../utils/api/url-helper';
import { FAILED_TO_LOAD } from '../../../../shared/constant-values';
import ImgeUploadItem from './image-upload-item';

const customRequest = ({ file, onSuccess, onError }) => {
  if (file.type === 'image/jpeg') {
    onSuccess(file);
  } else {
    onError('Only JPEG files are allowed!');
  }
};

function ImageUploadModal(properties) {
  const { visible, onCancel, onUpload, editFileList, from } = properties;
  const [banners, setBanners] = useState([]);
  const [loader, setLoader] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [selectedBanners, setSelectedBanners] = useState([]);

  const fetchData = () => {
    setLoader(true);
    getcategoryProducts()
      .then((response) => {
        if (response) {
          const products = [];
          forEach(_.get(response, 'data', []), (data) => {
            forEach(_.get(data, 'productList', []), (product) => {
              products.push(product);
            });
            forEach(_.get(data, 'sub_category', []), (item) => {
              forEach(_.get(item, 'productList', []), (list) => {
                products.push(list);
              });
            });
          });
          setCategoryData(_.get(response, 'data', []));
          setProductData(products);
          setLoader(false);
        }
      })
      .catch((error) => {
        setLoader(false);
        notification.error({ message: error?.error || FAILED_TO_LOAD });
      });
  };

  useEffect(() => {
    setBanners(editFileList || []);
    setSelectedBanners(editFileList || []);
    if (visible) {
      fetchData();
    }
  }, [visible]);

  const handleFileChange = ({ fileList: files }) => {
    const newInsertBanner = banners;
    newInsertBanner.push({
      id: uuid(),
      file: get(files, '[0].originFileObj', {}),
      action: {},
    });
    const data = map(newInsertBanner, (value) => {
      return {
        id: value?.id,
        action: value.action || {},
        ...value,
      };
    });
    setBanners(data);
    setSelectedBanners(data);
  };

  const handleUpload = () => {
    if (selectedBanners.length <= 10 && selectedBanners.length > 0) {
      onCancel();
      onUpload(selectedBanners);
      setBanners([]);
    }
  };

  const handleRowDelete = (value) => {
    const deleteBanner = filter(banners, (item) => item?.id !== value?.id);
    setBanners(deleteBanner);
    setSelectedBanners(deleteBanner);
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button
          key="back"
          onClick={() => {
            onCancel();
            setBanners([]);
          }}
        >
          Cancel
        </Button>,
        <Button key="upload" type="primary" onClick={handleUpload}>
          Upload
        </Button>,
      ]}
      width={900}
      destroyOnClose
    >
      <Spin spinning={loader}>
        {banners.length > 0 && !loader > 0 && (
          <div className="carousel-image-list-container">
            {map(banners, (banner) => {
              return (
                <div className="image-content-container">
                  <ImgeUploadItem
                    products={productData}
                    categories={categoryData}
                    handleRowDelete={handleRowDelete}
                    banner={banner}
                    setSelectedBanners={setSelectedBanners}
                    selectedBanners={selectedBanners}
                    from={from}
                  />
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-10">
          <Upload
            customRequest={customRequest}
            listType="picture-card"
            onChange={handleFileChange}
            beforeUpload={() => false}
            className="custom-upload"
            onPreview={false}
            accept="image/*"
            maxCount={1}
          >
            <div className="upload-content">
              <PlusOutlined />
              <div>Upload</div>
            </div>
          </Upload>
        </div>
      </Spin>
    </Modal>
  );
}

export default ImageUploadModal;
