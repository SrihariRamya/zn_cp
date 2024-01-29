import React from 'react';
import { Dropdown, Menu } from 'antd';
import {
  DOWNLOAD_IMAGE_MENU_ITEM,
  DOWNLOAD_EXCEL_MENU_ITEM,
} from '../../shared/constant-values';
import { ReactComponent as MoreVerticalIcon } from '../../assets/icons/more-vertical-icon.svg';

function CardExtraContent(properties) {
  const { handleDownload, from, isImage } = properties;
  return (
    <Dropdown
      overlay={
        <Menu>
          <Menu.Item
            onClick={() => handleDownload(from, DOWNLOAD_EXCEL_MENU_ITEM)}
          >
            {DOWNLOAD_EXCEL_MENU_ITEM}
          </Menu.Item>
          {isImage && (
            <Menu.Item
              onClick={() => handleDownload(from, DOWNLOAD_IMAGE_MENU_ITEM)}
            >
              {DOWNLOAD_IMAGE_MENU_ITEM}
            </Menu.Item>
          )}
        </Menu>
      }
      arrow
      placement="bottom"
    >
      <MoreVerticalIcon
        className="cursor-pointer"
        style={{ marginTop: '6px' }}
      />
    </Dropdown>
  );
}

export default CardExtraContent;
