
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, Minus, Plus, Clock, Zap, Wallet } from 'lucide-react';

interface Strategy {
  id: string;
  protocol: string;
  name: string;
  apy: number;
  chain: string;
  amount?: number;
}

interface DepositInterfaceProps {
  selectedStrategies: Strategy[];
  onUpdateStrategies: (strategies: Strategy[]) => void;
  walletConnected: boolean;
  onConnectWallet: () => void;
}

const supportedChains = [
  { name: 'Ethereum', id: 1 },
  { name: 'Arbitrum', id: 42161 },
  { name: 'Polygon', id: 137 },
  { name: 'Base', id: 8453 },
  { name: 'Avalanche', id: 43114 },
  { name: 'OP Mainnet', id: 10 },
  { name: 'Noble', id: 11111 },
  { name: 'Agoric', id: 22222 },
];

const allStrategies = [
  { id: 'aave-eth', protocol: 'Aave', name: 'USDC Lending', apy: 4.2, chain: 'Ethereum' },
  { id: 'compound-eth', protocol: 'Compound', name: 'USDC Supply', apy: 3.8, chain: 'Ethereum' },
  { id: 'yearn-eth', protocol: 'Yearn v3', name: 'USDC Vault', apy: 6.5, chain: 'Ethereum' },
  { id: 'beefy-polygon', protocol: 'Beefy', name: 'USDC Auto-Compound', apy: 7.8, chain: 'Polygon' },
  { id: 'radiant-arbitrum', protocol: 'Radiant Capital', name: 'USDC Lending', apy: 5.4, chain: 'Arbitrum' },
  { id: 'notion-base', protocol: 'Notion', name: 'USDC Liquidity Pool', apy: 8.9, chain: 'Base' },
];

