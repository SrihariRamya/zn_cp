import { get } from 'lodash';

export const defaultImage =
  'https://images-zupain.s3.ap-south-1.amazonaws.com/Image.svg';
export const categoryDefaultImage =
  'https://images-zupain.s3.amazonaws.com/10-03-2022-21-49-47-categoryImage.JPEG';
export const couponDefaultImage =
  'https://images-zupain.s3.ap-south-1.amazonaws.com/coupon_icon.png';
export const appearanceThemeMobile =
  'https://images-zupain.s3.ap-south-1.amazonaws.com/appearance_mobile.jpg';
export const appearanceThemeWeb =
  'https://images-zupain.s3.ap-south-1.amazonaws.com/appearance_web.png';

export const collectionDefaultImage =
  'https://images-zupain.s3.ap-south-1.amazonaws.com/17-02-2023-01-17-45-blob';

export default function imagePath(path) {
  const result = path && path.filter((item) => item.image_source === 'Web');
  return get(result, '[0].product_image', defaultImage);
}
