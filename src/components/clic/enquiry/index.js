import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Button,
  Modal,
  Input,
  Spin,
  Card,
  notification,
  Collapse,
  Form,
  Radio,
} from 'antd';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import moment from 'moment';
import { get, isEmpty } from 'lodash';
import '../social-leads/social-leads.less';
import List from '../social-leads/lead-list';
import {
  createEnquiryLead,
  deleteEnquiryLead,
  getAllEnquiryData,
  getAllEnquiryLeads,
  getClicProductNames,
  updateEnquiryData,
  updateEnquiryLead,
} from '../../../utils/api/url-helper';
import EnquireDetails from './enquire-details';
import {
  ALL,
  ENQUIRY_BREAD_TITLE,
  LASTMONTH,
  LASTWEEK,
  LASTYEAR,
  TODAY,
  YESTERDAY,
} from '../../../shared/constant-values';
import './clic-enquiry.less';
import HeadingWithFilter from '../heading-with-filter';

const { Panel } = Collapse;

const EnquiryLeads = () => {
  const [enquiryItems, setEnquiryItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadsCategory, setLeadsCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentLeadName, setCurrentLeadName] = useState();
  const [buttonLoading, setButtonLoading] = useState(true);
  const [deleteLeadOption, setDeleteLeadOption] = useState('loseAll');
  const [selectedFilterDate, setSelectedFilterDate] = useState(ALL);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [productNames, setProductNames] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    const payload = {};
    if (startDate) payload.startDate = startDate;
    if (endDate) payload.endDate = endDate;
    if (!isEmpty(selectedProduct)) payload.productUid = selectedProduct;
    Promise.all([
      getAllEnquiryLeads(),
      getAllEnquiryData(payload),
      getClicProductNames({ module: 'enquiry' }),
    ])
      .then((resp) => {
        const addTitle = { title: '+' };
        const newEnquiryData = [...get(resp, '[1].data', []), addTitle];
        const shiftElemets = newEnquiryData.splice(1, 1);
        setEnquiryItems([...newEnquiryData, ...shiftElemets]);
        const enquiryLeadTitle = get(resp, '[0].data', []);
        const newTitle = [...enquiryLeadTitle, addTitle];
        setLeadsCategory(newTitle);
        const filterByProduct = get(resp, '[2].data', []).map((value) => {
          if (selectedProduct.includes(value.product_uid)) value.checked = true;
          else value.checked = false;
          return value;
        });
        setProductNames(filterByProduct);
        setLoading(false);
      })
      .catch((error) => {
        notification.error({ message: error.message });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, selectedProduct]);

  const handleDatteFilter = (value) => {
    setSelectedFilterDate(value);
    if (value === TODAY) {
      setStartDate(moment().startOf('day').format());
      setEndDate(moment().endOf('day').format());
    } else if (value === YESTERDAY) {
      setStartDate(moment().startOf('day').subtract(1, 'days').format());
      setEndDate(moment().subtract(1, 'days').endOf('day').format());
    } else if (value === LASTWEEK) {
      setStartDate(moment().startOf('week').subtract(7, 'days').format());
      setEndDate(moment().endOf('week').subtract(7, 'days').format());
    } else if (value === LASTMONTH) {
      setStartDate(moment().subtract(1, 'months').startOf('month').format());
      setEndDate(moment().subtract(1, 'months').endOf('month').format());
    } else if (value === LASTYEAR) {
      setStartDate(moment().subtract(1, 'years').startOf('year').format());
      setEndDate(moment().subtract(1, 'years').endOf('year').format());
    } else if (value === ALL) {
      setEndDate('');
      setStartDate('');
    }
  };

  const productDateFilter = (date) => {
    if (date) {
      setStartDate(
        moment(get(date, '[0]', '')).isValid()
          ? moment(get(date, '[0]', '')).startOf('day').format()
          : ''
      );
      setEndDate(
        moment(get(date, '[1]', '')).isValid()
          ? moment(get(date, '[1]', '')).startOf('day').format()
          : ''
      );
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const id = result.draggableId;
    const payload = {
      enquiry_leads_uid: result.destination.droppableId,
      position: result?.destination?.index + 1,
    };
    setLoading(true);
    updateEnquiryData(id, payload)
      .then((resp) => {
        if (resp.success) {
          fetchData();
          setLoading(false);
        }
      })
      .catch((error) => {
        notification.error({ message: error.message });
        setLoading(false);
      });
  };

  const onInputChange = (event) => {
    setLeadName(event.target.value);
  };

  const handleAddNewLead = () => {
    setButtonLoading();
    const payload = { title: leadName, name: leadName.toLocaleLowerCase() };
    createEnquiryLead(payload)
      .then((resp) => {
        if (resp.success) {
          fetchData();
          setShowModal(false);
          setLoading(false);
          setButtonLoading(false);
        }
      })
      .catch((error) => {
        notification.error({ message: error.message });
        setShowModal(false);
        setLoading(false);
        setButtonLoading(false);
      });
  };

  const handleEditLead = (value, previousLead) => {
    const payload = {
      title: value,
      name: value.toLocaleLowerCase(),
    };
    const id = previousLead.enquiry_leads_uid;
    updateEnquiryLead(id, payload)
      .then((resp) => {
        if (resp.success) {
          fetchData();
          setShowModal(false);
          setLoading(false);
        }
      })
      .catch((error) => {
        notification.error({ message: error.message });
        setShowModal(false);
        setLoading(false);
      });
  };

  const handleDeleteLead = (value) => {
    setCurrentLeadName(value);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    const id = currentLeadName.enquiry_leads_uid;
    let payload = {};
    if (deleteLeadOption === 'moveAll') {
      const filterValues = enquiryItems.filter((item) => item.title !== '+');
      const enquiryUid = currentLeadName.enquiry_data.map(
        (data) => data.enquiry_uid
      );
      const selectedData = filterValues.findIndex(
        (item) => item.enquiry_leads_uid === currentLeadName.enquiry_leads_uid
      );
      payload = {
        enquiryUid,
        enquiryLeadsUid: filterValues[selectedData + 1].enquiry_leads_uid,
      };
    }
    setLoading(true);
    deleteEnquiryLead(id, payload)
      .then((resp) => {
        if (resp.success) {
          fetchData();
          setShowModal(false);
          setLoading(false);
          setShowDeleteModal(false);
          window.location.reload();
        }
      })
      .catch((error) => {
        notification.error({ message: error.message });
        setShowModal(false);
        setShowDeleteModal(false);
        setLoading(false);
      });
  };

  const handleDeleteLeadOptionChange = (event) => {
    setDeleteLeadOption(event.target.value);
  };

  const handleProductLevelFilter = (value) => {
    productNames.forEach((item) => {
      if (value.includes(item.product_uid)) item.checked = true;
      else item.checked = false;
    });
    setSelectedProduct(value);
    fetchData();
  };

  return (
    <Spin spinning={loading}>
      <div className="clic-product-container clic-enquiry-container">
        <HeadingWithFilter
          title={ENQUIRY_BREAD_TITLE}
          productDateFilter={productDateFilter}
          productNames={productNames}
          selectedFilterDate={selectedFilterDate}
          handleDatteFilter={handleDatteFilter}
          handleProductLevelFilter={handleProductLevelFilter}
        />
        <div className="leads-section-container">
          <DragDropContext onDragEnd={onDragEnd}>
            <Row
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
              }}
              gutter={[16, 16]}
              className="mt-10"
            >
              {enquiryItems?.map((category, leadIndex) => (
                <>
                  {category.title === '+' ? (
                    <Col span={1}>
                      <Button
                        onClick={() => setShowModal(true)}
                        className="add-lead-btn"
                      >
                        +
                      </Button>
                    </Col>
                  ) : (
                    <Col span={5} key={category.enquiry_leads_id}>
                      <div>
                        <List
                          bgColor={category.bgColor}
                          onInputChange={onInputChange}
                          handleEditLead={handleEditLead}
                          handleDeleteLead={handleDeleteLead}
                          setShowDeleteModal={setShowDeleteModal}
                          showDeleteModal={showDeleteModal}
                          listId={leadIndex}
                          totalListLength={leadsCategory.length}
                          data={category}
                        >
                          <div style={{ minHeight: '50px' }}>
                            {category.enquiry_data?.map((item, index) => (
                              <Draggable
                                key={item.enquiry_uid}
                                draggableId={`${item.enquiry_uid}`}
                                index={index}
                              >
                                {(provided) => {
                                  const enquiryFields = JSON.parse(
                                    item.enquiry_fields
                                  );
                                  return (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <Card className="mt-10 lead-card">
                                        <div>
                                          <div className="title">
                                            {item.product_name}
                                          </div>
                                          <div className="sub-title">
                                            {item.reference_number}
                                          </div>
                                          <div className="enquire-details-form-container">
                                            <Collapse ghost>
                                              <Panel header="Details" key="1">
                                                <Form form={form}>
                                                  {enquiryFields.map(
                                                    (field) => (
                                                      <EnquireDetails
                                                        field={field}
                                                      />
                                                    )
                                                  )}
                                                </Form>
                                              </Panel>
                                            </Collapse>
                                          </div>
                                          <div className="enquire-date">
                                            {moment(item.modified_date).format(
                                              'DD.MM.YYYY hh:mm A'
                                            )}
                                          </div>
                                        </div>
                                      </Card>
                                    </div>
                                  );
                                }}
                              </Draggable>
                            ))}
                          </div>
                        </List>
                      </div>
                    </Col>
                  )}
                </>
              ))}
            </Row>
          </DragDropContext>
        </div>
        <Modal
          width={350}
          visible={showModal}
          onOk={handleAddNewLead}
          onCancel={() => setShowModal(false)}
          okButtonProps={{
            buttonLoading,
          }}
          destroyOnClose
          title="Add Lead Category"
          className="lead-modal"
        >
          <h4>Add Lead</h4>
          <h5>Create New Lead Category</h5>
          <Input
            onChange={onInputChange}
            placeholder="Enter Name"
            className="mt-20"
          />
        </Modal>
        <Modal
          width={400}
          visible={showDeleteModal}
          onOk={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          destroyOnClose
          title="Alert"
          className="lead-modal lead-delete-modal"
        >
          <h4>If you delete the category</h4>
          <div className="delete-modal-info">
            <Radio.Group
              onChange={handleDeleteLeadOptionChange}
              defaultValue={deleteLeadOption}
            >
              <Radio value="loseAll">lose all the leads from Category</Radio>
              <Radio value="moveAll">move all the leads to next Category</Radio>
            </Radio.Group>
          </div>
        </Modal>
      </div>
    </Spin>
  );
};

export default EnquiryLeads;
