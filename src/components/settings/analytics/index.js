import { notification, Spin, Row, Col } from 'antd';
import { get } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import {
  FACEBOOK_PIXEL_DELETE_FAILED,
  FACEBOOK_PIXEL_DELETE_SUCCESS,
  FACEBOOK_PIXEL_SUCCESS,
  FACEBOOK_PIXEL_UPDATE_FAILED,
  FAILED_TO_LOAD,
  FB_PIXEL_TAG_FROM,
  GOOGLE_ANALYTIC_DELETE_FAILED,
  GOOGLE_ANALYTIC_DELETE_SUCCESS,
  GOOGLE_ANALYTIC_FROM,
  GOOGLE_ANALYTIC_SUCCESS,
  GOOGLE_ANALYTIC_UPDATE_FAILED,
  GOOGLE_TAG_DELETE_FAILED,
  GOOGLE_TAG_DELETE_SUCCESS,
  GOOGLE_TAG_FROM,
  GOOGLE_TAG_SUCCESS,
  GOOGLE_TAG_UPDATE_FAILED,
  SCREEN_MODE_EDIT,
  SETTINGS_UPDATE_FAILED,
  SETTINGS_UPDATE_SUCCESS,
  TENANT_MODE_CLIC,
} from '../../../shared/constant-values';
import { getTenant, updateTenantSettings } from '../../../utils/api/url-helper';
import { TenantContext } from '../../context/tenant-context';
import FacebookPixel from './facebook-pixel';
import GoogleAnalytics from './google-analytics';
import GoogleTagManager from './google-tag-manager';

const handlesuccessMessage = (from, mode) => {
  let message = '';
  switch (from) {
    case GOOGLE_ANALYTIC_FROM: {
      message =
        mode === SCREEN_MODE_EDIT
          ? GOOGLE_ANALYTIC_SUCCESS
          : GOOGLE_ANALYTIC_DELETE_SUCCESS;
      break;
    }
    case GOOGLE_TAG_FROM: {
      message =
        mode === SCREEN_MODE_EDIT
          ? GOOGLE_TAG_SUCCESS
          : GOOGLE_TAG_DELETE_SUCCESS;
      break;
    }
    case FB_PIXEL_TAG_FROM: {
      message =
        mode === SCREEN_MODE_EDIT
          ? FACEBOOK_PIXEL_SUCCESS
          : FACEBOOK_PIXEL_DELETE_SUCCESS;
      break;
    }
    default: {
      message = SETTINGS_UPDATE_SUCCESS;
      break;
    }
  }
  return message;
};

const handleErrorMessage = (from, mode, errorMessage) => {
  let message = '';
  switch (from) {
    case GOOGLE_ANALYTIC_FROM: {
      message =
        mode === SCREEN_MODE_EDIT
          ? GOOGLE_ANALYTIC_UPDATE_FAILED
          : GOOGLE_ANALYTIC_DELETE_FAILED;
      break;
    }
    case GOOGLE_TAG_FROM: {
      message =
        mode === SCREEN_MODE_EDIT
          ? GOOGLE_TAG_UPDATE_FAILED
          : GOOGLE_TAG_DELETE_FAILED;
      break;
    }
    case FB_PIXEL_TAG_FROM: {
      message =
        mode === SCREEN_MODE_EDIT
          ? FACEBOOK_PIXEL_UPDATE_FAILED
          : FACEBOOK_PIXEL_DELETE_FAILED;
      break;
    }
    default: {
      message = errorMessage;
      break;
    }
  }
  return message;
};

function Analytics(properties) {
  const { mobileView } = properties;
  const [tagModal, setTagModal] = useState(false);
  const [analyticModal, setAnalyticModal] = useState(false);
  const [pixelModal, setPixelModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [tenantDetails, , setTenantDetails] = useContext(TenantContext);
  const clicTenantMode =
    get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC;

  const getTenantDetails = () => {
    setLoading(true);
    getTenant()
      .then((response) => {
        setTenantDetails((previous) => {
          return previous === get(response, 'data', {})
            ? tenantDetails
            : get(response, 'data', {});
        });
        setLoading(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  useEffect(() => {
    getTenantDetails();
  }, []);

  const updateSettingsData = (parametter, from, mode) => {
    updateTenantSettings({ payload: parametter })
      .then((data) => {
        if (data.success) {
          getTenantDetails();
          setAnalyticModal(false);
          setTagModal(false);
          setPixelModal(false);
          notification.success({ message: handlesuccessMessage(from, mode) });
        } else {
          setLoading(false);
          notification.error({
            message: handleErrorMessage(from, mode, SETTINGS_UPDATE_FAILED),
          });
        }
      })
      .catch((error) => {
        notification.error({
          message: handleErrorMessage(
            from,
            mode,
            error?.message || SETTINGS_UPDATE_FAILED
          ),
        });
        setLoading(false);
      });
  };

  return (
    <Spin spinning={loading}>
      {clicTenantMode ? (
        <GoogleAnalytics
          tenantDetails={tenantDetails}
          updateSettingsData={updateSettingsData}
          mobileView={mobileView}
          isModal={analyticModal}
          setIsModal={setAnalyticModal}
        />
      ) : (
        <Row>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={8}
            xl={8}
            className={!mobileView && 'p-10'}
          >
            <FacebookPixel
              updateSettingsData={updateSettingsData}
              tenantDetails={tenantDetails}
              mobileView={mobileView}
              isModal={pixelModal}
              setIsModal={setPixelModal}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={8}
            xl={8}
            className={!mobileView && 'p-10'}
          >
            <GoogleAnalytics
              tenantDetails={tenantDetails}
              updateSettingsData={updateSettingsData}
              mobileView={mobileView}
              isModal={analyticModal}
              setIsModal={setAnalyticModal}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={8}
            xl={8}
            className={!mobileView && 'p-10'}
          >
            <GoogleTagManager
              updateSettingsData={updateSettingsData}
              tenantDetails={tenantDetails}
              mobileView={mobileView}
              isModal={tagModal}
              setIsModal={setTagModal}
            />
          </Col>
        </Row>
      )}
    </Spin>
  );
}

export default Analytics;
