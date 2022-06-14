import React, {useState, useEffect} from 'react';
import { Routes, Route, Link } from "react-router-dom";
import Home from './pages/Home'
import About from './pages/About'
import Game from './pages/Game'
import Market from './pages/Market'
import Settings from './pages/Settings';
import Nopage from './pages/Nopage'
import Layout from './components/layout';
import immer from 'immer';
import ModalRoot from './modules/modals/modal components/ModalRoot'
import {buildQuery, createPostInfo, arweave} from './lib/api'
import { SmartWeaveNodeFactory, LoggerFactory} from 'redstone-smartweave'
import TransactionPolling from './modules/modals/modal files/TransactionPolling'
import AddModal from './modules/modals/modal components/AddModal'
import CloseModal from './modules/modals/modal components/CloseModal'
import ModalService from './modules/modals/modal components/ModalService';

const contractAddress = '5QqbCCzGsizyhfZ6vCdHWQDbFLax2q0g8__DZJb_u_U';


LoggerFactory.INST.logLevel('error');
const smartweave = SmartWeaveNodeFactory.forTesting(arweave);
const mine = () => arweave.api.get('mine');

let initialCurrentGameState = {
  Name: '',
  Chat: '',
  Timer: '',
  Details: '',
  playerColor: '',
  opponentSocket: '',
  opponentColor: ''
}
let initialMembershipTokenState ={
  settings:{
      username:""
  }
}
const initialBoardStyle = {
  name:"default",
  dark: "",
  light:""
}
const initialNewPiecesState = {
    P:"",
    R:"",
    N:"",
    B:"",
    Q:"",
    K:""

}
const initialNewBoardState = {
  moveType: "Click-to-move",
  style: {asset: "default",
  collection: "default"}
}




