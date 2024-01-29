/* eslint-disable jsx-a11y/media-has-caption */
import { get } from 'lodash';
import React from 'react';

function VideoPreview(properties) {
  const { comp } = properties;
  const { componentProperties } = comp;
  return (
    <div>
      {get(componentProperties, 'value', '') && (
        <div>
          <video
            controls
            src={get(componentProperties, 'value', '')}
            style={{ width: '100%' }}
            crossOrigin="true"
          />
        </div>
      )}
    </div>
  );
}

export default VideoPreview;
