import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import {
  Breadcrumb,
  Divider,
  Space,
  Row,
  Col,
  Typography,
  Card,
  Spin,
  Button,
} from 'antd';
import _, { get } from 'lodash';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import Geocode from 'react-geocode';
import { deleteStore } from '../../utils/api/url-helper';
import {
  STORE_DELETE_SUCCESS,
  STORE_DELETE_FAILED,
} from '../../shared/constant-values';
import './store.less';
import { ReactComponent as Stores } from '../../assets/icons/store.svg';
import {
  DeleteAlert,
  DeleteAlertImage,
  DeleteAlertMessage,
  DeleteAlertAssociated,
} from '../../shared/sweetalert-helper';
import { TenantContext } from '../context/tenant-context';
import { defaultImage } from '../../shared/image-helper';
import { withRouter } from '../../utils/react-router/index'

const { Title } = Typography;

const StoreDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState(
    location?.state ? location.state : null
  );
  const [, , , tenantConfig] = useContext(TenantContext);
  const googleMapApiKey = get(tenantConfig, 'GoogleMapAPi', '');
  useEffect(() => {
    setLoading(true);
    if (location?.state) {
      setStoreData(location?.state ? location.state : null);
      setLoading(false);
    }
  }, [id, location?.state]);

  const GoogleMapsAPI = googleMapApiKey;
  Geocode.setApiKey(GoogleMapsAPI);
  Geocode.enableDebug();

  const { latitude } = storeData;
  const { longitude } = storeData;

  const containerStyle = {
    width: '100%',
    height: '200px',
    top: '10px',
    borderRadius: '5px',
  };

  const center = {
    lat: latitude,
    lng: longitude,
  };

  const storeHardDelete = async (value) => {
    const title =
      'This store is associated with one or more user(s)/pos machine(s)';
    const text =
      'Are you sure? The store will be deleted and user(s)/pos machines(s) will be unassociated?';
    const result = await DeleteAlertAssociated(title, text);
    if (result.isConfirmed) {
      setLoading(true);
      deleteStore(value, { forceDelete: true }).then((resp) => {
        if (resp.success) {
          DeleteAlertImage(STORE_DELETE_SUCCESS);
          navigate('/stores');
        } else DeleteAlertMessage(STORE_DELETE_FAILED);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  };
  const goBack = () => {
    navigate(-1)
  }
  const handleDelete = async (event_, value) => {
    const text = 'Are you sure want to delete this store from the list?';
    const result = await DeleteAlert(text);

    if (result.isConfirmed) {
      setLoading(true);
      deleteStore(value)
        .then((response) => {
          if (response.success) {
            DeleteAlertImage(STORE_DELETE_SUCCESS);
            navigate('/stores');
          } else DeleteAlertMessage(STORE_DELETE_FAILED);
          setLoading(false);
        })
        .catch((error__) => {
          let parsedResponse = {};
          try {
            parsedResponse = error__.json();
          } catch {
            parsedResponse = error__;
          }
          if (parsedResponse.message === 'POS/User Associated') {
            storeHardDelete(value);
          } else {
            setLoading(false);
            DeleteAlertMessage({ title: STORE_DELETE_FAILED, icon: 'error' });
          }
        });
    }
  };
  return (
    <Spin spinning={loading}>
      <div className="store-info-details">
        <Space direction="vertical">
          <Title level={5}>
            <Space align="center">
              <Stores />
              Stores
            </Space>
          </Title>
          <Breadcrumb separator=">">
            <Breadcrumb.Item className="breadcrumb-title">
              <Link to="/dashboard">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-title">
              <Link to="/stores">Stores</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-title">
              Store Details
            </Breadcrumb.Item>
          </Breadcrumb>
        </Space>
        <Space className="store-info-details-btn">
          <Link to={`/stores/edit-store/${_.get(storeData, 'store_uid', '')}`}>
            <Button type="primary" icon={<EditOutlined />}>
              Edit Store
            </Button>
          </Link>

          <Button
            type="danger"
            danger
            className="add-btn"
            icon={<DeleteOutlined />}
            onClick={(event) => {
              handleDelete(event, _.get(storeData, 'store_uid', ''));
            }}
          >
            Delete
          </Button>
        </Space>
      </div>
      <Row>
        <Col span={24}>
          <Card className="card card-shadow">
            <Row className="row-padding">
              <Space>
                <ArrowLeftOutlined onClick={goBack} />
                <h4 className="text-green-dark">
                  {_.get(storeData, 'store_name', '')}
                </h4>
              </Space>
              <Divider />
            </Row>
            {storeData?.is_central ? (
              <div className="store-ribbon">
                <div className="ribbon ribbon-top-right">
                  <span>central store</span>
                </div>
              </div>
            ) : (
              ''
            )}
            <Row>
              <Col className="col-padding" xs={24} sm={24} md={7} lg={7} xl={7}>
                <div style={{ width: 300, height: 200 }}>
                  <img
                    src={_.get(storeData, 'image', '') || defaultImage}
                    alt="img.png"
                    className="pr_img"
                  />
                </div>
                <Divider />
                <div>
                  <h5 className="dark-color">Store Location</h5>
                </div>
                <div>
                  <LoadScript
                    googleMapsApiKey={`${googleMapApiKey}&libraries=places`}
                  >
                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={center}
                      zoom={15}
                    >
                      <Marker position={center} />
                      <></>
                    </GoogleMap>
                  </LoadScript>
                </div>
              </Col>
              <Col
                className="col2-padding store-details-location-addr"
                xs={24}
                sm={24}
                md={17}
                lg={17}
                xl={17}
              >
                <Title level={5} className="ml-10 dark-black-color">
                  Store Details
                </Title>
                <h5 className="ml-10 dark-color">Store Location</h5>
                <div className="mt-30">
                  <p className="p-keyf">{storeData?.address_1}</p>
                  <p className="p-keyf">{storeData?.address_2}</p>
                  <p className="p-keyf">{storeData?.city}</p>
                </div>
                <Divider />
                <div className="ml-10">
                  <h5 className="mt-30 dark-color">Contact Person</h5>
                  <p className="mt-10 detail-text">
                    {storeData?.store_person_name}
                  </p>
                </div>
                <Divider />
                <div className="ml-10">
                  <h5 className="m-t_15 dark-color">Contact Person Number</h5>
                  <p className="mt-10 detail-text">
                    {storeData?.country_code}
                    &nbsp;
                    {storeData?.store_person_number}
                  </p>
                </div>
                <Divider />
                <div className="ml-10">
                  <h5 className="m-t_15 dark-color">POS Name</h5>
                  <p className="mt-10 detail-text">
                    {_.get(storeData, 'storePOS', []).map((pos) => (
                      <div>{pos.posMachine.pos_machine_name}</div>
                    ))}
                  </p>
                </div>
                <Divider />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default withRouter(StoreDetails);
