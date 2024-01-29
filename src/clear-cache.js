import React, { useState, useEffect } from 'react';
import moment from 'moment';
import packageJson from '../package.json';

const buildDateGreaterThan = (latestDate, currentDate) => {
  const momLatestDateTime = moment(latestDate);
  const momCurrentDateTime = moment(currentDate);

  if (momLatestDateTime.isAfter(momCurrentDateTime)) {
    return true;
  }
  return false;
};

function withClearCache(Component) {
  function ClearCacheComponent(properties) {
    const [isLatestBuildDate, setIsLatestBuildDate] = useState(false);

    const refreshCacheAndReload = () => {
      if (caches) {
        // Service worker cache should be cleared with caches.delete()
        caches.keys().then((names) => {
          // eslint-disable-next-line no-restricted-syntax
          for (const name of names) {
            caches.delete(name);
          }
        });
      }
      // delete browser cache and hard reload
      window.location.reload(true);
    };

    useEffect(() => {
      fetch('/meta.json')
        .then((response) => response.json())
        .then((meta) => {
          const latestVersionDate = meta.buildDate;
          const currentVersionDate = packageJson.buildDate;

          const shouldForceRefresh = buildDateGreaterThan(
            latestVersionDate,
            currentVersionDate
          );
          if (shouldForceRefresh) {
            setIsLatestBuildDate(false);
            refreshCacheAndReload();
          } else {
            setIsLatestBuildDate(true);
          }
        });
    }, []);

    return <>{isLatestBuildDate ? <Component {...properties} /> : null}</>;
  }

  return ClearCacheComponent;
}

export default withClearCache;
