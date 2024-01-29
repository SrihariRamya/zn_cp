import React from 'react';
import { Select, Breadcrumb, Checkbox, Row, Col, DatePicker } from 'antd';
import { map } from 'lodash';
import { FILTER_VALUES, CUSTOM } from '../../../shared/constant-values';
import { ReactComponent as FilterIcon } from '../../../assets/icons/clic/filter.svg';
// import { DownloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const HeadingWithFilter = (properties) => {
  const {
    title,
    selectedFilterDate,
    handleDatteFilter,
    productDateFilter,
    handleProductLevelFilter,
    productNames,
  } = properties;
  return (
    <>
      <Row>
        <Col span={8} className="flex-bwn">
          <Breadcrumb>
            <Breadcrumb.Item>{title}</Breadcrumb.Item>
          </Breadcrumb>
          <div className="flex date-level-filter">
            <Select
              className="dashboard-select"
              virtual={false}
              value={selectedFilterDate}
              onChange={handleDatteFilter}
            >
              {map(FILTER_VALUES, (date) => {
                return <Option value={date.value}>{date.label}</Option>;
              })}
            </Select>
            {selectedFilterDate === CUSTOM && (
              <div className="ml-10">
                <RangePicker format="DD-MM-YYYY" onChange={productDateFilter} />
              </div>
            )}
          </div>
        </Col>
        <Col span={8} />
        <Col span={8} className="flex">
          <div className="product-level-filter">
            <Select
              mode="multiple"
              virtual={false}
              allowClear
              placeholder={
                <>
                  <FilterIcon className="filter-icon" />
                  <span>Filter by Product</span>
                </>
              }
              onChange={handleProductLevelFilter}
            >
              {map(productNames, (item) => (
                <Option
                  value={item.product_uid}
                  key={item.product_uid}
                  className="product-level-select"
                >
                  {item.product_name}
                  <Checkbox
                    className="product-name-checkbox"
                    checked={item.checked}
                  />
                </Option>
              ))}
            </Select>
          </div>
          {/* <Button icon={<DownloadOutlined />} className="download-btn">
              Download
            </Button> */}
        </Col>
      </Row>
    </>
  );
};

export default HeadingWithFilter;
