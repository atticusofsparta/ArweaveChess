import React, {useState, useEffect} from 'react';
import MarketBoard from '../components/game/boards/MarketBoard.js'
import ViewNftBoard from '../modules/modals/modal files/ViewNftBoard.js';
import ViewNftPiece from '../modules/modals/modal files/ViewNftPiece'
import AddModal from '../modules/modals/modal components/AddModal.js';
import ModalService from '../modules/modals/modal components/ModalService.js';
import TransactionPolling from '../modules/modals/modal files/TransactionPolling.js';
import { Chessboard } from 'react-chessboard';

const Settings = ({newAvatar, setNewAvatar, newContactInfo, setNewContactInfo,newLanguage, setNewLanguage,setNewMoveType, newMoveType,newUsername, setNewUsername,newPieces,setNewPieces, newBoard, setNewBoard, updateMembershipToken, contractState, membershipToken}) => {

  const [selectedNft, setSelectedNft] = useState("")
  const [activeTab, setActiveTab] = useState("pieces")

  const BoardOptions = () => Object.keys(contractState.assets.Boards).map(collection => 
    <div className='collection-container'><h3 className="collection-header">{collection}</h3>
    <div className="cards-container">
     
    {Object.keys(contractState.assets.Boards[collection].assets).map(asset => <div 
    className={contractState.assets.Boards[collection].assets[asset].owners.includes(membershipToken.name) ? "nft-cards" : "nft-cards-locked"} 
    onClick={()=>{
      AddModal(ViewNftBoard);
      setSelectedNft(contractState.assets.Boards[collection].assets[asset])
      ModalService.selectedNft = contractState.assets.Boards[collection].assets[asset]
      ModalService.selectedBoard = asset.toString()
      ModalService.setNewBoard = setNewBoard;
      ModalService.collection = collection.toString();
      ModalService.newBoard =  newBoard;
      console.log(newBoard)
    }}
    
    >
      
      <h6 className="nft-cards-header">{contractState.assets.Boards[collection].assets[asset].name}</h6>
      {contractState.assets.Boards[collection].assets[asset].owners.includes(membershipToken.name) ?
        <MarketBoard 
      Light={contractState.assets.Boards[collection].assets[asset].light}
      Dark={contractState.assets.Boards[collection].assets[asset].dark}
      boardName={asset}
      boardWidth={150}
      boardid={`settings-150px-${asset}`}
      /> : ""}
    </div>)} 
    </div></div>
    )
    const PieceOptions = () => Object.keys(contractState.assets.Pieces).map(collection => 
        <div className='collection-container'><h3 className="collection-header">{collection}</h3>
        <div className="cards-container">
         
        {Object.keys(contractState.assets.Pieces[collection].assets).map(asset => <div 
        className={contractState.assets.Pieces[collection].assets[asset].owners.includes(membershipToken.name) ? "nft-cards" : "nft-cards-locked"} 
        onClick={()=>{AddModal(ViewNftPiece)
          setSelectedNft(contractState.assets.Pieces[collection].assets[asset])
          ModalService.selectedNft = contractState.assets.Pieces[collection].assets[asset]
          ModalService.selectedPiece = asset.toString()
          ModalService.selectedCollection = collection.toString();
          ModalService.setNewPieces = setNewPieces;
          ModalService.newPieces = newPieces;
        
        }} >
          <h6 className='nft-cards-header'>{contractState.assets.Pieces[collection].assets[asset].name}</h6>
          {contractState.assets.Pieces[collection].assets[asset].owners.includes(membershipToken.name) ?
          <div className="nft-card-piece-container">
              <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[collection].assets[asset].whiteImage}}></div>
              <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[collection].assets[asset].blackImage}}></div>
          </div>
          : <></>}
        </div>)}
        </div></div>
        )

    return (
    <div id="settings-container">
        <h1 className='settings-options-header' >Update Your Membership Token</h1>
        <p className='settings-options-header' style={{backgroundImage:"linear-gradient(to bottom right, black, crimson, black)", color:"black", width:"60%", marginLeft:"20%", marginRight:"20%"}}>
         Here you can update you membership token.
        
        </p>
        <div id="settings-tabs">
          <button className="settings-tab" onClick={()=>{setActiveTab("boards")}}>Boards</button>
          <button className="settings-tab" onClick={()=>{setActiveTab("pieces")}}>Pieces</button>
          <button className="settings-tab" onClick={()=>{setActiveTab("settings")}}>Data</button>
        </div>
       
        <div className='settings-options'>
        {activeTab === "boards" ? <>
             <h2 className="settings-options-header">Board Nft</h2>
              <BoardOptions /></> : <></>}
              {activeTab === "pieces" ? <><h2 className='settings-options-header'>Piece Nfts</h2>
              <PieceOptions /></> : <></>}
             

            {activeTab === "settings" ? <><div className='settings-options'>
             <h2 className='settings-options-header'>Chat settings</h2> 
                 <h4 className="center-content">Username - will show above chats</h4>
                 <input className="settings-inputs" type="text" value={newUsername} onChange={(e)=> {setNewUsername(e.target.value)}} placeholder="Username"/>
             </div>  
             <div className='settings-options'>
             <h2 className='settings-options-header'>Avatar settings</h2>   
             <p className='center-content'>paste a url in here</p>
             <input className="settings-inputs" type="text" value={newAvatar} onChange={(e)=> {setNewAvatar(e.target.value)}} placeholder="Avatar image url"/>
             </div>        
             <div className='settings-options'>
             <h2 className='settings-options-header'>Contact info - Optional</h2> 
             <input className="settings-inputs" type="text" value={newContactInfo} onChange={(e)=> {setNewContactInfo(e.target.value)}} placeholder="Contact Info (email, discord, etc) -- optional"/>
               </div> 
               <div className='settings-options'>
               <h2 className='settings-options-header'>Language</h2> 
               <p className="center-content">Whats your native tongue?</p>
               <input className="settings-inputs" type="text" value={newLanguage} onChange={(e)=>{setNewLanguage(e.target.value)}} placeholder="Language"/>
               </div></> : <></>}
               </div>


               <div className="settings-options">
                <h2 className="collection-header"> Chosen settings</h2>
                  <div className='cards-container'>
                  <div className="nft-cards">
                    <h6 className='nft-cards-header'>Pawn</h6>
                        <div className="nft-card-piece-container">
                            <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[newPieces.P].assets.P.whiteImage}}></div>
                            <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[newPieces.P].assets.P.blackImage}}></div>
                        </div>
                  </div>
                  <div className="nft-cards">
                    <h6 className='nft-cards-header'>Rook</h6>
                        <div className="nft-card-piece-container">
                        <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[newPieces.R].assets.R.whiteImage}}></div>
                            <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[newPieces.R].assets.R.blackImage}}></div>
                        </div>
                  </div>
                  <div className="nft-cards">
                    <h6 className='nft-cards-header'>Knight</h6>
                        <div className="nft-card-piece-container">
                        <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[newPieces.N].assets.N.whiteImage}}></div>
                            <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[newPieces.N].assets.N.blackImage}}></div>
                        </div>
                  </div>
                  <div className="nft-cards">
                    <h6 className='nft-cards-header'>Bishop</h6>
                        <div className="nft-card-piece-container">
                        <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[newPieces.B].assets.B.whiteImage}}></div>
                            <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[newPieces.B].assets.B.blackImage}}></div>
                        </div>
                  </div>
                  <div className="nft-cards">
                    <h6 className='nft-cards-header'>Queen</h6>
                        <div className="nft-card-piece-container">
                        <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[newPieces.Q].assets.Q.whiteImage}}></div>
                            <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[newPieces.Q].assets.Q.blackImage}}></div>
                        </div>
                  </div>
                  <div className="nft-cards">
                    <h6 className='nft-cards-header'>King</h6>
                        <div className="nft-card-piece-container">
                        <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[newPieces.K].assets.K.whiteImage}}></div>
                            <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[newPieces.K].assets.K.blackImage}}></div>
                        </div>
                  </div>
                  </div>

                <div id="selected-board">
                      {newBoard.style.asset !== "default" ? <Chessboard
                      id={`settings-560-${newBoard.asset}`}
                      boardWidth={560}
                      position={''}
                      customBoardStyle={{
                        borderRadius: '4px',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
                      }}
                      customDarkSquareStyle={{background: contractState.assets.Boards[newBoard.style.collection].assets[newBoard.style.asset].dark}}
                      customLightSquareStyle={{background: contractState.assets.Boards[newBoard.style.collection].assets[newBoard.style.asset].light}}
                    /> :
                    <Chessboard
                    id={`settings-560-${newBoard.asset}`}
                      animationDuration={200}
                      arePiecesDraggable={false}
                      boardWidth={560}
                      position={''}
                      customBoardStyle={{
                        borderRadius: '4px',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
                      }}
                  
                    />}
                    </div>

                  <div id="settings-move-type">
                      <button  className={newMoveType !== "Drag-to-move" ? "move-type-button" : "move-type-button-selected"}  onClick={()=>{setNewMoveType("Drag-to-move")}}>Drag to Move</button>
                      <button className={newMoveType !== "Click-to-move" ? "move-type-button" : "move-type-button-selected"} onClick={()=>{setNewMoveType("Click-to-move")}}>Click to Move</button>
                  </div>
                  <table style={{backgroundColor:"black"}}>
                    <tr>
                    <th>Username</th>
                    <th>Avatar URL</th>
                    <th>Contact Info</th>
                    <th>Language</th>
                    <th>Move Type</th>
                    </tr>
                    <tr>
                      <td>{newUsername}</td>
                      <td>{newAvatar} <img src={newAvatar} alt="" width="150px" hieght="300px"/></td>
                      <td>{newContactInfo} </td>
                      <td>{newLanguage}</td>
                      <td>{newMoveType}</td>
                    </tr>
                  </table>


                 

               </div>
               <button className="settings-inputs" onClick={()=>{ updateMembershipToken(); console.log(contractState);AddModal(TransactionPolling);}}>Update Membership Token</button>  


    </div>
    )
}
export default Settings