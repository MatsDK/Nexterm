import { useTerminal } from "lib/client/useTerminal";
import React, { useRef } from "react";

const Index = (): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null)

  useTerminal(ref, "1")

  return <div ref={ref} style={{ width: "100%" }} />
};

export default Index;
