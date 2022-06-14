import React from "react";
import Modal from "../modal components/Modal";
import ModalBody from "../modal components/ModalBody";
import ModalHeader from "../modal components/ModalHeader";
import ModalFooter from "../modal components/ModalFooter";
import CloseModal from "../modal components/CloseModal";
import NFTCheck from "../../randomFunctions/NFTCheck";

export default function NFTModal(props) {
  return (
    <Modal>
      <ModalHeader>
        <h3>Get an NFT</h3>
      </ModalHeader>
      <ModalBody>
        <p>You need one of our NFTs in order to play this game. Mint one using the button above</p>
            </ModalBody>
      <ModalFooter>
        
      </ModalFooter>
    </Modal>
  );
}