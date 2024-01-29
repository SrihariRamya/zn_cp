import React from 'react';
import { List, Popover, Space, Tag, Typography } from 'antd';
import _, { get } from 'lodash';
import { CurrencyFormatter } from '@kaaylabs/currency-formatter';
import { ReactComponent as CardMenu } from '../../assets/icons/cardMenu.svg';
import { ReactComponent as Pdf } from '../../assets/icons/pdf.svg';
import { ReactComponent as MicrosoftExcel } from '../../assets/icons/microsoftexcel.svg';

function CustomerMobileView(properties) {
  const {
    userData,
    handleTableChange,
    pagination,
    tenantDetails,
    defaultName,
    downloadPdf,
    downloadExcel,
    renderPopoverContent,
    onBagDetalis,
    setBagDetails,
  } = properties;

  const { Link, Text } = Typography;
  const menuContent = (data) => {
    return (
      <Space direction="vertical">
        <div>
          <Tag onClick={() => downloadPdf(data)}>
            <span className="res-center">
              <Pdf /> &nbsp; Download PDF
            </span>
          </Tag>
        </div>

        <div>
          <Tag onClick={() => downloadExcel(data)}>
            <span className="res-center">
              <MicrosoftExcel /> &nbsp; Download Excel
            </span>
          </Tag>
        </div>
      </Space>
    );
  };

  const handleByEdit = (item) => {
    return (
      <Popover
        overlayClassName="customer-popover"
        content={menuContent(item)}
        arrow={false}
        placement="leftTop"
        trigger="hover"
      >
        <CardMenu width={20} />
      </Popover>
    );
  };

  return (
    <div className="search-container order-list-mobile-container">
      <div className="order-card-list category">
        <List
          dataSource={userData}
          pagination={{
            align: 'center',
            onChange: (current) => {
              handleTableChange({ current }, '', {});
            },
            ...pagination,
          }}
          rowKey="order_hdr_id"
          renderItem={(item) => {
            return (
              <List.Item>
                <div className="mob-cutomer-table">
                  <div>
                    <div className="mob-text-align">
                      Customer Name : &nbsp;
                      <Link
                        href={`/customers/${_.get(item, 'user_uid', '')}`}
                        className="customer-link"
                      >
                        <Text className="text-color">
                          {get(item, 'user_name', '')}
                        </Text>
                      </Link>
                    </div>
                    <div>
                      {defaultName === 'All' ? (
                        <div>
                          Customer Type :&nbsp;
                          <Text className="text-color">
                            {get(item, 'customer_type', '')}
                          </Text>
                        </div>
                      ) : undefined}
                    </div>
                    <div>
                      {get(item, 'phone_number', '') && (
                        <div>
                          Mobile Number :&nbsp;
                          <Text className="text-color">
                            {get(item, 'country_code', '') === null
                              ? get(item, 'phone_number', '')
                              : `${get(item, 'country_code', '')} ${get(
                                  item,
                                  'phone_number',
                                  ''
                                )}`}
                          </Text>
                        </div>
                      )}
                    </div>
                    <div>
                      {(defaultName === 'All' || defaultName === 'Return') && (
                        <Popover
                          title="Bag Details"
                          trigger="click"
                          content={renderPopoverContent}
                        >
                          <Text
                            onMouseEnter={() =>
                              onBagDetalis(get(item, 'bag_uid', ''))
                            }
                          >
                            Total Orders :&nbsp;
                            <Text className="text-color">
                              {get(item, 'total_orders', 0)}
                            </Text>
                          </Text>
                        </Popover>
                      )}
                    </div>
                    <div>
                      {(defaultName === 'All' || defaultName === 'Return') && (
                        <Text>
                          Total Sales :&nbsp;
                          <Text className="text-color">
                            <CurrencyFormatter
                              value={item?.total_sales}
                              type={get(tenantDetails, 'setting.currency', '')}
                              language={get(
                                tenantDetails,
                                'setting.currency_locale',
                                ''
                              )}
                            />
                          </Text>
                        </Text>
                      )}
                    </div>
                    <div className="mob-text-align">
                      Total Cart: &nbsp;
                      <Popover
                        title="Bag Details"
                        overlayClassName="customer-popover"
                        trigger="click"
                        content={renderPopoverContent}
                      >
                        <Text
                          className="text-color"
                          onMouseEnter={() =>
                            get(item, 'total_carts', '') > 0
                              ? onBagDetalis(get(item, 'bag_uid', ''))
                              : setBagDetails([])
                          }
                        >
                          {get(item, 'total_carts', 0)} items
                        </Text>
                      </Popover>
                    </div>
                  </div>
                  <div className="store-edit">{handleByEdit(item)}</div>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}

export default CustomerMobileView;
