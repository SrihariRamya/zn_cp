import React from 'react';
import { Tooltip } from 'antd';
import { ReactComponent as QuestionIcon } from '../assets/icons/question-icon.svg';

function ModalHeader(properties) {
  const { title } = properties;
  const handleTooltip = () => {
    return (
      <Tooltip title="Help and resources.">
        <QuestionIcon className="question-icon" />
      </Tooltip>
    );
  };
  return (
    <div>
      <p className="box-heading-text" style={{ display: 'flex' }}>
        <span>{title}</span>
        <div className="flexbox-center" style={{ marginLeft: '5px' }}>
          {handleTooltip()}
        </div>
      </p>
    </div>
  );
}

export default ModalHeader;
