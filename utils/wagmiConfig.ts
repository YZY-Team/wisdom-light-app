import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { bsc } from "wagmi/chains";
export const wagmiConfig = getDefaultConfig({
  appName: "EVO AI ANGEL",
  projectId: "cdc4f12f66f3c34cb8d69691b8602fb7",
  chains: [bsc],

  transports: {
    [bsc.id]: http('https://go.getblock.io/f5cf0de61e9440be80e1dd8fb5a32e61'),
  },
});
