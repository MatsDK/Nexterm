import React, { createContext, useEffect, useState } from "react"
import socketIOClient, { Socket } from "socket.io-client";


interface TerminalProviderContext {
	socket: Socket | null
}

export const TerminalContext = createContext<TerminalProviderContext>({ socket: null })

interface TerminalProviderProps {
	socket?: {
		endPoint: string,
	}
}

export const TerminalProvider: React.FC<TerminalProviderProps> = ({ children, socket }) => {
	const [_socket, setSocket] = useState<null | Socket>(null)

	useEffect(() => {
		if (socket) setSocket(socketIOClient(socket.endPoint))

		return () => { }
	}, [socket])

	return <TerminalContext.Provider value={{ socket: _socket }}>
		{children}
	</TerminalContext.Provider>
}