import * as React from "react";
import { TerminalProvider } from "../lib"
import { AppProps } from "next/app";
import "node_modules/xterm/css/xterm.css";

import "../css/global.css";

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <div>
      <TerminalProvider socket={{ endPoint: "http://127.0.0.1:2828" }}>
        <Component {...pageProps} />
      </TerminalProvider>
    </div>
  );
}
