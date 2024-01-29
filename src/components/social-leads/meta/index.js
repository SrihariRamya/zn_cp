import React, { useState } from 'react';
import { Card, Collapse, Input, Spin, notification } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { isEmpty, reverse } from 'lodash';
import {
  getConversationMessages,
  sendMessengerMessage,
} from '../../../utils/api/url-helper';
import '../social-leads.less';
import { ReactComponent as FacebookLogo } from '../../../assets/icons/facebook-logo.svg';
import { ReactComponent as InstagramLogo } from '../../../assets/icons/instagram-icon.svg';

const { Panel } = Collapse;

function MetaCard(properties) {
  const { data, fbPageId, igPageId } = properties;
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const tenantUid = localStorage.getItem('tenantUid');
  const cardName =
    data.participants.data[0].name || data.participants.data[1].username;
  const mediaType = data.participants.data[0].name
    ? '3px solid #0163E0'
    : '3px solid #B13589';
  const image = data.participants.data[0].name ? (
    <FacebookLogo />
  ) : (
    <InstagramLogo />
  );
  const responseId = data?.participants?.data[0]?.name
    ? data?.participants?.data[0]?.id
    : data?.participants?.data[1]?.id;

  const chatList = () => {
    return (
      <div className="flex-bwn">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>{cardName}</div>
        </div>
        {image}
      </div>
    );
  };

  const openChat = (event_) => {
    if (!isEmpty(event_)) {
      setLoading(true);
      getConversationMessages({ tenantUid, conversationId: data?.id })
        .then((datas) => {
          setLoading(false);
          const chat = datas?.data?.messages?.data;
          const reversedChat = reverse(chat);
          setChatHistory(reversedChat);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  const onMessageSend = () => {
    if (inputValue) {
      setLoading(true);
      const parameter = {
        tenantUid,
        psid: responseId,
        message: inputValue,
      };
      sendMessengerMessage(parameter)
        .then((response) => {
          if (response?.data?.message_id) {
            openChat(data?.id);
            setInputValue('');
          } else {
            setLoading(false);
            notification.error({
              message:
                response?.error?.message ||
                'Unable to send reply. Please try again later',
            });
          }
        })
        .catch(() => {
          notification.error({
            message:
              'Unable to reply, as the 24-hour time limit for this session has expired. Try within 24-hour after receiving a message',
          });
          setLoading(false);
        });
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="chat-card-container">
        <Card
          style={{
            width: 300,
            marginRight: '10px',
            borderTop: mediaType,
          }}
        >
          <div>
            <Collapse ghost onChange={(event) => openChat(event)}>
              <Panel header={chatList()} key={data.id} showArrow={false}>
                {chatHistory?.map((chat) => {
                  // eslint-disable-next-line eqeqeq
                  return chat?.from?.id == fbPageId ||
                    // eslint-disable-next-line eqeqeq
                    chat?.from?.id == igPageId ? (
                    <div className="receiver">{chat.message}</div>
                  ) : (
                    <div className="sender">{chat.message}</div>
                  );
                })}
                <Input
                  onChange={(event) => setInputValue(event?.target?.value)}
                  value={inputValue}
                  suffix={<SendOutlined onClick={() => onMessageSend()} />}
                />
              </Panel>
            </Collapse>
          </div>
        </Card>
      </div>
    </Spin>
  );
}

export default MetaCard;
