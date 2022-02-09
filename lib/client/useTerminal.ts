import React, { useContext, useEffect, useState } from "react";
import { Terminal } from "xterm";
import { TerminalContext } from "./TerminalProvider";
import { DraculaTheme, UbuntuTheme } from "./theme";


interface StartTermProps {
	id: string
	type: "SSH" | "local"
	password: string
	username: string
	port?: number
	host: string
	size: { rows: number, cols: number }
}


export const useTerminal = (ref: React.RefObject<HTMLDivElement>, id: string) => {
	const { socket } = useContext(TerminalContext)
	const [terminal, setTerminal] = useState<Terminal | null>(null)

	useEffect(() => {
		const initTerminal = async () => {
			const { Terminal } = await import('xterm')
			const { FitAddon } = await import("xterm-addon-fit")

			const term = new Terminal({
				theme: DraculaTheme,
			})
			setTerminal(term)

			const fitAddon = new FitAddon();
			term.loadAddon(fitAddon);

			term.open(ref.current!)
			fitAddon.fit();

			const { cols, rows } = term
			const props: StartTermProps = {
				id,
				host: "192.168.0.164",
				username: "pi",
				type: "SSH",
				size: { cols, rows }
			}

			console.log(props)

			socket!.emit("__start-term__", props)
			socket!.on("__data__", data => {
				term.write(data)
			})

			socket!.on("__error__", err => {
				console.log(err)
			})

			socket!.on("__closed__", () => {
				console.log("connected closed")
			})

			term.onData((d) => {
				socket!.emit("__data__", d)
			})
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