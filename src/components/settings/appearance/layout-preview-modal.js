import React, { useContext } from 'react';
import { Modal, Row } from 'antd';
import { get } from 'lodash';
import FooterDetails from './dnd-component/footer';
import ClicFooter from './dnd-component/clic-footer';
import AppearancePreview from './view-helper/preview';
import HeaderDetails from './dnd-component/header';
import { TenantContext } from '../../context/tenant-context';
import { TENANT_MODE_CLIC } from '../../../shared/constant-values';

const LayoutPreviewModal = (properties) => {
  const {
    layoutSource,
    webLayout,
    settingProperties,
    visible,
    setVisible,
    editorContext,
  } = properties;
  const [tenantDetails] = useContext(TenantContext);
  const isClicMode = get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC;
  return (
    <Modal
      title="Preview of lane and section"
      centered
      visible={visible}
      onCancel={() => setVisible(false)}
      footer={false}
      zIndex={999999}
      className={`appearance-modal-${layoutSource}`}
      bodyStyle={{
        border: webLayout ? '1px solid #8f9699' : '',
        padding: '0px',
        backgroundColor: webLayout
          ? get(
              // eslint-disable-next-line no-restricted-globals
              find(
                settingProperties,
                (item) =>
                  get(item, 'variable_name') === '--layout-body-background'
              ),
              'variable_value',
              '#FFFFFF'
            )
          : 'transparent',
      }}
    >
      <div className={!webLayout && 'smartphone'}>
        <div className="content">
          <Row
            align="center"
            justify="middle"
            style={
              !webLayout && {
                margin: '0px',
                height: '520px',
                overflow: 'scroll',
                maxWidth: '328px',
              }
            }
          >
            {!isClicMode && (
              <HeaderDetails
                settingProperties={settingProperties}
                preview="preview"
                webLayout={webLayout}
              />
            )}
            <AppearancePreview
              settingProperties={settingProperties}
              editorContext={editorContext}
              webLayout={webLayout}
            />
            {isClicMode ? (
              <ClicFooter
                settingProperties={settingProperties}
                isWebLayout={webLayout}
              />
            ) : (
              <FooterDetails
                settingProperties={settingProperties}
                preview="preview"
                webLayout={webLayout}
              />
            )}
          </Row>
        </div>
      </div>
    </Modal>
  );
};

export default LayoutPreviewModal;
