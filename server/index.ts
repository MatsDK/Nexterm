import { TerminalServer } from "../lib/server/Server";

const term = new TerminalServer({
	allow: ["SSH", "local"],
	clientUrl: "http://localhost:3000"
})

console.log(term)