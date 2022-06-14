import ModalService from "./ModalService";

export default function AddModal(modal){
    ModalService.open(modal)
    console.log("modal added")
}