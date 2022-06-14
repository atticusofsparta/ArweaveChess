
import React, {useState, useEffect} from "react"
import MarketBoard from '../components/game/boards/MarketBoard.js'





const About = () => {
   
    return(
    <div id="about-container">
        about
        <MarketBoard 
                
              lightBackImage={'url(/media/squares/WhiteSand.png)'}
              darkBackImage={'url(/media/squares/BlackSand.png)'}
                />
        
     </div>
)}

export default About;