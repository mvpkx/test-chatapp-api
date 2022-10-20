/* eslint-disable react/no-array-index-key */
/* eslint-disable no-alert */
import React, { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { ReactComponent as WhatsAppIcon } from './whatsapp-icon.svg';
import styles from './Widget.module.css';

function Widget() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const authToken = process.env.REACT_APP_ACCESS_TOKEN || prompt('ChatApp Access Token:');
    const license = process.env.REACT_APP_LICENSE || prompt('ChatApp License:');

    const pusher = new Pusher('ChatsAppApiProdKey', {
      wsHost: 'socket.chatapp.online',
      wssPort: 6001,
      disableStats: true,
      authEndpoint: 'https://api.chatapp.online/broadcasting/auth',
      auth: {
        headers: {
          Authorization: authToken,
        },
      },
      enabledTransports: ['ws'],
      forceTLS: true,
    });
    const channel = pusher.subscribe(`private-v1.licenses.${license}.messengers.grWhatsApp`);

    channel.bind('message', (data) => {
      const [message] = data.payload.data;

      if (!message.fromMe) {
        setMessages((prev) => [{ ...message, time: new Date().toTimeString().split(' ')[0] }, ...prev]);
      }
    });

    return (() => {
      pusher.unsubscribe(`private-v1.licenses.${license}.messengers.grWhatsApp`);
    });
  }, []);

  return (
    <div className={styles.container}>
      {messages.length === 0
        ? (
          <div className={styles.error}>
            <h3>No messages yet...</h3>
            <p>or incorrect Access Token / License</p>
          </div>
        )
        : (
          messages.map((message, index) => (
            <div key={index} className={styles.notification}>
              <div className={styles.header}>
                <WhatsAppIcon className={styles.icon} />
                <span className={styles.title}>
                  WHATSAPP
                </span>
                <span className={styles.time}>
                  {message.time}
                </span>
              </div>
              <span className={styles.user}>
                {message.fromUser.name}
              </span>
              <span className={styles.text}>
                {message.message.text === '' ? '📎 File' : message.message.text}
              </span>
            </div>
          ))
        )}
    </div>
  );
}

export default Widget;
