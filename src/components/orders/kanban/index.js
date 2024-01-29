import React, { useState, useEffect } from 'react';
import { Space, Spin, notification, Select, Button, DatePicker } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { get, filter } from 'lodash';
import { CloseOutlined } from '@ant-design/icons';
import './kanban.less';
import List from './list/index';
import CardItem from './card/index';
import { ReactComponent as Pending } from '../../../assets/icons/pending.svg';
import { ReactComponent as Confirmed } from '../../../assets/icons/confirmed.svg';
import { ReactComponent as Inpacking } from '../../../assets/icons/inpacking.svg';
import { ReactComponent as Dispatched } from '../../../assets/icons/dispatched.svg';
import { ReactComponent as Delivered } from '../../../assets/icons/delivered.svg';
import { ReactComponent as Cancelled } from '../../../assets/icons/cancelled.svg';
import { ReactComponent as Checkout } from '../../../assets/icons/checkout.svg';
import { ReactComponent as CancelRequest } from '../../../assets/icons/cancelrequest.svg';
import { getAllOrderKanban, getMilestone } from '../../../utils/api/url-helper';
import {
  FAILED_TO_LOAD,
  ONCE_ORDER_STATUS_IS_CHANGED_TO,
  CAN_NOT_ABLE_TO_MOVE_CARD_INTO,
  selectOptionData,
  CAN_NOT_ABLE_TO_CHANGE_THE_STATUS_TO,
} from '../../../shared/constant-values';
import {
  handleDragBackWardCard,
  handleDragForWardCard,
  endDateCondition,
  startDateCondition,
  getMilestoneBySulg,
} from '../../../shared/function-helper';

const { RangePicker } = DatePicker;
const fetchOrderData = async (parameters = {}) => {
  const { pageSize, current, isKanban, endDate, startDate, milestone } =
    parameters;

  const queryParameter = {
    limit: pageSize,
    offset: current,
    isKanban,
  };
  if (milestone) {
    queryParameter.milestone = milestone;
  }
  if (endDate) {
    queryParameter.endDate = endDate;
  }
  if (startDate) {
    queryParameter.startDate = startDate;
  }
  return getAllOrderKanban('B2C', queryParameter);
};

