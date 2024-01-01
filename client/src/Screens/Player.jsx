import React from 'react'
import ReactPlayer from "react-player";

const Player = ({stream}) => {
    console.log("player", stream);
  return (
    <div className="stream-box" >
        
          {stream && <h4 className="stream-text">Remote stream </h4>}

          {stream&& (
            <ReactPlayer
              url={stream}
              height="300px"
              width="300px"
              playing
              muted
            />
          )}
    </div>
  )
}

export default Player