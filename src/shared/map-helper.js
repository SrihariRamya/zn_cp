import _, { isString } from 'lodash';

export const getCity = (addressArray) => {
  let city = '';
  for (let index = 0; index < addressArray.length; index += 1) {
    if (
      addressArray[index].types[0] &&
      addressArray[index].types[0] === 'administrative_area_level_2'
    ) {
      city = addressArray[index].long_name;
      return city;
    }
  }
  return true;
};

export const getLocation = (addressArray) => {
  let locality = '';
  for (let index = 0; index < addressArray.length; index += 1) {
    if (
      addressArray[index].types[0] &&
      addressArray[index].types[0] === 'locality'
    ) {
      locality = addressArray[index].long_name;
      return locality;
    }
  }
  return '';
};

export const getArea = (addressArray) => {
  let area = '';
  for (let index = 0; index < addressArray.length; index += 1) {
    if (addressArray[index].types[0]) {
      for (
        let index_ = 0;
        index_ < addressArray[index].types.length;
        index_ += 1
      ) {
        if (
          addressArray[index].types[index_] === 'sublocality_level_1' ||
          addressArray[index].types[index_] === 'locality'
        ) {
          area = addressArray[index].long_name;
          return area;
        }
      }
    }
  }
  return true;
};

export const getStateName = (addressArray) => {
  let state = '';
  for (let index = 0; index < addressArray.length; index += 1) {
    if (
      addressArray[index].types[0] &&
      addressArray[index].types[0] === 'administrative_area_level_1'
    ) {
      state = addressArray[index].long_name;
      return state;
    }
  }
  return true;
};

export const getPinCode = (addressArray) => {
  const _pincode = _.find(addressArray, (ac) => ac.types[0] === 'postal_code')
    .short_name;
  return _pincode;
};

export const nameFormatter = (value) => {
  if (isString(value)) {
    const splitter = value.split(' ');
    if (splitter.length > 1) {
      return splitter[0]
        .concat(splitter[splitter.length - 1])
        .toString()
        .toLowerCase();
    }
    return splitter[0].toString().toLocaleLowerCase();
  }
  return '';
};

export const getAttributeByName = (data, attribute) => {
  if (data && attribute) {
    return data.variant_attributes.filter(
      (item) => item?.zm_attribute?.name === attribute
    );
  }
  return '';
};
