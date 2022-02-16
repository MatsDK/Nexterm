import { useTerminal } from "lib/client/useTerminal";
import React, { useRef } from "react";

const Index = (): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null)
  const ref1 = useRef<HTMLDivElement>(null)

  // const { close, start } = useTerminal(ref, "2", { type: "local" })
  // useTerminal(ref1, "2", { type: "local" })
  const { close, start } = useTerminal(ref1, "1", { type: "SSH", host: "192.168.0.164", username: "pi", password: "mats" })
  useTerminal(ref, "1", { type: "SSH", host: "192.168.0.164", username: "pi", password: "mats" })
  // useTerminal(ref1, "2", { type: "SSH", host: "192.168.0.164", username: "pi", password: "mats", fontSize: 12, closeOnDisconnect: true })

  return <div style={{ height: "100%" }}>
    <nav>
      <button onClick={start}>Start</button>
      <button onClick={close}>Close</button>
    </nav>

    <div ref={ref} style={{ height: "45%" }} />
    <div ref={ref1} style={{ height: "50%" }} />
  </div>
};

export default Index;
