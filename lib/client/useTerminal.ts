import React, { useContext, useEffect, useState } from "react";
import { Terminal } from "xterm";
import { TerminalContext } from "./TerminalProvider";

export const useTerminal = (ref: React.RefObject<HTMLDivElement>, id: string) => {
	const { socket } = useContext(TerminalContext)
	const [terminal, setTerminal] = useState<Terminal | null>(null)

	useEffect(() => {
		const initTerminal = async () => {
			const { Terminal } = await import('xterm')


			const term = new Terminal()
			setTerminal(term)

			socket!.emit("__start-term__", id)
			socket!.on("__data__", data => {
				term.write(data)
			})

			term.onData((d) => {
				socket!.emit("__data__", d)
			})

			term.open(ref.current!)
			term.writeln("> Hello world!")
		}

		if (ref?.current && socket) {
			initTerminal()
		}

		return () => {
			terminal?.element?.remove()
			socket?.removeAllListeners()
		}
	}, [ref, socket])
}