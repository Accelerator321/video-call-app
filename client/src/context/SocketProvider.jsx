import React, { createContext, useContext, useMemo } from 'react'
import {io} from "socket.io-client"
const socketContext = createContext(null);

export const useSocket= ()=>{
    const socket = useContext(socketContext);
    return socket;
}
const SocketProvider = (props) => {
    
    
    const socket = useMemo(()=>io('http://192.168.153.92'),[] );



    
  return (
    <socketContext.Provider value={socket} >
        {props.children}
    </socketContext.Provider>
  )
}

export default SocketProvider