import React, { useContext } from 'react';
import { get } from 'lodash';
import { TenantContext } from './components/context/tenant-context';

function App() {
  const [tenantDetails, defaultImageData] = useContext(TenantContext);
  const favicon = document.querySelector('#favicon');
  favicon.href =
    get(tenantDetails, 'setting.favicon_image', '') ||
    get(defaultImageData, 'favicon_image', '');
  return <div />;
}

export default App;
