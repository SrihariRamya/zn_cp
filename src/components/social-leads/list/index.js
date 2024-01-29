import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Input, Button, notification, Modal } from 'antd';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete-icons.svg';
import {
  updateTabName,
  deleteTabAllChats,
} from '../../../utils/api/url-helper';

const List = ({
  children,
  name,
  list,
  index,
  button,
  socialLeads,
  fetchData,
  setIsModalOpen,
}) => {
  const { confirm } = Modal;
  const [showInput, setShowInput] = useState(false);
  const [isShowDeleteIcon, setIsShowDeleteIcon] = useState(false);

  const handleInputTile = (data) => {
    const includeData = ['discard', 'plan'];
    if (!includeData.includes(data.slug)) {
      setShowInput(true);
      setIsShowDeleteIcon(true);
    }
  };

  const handleTitleChange = (event, data) => {
    if (event?.key === 'Enter') {
      const formData = {
        changeTabName: event?.target?.value,
        tab_uid: data?.tab_uid,
      };
      updateTabName(formData)
        .then(() => {
          notification.success({
            message: 'Successfully changed Tab Name',
          });
          setShowInput(false);
          setIsShowDeleteIcon(false);
          fetchData();
        })
        .catch((error) => {
          notification.error({
            message:
              error.message || 'Some error occurred while updating tab name',
          });
          setShowInput(false);
          setIsShowDeleteIcon(false);
        });
    }
  };

  const showConfirm = (tabData) => {
    confirm({
      title: 'Do you Want to delete these items?',
      // icon: <ExclamationCircleFilled />,
      content: 'You lose all the chat from Leads',
      onOk() {
        deleteTabAllChats(tabData)
          .then(() => {
            notification.success({ message: 'Tab Deleted Successfully' });
            fetchData();
            setIsShowDeleteIcon(false);
            setShowInput(false);
          })
          .catch((error) => {
            notification.error({
              message: error.message || 'Some error occured while deleting tab',
            });
          });
      },
      onCancel() {
        setIsShowDeleteIcon(false);
      },
    });
  };

  const tabRenderFunction = (listData, tIndex, renderButton) => {
    if (socialLeads?.length === tIndex + 1 && renderButton) {
      return (
        <div
          style={{
            display: 'flex',
            marginBottom: '10px',
            width: '50px',
            padding: '5px',
            textAlign: 'center',
            border: '1px dashed #C1C1C1',
            background: '#fff',
          }}
        >
          <Button
            style={{ fontSize: '20px', border: '0' }}
            onClick={() => setIsModalOpen(true)}
          >
            {' '}
            +{' '}
          </Button>
        </div>
      );
    }
    return (
      <div
        style={{
          background:
            listData.slug === 'discard'
              ? '#D2DDF3 0% 0% no-repeat padding-box'
              : '#D8F2F2 0% 0% no-repeat padding-box',
          marginBottom: '10px',
          width: '350px',
          padding: '10px',
          textAlign: 'center',
        }}
        role="button"
        onClick={() => handleInputTile(listData)}
        onKeyPress={(event) => handleTitleChange(event, listData)}
        tabIndex="0"
      >
        {!showInput ? (
          <>{listData.tab_name}</>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Input
              defaultValue={listData.tab_name}
              onBlur={() => setShowInput(false)}
            />
            {isShowDeleteIcon && (
              <DeleteIcon onClick={() => showConfirm(listData)} />
            )}
          </div>
        )}
      </div>
    );
  };
  return (
    <div style={{ width: button ? '60px' : 'auto' }}>
      <h2 className={button && 'button-style'}>
        {tabRenderFunction(list, index, button)}
      </h2>
      <div>
        <Droppable droppableId={name}>
          {(provided) => (
            <div ref={provided.innerRef} className="h-screen">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
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
