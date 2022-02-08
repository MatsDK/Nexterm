import { useTerminal } from "lib/client/useTerminal";
import React, { useRef } from "react";

const Index = (): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null)

  useTerminal(ref, "1")

  return <div ref={ref} />
};

export default Index;
