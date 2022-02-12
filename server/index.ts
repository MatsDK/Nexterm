import { TerminalServer } from "../lib/server/Server";

const term = new TerminalServer({
	allow: {
		SSH: {
			host: "192.168.0.164",
			username: "pi"
		}
	},
	clientUrl: "http://localhost:3000"
})

console.log(term)