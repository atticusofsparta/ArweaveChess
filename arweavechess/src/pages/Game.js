import React, {useState, useEffect, useRef} from "react"
import Chessboard from 'react-chessboard';
import {Chess} from 'chess.js';
import Dashboard from '../components/dashboard/dashboard';
import DragMove from "../components/game/boards/dragmove";
import ClickMove from "../components/game/boards/clickmove";
import MoveLogger from "../components/game/movelogger";
import GameState from "../components/game/gamestate";
import Modal from "../modules/modals/modal components/Modal";
import ModalHeader from "../modules/modals/modal components/ModalHeader";
import ModalBody from "../modules/modals/modal components/ModalBody";
import ModalFooter from "../modules/modals/modal components/ModalFooter";
import CloseModal from "../modules/modals/modal components/CloseModal";
import AddModal from "../modules/modals/modal components/AddModal";





const Game = ({
  socket, 
  membershipToken,
  username,
  messages, 
  setMessages, 
  activeLobby, 
  setActiveLobby, 
  message, 
  setMessage, 
  allUsers, 
  lobbyList, 
  connectedRooms,
  setConnectedRooms, 
  gameList, 
  setGameList, 
  setInGame, 
  inGame, 
  currentGame, 
  setCurrentGame, 
  initialCurrentGameState, 
  boardSetting, 
  userBoardStyle,
  sessionGames, 
  setSessionGames, 
  sessionWins, 
  setSessionWins, 
  sessionLosses, 
  setSessionLosses, 
  sessionStalemates, 
  setSessionStalemates,
  contractState}) => {
 
    const [fen, setFen] = useState("start")
    const [orientation, setOrientation] = useState('');
    const [turn, setTurn] = useState('w');
    const [isPlayerTurn, setIsPlayerTurn] = useState(true)
    const [opponent, setOpponent] = useState('');
    const [playerColor, setPlayerColor] = useState('');
    const [opponentColor, setOpponentColor] = useState('');

    //score logic
    const [win, setWin] = useState("")
    const [stalemate, setStalemate] = useState("")
    const [conceded, setConceded] = useState(false);
    const [game, setGame] = useState(new Chess());

    useEffect(()=>{
        setOrientation(currentGame.playerColor)
        setOpponent(currentGame.opponentSocket)
        if (currentGame.playerColor === 'white'){setPlayerColor('w')}
        if (currentGame.playerColor === 'black'){setPlayerColor('b')}
        if (currentGame.opponentColor === 'white'){setOpponentColor('w')}
        if (currentGame.opponentColor === 'black'){setOpponentColor('b')}
      },[currentGame])

      
      useEffect(()=>{
        //win/loss
        if (game.in_checkmate() === true) {let playerInCheckmate = game.turn()
          if (playerInCheckmate !== playerColor) {setWin(true)}
          if (playerInCheckmate === playerColor) {setWin(false)}
        }//stalemate
        if (game.in_stalemate() | game.in_draw() === true) {setStalemate(true)}
      },[game, fen])
  
      //send gameresult to app.js
      useEffect(()=>{
        if (win === true){setSessionGames(sessionGames+1);setSessionWins(sessionWins+1);AddModal(Won);}
        if (win === false){setSessionGames(sessionGames+1);setSessionLosses(sessionLosses+1);AddModal(Lost)}
        if (stalemate === true){setSessionGames(sessionGames+1);setSessionStalemates(sessionStalemates+1);AddModal(Draw) }
      },[game, win, stalemate])

      function modalClose(){
        CloseModal()
           game.reset();
           setWin("")
           setStalemate("")
           setFen("start")
           setCurrentGame(initialCurrentGameState)
           setInGame(false)
       
      }
       
       function Won(props) {
         return (
           <Modal>
             <ModalHeader>
               <h3>Congratulations!</h3>
             </ModalHeader>
             <ModalBody>
               <p>You Won!</p>
             </ModalBody>
             <ModalFooter>
               <button onClick={ modalClose } className="btn btn-primary">OK</button>
             </ModalFooter>
           </Modal>
         );
       }
   
       function Lost(props) {
         return (
           <Modal>
             <ModalHeader>
               <h3>Better Luck Next Time</h3>
             </ModalHeader>
             <ModalBody>
               <p>You Lost</p>
             </ModalBody>
             <ModalFooter>
               <button onClick={ modalClose } className="btn btn-primary">OK</button>
             </ModalFooter>
           </Modal>
         );
       }
   
       function Draw(props) {
         return (
           <Modal>
             <ModalHeader>
               <h3>So Close</h3>
             </ModalHeader>
             <ModalBody>
               <p>This game was a draw</p>
             </ModalBody>
             <ModalFooter>
               <button onClick={ modalClose } className="btn btn-primary">OK</button>
             </ModalFooter>
           </Modal>
         );
       }
    

      async function Concede(){
        setWin(false);
        socket.emit('conceded', opponent)
      }
      socket.on('conceded', () => {
        setConceded(true)
      })
      useEffect(()=>{
        if (conceded === true) 
         {setWin(true)
         socket.off("conceded")}
         },[conceded])

     return(
         <div id="gameContainer">
        {inGame === false ? <Dashboard 
          socket={socket}
          messages={messages}
          setMessages={setMessages}
          activeLobby={activeLobby}
          setActiveLobby={setActiveLobby}
          message={message}
          setMessage={setMessage}
          username={username}
          allUsers={allUsers}
          lobbyList={lobbyList}
          connectedRooms={connectedRooms}
          setConnectedRooms={setConnectedRooms}
          gameList={gameList}
          setGameList={setGameList}
          setInGame={setInGame}
          setCurrentGame={setCurrentGame}
          currentGame={currentGame}
          initialCurrentGameState={initialCurrentGameState}
          membershipToken={membershipToken}
          contractState={contractState}
          /> : <></>}
          {inGame === true & membershipToken.settings.board.moveType === 'Drag-to-move' ? 
          <>
          <GameState 
          game={game}
          currentGame={currentGame}
          playerColor={playerColor}
          opponentColor={opponentColor}
          />
          <div id="boardContainer">
            <DragMove 
          socket={socket}
          fen={fen}
          setFen={setFen}
          orientation={orientation}
          isPlayerTurn={isPlayerTurn}
          setIsPlayerTurn={setIsPlayerTurn}
          opponent={opponent}
          game={game}
          setGame={setGame}
          membershipToken={membershipToken}
          contractState={contractState}
          />
          <MoveLogger
            game={game}
            fen={fen}
            messages={messages} 
            setMessages={setMessages}
            message={message}
            setMessage={setMessage}
            socket={socket}
            activeLobby={activeLobby} 
            username={username}
          
             /></div><button id="concede-btn" className="btn btn-primary" onClick={Concede}>Concede</button>
          
             </> : <></>
          }
          {inGame === true & membershipToken.settings.board.moveType === 'Click-to-move' ?
          <>
          <GameState 
            game={game}
            currentGame={currentGame}
            playerColor={playerColor}
            opponentColor={opponentColor}
            />
          <div id="boardContainer">
            <ClickMove 
          socket={socket} 
          fen={fen}
          setFen={setFen}
          orientation={orientation}
          isPlayerTurn={isPlayerTurn}
          setIsPlayerTurn={setIsPlayerTurn}
          opponent={opponent}
          game={game}
          setGame={setGame}
          membershipToken={membershipToken}
          contractState={contractState}
          />
           <MoveLogger
            game={game}
            fen={fen}
            messages={messages} 
            setMessages={setMessages}
            message={message}
            setMessage={setMessage}
            socket={socket}
            activeLobby={activeLobby} 
            username={username}
             />
          </div> <button id="concede-btn" className="btn btn-primary" onClick={Concede}>Concede</button>
         
          </>: <></>}

         </div>
     )
    }

export default Game;