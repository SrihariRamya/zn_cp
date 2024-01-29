import React, { useEffect, useState, useContext } from 'react';
import {
  Modal,
  Button,
  Upload,
  notification,
  Row,
  Col,
  Typography,
  Tooltip,
  Tour,
} from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  map,
  get,
  uniq,
  sortBy,
  countBy,
  has,
  findIndex,
  groupBy,
  filter,
  isEmpty,
  size,
} from 'lodash';
import { useNavigate } from 'react-router-dom';
import {
  BulkUploadData,
  getBulkDownload,
  putOnboardSubGuide,
} from '../../utils/api/url-helper';
import { ExcelUpload } from '../../shared/excel';
import { validateProductImage } from '../../shared/image-validation';
import { MilestoneContext } from '../context/milestone-context';
import {
  shapeImage,
  eventTrack,
  dummyRequest,
} from '../../shared/function-helper';
import {
  FILE_TYPE_IMAGE,
  FILE_TYPE_SHEET,
  UPLOAD_FORMAT_ERROR,
} from '../../shared/constant-values';
import { ReactComponent as UploadIcon } from '../../assets/icons/upload-icon.svg';
import { ReactComponent as DeleteIcon } from '../../assets/images/delete-icon.svg';
import { DeleteAlert } from '../../shared/sweetalert-helper';
import { ReactComponent as FileIcon } from '../../assets/icons/file-icon.svg';
import { ReactComponent as ImageIcon } from '../../assets/icons/image-icon.svg';
import { ReactComponent as SheetIcon } from '../../assets/icons/sheet-icon.svg';

import { ReactComponent as Group } from '../../assets/Group.svg';

const { Text } = Typography;

const { Dragger } = Upload;

let globalUploadErrorList = [];

const downloadExcel = async () => {
  getBulkDownload()
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bulkupload.xlsx');
      document.body.append(link);
      link.click();
    })
    .catch(() => {
      notification.error({
        message: 'Failed to download order details',
      });
    });
};

