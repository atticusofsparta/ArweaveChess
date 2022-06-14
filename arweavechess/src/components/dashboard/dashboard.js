import React, {useState, useEffect} from 'react';

import DashboardChat from "./dashboardchat";
import DashboardLobbies from "./dashboardlobbies";
import DashboardAvatar from "./dashboardavatar";
import DashboardMiddle from "./dashboardmiddle";


const Dashboard = ({ socket,contractState, messages,membershipToken, setMessages, activeLobby, setActiveLobby, message, setMessage, username, allUsers,connectedRooms,setConnectedRooms, lobbyList, gameList, setGameList, setInGame, setCurrentGame, currentGame, initialCurrentGameState }) => {
   
    return(
        <div id="dashboard">
            <div id="dashboard-top"> 
            <DashboardChat 
            socket={socket} 
            activeLobby={activeLobby} 
            messages={messages} 
            setMessages={setMessages}
            message={message}
            setMessage={setMessage}
            username={username}
            />
            <DashboardMiddle
            socket={socket} 
            messages={messages} 
            setMessages={setMessages}
            setActiveLobby={setActiveLobby}
            connectedRooms={connectedRooms}
            setConnectedRooms={setConnectedRooms}
            lobbyList={lobbyList}
            membershipToken={membershipToken}
            />
            <DashboardLobbies 
            socket={socket}
            gameList={gameList}
            setGameList={setGameList}
            setInGame={setInGame}
            messages={messages}
            setMessages={setMessages}
            setCurrentGame={setCurrentGame}
            setActiveLobby={setActiveLobby}
            currentGame={currentGame}
            initialCurrentGameState={initialCurrentGameState}
            contractState={contractState}
            />
            </div>
            <div id="dashboard-bottom"> 
            <DashboardAvatar 
            allUsers={allUsers}
            />
            </div>

        </div>
    );

}

export default Dashboard