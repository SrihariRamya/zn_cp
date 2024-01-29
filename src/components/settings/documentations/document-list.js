import React, { useState } from 'react';
import { Button, Card, Switch, Col, Row, Alert, Tooltip, Tour } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { get, map } from 'lodash';
import { Link } from 'react-router-dom';
import { ReactComponent as DocumentationIcon } from '../../../assets/icons/documentation-icon.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/images/delete-icon.svg';
import { ReactComponent as EditIcon } from '../../../assets/icons/edit-icon.svg';
import { ReactComponent as EditGreenIcon } from '../../../assets/images/edit-icon.svg';
import SettingsMobileHeading from '../setting-mobile-heading';
import { putOnboardSubGuide } from '../../../utils/api/url-helper';

function DocumentList(properties) {
  const {
    documentData,
    handleAddDocument,
    handleDocumentStatus,
    handleDelete,
    mobileView,
    setScreenState,
    openTourModal,
    setOpenTourModal,
  } = properties;
  const [editDocumentModalMobile, setEditDocumentModalMobile] = useState(false);
  const [currentSteps, setCurrentSteps] = useState(0);
  const documentId = documentData.find(
    (document_) => document_.document_name === 'About Us'
  )?.document_id;

  const handleClickEditDocument = () => {
    setEditDocumentModalMobile(!!mobileView);
    if (openTourModal) {
      setOpenTourModal(false);
      setCurrentSteps(0);
    }
  };

  function completeTour() {
    if (openTourModal) {
      putOnboardSubGuide({
        completed: true,
        slug: 'policy',
      });
    }
  }

  const handleSkip = () => {
    setOpenTourModal(false);
    completeTour();
  };

  const handleEdit = () => {
    setOpenTourModal(false);
  };

  const steps = [
    {
      title: '',
      description: (
        <div className="milestone-description">
          <span>
            &apos;About Us &apos; is to share your journey, values, and what
            makes your store special.{' '}
            <b style={{ color: '#0B3D60' }}>
              Let customers connect with your brand on a personal level.
            </b>
          </span>
          <div>
            <span className="footer-inner-left-span space-between-milestone">
              <Button className="skip-btn-tour" onClick={() => handleSkip()}>
                Skip
              </Button>
              <Link to={`/settings/${documentId}`}>
                <Button type="primary" onClick={handleEdit}>
                  Edit
                </Button>
              </Link>
            </span>
          </div>
        </div>
      ),
      target: () => {
        const elements = document.querySelectorAll('.about-us');
        return get(elements, 'length') > 0 ? elements[0] : undefined;
      },
    },
  ];

  const handleDocumentName = (data) => {
    return (
      <p
        className={mobileView ? 'document-title-text' : 'box-title-text'}
        style={{ whiteSpace: 'nowrap' }}
      >
        {data?.document_name}
      </p>
    );
  };
  const handleDocumentSwitch = (data) => {
    return (
      <Switch
        checked={data.is_active}
        style={{ float: 'right' }}
        onClick={(value) => handleDocumentStatus(value, data)}
        className="switch-container"
      />
    );
  };
  const handleDocumentTooltip = (data) => {
    return (
      data.document_name === 'Terms & Conditions' && (
        <span className="description">
          <Tooltip title="Will be available on the Sign Up page">
            <Alert banner message="Will be available on the Sign Up page" />
          </Tooltip>
        </span>
      )
    );
  };
  const handleDocumentEdit = (data) => {
    return mobileView ? (
      <Link to={`/settings/${data?.document_id}`}>
        <EditGreenIcon onClick={() => handleClickEditDocument()} />
      </Link>
    ) : (
      <Link to={`/settings/${data?.document_id}`}>
        <Button
          icon={<EditIcon />}
          style={{ width: '100%' }}
          type="primary"
          onClick={() => handleClickEditDocument()}
        >
          edit
        </Button>
      </Link>
    );
  };
  const handleDocumentDelete = (data) => {
    return (
      <DeleteIcon
        onClick={() => {
          handleDelete(data?.document_id);
        }}
        style={{ cursor: 'pointer' }}
      />
    );
  };

  return (
    <div className={editDocumentModalMobile && 'box mobile-side-padding'}>
      {!editDocumentModalMobile && (
        <>
          <div
            className={mobileView ? 'mobile-view-add-page' : 'flex-end'}
            style={mobileView ? {} : { marginBottom: '10px' }}
          >
            <Button
              onClick={handleAddDocument}
              type="primary"
              id="add-document"
            >
              <PlusOutlined />
              Add new page
            </Button>
          </div>
          <div className={mobileView ? '' : 'box-description-background'}>
            {mobileView ? (
              <SettingsMobileHeading
                heading="Documentation Pages"
                Tooltip="false"
                setScreenState={setScreenState}
              />
            ) : (
              <div className="box-title-background">
                <DocumentationIcon />
                <h3 className="box-heading-text">Documentation Pages</h3>
              </div>
            )}

            <div className="card-container">
              <Row className="add-container-row-width">
                {map(documentData, (data) => {
                  return (
                    <Col
                      className="card-padding"
                      xs={24}
                      sm={24}
                      md={24}
                      lg={24}
                      xl={6}
                    >
                      <Card
                        className={`card-border ${
                          data?.document_name === 'About Us' ? 'about-us' : ''
                        }`}
                        key={data?.document_id}
                      >
                        {mobileView ? (
                          <Row>
                            <Col
                              span={12}
                              className={mobileView && 'flexbox-start'}
                            >
                              {handleDocumentName(data)}
                            </Col>
                            <Col span={4} className="flexbox-center">
                              {handleDocumentSwitch(data)}
                            </Col>
                            <Col span={4} className="flexbox-end">
                              {handleDocumentEdit(data)}
                            </Col>
                            <Col span={4}>{handleDocumentDelete(data)}</Col>
                          </Row>
                        ) : (
                          <>
                            <div className="title-space">
                              <Row>
                                <Col span={12}>{handleDocumentName(data)}</Col>
                                <Col span={12}>
                                  {handleDocumentSwitch(data)}
                                </Col>
                              </Row>
                              <Row>{handleDocumentTooltip(data)}</Row>
                            </div>
                            <div style={{ marginTop: '30px' }}>
                              <Row>
                                <Col span={data.is_default ? 24 : 20}>
                                  {handleDocumentEdit(data)}
                                </Col>
                                {!data.is_default && (
                                  <Col span={4}>
                                    {handleDocumentDelete(data)}
                                  </Col>
                                )}
                              </Row>
                            </div>
                          </>
                        )}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </div>
        </>
      )}

      <Tour
        open={openTourModal}
        onClose={() => setOpenTourModal(false)}
        steps={steps}
        placement="bottom"
        current={currentSteps}
      />
    </div>
  );
}

export default DocumentList;
