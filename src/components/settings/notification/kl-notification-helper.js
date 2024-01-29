import axios from 'axios';

export const getAll = (apiUrl, toGet, config = {}, relpath) =>
  axios.get(`${apiUrl}api/v1/message-template/${relpath || ''}`, toGet, config);

export const update = (apiUrl, toUpdate, config = {}, relpath) =>
  axios.put(
    `${apiUrl}api/v1/message-template/${relpath || ''}/${toUpdate.id || ''}`,
    toUpdate,
    config
  );
