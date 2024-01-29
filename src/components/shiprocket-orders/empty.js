import React from 'react';
import EmptyData from '../../assets/images/no-data.svg';

function EmptyTag() {
  return (
    <div>
      <div>
        <img src={EmptyData} style={{ marginTop: '2rem' }} alt="Empty Data" />
      </div>
      <div style={{ margin: '7px 0 2rem 20px', color: '#CCCCCC' }}>No Data</div>
    </div>
  );
}

export default EmptyTag;
