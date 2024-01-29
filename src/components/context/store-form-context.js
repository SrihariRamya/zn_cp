import React, { useState, createContext } from 'react';

export const StoreContext = createContext();

export const StoreProvider = (properties) => {
  const [storeDetails, setStoreDetails] = useState({});

  return (
    <StoreContext.Provider value={[storeDetails, setStoreDetails]}>
      {properties.children}
    </StoreContext.Provider>
  );
};