function BulkUpload(properties) {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [imageFileList, setImageFileList] = useState([]);
  const [enable, setEnable] = useState(false);
  const [isValidate, setIsValidate] = useState(false);
  const [validate, setValidate] = useState([]);
  const [imgValidate, setImgValidate] = useState(true);
  const [isUploaded, setIsUploaded] = useState(true);
  const [isImageUploaded, setIsImageUploaded] = useState(true);

  const [openTourModal, setOpenTourModal] = useState(false);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [completeModal, setCompleteModal] = useState(false);
  const [dragStop, setDragStop] = useState(false);

  const { fetchData, visible, mobileView } = properties;

  const navigate = useNavigate();
  const { onBoardData, fetchTourData } = useContext(MilestoneContext);

  const showModal = (values) => {
    if (values === 'handlePrev') {
      properties.setVisible(false);
    }
    if (openTourModal) {
      setOpenTourModal(false);
      setCurrentSteps(1);
      setTimeout(() => {
        setOpenTourModal(true);
      }, 1000);
    }
    properties.setVisible(true);
    const parameter = {
      value: 'Bulk Upload',
    };
    eventTrack('Bulk Upload Click', parameter);
  };
  const fileResponse = (response) => {
    const categoryDetails = get(response, '[1]', []);
    const productDetails = get(response, '[0]', []).map((item) => {
      return {
        product_id: item['Product Id'],
        image_map_id: item['Image Map Id'],
        product_name: item['Product Name'],
        product_brand: item['Product Brand (Optional)'],
        category_name: item['Category Name'],
        sub_category_name: item['SubCategory Name (Optional)'],
        text_content: item['Description (Optional)'],
        gst: item['Gst (Optional)'],
        key_features: item['Key Features (Optional)'],
        shelf_life: item['Shelf Life (Optional)'],
        manufacturer_details: item['Manufacturer Details (Optional)'],
        marketed_by: item['Marketed By (Optional)'],
        country_of_origin: item['Country of Origin (Optional)'],
        seller: item['Seller (Optional)'],
        product_code: item['Product Code (Optional)'],
        option_1_name: item['Option1 Name'],
        option_1_value: item['Option1 Value'],
        option_2_name: item['Option2 Name'],
        option_2_value: item['Option2 Value'],
        option_3_name: item['Option3 Name'],
        option_3_value: item['Option3 Value'],
        'Color Code': item['Color Code (Optional)'],
        'MRP Price': item['MRP Price (Optional)'],
        'Selling Price': item['Selling Price'],
        'Discount in %': item['Discount in % (Optional)'],
        'Discount Amount': item['Discount in ₹ (Optional)'],
        'Manufacture date': item['Manufacture date (Optional)'],
      };
    });
    setExcelData([productDetails, categoryDetails]);
  };
  const handleUpload = (file) => {
    const { LIST_IGNORE } = Upload;
    const uploadFormat = get(file, 'name', '').split('.')[1];
    const acceptedFormats = ['xlsx', 'xls', 'csv'];
    const isAcceptedFormats = acceptedFormats.includes(uploadFormat);
    if (!isAcceptedFormats) {
      notification.error({ message: UPLOAD_FORMAT_ERROR });
      setFileList([]);
      setIsUploaded(true);
    }
    setIsUploaded(false);
    ExcelUpload(file, fileResponse);
    return isAcceptedFormats || LIST_IGNORE;
  };
  const accumulatedFiles = [];
  const onBeforeUploads = (file, fileListState) => {
    accumulatedFiles.push(file);
    const rootFolderNameCheck = get(file, 'webkitRelativePath', '').split('/');
    if (
      accumulatedFiles.at(-1).name === file.name &&
      globalUploadErrorList.length > 0
    ) {
      setImageFileList([]);
      notification.error({
        description: 'The root folder name should be ProductImages',
      });
      globalUploadErrorList = [];
    }
    if (get(rootFolderNameCheck, '[0]', '') !== 'ProductImages') {
      globalUploadErrorList = [...globalUploadErrorList, file];
      return false;
    }
    const fileIndex = findIndex(
      fileListState,
      (item) => (item.name || get(item, 'originFileObj.name', '')) === file.name
    );
    const isDuplicate = !!(fileIndex >= 0 && fileListState.length > 0);
    if (isDuplicate) {
      return notification.error({ description: 'Duplicate file.' });
    }

    shapeImage(file, accumulatedFiles, imgValidate, setImageFileList);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('load', async () => {
        const img = document.createElement('img');
        img.src = reader.result;
        img.addEventListener('load', () => {
          Object.assign(file, {
            width: img.naturalWidth,
            heigth: img.naturalHeight,
          });
          const validationStatus = validateProductImage(file);
          validationStatus.then((response) => {
            if (response) {
              setImgValidate(true);
              setIsImageUploaded(false);

              resolve();
            } else {
              setImgValidate(false);
              setIsImageUploaded(true);
              setImageFileList([]);
              reject();
            }
          });
        });
      });
    });
  };

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const tourData = await onBoardData;
        const tourValues = get(tourData, 'data.[2].subGuide');
        const bulkuploadData = get(tourValues, '[2].completed');
        setDragStop(!bulkuploadData);
        if (!mobileView) {
          setTimeout(() => {
            setOpenTourModal(!bulkuploadData);
          }, 1000);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching data:', error);
      }
    };
    fetchTour();
  }, []);

  useEffect(() => {
    if (dragStop) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [dragStop, openTourModal]);

  const handleSkip = (values) => {
    if (openTourModal && values === 'complete') {
      putOnboardSubGuide({
        completed: true,
        slug: 'bulk-product',
      });
    }
    setOpenTourModal(false);
    setDragStop(false);
    fetchTourData();
  };

  const handleNext = () => {
    const current = currentSteps;
    setCurrentSteps(current + 1);
  };

  const handlePrevious = (values) => {
    if (values === 'closeModal' && visible) {
      showModal('handlePrev');
    }
    const current = currentSteps;
    setCurrentSteps(current - 1);
  };

  const handleShowbulkUpload = () => {
    setOpenTourModal(false);
    showModal();
    setTimeout(() => {
      setCurrentSteps(1);
      setOpenTourModal(true);
    }, 500);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    await BulkUploadData({}, validate)
      .then(async () => {
        if (openTourModal) {
          await putOnboardSubGuide({
            completed: true,
            slug: 'bulk-product',
          });
          setOpenTourModal(false);
          setTimeout(() => {
            setCompleteModal(true);
            fetchTourData();
          }, 1000);
          setTimeout(() => {
            setCompleteModal(false);
            navigate('/dashboard');
          }, 4000);
        }
        setConfirmLoading(false);
        fetchData();
        properties.setVisible(false);
        setFileList([]);
        setImageFileList([]);
        setExcelData([]);
        notification.success({
          message: 'Data has been successfully uploaded',
        });
        setEnable(false);
      })
      .catch((error_) => {
        setConfirmLoading(false);
        notification.error({
          message: error_.message || 'Some error occurred while uploading',
        });
      });
  };

  const steps = [
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Let&apos;s start with uploading here. Please click the &quot; Bulk
            Upload&quot; Button to get started
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button
                className="skip-btn-tour"
                onClick={() => handleSkip('complete')}
              >
                Skip for now
              </Button>
              <Button
                style={{ width: '100px' }}
                type="primary"
                onClick={handleShowbulkUpload}
              >
                Bulk Upload
              </Button>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.bulk-upload-button');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Click &apos;Download Template&apos; to get a preformatted file. Fill
            in your product information following the given format example. Once
            done, Click next.
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button
                  type="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('#bulk-download-template');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            &quot;Ready to upload your product file? Select the file you&apos;ve
            filled in and simply upload / drag it into this area. It&apos;s
            quick and hassle-free, ensuring accuracy in your product
            listings.&quot;
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={handlePrevious}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.tour-gutter');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Ready to showcase your product? Click to upload Image file. Images
            make your product stand out. Ensure you provide clear and appealing
            photos. It&apos;s the second step to attract your customers.
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={handlePrevious}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.imageboxTour');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            &quot;Let&apos;s ensure everything&apos;s in order. Click
            &apos;Validate&apos; to double-check your data.&quot;
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <div>
                <Button onClick={handlePrevious}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('#bulk-file-Validate');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            Click &apos;Import&apos; to bring your products to life on our
            platform.
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button
                className="skip-btn-tour"
                onClick={() => handleSkip('complete')}
              >
                Skip
              </Button>
              <div>
                <Button onClick={handlePrevious}>Previous</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={handleOk}
                  disabled={!enable}
                >
                  Import
                </Button>
              </div>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('#bulk-import');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
  ];

  const cancelModal = () => {
    setCompleteModal(false);
  };

  const handleValidate = async () => {
    setIsValidate(true);
    if (fileList.length === 0) {
      setIsValidate(false);
      return notification.error({ message: 'Upload the product list file' });
    }
    if (
      !has(excelData, '[0][0].product_name', '') ||
      !has(excelData, '[0][0].category_name', '') ||
      !has(excelData, '[0][0].Selling Price', '')
    ) {
      setIsValidate(false);
      return notification.error({
        message: 'Please fill the Product Detail Sheet',
      });
    }
    map(get(excelData, '[0]'), (item, index) => {
      let row = 1;
      row += index + 1;
      if (
        item['MRP Price'] &&
        item['Selling Price'] &&
        item['MRP Price'] < item['Selling Price']
      ) {
        setIsValidate(false);
        return notification.error({
          message: `Row ${row}: Selling Price should not be greater than MRP`,
        });
      }
      return item;
    });

    const productNameCheck = [];
    const validateProducts = get(excelData, '[0]', []).every((excel) => {
      if (
        excel.product_name &&
        excel.category_name &&
        excel['Selling Price'].toString().length > 0
      )
        return true;

      if (!excel.product_name) productNameCheck.push('product_name');
      if (!excel.category_name) productNameCheck.push('category_name');
      if (!excel['Selling Price']) productNameCheck.push('Selling Price');
      return false;
    });
    if (!validateProducts) {
      setIsValidate(false);
      return notification.error({
        message: `Please check the ${productNameCheck.join(',')} field(s)`,
      });
    }

    const categoryCheck = sortBy(map(get(excelData, '[1]', []), 'category'));
    if (categoryCheck.length !== uniq(categoryCheck).length) {
      setIsValidate(false);
      return notification.error({ message: `Duplicate Category Name` });
    }

    const uniqProduct = groupBy(get(excelData, '[0]', ''), 'product_name');
    const EmptyValues = [];
    const orderValues = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(uniqProduct)) {
      // eslint-disable-next-line array-callback-return, consistent-return
      value.every((excel) => {
        if (
          (excel.option_1_name && !excel.option_1_value) ||
          (!excel.option_1_name && excel.option_1_value) ||
          (excel.option_2_name && !excel.option_2_value) ||
          (!excel.option_1_name && excel.option_1_value) ||
          (excel.option_3_name && !excel.option_3_value) ||
          (!excel.option_1_name && excel.option_1_value)
        )
          EmptyValues.push(key);
        if (
          (!excel.option_1_name &&
            !excel.option_1_value &&
            excel.option_2_name &&
            excel.option_2_value) ||
          (!excel.option_2_name &&
            !excel.option_2_value &&
            excel.option_3_name &&
            excel.option_3_value) ||
          (!excel.option_1_name &&
            !excel.option_1_value &&
            excel.option_3_name &&
            excel.option_3_value) ||
          (excel.option_1_name &&
            !excel.option_2_name &&
            excel.option_3_name) ||
          (excel.option_1_value &&
            !excel.option_2_value &&
            excel.option_3_value)
        )
          orderValues.push(key);
      });
    }

    if (EmptyValues.length > 0) {
      setIsValidate(false);
      return notification.error({
        message: `Product name - ${uniq(EmptyValues)} has empty options/values`,
      });
    }
    if (orderValues.length > 0) {
      setIsValidate(false);
      return notification.error({
        message: `Product name - ${uniq(
          orderValues
        )} has unordered options/values`,
      });
    }

    const imageSource = imageFileList.map((item) => {
      return get(item, 'name', '').split('-')[0];
    });

    const countImage = countBy(imageSource);

    // eslint-disable-next-line no-restricted-syntax
    for (const key in countImage) {
      if (countImage[key] > 7) {
        setConfirmLoading(false);
        setIsValidate(false);
        return notification.error({
          message: `${key} Product has more than 7 images`,
        });
      }
    }

    const files = {
      sheet: [fileList[0].originFileObj],
      Images: [...map(imageFileList)],
    };
    setValidate(files);
    await BulkUploadData({ forceTrue: true }, files)
      .then((response) => {
        if (get(response, 'data.success', '')) {
          notification.success({
            message: 'Validation success',
          });
          setEnable(true);
          setIsValidate(false);
        } else {
          setIsValidate(false);
          notification.error({
            message: get(response, 'data.message', ''),
          });
        }
      })
      .catch((error_) => {
        setConfirmLoading(false);
        setIsValidate(false);
        notification.error({
          message: error_.message || 'Some error occurred while uploading ',
        });
      });
    return true;
  };

  const handleFileList = ({ fileList: fileListName }) => {
    setFileList(fileListName);
    if (fileListName) {
      setEnable(false);
      setIsValidate(false);
    }
  };
  const handleRemove = (data) => {
    const text = 'Are you sure you want to delete this product image/video?';
    const result = DeleteAlert(text);
    if (result.isConfirmed) {
      const index = imageFileList.indexOf(data);
      const newFileList = [...imageFileList];
      newFileList.splice(index, 1);
      return setImageFileList(newFileList);
    }
    return '';
  };
  const handleCancel = () => {
    setFileList([]);
    setExcelData([]);
    setImageFileList([]);
    setConfirmLoading(false);
    setIsValidate(false);
    setEnable(false);
    setIsUploaded(true);
    setIsImageUploaded(true);
  };
  const handleClose = () => {
    setFileList([]);
    setExcelData([]);
    setImageFileList([]);
    setIsUploaded(true);
    setIsImageUploaded(true);
    properties.setVisible(false);
  };

  const downloadTemplate = () => {
    return (
      <Button
        icon={<DownloadOutlined />}
        onClick={downloadExcel}
        style={{ float: 'left' }}
        id="bulk-download-template"
        type="text"
        className="bulk-download-btn"
      >
        Download Template
      </Button>
    );
  };

  const handleDelete = (index, key) => {
    if (key === FILE_TYPE_IMAGE) {
      const updatedFiles = filter(
        imageFileList,
        (_, index_) => index_ !== index
      );
      setImageFileList(updatedFiles);
      if (isEmpty(updatedFiles)) {
        setIsImageUploaded(true);
      }
    } else if (key === FILE_TYPE_SHEET) {
      const sheetFiles = filter(fileList, (_, index_) => index_ !== index);
      setFileList(sheetFiles);
      if (isEmpty(sheetFiles)) {
        setIsUploaded(true);
      }
    }
  };

  const fileListRender = () => {
    return (
      <div className="back-arrow">
        <Row>
          <Col span={24}>
            <FileIcon className="file-list-icon" />
          </Col>
          <Col span={24}>
            {map(fileList, (item, index) => (
              <div key={index} className="file-list-align">
                <Row className="d-flex file-name-text">
                  <Col span={2}>
                    <SheetIcon className="mt-10" />
                  </Col>
                  <Col span={10}>
                    <Tooltip title={item?.name}>
                      <div className="ellipse-div">
                        <Text>{item?.name}</Text>
                      </div>
                    </Tooltip>
                  </Col>
                  <Col span={4} className="back-arrow">
                    <DeleteIcon
                      onClick={() => handleDelete(index, FILE_TYPE_SHEET)}
                    />
                  </Col>
                </Row>
              </div>
            ))}
          </Col>
        </Row>
      </div>
    );
  };

  const imageFileListRender = () => {
    return (
      <Row className="images-list-row">
        <Col span={24}>
          <Text className="upload-image-title">{`Uploading images ${size(
            imageFileList
          )}`}</Text>
        </Col>
        <Col span={24}>
          <div className="image-list">
            {map(imageFileList, (item, index) => (
              <div key={index} className="file-list-align">
                <Row className="file-name-text">
                  <Col span={2}>
                    <ImageIcon className="mt-10" />
                  </Col>
                  <Col span={10}>
                    <Tooltip title={item?.name}>
                      <div className="ellipse-div">
                        <Text>{item?.name}</Text>
                      </div>
                    </Tooltip>
                  </Col>
                  <Col span={4} className="back-arrow">
                    <DeleteIcon
                      onClick={() => handleDelete(index, FILE_TYPE_IMAGE)}
                    />
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    );
  };
  return (
    <div className="mobile-flote-none">
      <Button
        type="primary"
        onClick={() => showModal()}
        className="product-primary-btn mobile-full-width bulk-upload-button"
        id="add-bulk-product-btn"
      >
        <PlusOutlined /> Bulk Upload
      </Button>
      <Modal
        title="Bulk Upload"
        okText="Import"
        open={visible}
        onCancel={handleClose}
        maskClosable={false}
        className="product-bulk-modal product-bulk-upload-model"
        zIndex={1000}
        footer={[
          <Row key="footer-row">
            <Col md={24} lg={12} xl={12}>
              {!mobileView && downloadTemplate()}
            </Col>
            <Col
              md={8}
              lg={4}
              xl={4}
              className={`btn-col ${!mobileView && 'reset-btn'}`}
            >
              <Button
                className="bulk-upload-btn"
                type="default"
                onClick={handleCancel}
              >
                Reset
              </Button>
            </Col>
            <Col
              md={8}
              lg={4}
              xl={4}
              className={`btn-col ${!mobileView && 'validate-btn'}`}
            >
              <Button
                className="bulk-upload-btn"
                type="default"
                onClick={handleValidate}
                disabled={isValidate}
                id="bulk-file-Validate"
              >
                Validate
              </Button>
            </Col>
            <Col md={7} lg={4} xl={4}>
              <Button
                className="bulk-upload-btn"
                type="primary"
                loading={confirmLoading}
                onClick={handleOk}
                disabled={!enable}
                id="bulk-import"
              >
                Import
              </Button>
            </Col>
          </Row>,
        ]}
      >
        <Row>
          <Col span={24}>{mobileView && downloadTemplate()}</Col>
        </Row>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={12}
            xl={12}
            className={`${
              isUploaded ? 'col-align' : 'text-align-center'
            } gutter-row tour-gutter`}
          >
            {isUploaded ? (
              <div>
                <Dragger
                  customRequest={dummyRequest}
                  beforeUpload={handleUpload}
                  onChange={handleFileList}
                  fileList={fileList}
                  maxCount={1}
                  className="bulk-upload-box bulk-upload-tour"
                  showUploadList={false}
                >
                  <p className="upload-text">Select File</p>
                  <div className="mt-30p">
                    <UploadIcon />
                    <p className="mt-10">
                      Drag & drop files or{' '}
                      <span className="browse-text">Browse </span>
                    </p>
                  </div>
                </Dragger>
              </div>
            ) : (
              fileListRender()
            )}
          </Col>
          <Col
            className="gutter-row images-list-row imageboxTour"
            xs={24}
            sm={24}
            md={24}
            lg={12}
            xl={12}
          >
            {isImageUploaded ? (
              <div className="hide-preview image-div">
                <div className="bulk-upload-files-list">
                  <Dragger
                    multiple
                    directory
                    webkitdirectory="webkitdirectory"
                    action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                    customRequest={dummyRequest}
                    fileList={imageFileList}
                    beforeUpload={(file) =>
                      onBeforeUploads(file, imageFileList)
                    }
                    onRemove={handleRemove}
                    showUploadList={false}
                    className="bulk-upload-box remove-icon"
                  >
                    <p className="upload-text">Select Image File</p>
                    <div className="mt-30p">
                      <UploadIcon />
                      <p className="mt-10">
                        Drag & drop files or{' '}
                        <span className="browse-text">Browse </span>
                      </p>
                    </div>
                  </Dragger>
                </div>
              </div>
            ) : (
              imageFileListRender()
            )}
          </Col>
        </Row>
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
          <Group />
        </span>
        <span>Store created successfully</span>
      </Modal>
      <Tour
        open={openTourModal}
        onClose={() => setOpenTourModal(false)}
        steps={steps}
        current={currentSteps}
      />
    </div>
  );
}
export default BulkUpload;
