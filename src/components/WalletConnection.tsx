
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

const supportedChains = [
  { name: 'Ethereum', id: 1, color: 'bg-blue-500' },
  { name: 'Arbitrum', id: 42161, color: 'bg-blue-400' },
  { name: 'Polygon', id: 137, color: 'bg-purple-500' },
  { name: 'Base', id: 8453, color: 'bg-blue-600' },
  { name: 'Avalanche', id: 43114, color: 'bg-red-500' },
  { name: 'OP Mainnet', id: 10, color: 'bg-red-400' },
  { name: 'Noble', id: 11111, color: 'bg-yellow-500' },
  { name: 'Agoric', id: 22222, color: 'bg-green-500' },
];

const WalletConnection: React.FC<WalletConnectionProps> = ({ isConnected, onConnect, onDisconnect }) => {
  const [selectedChain, setSelectedChain] = useState(supportedChains[0]);
  const [walletAddress] = useState('0x1234...5678');

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20">
          <div className={`w-2 h-2 rounded-full ${selectedChain.color} mr-2`}></div>
          {selectedChain.name}
        </Badge>
        <Button 
          variant="outline" 
          onClick={onDisconnect}
          className="bg-white/5 text-white border-white/20 hover:bg-white/10 hover:text-white"
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
      <DialogContent className="bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Connect Your Wallet</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose your preferred wallet and network
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3 text-white">Select Network</h3>
            <div className="grid grid-cols-2 gap-2">
              {supportedChains.map((chain) => (
                <Button
                  key={chain.id}
                  variant="outline"
                  className={selectedChain.id === chain.id 
                    ? "justify-start bg-blue-600 hover:bg-blue-700 text-white border-blue-500" 
                    : "justify-start bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
                  }
                  onClick={() => setSelectedChain(chain)}
                >
                  <div className={`w-3 h-3 rounded-full ${chain.color} mr-2`}></div>
                  {chain.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3 text-white">Select Wallet</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
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
                className="w-full justify-start bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnection;
