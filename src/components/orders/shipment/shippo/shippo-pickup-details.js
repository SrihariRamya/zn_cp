import {
  Button,
  Col,
  Empty,
  List,
  Modal,
  notification,
  Row,
  Spin,
  Select,
} from 'antd';
import { get, isEmpty, map } from 'lodash';
import React, { useEffect, useState } from 'react';
import { FAILED_TO_LOAD } from '../../../../shared/constant-values';
import {
  createShippoPickupAddress,
  getshippoPickupAddress,
  updateShippoPickupAddress,
} from '../../../../utils/api/url-helper';
import AddShippoPickupAddress from './add-address';
import DelhiveryPickupAddressItem from '../delhivery/delhivery-pickup-details/pickup-address-item';

const { Option } = Select;

function ShippoPickupDetails(properties) {
  const { handlePickupDetails, pickupDetails } = properties;
  const [searchOptions, setSearchOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickupAddress, setPickupAddress] = useState([]);
  const [visible, setIsVisible] = useState(false);
  const [mode, setMode] = useState('Add');
  const [selectedPickupAddress, setSelectedAddress] = useState({});
  const [addButtonloading, setAddButtonloading] = useState(false);

  const onClose = () => {
    setIsVisible(false);
  };

  const fetchAddress = () => {
    setLoading(true);
    getshippoPickupAddress()
      .then((response) => {
        setPickupAddress(get(response, 'data.rows', []));
        setLoading(false);
        const filterData = map(get(response, 'data.rows', []), (item) => {
          return {
            value: get(item, 'name', ''),
          };
        });
        setSearchOptions(filterData);
      })
      .catch(() => {
        notification.error({
          message: FAILED_TO_LOAD,
        });
        setLoading(false);
      });
  };

  const addPickupAddress = (parameter) => {
    setAddButtonloading(true);
    createShippoPickupAddress(parameter)
      .then(() => {
        setAddButtonloading(false);
        setIsVisible(false);
        fetchAddress();
      })
      .catch((error) => {
        setAddButtonloading(false);
        notification.error({
          message:
            get(error, 'pickupAddress.error[0]', false) || FAILED_TO_LOAD,
        });
      });
  };

  const updatePickupAddress = (parameter) => {
    setAddButtonloading(true);
    updateShippoPickupAddress(
      get(selectedPickupAddress, 'shippo_pickup_address_id', ''),
      parameter
    )
      .then(() => {
        setAddButtonloading(false);
        setIsVisible(false);
        fetchAddress();
      })
      .catch((error) => {
        setAddButtonloading(false);
        notification.error({
          message:
            get(error, 'pickupAddress.error[0]', false) || FAILED_TO_LOAD,
        });
      });
  };

  const handleAddAddress = (address) => {
    const parameter = {
      name: get(address, 'name', ''),
      state: get(address, 'state', ''),
      country: get(address, 'country', ''),
      pin: get(address, 'pin', ''),
      email: get(address, 'email', ''),
      city: get(address, 'city', ''),
      phone: get(address, 'phone', ''),
      address: get(address, 'address', ''),
      address_2: get(address, 'address_2', ''),
    };
    if (mode === `Edit`) {
      updatePickupAddress(parameter);
    } else {
      addPickupAddress(parameter);
    }
    handlePickupDetails('');
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  const onSelect = (value) => {
    const findData = pickupAddress.find((item) => {
      return get(item, 'name', '') === value;
    });
    if (!isEmpty(findData)) {
      handlePickupDetails(findData);
    }
  };
  const addressModalOpen = () => {
    setMode('Add');
    setSelectedAddress({});
    setIsVisible(true);
  };
  const handelEditMode = (address) => {
    setSelectedAddress(address);
    setIsVisible(true);
    setMode('Edit');
  };

  return (
    <Spin spinning={loading}>
      <div className="pickup-details-container">
        <div className="pickup-list-container">
          <div className="recently-address-title">Pickup Addresses</div>
          <Row>
            <Col span={12}>
              <div className="mt-20 shippo-select">
                <Select
                  placeholder="Search address here by name"
                  showSearch
                  virtual={false}
                  onChange={onSelect}
                  filterOption={(input, option) =>
                    option.value.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {map(searchOptions, (search) => (
                    <Option
                      key={get(search, 'value', '')}
                      value={get(search, 'value', '')}
                    >
                      {get(search, 'value', '')}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div className="flex-end mt-20">
                <Button
                  type="primary"
                  onClick={() => {
                    addressModalOpen();
                  }}
                >
                  Add Address
                </Button>
              </div>
            </Col>
          </Row>
          {isEmpty(pickupAddress) ? (
            <div>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            <List
              dataSource={pickupAddress}
              pagination={{
                pageSize: 6,
              }}
              grid={{ column: window.innerWidth < 768 ? 1 : 2 }}
              renderItem={(item) => (
                <List.Item>
                  <DelhiveryPickupAddressItem
                    address={item}
                    handlePickupDetails={handlePickupDetails}
                    pickupDetails={pickupDetails}
                    handelEditMode={handelEditMode}
                  />
                </List.Item>
              )}
            />
          )}
        </div>
        <Modal
          destroyOnClose
          title={
            mode === 'Add' ? 'Add New Pickup Address' : 'Edit Pickup Address'
          }
          onCancel={onClose}
          visible={visible}
          style={{ top: '10px' }}
          width={800}
          footer={false}
        >
          <AddShippoPickupAddress
            address={selectedPickupAddress}
            handleAddAddress={handleAddAddress}
            mode={mode}
            addButtonloading={addButtonloading}
            onClose={onClose}
          />
        </Modal>
      </div>
    </Spin>
  );
}
export default ShippoPickupDetails;
