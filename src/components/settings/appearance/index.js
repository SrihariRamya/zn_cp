/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState } from 'react';
import { Breadcrumb } from 'antd';
import './appearance.less';
import { Link } from 'react-router-dom';
import Tour from 'reactour';
import { get } from 'lodash';
import {
  getOnboardGuide,
  putOnboardSubGuide,
} from '../../../utils/api/url-helper';
import AppearanceTab from './appearance-tab';
import { AppearanceProvider } from '../../context/appearance-context';
import {
  disableTabEnterKey,
  enableTabEnterKey,
} from '../../../shared/function-helper';
import {
  APPEARANCE_TITLE,
  LAYOUT_TITLE,
} from '../../../shared/constant-values';

const Appearance = () => {
  const [openTourModal, setOpenTourModal] = useState(false);
  const [tourCurrentStep, setTourCurrentStep] = useState(0);
  const [callEditorContext, setCallEditorContext] = useState(false);
  const [callEditorContext1, setCallEditorContext1] = useState(false);
  const [callEditorContext2, setCallEditorContext2] = useState(false);
  const [callEditorContext3, setCallEditorContext3] = useState(false);
  const [callSetMenu, setCallSetMenu] = useState(false);

  useEffect(() => {
    getOnboardGuide().then((response) => {
      const guide = response.data.find((index) =>
        index.subGuide.find((index_) => index_.slug === 'appearance')
      );
      const subGuide = guide.subGuide.find(
        (index_) => index_.slug === 'appearance'
      );
      const isAppearanceCompleted = get(subGuide, 'completed', false);
      setOpenTourModal(!isAppearanceCompleted);
    });
  }, []);

  function completeTour() {
    if (openTourModal) {
      putOnboardSubGuide({
        completed: true,
        slug: 'appearance',
      });
    }
  }

  const TourSteps = [
    {
      selector: '#appearance',
      content: `Here, you can create appearance for your webpage.`,
    },
    {
      selector: '#appearance-lane-component',
      content: `Drag any lane to the layout`,
    },
    {
      selector: '#droppable-layout',
      content: `Drop the lane here`,
    },
    {
      selector: '#droppable-layout',
      content: `click on the lane then content tab will appear`,
    },
    {
      selector: '#appearance-context-component',
      content: `Drag any content and Drop to the layout`,
    },
    {
      selector: '.col-outer',
      content: `Text content is added here`,
    },
    {
      selector: '#settings-properties-page',
      content: `Here, you can change page properties`,
    },
    {
      selector: '#settings-properties-header',
      content: `Here, you can change header properties`,
    },
    {
      selector: '#settings-properties-footer',
      content: `Here, you can change footer properties`,
    },
    {
      selector: '#appearance-save-btn',
      content: `Finally click save & publish button to Save appearance`,
    },
  ];

  useEffect(() => {
    if (openTourModal) {
      disableTabEnterKey();
    } else {
      enableTabEnterKey();
    }
  }, [openTourModal]);

  useEffect(() => {
    if (openTourModal) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [openTourModal]);

  return (
    <>
      <div>
        <Breadcrumb separator=">">
          <Breadcrumb.Item className="breadcrumb-title">
            <Link to="/appearance">{APPEARANCE_TITLE}</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{LAYOUT_TITLE}</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div>
        <AppearanceTab
          callEditorContext={callEditorContext}
          callEditorContext1={callEditorContext1}
          callEditorContext2={callEditorContext2}
          callEditorContext3={callEditorContext3}
          callSetMenu={callSetMenu}
          openTourModal={openTourModal}
          setTourCurrentStep={setTourCurrentStep}
        />
      </div>
      <Tour
        steps={TourSteps}
        isOpen={openTourModal}
        onRequestClose={() => {
          setOpenTourModal(false);
          completeTour();
        }}
        maskSpace={tourCurrentStep === 4 && 15}
        goToStep={tourCurrentStep}
        prevStep={() => {
          if (tourCurrentStep === 2) {
            setCallSetMenu('lanes');
          }
          if (tourCurrentStep === 3) {
            setCallEditorContext2(false);
          }
          if (tourCurrentStep === 5) {
            setCallEditorContext3(true);
            setCallSetMenu('sections');
          }
          if (tourCurrentStep === 6) {
            setCallSetMenu('sections');
          }
          if (tourCurrentStep === 7) {
            document.getElementById('appearance-scroll').scroll(0, 0);
          }
          if (tourCurrentStep === 8) {
            window.scroll(0, 100);
          }
          if (tourCurrentStep === 9) {
            window.scroll(0, 500);
          }
          if (tourCurrentStep > 0) {
            setTourCurrentStep(tourCurrentStep - 1);
          }
        }}
        nextStep={() => {
          if (tourCurrentStep === 2) {
            setCallEditorContext(true);
          }
          if (tourCurrentStep === 3) {
            document.getElementById('appearance-droppable-content').click();
          }
          if (tourCurrentStep === 4) {
            setCallEditorContext1(true);
            setCallSetMenu('settings');
          }
          if (tourCurrentStep === 5) {
            setCallSetMenu('settings');
          }
          if (tourCurrentStep === 6) {
            window.scroll(0, 200);
          }
          if (tourCurrentStep === 7) {
            window.scroll(0, 500);
          }
          if (
            tourCurrentStep === 2 ||
            tourCurrentStep === 4 ||
            tourCurrentStep === 5
          ) {
            setTimeout(() => {
              setTourCurrentStep((step) => step + 1);
            }, 200);
          } else if (tourCurrentStep < TourSteps.length) {
            setTourCurrentStep(tourCurrentStep + 1);
          }
        }}
        accentColor="#38523B"
        closeWithMask={false}
        disableFocusLock
      />
    </>
  );
};

const AppearanceContext = () => {
  return (
    <AppearanceProvider>
      <Appearance />
    </AppearanceProvider>
  );
};

export default AppearanceContext;
