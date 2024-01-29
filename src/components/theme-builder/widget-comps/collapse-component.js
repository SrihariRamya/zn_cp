import { get, isEmpty, map, toPairs } from 'lodash';
import React from 'react';

function CollapseComponent({ dataSource }) {
  const collapseData = [
    { 'ADDITIONAL DESCRIPTION': get(dataSource, 'description') },
    { 'KEY FEATURES': get(dataSource, 'key_features') },
    { 'SHELF LIFE': get(dataSource, 'shelf_life') },
    { 'MARKETED BY': get(dataSource, 'marketed_by') },
    { SELLER: get(dataSource, 'seller') },
    { 'COUNTRY OF ORIGIN': get(dataSource, 'country_of_origin') },
  ];
  const filterCollapseData = collapseData.filter(
    (index) => !isEmpty(toPairs(index)[0][1])
  );
  return (
    <>
      {map(filterCollapseData, (index) => {
        return (
          <div style={{ marginBottom: '8px' }}>
            <p
              style={{
                color: 'rgb(8, 7, 7)',
                padding: '0px',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              {get(toPairs(index), '[0][0]')}
            </p>
            <p> {get(toPairs(index), '[0][1]')}</p>
          </div>
        );
      })}
    </>
  );
}

export default CollapseComponent;
