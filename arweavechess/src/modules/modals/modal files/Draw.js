import React from "react";
import Modal from "../modal components/Modal";
import ModalBody from "../modal components/ModalBody";
import ModalHeader from "../modal components/ModalHeader";
import ModalFooter from "../modal components/ModalFooter";
import Chess from 'chess.js';
import CloseModal from "../modal components/CloseModal";
import ModalService from "../modal components/ModalService";

export default function Draw( props) {


  return (
    <Modal>
      <ModalHeader>
        <h3>So Close</h3>
      </ModalHeader>
      <ModalBody>
        <p>This game is a draw</p>
      </ModalBody>
      <ModalFooter>
        <button onClick={ props.close } className="btn btn-primary">OK</button>
      </ModalFooter>
    </Modal>
  );
}
