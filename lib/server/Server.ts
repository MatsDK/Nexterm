import { createServer } from "http";
import { Server, Socket } from "socket.io"

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

export class TerminalServer {
	#io: Server

	constructor({ port, clientUrl }: TerminalServerOptions) {
		const server = createServer()
		this.#io = new Server(server, {
			cors: {
				origin: clientUrl
			}
		})

		this.#io.on("connection", this.#handleConnection)

		server.listen(port ?? 2828, () => {
			console.log("server running on port", port ?? 2828)
		})
	}

	#handleConnection(socket: Socket) {
		socket.on("__start-term__", id => {
			socket.emit("__data__", "test-hello-world21")
		})

		socket.on("__data__", data => {
			console.log(data)
		})
	}
}