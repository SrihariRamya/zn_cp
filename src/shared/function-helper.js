/* eslint-disable import/prefer-default-export */
import React from 'react';
import imageCompression from 'browser-image-compression';
import moment from 'moment';
import { notification } from 'antd';
import { findIndex, get, map, reduce, includes, filter, isEmpty } from 'lodash';
import Handlebars from 'handlebars';
import { insertWhatsappNumber } from '../utils/api/url-helper';

export const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 6,
  slidesToScroll: 1,
  autoplaySpeed: 3000,
  autoplay: true,
  centerMode: false,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 5,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 2,
      },
    },
  ],
};

export const labelColor = {
  pending: 'cyan',
  approved: 'green',
  'in-progress': 'blue',
  rejected: 'orange',
  failed: 'red',
};

export const imageCompressedOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: false,
};

// eslint-disable-next-line consistent-return
export const seoImageCompressor = async (file) => {
  try {
    const myFile = [];
    if (file) {
      const imageCompressor = await imageCompression(
        file,
        imageCompressedOptions
      );
      const blobToFile = (theBlob) => {
        theBlob.lastModifiedDate = new Date();
        return theBlob;
      };
      const fileFormat = blobToFile(imageCompressor);
      myFile.push(fileFormat);
    }
    return myFile;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in seoImageCompressor:', error);
    return [];
  }
};

export const parseJSONSafely = (string) => {
  try {
    return JSON.parse(string);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return {};
  }
};

export const disableTabEnterKey = () => {
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' || event.key === 'Enter') {
      return false;
    }
    return !event.defaultPrevented;
  });
};

export const enableTabEnterKey = () => {
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' || event.key === 'Enter') {
      return true;
    }
    return !event.defaultPrevented;
  });
};

export const colorFunction = (dataCol) => {
  if (dataCol === 'Confirmed') return 'blue';
  if (dataCol === 'Checkout') return 'yellow';
  if (dataCol === 'Cancelled') return 'red';
  if (dataCol === 'In Packing') return 'orange';
  if (dataCol === 'Delivered') return 'green';
  if (dataCol === 'Dispatched') return 'gold';
  if (dataCol === 'Pending') return 'White';
  if (dataCol === 'Preparing for Dispatch') return 'gold';
  return '';
};

export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return !!url;
  } catch {
    return false;
  }
};

export const shapeImage = async (
  file,
  fileLists,
  imgValidate,
  setImageFileList
) => {
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  context.drawImage(imageBitmap, 0, 0);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, file.type);
  });
  const newFile = new File([blob], `${file.name}`, {
    type: blob.type,
  });

  const fileImageIndex = findIndex(
    fileLists,
    (item) => item.name === file.name
  );

  if (imgValidate) {
    const newFileList = fileLists;
    newFileList[fileImageIndex] = newFile;
    setImageFileList([...newFileList]);
  } else {
    setImageFileList([]);
  }
};

export const checkImageFileType = (type) => {
  return type === 'image/jpeg' || type === 'image/png' || type === 'image/webp';
};

export const getParsedTitle = (name) => {
  const title = name.toString().replaceAll(' ', '-');
  const regex = /[^\d()A-Za-z-]+/g;
  return title.replaceAll(regex, '');
};
export const eventTrack = (action, parameters) => {
  if (window.gtag !== undefined) window.gtag('event', action, parameters);
};

export const currencyFormat = (value, currencyLocale) => {
  if (value) {
    return ` ${new Intl.NumberFormat(currencyLocale).format(value)}`;
  }
  return '';
};

export const currencyParser = (event, currencyLocale) => {
  let { value } = event.target;
  // eslint-disable-next-line no-console
  console.log('inside currency parser==============', value);
  try {
    if (typeof value === 'string' && value.length === 0) {
      value = '0.0';
    }
    const group = new Intl.NumberFormat(currencyLocale)
      .format(1111)
      .replaceAll('1', '');
    const decimal = new Intl.NumberFormat(currencyLocale)
      .format(1.1)
      .replaceAll('1', '');
    let reversedValue = value.replaceAll(new RegExp(`\\${group}`, 'g'), '');
    reversedValue = reversedValue.replaceAll(
      new RegExp(`\\${decimal}`, 'g'),
      '.'
    );
    reversedValue = reversedValue.replaceAll(/[^\d.]/g, '');
    const digitsAfterDecimalCount = (reversedValue.split('.')[1] || []).length;
    const needsDigitsAppended = digitsAfterDecimalCount === 2;
    if (needsDigitsAppended) {
      event.preventDefault();
    }
    return Number.isNaN(reversedValue) ? 0 : reversedValue;
  } catch {
    return false;
  }
};

