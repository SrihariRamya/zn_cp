import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { notification, Spin, Table, Breadcrumb, Space, Button } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import { get } from 'lodash';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import moment from 'moment';
import save from '../../assets/save.svg';
import {
  FAILED_TO_LOAD,
  DOWNLOAD_FAILED,
  DOWNLOAD_SUCCESS,
} from '../../shared/constant-values';
import { TenantContext } from '../context/tenant-context';
import { getOneReports, downloadReport } from '../../utils/api/url-helper';
import { handleUrlChanges } from '../../shared/common-url-helper';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}
function ReportDetails(properties) {
  const [reportDetails, setReportDetails] = useState([]);
  const [reportFields, setReportFields] = useState();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [tableChange, setTableChange] = useState(false);
  const [tenantDetails] = useContext(TenantContext);
  const firstUpdate = useRef(true);
  const query = useQuery();
  const currentPage = query.get('page');
  const moduleName = 'reports/report-details';
  const reportField =
    get(properties, 'history.location.state.reportData', '') ||
    get(properties, 'history.location.state', '');
  const history = useNavigate();

  const fetchreportData = async (parameters = {}) => {
    setLoading(true);
    const {
      pagination: { current, pageSize },
    } = parameters;
    const queryParameter = {
      limit: pageSize,
      offset: current,
      reportId: get(reportField, 'report_id', ''),
      viewData: get(reportField, 'view_name', ''),
      tagName: get(reportField, 'tagname', ''),
      attributeColumns: get(reportField, 'attrib_columns', ''),
    };
    const apiArray = [getOneReports(queryParameter)];
    Promise.all(apiArray)
      .then((response) => {
        setReportDetails(get(response, '[0].data', []));
        setPagination({
          ...parameters.pagination,
          total: get(response, '[0].count', 0),
        });
        setReportFields(reportField);
        setLoading(false);
        setTableChange(false);
      })
      .catch(() => {
        setTableChange(false);
        notification.error({ message: FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  const fetchData = useCallback(
    (parameters) => {
      fetchreportData(parameters || { pagination });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagination]
  );

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    const current = isNaN(currentPage) ? false : Number(currentPage);
    const newPagination = {
      ...pagination,
      ...(current && { current }),
    };

    if (!tableChange && !firstUpdate.current) {
      const addPagination = currentPage
        ? newPagination
        : { ...pagination, current: 1 };

      fetchreportData({
        pagination: addPagination,
      });
    }
    if (firstUpdate.current) {
      firstUpdate.current = false;
      const parameters = current ? { pagination: newPagination } : false;
      fetchData(parameters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);
  const getColumnName = (data) => {
    const columnData = get(reportFields, 'report_column_names', []).filter(
      (response) => response.view_name === reportFields.view_name
    );
    const columnsName = get(columnData, '[0].report_columns', []).find(
      (datas) => datas.field === data
    );
    return get(columnsName, 'columnName', '');
  };
  const reportColumns =
    reportFields && reportFields.tagname === 'report'
      ? get(reportFields, 'report_columns', []).map((result) => {
          const render = get(result, 'render', []);
          const field = get(result, 'field', []);
          if (render.includes('amount')) {
            return {
              title: result.columnName,
              dataIndex: result.field,
              render: (currency) => (
                <span className="text-grey-light">
                  <CurrencyFormatter
                    value={currency}
                    type={get(tenantDetails, 'setting.currency', '')}
                  />
                </span>
              ),
              key: result.field,
            };
          }
          if (render.includes('percent')) {
            return {
              title: result.columnName,
              dataIndex: result.field,
              render: (currency) => (
                <span className="text-grey-light">{`${currency}%`}</span>
              ),
              key: result.field,
            };
          }
          if (field.includes('date')) {
            return {
              title: result.columnName,
              dataIndex: result.field,
              render: (currency) => (
                <span className="text-grey-light">
                  {moment(currency).format(
                    get(
                      tenantDetails,
                      'setting.date_format',
                      'dddd, MMMM D, YYYY'
                    )
                  )}
                </span>
              ),
              key: result.field,
            };
          }
          return {
            title: /Contact/.test(get(result, 'columnName', ''))
              ? 'Mobile Number'
              : get(result, 'columnName', ''),
            dataIndex: result.field,
            key: result.field,
          };
        })
      : get(reportFields, 'report_columns', []).map((results) => {
          if (
            results.includes('price') ||
            results.includes('charge') ||
            results.includes('amount')
          ) {
            return {
              title: getColumnName(results),
              dataIndex: results,
              render: (currency) => (
                <span className="text-grey-light">
                  <CurrencyFormatter
                    value={currency}
                    type={get(tenantDetails, 'setting.currency', '')}
                  />
                </span>
              ),
              key: results.field,
            };
          }
          if (results.includes('percent')) {
            return {
              title: getColumnName(results),
              dataIndex: results,
              render: (currency) => (
                <span className="text-grey-light">{`${currency}%`}</span>
              ),
              key: results.field,
            };
          }
          if (results.includes('date')) {
            return {
              title: getColumnName(results),
              dataIndex: results,
              render: (currency) => (
                <span className="text-grey-light">
                  {moment(currency).format(
                    get(
                      tenantDetails,
                      'setting.date_format',
                      'dddd, MMMM D, YYYY'
                    )
                  )}
                </span>
              ),
              key: results.field,
            };
          }
          return {
            title: /Contact/.test(getColumnName(results))
              ? 'Mobile Number'
              : getColumnName(results),
            dataIndex: results,
            key: results,
          };
        });

  const handleDownload = () => {
    downloadReport({
      ...reportField,
      report_column_names: JSON.stringify(reportField.report_column_names),
    })
      .then(() => {
        notification.success({ message: DOWNLOAD_SUCCESS });
      })
      .catch(() => {
        notification.error({ message: DOWNLOAD_FAILED });
      });
  };

  const handleTableChange = (paginationAlias) => {
    setTableChange(true);
    const { current } = paginationAlias;
    handleUrlChanges(current, history, moduleName, reportField);
    fetchreportData({
      pagination: { pageSize: 10, current },
    });
  };

  return (
    <Spin spinning={loading}>
      <div className="search-container">
        <div>
          <h1>
            <FileExcelOutlined />
            &nbsp; Report Details
          </h1>
          <Breadcrumb separator=">">
            <Breadcrumb.Item className="table-tax">
              <Link to="/"> Home </Link>
            </Breadcrumb.Item>
            {reportFields && reportFields.tagname === 'report' ? (
              <Breadcrumb.Item className="table-tax">
                <Link to="/reports">General Reports</Link>
              </Breadcrumb.Item>
            ) : (
              <Breadcrumb.Item className="table-tax">
                <Link to="/reports?page=Custom">Custom Reports</Link>
              </Breadcrumb.Item>
            )}

            <Breadcrumb.Item className="customer-breadcrum">
              Report Details
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div />
      </div>
      <div className="box" style={{ padding: '0px 10px' }}>
        <div className="box__header flex-end">
          <Button
            type="primary"
            onClick={handleDownload}
            className="disable-primary download-primary"
          >
            <Space>
              <img src={save} alt="Download" />
              Download
            </Space>
          </Button>
        </div>
        <div className="box__content p-0">
          <Table
            className="grid-pagination-long orders-table-styles"
            columns={reportColumns}
            dataSource={reportDetails}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 780 }}
          />
        </div>
      </div>
    </Spin>
  );
}

export default ReportDetails;
