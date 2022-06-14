import React, {useState, useEffect} from 'react';
import AddModal from '../modules/modals/modal components/AddModal'
import ViewNftBoard from '../modules/modals/modal files/ViewNftBoard';
import ViewNftPiece from '../modules/modals/modal files/ViewNftPiece'
import MintyModal from '../modules/modals/modal files/ViewNftBoard';
import MarketBoard from '../components/game/boards/MarketBoard.js'
import Holdings from '../components/wallet/Holdings'

//AR to usd value - for building the tnx, membership is 5 bucks and that gets you a set as well. Sets are 10 bucks.
//https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd

const Market = ({contractState}) => {
    const [pages, setPages] = useState([]);
    const [display, setDisplay] = useState("Sets"); /// boards, sets, pieces
    const [selectedNft, setSelectedNft] = useState({light: "white", dark: "black"})
    
    //function that divides number of items by 36 to find how many pages are need, and sets items to page 1++
    const BoardOptions = () => Object.keys(contractState.assets.Boards).map(collection => 
        <div className='collection-container'><h3 className="collection-header">{collection}</h3>
        <div className="cards-container">
         
        {Object.keys(contractState.assets.Boards[collection].assets).map(asset => <div className='nft-cards' onClick={()=>{AddModal(ViewNftBoard)}}>
          <h6 className='nft-cards-header'>{contractState.assets.Boards[collection].assets[asset].name}</h6>
          <MarketBoard 
          Light={contractState.assets.Boards[collection].assets[asset].light}
          Dark={contractState.assets.Boards[collection].assets[asset].dark}
         boardName={asset}
          />
        </div>)} 
        </div></div>
        )
        const PieceOptions = () => Object.keys(contractState.assets.Pieces).map((collection, index) => 
            <div className='collection-container' key={index}><h3 className="collection-header">{collection}</h3>
            <div className="cards-container">
             
            {Object.keys(contractState.assets.Pieces[collection].assets).map(asset => <div className='nft-cards' onClick={()=>{AddModal(ViewNftPiece)}}>
              <h6 className='nft-cards-header'>{contractState.assets.Pieces[collection].assets[asset].name}</h6>
              <div className="nft-card-piece-container">
                  <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[collection].assets[asset].whiteImage}}></div>
                  
                  <div className='card-piece' style={{backgroundImage:contractState.assets.Pieces[collection].assets[asset].blackImage}}></div>
              </div>
            </div>)}
            </div></div>
            )

    async function changeDisplay(props){
        setDisplay(props);
    }
    const buyNftModal = () => {

        return (
            <div className="modal">
                <div id="buy-nft"></div>
            </div>
        )
    }




    return (
        <div id="market-container">
            <h1 id="market-header" className="center-content">Market: {display}</h1>
            <div id="market-page-btns">
            <h3 id="market-boards-page-btn" onClick={()=>{changeDisplay("Boards")}}>Boards</h3>
            <h3 id="market-sets-page-btn" onClick={()=>{changeDisplay("Holdings")}}>Holdings</h3>
            <h3 id="market-pieces-page-btn" onClick={()=>{changeDisplay("Pieces")}}>Pieces</h3>
            <h3 id="market-holdings-page-btn" onClick={()=>{changeDisplay("Create")}}>Create A Collection</h3>
            </div>
            
            {display === "Boards" ? <BoardOptions/>:<></>}
            {display === "Create" ?
                <div className="settings-options">
                    <h2 className='settings-options-header'>Create Collection And Assets</h2>

                <div className="collection-container">
                <h4 className="collection-header">Collection settings</h4>

                    <div className='settings-options'>
                    <h3 className="settings-options-header">Collection Name</h3>
                    <p className='center-content'>Name of your Collection. This can not be changed, so choose a good one.</p>
                    <input className="settings-inputs" type="text" placeholder="Name"/>
                    </div>
                    
                    <div className='settings-options'>
                    <h4 className="settings-options-header">Collection Owners</h4>
                    <p className="center-content">Address's of the owners of the collection seperated by commas. These are people who will be able to transfer and
                    burn the collection.
                    </p>
                    <input className="settings-inputs" type="text" placeholder="Owners"/>
                    </div>


                    </div>



                    <div className="collection-container">
                    <h3 className="collection-header">Assets settings</h3>


                    <div className='settings-options'>
                    <h4 className="settings-options-header">Asset Attributes</h4>
                    <p className="center-content">
                       Attributes stored in the asset. 
                    </p>



                    <label className="collection-container"> <h6 className='collection-header'>Pawns</h6>
                    <input className="settings-inputs" type="text" placeholder="Name"/>
                    <input className="settings-inputs" type="text" placeholder="White Pawn url"/>
                    <input className="settings-inputs" type="text" placeholder="Black Pawn url"/>
                    <input className="settings-inputs" type="text" placeholder="Owners"/>
                    </label>
                    <label className="collection-container"> <h6 className='collection-header'>Rooks</h6>
                    <input className="settings-inputs" type="text" placeholder="Name"/>
                    <input className="settings-inputs" type="text" placeholder="White Rook url"/>
                    <input className="settings-inputs" type="text" placeholder="Black Rook url"/>
                    <input className="settings-inputs" type="text" placeholder="Owners"/>
                    </label>
                    <label className="collection-container"> <h6 className='collection-header'>Knights</h6>
                    <input className="settings-inputs" type="text" placeholder="Name"/>
                    <input className="settings-inputs" type="text" placeholder="White Knight url"/>
                    <input className="settings-inputs" type="text" placeholder="Black Knight url"/>
                    <input className="settings-inputs" type="text" placeholder="Owners"/>
                    </label>
                    <label className="collection-container"> <h6 className='collection-header'>Bishops</h6>
                    <input className="settings-inputs" type="text" placeholder="Name"/>
                    <input className="settings-inputs" type="text" placeholder="White Bishop url"/>
                    <input className="settings-inputs" type="text" placeholder="Black Bishop url"/>
                    <input className="settings-inputs" type="text" placeholder="Owners"/>
                    </label>
                    <label className="collection-container"><h6 className='collection-header'>Queens</h6> 
                    <input className="settings-inputs" type="text" placeholder="Name"/>
                    <input className="settings-inputs" type="text" placeholder="White Pawn url"/>
                    <input className="settings-inputs" type="text" placeholder="Black Pawn url"/>
                    <input className="settings-inputs" type="text" placeholder="Owners"/>
                    </label>
                    <label className="collection-container"> <h6 className='collection-header'>Kings</h6>
                    <input className="settings-inputs" type="text" placeholder="Name"/>
                    <input className="settings-inputs" type="text" placeholder="White Pawn url"/>
                    <input className="settings-inputs" type="text" placeholder="Black Pawn url"/>
                    <input className="settings-inputs" type="text" placeholder="Owners"/>
                    </label>
                    </div>

                    <div className='settings-options'>
                    <h4 className="settings-options-header">Asset Owners</h4>
                    <p className="center-content">
                        Address's of the initial owners of the asset, you can consider this akin to an airdrop. Seperate by commas.
                    </p>
                    <input className="settings-inputs" type="text" placeholder="Inital owners"/>
                    </div>

                    </div>

                    

                    </div>
            
            :<></>}
            {display === "Pieces" ? <PieceOptions />:<></>}
            {display === "Holdings" ? <Holdings /> : <></>}

            <div id="market-footer">
           
                <ul className="pagination">
                    <li className="page-item disabled">
                    <a className="page-link" href="#">&laquo;</a>
                    </li>
                    <li className="page-item active">
                    <a className="page-link" href="#">1</a>
                    </li>
                    <li className="page-item">
                    <a className="page-link" href="#">2</a>
                    </li>
                    <li className="page-item">
                    <a className="page-link" href="#">3</a>
                    </li>
                    <li className="page-item">
                    <a className="page-link" href="#">4</a>
                    </li>
                    <li className="page-item">
                    <a className="page-link" href="#">5</a>
                    </li>
                    
                    <li className="page-item">
                    <a className="page-link" href="#">&raquo;</a>
                    </li>
                </ul>
                

            </div>

        </div>
    )

}
export default Market