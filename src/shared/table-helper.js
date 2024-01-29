import React from 'react';
import { Input, Button, DatePicker, Select, Typography } from 'antd';
import * as _ from 'lodash';
import { ReactComponent as FilterIcon } from '../assets/icons/table-filter-icon.svg';

const { RangePicker } = DatePicker;
const filterOk = 1;
const filterReset = 0;
const { Text } = Typography;

const onFilterTrigger = (
  deliveryFilterStatus,
  filterAction,
  dataSet,
  setFilterValue,
  filterValue
) => {
  let currentFilterData = {};
  const { dataIndex, addData } = dataSet;

  const filterOperation = () => {
    setFilterValue(currentFilterData);
    return filterAction();
  };
  currentFilterData = Object.assign(filterValue, _.omit(addData, ['type']));
  if (deliveryFilterStatus === filterOk) {
    filterOperation();
  } else {
    delete currentFilterData[dataIndex];
    filterOperation();
  }
};

export const getFilterData = (
  columnName,
  dataIndex,
  type,
  setFilterValue,
  filterValue
) => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => {
    const addData = {
      [dataIndex]: selectedKeys[0],
      type,
    };
    const filterFunction = () => {
      if (['date', 'dateTime'].includes(type)) {
        return (
          <RangePicker
            format={['DD-MM-YYYY hh:mm', 'DD-MM-YYYY hh:mm']}
            style={{ width: '100%' }}
            value={selectedKeys[0]}
            onChange={(event) => setSelectedKeys(event ? [event] : [])}
            className="filter-date-select"
          />
        );
      }
      if (['multiTag'].includes(type)) {
        return (
          <Select
            mode="tags"
            virtual={false}
            style={{ width: '100%' }}
            className="search-input store-tags"
            placeholder={`Filter by ${columnName}`}
            value={selectedKeys[0]}
            dropdownStyle={{ display: 'none' }}
            onChange={(value) => setSelectedKeys(value ? [value] : [])}
          />
        );
      }
      if (['text'].includes(type)) {
        return (
          <Input
            placeholder={`Filter by ${columnName}`}
            value={selectedKeys[0]}
            onChange={(event_) =>
              setSelectedKeys(event_.target.value ? [event_.target.value] : [])
            }
            className="search-input"
          />
        );
      }
      return type;
    };
    return (
      <div className="custom-filter-dropdown custom-input">
        {filterFunction()}
        {selectedKeys[0] && (
          <div className="filter-report-btn">
            <Button
              type="primary"
              onClick={() => {
                onFilterTrigger(
                  filterOk,
                  confirm,
                  { dataIndex, addData },
                  setFilterValue,
                  filterValue
                );
              }}
              size="small"
              className="search-btn"
            >
              Ok
            </Button>
            <Button
              type="primary"
              onClick={() => {
                onFilterTrigger(
                  filterReset,
                  clearFilters,
                  {
                    dataIndex,
                    addData,
                  },
                  setFilterValue,
                  filterValue
                );
              }}
              size="small"
              className="search-btn"
            >
              Reset
            </Button>
          </div>
        )}
      </div>
    );
  },
  filterIcon: <FilterIcon />,
});

export const emptyTableData = ({ Icon, titleText, infoText, button }) => {
  return (
    <div className="empty-text-div">
      <div className="box-icon-div">
        <Icon className="mt-20p" />
      </div>
      <div className="fs-20 select-all-text mt-20p">{titleText}</div>
      <br />
      <div>
        <Text
          style={{ whiteSpace: 'pre-wrap', lineHeight: '1.2' }}
          className="add-products-text"
        >
          {infoText}
        </Text>
      </div>
      <div className="mt-20p">{button}</div>
    </div>
  );
};

export default {};