export const shortenValues = (number) => {
  number = number?.toString().replaceAll(/[^\d.]/g, '');
  if (number < 1000) {
    return number;
  }
  const si = [
    { v: 1e3, s: 'K' },
    { v: 1e6, s: 'M' },
    { v: 1e9, s: 'B' },
    { v: 1e12, s: 'T' },
    { v: 1e15, s: 'P' },
    { v: 1e18, s: 'E' },
  ];
  let index;
  // eslint-disable-next-line no-plusplus
  for (index = si.length - 1; index > 0; index--) {
    if (number >= si[index].v) {
      break;
    }
  }
  return `${(number / si[index].v)
    .toFixed(2)
    .replace(/\.0+$|(\.\d*[1-9])0+$/, '$1')} ${si[index].s}`;
};

export const startDateCondition = (value, data) => {
  let diff;
  if (data?.length === 2) {
    diff = data[0].format();
  } else
    switch (value) {
      case 'today': {
        diff = moment().startOf('day').format();
        break;
      }
      case 'yester_day': {
        diff = moment().startOf('day').subtract(1, 'days').format();
        break;
      }
      case 'customize': {
        diff = '';
        break;
      }
      default: {
        diff = moment().subtract(data?.count, 'days').format();
      }
    }
  return diff;
};

export const endDateCondition = (value, data) => {
  let diff;
  if (data?.length === 2) {
    diff = moment(data[1]).format();
  } else if (value === 'yester_day') {
    diff = moment().startOf('day').format();
  } else if (value === 'customize') {
    diff = '';
  } else {
    diff = moment().format();
  }
  return diff;
};

export const orderStartDate = (value, data) => {
  let startDate;
  if (value === 'today') {
    startDate = moment().startOf('day').format();
  } else if (value === 'yester_day') {
    startDate = moment().startOf('day').subtract(1, 'days').format();
  } else {
    startDate = moment().subtract(data?.count, 'days').format();
  }
  return startDate;
};

export const orderEndDate = (value) => {
  const endDate =
    value === 'yester_day'
      ? moment().startOf('day').format()
      : moment().format();
  return endDate;
};

export const getParticularTabCardData = (listData, tabName, index) => {
  const filterData = listData.filter((item) => item.tab_name === tabName);
  return get(filterData, `[0].social_leads_tab_to_customer[${index}]`, '');
};

export const couponTypes = [
  {
    value: 'amount-cut-off',
    label: 'Order Discount coupon',
    description: (
      <>
        <div>Offer a percentage or amount based discounts to</div>
        <div>your customers.</div>
      </>
    ),
  },
  {
    value: 'coupon-on-specific',
    label: 'Discount on product / category',
    description: (
      <>
        <div>Offer a percentage or amount based discounts on</div>
        <div>specific product / category to your customers.</div>
      </>
    ),
  },
  // {
  //   value: 'buy-x-get-y',
  //   label: 'Buy X get Y',
  //   description: (
  //     <>
  //       <div>Offer free products on purchase of certain products</div>
  //       <div> or based on minimum purchase amount</div>
  //     </>
  //   ),
  // },
  {
    value: 'free-shipping',
    label: 'Free shipping',
    description: (
      <>
        <div>Offer free shipping based on products or minimum</div>
        <div>purchase amount.</div>
      </>
    ),
  },
];

export const couponDiscountTypes = [
  {
    value: 'Value',
    label: 'By Value',
  },
  {
    value: 'Percentage',
    label: 'By Percentage',
  },
];

export const couponSelectOptions = [
  {
    value: 'Product',
    label: 'Product',
  },
  {
    value: 'Category',
    label: 'Category',
  },
  // {
  //   value: 'Collection',
  //   label: 'Collection',
  // },
];

export const couponUsageLimits = [
  {
    value: 'One Time',
    label: 'Only once',
  },
  {
    value: 'Unlimited',
    label: 'Unlimited',
  },
  {
    value: 'Number of times',
    label: 'Custom',
  },
];

