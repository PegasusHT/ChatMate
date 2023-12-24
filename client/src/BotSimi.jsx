import { useEffect, useState, useContext, useRef } from "react";
import axios from 'axios';
import Contact from "./Contact";

export default function BotSimi(props) {
    const {bots, botId, selectedBotId, setSelectedBotId} = props;

    return(
        <Contact
            key={botId} id={botId}
            online={true}
            username={bots[botId].botname}
            onClick={() => setSelectedBotId(botId)}
            selected={botId === selectedBotId} />
    )
   
}