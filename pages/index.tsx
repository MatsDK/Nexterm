import { useTerminal } from "lib/client/useTerminal";
import React, { useRef } from "react";

const Index = (): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null)
  const ref1 = useRef<HTMLDivElement>(null)

  // useTerminal(ref, "2", { type: "local" })
  useTerminal(ref, "1", { type: "SSH", host: "192.168.0.164", username: "pi", password: "mats" })
  useTerminal(ref1, "2", { type: "SSH", host: "192.168.0.164", username: "pi", password: "mats" })

  return <div style={{ height: "100%" }}>
    <nav>
      <button>Start</button>
    </nav>

    <div ref={ref} style={{ height: "45%" }} />
    <div ref={ref1} style={{ height: "25%" }} />
  </div>
};

export default Index;
