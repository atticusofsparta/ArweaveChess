import React from "react";
import Modal from "../modal components/Modal";
import ModalBody from "../modal components/ModalBody";
import ModalHeader from "../modal components/ModalHeader";
import ModalFooter from "../modal components/ModalFooter";

export default function Lost(props) {
  return (
    <Modal>
      <ModalHeader>
        <h3>Better Luck Next Time</h3>
      </ModalHeader>
      <ModalBody>
        <p>You lost this game.</p>
      </ModalBody>
      <ModalFooter>
        <button onClick={ props.close } className="btn btn-primary">OK</button>
      </ModalFooter>
    </Modal>
  );
}