import { ConnectWalletButton, useAgoric } from "@agoric/react-components";
import { useEffect } from "react";

const WalletConnection = () => {
  const { purses } = useAgoric();

  useEffect(() => {
    if (purses) {
      console.log("Purse Balances:", purses);
    }
  }, [purses]);

  return (
    <ConnectWalletButton className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl" />
  );
};

export default WalletConnection;
