import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { isEmpty } from 'lodash';
import { Col, Row } from 'antd';
import ContextProperty from '../property/context-property/index';

const getItemStyle = (_isDragging, draggableStyle) => ({
  ...draggableStyle,
});

function ContextDndComponent({
  contextProperties,
  context,
  editorContext,
  setEditorContext,
  webLayout,
}) {
  return (
    <>
      {isEmpty(contextProperties) ? (
        <>
          <Droppable
            droppableId="content-draggable"
            isDropDisabled
            type="context"
          >
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <Row>
                  {context.map((item, index) => (
                    <Draggable
                      key={item.appearance_widget_uid}
                      draggableId={item.appearance_widget_uid}
                      index={index}
                    >
                      {(provideds, snapshots) => (
                        <Col
                          className="lane-menu-image"
                          ref={provideds.innerRef}
                          {...provideds.draggableProps}
                          {...provideds.dragHandleProps}
                          style={getItemStyle(
                            snapshots.isDragging,
                            provideds.draggableProps.style
                          )}
                        >
                          <div id={`appearance-widget-uid-${index}`}>
                            <img
                              src={item.widget_image}
                              alt={item.widget_type}
                              width="70px"
                            />
                          </div>
                          {item.widget_title}
                        </Col>
                      )}
                    </Draggable>
                  ))}
                </Row>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </>
      ) : (
        <ContextProperty
          contextProperties={contextProperties}
          setEditorContext={setEditorContext}
          editorContext={editorContext}
          webLayout={webLayout}
        />
      )}
    </>
  );
}

export default ContextDndComponent;
