import { find, get } from 'lodash';
import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import RowComponent from './row-component';

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  background: isDragging ? 'lightgreen' : null,
  ...draggableStyle,
});

export default function EditorDndComponent({
  editorContext,
  identifier,
  setRowProperties,
  setContextProperties,
  setMenu,
  setEditorContext,
  columnMenu,
  rowProperties,
  contextProperties,
  settingProperties,
  webLayout,
}) {
  const settingWidth = get(
    find(
      settingProperties,
      (item) => item.variable_name === '--layout-body-width'
    ),
    'variable_value',
    '100%'
  );

  return (
    <div
      id="droppable-layout"
      style={{ width: webLayout ? settingWidth : '100%' }}
    >
      <Droppable droppableId={identifier} key={identifier}>
        {(provided) => {
          return (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {editorContext.map((item, index) => {
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
                          className="edit-dnd-component"
                        >
                          <RowComponent
                            column={get(item, 'column', [])}
                            row={item}
                            rowIndex={index}
                            backgroundColor={get(item, 'backgroundColor', '')}
                            renderArea={identifier}
                            setContextProperties={(properties) => {
                              setMenu('sections');
                              setContextProperties(properties);
                            }}
                            setRowProperties={() => {
                              setRowProperties({ item, index });
                              setMenu('lanes');
                            }}
                            setEditorContext={setEditorContext}
                            editorContext={editorContext}
                            columnMenu={columnMenu}
                            rowProperties={rowProperties}
                            contextProperties={contextProperties}
                            webLayout={webLayout}
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
      {!editorContext.length && (
        <h1 style={{ textAlign: 'center' }}>Drop your row here!</h1>
      )}
    </div>
  );
}
