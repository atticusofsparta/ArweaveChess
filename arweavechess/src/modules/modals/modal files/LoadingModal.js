import "./styles.loading.css";
import React from "react";
import Modal from "../modal components/Modal";
import ModalBody from "../modal components/ModalBody";
import ModalHeader from "../modal components/ModalHeader";
import ModalFooter from "../modal components/ModalFooter";
import CloseModal from "../modal components/CloseModal";
import ModalService from "../modal components/ModalService";

export default function LoadingModal({props}, {setUsername,username,setUser,socket}) {
    ModalService.popped = true

    function Join(){

      socket.auth = {username};
      socket.connect();
      setUser(true);

    }
  return (
    <Modal>
      <ModalHeader>
        <h3 className="loadingHeader">Join Lobby</h3>
      </ModalHeader>
      <ModalBody>
      <input 
          type="text" 
          value={username} 
          onChange={(e)=>setUsername(e.target.value)} 
          placeholder="enter username"/>
      </ModalBody>
      <ModalFooter>
        <div id="joinCancelFooter">
        <button className="btn btn-primary" id="joinLoadingModal" onClick={Join}>Join</button>
      <button onClick={()=> CloseModal() } className="btn btn-primary">Cancel</button>
      </div>
           </ModalFooter>
    </Modal>
  );
}