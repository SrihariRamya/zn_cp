/* eslint-disable guard-for-in */
import * as AntdIcons from '@ant-design/icons';

export const Icons = [];
for (const icon in AntdIcons) {
  Icons.push(icon);
}
