import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import {
  Space,
  Button,
  notification,
  Row,
  Col,
  Tag,
  Table,
  Modal,
  Switch,
  Spin,
  Slider,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { debounce, get } from 'lodash';
import { editColor, getColor } from '../../utils/api/url-helper';
import {
  BGCOLOR_UPDATE_SUCCESS,
  BGCOLOR_UPDATE_FAILED,
  FAILED_TO_LOAD,
} from '../../shared/constant-values';

const ThemeCustomization = () => {
  const [loading, setLoading] = useState(false);
  const [currentColor, setCurrentColor] = useState('');
  const [colorsData, setColorsData] = useState([]);
  const [updateId, setUpdateId] = useState('');
  const [defaults, setDefault] = useState(false);
  const [colorModalVisible, setcolorModalVisible] = useState(false);
  const [modalDefaultColor, setModalDefaultColor] = useState('');

  const fetchData = () => {
    setLoading(true);
    getColor()
      .then((response) => {
        setColorsData(
          get(response, 'data.rows.[0].custom_theme_components', [])
        );
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBGColorChange = (color) => {
    setCurrentColor(color.hex);
  };

  const handleCancel = () => {
    setCurrentColor('');
    setUpdateId('');
    setDefault(false);
    setcolorModalVisible(false);
  };

  const handleUpdate = (item, Default) => {
    let formData = {};
    if (Default) {
      formData = item;
    } else {
      formData = {
        id: updateId,
        variable_value: currentColor,
        is_default: defaults,
      };
    }
    editColor(formData)
      .then(() => {
        notification.success({ message: BGCOLOR_UPDATE_SUCCESS });
        handleCancel();
        fetchData();
      })
      .catch(() => {
        notification.error({ message: BGCOLOR_UPDATE_FAILED });
        handleCancel();
        fetchData();
      });
  };

  const handleClick = (value, id, isDefault, defaultColor) => {
    setUpdateId(id);
    setCurrentColor(value);
    setDefault(isDefault);
    setcolorModalVisible(true);
    setModalDefaultColor(defaultColor);
  };

  const themeColumn = [
    {
      title: 'Components',
      dataIndex: 'component_name',
      key: 'component_name',
      render: (item) => <span className="text-green-dark">{item}</span>,
    },
  ];

  const debounceUpdateFunction = debounce((daa, item) => {
    handleUpdate(
      {
        id: get(item, 'id', 0),
        variable_value: `${daa}%`,
      },
      'default'
    );
  }, 500);

  const expandedRowRender = (data) => {
    const renderData = data.theme_variables;
    const columns = [
      {
        title: 'Sub Components',
        key: 'theme_variables',
        width: '30%',
        render: (item) => (
          <span>
            {get(item, 'variable_name', '')
              .replace('--', '')
              .replaceAll('-', ' ')}
          </span>
        ),
      },
      {
        title: 'Custom Variable',
        key: 'theme_variables',
        render: (item) => (
          <>
            <span>{get(item, 'variable_value', '')}</span>
            &nbsp;
            <Tag color={get(item, 'variable_value', '')}>
              &nbsp;&nbsp; &nbsp;
            </Tag>
            &nbsp;&nbsp;
            <Switch
              size="small"
              checked={get(item, 'is_default', false)}
              onChange={(value) => {
                handleUpdate(
                  {
                    id: get(item, 'id', 0),
                    variable_value: get(item, 'variable_value', ''),
                    is_default: value,
                  },
                  'default'
                );
              }}
            />
          </>
        ),
      },
      {
        title: 'Flexible Default Variable',
        key: 'theme_variables',
        render: (item) => (
          <>
            <span>{get(item, 'default_value', '')}</span>
            <Tag color={get(item, 'default_value', '')}>
              &nbsp;&nbsp; &nbsp;
            </Tag>
          </>
        ),
      },
      {
        title: 'Actions',
        key: 'theme_variables',
        render: (item) => (
          <>
            {item.variable_type === 'color' && (
              <Tag
                color="green"
                onClick={() =>
                  handleClick(
                    get(item, 'variable_value', ''),
                    get(item, 'id', 0),
                    get(item, 'is_default', false),
                    get(item, 'default_value', '')
                  )
                }
              >
                <EditOutlined />
              </Tag>
            )}
            {item.variable_type === 'percentage' && (
              <Slider
                min={1}
                max={100}
                onChange={(value) => {
                  debounceUpdateFunction(value, item);
                }}
                value={parseInt(get(item, 'variable_value', 50), 10)}
              />
            )}
          </>
        ),
      },
    ];

    return (
      <Table
        dataSource={renderData}
        columns={columns}
        pagination={false}
        size="small"
      />
    );
  };

  return (
    <div className="box mobile-side-padding">
      <div className="box__header bg-gray-lighter">
        <h3>Theme Customization</h3>
      </div>
      <Spin spinning={loading}>
        <div className="box-content-background">
          <div className="app-feature theme-customize-table-box">
            <Col xs={24} sm={24} md={18} lg={18} xl={18}>
              <Table
                dataSource={colorsData}
                columns={themeColumn}
                showHeader={false}
                size="small"
                title={() => <h3>Components</h3>}
                rowKey="component_id"
                expandable={{ expandedRowRender }}
                pagination={false}
                scroll={{ x: 780 }}
              />
            </Col>
          </div>
        </div>
        <Modal
          title="Edit Themes"
          visible={colorModalVisible}
          onCancel={handleCancel}
          footer={false}
          width={300}
        >
          <b className="text-primary">Color Picker</b>
          <br />
          <br />
          <SketchPicker
            color={currentColor}
            onChange={handleBGColorChange}
            width={230}
          />
          <br />
          <b className="text-primary">Set Custom Color</b>
          &nbsp;&nbsp;
          <Switch
            size="small"
            onChange={(value) => {
              setDefault(value);
            }}
            checked={defaults}
          />{' '}
          &nbsp;&nbsp; <span>{currentColor}</span> &nbsp;
          <Tag color={currentColor}>&nbsp;&nbsp; &nbsp;</Tag>
          <br />
          <br />
          <b className="text-primary">Default Color</b>
          &nbsp;&nbsp; <span>{modalDefaultColor}</span>
          &nbsp;
          <Tag color={modalDefaultColor}>&nbsp;&nbsp; &nbsp;</Tag>
          &nbsp;&nbsp;
          <br />
          <br />
          <Row>
            <Space>
              <Button type="primary" onClick={handleUpdate}>
                Save
              </Button>
              <Button danger onClick={handleCancel}>
                cancel
              </Button>
            </Space>
          </Row>
        </Modal>
      </Spin>
    </div>
  );
};

export default ThemeCustomization;
