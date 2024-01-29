import React from 'react';
import { Row, Col, Popover, Button, Tooltip } from 'antd';
import { useLocation } from 'react-router-dom';
import { get, map } from 'lodash';
import RowComponent from './row-component';
import { ReactComponent as Undo } from '../Icon/undo.svg';
import { ReactComponent as Redo } from '../Icon/redo.svg';
import { ReactComponent as WebView } from '../Icon/webView.svg';
import { ReactComponent as Save } from '../Icon/save.svg';
import { ReactComponent as MobView } from '../Icon/mobView.svg';
import { useComponentContext } from '../context/components';

function ComponentDND(properties) {
  const { componentValues } = properties;
  const location = useLocation();
  const {
    createOrUpdateContext,
    imageModal,
    undoComponent,
    redoComponent,
    componentStateIndex,
    componentStateLastIndex,
  } = useComponentContext();
  const canUndo = componentStateIndex > 0;
  const canRedo = componentStateIndex < componentStateLastIndex;

  const id = get(location, 'search', '').slice(1);
  const iconArray = [
    {
      key: 'Undo',
      icon: (
        <Undo
          onMouseEnter={(event) => {
            if (!canUndo) event.target.style.cursor = 'not-allowed';
          }}
          onMouseLeave={(event) => {
            event.target.style.cursor = 'pointer';
          }}
          onClick={() => {
            if (canUndo) undoComponent();
          }}
        />
      ),
    },
    {
      key: 'Redo',
      icon: (
        <Redo
          onMouseEnter={(event) => {
            if (!canRedo) event.target.style.cursor = 'not-allowed';
          }}
          onMouseLeave={(event) => {
            event.target.style.cursor = 'pointer';
          }}
          onClick={() => {
            if (canRedo) redoComponent();
          }}
        />
      ),
    },
    {
      key: 'Web',
      icon: <WebView />,
    },
    {
      key: 'Mobile',
      icon: <MobView />,
    },
  ];
  const content = (
    <div className="save-page">
      {map(iconArray, (item) => (
        <Tooltip placement="bottom" title={item.key}>
          {item.icon}
        </Tooltip>
      ))}
    </div>
  );

  const onPublishTemplate = () => {
    const publish = true;
    createOrUpdateContext(id, publish);
  };

  return (
    <Row
      key="component-dnd"
      id="component-dnd"
      style={{
        background: '#F5F7FD',
        display: 'flex',
        width: get(componentValues, 'globalStyles.width', 100),
      }}
    >
      <Col
        span={24}
        style={{ ...get(componentValues, 'globalStyles') }}
        id={imageModal ? 'no-capture' : 'capture'}
        key="component-dnd-col"
      >
        {componentValues.row && (
          <>
            <div className="save-icon-btn" id="save-div" key="save-div">
              <Popover
                placement="left"
                content={content}
                trigger={false}
                key="popover"
              >
                <Tooltip placement="bottom" title="Save">
                  <Save onClick={() => createOrUpdateContext(id, false)} />
                </Tooltip>
              </Popover>
              <Button
                key="button"
                className="publish-btn"
                onClick={() => onPublishTemplate()}
              >
                Publish
              </Button>
            </div>
            <RowComponent row={componentValues.row} key="row-component" />
          </>
        )}
      </Col>
    </Row>
  );
}
export default ComponentDND;
