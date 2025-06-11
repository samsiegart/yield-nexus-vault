
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Minus, Plus, Clock, Zap } from 'lucide-react';

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
}

const DepositInterface: React.FC<DepositInterfaceProps> = ({ 
  selectedStrategies, 
  onUpdateStrategies 
}) => {
  const [totalAmount, setTotalAmount] = useState(1000);
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

  const totalAllocated = selectedStrategies.reduce((sum, s) => sum + (s.amount || 0), 0);
  const estimatedGas = 0.0045; // ETH
  const estimatedTime = "2-5 min";

  const distributeFunds = () => {
    if (selectedStrategies.length === 0) return;
    
    const amountPerStrategy = totalAmount / selectedStrategies.length;
    const updated = selectedStrategies.map(s => ({ 
      ...s, 
      amount: Number(amountPerStrategy.toFixed(2))
    }));
    onUpdateStrategies(updated);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="deposit" className="data-[state=active]:bg-blue-600">
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="data-[state=active]:bg-purple-600">
            Withdraw
          </TabsTrigger>
          <TabsTrigger value="rebalance" className="data-[state=active]:bg-green-600">
            Rebalance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-6">
          {/* Amount Input */}
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle>Deposit Amount</CardTitle>
              <CardDescription className="text-gray-300">
                Total USDC to allocate across strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="amount" className="text-white">Amount (USDC)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="bg-white/10 border-white/20 text-white text-xl font-bold"
                    placeholder="1000"
                  />
                </div>
                <Button 
                  onClick={distributeFunds}
                  className="bg-blue-600 hover:bg-blue-700 mt-6"
                >
                  Auto Distribute
                </Button>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                Balance: $5,234.56 USDC
              </div>
            </CardContent>
          </Card>

          {/* Strategy Allocation */}
          {selectedStrategies.length > 0 && (
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Strategy Allocation</CardTitle>
                <CardDescription className="text-gray-300">
                  Customize how much to allocate to each strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedStrategies.map((strategy) => (
                  <div key={strategy.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{strategy.protocol}</div>
                      <div className="text-sm text-gray-400">{strategy.name} • {strategy.chain}</div>
                      <div className="text-sm text-green-400">{strategy.apy}% APY</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={strategy.amount || 0}
                        onChange={(e) => updateStrategyAmount(strategy.id, Number(e.target.value))}
                        className="w-32 bg-white/10 border-white/20 text-white"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-400">USDC</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeStrategy(strategy.id)}
                        className="text-red-400 border-red-400 hover:bg-red-400/10"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Separator className="bg-white/20" />

                <div className="flex justify-between items-center font-medium">
                  <span>Total Allocated:</span>
                  <span className={totalAllocated > totalAmount ? 'text-red-400' : 'text-green-400'}>
                    ${totalAllocated.toFixed(2)} USDC
                  </span>
                </div>
                
                {totalAllocated !== totalAmount && (
                  <div className="text-sm text-yellow-400">
                    Remaining: ${(totalAmount - totalAllocated).toFixed(2)} USDC
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transaction Summary */}
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 text-white">
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Total Deposit:</span>
                <span className="font-bold">${totalAllocated.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  Est. Gas Cost:
                </span>
                <span>${(estimatedGas * 2000).toFixed(2)} (${estimatedGas} ETH)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Est. Time:
                </span>
                <span>{estimatedTime}</span>
              </div>
              
              <Separator className="bg-white/20" />
              
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg font-semibold"
                disabled={totalAllocated === 0 || selectedStrategies.length === 0}
              >
                Confirm Deposit
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-6">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle>Your Positions</CardTitle>
              <CardDescription className="text-gray-300">
                Select positions to withdraw from
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentPositions.map((position) => (
                <div key={position.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-medium">{position.protocol}</div>
                    <div className="text-sm text-gray-400">
                      Deposited: ${position.amount} • Current: ${position.value}
                    </div>
                    <div className="text-sm text-green-400">{position.apy}% APY</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="border-white/20 text-white">
                      Withdraw All
                    </Button>
                    <Button variant="outline" size="sm" className="border-white/20 text-white">
                      Partial
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rebalance" className="space-y-6">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle>Rebalance Portfolio</CardTitle>
              <CardDescription className="text-gray-300">
                Optimize your allocation across strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  Rebalancing tools will automatically optimize your portfolio based on current yields and risk preferences.
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  Auto-Rebalance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DepositInterface;
