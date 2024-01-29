import React, { useState } from 'react';
import { Modal, Button, Input, Col, Row } from 'antd';
import { useComponentContext } from '../../context/components';
import { RowJson } from '../../helper/component-helper';

function EmbedModal(properties) {
  const { visible, onCancel } = properties;
  const { componentValues, updateComponentState, setScrollToBottom } =
    useComponentContext();
  const [embedCode, setEmbedCode] = useState('');
  const { TextArea } = Input;
  const [showPreview, setShowPreview] = useState(false);

  const handleEmbedChange = (event) => {
    const { value } = event.target;
    setEmbedCode(value);
  };

  const updateComponent = () => {
    const newRow = RowJson('embed');
    newRow.column[0].component[0].componentProperties.value = embedCode;
    updateComponentState({
      ...componentValues,
      row: [...componentValues.row, { ...newRow }],
    });
    setScrollToBottom(true);
    setShowPreview(false);
    onCancel();
  };

  const onNextClick = () => {
    if (!embedCode) return;
    const parser = new DOMParser();
    const document_ = parser.parseFromString(embedCode, 'text/html');
    if (
      document_.documentElement.tagName === 'HTML' &&
      document_.documentElement.childNodes.length > 0
    ) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  };

  const onCancelClick = () => {
    setShowPreview(false);
  };

  return (
    <Modal
      title="Embed HTML Code"
      open={visible}
      onCancel={onCancel}
      footer={
        showPreview
          ? [
              <Button key="cancel" onClick={onCancelClick}>
                Cancel
              </Button>,
              <Button key="insert" type="primary" onClick={updateComponent}>
                Inset
              </Button>,
            ]
          : false
      }
    >
      {showPreview ? (
        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: embedCode,
          }}
        />
      ) : (
        <Row>
          <Col span={24}>
            <TextArea
              style={{ height: 120, marginBottom: 24 }}
              placeholder="Paste the HTML code here..."
              onChange={handleEmbedChange}
              value={embedCode}
            />
          </Col>
          <Col
            span={24}
            style={{ display: 'flex', justifyContent: 'end', gap: '10px' }}
          >
            <Button key="cancel" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              key="insert"
              htmlType="submit"
              type="primary"
              onClick={onNextClick}
            >
              Next
            </Button>
          </Col>
        </Row>
      )}
    </Modal>
  );
}

export default EmbedModal;
