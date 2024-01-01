import React, { useCallback, useEffect, useState } from "react";

import { useSocket } from "../context/socketProvider";
import { useNavigate } from "react-router-dom";

import '../css/lobby.css';

const Lobby = () => {
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, roomId });
    },
    [email, roomId, socket]
  );

  const handleRoomJoin = useCallback((data) => {
    console.log(data, "join request aproved");
    navigate(`/room/${roomId}`);
  });

  useEffect(() => {
    socket.on("room:join", handleRoomJoin);

    return () => {
      socket.off("room:join", handleRoomJoin);
    };
  }, [socket, handleRoomJoin]);
  return (
    <div id = 'lobby'>

      <form action="" className="form_main" onSubmit={handleSubmit}>
        <p className="heading">Login</p>
        <div className="inputContainer">
         
          <input
            className="inputField"
            type="email"
            id="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="inputContainer">
          
          

          <input
            className="inputField"
            type="text"
            id="roomId"
            placeholder="enter roomid"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>
        <button id="button">join</button>
      </form>
    </div>
  );
};

export default Lobby;
