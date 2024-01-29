import React from 'react';
import { Card, Space, Tooltip, notification } from 'antd';
import { get, isEmpty } from 'lodash';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  DOWNLOAD_EXCEL_FAILED_MESSAGE,
  MESSAGE_DOWNLOAD_FROM_TABLE,
} from '../../shared/constant-values';
import { ExcelDownload } from '../../shared/excel';
import CardExtraContent from './card-extra-content';

const { Meta } = Card;

function MessageStatusCountCard(properties) {
  const { metaData, value, loading } = properties;

  const downloadTableToExcel = async () => {
    if (isEmpty(value)) {
      notification.error({ message: DOWNLOAD_EXCEL_FAILED_MESSAGE });
    } else {
      const downloadData = [
        {
          [`${metaData?.key}`]: get(value, `${metaData?.dataIndex}`, 0),
        },
      ];
      ExcelDownload(downloadData, `Message Count ${metaData?.key}`);
    }
  };

  return (
    <Card
      className={metaData?.card_classname}
      loading={loading}
      bordered
      extra={
        <CardExtraContent
          from={MESSAGE_DOWNLOAD_FROM_TABLE}
          handleDownload={downloadTableToExcel}
          isImage={false}
        />
      }
    >
      <Meta
        title={
          <div className="count-text">
            {get(value, `${metaData?.dataIndex}`, false)
              ? get(value, `${metaData?.dataIndex}`, 0)
              : 0}
          </div>
        }
        description={
          <Space>
            <div className="message-text">{metaData?.text}</div>
            <div className="flex-center">
              <Tooltip title={metaData?.info_text}>
                <InfoCircleOutlined className="cursor-pointer message-text" />
              </Tooltip>
            </div>
          </Space>
        }
      />
    </Card>
  );
}

export default MessageStatusCountCard;
