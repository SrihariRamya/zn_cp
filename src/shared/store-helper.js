import { uniqBy } from 'lodash';

export const getOptionValues = async (properties) => {
  const { keyId, data, labelName } = properties;
  const updateDistData = await data.map((item) => {
    return {
      key: item[keyId],
      value: item[keyId],
      label: item[labelName],
    };
  });
  return uniqBy(updateDistData, 'key');
};

export const getFilterData = async (properties) => {
  const { value, data, uniqKey, keyId, labelName } = properties;
  const keyData = [];
  const filterData = await value.reduce((previous, curn) => {
    data.forEach((item) => {
      if (curn.key === item[keyId]) {
        keyData.push({
          key: item[uniqKey],
          value: item[uniqKey],
          label: item[labelName],
        });
        previous.push(item);
      }
    });
    return previous;
  }, []);
  return {
    filterData: uniqBy(filterData, uniqKey),
    keyData: uniqBy(keyData, 'key'),
  };
};
