import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button, Table, Breadcrumb, Space, Spin, notification } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { get, isNaN, isEmpty, findIndex, filter } from 'lodash';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FAILED_TO_LOAD,
  ROLES_UPDATE_SUCCESS,
  ROLES_UPDATE_FAILED,
} from '../../shared/constant-values';
import {
  createOrUpdateRoleAccess,
  getAllRoles,
  getRole,
} from '../../utils/api/url-helper';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const RoleAccess = ({ properties }) => {
  const history = useNavigate()
  const [loading, setLoading] = useState(false);
  const [roleAccessData, setRoleAccessData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [showEdit, setShowEdit] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [storeAdminId, setStoreAdminId] = useState([]);
  const [storeUserId, setStoreUserId] = useState([]);
  const [customerId, setCustomerId] = useState([]);
  const [updateData, setUpdateData] = useState([]);
  const [check, setCheck] = useState(false);

  const firstUpdate = useRef(true);
  const query = useQuery();
  const currentPageCount = query.get('limit');

  const fetchRolesData = (parameters = {}) => {
    setLoading(true);
    setRoleAccessData([]);
    const {
      pagination: { current, pageSize },
    } = parameters;
    const queryParameter = {
      limit: pageSize,
      offset: current,
    };
    const apiArray = [getAllRoles(queryParameter)];
    Promise.all(apiArray)
      .then((response) => {
        setRoleAccessData(get(response, '[0].data.rows', []));
        setPagination({
          ...parameters.pagination,
          total: get(response, '[0].data.count', 0),
        });
        setLoading(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  useEffect(() => {
    getRole()
      .then((response) => {
        const storeAdmin = get(response, 'data', []).filter((item) => {
          return item.slug === 'store_admin';
        });
        setStoreAdminId(storeAdmin);
        const storeUser = get(response, 'data', []).filter((item) => {
          return item.slug === 'store_user';
        });
        setStoreUserId(storeUser);
        const customers = get(response, 'data', []).filter((item) => {
          return item.slug === 'store_user';
        });
        setCustomerId(customers);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = useCallback(
    (parameters) => {
      fetchRolesData(parameters || { pagination });
    },
    [pagination]
  );

  useEffect(() => {
    setCheck(!check);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeAdminId, storeUserId, customerId]);

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    const current = !isNaN(currentPageCount) ? Number(currentPageCount) : false;
    const newPagination = {
      ...pagination,
      ...(current && { current }),
    };

    if (firstUpdate.current) {
      firstUpdate.current = false;
      const parameters = current ? { pagination: newPagination } : false;
      fetchData(parameters);
    } else {
      fetchRolesData({
        pagination: newPagination,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageCount]);

  const checkedData = (moduleId, RoleId) => {
    return {
      can_read: false,
      can_write: false,
      module_id: moduleId,
      role_id: RoleId,
    };
  };
  const onFinish = () => {
    setLoading(true);
    createOrUpdateRoleAccess(updateData)
      .then(() => {
        setLoading(false);
        setRoleAccessData([]);
        setShowEdit(true);
        setReadOnly(!readOnly);
        fetchRolesData({
          pagination: {
            pageSize: 10,
            current: parseInt(currentPageCount, 10) || 1,
          },
        });
        setUpdateData([]);
        notification.success({ message: ROLES_UPDATE_SUCCESS });
      })
      .catch(() => {
        setLoading(false);
        setRoleAccessData([]);
        setShowEdit(true);
        setReadOnly(!readOnly);
        fetchRolesData({
          pagination: {
            pageSize: 10,
            current: parseInt(currentPageCount, 10) || 1,
          },
        });
        setUpdateData([]);
        notification.error({ message: ROLES_UPDATE_FAILED });
      });
  };

  const editOption = () => {
    setShowEdit(false);
    setReadOnly(!readOnly);
  };
  const checkEntry = (roleId, moduleId, access) => {
    if (updateData) {
      if (access) {
        return !isEmpty(
          updateData.filter((values) => {
            return values.role_id === roleId && values.module_id === moduleId;
          })
        );
      }
      return findIndex(roleAccessData, (values) => {
        return values.module_id === moduleId;
      });
    }
    return false;
  };

  const changeValues = (
    moduleValue,
    roleID,
    moduleReadAccess,
    moduleWriteAccess,
    status
  ) => {
    get(
      roleAccessData,
      `[${checkEntry('', moduleValue)}].role_accesses`,
      []
    ).forEach((datas) => {
      if (datas.role_id === roleID) {
        if (moduleReadAccess && moduleWriteAccess) {
          datas.can_write = status;
          datas.module_view = status;
        } else if (moduleReadAccess) {
          datas.module_view = status;
        } else if (moduleWriteAccess) {
          datas.can_write = status;
        } else if (!moduleReadAccess && !moduleWriteAccess) {
          datas.can_write = status;
          datas.module_view = status;
        }
      }
    });
  };

  const onHandleCancel = () => {
    setShowEdit(true);
    setReadOnly(!readOnly);
    setRoleAccessData([]);
    setUpdateData([]);
    fetchRolesData({
      pagination: { pageSize: 10, current: 1 },
    });
  };

  const onFullAccessChange = (checked, getData) => {
    const checkValue = {};
    if (
      checkEntry(
        get(getData, 'role_id', ''),
        get(getData, 'module_id', ''),
        'check'
      )
    ) {
      updateData.forEach((datas) => {
        if (
          datas.role_id === get(getData, 'role_id', '') &&
          datas.module_id === get(getData, 'module_id', '')
        ) {
          datas.module_view = get(checked, 'target.checked', false);
          datas.can_write = get(checked, 'target.checked', false);
        }
      });
    } else {
      checkValue.module_view = get(checked, 'target.checked', false);
      checkValue.can_write = get(checked, 'target.checked', false);
      checkValue.role_id = get(getData, 'role_id', '');
      checkValue.module_id = get(getData, 'module_id', '');
      setUpdateData([...updateData, checkValue]);
    }

    if (get(checked, 'target.checked', false)) {
      changeValues(
        get(getData, 'module_id', ''),
        get(getData, 'role_id', ''),
        1,
        1,
        get(checked, 'target.checked', false)
      );
    } else {
      changeValues(
        get(getData, 'module_id', ''),
        get(getData, 'role_id', ''),
        0,
        0,
        get(checked, 'target.checked', false)
      );
    }
    setRoleAccessData(roleAccessData);
    setCheck(!check);
  };

  const onSwitchChange = (checked, getData, access) => {
    const checkValue = {};
    if (
      checkEntry(
        get(getData, 'role_id', ''),
        get(getData, 'module_id', ''),
        'check'
      )
    ) {
      updateData.forEach((datas) => {
        if (
          datas.role_id === get(getData, 'role_id', '') &&
          datas.module_id === get(getData, 'module_id', '')
        ) {
          if (
            Object.keys(datas).some((avalibleKeys) => avalibleKeys === access)
          ) {
            if (access === 'can_write') {
              if (get(checked, 'target.checked', false)) {
                datas.module_view = get(checked, 'target.checked', false);
                datas.can_write = get(checked, 'target.checked', false);
                changeValues(
                  get(getData, 'module_id', ''),
                  get(getData, 'role_id', ''),
                  1,
                  1,
                  get(checked, 'target.checked', false)
                );
              } else {
                changeValues(
                  get(getData, 'module_id', ''),
                  get(getData, 'role_id', ''),
                  0,
                  1,
                  get(checked, 'target.checked', false)
                );
                datas.can_write = get(checked, 'target.checked', false);
              }
            } else if (get(checked, 'target.checked', false)) {
              changeValues(
                get(getData, 'module_id', ''),
                get(getData, 'role_id', ''),
                1,
                0,
                get(checked, 'target.checked', false)
              );
              datas.module_view = get(checked, 'target.checked', false);
            } else {
              changeValues(
                get(getData, 'module_id', ''),
                get(getData, 'role_id', ''),
                1,
                1,
                get(checked, 'target.checked', false)
              );
              datas.module_view = get(checked, 'target.checked', false);
              datas.can_write = get(checked, 'target.checked', false);
            }
          } else if (access === 'module_view') {
            changeValues(
              get(getData, 'module_id', ''),
              get(getData, 'role_id', ''),
              1,
              0,
              get(checked, 'target.checked', false)
            );
            datas.module_view = get(checked, 'target.checked', false);
          } else {
            changeValues(
              get(getData, 'module_id', ''),
              get(getData, 'role_id', ''),
              0,
              1,
              get(checked, 'target.checked', false)
            );
            datas.can_write = get(checked, 'target.checked', false);
          }
        }
      });
      setCheck(!check);
    } else {
      if (access === 'module_view') {
        if (get(checked, 'target.checked', false)) {
          checkValue.module_view = get(checked, 'target.checked', false);
          changeValues(
            get(getData, 'module_id', ''),
            get(getData, 'role_id', ''),
            1,
            0,
            get(checked, 'target.checked', false)
          );
        } else {
          checkValue.module_view = get(checked, 'target.checked', false);
          checkValue.can_write = get(checked, 'target.checked', false);
          changeValues(
            get(getData, 'module_id', ''),
            get(getData, 'role_id', ''),
            1,
            1,
            get(checked, 'target.checked', false)
          );
        }
      } else if (access === 'can_write') {
        if (get(checked, 'target.checked', false)) {
          checkValue.module_view = get(checked, 'target.checked', false);
          checkValue.can_write = get(checked, 'target.checked', false);
          changeValues(
            get(getData, 'module_id', ''),
            get(getData, 'role_id', ''),
            1,
            1,
            get(checked, 'target.checked', false)
          );
        } else {
          checkValue.can_write = get(checked, 'target.checked', false);
          changeValues(
            get(getData, 'module_id', ''),
            get(getData, 'role_id', ''),
            0,
            1,
            get(checked, 'target.checked', false)
          );
        }
      }
      checkValue.role_id = get(getData, 'role_id', '');
      checkValue.module_id = get(getData, 'module_id', '');
      setUpdateData([...updateData, checkValue]);
    }
    setRoleAccessData(roleAccessData);
    setCheck(!check);
  };

  const columns = [
    {
      title: 'Modules',
      dataIndex: 'module_name',
      key: 'module_name',
      width: 100,
      render: (text) => {
        return (
          <span className="text-green-dark">
            {text === 'Product Search' ? 'Search Enquiries' : text}
          </span>
        );
      },
    },
    {
      title: 'Store Admin',
      key: 'role',
      children: [
        {
          title: 'Read',
          width: 100,
          render: (datas) => {
            const getDatas = get(datas, 'role_accesses', []).filter((item) => {
              return item.role_id === get(storeAdminId, '[0].id', '');
            });
            return (
              <Checkbox
                checked={get(getDatas, '[0].module_view', false)}
                onChange={(checked) =>
                  onSwitchChange(
                    checked,
                    get(
                      getDatas,
                      '[0]',
                      checkedData(
                        datas.module_id,
                        get(storeAdminId, '[0].id', '')
                      )
                    ),
                    'module_view'
                  )
                }
                disabled={!readOnly}
              />
            );
          },
        },
        {
          title: 'Write',
          width: 100,
          render: (datas) => {
            const getData = get(datas, 'role_accesses', []).filter((item) => {
              return item.role_id === get(storeAdminId, '[0].id', '');
            });
            return (
              <Checkbox
                checked={get(getData, '[0].can_write', false)}
                onChange={(checked) =>
                  onSwitchChange(
                    checked,
                    get(
                      getData,
                      '[0]',
                      checkedData(
                        datas.module_id,
                        get(storeAdminId, '[0].id', '')
                      )
                    ),
                    'can_write'
                  )
                }
                disabled={!readOnly}
              />
            );
          },
        },

        {
          title: 'Full Access',
          width: 100,

          render: (data) => {
            const getallData = get(data, 'role_accesses', []).filter((item) => {
              return item.role_id === get(storeAdminId, '[0].id', '');
            });
            const fullAccessValue = !!(
              get(getallData, '[0].can_write', false) &&
              get(getallData, '[0].module_view', false) &&
              get(getallData, '[0].can_read', false)
            );
            return (
              <Checkbox
                checked={fullAccessValue}
                onChange={(checked) =>
                  onFullAccessChange(
                    checked,
                    get(
                      getallData,
                      '[0]',
                      checkedData(
                        data.module_id,
                        get(storeAdminId, '[0].id', '')
                      )
                    )
                  )
                }
                disabled={!readOnly}
              />
            );
          },
        },
      ],
    },
    {
      title: 'Store Users',
      key: 'role',

      children: [
        {
          title: 'Read',
          width: 100,
          render: (data) => {
            const getModuleViewDatas = get(data, 'role_accesses', []).filter(
              (item) => {
                return item.role_id === get(storeUserId, '[0].id', '');
              }
            );
            return (
              <Checkbox
                checked={get(getModuleViewDatas, '[0].module_view', false)}
                onChange={(checked) =>
                  onSwitchChange(
                    checked,
                    get(
                      getModuleViewDatas,
                      '[0]',
                      checkedData(
                        data.module_id,
                        get(storeUserId, '[0].id', '')
                      )
                    ),
                    'module_view'
                  )
                }
                disabled={!readOnly}
              />
            );
          },
        },
        {
          title: 'Write',
          width: 100,
          render: (data) => {
            const getDatas = get(data, 'role_accesses', []).filter((item) => {
              return item.role_id === get(storeUserId, '[0].id', '');
            });
            return (
              <Checkbox
                checked={get(getDatas, '[0].can_write', false)}
                onChange={(checked) =>
                  onSwitchChange(
                    checked,
                    get(
                      getDatas,
                      '[0]',
                      checkedData(
                        data.module_id,
                        get(storeUserId, '[0].id', '')
                      )
                    ),
                    'can_write'
                  )
                }
                disabled={!readOnly}
              />
            );
          },
        },

        {
          title: 'Full Access',
          width: 100,
          render: (data) => {
            const getData = get(data, 'role_accesses', []).filter((item) => {
              return item.role_id === get(storeUserId, '[0].id', '');
            });
            const fullAccessValue = !!(
              get(getData, '[0].can_write', false) &&
              get(getData, '[0].module_view', false)
            );
            return (
              <Checkbox
                checked={fullAccessValue}
                onChange={(checked) =>
                  onFullAccessChange(
                    checked,
                    get(
                      getData,
                      '[0]',
                      checkedData(
                        data.module_id,
                        get(storeUserId, '[0].id', '')
                      )
                    )
                  )
                }
                disabled={!readOnly}
              />
            );
          },
        },
      ],
    },
  ];

  const handleTableChange = (paginationAlias) => {
    if (paginationAlias) {
      setRoleAccessData([]);
      const { current } = paginationAlias;
      const parameters = new URLSearchParams();
      parameters.append('limit', current);
      parameters.append('page', 'roles');
      history({
        pathname: `/users`,
        search: parameters.toString(),
      });
      fetchRolesData({
        pagination: { pageSize: 10, current },
      });
    } else {
      setRoleAccessData(roleAccessData);
    }
  };
  return (
    <Spin spinning={loading}>
      <div className="box" style={{ padding: '0px 10px' }}>
        <div className="box__header bg-gray-lighter">
          <div>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Space>Roles</Space>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div>
            {showEdit ? (
              <Button
                icon={<EditOutlined />}
                type="primary"
                onClick={editOption}
              >
                Edit Roles
              </Button>
            ) : (
              <Space>
                <Button type="primary" onClick={onFinish}>
                  Save
                </Button>
                <Button danger onClick={onHandleCancel}>
                  Cancel
                </Button>
              </Space>
            )}
          </div>
        </div>
        <div className="box__content p-0">
          <Table
            className="grid-pagination-short orders-table-styles"
            scroll={{ x: 780 }}
            columns={columns}
            pagination={pagination}
            dataSource={filter(roleAccessData, item => item.module_name !== "Pos User" &&
              item.module_name !== "Campaign" && item.module_name !== "Promote" &&
              item.module_name !== "WhatsApp Tool" && item.module_name !== "Delivery Charge")}
            onChange={handleTableChange}
          />
        </div>
      </div>
    </Spin>
  );
};

export default RoleAccess;
