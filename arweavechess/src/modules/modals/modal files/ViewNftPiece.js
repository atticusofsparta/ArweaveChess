import "./styles.loading.css";
import React from "react";
import Modal from "../modal components/Modal";
import ModalBody from "../modal components/ModalBody";
import ModalHeader from "../modal components/ModalHeader";
import ModalFooter from "../modal components/ModalFooter";
import CloseModal from "../modal components/CloseModal";
import ModalService from "../modal components/ModalService";
import immer from 'immer';



export default function ViewNftPiece() {
    ModalService.popped = true
  const newPiece = immer(ModalService.newPieces, draft => {
    draft[ModalService.selectedPiece] = ModalService.selectedCollection
  })
   
  return (
    <Modal>
      <ModalHeader> 
        <h3 className="settings-options-header">{ModalService.selectedNft.name}</h3>
      </ModalHeader>
      <ModalBody>
      
         <div className="view-card-piece-container">
         <div className='view-card-piece' style={{backgroundImage: ModalService.selectedNft.whiteImage}}></div>
              <div className='view-card-piece' style={{backgroundImage:ModalService.selectedNft.blackImage}}></div>
          

         </div>
         
              
      </ModalBody>
      <ModalFooter>
      <button className="btn btn-primary" onClick={()=>{ModalService.setNewPieces(newPiece); CloseModal()}}>Select Piece</button>
      <button onClick={()=> CloseModal() } className="btn btn-primary">Close</button>
      
           </ModalFooter>
    </Modal>
  );
}