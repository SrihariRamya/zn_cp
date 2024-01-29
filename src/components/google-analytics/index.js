import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  notification,
  Spin,
  DatePicker,
  Empty,
  Breadcrumb,
  Space,
} from 'antd';
import { CChart } from '@coreui/react-chartjs';
import { get, isEmpty, map } from 'lodash';
import moment from 'moment';
import {
  getGA4Report,
  getGoogleScope,
  getTenant,
} from '../../utils/api/url-helper';
import {
  CHART_BACKGROUND_COLOR,
  FAILED_TO_LOAD,
} from '../../shared/constant-values';
import { TenantContext } from '../context/tenant-context';

const { RangePicker } = DatePicker;
const AnalyticsReport = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [cityReport, setCityReport] = useState([]);
  const [countryReport, setCountryReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState([]);
  const [filterDate, setFilterDate] = useState([
    '2022-04-04',
    moment().format('YYYY-MM-DD'),
  ]);

  const [tenantDetails, , setTenantDetails] = useContext(TenantContext);
  const [tenantData, setTenantData] = useState({});

  // eslint-disable-next-line consistent-return
  const fetchData = async () => {
    const [startDate, endDate] = filterDate;
    const parameters = {
      accessToken: token,
      startDate,
      endDate,
    };

    const propertyId = get(tenantDetails, 'setting.property_id', '');
    if (!isEmpty(propertyId)) {
      await getGA4Report(propertyId, parameters)
        .then((resp) => {
          if (resp.success) {
            const city = get(resp, 'data.city.0.city', []);
            const country = get(resp, 'data.country.0.country', []);
            setCityReport(
              map(city, (row) => {
                return {
                  cityList: row.dimensionValues[0].value,
                  cityCount: row.metricValues[0].value,
                };
              })
            );
            setCountryReport(
              map(country, (row) => {
                return {
                  countryList: row.dimensionValues[0].value,
                  countryCount: row.metricValues[0].value,
                };
              })
            );
            setLoading(false);
          }
        })
        .catch((response) => {
          notification.error({ message: response.message });
          setLoading(false);
        });
    } else {
      notification.error({ message: 'Property Id is not exist' });
    }
  };

  const getTenantDetails = async () => {
    await getTenant()
      .then((response) => {
        setTenantDetails((previous) => {
          return previous === get(response, 'data', {})
            ? tenantDetails
            : get(response, 'data', {});
        });
      })
      .catch((error) => {
        notification.error({ message: error || FAILED_TO_LOAD });
        setLoading(false);
      });
    await getGoogleScope()
      .then((resp) => {
        if (resp.success) {
          setTenantData(get(resp, 'data', {}));
        }
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!isEmpty(token)) {
      setLoading(true);
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filterDate]);

  const initAuth = async () => {
    return window.gapi.auth2.init({
      client_id: get(tenantData, 'client_id', ''),
      scope: get(tenantData, 'scope', ''),
      plugin_name: 'hello',
    });
  };

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

  const onSuccess = () => {
    setIsSignedIn(true);
    // eslint-disable-next-line no-use-before-define
    window.gapi.load('auth2', init);
  };

  const onFailure = (error) => {
    notification.error({ message: error });
  };

  const renderButton = () => {
    window.gapi.signin2.render('signin-button', {
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
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
    if (!isEmpty(tenantData)) {
      window.gapi.load('auth2', init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantData]);

  const onChange = (value, dateString) => {
    setFilterDate(dateString);
  };

  useEffect(() => {
    getTenantDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex-bwn-end">
        <div className="search-container">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space>Analytic Report</Space>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
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
      <h1 className="title-property">
        <RangePicker onChange={onChange} />
      </h1>
      {!isEmpty(cityReport) ? (
        <>
          {loading ? (
            <div className="title-property">
              <Spin />
            </div>
          ) : (
            <div className="analytic-chart">
              <div className="line-chart">
                <CChart
                  type="line"
                  data={{
                    labels: map(cityReport, (item) => item.cityList),
                    datasets: [
                      {
                        label: 'Active Users',
                        backgroundColor: 'rgba(220, 220, 220, 0.2)',
                        borderColor: ' rgb(25, 103, 180, 0.5)',
                        pointBackgroundColor: ' rgb(25, 103, 210)',
                        pointBorderColor: '#fff',
                        data: map(cityReport, (item) => item.cityCount),
                      },
                    ],
                  }}
                />
              </div>
              <div className="doughnut">
                <CChart
                  type="doughnut"
                  data={{
                    labels: map(countryReport, (item) => item.countryList),
                    datasets: [
                      {
                        backgroundColor: CHART_BACKGROUND_COLOR,
                        data: map(countryReport, (item) => item.countryCount),
                      },
                    ],
                  }}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <Empty style={{ marginTop: 200 }} />
      )}
    </>
  );
};

export default AnalyticsReport;
