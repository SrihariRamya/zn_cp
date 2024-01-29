const apiPath = '/api';

module.exports = {
  getApiUrl: () => {
    const { protocol, hostname } = window.location;
    let { port } = window.location;
    let apiUrl;
    if (hostname.includes('localhost') || hostname.startsWith('192.168.')) {
      port = 4000;
      apiUrl = `${protocol}//${hostname}:${port}${apiPath}/v1`;
    } else {
      apiUrl = `${protocol}//${hostname}${apiPath}/v1`;
    }

    return apiUrl;
  },
  getWebSocketUrl: () => {
    const { protocol, hostname } = window.location;
    let { port } = window.location;
    let apiUrl;
    if (hostname.includes('localhost') || hostname.startsWith('192.168.')) {
      port = 4000;
      apiUrl = `${protocol}//${hostname}:${port}`;
    } else {
      apiUrl = `${protocol}//${hostname}`;
    }
    return apiUrl;
  },
};
