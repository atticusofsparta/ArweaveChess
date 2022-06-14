import { useRef, useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';


export default function DragMove({ boardWidth, socket, opponent, setFen, setIsPlayerTurn, orientation, isPlayerTurn, fen, setGame, game, userBoardStyle, membershipToken, contractState}) {
  const chessboardRef = useRef();

  const [newMove, setNewMove] = useState('')
  
  
  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  function onDrop(sourceSquare, targetSquare) {
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen for example simplicity
    });
    setGame(gameCopy);
    socket.emit('move', opponent, move)
    console.log(opponent)
    setFen(game.fen()); 
    setIsPlayerTurn(false)
    return move;
  }
  socket.on('move', (newmove) => {
   setNewMove(newmove)
  
  })
  useEffect(()=>{
    socket.off('move')
    if (newMove !== ''){
    game.move(newMove)
    console.log(newMove)
    setFen(game.fen())
    setIsPlayerTurn(true)}
  },[newMove])

  const pieces = {
    wP: contractState.assets.Pieces[membershipToken.settings.pieces.P].assets.P.whiteImage,
    wN:contractState.assets.Pieces[membershipToken.settings.pieces.N].assets.N.whiteImage,
    wB:contractState.assets.Pieces[membershipToken.settings.pieces.B].assets.B.whiteImage,
    wR:contractState.assets.Pieces[membershipToken.settings.pieces.R].assets.R.whiteImage,
    wQ:contractState.assets.Pieces[membershipToken.settings.pieces.Q].assets.Q.whiteImage,
    wK:contractState.assets.Pieces[membershipToken.settings.pieces.K].assets.K.whiteImage,
    bP:contractState.assets.Pieces[membershipToken.settings.pieces.P].assets.P.blackImage,
    bN:contractState.assets.Pieces[membershipToken.settings.pieces.N].assets.N.blackImage,
    bB:contractState.assets.Pieces[membershipToken.settings.pieces.B].assets.B.blackImage,
    bR:contractState.assets.Pieces[membershipToken.settings.pieces.R].assets.R.blackImage,
    bQ:contractState.assets.Pieces[membershipToken.settings.pieces.Q].assets.Q.blackImage,
    bK:contractState.assets.Pieces[membershipToken.settings.pieces.K].assets.K.blackImage

    };
  const customPieces = () => {
    const returnPieces = {};
    Object.keys(pieces).map((p) => {
      returnPieces[p] = ({ squareWidth }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: pieces[p],
            backgroundSize: 'contain',
            backgroundRepeat:"no-repeat",
            backgroundPosition:"center"
          }}
        />
      );
      return null;
    });
    return returnPieces;
  };
  return (
    <div>
      {membershipToken.settings.board.style !== "default" ? <Chessboard
        id="myboard"
        animationDuration={200}
        boardWidth={boardWidth}
        position={fen}
        onPieceDrop={onDrop}
        boardOrientation={orientation}
        customBoardStyle={{
          borderRadius: '1px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',         
        }}
        customDarkSquareStyle={{background: contractState.assets.Boards[membershipToken.settings.board.style.collection].assets[membershipToken.settings.board.style.asset].dark}}
        customLightSquareStyle={{background: contractState.assets.Boards[membershipToken.settings.board.style.collection].assets[membershipToken.settings.board.style.asset].light}}
        squareColorIdName={membershipToken.settings.board.style.collection}
        customPieces={customPieces()}
        ref={chessboardRef}
        arePiecesDraggable={isPlayerTurn}
      />:
      <Chessboard
        id="myboard"
        animationDuration={200}
        boardWidth={boardWidth}
        position={fen}
        onPieceDrop={onDrop}
        boardOrientation={orientation}
        customBoardStyle={{
          borderRadius: '1px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',         
        }}
        customPieces={customPieces()}
        ref={chessboardRef}
        arePiecesDraggable={isPlayerTurn}
      />}
      
    </div>
  );
}