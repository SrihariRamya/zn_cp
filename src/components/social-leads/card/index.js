import React, { useState } from 'react';
import { Card, Collapse, Input, Spin, notification } from 'antd';
import Icon from '@ant-design/icons/lib/components/Icon';
import { SendOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { isEmpty, get } from 'lodash';
import { ReactComponent as Whatsapp } from '../../../assets/icons/WhatsApp-Logo.wine.svg';
import {
  sendWhatsappMessage,
  insertCustomerChat,
  getDiscardCustomerChatDetail,
} from '../../../utils/api/url-helper';
import '../social-leads.less';

const { Panel } = Collapse;

const whatsappIconRender = () => {
  return <Whatsapp />;
};

const CardItem = (properties) => {
  const { data, tenantWhatsappDetail, list, whatsAppApiUrl } = properties;
  const [inputValue, setInputValue] = useState('');
  const [cardLoading, setCardLoading] = useState(false);
  const [chatData, setChatData] = useState([]);
  const dummyFunction = () => {
    return (
      <div className="flex-bwn">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>{data.customer_name}</div>
          <div>{data.customer_number}</div>
        </div>
        <Icon component={() => whatsappIconRender()} />
      </div>
    );
  };

  const insertCustomerChatData = async (value) => {
    // eslint-disable-next-line camelcase
    const { tenant_uid, customer_serialized_id } = value;
    const whatsappUrl = `${whatsAppApiUrl}/users/chatDetail`;
    const customerChatData = await axios.get(whatsappUrl, {
      params: {
        mobileNumber: tenantWhatsappDetail?.mobile_number,
        referenceId: tenant_uid,
        searchNumber: customer_serialized_id,
      },
    });
    const formData = {
      customerChatData: customerChatData?.data?.formedData,
      customerData: value,
    };
    insertCustomerChat(formData)
      .then((response) => {
        const { getChatData } = response;
        setChatData(getChatData);
        setCardLoading(false);
        setInputValue('');
      })
      .catch((error) => {
        setCardLoading(false);
        notification.error({
          message:
            error.message ||
            'Some error occurred while inserting whatsapp chat data',
        });
      });
  };

  const onMessageSend = (customerData) => {
    if (inputValue) {
      setCardLoading(true);
      const formData = {
        message: inputValue,
        customer_uid: data?.customer_uid,
        send_to: customerData?.customer_number,
        is_business: true,
        tenantWhatsappDetail,
        customerData,
      };
      sendWhatsappMessage(formData)
        .then((resp) => {
          if (get(resp, 'success', false)) {
            setTimeout(async () => {
              await insertCustomerChatData(data);
            }, 800);
          } else {
            notification.error({
              message: 'Some error occurred while send whatsapp message',
            });
          }
        })
        .catch((error) => {
          setCardLoading(false);
          notification.error({
            message:
              error.message ||
              'Some error occurred while send whatsapp message',
          });
        });
    }
  };

  const onChangeFunction = async (event, value) => {
    if (!isEmpty(event)) {
      setCardLoading(true);
      if (list?.slug === 'discard') {
        const queryParameter = {
          customer_uid: value?.customer_uid,
        };
        getDiscardCustomerChatDetail(queryParameter.customer_uid)
          .then((resp) => {
            if (resp?.success) {
              setChatData(get(resp, 'data', []));
              setCardLoading(false);
            } else {
              notification.warning({ message: 'Chat is Empty!' });
            }
          })
          .catch((error) => {
            notification.error({
              message:
                error.message ||
                'Some error occurred while getting discard tab customer chats',
            });
            setCardLoading(false);
          });
      } else {
        await insertCustomerChatData(value);
      }
    }
  };

  return (
    <div className="chat-card-container">
      <Spin spinning={cardLoading}>
        <Card
          style={{
            width: 350,
            marginRight: '10px',
            borderTop: '3px solid green',
          }}
        >
          <div>
            <Collapse ghost onChange={(event) => onChangeFunction(event, data)}>
              <Panel
                header={dummyFunction()}
                key={data.customer_uid}
                showArrow={false}
              >
                <div className="chat-main-div" id="scroll">
                  {chatData.map((chat) => {
                    return (
                      <div
                        style={{ marginBottom: '6px', width: '42vh' }}
                        key={chat?.chat_id}
                      >
                        {chat.is_business ? (
                          <div className="message sent">
                            {/* <Avatar src={logo} size="small" /> */}
                            {chat?.chat_type !== 'image' ? (
                              <>{chat.message}</>
                            ) : (
                              <img src={chat.message} alt="" />
                            )}
                            <span className="metadata">
                              <span className="time">
                                {moment.unix(chat.timestamp).isValid()
                                  ? moment
                                      .unix(chat.timestamp)
                                      .format('MMMM Do, h:mm a')
                                  : ''}
                              </span>
                            </span>
                          </div>
                        ) : (
                          <div className="message received">
                            {/* <Avatar size="small" icon={<UserOutlined />} /> */}
                            {chat?.chat_type !== 'image' ? (
                              <>{chat.message}</>
                            ) : (
                              <img src={chat.message} alt="" />
                            )}
                            <span className="metadata">
                              <span className="time">
                                {moment
                                  .unix(chat.timestamp)
                                  .format('MMMM Do, h:mm a')}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <Input
                  onChange={(event_) => setInputValue(event_?.target?.value)}
                  suffix={<SendOutlined onClick={() => onMessageSend(data)} />}
                  value={inputValue}
                  disabled={list?.slug === 'discard'}
                />
              </Panel>
            </Collapse>
            <div>
              {moment(data.creation_date).format('MMMM Do YYYY, h:mm:ss a')}
            </div>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default CardItem;
