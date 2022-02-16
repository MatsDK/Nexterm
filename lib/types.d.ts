import { IPty } from "node-pty";
import type { Client, ClientChannel } from "ssh2";
export interface AllowSSHObject {
	port?: number
	host?: string
	username?: string
}

export type AllowedOption = Array<"SSH" | "local"> | { SSH?: boolean | AllowSSHObject | AllowSSHObject[], local?: boolean };

export interface TerminalServerOptions {
	port?: number
	allow: AllowedOption
	clientUrl: string
}

export type Type = "SSH" | "local"

export interface TermSession {
	type: Type
	socket: Socket | null
	ptyClient: IPty | null
	stream: ClientChannel | null
	client: Client | null
	state: string
}

export interface SSHConnectProps {
	password: string
	username: string
	port?: number
	host: string
}

export type Size = { rows: number, cols: number }
export type DefaultStartTermProps = { size: Size, id: string, closeOnDisconnect?: boolean }

export type StartTermLocalProps = ({ type: "local" } & DefaultStartTermProps)
export type StartTermSSHProps = ({ type: "SSH" } & DefaultStartTermProps & SSHConnectProps)
export type StartTermProps = StartTermLocalProps | StartTermSSHProps