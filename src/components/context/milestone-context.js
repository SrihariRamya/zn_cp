import React, { useState, createContext, useEffect, useMemo } from 'react';
import { getOnboardGuide } from '../../utils/api/url-helper';

export const MilestoneContext = createContext();

export function MilestoneProvider(properties) {
  const [onBoardData, setOnBoardData] = useState([]);

  const fetchTourData = async () => {
    const data = await getOnboardGuide();
    setOnBoardData(data);
    return data;
  };

  useEffect(() => {
    fetchTourData();
  }, []);

  const contextValue = useMemo(
    () => ({ onBoardData, fetchTourData }),
    [onBoardData, fetchTourData]
  );

  return (
    <MilestoneContext.Provider value={contextValue}>
      {properties.children}
    </MilestoneContext.Provider>
  );
}
