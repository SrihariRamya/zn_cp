export const getTenantConfig = async () => {
  const fetchData = await fetch('/tenant-config-map.json').then((response) => {
    return response.json();
  });
  return fetchData;
};
export default {};
