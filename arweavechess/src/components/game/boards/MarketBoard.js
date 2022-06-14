import { Chessboard } from 'react-chessboard';

export default function MarketBoard({ boardWidth, Light, Dark, darkBackImage, lightBackImage, boardName, customBoardWidth, boardid }) {
  return (
    <div>
      <Chessboard 
      id={boardid} 
      boardWidth={boardWidth}
      customDarkSquareStyle={{background: Dark}}
      customLightSquareStyle={{background: Light}}
      position={""}
      squareColorIdName={`${boardName}-chess-tile`}
      customBoardStyle={{zIndex:'1'}}
      customSquareStyles={{zIndex:'1'}}
      />
    </div>
  );
}