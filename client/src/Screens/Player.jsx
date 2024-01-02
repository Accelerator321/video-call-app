import React from 'react'
import ReactPlayer from "react-player";

const Player = ({stream,email}) => {
    console.log("player",email, stream);
  return (
    <div className="stream-box" >
        
          {stream && <h4 className="stream-text">{email}</h4>}
          <div className='wrapper'>
          {stream&& (
            <ReactPlayer
              url={stream}
              height="100%"
              width="100%"
              playing
              muted
            />
          )}
          </div>
    </div>
  )
}

export default Player