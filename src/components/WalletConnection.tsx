import { ConnectWalletButton, useAgoric } from "@agoric/react-components";
import { useEffect } from "react";

const WalletConnection = () => {
  const { purses } = useAgoric();

  useEffect(() => {
    if (purses) {
      console.log("Purse Balances:", purses);
    }
  }, [purses]);

  return <ConnectWalletButton />;
};

export default WalletConnection;
