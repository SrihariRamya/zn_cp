import React, { useState } from 'react';
import { Input } from 'antd';
import { Droppable } from 'react-beautiful-dnd';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/clic/noun-delete.svg';

const List = ({
  children,
  listId,
  handleEditLead,
  handleDeleteLead,
  totalListLength,
  data,
}) => {
  const { title, enquiry_leads_uid: enquiryLeadsUid } = data;
  const [showInput, setShowInput] = useState(false);
  const [isShowDeleteIcon, setIsShowDeleteIcon] = useState(true);
  const handleTitleChange = (event) => {
    if (event.key === 'Enter') {
      handleEditLead(event.target.value, data);
      setShowInput(false);
    }
  };
  const handleInputTitle = () => {
    setShowInput(true);
    if (listId === 0 || listId === totalListLength - 1)
      setIsShowDeleteIcon(false);
    else setIsShowDeleteIcon(true);
  };
  const handleConfirmModal = () => {
    handleDeleteLead(data);
  };
  return (
    <div className="list-wrapper">
      <div
        className="enquire-list-title"
        onClick={handleInputTitle}
        onKeyPress={handleTitleChange}
        onBlur={() => setShowInput(false)}
        role="button"
        tabIndex="0"
      >
        {!showInput ? (
          <h3>{title}</h3>
        ) : (
          <div className="flex-center-sb">
            <Input defaultValue={title} />
            {isShowDeleteIcon && <DeleteIcon onClick={handleConfirmModal} />}
          </div>
        )}
      </div>
      <div className="leads-overflow-container">
        <Droppable droppableId={enquiryLeadsUid}>
          {(provided) => (
            <div ref={provided.innerRef}>
              <div>
                {children}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default List;