export const handleDragBackWardCard = (result, orderTitle) => {
  const source = orderTitle?.findIndex(
    (item) => item?.name === result?.source?.droppableId
  );
  const destination = orderTitle?.findIndex(
    (item) => item?.name === result?.destination?.droppableId
  );
  return destination > source;
};

export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replaceAll('-', '+').replaceAll('_', '/');
    return JSON.parse(atob(base64));
  } catch {
    return '';
  }
};

export const handleDragForWardCard = (result, orderTitle) => {
  const destination = orderTitle?.findIndex(
    (item) => item?.name === result?.destination?.droppableId
  );
  return destination <= 5;
};

export const handleFilterOrders = (name, orderTitle) => {
  const filterOrder = orderTitle?.find((item) => item?.name === name);
  return filterOrder;
};

export const handleValidDate = (date, tenantDetails) => {
  const vadlidDate =
    moment(date).isValid() &&
    moment(date).format(
      get(tenantDetails, 'setting.date_format', 'DD-MM-YYYY hh:mm')
    );
  return vadlidDate;
};

export const getMilestoneBySulg = (status, sulg) => {
  const filterStatus = status?.filter(
    (item) => item?.milestone_code === sulg
  )[0];
  return filterStatus;
};

export const handleInsertWhatsappNumber = (phoneNumber) => {
  insertWhatsappNumber({ mobile_number: phoneNumber })
    .then(() => {})
    .catch((error) => {
      notification.error({
        message:
          error.message || 'Some error occurred to insert whatsapp number',
      });
    });
};

export const downloadImage = async ({ ref, name }) => {
  const link = document.createElement('a');
  link.download = name;
  link.href = ref.current.toBase64Image();
  link.click();
};
// eslint-disable-next-line consistent-return
export const fileListTypeCount = (data, data2) => {
  const videoArrayOne = filter(data, (item) =>
    item?.name?.includes('.mp4')
  ).length;
  const videoArrayTwo = filter(data2, (item) =>
    item?.type?.startsWith('video')
  ).length;
  const imageArrayOne = filter(data, (item) =>
    item?.name?.includes('.jpg')
  ).length;
  const imageArrayTwo = filter(data2, (item) =>
    item?.type?.startsWith('image')
  ).length;

  const totalVideos = videoArrayOne + videoArrayTwo;
  const totalImages = imageArrayOne + imageArrayTwo;
  const totalMedia = totalVideos + totalImages;

  if (totalVideos === 1 && totalImages > 6) {
    return 'You can only have 1 video when there are more than 6 images.';
  }
  if (totalVideos === 2 && totalImages > 5) {
    return 'You can only have 2 videos when there are more than 5 images.';
  }
  if (totalMedia > 7) {
    return 'The total media count exceeds 7.';
  }
  if (totalImages > 7) {
    return 'You can only have up to 7 images.';
  }
  if (totalVideos > 2) {
    return 'You can only have up to 2 videos.';
  }
  if (data.length === 7) {
    return 'Media Limit Exceeded. Please delete media to update';
  }
};
export const productRatingCount = (row) => {
  const productRating = get(row, 'product_ratings', []);
  const rating = map(productRating, (item) => item?.ratings);
  const countBy = reduce(
    rating,
    (key, value) => {
      key[value] = (key[value] || 0) + 1;
      return key;
    },
    {}
  );
  const averageStar = [];
  map(Object.entries(countBy), ([key, value]) => {
    averageStar.push(key * value);
  });
  const totalStars = reduce(averageStar, (total, number) => total + number, 0);
  const productRatingLength = productRating?.length || 0;
  const averageRatings =
    productRatingLength > 0 ? totalStars / productRatingLength : 0;
  return averageRatings;
};

export const handleSubCategories = (
  categoryDataSet,
  selectedCategoriesItems
) => {
  const dataList = reduce(
    categoryDataSet,
    (result, item) => {
      if (includes(selectedCategoriesItems, get(item, 'category_uid', ''))) {
        const subCategory = item?.sub_category;
        if (subCategory) {
          result.push(subCategory);
        }
      }
      return result;
    },
    []
  );
  return dataList;
};

export const dummyRequest = ({ onSuccess }) => {
  setTimeout(() => {
    onSuccess('ok');
  }, 0);
};

export const indiaValueCountStyle = new Intl.NumberFormat('en-IN');

