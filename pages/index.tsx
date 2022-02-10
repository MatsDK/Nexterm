import { useTerminal } from "lib/client/useTerminal";
import React, { useRef } from "react";

const Index = (): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null)

  // useTerminal(ref, "2", { type: "local" })
  useTerminal(ref, "1", { type: "SSH", host: "192.168.0.164", username: "root", password: "mats" })

  return <div ref={ref} style={{ width: "100%" }} />
};

export default Index;
