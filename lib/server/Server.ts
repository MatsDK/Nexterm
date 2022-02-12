import { createServer } from "http";
import { TermSession, AllowedOption, TerminalServerOptions, StartTermProps, StartTermSSHProps, AllowSSHObject } from "lib/types";
import { Server, Socket } from "socket.io";
import { Client } from "ssh2";

export class TerminalServer {
	#io: Server
	#sessions: Map<string, TermSession>
	allow: AllowedOption

	constructor({ port, clientUrl, allow }: TerminalServerOptions) {
		this.allow = allow
		this.#sessions = new Map()

		const server = createServer()
		this.#io = new Server(server, {
			cors: {
				origin: clientUrl
			}
		})

		this.#io.on("connection", this.#handleConnection())

		server.listen(port ?? 2828, () => console.log("server running on port", port ?? 2828))
	}

	#handleConnection() {
		return (socket: Socket) => {
			socket.on("__start-term__", (d: StartTermProps) => {
				console.log(d)
				if (!this.#sessions.has(d.id)) this.#createSession(d, socket)
				else {
					this.#sessions.get(d.id)!.socket = socket
					this.#attachMethods(d.id, true);
				}
			})
		}
	}

	#createSession(props: StartTermProps, socket: Socket): TermSession | null {
		const { id, type, size, ...rest } = props
		const thisSession: TermSession = {
			type,
			socket,
			state: "",
			stream: null
		}
		this.#sessions.set(id, thisSession);

		if (type === "SSH") {
			if (!this.#accessAllowedToConnect(props as StartTermSSHProps)) {
				thisSession.socket.emit("__not-allowed__")
				return null
			}

			const client = new Client()

			const { host, password, username, port = 22 } = rest as StartTermSSHProps

			client.on("timeout", () => thisSession.socket.emit("__error__", `Connection to ${username}@${host} timed out`))
			client.on("error", (err) => thisSession.socket.emit("__error__", err.message));

			client.on("end", () => socket.emit("__closed__"))
			client.on("close", () => socket.emit("__closed__"))

			client.on("ready", () => {
				client.shell(size, async (err, stream) => {
					if (err) {
						socket.emit("__error__", err.message)
						return
					}

					thisSession.stream = stream
					this.#attachMethods(id)
				})
			})


			client.connect({
				username,
				password,
				host,
				port,
			})

			console.log(id)
		}

		return thisSession
	}

	#attachMethods(id: string, emitState: boolean = false) {
		let { stream, socket, state } = this.#sessions.get(id)!
		if (!stream || !socket) return null

		stream!.on("exit", () => socket.emit("__closed__"))

		socket.emit("__connected__")

		socket.on("__data__", ({ d, id: termId }) => {
			if (id == termId) stream!.write(d.toString())
		})

		if (emitState) socket.emit("__data__", { data: state, id })

		socket.on("__resize__", ({ id: termId, rows, cols }) => {
			if (id === termId) stream!.setWindow(rows, cols, 0, 0)
		})

		stream!.on("data", (d: string) => {
			this.#sessions.get(id)!.state += (d.toString())

			socket.emit("__data__", { data: d.toString(), id })
		})

		socket.on("disconnect", (_r: string) => {
			stream?.removeAllListeners("data")
		})
	}

	#accessAllowedToConnect({ username, host, port = 22, type }: StartTermSSHProps): boolean {
		if (!this.allow) return true

		if (Array.isArray(this.allow)) return this.allow.includes(type)

		if (!("SSH" in this.allow) || this.allow.SSH == undefined) return true
		if (typeof this.allow.SSH === "boolean") return this.allow.SSH

		const sshConnAllowed = (SSHObj: AllowSSHObject): boolean => {
			if (SSHObj.username != null && username !== SSHObj.username) return false
			if (SSHObj.port != null && port !== SSHObj.port) return false
			if (SSHObj.host != null && host !== SSHObj.host) return false

			return true
		}

		if (Array.isArray(this.allow.SSH)) return this.allow.SSH.some((v) => sshConnAllowed(v))


		return sshConnAllowed(this.allow.SSH)
	}
}