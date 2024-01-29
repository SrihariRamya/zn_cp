import * as AntdIcons from '@ant-design/icons';

// eslint-disable-next-line import/prefer-default-export
export const Icons = [];
// eslint-disable-next-line guard-for-in, no-restricted-syntax
for (const icon in AntdIcons) {
  Icons.push(icon);
}