export const dynmicData = {
  yearCount: 0,
  monthCount: 0,
  weekCount: 0,
  crntYear: new Date().getFullYear(),
  crntMonth: new Date().getMonth() + 1,
  crntDate: 0,
  userOnboardYear: 0,
  userOnboardMonth: 0,
  userOnboardDate: 0,
  displayName: '',
};

export const selectOptionValue = [
  { value: 'Yearly', label: 'YTD' },
  { value: 'Monthly', label: 'MTD' },
  { value: 'Weekly', label: 'Weekly' },
];

export const chartContainerFunction = (resp) => {
  const containerData = {
    viewsTotalCount: '',
    clicksTotalCount: '',
    ctaTotalCount: '',
    viewsStartDate: '',
    clicksStartDate: '',
    ctaStartDate: '',
  };
  resp?.count?.reduce((accumulator, currentValue) => {
    switch (currentValue.Event_Name) {
      case 'PRODUCT_VIEWS': {
        accumulator.viewsStartDate = currentValue.DateWise;
        accumulator.viewsTotalCount = indiaValueCountStyle.format(
          Number(currentValue.Interactions)
        );

        break;
      }
      case 'PRODUCT_CLICK': {
        accumulator.clicksStartDate = currentValue.DateWise;
        accumulator.clicksTotalCount = indiaValueCountStyle.format(
          Number(currentValue.Interactions)
        );

        break;
      }
      case 'CALL_TO_ACTION': {
        accumulator.ctaStartDate = currentValue.DateWise;
        accumulator.ctaTotalCount = indiaValueCountStyle.format(
          Number(currentValue.Interactions)
        );

        break;
      }
      default:
    }
    return accumulator;
  }, containerData);
  return containerData;
};

export const chartDataFunction = (resp) => {
  const chartData = {
    viewDate: [],
    viewCount: [],
    clickCount: [],
    ctaCount: [],
  };
  resp.data?.reduce((accumulator, currentValue) => {
    switch (currentValue.Event_Name) {
      case 'PRODUCT_VIEWS': {
        accumulator.viewCount.push(currentValue.Interactions);
        accumulator.viewDate.push(currentValue.DateWise);
        break;
      }
      case 'PRODUCT_CLICK': {
        accumulator.clickCount.push(currentValue.Interactions);
        break;
      }
      case 'CALL_TO_ACTION': {
        accumulator.ctaCount.push(currentValue.Interactions);
        break;
      }
      default:
    }
    return accumulator;
  }, chartData);
  return chartData;
};

export const dynmicApiCallInDashboard = async (dashboard) => dashboard;

export const uploadObjectInOrder = (value) => {
  let List = [];
  let withUrl = [];
  let withoutUrl = [];
  const url = window.location.href;
  const searchString = 'edit-product';
  if (includes(url, searchString)) {
    withUrl = filter(value, (value_) => {
      return !isEmpty(value_?.productImageInfo);
    });
    withoutUrl = filter(value, (value_) => {
      return isEmpty(value_?.productImageInfo);
    });
  } else {
    withUrl = filter(value, (value_) => {
      return value_?.url !== '';
    });
    withoutUrl = filter(value, (value_) => {
      return value_?.url === '';
    });
  }
  List = [...withUrl, ...withoutUrl];
  map(List, (values, index) => {
    values.id = index + 1;
  });
  return List;
};

export const handleCarouselImages = (image) => {
  if (image.url) {
    return image.url;
  }
  if (typeof image === 'string') {
    return image;
  }
  return URL.createObjectURL(new Blob([image?.file]));
};

export const dataURLtoFile = (dataurl, filename) => {
  const dataURLParts = dataurl.match(/^data:(.*?);base64,(.*)$/);

  if (!dataURLParts) {
    throw new Error('Invalid data URL');
  }

  const mime = dataURLParts[1];
  const base64String = dataURLParts[2];

  const binaryString = atob(base64String);
  const byteArray = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    byteArray[index] = binaryString.codePointAt(index);
  }

  const blob = new Blob([byteArray], { type: mime });

  return new File([blob], filename, { lastModified: Date.now() });
};

export const gupshupTemplateMessage = (parameters, content) => {
  if (!isEmpty(parameters)) {
    const templateObject = Object.fromEntries(
      parameters.map((currentValue, currentIndex) => [
        `${currentIndex + 1}`,
        currentValue,
      ])
    );
    try {
      const template = Handlebars.compile(content);
      const result = template(templateObject);
      return result;
    } catch {
      return content;
    }
  }
  return content;
};
