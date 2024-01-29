import React, { useEffect, useState } from 'react';
import {
  Button,
  notification,
  Spin,
  List,
  Empty,
  Card,
  Checkbox,
  Image,
} from 'antd';
import { get, isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { getGoogleScope } from '../../../utils/api/url-helper';
import { FAILED_TO_LOAD } from '../../../shared/constant-values';

const GoogelPhotos = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [tenantDetails, setTenantDetails] = useState({});

  const history = useNavigate();

  const initAuth = async () => {
    return window.gapi.auth2.init({
      clientId: get(tenantDetails, 'google_photos_client_id', ''),
      clientSecret: get(tenantDetails, 'client_secret', ''),
      scopes: get(tenantDetails, 'google_photos_scopes', ''),
      plugin_name: 'media-items',
    });
  };

  // eslint-disable-next-line consistent-return
  const checkSignedIn = () => {
    return new Promise((resolve, reject) => {
      initAuth()
        .then((resp) => {
          const auth = window.gapi.auth2.getAuthInstance();
          setToken(get(resp, 'currentUser.Pb.zc.access_token', ''));
          resolve(auth.isSignedIn.get());
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const onFailure = (error) => {
    notification.error({ message: error });
  };

  const onSuccess = () => {
    setIsSignedIn(true);
    // eslint-disable-next-line no-use-before-define
    window.gapi.load('auth2', init);
  };
  const renderButton = () => {
    window.gapi.signin2.render('signin-button', {
      scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
      width: 240,
      height: 50,
      longtitle: true,
      theme: 'dark',
      onsuccess: onSuccess,
      onfailure: onFailure,
    });
  };

  const handleGoogleSignOut = () => {
    const auth2 = window.gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
      window.location.reload();
    });
  };

  const init = () => {
    checkSignedIn()
      .then((signedIn) => {
        setIsSignedIn(signedIn);
        if (!signedIn) {
          renderButton();
        }
      })
      .catch(() => {
        handleGoogleSignOut();
      });
  };

  useEffect(() => {
    if (!isEmpty(tenantDetails)) {
      window.gapi.load('auth2', init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantDetails]);

  const fetchData = async () => {
    await getGoogleScope()
      .then((resp) => {
        if (resp.success) {
          setTenantDetails(get(resp, 'data', {}));
        }
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPhotos = async () => {
    const response = await fetch(
      'https://content-photoslibrary.googleapis.com/v1/mediaItems',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-type': 'application/json',
        },
        method: 'GET',
      }
    );
    const data = await response.json();
    const mediaItems = get(data, 'mediaItems', []);
    setPreviewImages(mediaItems);
    setLoading(false);
  };

  useEffect(() => {
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

  return (
    <>
      <div className="flex-bwn-end">
        <h3 className="ml-10">Google Photos</h3>
        <div className="signin-button">
          {!isSignedIn ? (
            <>
              <div id="signin-button" />
              <span className="disclosure">
                Zupain&apos;s use and transfer to any other app of information
                received <br />
                from Google APIs will adhere to{' '}
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes"
                >
                  Google API Services User Data Policy
                </a>
                <br /> including the Limited Use requirements
              </span>
            </>
          ) : (
            <Button onClick={handleGoogleSignOut}>Google Sign Out</Button>
          )}
        </div>
      </div>
      {!isEmpty(previewImages) ? (
        <>
          {loading ? (
            <div className="title-property">
              <Spin />
            </div>
          ) : (
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
                          src={value.baseUrl}
                          alt={value.filename}
                        />
                      </div>
                      <Button
                        disabled={selectedFiles.length}
                        type="primary"
                        className="mt-10"
                        style={{ width: '100%' }}
                        onClick={() =>
                          history('/products/add-product', {
                            state: {
                              value,
                            },
                          })
                        }
                      >
                        Add to Products{' '}
                      </Button>
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          )}
        </>
      ) : (
        <Empty style={{ marginTop: 200 }} />
      )}
      {selectedFiles.length > 0 && (
        <div className="gallery-footer">
          <Button
            type="primary"
            onClick={() =>
              selectedFiles.length > 7
                ? notification.error({
                    message: 'Please Select less than 8 images',
                  })
                : history('/products/add-product', {
                    state: {
                      selectedFiles,
                    },
                  })
            }
          >
            ADD AS PRODUCT
          </Button>
        </div>
      )}
    </>
  );
};

export default GoogelPhotos;
