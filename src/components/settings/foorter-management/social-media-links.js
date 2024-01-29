/* eslint-disable camelcase */
import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Switch, Row, Col, Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { cloneDeep, get, includes, map, remove } from 'lodash';
import { TenantContext } from '../../context/tenant-context';
import getFormItemRules from '../../../shared/form-helpers';
import {
  defaultIsNormalSocialMedia,
  defaultSocialMedia,
} from '../../../shared/constant-values';
import {
  deleteSocialMeadia,
  getSocialMedias,
  updateSocialMediaStatus,
} from '../../../utils/api/url-helper';
import {
  DeleteAlert,
  DeleteAlertImage,
} from '../../../shared/sweetalert-helper';
import AddSocialMedia from './add-social-media';
import { ReactComponent as DeleteIcon } from '../../../assets/images/delete-icon.svg';

function SocialMediaLinks(properties) {
  const [socialMediaModel, setSocialMediaModel] = useState(false);
  const [tenantDetails] = useContext(TenantContext);
  const [socialMediaList, setSocialMediaList] = useState([]);
  const {
    activeData,
    onSocialChange,
    isNormalTenantMode,
    urlValidator,
    socialEnable,
    setSocialEnable,
    setSocialRemove,
    form,
  } = properties;

  const openSocialmediaModal = () => {
    setSocialMediaModel(true);
  };

  const fetchData = () => {
    const tenant_uid = get(tenantDetails, 'tenant_uid', '');
    getSocialMedias({ is_active: 1, tenant_uid }).then((response) => {
      setSocialMediaList(get(response, 'data.rows', ''));
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (value) => {
    const { social_media_uid, customize } = value;
    if (customize === true) {
      const text = 'Are you sure you want to delete this social media ?';
      const result = await DeleteAlert(text);
      if (result?.isConfirmed) {
        deleteSocialMeadia({ social_media_uid }).then((response) => {
          if (response.success) {
            fetchData();
            DeleteAlertImage('Deleted successfully');
          }
        });
      }
    } else {
      const text = 'Are you sure you want to delete this social media ?';
      const result = await DeleteAlert(text);
      const status = 0;
      if (result?.isConfirmed) {
        updateSocialMediaStatus(social_media_uid, { status }).then(
          (response) => {
            if (response?.success) {
              fetchData();
            }
          }
        );
      }
    }
  };

  const handleUpdateSocialMedia = (value) => {
    const { social_media_uid } = value;
    const status = 1;
    updateSocialMediaStatus(social_media_uid, { status }).then((response) => {
      if (response?.success) {
        fetchData();
      }
    });
  };

  const handleduplicateColumn = (data) => (
    <Col key={data.id} xs={24} sm={24} md={12} lg={12} xl={12}>
      <Row>
        <Col xs={4} sm={4} md={2} lg={2} xl={2} className="social-media-icon">
          <img src={data.image} alt="socialmedia-img" />
        </Col>
        <Col xs={20} sm={20} md={22} lg={22} xl={22}>
          <div style={{ position: 'relative' }}>
            <Form.Item
              className="social-media-status"
              name={get(data, 'social_media_status', '')}
              valuePropName="checked"
            >
              <Switch
                onClick={(checked) =>
                  checked
                    ? setSocialEnable([
                        ...socialEnable,
                        get(data, 'social_media_label', ''),
                      ])
                    : (setSocialEnable(
                        remove(
                          cloneDeep(socialEnable),
                          (x) => x !== get(data, 'social_media_label', '')
                        )
                      ),
                      setSocialRemove(get(data, 'social_media_label', '')))
                }
                className="switch-container mob-switch"
              />
            </Form.Item>
            <Form.Item
              name={get(data, 'social_media_name', '')}
              label={get(data, 'social_media_label', '')}
              rules={[
                {
                  required: form.getFieldValue(
                    get(data, 'social_media_status', '')
                  ),
                  message:
                    data?.social_media_name === 'whatsapp_hyperlink'
                      ? 'Please enter your whatsapp number!'
                      : 'Please enter your Link',
                },
                data.social_media_name === 'whatsapp_hyperlink'
                  ? ''
                  : urlValidator,
                ...getFormItemRules({
                  mobile: data?.social_media_name === 'whatsapp_hyperlink',
                }),
              ]}
            >
              <Input
                placeholder={
                  data?.social_media_name === 'whatsapp_hyperlink'
                    ? 'Enter your whatsapp number'
                    : `Enter your ${get(
                        data,
                        'social_media_label',
                        ''
                      )} page link here`
                }
              />
            </Form.Item>
          </div>
        </Col>
      </Row>
    </Col>
  );

  return (
    <div>
      {isNormalTenantMode && (
        <div className="block-header-footer-management">
          <span className="base-line" id="social-media-links">
            <span className="switch-class mr-20p"> Social Media Links</span>
            <Form.Item
              name={[get(activeData, '[0].header', ''), 'is_active']}
              valuePropName="checked"
            >
              <Switch className="switch-container" onChange={onSocialChange} />
            </Form.Item>
          </span>{' '}
        </div>
      )}
      <Card>
        <Row gutter={[40, 24]}>
          {map(defaultSocialMedia, (data) => handleduplicateColumn(data))}
        </Row>
        {isNormalTenantMode && (
          <Row className="mt-20" gutter={[40, 24]}>
            {map(defaultIsNormalSocialMedia, (data) => {
              return handleduplicateColumn(data);
            })}
          </Row>
        )}
        <Row className="mt-20" gutter={[40, 24]}>
          {map(socialMediaList, (data) => (
            <Col
              key={get(data, 'id', '')}
              xs={24}
              sm={24}
              md={12}
              lg={12}
              xl={12}
              span={12}
            >
              <Row>
                <Col
                  xs={4}
                  sm={4}
                  md={2}
                  lg={2}
                  xl={2}
                  className="social-media-icon"
                >
                  <img
                    width="43px"
                    height="43px"
                    src={get(data, 'image', '')}
                    alt="socialmedia-img"
                    style={{ borderRadius: '50%' }}
                  />
                </Col>
                <Col xs={20} sm={20} md={22} lg={22} xl={22}>
                  <div style={{ position: 'relative' }}>
                    <Form.Item
                      className="social-media-status"
                      name={`${data?.social_media_name}_status`}
                      valuePropName="checked"
                    >
                      <Switch
                        className="switch-container mob-switch"
                        onClick={(checked) =>
                          checked
                            ? setSocialEnable([
                                ...socialEnable,
                                get(data, 'social_media_name', ''),
                              ])
                            : (setSocialEnable(
                                remove(
                                  cloneDeep(socialEnable),
                                  (x) =>
                                    x !== get(data, 'social_media_name', '')
                                )
                              ),
                              setSocialRemove(
                                get(data, 'social_media_name', '')
                              ))
                        }
                      />
                    </Form.Item>
                    <Row>
                      <Col xs={20} sm={20} md={22} lg={22} xl={22}>
                        <Form.Item
                          name={get(data, 'social_media_name', '')}
                          label={get(data, 'social_media_name', '')}
                          rules={[
                            {
                              required: form.getFieldValue(
                                `${data?.social_media_name}_status`
                              ),
                              message: 'Please input your Link!',
                            },
                            urlValidator,
                          ]}
                        >
                          <Input placeholder="Please enter your link here" />
                        </Form.Item>
                      </Col>
                      <Col
                        xs={4}
                        sm={4}
                        md={2}
                        lg={2}
                        xl={2}
                        className="res-center"
                      >
                        <DeleteIcon
                          className="social-media-delete-icon"
                          onClick={() => handleDelete(data)}
                        />
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Col>
          ))}
        </Row>
        <div className="mt-3rem">
          <Button
            onClick={() => openSocialmediaModal()}
            icon={<PlusOutlined />}
            type="primary"
          >
            Add new social media link
          </Button>
        </div>
      </Card>
      {socialMediaModel && (
        <AddSocialMedia
          socialMediaModel={socialMediaModel}
          setSocialMediaModel={setSocialMediaModel}
          handleUpdateSocialMedia={handleUpdateSocialMedia}
          fetchData={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
}

export default SocialMediaLinks;
