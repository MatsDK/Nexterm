import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { TerminalContext } from "./TerminalProvider";
import { DraculaTheme, FirefoxDevTheme, UbuntuTheme } from "./theme";

interface SSHConnectProps {
	password: string
	username: string
	port?: number
	host: string
}

type DefaultStartTermProps = { size: { rows: number, cols: number }, id: string, closeOnDisconnect?: boolean }

type StartTermLocalProps = ({ type: "local" } & DefaultStartTermProps)
type StartTermSSHProps = ({ type: "SSH" } & DefaultStartTermProps & SSHConnectProps)
type StartTermProps = StartTermLocalProps | StartTermSSHProps

interface TerminalOptions {
	fontSize?: number,
	fontFamily?: string
	closeOnDisconnect?: boolean
}
type useTerminalProps = TerminalOptions & ({ type: "local" } | ({ type: "SSH" } & SSHConnectProps))

interface useTerminalReturnProps {
	close: () => void
	closed: boolean
	start: () => void
}

export const useTerminal = (ref: React.RefObject<HTMLDivElement>, id: string, { type, ...props }: useTerminalProps): useTerminalReturnProps => {
	const { socket } = useContext(TerminalContext)
	const [terminal, setTerminal] = useState<Terminal | null>(null)
	const [closed, setClosed] = useState(true)

	const getStartTermProps = (terminal: Terminal): StartTermProps | null => {
		const { cols, rows } = terminal
		return type == "SSH" ? {
			type,
			id,
			host: (props as any).host,
			username: (props as any).username,
			password: (props as any).password,
			port: (props as any).port,
			size: { cols, rows },
			closeOnDisconnect: props.closeOnDisconnect
		} : {
			type,
			id,
			size: { cols, rows }
		}
	}

	useEffect(() => {
		const initTerminal = async () => {
			const { Terminal } = await import('xterm')
			const { FitAddon } = await import("xterm-addon-fit")

			const term = new Terminal({
				theme: FirefoxDevTheme,
				fontFamily: props.fontFamily || "Hack",
				fontSize: props.fontSize || 16
			})
			setTerminal(term)

			const fitAddon = new FitAddon();
			term.loadAddon(fitAddon);

			term.open(ref.current!)
			fitAddon.fit();

			const startTermProps = getStartTermProps(term)
			if (!startTermProps) return

			socket!.emit("__start-term__", startTermProps)
			socket!.on("__data__", ({ data, id }) => {
				if (id === startTermProps.id) {
					// term.focus()
					term.write(data)
				}
			})

			socket!.on("__connected__", ({ id: termId }) => {
				if (id === termId) setClosed(false)
			})

			socket!.on("__error__", ({ err, id: termId }) => {
				if (id == termId)
					console.log(err)
			})

			socket!.on("__closed__", ({ id: termId }) => {
				if (id === termId) {
					setClosed(true)
					console.log("connected closed")
				}
			})

			socket?.on("__not-allowed__", ({ id: termId }) => {
				if (termId === id) console.log("Access not allowed")
			})

			term.onData((d) => {
				socket!.emit("__data__", { id, d })
			})

			window.addEventListener("resize", () => {
				fitAddon.fit()
				socket!.emit("__resize__", ({ id, rows: term.rows, cols: term.cols }))
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

	const close = useCallback(() => {
		socket?.emit("__close__", { id })
		setClosed(true)
	}, [socket])

	const start = useCallback(() => {
		if (!closed || !terminal) return

		const startTermProps = getStartTermProps(terminal)
		if (!startTermProps) return

		socket?.emit("__start-term__", startTermProps)
		terminal.clear()
	}, [socket, terminal])

	return { close, closed, start }
}