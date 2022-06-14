import React, {useState, useEffect} from 'react';
import immer from "immer";





const DashboardChat = ({socket, activeLobby, messages, setMessages, message, setMessage, username}) => {
    
    

    async function addMessage(){
        
        const payload = {
            content: message,
            to: activeLobby,
            sender: username, 
            chatName: activeLobby,
            isChannel: true
        }
        console.log("send this message:", payload)
        socket.emit('send message', payload)
        let sentMessage = immer(messages, draft => {
            draft[activeLobby].push({sender: username, content: message})
        })
        setMessages(sentMessage)
        setMessage('')
        
    }

    useEffect(()=>{
        var objDiv = document.getElementById("messages");
    objDiv.scrollTop = objDiv.scrollHeight;
    },[messages])
     

    return(
        <div id="dashboard-chat">
            <div id='current-lobby'><h6 className="nft-cards-header">{activeLobby}</h6></div>
            <div id="messages">
                {messages[activeLobby].map((msg, index)=> 
                <div className='message' key={index}>

                    <h5 className='avatar-header'>{msg.sender}</h5>
                    <p className='message-content'>{msg.content}</p>

                    </div>)}
                
                
                </div>

            <div id="message-form">
            
            <input 
            className="dashboard-inputs"
            autoFocus 
            autoComplete='off'
            id="message-input" 
            type="text" 
            placeholder="message" 
            value={message} 
            onChange={(e)=>{setMessage(e.target.value)}} 
            onKeyDown={(e)=>{e.key === "Enter" && addMessage()}}
            
            />
           
            
            </div>
        </div>
    );


}

export default DashboardChat