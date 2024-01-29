import React, { useContext } from 'react';
import { get } from 'lodash';
import { TenantContext } from './context/tenant-context';

const ZupainSelectCustomer = () => {
  const [tenantDetails] = useContext(TenantContext);
  const zupainSelectCustomerUrl = get(
    tenantDetails,
    'zupain_select_customer_url',
    ''
  );

  return (
    <>
      <iframe
        className="iframe-kl-N"
        src={zupainSelectCustomerUrl}
        title="Iframe Example"
      />
    </>
  );
};

export default ZupainSelectCustomer;