const DepositInterface: React.FC<DepositInterfaceProps> = ({ 
  selectedStrategies, 
  onUpdateStrategies,
  walletConnected,
  onConnectWallet
}) => {
  const [selectedChain, setSelectedChain] = useState('1');
  const [currentPositions] = useState([
    { id: 'aave-eth', protocol: 'Aave', amount: 2500, value: 2563.50, apy: 4.2 },
    { id: 'yearn-eth', protocol: 'Yearn v3', amount: 1800, value: 1847.20, apy: 6.5 }
  ]);

  const updateStrategyAmount = (strategyId: string, amount: number) => {
    const updated = selectedStrategies.map(s => 
      s.id === strategyId ? { ...s, amount } : s
    );
    onUpdateStrategies(updated);
  };

  const removeStrategy = (strategyId: string) => {
    const filtered = selectedStrategies.filter(s => s.id !== strategyId);
    onUpdateStrategies(filtered);
  };

  const addStrategy = (strategy: Strategy) => {
    const newStrategy = { ...strategy, amount: 0 };
    onUpdateStrategies([...selectedStrategies, newStrategy]);
  };

  const totalAllocated = selectedStrategies.reduce((sum, s) => sum + (s.amount || 0), 0);
  const estimatedGas = 0.0045; // ETH
  const estimatedTime = "2-5 min";

  const availableStrategies = allStrategies.filter(
    strategy => !selectedStrategies.find(s => s.id === strategy.id)
  );

  const WalletConnectPrompt = () => (
    <Card className="bg-slate-800/40 border-slate-600">
      <CardContent className="text-center py-12">
        <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-slate-300 mb-6">Connect your wallet to start managing your positions</p>
        <Button 
          onClick={onConnectWallet}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-slate-600">
          <TabsTrigger 
            value="deposit" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 border-0"
          >
            Deposit
          </TabsTrigger>
          <TabsTrigger 
            value="withdraw" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300 border-0"
          >
            Withdraw
          </TabsTrigger>
          <TabsTrigger 
            value="rebalance" 
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-slate-300 border-0"
          >
            Rebalance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-6">
          {!walletConnected ? (
            <WalletConnectPrompt />
          ) : (
            <>
              {/* Chain Selection */}
              <Card className="bg-slate-800/40 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Select Chain</CardTitle>
                  <CardDescription className="text-slate-300">
                    Choose which blockchain to deploy your strategies on
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedChain} onValueChange={setSelectedChain}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select a chain" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {supportedChains.map((chain) => (
                        <SelectItem key={chain.id} value={chain.id.toString()} className="text-white hover:bg-slate-700">
                          {chain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Strategy Allocation */}
              <Card className="bg-slate-800/40 border-slate-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Strategy Allocation</CardTitle>
                      <CardDescription className="text-slate-300">
                        Add strategies and specify deposit amounts
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Strategy
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Add Strategy</DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Choose a strategy to add to your allocation
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          {availableStrategies.map((strategy) => (
                            <Button
                              key={strategy.id}
                              variant="outline"
                              className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white"
                              onClick={() => addStrategy(strategy)}
                            >
                              <div className="text-left">
                                <div className="font-medium">{strategy.protocol}</div>
                                <div className="text-sm text-slate-400">{strategy.name} • {strategy.chain} • {strategy.apy}% APY</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedStrategies.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      No strategies selected. Click "Add Strategy" to get started.
                    </div>
                  ) : (
                    selectedStrategies.map((strategy) => (
                      <div key={strategy.id} className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-white">{strategy.protocol}</div>
                          <div className="text-sm text-slate-400">{strategy.name} • {strategy.chain}</div>
                          <div className="text-sm text-green-400">{strategy.apy}% APY</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={strategy.amount || 0}
                            onChange={(e) => updateStrategyAmount(strategy.id, Number(e.target.value))}
                            className="w-32 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                            placeholder="0"
                          />
                          <span className="text-sm text-slate-400">USDC</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeStrategy(strategy.id)}
                            className="bg-transparent text-red-400 border-red-400 hover:bg-red-400/10 hover:text-red-300"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}

                  {selectedStrategies.length > 0 && (
                    <>
                      <Separator className="bg-slate-600" />
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-white">Total Deposit:</span>
                        <span className="text-green-400">${totalAllocated.toFixed(2)} USDC</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Transaction Summary */}
              {totalAllocated > 0 && (
                <Card className="bg-slate-800/60 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white">Transaction Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Total Deposit:</span>
                      <span className="font-bold text-white">${totalAllocated.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center text-slate-300">
                        <Zap className="w-4 h-4 mr-1" />
                        Est. Gas Cost:
                      </span>
                      <span className="text-slate-300">${(estimatedGas * 2000).toFixed(2)} (${estimatedGas} ETH)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center text-slate-300">
                        <Clock className="w-4 h-4 mr-1" />
                        Est. Time:
                      </span>
                      <span className="text-slate-300">{estimatedTime}</span>
                    </div>
                    
                    <Separator className="bg-slate-600" />
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg font-semibold text-white border-0"
                      disabled={totalAllocated === 0 || selectedStrategies.length === 0}
                    >
                      Confirm Deposit
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-6">
          {!walletConnected ? (
            <WalletConnectPrompt />
          ) : (
            <Card className="bg-slate-800/40 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Your Positions</CardTitle>
                <CardDescription className="text-slate-300">
                  Select positions to withdraw from
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentPositions.map((position) => (
                  <div key={position.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{position.protocol}</div>
                      <div className="text-sm text-slate-400">
                        Deposited: ${position.amount} • Current: ${position.value}
                      </div>
                      <div className="text-sm text-green-400">{position.apy}% APY</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:text-white"
                      >
                        Withdraw All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:text-white"
                      >
                        Partial
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rebalance" className="space-y-6">
          {!walletConnected ? (
            <WalletConnectPrompt />
          ) : (
            <Card className="bg-slate-800/40 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Rebalance Portfolio</CardTitle>
                <CardDescription className="text-slate-300">
                  Optimize your allocation across strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-slate-400 mb-4">
                    Rebalancing tools will automatically optimize your portfolio based on current yields and risk preferences.
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700 text-white border-0">
                    Auto-Rebalance
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DepositInterface;
