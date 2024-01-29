import React, { useState, createContext, useEffect } from 'react';

export const RoleContext = createContext();

export const RoleProvider = (properties) => {
  const [roleDetails, setRoleDetails] = useState([]);
  const [reloadState, setReloadState] = useState();
  const [roleID] = useState(localStorage.getItem('roleID'));
  const roleIds = {
    id: reloadState || roleID,
  };
  const fetchData = () => {
    const id = roleIds || reloadState;
    setRoleDetails(id);
  };
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadState]);

  return (
    <RoleContext.Provider value={[roleDetails, setReloadState]}>
      {properties.children}
    </RoleContext.Provider>
  );
};
