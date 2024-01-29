import React from 'react';
import { get } from 'lodash';

function YoutubePlayer(properties) {
  const { comp } = properties;
  const { componentProperties } = comp;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          top: '0px',
          left: '0px',
          width: '100%',
          height: '100%',
          position: 'initial',
        }}
      >
        {' '}
        {get(componentProperties, 'value', '') && (
          <iframe
            id="youtube-video"
            title="Video"
            src={get(componentProperties, 'value', '')}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            style={{
              width: '100%',
              height: '100%',
              backgroundSize: 'cover',
              backgroundPosition: '50%',
            }}
          />
        )}
      </div>
    </div>
  );
}
export default YoutubePlayer;