function App({socket}) {

  //states passed down to components

  
    //wallet states
    const [connected, setConnected] = useState(false);
    const [balance, setBalance] = useState("?");
    const [address, setAddress] = useState("");
    const [membershipToken, setMembershipToken] = useState(initialMembershipTokenState); //functions as bool and counter
    const [nfts, setNfts] = useState(); // all nft metadata from users
    const [collections, setCollections] = useState({})
    const [newNftToMint, setNewNftToMint] = useState({name:"", ipfsUrl:""});
    const [newMembershipTokenToMint, setNewMembershipTokenToMint ] = useState({})
    const [newCollectionToMint, setNewCollectionToMint] = useState({});
    const [isMember, setIsMember] = useState(false)
    const [contractState, setContractState] = useState({})

    const [pollTnx, setPollTnx] = useState("")
    const [tnxStatus, setTnxStatus] = useState("")
    const [polling, setPolling] = useState(false);

    const [newUsername, setNewUsername] = useState("?")
    const [newLanguage, setNewLanguage] = useState("?")
    const [newAvatar, setNewAvatar] = useState("?")
    const [newContactInfo, setNewContactInfo] = useState("?")
    const [newMoveType, setNewMoveType] = useState("Click-to-move")
    const [newPieces, setNewPieces] = useState(initialNewPiecesState)
    const [newBoard, setNewBoard] = useState(initialNewBoardState)
  
  //Score board 
    //Saved scores.
    const [total_games, setTotal_Games] = useState(0);
    const [wins, setWins] = useState(0);
    const [losses, setLosses] = useState(0);
    const [stalemates, setStalemates] = useState(0);
    //session game scores.
    const [sessionGames, setSessionGames] = useState(0)
    const [sessionWins, setSessionWins] = useState(0)
    const [sessionLosses, setSessionLosses] = useState(0)
    const [sessionStalemates, setSessionStalemates] = useState(0)  

///socket stuff
    const [allUsers, setAllUsers] = useState([]) //all users on server
      const [newUsers, setNewUsers] = useState([]) //socket var that triggers setAllUsers
    const [gameList, setGameList] = useState({}); // all games on server
      const [newGameList, setNewGameList] = useState({});//socket var that triggers setGameList
    const [lobbyList, setLobbyList] = useState(["General"]); // all lobbies on server
      const [newLobbyList, setNewLobbyList] = useState(["General"]);//socket var that triggers setLobbyList
//Game State
  const [inGame, setInGame] = useState(false); // conditional for rendering chessboard or dashboard
  const [currentGame, setCurrentGame] = useState(initialCurrentGameState) // sets data for current game user is in
    const [newOpponent, setNewOpponent] = useState(); //socket var that triggers setCurrentGame
//Message state
  const [connectedRooms, setConnectedRooms] = useState(["General"]); // lobbies user has connected to
  const [activeLobby, setActiveLobby] = useState('General'); // current lobby user is in
  const [message, setMessage] = useState(''); // message input state
  const [messages, setMessages] = useState({General: [], Spanish: []}); // all messages from server
    const [newMessages, setNewMessages] = useState({})


  //socket listeners
  useEffect(()=>{
    if(membershipToken.settings.username !== ""){
      if(allUsers.map((user, index) => user.socket).includes(socket.id) === false){socket.emit("join server", membershipToken.settings.username, membershipToken.avatar)}
    }
   

    console.log("includes?? ", allUsers.map((user, index) => user.socket))
  
  },[address, membershipToken])
  
    socket.on('user list', (users) =>{
      setNewUsers(users);   
    })
    useEffect(() => {
      setAllUsers(newUsers); 
      socket.off('user list'); // clear listener
      console.log(socket.listeners('user list'))
    },[newUsers])
  
  socket.on('lobby list', lobbies => {
    setNewLobbyList(lobbies)
  })
  useEffect(() => {
    setLobbyList(newLobbyList); 
    socket.off('lobby list'); // clear listener
  },[newLobbyList])
  
  socket.on('game list', games => {
    setGameList(games)
  })
  useEffect(() => {
    setGameList(newGameList); 
    socket.off('game list'); // clear listener
  },[newGameList])
  
  socket.on("new message", (newmsg) => {
    setNewMessages(newmsg)
  }) 
  useEffect(()=>{
    console.log('new message from server')
    let newmsg = immer(messages, draft => {
        draft[activeLobby].push(newMessages)
    })
    setMessages(newmsg)
    socket.off("new message")
  },[newMessages])
  
  
  socket.on('start game', (opponent) => {
    setNewOpponent(opponent)
    if (currentGame.opponentSocket !== '') {setInGame(true)}
  })
  const roomJoinCallback = (lobby, incomingmessages) => {
    let newMessages = immer(messages, draft => {
        draft[lobby] = incomingmessages
    })
    setMessages(newMessages)
    setActiveLobby(lobby)
  }
  useEffect(()=>{
    socket.emit('join room', currentGame.Chat, (incomingmessages) => {roomJoinCallback(currentGame.Chat, incomingmessages)})
    let opponent = immer(currentGame, draft => {
      draft.opponentSocket = newOpponent;
    })
    setCurrentGame(opponent)
    console.log(currentGame, "is black")
    socket.off('start game')
  },[newOpponent])

  async function connect () {

    try {
      await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'ACCESS_PUBLIC_KEY', "SIGN_TRANSACTION"]);
      setConnected(true)     
      mine()

    }
    catch (error) {console.log(error)}

  }
  async function GetAddress(){
    try {
       let x = await window.arweaveWallet.getActiveAddress()
      setAddress(x)
      ModalService.address = x;
    }
    catch (error) {console.log(error)}
  }
  useEffect(()=>{
    if (connected) {GetAddress(); getBalance();}
    if (!connected) {setAddress("")}

  },[connected, address])

  async function getBalance () {
    try {
      await arweave.wallets.getBalance(address).then((balance) => {
        let ar = arweave.ar.winstonToAr(balance)
        setBalance(ar)
        mine()
       
      }).catch(err => console.log(err))
    }
    catch(error) {console.log(error)}
  }
  async function mintMembershipToken(){
    const contract = await smartweave.contract(contractAddress).connect('use_wallet')
    await contract.writeInteraction({ function: 'mintMembership',
       data: {asset: {
        name: address,
        avatar: newAvatar,
        settings: {
            board : {moveType: newMoveType, style: {asset:"default", collection:"default"}},
            pieces: {P:"default",R:"default",N:"default",B:"default",Q:"default",K:"default"},
            language : newLanguage,
            username: newUsername,
            contact: newContactInfo
        },
        level:0,
        score: {
            wins:0,
            losses:0,
            stalemates:0,
            totalGames:0
        },
        owners: address,
        burnable: true
       }}
        })
        await mine()
        console.log(contract)
        setPolling(true)
  
  }


  async function updateMembershipToken(){
    const contract = await smartweave.contract(contractAddress).connect('use_wallet')
    await contract.writeInteraction({ function: 'updateMemberSettings',
       data: {newSettings: {
            board : {moveType: newMoveType, style: {asset: newBoard.style.asset, collection: newBoard.style.collection}},
            pieces: {P:newPieces.P,R:newPieces.R,N:newPieces.N,B:newPieces.B,Q:newPieces.Q,K:newPieces.K},
            language : newLanguage,
            username: newUsername,
            contact: newContactInfo
       }}
        })
        await mine()
    await contract.writeInteraction({ function: 'updateMemberAvatar',
  data:{newAvatar:newAvatar}
  })
  setPolling(true)

  }
  
  
   useEffect(()=>{

    async function pollTnxState(){
      setPolling(true)
      try{
  
        await arweave.wallets.getLastTransactionID(address).then((transactionId) => {
       setPollTnx(transactionId)
       ModalService.pollTnx = transactionId;
       arweave.transactions.getStatus(transactionId).then((status) => {
        setTnxStatus(status)
        console.log(status)
      })  
      }).catch(error => console.log(error))
       
      console.log(pollTnx, tnxStatus)
      
     
    }catch (error){console.log(error)}
  
    }
     if(polling === true){
        if(tnxStatus.status === 200){
       setPolling(false)
       CloseModal()
       
        }
        else{
          setTimeout(pollTnxState(), 3000)
          console.log("polling for transaction")
        }
     }
   },[polling, tnxStatus])

  useEffect(()=>{
    async function loadContractData(){
      const contract = await smartweave.contract(contractAddress)
      const newState = await contract.readState();
      setContractState(newState.state);
       if(Object.keys(newState.state.assets.membershipToken.assets).includes(address) === true){
         setIsMember(true)
         setMembershipToken(newState.state.assets.membershipToken.assets[address])
     } 
    } 
    loadContractData()
  }, [connected, address, polling])
  
  useEffect(()=>{
   if(connected){
   if(address !== "") {
      if(Object.keys(contractState.assets.membershipToken.assets).includes(address) === true){
        setTotal_Games(contractState.assets.membershipToken.assets[address].score.totalGames)
    setWins(contractState.assets.membershipToken.assets[address].score.wins)
    setLosses(contractState.assets.membershipToken.assets[address].score.losses)
    setStalemates(contractState.assets.membershipToken.assets[address].score.stalemates)
    setNewUsername(contractState.assets.membershipToken.assets[address].settings.username)
    setNewAvatar(contractState.assets.membershipToken.assets[address].avatar)
    setNewContactInfo(contractState.assets.membershipToken.assets[address].settings.contact)
    setNewLanguage(contractState.assets.membershipToken.assets[address].settings.language)
    setNewPieces(contractState.assets.membershipToken.assets[address].settings.pieces)
    setNewBoard(contractState.assets.membershipToken.assets[address].settings.board)
    setNewMoveType(contractState.assets.membershipToken.assets[address].settings.board.moveType)
  }}
    }
  },[contractState, address])

  async function disconnect(){
    try {
      await window.arweaveWallet.disconnect();
      setConnected(false)
      setIsMember(false)
      setMembershipToken(initialMembershipTokenState)
      
    }
    catch (error){console.log(error)}
  }
  

  return (
    <div id="main-container"> <ModalRoot />
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            Arweave Chess
          </a>

          <ul className="navbar-nav me-auto">
            <Layout />
          </ul>
          <button onClick={()=>{console.log(contractState)}}>test</button>
         
          <h4 className="center-content">Balance: {balance}</h4>
          {connected ? <button className='btn btn-primary' onClick={disconnect}>Disconnect: {address.replace(address.slice(5, 38), ' . . . ')}</button> : <button className='btn btn-primary' onClick={connect}>Connect</button>}
          </div>
          </nav>
      {connected & isMember ? <div id="pagetainer">
      <Routes>
        connected ? <Route path="/Home" element={<Home/>} />
        <Route path="/Game" element={<Game
        
        address={address} 
        socket={socket} 
        messages={messages} 
        setMessages={setMessages}
        message={message}
        setMessage={setMessage}
        activeLobby={activeLobby}
        setActiveLobby={setActiveLobby}
        username={membershipToken.settings.username}
        allUsers={allUsers}
        connectedRooms={connectedRooms}
        setConnectedRooms={setConnectedRooms}
        lobbyList={lobbyList}
        gameList={gameList}
        setGameList={setGameList}
        setInGame={setInGame}
        inGame={inGame}
        currentGame={currentGame}
        setCurrentGame={setCurrentGame}
        initialCurrentGameState={initialCurrentGameState}
        membershipToken={membershipToken}
        newNftToMint={newNftToMint}
        setNewNftToMint={setNewNftToMint}
        sessionWins={sessionWins}
        setSessionWins={setSessionWins}
        setSessionGames={setSessionGames}
        sessionGames={sessionGames}
        setSessionLosses={setSessionLosses}
        sessionLosses={sessionLosses}
        setSessionStalemates={setSessionStalemates}
        sessionStalemates={sessionStalemates}
        contractState={contractState}
        />}/>
        <Route path="/About" element={<About/>}/>
        <Route path="/Market" element={<Market
        contractState={contractState}
        />}/>
        <Route path="/Settings" element={<Settings 
        setNewUsername={setNewUsername}
        newUsername={newUsername}
        setNewAvatar={setNewAvatar}
        newAvatar={newAvatar}
        setNewContactInfo={setNewContactInfo}
        newContactInfo={newContactInfo}
        setNewMoveType={setNewMoveType}
        newMoveType={newMoveType}
        setNewLanguage={setNewLanguage}
        newLanguage={newLanguage}
        updateMembershipToken={updateMembershipToken}
        contractState={contractState}
        membershipToken={membershipToken}
        newPieces={newPieces}
        setNewPieces={setNewPieces}
        newBoard={newBoard}
        setNewBoard={setNewBoard}
       
        />}/>
        <Route path="*" element={<Home />}/>
      </Routes>
      </div>:        
        <div id="mintfirst">
        <h1 className='settings-options-header'>Create Your Membership Token</h1>
        <p className='settings-options-header' style={{border:"solid 2px black", width:"60%", overflow:"wrap", marginLeft:"20%", marginRight:"20%", color:"crimson"}}>
          To continue you must mint a membership token. This is a special type of nft used in Arweave chess to keep track of scores, levels, settings, and user
          info. Its like a cookie, only better, because YOU own it. You can burn, transfer, or update your membership token at any time in the settings page.
        
        </p>

        <div className='settings-options'>
        <h2 className="settings-options-header">Board and Piece Settings</h2>
        <div className="center-content" style={{display:"flex", flexDirection:"row", justifyContent:"space-evenly"}}>
          <div className='center-content'>
        <h3 className='settings-options-header'>Drag to Move</h3>
          <input type="radio" class="form-check-input" name="optionsRadios" id="optionsRadios1" value="option1" checked onClick={()=>{document.querySelector("optionsRadios1").checked();document.querySelector("optionsRadios2").checked("false"); setNewMoveType("Drag-to-move")}} />
                  </div> 
            <div className="center-content">
          <h3 className='settings-options-header'>Click to Move</h3>
           <input className="settings-inputs" type="radio" class="form-check-input" name="optionsRadios" id="optionsRadios2" value="option2" onClick={()=>{document.querySelector("optionsRadios2").checked();document.querySelector("optionsRadios1").checked("false");setNewMoveType("Click-to-move")}}/>
           </div>
             </div>
             </div>

             <div className='settings-options'>
             <h2 className='settings-options-header'>Chat settings</h2>  
          
                 <h4 className="center-content">Username - will show above chats</h4>
                
                 <input className="settings-inputs"  type="text" onChange={(e)=> {setNewUsername(e.target.value)}} placeholder="Username"/>
         

             </div>  
             <div className='settings-options'>
             <h2 className='settings-options-header'>Avatar settings</h2>   
             <p className='center-content'>paste a url in here</p>
             <input  className="settings-inputs" type="text" onChange={(e)=> {setNewAvatar(e.target.value)}} placeholder="Avatar image url"/>

             </div>        
             <div className='settings-options'>
             <h2 className='settings-options-header'>Contact info - Optional</h2> 
             <input className="settings-inputs"  type="text" onChange={(e)=> {setNewContactInfo(e.target.value)}} placeholder="Contact Info (email, discord, etc) -- optional"/>
               </div> 
               <div className='settings-options'>
               <h2 className='settings-options-header'>Language</h2> 
               <p className="center-content">Whats your native tongue?</p>
               <input className="settings-inputs"  type="text" onChange={(e)=> {setNewLanguage(e.target.value)}} placeholder="Language"/>
               </div>
               <button className="settings-inputs" onClick={()=>{ mintMembershipToken(); console.log(contractState);AddModal(TransactionPolling);}}>Mint Membership Token</button>
    </div>
        }
    </div>
  );
}

export default App;
