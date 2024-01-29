import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { get } from 'lodash';
import RowComponent from './row-component';

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  background: isDragging ? 'lightgreen' : null,
  ...draggableStyle,
});

function RowDndComponent({ laneMenuContent, identifier, setRowProperties }) {
  return (
    <div>
      <Droppable droppableId={identifier} key={identifier}>
        {(provided) => {
          return (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {laneMenuContent.map((item, index) => {
                return (
                  <Draggable
                    key={get(item, 'appearance_row_uid', '')}
                    draggableId={get(item, 'appearance_row_uid', '')}
                    index={index}
                    id={get(item, 'appearance_row_uid', '')}
                  >
                    {(provides, snapshots) => {
                      return (
                        <div
                          {...provides.draggableProps}
                          {...provides.dragHandleProps}
                          ref={provides.innerRef}
                          style={getItemStyle(
                            snapshots.isDragging,
                            provides.draggableProps.style
                          )}
                        >
                          <RowComponent
                            column={get(item, 'column', [])}
                            backgroundColor={get(item, 'backgroundColor', '')}
                            setRowProperties={() => {
                              setRowProperties({ item, index });
                            }}
                            renderArea={identifier}
                          />
                        </div>
                      );
                    }}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          );
        }}
      </Droppable>
    </div>
  );
}

export default RowDndComponent;