function Kanban(parameters) {
  const {
    singleOrderPdf,
    downloadExcel,
    multipleOrderPDF,
    downloadOrderExcel,
    shiprocketOrderButton,
    setOrderRecord,
    setIsModalVisible,
    setIsKanbanOrder,
    isKanbanOrder,
    setEditStatusData,
    setVisible,
    setOrderUID,
    setStoreUID,
    handleEditStatus,
    setOrderId,
  } = parameters;
  const navigate = useNavigate();
  const [filterData, setFilterData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadText, setDownloadText] = useState('');
  const [newUserValue, setNewUserValue] = useState('All');
  const [orderStartDate, setOrderStartDate] = useState();
  const [orderEndDate, setOrderEndDate] = useState();
  const [datePicker, setDatePicker] = useState(false);
  const [milestoneStatus, setMilestoneStatus] = useState();
  const [dropdownScrollSlug, setDropdownScrollSlug] = useState(false);
  const [cardDropdownSlug, setCardDropdownSlug] = useState(false);

  const orderTitle = [
    {
      name: 'Pending',
      bgcolor: '#CCCCCC4D',
      textcolor: '#222222',
      statusName: 'pending',
      image: <Pending />,
      milestone_code: get(
        getMilestoneBySulg(milestoneStatus, 'PEN'),
        'milestone_code',
        ''
      ),
      key: get(getMilestoneBySulg(milestoneStatus, 'PEN'), 'milestone_id', ''),
      count: get(filterData, 'pending.count', 0),
      order_cards: get(filterData, 'pending.rows', []),
    },
    {
      name: 'Confirmed',
      bgcolor: '#23A26D1A',
      textcolor: '#23A26D',
      statusName: 'confirmed',
      image: <Confirmed />,
      milestone_code: get(
        getMilestoneBySulg(milestoneStatus, 'CON'),
        'milestone_code',
        ''
      ),
      key: get(getMilestoneBySulg(milestoneStatus, 'CON'), 'milestone_id', ''),
      count: get(filterData, 'confirmed.count', 0),
      order_cards: get(filterData, 'confirmed.rows', []),
    },
    {
      name: 'In Packing',
      bgcolor: '#F59E0B1A',
      textcolor: '#F59E0B',
      statusName: 'inPacking',
      image: <Inpacking />,
      milestone_code: get(
        getMilestoneBySulg(milestoneStatus, 'INP'),
        'milestone_code',
        ''
      ),
      key: get(getMilestoneBySulg(milestoneStatus, 'INP'), 'milestone_id', ''),
      count: get(filterData, 'inPacking.count', 0),
      order_cards: get(filterData, 'inPacking.rows', []),
    },
    {
      name: 'Dispatched',
      bgcolor: '#472DC51A',
      textcolor: '#472DC5',
      statusName: 'dispatched',
      image: <Dispatched />,
      milestone_code: get(
        getMilestoneBySulg(milestoneStatus, 'DIS'),
        'milestone_code',
        ''
      ),
      key: get(getMilestoneBySulg(milestoneStatus, 'DIS'), 'milestone_id', ''),
      count: get(filterData, 'dispatched.count', 0),
      order_cards: get(filterData, 'dispatched.rows', []),
    },
    {
      name: 'Delivered',
      bgcolor: '#23A26D1A',
      textcolor: '#23A26D',
      statusName: 'delivered',
      image: <Delivered />,
      milestone_code: get(
        getMilestoneBySulg(milestoneStatus, 'DEL'),
        'milestone_code',
        ''
      ),
      key: get(getMilestoneBySulg(milestoneStatus, 'DEL'), 'milestone_id', ''),
      count: get(filterData, 'delivered.count', 0),
      order_cards: get(filterData, 'delivered.rows', []),
    },
    {
      name: 'Cancelled',
      bgcolor: '#F841411A',
      textcolor: '#F84141',
      statusName: 'cancelled',
      image: <Cancelled />,
      milestone_code: get(
        getMilestoneBySulg(milestoneStatus, 'CAN'),
        'milestone_code',
        ''
      ),
      key: get(getMilestoneBySulg(milestoneStatus, 'CAN'), 'milestone_id', ''),
      count: get(filterData, 'cancelled.count', 0),
      order_cards: get(filterData, 'cancelled.rows', []),
    },
    {
      name: 'Checkout',
      bgcolor: '#F59E0B1A',
      textcolor: '#F59E0B',
      statusName: 'checkout',
      image: <Checkout />,
      milestone_code: get(
        getMilestoneBySulg(milestoneStatus, 'CHK'),
        'milestone_code',
        ''
      ),
      key: get(getMilestoneBySulg(milestoneStatus, 'CHK'), 'milestone_id', ''),
      count: get(filterData, 'checkout.count', 0),
      order_cards: get(filterData, 'checkout.rows', []),
    },
    {
      name: 'Cancel Request',
      bgcolor: '#F841411A',
      textcolor: '#F84141',
      statusName: 'cancelRequest',
      image: <CancelRequest />,
      milestone_code: get(
        getMilestoneBySulg(milestoneStatus, 'REQ'),
        'milestone_code',
        ''
      ),
      key: get(getMilestoneBySulg(milestoneStatus, 'REQ'), 'milestone_id', ''),
      count: get(filterData, 'cancelRequest.count', 0),
      order_cards: get(filterData, 'cancelRequest.rows', []),
    },
  ];

  useEffect(() => {
    getMilestone()
      .then((resp) => {
        setMilestoneStatus(resp.data);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, []);

  const fetchData = () => {
    setLoading(true);
    fetchOrderData({ current: 1, pageSize: 10, isKanban: false })
      .then((resp) => {
        const orderDataSet = resp.data;
        setFilterData(orderDataSet);
        setLoading(false);
        setIsKanbanOrder(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isKanbanOrder) {
      fetchData();
    }
  }, [isKanbanOrder]);

  const handleNewUserChange = (value, data) => {
    if (!value) {
      setNewUserValue('All');
      fetchData();
      return;
    }
    setNewUserValue(value);
    const endDate = endDateCondition(value, data);
    const startDate = startDateCondition(value, data);
    setOrderStartDate(startDate);
    setOrderEndDate(endDate);
    fetchOrderData({
      current: 1,
      pageSize: 10,
      isKanban: false,
      endDate,
      startDate,
    })
      .then((resp) => {
        const orderDataSet = resp.data;
        setFilterData(orderDataSet);
        setLoading(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const userFilterType = (value) => {
    if (value === 'customize') {
      setDatePicker(true);
    } else {
      setDatePicker(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    if (result.source.droppableId !== result.destination.droppableId) {
      if (!handleDragBackWardCard(result, orderTitle)) {
        notification.error({
          message: `${ONCE_ORDER_STATUS_IS_CHANGED_TO} ${result.source.droppableId}, ${CAN_NOT_ABLE_TO_CHANGE_THE_STATUS_TO} ${result.destination.droppableId}`,
        });
        return;
      }
      if (!handleDragForWardCard(result, orderTitle)) {
        notification.error({
          message: `${CAN_NOT_ABLE_TO_MOVE_CARD_INTO} Checkout and Cancel Request`,
        });
        return;
      }
      const filterCard = filter(
        orderTitle,
        (item) => item.name === result.source.droppableId
      );
      const cardData = filter(
        filterCard[0]?.order_cards,
        (item) => item.order_id === result.draggableId
      )[0];
      const milestoneKey = filter(
        orderTitle,
        (item) => item.name === result.destination.droppableId
      )[0];

      const orderId = result.draggableId;
      const orderKey = milestoneKey.key.toString();
      const orderValue = { key: orderKey };
      setOrderUID(get(cardData, 'order_uid', ''));
      setOrderId(get(cardData, 'order_id', ''));
      setStoreUID(get(cardData, 'store_uid', ''));

      if (get(milestoneKey, 'milestone_code', '') === 'INP') {
        setEditStatusData({
          value: orderValue,
          record: orderId,
          data: cardData,
        });
        setVisible(true);
      } else if (get(milestoneKey, 'milestone_code', '') === 'DIS') {
        setOrderRecord(orderId);
        setIsModalVisible(true);
      } else {
        handleEditStatus(orderValue, orderId, cardData);
      }
    }
  };

  return (
    <Spin spinning={loading} tip={downloadText}>
      <>
        <div className="drop-down-kandan">
          <div>
            <Space wrap>
              <Select
                value={newUserValue}
                virtual={false}
                className="select-range"
                onChange={handleNewUserChange}
                options={selectOptionData}
                onSelect={userFilterType}
                placeholder="Select the range"
                allowClear
              />
              {datePicker && (
                <div className="button">
                  <RangePicker
                    format="DD-MM-YYYY"
                    onChange={(date) => handleNewUserChange('customized', date)}
                  />
                  &nbsp;&nbsp;
                  <CloseOutlined onClick={userFilterType} />
                </div>
              )}
            </Space>
          </div>
          {shiprocketOrderButton && (
            <div className="shiprocket-btn">
              <Button
                type="primary"
                onClick={() => navigate('/shiprocket/orders')}
              >
                Shiprocket Order
              </Button>
            </div>
          )}
        </div>
        <div className="kanban-container">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex p-12 drag-drop">
              {orderTitle?.map((list) => {
                return (
                  <List
                    key={list.name}
                    onDragEnd={onDragEnd}
                    list={list}
                    filterData={filterData}
                    setFilterData={setFilterData}
                    fetchOrderData={fetchOrderData}
                    setDownloadText={setDownloadText}
                    orderTitle={orderTitle}
                    orderStartDate={orderStartDate}
                    orderEndDate={orderEndDate}
                    multipleOrderPDF={multipleOrderPDF}
                    downloadOrderExcel={downloadOrderExcel}
                    setLoading={setLoading}
                    setDropdownScrollSlug={setDropdownScrollSlug}
                    cardDropdownSlug={cardDropdownSlug}
                  >
                    {list?.order_cards.map((item, itemIndex) => (
                      <Draggable
                        draggableId={item.order_id}
                        index={itemIndex}
                        key={item.order_id}
                        isDragDisabled={
                          list.name === 'Delivered' ||
                          list.name === 'Cancelled' ||
                          list.name === 'Checkout' ||
                          list.name === 'Cancel Request'
                        }
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <CardItem
                              cardDetails={item}
                              setLoading={setLoading}
                              setDownloadText={setDownloadText}
                              fetchData={fetchData}
                              singleOrderPdf={singleOrderPdf}
                              downloadExcel={downloadExcel}
                              dropdownScrollSlug={dropdownScrollSlug}
                              setDropdownScrollSlug={setDropdownScrollSlug}
                              setCardDropdownSlug={setCardDropdownSlug}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </List>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      </>
    </Spin>
  );
}

export default Kanban;
