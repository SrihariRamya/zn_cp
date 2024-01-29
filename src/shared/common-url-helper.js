export const handleUrlChanges = (value, history, moduleName, state) => {
  const parameters = new URLSearchParams();
  parameters.append('page', value);
  return history({
    pathname: `/${moduleName}`,
    search: parameters.toString(),
    state,
  });
};

export default {};
