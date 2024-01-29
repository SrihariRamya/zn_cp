import React, { Component } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Spin, Tabs, Card, Modal, notification, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import update from 'immutability-helper';
import _, { get } from 'lodash';
import ImgContainer from './img-container';
import {
  getBanners,
  sortBanners,
  deleteBanner,
  getcategoryProducts,
} from '../../utils/api/url-helper';
import './banner.less';
import BannerForm from './banner-form';
import {
  BANNER_DELETE_SUCCESS,
  BANNER_DELETE_FAILED,
  FAILED_TO_LOAD,
  POSITION_UPDATE_SUCCESS,
  POSITION_UPDATE_FAILED,
} from '../../shared/constant-values';
import {
  DeleteAlert,
  DeleteAlertAssociated,
  DeleteAlertImage,
  DeleteAlertMessage,
} from '../../shared/sweetalert-helper';

const { TabPane } = Tabs;
class Banner extends Component {
  constructor(properties) {
    super(properties);
    this.state = {
      appearanceBanner: properties.BannerId,
      setEditorContext: properties.setEditorContext,
      contextProperties: properties.contextProperties,
      editorContext: properties.editorContext,
      renderArea: properties.renderArea,
      mobileBanner: [],
      subMobileBanner: [],
      webBanner: [],
      subWebBanner: [],
      isModalVisible: false,
      loading: false,
      bannerDataLength: '',
      tabKey: properties.tabKey,
      bannerRecord: {},
      modalTitle: 'Add Banner',
      visibleModal: false,
      visibleButton: false,
      categoryData: [],
      productData: [],
      selectedSubCategory: [],
      selectedProduct: [],
      fileList: [],
      validateBanner: {
        width: '',
        height: '',
      },
      bannerImage: '',
      bannerRatio: '',
    };
  }

  componentDidMount = () => {
    this.fetchData();
  };

  componentDidUpdate(previousProperties) {
    if (
      get(this, 'props.contextProperties.appearance_section_uid') !==
        get(previousProperties, 'contextProperties.appearance_section_uid') ||
      get(this, 'props.BannerId') !== get(previousProperties, 'BannerId')
    ) {
      this.getAppearanceProperties(this.props);
      this.fetchData();
    }
  }

  getAppearanceProperties = (data) => {
    this.setState({
      appearanceBanner: get(data, 'BannerId'),
      contextProperties: get(data, 'contextProperties'),
    });
  };

