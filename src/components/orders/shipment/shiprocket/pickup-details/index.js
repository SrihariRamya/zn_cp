/* eslint-disable unicorn/no-null */
/* eslint-disable jsx-a11y/img-redundant-alt */
import {
  AutoComplete,
  Button,
  Col,
  Drawer,
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
  AddPickupAddress,
  getAllPickupAddress,
} from '../../../../../utils/api/url-helper';
import AddNewAddress from './add-new-address';
import PickupAddressItem from './pickup-address-item';
import VerifyAddress from './verify-address';
import Add from './icons/Add.svg';

function PickupDetails(parameters) {
  const { handlePickupDetails, pickupDetails } = parameters;
  const [visible, setVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState(
    'Verify Phone Number To Verify Address'
  );
  const [mode, setMode] = useState('Add');
  const [selectAddress, setSelectAddress] = useState({});
  const [otpVerify, setOtpVerify] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addButtonloading, setAddButtonloading] = useState(false);
  const [pickupAddress, setPickupAddress] = useState({});
  const [searchOptions, setSearchOptions] = useState([]);
  const [totalPickupAddress, setTotalPickupAddress] = useState({});
  const onClose = () => {
    setVisible(false);
  };

  const fetchPickupAddress = () => {
    setLoading(true);
    getAllPickupAddress()
      .then((response) => {
        setLoading(false);
        setPickupAddress(get(response, 'allPickupLocation.data', []));
        const mergeAddres = [
          ...get(response, 'allPickupLocation.data.shipping_address', []),
          ...get(response, 'allPickupLocation.data.recent_addresses', []),
        ];
        setTotalPickupAddress(mergeAddres);
        const filterAddress = mergeAddres.map((item) => {
          return {
            value: get(item, 'pickup_location', ''),
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

  const addPickupAddress = (address) => {
    setAddButtonloading(true);
    const parameter = {
      pickup_location: get(address, 'pickup_location', ''),
      name: get(address, 'name', ''),
      email: get(address, 'email', ''),
      phone: get(address, 'phone', ''),
      address: get(address, 'address', ''),
      address_2: get(address, 'address_2', ''),
      city: get(address, 'city', ''),
      state: get(address, 'state', 'Tamil Nadu'),
      country: get(address, 'country', 'India'),
      pin_code: get(address, 'pin_code', ''),
    };
    AddPickupAddress(parameter)
      .then(() => {
        setAddButtonloading(false);
        setVisible(false);
        fetchPickupAddress();
      })
      .catch((error) => {
        setAddButtonloading(false);
        if (get(error, 'message', '').includes('Address line 1')) {
          notification.error({
            message:
              'Complete address should have House no / Flat no / Road no',
          });
        } else if (get(error, 'message', '').includes('nick name')) {
          notification.error({
            message: 'Tag name already exits',
          });
        } else {
          notification.error({
            message: get(error, 'message', false) || FAILED_TO_LOAD,
          });
        }
      });
  };

  useEffect(() => {
    fetchPickupAddress();
  }, []);

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const VerifyModalOpen = (value) => {
    setSelectAddress(value);
    setModalTitle('Pickup Address Verfication');
    setIsModalVisible(false);
  };

  const sentToOtp = () => {
    setOtpVerify(true);
  };

  const otpVerifyAddress = () => {
    setOtpVerify(false);
  };

  const handleAddAddress = (address) => {
    addPickupAddress(address);
  };

  const addressModalOpen = () => {
    setSelectAddress({});
    setMode('Add');
    setVisible(true);
  };
  const onSelect = (value) => {
    const findAddress = totalPickupAddress.find((item) => {
      return get(item, 'pickup_location', '') === value;
    });
    if (!isEmpty(findAddress)) {
      handlePickupDetails(findAddress);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="pickup-details-container">
        <div className="pickup-in-container">
          <div className="pickup-details-title">Pickup Address</div>
          <Row>
            <Col md={9} xs={12}>
              <div className="mt-20">
                <AutoComplete
                  placeholder="Search pickup address here by Tag Name"
                  options={searchOptions}
                  onSearch
                  onSelect={onSelect}
                  filterOption={(input, option) =>
                    option.value.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>
            </Col>
            <Col md={9} xs={12}>
              <div className="flex-end mt-20">
                <Button
                  onClick={() => {
                    addressModalOpen();
                  }}
                  type="primary"
                >
                  <span>
                    <img
                      src={Add}
                      style={{ marginRight: '12px' }}
                      alt="Image"
                    />
                  </span>{' '}
                  Add Address
                </Button>
              </div>
            </Col>
          </Row>
          <div style={{ width: '100%' }} className="pickup-list-container">
            <div className="recently-address-title">
              Recently Used Addresses
            </div>
            <div>
              <strong>Note:</strong>
              <i>Verify the address in your shiprocket account</i>
            </div>
            {get(pickupAddress, 'recent_addresses', []).length > 0 ? (
              <List
                className="recent-address"
                grid={{ md: 3, xs: 1 }}
                pagination={{
                  pageSize: 6,
                }}
                dataSource={get(pickupAddress, 'recent_addresses', [])}
                renderItem={(item) => (
                  <List.Item>
                    <PickupAddressItem
                      address={item}
                      handlePickupDetails={handlePickupDetails}
                      pickupDetails={pickupDetails}
                      VerifyModalOpen={(value) => {
                        VerifyModalOpen(value);
                      }}
                      addressModalOpen={addressModalOpen}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )}
          </div>
          <Row className="row-class">
            <div className="pickup-list-container">
              <div className="recently-address-title">Other Addresses</div>
              {get(pickupAddress, 'shipping_address', []).length > 0 ? (
                <List
                  className="list-container"
                  grid={{ md: 3, xs: 1, sm: 3 }}
                  pagination={{
                    pageSize: 8,
                  }}
                  dataSource={get(pickupAddress, 'shipping_address', [])}
                  renderItem={(item) => (
                    <List.Item>
                      <PickupAddressItem
                        address={item}
                        handlePickupDetails={handlePickupDetails}
                        pickupDetails={pickupDetails}
                        VerifyModalOpen={(value) => {
                          VerifyModalOpen(value);
                        }}
                        addressModalOpen={addressModalOpen}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div>
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              )}
            </div>
          </Row>
        </div>
        <Drawer
          className="add-address-drawer"
          title={
            mode === 'Add' ? 'Add New Pickup Address' : 'Edit Pickup Address'
          }
          destroyOnClose
          visible={visible}
          onClose={onClose}
          width={900}
          maskClosable={false}
        >
          <AddNewAddress
            address={selectAddress}
            handleAddAddress={handleAddAddress}
            mode={mode}
            addButtonloading={addButtonloading}
            onClose={onClose}
          />
        </Drawer>
        <Modal
          title={modalTitle}
          visible={isModalVisible}
          destroyOnClose
          footer={null}
          onCancel={handleCancel}
        >
          <VerifyAddress
            sentToOtp={sentToOtp}
            otpVerify={otpVerify}
            address={selectAddress}
            otpVerifyAddress={otpVerifyAddress}
          />
        </Modal>
      </div>
    </Spin>
  );
}
export default PickupDetails;
