import { Col, List, Divider } from 'antd';
import React, { useContext } from 'react';
import { get, map, slice } from 'lodash';
import { YoutubeOutlined } from '@ant-design/icons';
import { TenantContext } from '../../context/tenant-context';
import WidgetsJson from './widgets/widgets-json';
import { ReactComponent as ImageCarousel } from '../Icon/imageCarousel.svg';
import { ReactComponent as Space } from '../Icon/space.svg';
import ImageUploadModal from './insertCompent/image-upload';
import CreateButtonComponent from './insertCompent/create-button';
import EmbedModal from './insertCompent/embed-modal';
import ProductModal from './insertCompent/product-modal';
import CategoryModal from './insertCompent/category-modal';
import { useComponentContext } from '../context/components';
import VideoUploadPreviewModal from './contents/video-component/video';
import YoutubeVideoUploadPreviewModal from './contents/video-component/youtube-player';
import { SCREEN_MODE_ADD } from '../../../shared/constant-values';
import ImageComponentModal from './insertCompent/image-modal';
import ImageCarouselComponentModal from './insertCompent/image-carousel-modal';

function WidgetComponent(properties) {
  const {
    icon,
    name,
    className,
    type,
    onClickEmbed,
    onWidgetChange,
    onClickCategory,
    onClickProduct,
    onClickVideo,
  } = properties;

  return (
    <div
      aria-hidden="true"
      className={className}
      onClick={() => {
        switch (type) {
          case 'embed': {
            onClickEmbed();
            break;
          }
          case 'category': {
            onClickCategory();
            break;
          }
          case 'product': {
            onClickProduct();
            break;
          }
          case 'video': {
            onClickVideo();
            break;
          }
          default: {
            onWidgetChange(type);
          }
        }
      }}
    >
      <img src={icon} alt={name} />
      <p>{name}</p>
    </div>
  );
}

function InsertComponent(properties) {
  const {
    productModalVisible,
    setProductModalVisible,
    setIsNewProductComponent,
    setComponentProperties,
    categoryModalVisible,
    setCategoryModalVisible,
    modalVisible,
    setModalVisible,
    buttonModalVisible,
    setButtonModalVisible,
    embedModalVisible,
    setEmbedModalVisible,
    videoModalVisible,
    setVideoModalVisible,
    youTubeModalVisible,
    setYouTubeModalVisible,
  } = useComponentContext();
  const { onWidgetChange, handleUpload, onButton } = properties;
  const [tenantDetails] = useContext(TenantContext);

  const closeModal = () => {
    setModalVisible(false);
    setButtonModalVisible(false);
    setEmbedModalVisible(false);
    setProductModalVisible(false);
    setCategoryModalVisible(false);
    setIsNewProductComponent(false);
    setYouTubeModalVisible(false);
    setVideoModalVisible(false);
    setComponentProperties({});
  };

  const onClickEmbed = () => {
    setEmbedModalVisible(true);
  };
  const onClickVideo = () => {
    setVideoModalVisible(true);
  };
  const onClickProduct = () => {
    setIsNewProductComponent(true);
    setProductModalVisible(true);
  };
  const onClickCategory = () => {
    setIsNewProductComponent(true);
    setCategoryModalVisible(true);
  };

  const listData = [
    {
      icon: <ImageCarousel />,
      name: 'Image carousel',
      key: 'carousel',
    },
    {
      icon: <Space />,
      name: 'Button',
      key: 'button',
    },
    {
      icon: <YoutubeOutlined />,
      name: 'YouTube player',
      key: 'youtube',
    },
  ];

  const onListClick = (key) => {
    switch (key) {
      case 'carousel': {
        setModalVisible(true);
        break;
      }
      case 'button': {
        setModalVisible(false);
        setButtonModalVisible(true);
        break;
      }
      case 'youtube': {
        setModalVisible(false);
        setButtonModalVisible(false);
        setYouTubeModalVisible(true);
        break;
      }
      default: {
        break;
      }
    }
  };

  return (
    <Col
      span={24}
      className="drawer-content"
      style={{ height: '100vh', overflowY: 'auto' }}
    >
      <div className="widget-container">
        <div className="widget-row">
          {map(
            slice(
              WidgetsJson,
              0,
              get(tenantDetails, 'tenant_mode') === 'Clic' ? 5 : 6
            ),
            (widget) => (
              <WidgetComponent
                key={widget.id}
                icon={widget.icon}
                name={widget.name}
                type={widget.type}
                className="widget"
                onClickEmbed={onClickEmbed}
                onClickProduct={onClickProduct}
                onClickCategory={onClickCategory}
                onClickVideo={onClickVideo}
                onWidgetChange={onWidgetChange}
              />
            )
          )}
        </div>
        <Divider style={{ height: '1px', background: '#999' }} />
        <div style={{ width: '100%' }}>
          <h3 style={{ color: '#6E56EC', paddingLeft: '20px' }}>
            Content Blocks
          </h3>
        </div>
        {map(slice(WidgetsJson, 6), (widget) => (
          <WidgetComponent
            key={widget.id}
            icon={widget.icon}
            name={widget.name}
            type={widget.type}
            className="check-widget"
            onClickEmbed={onClickEmbed}
            onWidgetChange={onWidgetChange}
          />
        ))}
        <Col />
      </div>

      <Divider style={{ height: '1px', background: '#999' }} />
      <List
        className="insert-list"
        size="small"
        bordered
        dataSource={listData}
        renderItem={(item) => (
          <List.Item onClick={() => onListClick(item.key)}>
            {item.icon}&nbsp;&nbsp;<p>{item.name}</p>
          </List.Item>
        )}
      />
      <ProductModal onCancel={closeModal} visible={productModalVisible} />
      <CategoryModal visible={categoryModalVisible} onCancel={closeModal} />
      <VideoUploadPreviewModal
        videoModalVisible={videoModalVisible}
        onCancel={closeModal}
      />
      <ImageUploadModal
        visible={modalVisible}
        onCancel={closeModal}
        onUpload={handleUpload}
        from={SCREEN_MODE_ADD}
      />
      <CreateButtonComponent
        visible={buttonModalVisible}
        onCancel={closeModal}
        onOk={onButton}
      />
      <YoutubeVideoUploadPreviewModal
        videoModalVisible={youTubeModalVisible}
        onCancel={closeModal}
      />
      <EmbedModal visible={embedModalVisible} onCancel={closeModal} />
      <ImageComponentModal />
      <ImageCarouselComponentModal />
      <Divider style={{ height: '1px', background: '#999' }} />
    </Col>
  );
}
export default InsertComponent;
