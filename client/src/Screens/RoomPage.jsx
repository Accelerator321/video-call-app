import React, { useCallback, useContext, useEffect, useState } from "react";
import { useSocket } from "../context/socketProvider";
import ReactPlayer from "react-player";
import { Peer as peer } from "../services/Peer";
import Player from "./Player";

export const RoomPage = () => {
  const socket = useSocket();
  const [streamList, setStreamList] = useState({});
  const [peerList, setPeerList] = useState({});
  const [myStream, setMyStream] = useState();
  const [refresh, setRefresh] = useState(true);


  // Call Handlers

  const handleUserJoined = async ({ email, id }) => {
    console.log(`${email} joinded`);
    let li = peerList;
    li[email] = new peer();
    setPeerList(li);
    setRefresh(!refresh);

    

    const offer = await li[email].getOffer();
    console.log(peerList)
    socket.emit("user:call", { to: email, offer });
    // setMyStream(stream);
  };

  const handleIncommingCall = async ({ from, offer }) => {
    let li = peerList;
    li[from] = new peer();
    setPeerList(li);
    console.log("incoming call", from);
    setRefresh(!refresh);

    const ans = await li[from].getAnswer(offer);
    console.log(peerList);

    socket.emit("call:accepted", { to:from, ans });

    // confirm("send");
    sendStream();
  };

  const handleCallAccepted =
    async ({ from, ans }) => {
      await peerList[from].setLocalDescription(ans);
      console.log("call accepted", from);

      sendStream();
    }

  //  ______________________Negotiation functions_________________
  const handleNegotiation = async (email) => {
    
    const offer = await peerList[email].getOffer();
    
    
    socket.emit("peer:nego:needed", { to: email, offer });
    console.log("starting nego");
    
  };

  const handleNegotiationAccepeted = 
    async ({ offer, from }) => {
      
      console.log("from", from , peerList)
      let ans = await peerList[from].getAnswer(offer);

      socket.emit("peer:nego:done", { to: from, ans });
      console.log("nego accepted");
    }

  const handleNegoFinal = 
    async ({ ans, from }) => {
      console.log("finalizing nego1");
      console.log(from)
      await peerList[from].setLocalDescription(ans);
      console.log("finalizing nego2");
    }

  // ____________________Stream function___________________________
  const getMystream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    setMyStream(stream);
  };

  const sendStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    for (const track of stream.getTracks()) {
      
      for (let email in peerList) peerList[email].peer.addTrack(track, stream);
    }
  };

  // ____________Handling tracks____________
  const hanndleTrack = (email, ev) => {
    console.log(ev);

    const remoteStreams = ev.streams;

    let li = streamList;

    li[email] = remoteStreams[0];
    console.log("li", li);
    setStreamList(li);
    setRefresh(!refresh);
  };

  // ______Negotiation use Effect____________
  useEffect(() => {
    for (let email in peerList) {
      console.log(email);
      if (email)
        peerList[email].peer.addEventListener("negotiationneeded", ()=>
          handleNegotiation(email)
        );
    }
    socket.on("peer:nego:needed", handleNegotiationAccepeted);
    socket.on("peer:nego:final", handleNegoFinal);

    return () => {
      for (let email in peerList) {
        if (email)
          peerList[email].peer.removeEventListener("negotiationneeded", ()=>
            handleNegotiation(email)
          );
      }
      socket.off("peer:nego:needed", handleNegotiationAccepeted);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [refresh]);

  // _________________Track useeffect________________________
  useEffect(() => {
    getMystream();
    console.log(peerList, "use");
    for (let email in peerList) {
      // console.log(pr);
      if (email)
        peerList[email].peer.addEventListener("track", (ev) =>
          hanndleTrack(email, ev)
        );
    }

    return () => {
      for (let email in peerList) {
        if (email)
          peerList[email].peer.removeEventListener("track", (ev) =>
            hanndleTrack(email, ev)
          );
      }
    };
  },[refresh]);

  // _____________P2P connection useEffect___________________________
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
    };
  }, [socket]);

  let i = 0;


  return (
    <>
      <h1>RoomPage</h1>
      <h1 style={{ color: "#708310" }}>
        {Object.keys(peerList).length != 0
          ? "Connected"
          : "No one in the room1"}
      </h1>

      <div id="call-container">
      
          {/* {myStream && <h4 className="stream-text">My stream</h4>}
          {myStream && (
            <ReactPlayer
              url={myStream}
              height="300px"
              width="300px"
              playing
              muted
            />
          )} */}
          <Player stream={myStream} email={"My stream"} />

          {Object.keys(peerList).map((id) => {
            i += 1;
            return <Player key={i} stream={streamList[id]} email={id} />;
          })}
        
      </div>
    </>
  );
};
