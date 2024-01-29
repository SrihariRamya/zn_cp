import {
  AutoComplete,
  Button,
  Col,
  Empty,
  List,
  Modal,
  notification,
  Row,
  Spin,
} from 'antd';
import { get, isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { FAILED_TO_LOAD } from '../../../../../shared/constant-values';
import {
  createDelhiveryPickupAddress,
  getAllDelhiveryPickupAddress,
  updateDelhiveryPickupAddress,
} from '../../../../../utils/api/url-helper';
import AddPickupAddress from './add-pickup-address';
import DelhiveryPickupAddressItem from './pickup-address-item';

function DelhiveryPickupDetails(parameters) {
  const { handlePickupDetails, pickupDetails } = parameters;
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState('Add');
  const [selectedPickupAddress, setSelectedPickupAddress] = useState({});
  const [addButtonloading, setAddButtonloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pickupAddress, setPickupAddress] = useState([]);
  const [searchOptions, setSearchOptions] = useState([]);
  const [selectedRetrunAddress, setSelectedRetrunAddress] = useState(true);

  const onClose = () => {
    setVisible(false);
  };

  const fetchPickupAddress = () => {
    setLoading(true);
    getAllDelhiveryPickupAddress()
      .then((response) => {
        setLoading(false);
        setPickupAddress(get(response, 'data.rows', []));
        const filterAddress = get(response, 'data.rows', []).map((item) => {
          return {
            value: get(item, 'name', ''),
          };
        });
        setSearchOptions(filterAddress);
      })
      .catch((error) => {
        setLoading(false);
        notification.error({
          message: get(error, 'message', false) || FAILED_TO_LOAD,
        });
      });
  };

  const addPickupAddress = (parameter) => {
    setAddButtonloading(true);
    createDelhiveryPickupAddress(parameter)
      .then(() => {
        setAddButtonloading(false);
        setVisible(false);
        fetchPickupAddress();
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
    updateDelhiveryPickupAddress(
      get(selectedPickupAddress, 'delhivery_pickup_address_id', ''),
      parameter
    )
      .then(() => {
        setAddButtonloading(false);
        setVisible(false);
        fetchPickupAddress();
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
      registered_name: get(address, 'registered_name', ''),
      email: get(address, 'email', ''),
      phone: get(address, 'phone', ''),
      address: get(address, 'address', ''),
      address_2: get(address, 'address_2', ''),
      city: get(address, 'city', ''),
      state: get(address, 'state', 'Tamil Nadu'),
      country: get(address, 'country', 'India'),
      pin: get(address, 'pin', ''),
      return_address: selectedRetrunAddress
        ? get(address, 'address', '')
        : get(address, 'return_address', ''),
      return_address_2: selectedRetrunAddress
        ? get(address, 'address_2', '')
        : get(address, 'return_address_2', ''),
      return_pin: selectedRetrunAddress
        ? get(address, 'pin', '')
        : get(address, 'return_pin', ''),
      return_city: selectedRetrunAddress
        ? get(address, 'city', '')
        : get(address, 'return_city', ''),
      return_state: selectedRetrunAddress
        ? get(address, 'state', '')
        : get(address, 'return_state', ''),
      return_country: get(address, 'country', 'India'),
    };
    if (mode === `Edit`) {
      updatePickupAddress(parameter);
    } else {
      addPickupAddress(parameter);
    }
  };

  useEffect(() => {
    fetchPickupAddress();
  }, []);

  const onSelect = (value) => {
    const findAddress = pickupAddress.find((item) => {
      return get(item, 'name', '') === value;
    });
    if (!isEmpty(findAddress)) {
      handlePickupDetails(findAddress);
    }
  };
  const addressModalOpen = () => {
    setSelectedPickupAddress({});
    setMode('Add');
    setVisible(true);
  };
  const handelEditMode = (address) => {
    setSelectedPickupAddress(address);
    setSelectedRetrunAddress(false);
    setMode('Edit');
    setVisible(true);
  };
  return (
    <Spin spinning={loading}>
      <div className="pickup-details-container">
        <div className="pickup-list-container">
          <div className="recently-address-title">Pickup Addresses</div>
          <Row>
            <Col span={12}>
              <div className="mt-20">
                <AutoComplete
                  placeholder="Search pickup address here by name"
                  options={searchOptions}
                  onSelect={onSelect}
                  filterOption={(input, option) =>
                    option.value.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="flex-end mt-20">
                <Button
                  onClick={() => {
                    addressModalOpen();
                  }}
                  type="primary"
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
              grid={{ column: window.innerWidth < 768 ? 1 : 2 }}
              pagination={{
                pageSize: 6,
              }}
              dataSource={pickupAddress}
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
          title={
            mode === 'Add' ? 'Add New Pickup Address' : 'Edit Pickup Address'
          }
          destroyOnClose
          visible={visible}
          onCancel={onClose}
          footer={false}
          style={{ top: '10px' }}
          width={800}
        >
          <AddPickupAddress
            address={selectedPickupAddress}
            handleAddAddress={handleAddAddress}
            mode={mode}
            addButtonloading={addButtonloading}
            onClose={onClose}
            selectedRetrunAddress={selectedRetrunAddress}
            setSelectedRetrunAddress={setSelectedRetrunAddress}
          />
        </Modal>
      </div>
    </Spin>
  );
}
export default DelhiveryPickupDetails;
