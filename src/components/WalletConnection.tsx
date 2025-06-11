
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Wallet } from 'lucide-react';

interface WalletConnectionProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ isConnected, onConnect, onDisconnect }) => {
  const [walletAddress] = useState('0x1234...5678');

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          onClick={onDisconnect}
          className="bg-slate-800/50 text-white border-slate-600 hover:bg-slate-700 hover:text-white"
        >
          {walletAddress}
        </Button>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Connect Your Wallet</DialogTitle>
          <DialogDescription className="text-slate-400">
            Choose your preferred wallet to get started
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white"
            onClick={() => {
              onConnect();
            }}
          >
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEyIiBoZWlnaHQ9IjE4OSIgdmlld0JveD0iMCAwIDIxMiAxODkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xXzIpIj4KPHBhdGggZD0iTTE5NC4wNjggMTM3LjY5NEwyMDcuNDc1IDEzLjI4OEwyMDguMjM5IDhIMTU5LjI4M0wxNDcuNzc1IDczLjU3NzJMMTM1LjkxMyA4SDE4Ny4xNzJWMEg3MC4zOTEyVjhIMTMxLjAwOUwxNDIuODcxIDczLjU3NzJMMTM1LjkxMyAxMzdIMTU5LjY0MUwxODYuMzY4IDEzNy42OTRIMTk0LjA2OFoiIGZpbGw9IiNGNjhCMUYiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xXzIiPgo8cmVjdCB3aWR0aD0iMjEyIiBoZWlnaHQ9IjE4OSIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K" 
              alt="MetaMask" 
              className="w-6 h-6 mr-3"
            />
            MetaMask
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white"
            onClick={() => {
              onConnect();
            }}
          >
            <div className="w-6 h-6 mr-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded flex items-center justify-center text-xs font-bold text-white">
              K
            </div>
            Keplr Wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnection;
