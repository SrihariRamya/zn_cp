import React, { useState } from 'react';
import {
  Breadcrumb,
  Space,
  Row,
  Col,
  Button,
  Modal,
  Input,
  Select,
  Spin,
} from 'antd';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import LeadsCard from './lead-card';
import List from './lead-list';
import { LEADS_BREAD_TITLE } from '../../../shared/constant-values';
import './social-leads.less';

const { Option } = Select;

const SocialLeads = () => {
  const leadsCategoryDummy = [
    { title: 'Plan', name: 'plan', bgColor: '#D8F2F2' },
    { title: '+' },
    {
      title: 'Discard',
      name: 'discard',
      bgColor: '#D2DDF3',
    },
  ];
  const itemsNormal = {
    plan: [
      {
        id: 1,
        uuid: '52f9df20-9393-4c4d-b72c-7bfa4398a4477',
        title: 'Customer 1',
        subtitle: '#1111111',
        updatedAt: '18.04.2023 5:41 PM',
      },
      {
        id: 2,
        uuid: '52f9df20-9393-4c4d-b72c-7bfa4398a448',
        title: 'Customer 2',
        subtitle: '#111111111',
        updatedAt: '18.04.2023 5:41 PM',
      },
      {
        id: 3,
        uuid: '52f9df20-9393-4c4d-b72c-7bfa4398a449',
        title: 'Customer 3',
        subtitle: '#11111111',
        updatedAt: '18.04.2023 5:41 PM',
      },
    ],
    discard: [
      {
        id: 5,
        uuid: '52f9df20-9393-4c4d-b72c-7bfa4398a450',
        title: 'Customer 1',
        subtitle: '#1111111',
        updatedAt: '18.04.2023 5:41 PM',
      },
      {
        id: 6,
        uuid: '52f9df20-9393-4c4d-b72c-7bfa4398a451',
        title: 'Customer 2',
        subtitle: '#1111111',
        updatedAt: '18.04.2023 5:41 PM',
      },
    ],
  };

  const [leadsData, setLeadsData] = useState(itemsNormal);
  const [showModal, setShowModal] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadsCategory, setLeadsCategory] = useState(leadsCategoryDummy);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentLeadName, setCurrentLeadName] = useState();

  const removeFromList = (list, index) => {
    const result = Array.from(list);
    const [removed] = result.splice(index, 1);
    return [removed, result];
  };

  const addToList = (list, index, element) => {
    const result = Array.from(list);
    result.splice(index, 0, element);
    return result;
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const listCopy = { ...leadsData };
    const sourceList = listCopy[result.source.droppableId];
    const [removedElement, newSourceList] = removeFromList(
      sourceList,
      result.source.index
    );
    listCopy[result.source.droppableId] = newSourceList;

    const destinationList = listCopy[result.destination.droppableId];
    listCopy[result.destination.droppableId] = addToList(
      destinationList,
      result.destination.index,
      removedElement
    );
    setLeadsData(listCopy);
  };

  const onInputChange = (event) => {
    setLeadName(event.target.value);
  };

  const handleAddNewLead = () => {
    setLoading(true);
    const newLead = {
      leadTitle: leadName,
      leadName: leadName.toLocaleLowerCase(),
      bgColor: '#D8F2F2',
      isDeleted: 0,
    };
    const newLeadCategory = [
      ...leadsCategory.slice(0, 1),
      newLead,
      ...leadsCategory.slice(1),
    ];
    setLeadsCategory(newLeadCategory);
    setLeadsData({ ...leadsData, [leadName.toLocaleLowerCase()]: [] });
    setTimeout(() => {
      setShowModal(false);
      setLoading(false);
    }, 2000);
  };

  const handleEditLead = (value, previousLeadName) => {
    const editedLead = leadsCategory.map((item) => {
      if (item.leadName === previousLeadName) {
        item.leadTitle = value;
        item.leadName = value.toLocaleLowerCase();
      }
      return item;
    });
    setLeadsCategory(editedLead);
    const newLeadsData = leadsData;
    newLeadsData[value.toLocaleLowerCase()] = newLeadsData[previousLeadName];
    delete newLeadsData[previousLeadName];
    setLeadsData(newLeadsData);
  };

  const handleDeleteLead = (value) => {
    setCurrentLeadName(value);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    setLeadsCategory(
      leadsCategory.filter((item) => item.leadName !== currentLeadName)
    );
    setShowDeleteModal(false);
  };

  return (
    <Spin spinning={loading}>
      <div className="clic-product-container">
        <div>
          <div className="lead-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Space>{LEADS_BREAD_TITLE}</Space>
              </Breadcrumb.Item>
            </Breadcrumb>
            <Select virtual={false} defaultValue="today" style={{ width: 150 }}>
              <Option value="today">Today</Option>
              <Option value="yesterday">Yesterday</Option>
              <Option value="lastweek">Lastweek</Option>
            </Select>
          </div>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Row gutter={[16, 16]} className="mt-20 leads-section-container">
            {leadsCategory?.map((category, leadIndex) => (
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
                  <Col span={5} key={category.leadName}>
                    <List
                      onDragEnd={onDragEnd}
                      onInputChange={onInputChange}
                      handleEditLead={handleEditLead}
                      handleDeleteLead={handleDeleteLead}
                      setShowDeleteModal={setShowDeleteModal}
                      showDeleteModal={showDeleteModal}
                      listId={leadIndex}
                      totalListLength={leadsCategory.length}
                      data={{
                        title: category.title,
                        name: category.name,
                        enquiry_leads_uid: leadIndex,
                      }}
                    >
                      {leadsData[category.name]?.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={`${item.id}`}
                          index={index}
                        >
                          {(provided) => (
                            <div>
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <LeadsCard data={item} />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </List>
                  </Col>
                )}
              </>
            ))}
          </Row>
        </DragDropContext>
        <Modal
          width={350}
          visible={showModal}
          onOk={handleAddNewLead}
          onCancel={() => setShowModal(false)}
          destroyOnClose
          title="Add Lead Category"
          className="lead-modal"
        >
          <h4>Add Lead</h4>
          <h5>Create New Lead Category</h5>
          <Input
            // value={leadName}
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
            <p>You lose all the leads from Category</p>
            <p>Or Else all the leads move to next Category</p>
          </div>
        </Modal>
      </div>
    </Spin>
  );
};

export default SocialLeads;
