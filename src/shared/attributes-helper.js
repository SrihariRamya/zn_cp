import { get, filter } from 'lodash';

export default function (attributes, filterPath, namePath) {
  return get(filter(attributes, filterPath), namePath, '');
}
export const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
export const paginationstyler = () => {
  setTimeout(() => {
    const pageitem = document.querySelectorAll('.ant-pagination-item');
    const pagelastitem = document.querySelectorAll('.last-page-antd');
    if (pageitem[0] !== undefined) {
      if (pagelastitem[0] !== undefined) {
        pagelastitem[0].classList.remove('last-page-antd');
      }
      if (pageitem[0].classList !== undefined) {
        pageitem[0].classList.add('first-page-antd');
      }
      if (pageitem.length > 0) {
        pageitem[pageitem.length - 1].classList.add('last-page-antd');
      }
    }
  }, 300);
};
