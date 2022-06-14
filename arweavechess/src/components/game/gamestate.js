const GameState = ({game, playerColor, currentGame, opponentColor}) => {

    return (
        <div id="game-state">
       {game.turn() !== playerColor ? <div id="player-one" className='game-state-items'><label className='center-content'>You are:</label><span className='center-content'>{currentGame.playerColor}</span></div>
       :
       <div id="PlayerTurn" ><label className='center-content'>You are:</label><span className='center-content'>{currentGame.playerColor}</span></div>}
       <div id="countdown-timer" className='game-state-items'><label className='center-content'>Turn timer</label><span className='center-content'>Coming Soon</span></div>
       {game.turn() !== opponentColor ? <div id="player-two" className='game-state-items'><label className='center-content'>Opponent</label><span className='center-content'>{currentGame.opponentColor}</span></div>
        :
        <div id="PlayerTurn" ><label className='center-content'>Opponent</label><span className='center-content'>{currentGame.opponentColor}</span></div>}
     
       </div>
    )

}

export default GameState