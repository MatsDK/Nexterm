import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Client } from "ssh2";

interface AllowSSHObject {
	port: number
	ip: string
}

type AllowedOption = Array<"SSH" | "local"> | { SSH: boolean | AllowSSHObject, local: boolean };

interface TerminalServerOptions {
	port?: number
	allow: AllowedOption
	clientUrl: string
}

type Type = "SSH" | "local"

interface TermSession {
	type: Type
	socket: Socket
}

interface CreateSessionProps {
	id: string
	type: Type
	password: string
	username: string
	port?: number
	host: string
	size: { rows: number, cols: number }
}

export class TerminalServer {
	#io: Server
	#sessions: Map<string, TermSession>

	constructor({ port, clientUrl }: TerminalServerOptions) {
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
			socket.on("__start-term__", (d) => {
				if (!this.#sessions.has(d.id)) this.#createSession(d, socket)

				this.#sessions.get(d.id)!.socket = socket
			})
		}
	}

	#createSession({ id, type, size, ...rest }: CreateSessionProps, socket: Socket): TermSession {
		const thisSession: TermSession = {
			type,
			socket
		}
		this.#sessions.set(id, thisSession);

		if (type === "SSH") {
			const client = new Client()

			const { host, password, username, port = 22 } = rest

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

					stream.on("exit", () => socket.emit("__closed__"))

					socket.emit("__connected__")

					socket.on("__data__", (d: string) => {
						stream.write(d.toString())
					})

					stream.on("data", (d: string) => {
						socket.emit("__data__", d.toString())
					})
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
}