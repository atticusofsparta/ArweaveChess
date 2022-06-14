import { useState } from "react";
import immer from 'immer';
import Bq from './Bq.png'



const DashboardMiddle = ({socket,membershipToken, messages, setMessages, setActiveLobby, connectedRooms, setConnectedRooms, lobbyList }) => {
    const [display, setDisplay] = useState('lobby-select');
    const [newChannel, setNewChannel] = useState('');


    async function joinChannel(lobby){ 
        if (connectedRooms.includes(lobby)) {
            console.log('lobby exists')

        } 
        
        else {
            console.log("attempting to create lobby")
            let newRooms = immer(connectedRooms, draft => {
                draft.push(lobby)
            })
            setConnectedRooms(newRooms)
        console.log(connectedRooms)
        } 
        socket.emit('join room', lobby,(incomingmessages) => {roomJoinCallback(lobby, incomingmessages)})
    }

    async function roomJoinCallback(lobby, incomingmessages) {
        let newMessages = immer(messages, draft => {
            draft[lobby] = incomingmessages
        })
        setMessages(newMessages)
        setActiveLobby(lobby)
        
    }
    const createChannel = ()=>{
        let addChannel = immer(messages, draft => {
            draft[newChannel] = [];
        })
        setMessages(addChannel)
        joinChannel(newChannel)
        setNewChannel('')
        setDisplay('lobby-select')
        console.log(lobbyList)

    }

    return(
        <div id="dashboard-view-avatar">

            <div id='view-avatar-tabs'>
            <button className='btn-tab-fit dashboard-inputs' onClick={()=> setDisplay('lobby-select')}>Lobbies</button>
            <button className='btn-tab-fit dashboard-inputs' onClick={()=> setDisplay('avatar-display')}>Avatar</button>
            </div>
            {display === 'lobby-select' && <div id='lobby-selection-display'>
            <button className="dashboard-inputs" id="add-lobby" onClick={()=> setDisplay('add-lobby')}>Add Lobby</button>
            {connectedRooms.map((lobby, index)=> <li className="lobby-items" key={index} onClick={()=> joinChannel(lobby)}>{lobby}</li>)}
                
                </div>}
            {display === 'avatar-display' && <div id='avatar-display' style={{backgroundImage: `url(${membershipToken.avatar})`}}>
                
                
            
            </div>}

            {display === 'add-lobby' && <div id="add-lobby-display">
                <h5>Choose a channel to join</h5>
                <div className="channels">{lobbyList.map((lobby, index)=> <li className="lobby-items" key={index} onClick={()=> joinChannel(lobby)}>{lobby}</li>)}</div>
                <button id="create-channel" onClick={createChannel}>Create Channel</button>
                <input className="dashboard-inputs" id="new-channel" type="text" onChange={(e)=> setNewChannel(e.target.value)} placeholder="Custom Channel Name"/>
                
                </div>}

        </div>
    );
}

export default DashboardMiddle