  fetchData = () => {
    this.setState({ loading: true });
    const apiArray = [getcategoryProducts(), getBanners({ fromAdmin: true })];
    Promise.all(apiArray)
      .then((response) => {
        if (response) {
          const categoryData = _.get(response, '[0].data', []);
          const productData = [];
          _.get(response, '[0].data', []).forEach((data) => {
            _.get(data, 'productList', []).forEach((product) => {
              productData.push(product);
            });
            _.get(data, 'sub_category', []).forEach((item) => {
              _.get(item, 'productList', []).forEach((list) => {
                productData.push(list);
              });
            });
          });
          const mobileImages = _.get(response, '[1].data', [])?.filter(
            (value) => value.mobile === true
          );
          const webImages = _.get(response, '[1].data', [])?.filter((value) => {
            if (this.state.renderArea === 'appearance') {
              const appearanceData = this.state.appearanceBanner.find(
                (index) => index.banner_id === value.banner_id
              );
              return value.banner_id === _.get(appearanceData, 'banner_id');
            }
            return value.web === true;
          });
          const imgurl = webImages && webImages[webImages.length - 1];
          const url = get(imgurl, 'img', '');
          const img = new Image();
          img.src = url;
          img.onload = () => {
            const { width, height } = img;
            this.setState({
              validateBanner: {
                width,
                height,
              },
            });
          };
          this.setState({
            mobileBanner: _.orderBy(mobileImages, ['order_by'], ['asc']),
            subMobileBanner: _.orderBy(mobileImages, ['order_by'], ['asc']),
            webBanner: _.orderBy(webImages, ['order_by'], ['asc']),
            subWebBanner: _.orderBy(webImages, ['order_by'], ['asc']),
            loading: false,
            categoryData,
            productData,
            bannerRatio: get(webImages, '0.banner_ratio', ''),
          });
        }
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  mobileModal = () => {
    this.setState({
      isModalVisible: true,
      selectedProduct: 'Add Banner',
      selectedSubCategory: 'Add Banner',
      modalTitle: 'Add Banner',
      bannerImage: '',
    });
  };

  webModal = () => {
    this.setState({
      visibleModal: true,
      selectedSubCategory: 'Add Banner',
      modalTitle: 'Add Banner',
      selectedProduct: 'Add Banner',
      bannerImage: '',
    });
  };

  handleOk = (value) => {
    this.setState({ visibleModal: true, bannerImage: value });
  };

  modalClose = () => {
    this.setState({ visibleModal: false, isModalVisible: false });
  };

  setFileList = (value) => {
    this.setState({
      fileList: value,
    });
  };

  handleCancel = () => {
    this.setState({
      isModalVisible: false,
      visibleModal: false,
      bannerRecord: {},
      fileList: [],
    });
  };

  handleEdit = (value) => {
    const { categoryData, productData } = this.state;
    const bannerRecord = value;
    const subCategory = categoryData.filter(
      (item) => item.category_uid === bannerRecord.category_uid
    );
    const productValue = bannerRecord.sub_category_uid
      ? _.get(subCategory, '[0].sub_category', []).filter(
          (item) => item.sub_category_uid === bannerRecord.sub_category_uid
        )
      : categoryData.filter(
          (item) => item.category_uid === bannerRecord.category_uid
        );

    const finalResults =
      bannerRecord.category_uid === '' && bannerRecord.sub_category_uid === ''
        ? productData
        : _.get(productValue, '[0].productList', []);
    this.setState({
      isModalVisible: true,
      bannerRecord,
      modalTitle: 'Edit Banner',
      selectedSubCategory: subCategory,
      selectedProduct: finalResults,
    });
  };

  webEdit = (value, index) => {
    if (index) {
      const getBanner =
        this.state.webBanner.length && this.state.webBanner[index - 1];
      const imgUrl = get(getBanner, 'img', '');
      const img = new Image();
      img.src = imgUrl;
      img.onload = () => {
        const { width, height } = img;
        return this.setState({
          validateBanner: {
            width,
            height,
          },
        });
      };
    }
    const { categoryData, productData } = this.state;
    const bannerRecord = value;
    const subCategory = categoryData.filter(
      (item) => item.category_uid === bannerRecord.category_uid
    );
    const productValues = bannerRecord.sub_category_uid
      ? _.get(subCategory, '[0].sub_category', []).filter(
          (item) => item.sub_category_uid === bannerRecord.sub_category_uid
        )
      : categoryData.filter(
          (item) => item.category_uid === bannerRecord.category_uid
        );
    const finalResult =
      bannerRecord.sub_category_uid === '' && bannerRecord.category_uid === ''
        ? productData
        : _.get(productValues, '[0].productList', []);
    this.setState({
      visibleModal: true,
      bannerRecord,
      modalTitle: 'Edit Banner',
      selectedSubCategory: subCategory,
      selectedProduct: finalResult,
    });
  };

  alignMobileBanner = () => {
    const { mobileBanner } = this.state;
    mobileBanner.forEach((data, index) => {
      data.order_by = index;
      return data;
    });
    this.setState({ mobileBanner });
  };

  alignWebBanner = () => {
    const { webBanner } = this.state;
    webBanner.forEach((data, index) => {
      data.order_by = index;
      return data;
    });
    this.setState({ webBanner });
  };

  onCancel = () => {
    const { subMobileBanner, subWebBanner } = this.state;
    this.setState({
      mobileBanner: subMobileBanner,
      webBanner: subWebBanner,
      visibleButton: false,
    });
  };

  updateTable = (data) => {
    if (data) {
      this.fetchData();
    }
  };

  moveMobileBanner = (dragIndex, hoverIndex) => {
    this.setState({ visibleButton: true });
    const { mobileBanner } = this.state;
    const dragCard = mobileBanner[dragIndex];
    this.setState(
      (previousState) =>
        update(previousState, {
          mobileBanner: {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, dragCard],
            ],
          },
        }),
      () => {
        this.alignMobileBanner();
      }
    );
  };

  moveWebBanner = (dragIndex, hoverIndex) => {
    this.setState({ visibleButton: true });
    const { webBanner } = this.state;
    const dragCard = webBanner[dragIndex];
    this.setState(
      (previousState) =>
        update(previousState, {
          webBanner: {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, dragCard],
            ],
          },
        }),
      () => {
        this.alignWebBanner();
      }
    );
  };

  handleSubmit = () => {
    const { mobileBanner, webBanner, tabKey } = this.state;
    const parameters = {
      dataArray: tabKey === 'web' ? webBanner : mobileBanner,
    };
    sortBanners(parameters)
      .then((result) => {
        if (result.success) {
          this.setState({ visibleButton: false });
          this.fetchData();
          notification.success({ message: POSITION_UPDATE_SUCCESS });
        }
      })
      .catch(() => {
        notification.error({
          message: POSITION_UPDATE_FAILED,
        });
      });
  };

  callback = (key) => {
    this.setState({ tabKey: key });
  };

  bannerHardDelete = async (id) => {
    const title = `This banner is associated with Sections`;
    const text = `Are you sure? The banner will be deleted and sections will be removed?`;
    const result = await DeleteAlertAssociated(title, text);
    if (result.isConfirmed) {
      const parameters = {
        forceDelete: true,
      };
      deleteBanner(id, parameters)
        .then((response) => {
          if (response.success) {
            DeleteAlertImage(BANNER_DELETE_SUCCESS);
            this.setState({
              validateBanner: {
                width: '',
                height: '',
              },
            });
            this.fetchData();
          } else DeleteAlertMessage(BANNER_DELETE_FAILED);
        })
        .catch(() => {
          DeleteAlertMessage(BANNER_DELETE_FAILED);
        });
    }
  };

  deleteImage = async (data) => {
    if (this.state.renderArea === 'appearance') {
      this.state.setEditorContext(
        this.state.editorContext.map((row) => {
          _.get(row, 'column', []).map((column) => {
            _.remove(
              _.get(column, 'section.sectionArray'),
              (element) =>
                get(element, 'banner_id', '') === get(data, 'banner_id', '')
            );
            return column;
          });
          return row;
        })
      );
      this.setState({
        validateBanner: {
          width: '',
          height: '',
        },
      });
      return;
    }
    const text = 'Are you sure want to delete this banner from the list?';
    const result = await DeleteAlert(text);
    if (result.isConfirmed) {
      deleteBanner(get(data, 'banner_id', ''))
        .then((response) => {
          if (response.success) {
            DeleteAlertImage(BANNER_DELETE_SUCCESS);
            this.setState({
              validateBanner: {
                width: '',
                height: '',
              },
            });
            this.fetchData();
          } else DeleteAlertMessage(BANNER_DELETE_FAILED);
        })
        .catch((error__) => {
          DeleteAlertMessage(BANNER_DELETE_FAILED);
          let parsedResponse = {};
          try {
            parsedResponse = error__.json();
          } catch {
            parsedResponse = error__;
          }
          if (parsedResponse.message === 'Banner_Sections_Associated') {
            this.bannerHardDelete(get(data, 'banner_id', ''));
          } else {
            DeleteAlertMessage(BANNER_DELETE_FAILED);
          }
        });
    }
  };

  render() {
    const {
      isModalVisible,
      loading,
      mobileBanner,
      bannerDataLength,
      tabKey,
      webBanner,
      bannerRecord,
      modalTitle,
      visibleModal,
      visibleButton,
      selectedSubCategory,
      selectedProduct,
      categoryData,
      productData,
    } = this.state;
    const { showContent } = this.props;
    return (
      <Spin spinning={loading}>
        <div className="box mobile-side-padding">
          <div className="box-content-background">
            {this.state.renderArea === 'appearance' ? (
              <>
                <div style={{ padding: '0 10px 10px 10px' }}>
                  <Alert
                    description="All images should have same resolution."
                    type="warning"
                    showIcon
                  />
                </div>
                <div className="container">
                  <DndProvider backend={HTML5Backend}>
                    {webBanner.map((web, index) => (
                      <ImgContainer
                        moveCard={this.moveWebBanner}
                        key={web.banner_id}
                        url={web.url}
                        img={web.img}
                        index={index}
                        id={web.banner_id}
                        tabKey={tabKey}
                        handleEdit={() => this.handleEdit(web)}
                        webEdit={() => this.webEdit(web, index)}
                        deleteImage={() => this.deleteImage(web)}
                      />
                    ))}
                  </DndProvider>
                  <div>
                    <Card
                      title="Add Banner"
                      className="upload_card"
                      onClick={this.webModal}
                    >
                      <PlusOutlined />
                    </Card>
                  </div>
                </div>
              </>
            ) : (
              <Tabs
                defaultActiveKey="mobile"
                onChange={this.callback}
                tabBarExtraContent={showContent(visibleButton)}
                type="card"
                className="custom-tabs"
              >
                <TabPane tab="Mobile" key="mobile">
                  <div style={{ padding: '0 10px 10px 10px' }}>
                    <Alert
                      description="All images should have same resolution. The best fit of image resolution is 360 X 150."
                      type="warning"
                      showIcon
                    />
                  </div>
                  <div className="banner-container bannermanage-desk-upload">
                    <DndProvider backend={HTML5Backend}>
                      {mobileBanner.map((mob, index) => (
                        <ImgContainer
                          moveCard={this.moveMobileBanner}
                          key={mob.banner_id}
                          img={mob.img}
                          url={mob.url}
                          index={index}
                          id={mob.banner_id}
                          handleEdit={() => this.handleEdit(mob)}
                          deleteImage={() => this.deleteImage(mob)}
                        />
                      ))}
                    </DndProvider>
                    <div>
                      <Card
                        title="Add Banner"
                        className="upload_card"
                        onClick={this.mobileModal}
                      >
                        <PlusOutlined />
                      </Card>
                    </div>
                  </div>
                </TabPane>
                {/* <TabPane tab="Web" key="web">
                  <div style={{ padding: '0 10px 10px 10px' }}>
                    <Alert
                      description="All images should have same resolution. The best fit of image resolution is 1920 x 500."
                      type="warning"
                      showIcon
                    />
                  </div>
                  <div className="banner-container bannermanage-mobile-upload">
                    <DndProvider backend={HTML5Backend}>
                      {webBanner.map((web, index) => (
                        <ImgContainer
                          moveCard={this.moveWebBanner}
                          key={web.banner_id}
                          url={web.url}
                          img={web.img}
                          index={index}
                          id={web.banner_id}
                          tabKey={tabKey}
                          webEdit={() => this.webEdit(web, index)}
                          deleteImage={() => this.deleteImage(web)}
                        />
                      ))}
                    </DndProvider>
                    <div>
                      <Card
                        title="Add Banner"
                        className="upload_card"
                        onClick={this.webModal}
                      >
                        <PlusOutlined />
                      </Card>
                    </div>
                  </div>
                </TabPane> */}
              </Tabs>
            )}
          </div>
        </div>
        <Modal
          title={modalTitle}
          visible={visibleModal}
          footer={false}
          onCancel={this.handleCancel}
          zIndex={1}
        >
          <BannerForm
            handleCancel={this.handleCancel}
            bannerDataLength={bannerDataLength}
            tabKey={tabKey}
            categoriesData={categoryData}
            setEditorContext={this.state.setEditorContext}
            editorContext={this.state.editorContext}
            contextProperties={this.state.contextProperties}
            renderArea={this.state.renderArea}
            productsData={productData}
            bannerRecord={bannerRecord}
            selectedProduct={selectedProduct}
            selectedSubCategory={selectedSubCategory}
            visibleModal={visibleModal}
            updateTable={(data) => this.updateTable(data)}
            fileList={this.state.fileList}
            setFileList={this.setFileList}
            validateBanner={this.state.validateBanner}
            handleOk={this.handleOk}
            modalClose={this.modalClose}
            bannerImage={this.state.bannerImage}
            bannerRatio={this.state.bannerRatio}
          />
        </Modal>
        <Modal
          title={modalTitle}
          visible={isModalVisible}
          footer={false}
          onCancel={this.handleCancel}
          zIndex={1}
        >
          <BannerForm
            handleCancel={this.handleCancel}
            bannerDataLength={bannerDataLength}
            tabKey={tabKey}
            categoriesData={categoryData}
            selectedProduct={selectedProduct}
            productsData={productData}
            bannerRecord={bannerRecord}
            selectedSubCategory={selectedSubCategory}
            isModalVisible={this.state.isModalVisible}
            visibleModal={visibleModal}
            updateTable={(data) => this.updateTable(data)}
            fileList={this.state.fileList}
            setFileList={this.setFileList}
            handleOk={this.handleOk}
            bannerImage={this.state.bannerImage}
            modalClose={this.modalClose}
            bannerRatio={this.state.bannerRatio}
          />
        </Modal>
      </Spin>
    );
  }
}

export default Banner;
