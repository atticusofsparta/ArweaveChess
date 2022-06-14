import { useRef, useState, useEffect } from 'react';

import { Chessboard } from 'react-chessboard';

export default function ClickMove({ boardWidth, socket, opponent, setFen, setIsPlayerTurn, orientation, isPlayerTurn, fen, setGame, game, membershipToken, contractState}) {
  const chessboardRef = useRef();
  

  const [moveFrom, setMoveFrom] = useState('');

  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});

  

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  function getMoveOptions(square) {
    const moves = game.moves({
      square,
      verbose: true
    });
    if (moves.length === 0) {
      return;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    setOptionSquares(newSquares);
  }

  function onSquareClick(square) {
    setRightClickedSquares({});

    function resetFirstMove(square) {
      setMoveFrom(square);
      getMoveOptions(square);
    }

    // from square
    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }

    // attempt to make move
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: moveFrom,
      to: square,
      promotion: 'q' // always promote to a queen for example simplicity
    });
    setGame(gameCopy);
    socket.emit('move', opponent, move)
    console.log(opponent)
    setFen(game.fen()); 
    setIsPlayerTurn(false)

    // if invalid, setMoveFrom and getMoveOptions
    if (move === null) {
      resetFirstMove(square);
      return;
    }
    setMoveFrom('');
    setOptionSquares({});
  }
  socket.on('move', (newmove) => {
    game.move(newmove);
    setFen(game.fen())
    setIsPlayerTurn(true)
  })

  //highlighting
  function onSquareRightClick(square) {
    const colour = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour }
    });
  }

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
        arePiecesDraggable={false}
        boardWidth={boardWidth}
        position={fen}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        boardOrientation={orientation}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
        }}
        customSquareStyles={{
          ...moveSquares,
          ...optionSquares,
          ...rightClickedSquares
        }}
        customDarkSquareStyle={{background: contractState.assets.Boards[membershipToken.settings.board.style.collection].assets[membershipToken.settings.board.style.asset].dark}}
        customLightSquareStyle={{background: contractState.assets.Boards[membershipToken.settings.board.style.collection].assets[membershipToken.settings.board.style.asset].light}}
        customPieces={customPieces()}
        ref={chessboardRef}
      /> :
      <Chessboard
        id="myboard"
        animationDuration={200}
        arePiecesDraggable={false}
        boardWidth={boardWidth}
        position={fen}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        boardOrientation={orientation}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
        }}
        customSquareStyles={{
          ...moveSquares,
          ...optionSquares,
          ...rightClickedSquares
        }}
        customPieces={customPieces()}
        ref={chessboardRef}
      />}
    </div>
  );
}