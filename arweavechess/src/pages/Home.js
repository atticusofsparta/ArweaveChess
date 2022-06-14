import React from "react";


const Home = () => {
 
  return (
    <div>
      <header>Welcome to Polygon Chess</header>
      <h3>
        The only chess game that lets you save your win to the blockchain, so
        you can brag forever
      </h3>
      <div className="contentContainer">
        <div className="howItWorks">
          <div className="largeText">HOW IT WORKS:</div>
          <div>
            <ol>
              <li>Connect your Metamask wallet</li>
              <li>Navigate to the Game tab and mint an nft</li>
              <li>
                Match with other players in the "Game" tab for a round of chess
              </li>
              <li>
                Whichever player loses has to pay gas to commit the game log to
                the blockchain
              </li>
              <li>
                The winner gets a permanent, immutable record of their victory
              </li>
            </ol>
          </div>
        </div>
       
      </div>
      <div className="chessRulesContainer">
        <div className="largeText">How to play chess</div>
        <div className="chessRules">
          <div className="pieces">
            <ul className="piecesList">
              <li>
                King: the king may move one square in any direction, so long as
                no piece is blocking his path and the move does not put the king
                in check.
              </li>
              <li>
                Queen: the queen may move any number of squares straight or
                diagonally in any direction
              </li>
              <li>
                Rook: sometimes called a Castle, the rook may move any number of
                squares in a straight line, horizontally or vertically
              </li>
              <li>
                Bishop: the bishop may move any number of squares diagonally
              </li>
              <li>
                Knight: the knight moves three squares total in an "L" shape.
                One square horizontally or vertically, and then two squares in a
                direction 90 degrees to the original direction. The knight
                "jumps" to its new position and is not blocked by other pieces
                in its path.
              </li>
              <li>
                Pawn:Pawns generally move only one square in the direction of
                your opponent's side of the board. On its first move from the
                starting position, the pawn can move two squares. While it can
                only move straight forward, a pawn can only attack diagonally,
                so if its path ahead is blocked it cannot move.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <br/>
      <div className="bottomContainer">
        <div className="specialMovesContainer">
          <div className="largeText">Special Moves</div>
          <div className="specialMoves">
            <ul>
              <li>
                En Passant: If a pawn moves forward three squares, it is even
                with where the opponent's pawn would be if it moved forward two
                squares. If the opposing pawn uses its initial two square move
                to become even with your pawn, you may attack the opponent
                diagonally and take the piece as if it had only moved one
                square.
              </li>
              <li>
                Castle: If there are no pieces between your king and either of
                your rooks, and neither piece has moved yet, you can move the
                king two squares towards the rook and move the rook one square
                on the opposite side of the king. You cannot castle into, out
                of, or through check.
              </li>
            </ul>
          </div>
        </div>
        <div className="objectiveContainer">
          <div className="largeText">Objectives and terms</div>
          <div className="objectives">
            <ul>
              <li>
                Check: If a king can be directly taken by an opponent's piece on
                the opponent's next turn, the king is in check. If your king is
                in check you MUST move your king out of check or move another
                piece to block your opponent.
              </li>
              <li>
                CheckMate: If a king is in check and there is no possible move
                to get out of check, it is a checkmate and the game is over.
                Whomever is in checkmate loses.
              </li>
              <li>
                StaleMate: If a king is not in check, but there are no moves
                that can be made without placing itself in check, it is called a
                stalemate and the game ends in a draw
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
