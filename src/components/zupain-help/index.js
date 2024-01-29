import React, { useEffect, useRef, useContext, useState } from 'react';
import { Tabs, Tooltip } from 'antd';
import './zupain-help.less';
import { CloseCircleOutlined } from '@ant-design/icons';
import { TenantContext } from '../context/tenant-context';
import { ReactComponent as Home } from '../../assets/icons/home.svg';
import { ReactComponent as Faq } from '../../assets/icons/faq.svg';
import { ReactComponent as Messages } from '../../assets/icons/messages.svg';
import { ReactComponent as Notification } from '../../assets/icons/notifications.svg';
import { ReactComponent as ChatHelpIcon } from '../../assets/icons/chat-help-icon.svg';
import { ReactComponent as HelpIcon } from '../../assets/icons/help-icon.svg';
import FrequentlyAskedQuestions from './faq';
import ChatNotifications from './chat-notifications';
import ZupainHome from './home';

function ZupainHelp(properties) {
  const { setIsHelpWindowOpen, isHelpWindowOpen } = properties;
  const mobileView = useContext(TenantContext)[4];
  const [tooltipOpen, setTooltipOpen] = useState(true);

  const helpWindowReference = useRef(null);

  const menu = [
    {
      icon: <Home />,
      label: 'Home',
      module: <ZupainHome mobileView={mobileView} />,
    },
    {
      icon: <Faq />,
      label: 'FAQ',
      module: (
        <FrequentlyAskedQuestions
          isHelpWindowOpen={isHelpWindowOpen}
          module="FAQ"
          mobileView={mobileView}
        />
      ),
    },
    {
      icon: <Messages />,
      label: 'Messages',
      module: '',
    },
    {
      icon: <Notification />,
      label: 'Notification',
      module: <ChatNotifications />,
    },
  ];

  const handleOutsideClick = (event) => {
    if (
      helpWindowReference.current &&
      !helpWindowReference.current.contains(event.target)
    ) {
      setIsHelpWindowOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleToggleHelpWindow = () => {
    setIsHelpWindowOpen(!isHelpWindowOpen);
  };

  return (
    <div className="chat-section" ref={helpWindowReference}>
      {isHelpWindowOpen ? (
        <HelpIcon onClick={handleToggleHelpWindow} className="arrow-icon" />
      ) : (
        <Tooltip
          title={
            <div>
              <span>Need help?</span>
              <span className="need-help-close-icon">
                <CloseCircleOutlined onClick={() => setTooltipOpen(false)} />
              </span>
            </div>
          }
          trigger="click"
          placement="left"
          defaultOpen
          open={tooltipOpen}
        >
          <ChatHelpIcon
            onClick={handleToggleHelpWindow}
            className="chat-icon"
          />
        </Tooltip>
      )}
      {isHelpWindowOpen && (
        <div className={`help-container ${mobileView && 'w-85'}`}>
          <div className="menu-section">
            <Tabs
              tabPosition="bottom"
              defaultActiveKey="1"
              items={menu.map((data, index) => {
                const id = String(index + 1);
                return {
                  label: (
                    <span>
                      {data.icon}
                      <br />
                      {data.label}
                    </span>
                  ),
                  key: id,
                  children: data.module,
                };
              })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ZupainHelp;
