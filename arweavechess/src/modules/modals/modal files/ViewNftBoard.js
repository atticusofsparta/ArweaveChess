import "./styles.loading.css";
import React from "react";
import Modal from "../modal components/Modal";
import ModalBody from "../modal components/ModalBody";
import ModalHeader from "../modal components/ModalHeader";
import ModalFooter from "../modal components/ModalFooter";
import CloseModal from "../modal components/CloseModal";
import ModalService from "../modal components/ModalService";
import MarketBoard from '../../../components/game/boards/MarketBoard'
import immer from 'immer'


export default function ViewNftBoard() {
    ModalService.popped = true 
  return (
    <Modal>
      <ModalHeader>
        <h3 className="loadingHeader">{ModalService.selectedNft.name} Chessboard</h3>
      </ModalHeader>
      <ModalBody>
      <MarketBoard 
      Light={ModalService.selectedNft.light}
      Dark={ModalService.selectedNft.dark}
      boardName={ModalService.selectedNft.name}
      boardWidth={560}
      /> 
      </ModalBody>
      <ModalFooter>
      <button className="btn btn-primary" onClick={()=>{ModalService.setNewBoard(
        {moveType: ModalService.newBoard.moveType, style: {asset: ModalService.selectedBoard, collection: ModalService.collection}}); 
        CloseModal()}}>Select Board</button>
      <button onClick={()=> CloseModal() } className="btn btn-primary">Close</button>
      
           </ModalFooter>
    </Modal>
  );
}