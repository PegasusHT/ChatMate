import {useContext, useEffect, useRef, useState} from "react";
import Logo from './Logo.jsx'
import {UserContext} from "./UserContext.jsx";
import axios from "axios";
import Contact from "./Contact.jsx";
import Profile from "./Chat/Profile.jsx";
import UserMessageList from "./UserMessages.jsx";
import BotMessageList from "./BotMessages.jsx";

export default function Chat() {
  const [onlinePeople,setOnlinePeople] = useState({});
  const [bots,setBots] = useState({});
  const [offlinePeople,setOfflinePeople] = useState({});
  const [selectedUserId,setSelectedUserId] = useState(null);
  const [selectedBotId,setSelectedBotId] = useState(null);
  const {username,id,setId,setUsername} = useContext(UserContext);
  
  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({userId,username}) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  useEffect(() => {
    axios.get('/people').then(res => {
      const offlinePeopleArr = res.data
        .filter(p => p._id !== id)
        .filter(p => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleArr.forEach(p => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);

  useEffect(() => { 
    axios.get('/bot').then(res => {
      const botsArr = res.data;
      const bots = {};
      botsArr.forEach(p => {
        bots[p._id] = p;
      });
      setBots(bots);
    });
  }, []);

  const onlinePeopleExclOurUser = {...onlinePeople};
  delete onlinePeopleExclOurUser[id];

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col">
        <div className="flex-grow">
          <Logo />
          <div className="text-left text-gray-600 text-sm p-2 bg-blue-200 font-bold text-base">Users</div>
          {Object.keys(onlinePeopleExclOurUser).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExclOurUser[userId]}
              onClick={() => { 
                setSelectedUserId(userId);
                setSelectedBotId(null);
              }}
              selected={userId === selectedUserId} />
          ))}
          {Object.keys(offlinePeople).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() => { 
                setSelectedUserId(userId);
                setSelectedBotId(null);
              }}
              selected={userId === selectedUserId} />
          ))}

          <div className="text-left text-gray-600 text-sm p-2 bg-blue-200 font-bold text-base">Bots</div>
          {Object.keys(bots).map(botId => (
            <Contact
              key={botId}
              id={botId}
              online={true}
              username={bots[botId].botname}
              onClick={() => {
                setSelectedBotId(botId);
                setSelectedUserId(null);
              }}
              selected={botId === selectedBotId} />
          ))}
        </div>
        <Profile username={username}/>
      </div>

      {!selectedBotId && (
      <UserMessageList selectedUserId={selectedUserId} 
        id={id}
        showOnlinePeople={showOnlinePeople}/>)}

      {!selectedUserId && !!selectedBotId && (
        <BotMessageList selectedBotId={selectedBotId}
        id={id}/>)}
    </div>
  );
}