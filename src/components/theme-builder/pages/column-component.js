/* eslint-disable no-shadow */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import { Col, Popover, Row, Tooltip } from 'antd';
import React, { useState } from 'react';
import { get, isEmpty } from 'lodash';
// eslint-disable-next-line import/no-cycle
// import {
//   CheckOutlined,
//   CopyOutlined,
//   DeleteOutlined,
//   MenuOutlined,
//   PlusOutlined,
// } from '@ant-design/icons';
// eslint-disable-next-line import/no-cycle
import RowComponent from './row-component';
import LabelComp from '../widget-comps/label';
import ButtonComp from '../widget-comps/button';
import BuyButtonComp from '../widget-comps/buy-now-button';
import ImageComp from '../widget-comps/image';
import ImageViewer from '../widget-comps/image-viewer';
import VariantSelector from '../widget-comps/variant-selector';
import CollapseComponent from '../widget-comps/collapse-component';
import CouponDiscount from '../widget-comps/coupon-discount';
import CouponExpiryTime from '../widget-comps/coupon-expiry-time';
import TextItem from '../../settings/appearance/view-helper/text-item';

const ColumnComponent = ({
  col,
  colCount,
  dataSource,
  key,
  indexCol,
  getActiveRowColumn,
  setPropertiesType,
  activeElement,
  propertiesType,
}) => {
  const [showIcon, setShowIcon] = useState(false);

  const {
    column_style,
    column_properties: {
      iterable = {
        columnIterable: false,
        oddBg: '',
        evenBg: '',
      },
      dataField = '',
    },
  } = col;
  const { columnIterable = false, oddBg = '', evenBg = '' } = iterable;
  const {
    className = '',
    margin = '',
    padding = '',
    borderRadius = '',
    backgroundColor = '',
    width = '',
    borderWidth = '',
    borderColor = '',
    borderStyle = '',
    height = null,
    responsive = null,
  } = column_style;
  const style = {
    className,
    margin,
    padding,
    borderRadius,
    backgroundColor,
    borderWidth,
    borderColor,
    borderStyle,
    height,
  };

  const uiElements = (col, data = [] || {}) => (
    <>
      {col.widget_type === 'label' && (
        <LabelComp properties={col} dataSource={data} />
      )}
      {col.widget_type === 'button' && (
        <ButtonComp properties={col} dataSource={data} />
      )}
      {col.widget_type === 'buy_now_button' && (
        <BuyButtonComp properties={col} dataSource={data} />
      )}
      {col.widget_type === 'image' && (
        <ImageComp properties={col} dataSource={data} />
      )}
      {col.widget_type === 'image_viewer' && (
        <ImageViewer properties={col} dataSource={data} />
      )}
      {col.widget_type === 'text_content' && <TextItem data={dataSource} />}
      {col.widget_type === 'variant_selector' && (
        <VariantSelector properties={col} data={dataSource} />
      )}
      {col.widget_type === 'collapse' && (
        <CollapseComponent dataSource={dataSource} properties={col} />
      )}
      {col.widget_type === 'coupon-discount' && (
        <CouponDiscount data={dataSource} properties={col} />
      )}
      {col.widget_type === 'coupon-expiry-time' && (
        <CouponExpiryTime data={dataSource} />
      )}
    </>
  );
  const UIContent = (col, data) => (
    <Col
      style={{
        ...style,
        height: style.height || '100%',
        border:
          get(activeElement, 'element.column_uid') === get(col, 'column_uid') &&
          '1px solid green',
      }}
      key={col.column_uid}
      id={col.column_uid}
      onClick={(event) => {
        event.stopPropagation();
        getActiveRowColumn(col.column_uid, 'column');
      }}
      onMouseOver={(event) => {
        event.stopPropagation();
        setShowIcon(true);
      }}
      onMouseOut={(event) => {
        event.stopPropagation();
        setShowIcon(false);
      }}
      aria-hidden="true"
    >
      <Col
        span={24}
        className={showIcon ? 'editor-column show' : 'editor-column'}
        style={{ height: style.height || '100%' }}
      >
        <div
          className="icon column"
          style={{
            display: showIcon ? 'block' : 'none',
          }}
        >
          {/* <Popover
            placement="top"
            trigger="hover"
            content={
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '15px',
                  cursor: 'pointer',
                }}
              >
                <span>
                  <Tooltip title="Add Row" placement="topLeft">
                    <PlusOutlined
                      onClick={() => {
                        // eslint-disable-next-line no-console
                        console.log('add clicked');
                      }}
                    />
                  </Tooltip>
                </span>
                <span>
                  <Tooltip title="Delete Column" placement="topLeft">
                    <DeleteOutlined
                      onClick={() => {
                        // eslint-disable-next-line no-console
                        console.log('delete clicked');
                      }}
                    />
                  </Tooltip>
                </span>
                <span>
                  <Tooltip title="Select Column" placement="topLeft">
                    <CheckOutlined
                      onClick={() => {
                        setPropertiesType('column');
                        getActiveRowColumn(col.column_uid, 'column');
                      }}
                    />
                  </Tooltip>
                </span>
                <span>
                  <Tooltip title="Copy Row" placement="topLeft">
                    <CopyOutlined
                      onClick={() => {
                        // eslint-disable-next-line no-console
                        console.log('copy clicked');
                      }}
                    />
                  </Tooltip>
                </span>
              </div>
            }
          >
            <MenuOutlined />
          </Popover> */}
        </div>
        {col.row ? (
          col.row.map((row) => (
            <RowComponent
              key={row.row_uid}
              row={row}
              dataSource={data}
              setPropertiesType={setPropertiesType}
              getActiveRowColumn={getActiveRowColumn}
              activeElement={activeElement}
            />
          ))
        ) : (
          <>{uiElements(col, data)}</>
        )}
      </Col>
    </Col>
  );
  const span = () => {
    if (responsive) return undefined;
    if (width === 'auto') return undefined;
    return width || 24 / colCount;
  };
  return (
    <>
      {col.column_uid === 'd92dd9b8-7d7e-4372-bd7e-03990cbceeca' &&
      isEmpty(get(dataSource, 'related_product')) ? null : (
        <>
          {!columnIterable && (
            <Col
              id={col.column_uid}
              className={className || undefined}
              span={span()}
              xs={responsive ? responsive?.xs : undefined}
              lg={responsive ? responsive?.lg : undefined}
              md={responsive ? responsive?.md : undefined}
              sm={responsive ? responsive?.sm : undefined}
              style={{ ...style }}
            >
              <Col span={24}>
                <>{UIContent(col, dataSource)}</>
              </Col>
            </Col>
          )}
          {columnIterable &&
            !isEmpty(dataSource) &&
            (dataField ? (
              <>
                {dataSource[dataField].map((item, index) => (
                  <Col
                    key={get(item, 'product_uid')}
                    span={span()}
                    xs={responsive ? responsive?.xs : undefined}
                    lg={responsive ? responsive?.lg : undefined}
                    md={responsive ? responsive?.md : undefined}
                    sm={responsive ? responsive?.sm : undefined}
                    style={{ ...style }}
                    id={get(item, 'product_uid')}
                    className={`${className || undefined}`}
                  >
                    <Col
                      span={24}
                      style={{
                        backgroundColor: `${index % 2 === 0 ? oddBg : evenBg}`,
                      }}
                    >
                      <Row style={{ width: '100%' }}>
                        {UIContent(col, item)}
                      </Row>
                    </Col>
                  </Col>
                ))}
              </>
            ) : (
              <>
                {dataSource.map((item, index) => (
                  <Col
                    span={span()}
                    xs={responsive ? responsive?.xs : undefined}
                    lg={responsive ? responsive?.lg : undefined}
                    md={responsive ? responsive?.md : undefined}
                    sm={responsive ? responsive?.sm : undefined}
                    style={{ ...style }}
                    id={col.column_uid}
                    key={col.column_uid}
                    className={className || undefined}
                  >
                    <Col
                      span={24}
                      style={{
                        backgroundColor: `${index % 2 === 0 ? oddBg : evenBg}`,
                      }}
                    >
                      <Row style={{ width: '100%' }}>
                        {UIContent(col, item)}
                      </Row>
                    </Col>
                  </Col>
                ))}
              </>
            ))}
        </>
      )}
    </>
  );
};

export default ColumnComponent;
