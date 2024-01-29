import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NotFoundPage from '../components/not-found';

export default function CustomSwitch(properties) {
  const { children } = properties;
  return (
    <Routes>
      {children}
      <Route path="*" component={NotFoundPage} />
    </Routes>
  );
}
