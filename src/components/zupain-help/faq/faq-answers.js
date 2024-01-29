/* eslint-disable react/no-danger */
/* eslint-disable camelcase */
import React from 'react';
import { LeftOutlined } from '@ant-design/icons';

function FaqAnswers(properties) {
  const { setIsShowAnswer, selectedFaqData, mobileView } = properties;
  const { media_link, answer, question } = selectedFaqData;
  return (
    <div className={`answer-section-container ${mobileView && 'w-85'}`}>
      <div className="answer-header">
        <div className="flex">
          <LeftOutlined
            className="mr-30 cursor-pointer"
            onClick={() => setIsShowAnswer(false)}
          />
          <span>{question}</span>
        </div>
      </div>
      <div className="answer" dangerouslySetInnerHTML={{ __html: answer }} />
      {media_link && (
        <iframe
          width={545}
          height={350}
          title="Video"
          src={media_link}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        />
      )}
    </div>
  );
}

export default FaqAnswers;
