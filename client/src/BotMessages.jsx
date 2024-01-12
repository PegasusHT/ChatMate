import React from 'react';
import axios from 'axios';
import {useContext, useEffect, useRef, useState} from "react";
import {uniqBy} from "lodash";

export const BotMessageList = ({ selectedBotId, id, ws, setWs }) => {
  const [newMessageText,setNewMessageText] = useState('');
  const [messages,setMessages] = useState([]);
  const divUnderMessages = useRef();
  const messagesWithoutDupes = uniqBy(messages, '_id');

  useEffect(() => {
    connectToWs();
  }, [selectedBotId]);
  function connectToWs() {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const WS_URL = import.meta.env.VITE_WS_URL;
    let WS_LINK = '';
    WS_LINK = BACKEND_URL.includes('https:') ? `wss://${WS_URL}` : `ws://${WS_URL}`;
    const ws = new WebSocket(WS_LINK);
    setWs(ws);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', () => {
      setTimeout(() => {
        // console.log('Disconnected. Trying to reconnect.');
        connectToWs();
      }, 1000);
    });
  }

  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    if('text' in messageData){
        if(messageData.sender === selectedBotId){
        setMessages(prev => ([...prev, {...messageData}]));
        }
    }
  }

  async function sendMessage(ev) {
    if (ev) ev.preventDefault();
    await ws.send(JSON.stringify({
        recipient: selectedBotId,
        sendFromBot: false,
        sendToBot: true,
        text: newMessageText,
    }));

    await setNewMessageText('');
    await setMessages(prev => ([...prev,{
    text: newMessageText,
    sender: id,
    recipient: selectedBotId,
    _id: Date.now(),
    }]));

    await botReply(newMessageText);
  }

  async function botReply(message) {
    const response = await fetchSimiResponse(message);
    const replyText = await response.success;
    
    await ws.send(
      JSON.stringify({
        botSender: selectedBotId,
        sendFromBot: true,
        sendToBot: false,
        text: replyText,
      })
    );

    await setMessages((prev) => [
      ...prev,
      {
        text: response.success,
        sender: selectedBotId,
        recipient: id,
        _id: Date.now(),
      },
    ]);
  }

  function fetchSimiResponse(message) {
    return new Promise((resolve, reject) => {
      axios
        .get(`proxy/${encodeURIComponent(message)}`)
        .then((res) => {
          const simiResponse = res.data;
          resolve(simiResponse);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  }
  useEffect(() => {
    if (selectedBotId) {
      axios.get('/messages/bot/'+selectedBotId).then(res => {
        // console.log('res.data : ',res.data)
        setMessages(res.data);
      });
    }
  }, [selectedBotId]);

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({behavior:'smooth', block:'end'});
    }
  }, [messages]);
  
  return (
    <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">
          {!!selectedBotId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {messagesWithoutDupes.map(message => (
                  <div key={message._id} className={(message.sender === id ? 'text-right': 'text-left')}>
                    <div className={"text-left inline-block p-2 my-2 rounded-md text-sm " +(message.sender === id ? 'bg-blue-500 text-white':'bg-white text-gray-500')}>
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedBotId && (
          <form className="flex gap-2" onSubmit={sendMessage}>
            <input type="text"
                   value={newMessageText}
                   onChange={ev => setNewMessageText(ev.target.value)}
                   placeholder="Type your message here"
                   className="bg-white flex-grow border rounded-sm p-2"/>
            <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        )}
      </div>
  );
};

export default BotMessageList;