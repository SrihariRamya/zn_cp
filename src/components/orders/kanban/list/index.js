import React, { useState, useEffect } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Tag, Dropdown, Menu, Row, Col, notification } from 'antd';
import { get, concat } from 'lodash';
import {
  INITIAL_PAGE,
  FAILED_TO_LOAD,
} from '../../../../shared/constant-values';
import { ReactComponent as MicrosoftExcel } from '../../../../assets/icons/microsoftexcel.svg';
import { ReactComponent as Pdf } from '../../../../assets/icons/pdf.svg';
import { ReactComponent as Download } from '../../../../assets/icons/download.svg';
import { handleFilterOrders } from '../../../../shared/function-helper';

function List(parameters) {
  const {
    children,
    list,
    filterData,
    setFilterData,
    setLoading,
    fetchOrderData,
    orderTitle,
    orderStartDate,
    orderEndDate,
    multipleOrderPDF,
    downloadOrderExcel,
    setDropdownScrollSlug,
    cardDropdownSlug,
  } = parameters;
  const [page, setPage] = useState(INITIAL_PAGE);
  const [enabled, setEnabled] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) {
    return '';
  }
  const fetchProductData = (offset, id, statusName) => {
    setLoading(true);
    fetchOrderData(
      {
        current: offset,
        pageSize: 10,
        milestone: id,
        isKanban: true,
        endDate: orderEndDate,
        startDate: orderStartDate,
      },
      true
    )
      .then((resp) => {
        const orderDataSet = get(resp, 'data', []);
        setPage(offset);
        filterData[statusName].rows = concat(
          filterData[statusName].rows,
          orderDataSet.rows
        );
        setFilterData(filterData);
        setLoading(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const loadMoreData = (cardData) => {
    fetchProductData(
      page + INITIAL_PAGE,
      get(cardData, 'milestone_code', ''),
      get(cardData, 'statusName', '')
    );
  };

  const allDownloadOrderExcel = (name) => {
    const filterOrder = handleFilterOrders(name, orderTitle);
    downloadOrderExcel(get(filterOrder, 'order_cards', ''));
  };
  const handleDropDown = async () => {
    setDropdownScrollSlug(false);
    await setDropdownVisible(false);
    if (cardDropdownSlug === true) return setDropdownScrollSlug(true);
    return '';
  };

  return (
    <div
      style={{ backgroundColor: get(list, 'bgcolor', '') }}
      className="cards-container"
      direction="horizontal"
    >
      <div
        style={{
          borderBottom: `2px solid ${get(list, 'textcolor', '')}`,
          color: get(list, 'textcolor', ''),
        }}
        className="card-title"
      >
        <div>{get(list, 'image', '')}</div>
        <div>
          {get(list, 'name', '')} ({get(list, 'count', '')})
        </div>
        <Dropdown
          getPopupContainer={(triggerNode) => triggerNode.parentElement}
          overlay={
            <Menu style={{ margin: '25px -6px 0 0' }}>
              <Menu.Item
                onClick={() => allDownloadOrderExcel(get(list, 'name', ''))}
              >
                <Row gutter={24}>
                  <Col span={4}>
                    <MicrosoftExcel />
                  </Col>
                  <Col span={20} className="card-download">
                    Download Excel
                  </Col>
                </Row>
              </Menu.Item>
              <Menu.Item
                onClick={() => multipleOrderPDF(get(list, 'order_cards'))}
              >
                <Row gutter={24}>
                  <Col span={4}>
                    <Pdf />
                  </Col>
                  <Col span={20} className="card-download">
                    Download PDF
                  </Col>
                </Row>
              </Menu.Item>
            </Menu>
          }
          open={dropdownVisible}
          onClick={toggleDropdown}
          placement="left"
          overlayClassName="card-order-download"
        >
          <Tag className="bills">
            <Download />
          </Tag>
        </Dropdown>
      </div>
      <div
        id={`${get(list, 'name', '')}-scroll`}
        className="card-list-container"
      >
        <InfiniteScroll
          dataLength={get(list, 'order_cards.length', 0)}
          next={() => loadMoreData(list)}
          hasMore={get(list, 'order_cards.length', 0) < get(list, 'count', '')}
          scrollableTarget={`${get(list, 'name', '')}-scroll`}
          onScroll={handleDropDown}
        >
          <Droppable droppableId={get(list, 'name', '')}>
            {(provided) => (
              <div ref={provided.innerRef}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    minHeight: '100px',
                  }}
                >
                  {children}
                  {get(provided, 'placeholder', '')}
                </div>
              </div>
            )}
          </Droppable>
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default List;
