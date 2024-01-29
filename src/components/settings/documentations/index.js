import React, { useEffect, useState, useContext } from 'react';
import { Spin, notification, Switch, Tag, Button } from 'antd';
import { get, debounce, isNaN } from 'lodash';
import { Link } from 'react-router-dom';
import { MilestoneContext } from '../../context/milestone-context';
import {
  deleteDocument,
  getAllDocuments,
  updateDocumentStatus,
} from '../../../utils/api/url-helper';
import {
  DOCUMENT_DELETE_COMFIRM_TEXT,
  FAILED_TO_LOAD,
  INITIAL_PAGE,
  PAGE_LIMIT,
  TENANT_MODE_CLIC,
  TENANT_MODE_NORMAL,
} from '../../../shared/constant-values';
import '../settings.less';
import {
  disableTabEnterKey,
  enableTabEnterKey,
} from '../../../shared/function-helper';
import { TenantContext } from '../../context/tenant-context';
import { DeleteAlert } from '../../../shared/sweetalert-helper';
import TableComponent from '../../table-component/table-component';

import { ReactComponent as DeleteIcon } from '../../../assets/icons/clic/noun-delete.svg';
import { ReactComponent as EditIcon } from '../../../assets/icons/clic/noun-edit.svg';
import DocumentList from './document-list';
import AddDocument from './add-document';

function Documentaions(properties) {
  const { mobileView, setScreenState } = properties;
  const [tenantDetails] = useContext(TenantContext);
  const [documentData, setDocumentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { fetchTourData } = useContext(MilestoneContext);

  const [openTourModal, setOpenTourModal] = useState(false);
  const [currentPageValue, setCurrentPageValue] = useState(INITIAL_PAGE);
  const [pagination, setPagination] = useState({
    current: INITIAL_PAGE,
    pageSize: PAGE_LIMIT,
  });

  const fetchData = async (apiArray, parameters = {}) => {
    setLoading(true);
    Promise.all(apiArray)
      .then(async (response) => {
        setPagination({
          ...parameters.pagination,
          total: get(response, '[0]data.count', 0),
        });
        setDocumentData(get(response, '[0].data.rows', []));
        if (get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL) {
          const tourDataValues = await fetchTourData();
          const policyData = get(tourDataValues, 'data.[0]');
          const paymentTourDatas = get(policyData, 'subGuide.[1]');
          const isDocumentCreated = get(paymentTourDatas, 'completed', false);
          if (!mobileView) {
            setOpenTourModal(!isDocumentCreated);
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error.message || FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  const initalApicall = () => {
    const parameter = {};
    let apiArray = [];
    if (get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC) {
      parameter.limit = PAGE_LIMIT;
      parameter.offset = INITIAL_PAGE;
      apiArray = [getAllDocuments(parameter)];
    } else {
      apiArray = [getAllDocuments(parameter)];
    }
    fetchData(apiArray, {
      pagination: { pageSize: PAGE_LIMIT, current: INITIAL_PAGE },
    });
  };

  useEffect(() => {
    initalApicall();
  }, []);

  const deleteHandler = async (id) => {
    const text = DOCUMENT_DELETE_COMFIRM_TEXT;
    const result = await DeleteAlert(text);
    if (result.isConfirmed) {
      setLoading(true);
      deleteDocument(id)
        .then(() => {
          initalApicall();
        })
        .catch((error) => {
          notification.error({ message: get(error, 'error', FAILED_TO_LOAD) });
          setLoading(false);
        });
    }
  };

  const statusUpdate = debounce((status, data) => {
    const { document_id: id } = data;
    updateDocumentStatus(id, { status })
      .then((response) => {
        if (get(response, 'success', false)) {
          notification.success({
            message: 'Document status updated successfully',
          });
          initalApicall();
        }
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: error.message || 'Failed to update document status',
        });
      });
  }, 500);

  const documentStatus = (status, data) => {
    setLoading(true);
    statusUpdate(status, data);
  };

  useEffect(() => {
    if (openTourModal) {
      disableTabEnterKey();
    } else {
      enableTabEnterKey();
    }
  }, [openTourModal]);

  useEffect(() => {
    if (openTourModal) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [openTourModal]);

  const handleAddDocument = () => {
    setShowModal(true);
  };

  const handleDocumentStatus = (status, data) => {
    documentStatus(status, data);
  };

  const renderButton = () => {
    return (
      <Button
        onClick={() => {
          setShowModal(true);
        }}
        type="primary"
      >
        Add Document
      </Button>
    );
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'document_name',
      key: 'document_name',
      with: 300,
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 200,
      render: (text, row) => (
        <Switch
          onClick={(value) => documentStatus(value, row)}
          checked={text}
          size="small"
        />
      ),
    },
    {
      title: 'Edit',
      width: 100,
      render: (row) => (
        <Link to={`/settings/${row?.document_id}`}>
          <span>
            <Tag
              style={{
                marginRight: '0px',
                marginLeft: '-4px',
                background: 'none',
              }}
            >
              <EditIcon />
            </Tag>
          </span>
        </Link>
      ),
    },
    {
      title: 'Delete',
      render: (row) => (
        <span>
          <Tag
            style={{
              marginRight: '0px',
              marginLeft: '-4px',
              background: 'none',
            }}
            onClick={() => deleteHandler(row?.document_id)}
          >
            <DeleteIcon />
          </Tag>
        </span>
      ),
    },
    {
      title: renderButton(),
    },
  ];

  const handleTableChange = (paginationAlias) => {
    const { current } = paginationAlias;
    setCurrentPageValue(current);
  };

  useEffect(() => {
    if (get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC) {
      const current = isNaN(currentPageValue)
        ? false
        : Number(currentPageValue);
      const newPagination = {
        ...pagination,
        ...(current && { current }),
      };
      const addPagination = currentPageValue
        ? newPagination
        : { ...pagination, current: 1 };
      const parameter = {
        limit: PAGE_LIMIT,
        offset: current,
      };
      const apiArray = [getAllDocuments(parameter)];
      fetchData(apiArray, {
        pagination: addPagination,
      });
    }
  }, [currentPageValue]);

  const refresh = () => {
    setShowModal(false);
    initalApicall();
  };

  return (
    <Spin spinning={loading}>
      {get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_NORMAL && (
        <div>
          <DocumentList
            documentData={documentData}
            handleAddDocument={handleAddDocument}
            handleDelete={(value) => deleteHandler(value)}
            handleDocumentStatus={handleDocumentStatus}
            mobileView={mobileView}
            setScreenState={setScreenState}
            openTourModal={openTourModal}
            setOpenTourModal={setOpenTourModal}
          />
        </div>
      )}
      {get(tenantDetails, 'tenant_mode', '') === TENANT_MODE_CLIC && (
        <div className="documentation-container">
          <TableComponent
            columns={columns}
            loading={loading}
            className="documentation-table-container mt-10"
            tableData={documentData}
            handleTableChange={handleTableChange}
            pagination={pagination}
          />
        </div>
      )}
      {showModal && (
        <AddDocument
          showModal={showModal}
          setShowModal={setShowModal}
          refresh={refresh}
        />
      )}
    </Spin>
  );
}

export default Documentaions;
