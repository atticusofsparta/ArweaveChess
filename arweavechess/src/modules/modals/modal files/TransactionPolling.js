import "./styles.loading.css";
import React from "react";
import Modal from "../modal components/Modal";
import ModalBody from "../modal components/ModalBody";
import ModalHeader from "../modal components/ModalHeader";
import ModalFooter from "../modal components/ModalFooter";
import CloseModal from "../modal components/CloseModal";
import ModalService from "../modal components/ModalService";

export default function TransactionPolling(props) {
    ModalService.popped = true
 
  return (
    <Modal>
      <ModalHeader>
        <h3 className="loadingHeader">Waiting for contract to update</h3>
      </ModalHeader>
      <ModalBody>
        <div className="loader"></div>
      </ModalBody>
      <ModalFooter>
        <a href={`https://viewblock.io/arweave/tx/${ModalService.pollTnx}` } target="_blank" >Transaction ID : {ModalService.pollTnx}</a>
           </ModalFooter>
    </Modal>
  );
}