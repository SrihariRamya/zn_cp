import React from 'react';
import { Avatar, List } from 'antd';

const data = [
  {
    title: 'Congratulation Ramya! You Selected as a Top 10 Seller',
    date: '10 min ago',
    sender: 'Zupain Team',
  },
  {
    title: 'Congratulation Ramya! You Selected as a Top 10 Seller',
    date: '10 min ago',
    sender: 'Zupain Team',
  },
  {
    title: 'Congratulation Ramya! You Selected as a Top 10 Seller',
    date: '10 min ago',
    sender: 'Zupain Team',
  },
  {
    title: 'Congratulation Ramya! You Selected as a Top 10 Seller',
    date: '10 min ago',
    sender: 'Zupain Team',
  },
  {
    title: 'Congratulation Ramya! You Selected as a Top 10 Seller',
    date: '10 min ago',
    sender: 'Zupain Team',
  },
  {
    title: 'Congratulation Ramya! You Selected as a Top 10 Seller',
    date: '10 min ago',
    sender: 'Zupain Team',
  },
  {
    title: 'Congratulation Ramya! You Selected as a Top 10 Seller',
    date: '10 min ago',
    sender: 'Zupain Team',
  },
  {
    title: 'Congratulation Ramya! You Selected as a Top 10 Seller',
    date: '10 min ago',
    sender: 'Zupain Team',
  },
];

function ChatNotifications() {
  return (
    <div className="notification-container">
      <h3>Notification</h3>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`}
                />
              }
              title={item.title}
              description={
                <div className="flex-bwn">
                  <span>{item.sender}</span>
                  <span>{item.date}</span>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}

export default ChatNotifications;
