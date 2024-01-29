import React, { useState, createContext, useMemo } from 'react';

export const WalletContext = createContext();

export function WalletProvider(properties) {
  const [walletBalance, setWalletBalance] = useState(0);
  const contextValue = useMemo(
    () => [walletBalance, setWalletBalance],
    [walletBalance, setWalletBalance]
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {properties.children}
    </WalletContext.Provider>
  );
}
