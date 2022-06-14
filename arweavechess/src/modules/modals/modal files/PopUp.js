import React from "react";
import Modal from "../modal components/Modal";
import ModalBody from "../modal components/ModalBody";
import ModalHeader from "../modal components/ModalHeader";
import ModalFooter from "../modal components/ModalFooter";

export default function PopUp(props) {
  return (
    <Modal>
      <ModalHeader>
        <h3>Game Over</h3>
      </ModalHeader>
      <ModalBody>
        <p>You probably won!</p>
      </ModalBody>
      <ModalFooter>
        <button onClick={ props.close } className="btn btn-primary">Close Modal</button>
      </ModalFooter>
    </Modal>
  );
}