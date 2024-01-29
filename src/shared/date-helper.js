import {
  subtractDates,
  dateFormat,
  formatToLocal,
} from '@kaaylabs/date-helper';
import moment from 'moment';

export const dateSubract = (value) => {
  const dateDiff = subtractDates({
    date: new Date(),
    count: value,
    unit: 'days',
    fmt: 'YYYY-MM-DD',
  });
  return dateDiff;
};

export const currentDateWithFormat = (format) => {
  const getDate = dateFormat(new Date(), format);
  return getDate;
};

export const currentDate = () => {
  const getDate = dateFormat(new Date(), ' YYYY-MM-DD');
  return getDate;
};

export const utcToIst = (date) => {
  return date && formatToLocal({ date, fmt: 'LLL' });
};

export const extractDate = (dateField) => {
  const date = moment(dateField).isValid() ? moment(dateField).format() : '';
  return date;
};

export const disabledPreviousDate = (current) => {
  return current && current < moment().startOf('day');
};
