import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  Minus,
  Plus,
  Clock,
  Zap,
  Wallet,
  X,
  AlertTriangle,
  RotateCcw,
  Scale,
} from "lucide-react";
import { useAgoric, AmountInput } from "@agoric/react-components";
import WalletConnection from "@/components/WalletConnection";
import { usePortfolioStore } from "@/store";
import { stringifyValue } from "@agoric/web-components";
import {
  makeAgoricChainStorageWatcher,
  AgoricChainStoragePathKind as Kind,
} from "@agoric/rpc";
import { useToast } from "@/hooks/use-toast";

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

// Supported strategies – others will be added later
const allStrategies: Strategy[] = [
  {
    id: "aave-eth",
    protocol: "AAVE",
    name: "USDC",
    apy: 14.0,
    chain: "Ethereum",
  },
  {
    id: "compound-eth",
    protocol: "Compound",
    name: "USDC",
    apy: 4.0,
    chain: "Ethereum",
  },
  {
    id: "noble-usdn",
    protocol: "Noble",
    name: "USDN",
    apy: 0,
    chain: "Noble",
  },
];

const supportedChains = [
  { id: "agoric", name: "Agoric", available: true },
  { id: "1", name: "Ethereum", available: false },
  { id: "137", name: "Polygon", available: false },
  { id: "42161", name: "Arbitrum", available: false },
  { id: "10", name: "Optimism", available: false },
];

const DepositInterface: React.FC<DepositInterfaceProps> = ({
  selectedStrategies,
  onUpdateStrategies,
}) => {
  const {
    walletConnection,
    purses,
    chainStorageWatcher: watcher,
  } = useAgoric();
  const { positions } = usePortfolioStore();
  const { toast } = useToast();
  const [selectedChain, setSelectedChain] = useState("agoric");
  const [withdrawAmounts, setWithdrawAmounts] = useState<{
    [key: string]: number;
  }>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [rebalanceAmounts, setRebalanceAmounts] = useState<{
    [key: string]: number;
  }>({});
  const [rebalanceMode, setRebalanceMode] = useState<"percentage" | "dollar">(
    "percentage"
  );
  const [totalDepositAmount, setTotalDepositAmount] = useState<bigint>(0n);
  const [balanceEvenly, setBalanceEvenly] = useState(true);

  // ------------------------------------------------------------------
  // OfferUp (ymax0) chain data
  // ------------------------------------------------------------------
  const [ymaxInstance, setYmaxInstance] = useState<unknown>();
  const [brands, setBrands] = useState<Record<string, unknown>>();

  // Initialise a chain storage watcher once on mount
  useEffect(() => {
    // Watch for ymax0/offerUp instance
    const stopInstances = watcher.watchLatest<Array<[string, unknown]>>(
      [Kind.Data, "published.agoricNames.instance"],
      (entries) => {
        const found = entries.find(([name]) => name === "ymax0");
        if (found) {
          console.debug("ymax0 instance found", found);
          setYmaxInstance(found[1]);
        }
      }
    );

    // Watch for brands
    const stopBrands = watcher.watchLatest<Array<[string, unknown]>>(
      [Kind.Data, "published.agoricNames.brand"],
      (entries) => {
        console.debug("brands found", entries);
        setBrands(Object.fromEntries(entries));
      }
    );

    return () => {
      stopInstances();
      stopBrands();
    };
  }, [watcher]);

  // Get USDC balance from purses
  const getUSDCBalance = () => {
    if (!purses) return null;

    // Look for USDC purse in the purses
    const usdcPurse = purses.find(
      (purse) => purse.brandPetname?.toLowerCase() === "usdc"
    );

    return usdcPurse || null;
  };

  const usdcPurse = getUSDCBalance();
  const isAmountInvalid =
    usdcPurse && totalDepositAmount > usdcPurse.currentAmount.value;

  // Initialize rebalance amounts with current positions when component mounts
  useEffect(() => {
    const initialRebalanceAmounts: { [key: string]: number } = {};
    positions.forEach((position) => {
      initialRebalanceAmounts[position.id] =
        rebalanceMode === "percentage" ? position.percentage : position.value;
    });
    setRebalanceAmounts(initialRebalanceAmounts);
  }, [positions, rebalanceMode]);

  const updateStrategyAmount = (strategyId: string, amount: number) => {
    const updated = selectedStrategies.map((s) =>
      s.id === strategyId ? { ...s, amount } : s
    );
    onUpdateStrategies(updated);
  };

  const removeStrategy = (strategyId: string) => {
    const filtered = selectedStrategies.filter((s) => s.id !== strategyId);
    onUpdateStrategies(filtered);
  };

  const addStrategy = (strategy: Strategy) => {
    let newStrategy: Strategy;

    if (selectedStrategies.length === 0) {
      // First strategy gets 100%
      newStrategy = { ...strategy, amount: 100 };
    } else {
      // Additional strategies get 0% initially
      newStrategy = { ...strategy, amount: 0 };
    }

    const updatedStrategies = [...selectedStrategies, newStrategy];
    onUpdateStrategies(updatedStrategies);
    setShowAddDialog(false);
  };

  const balanceStrategiesEvenly = () => {
    if (selectedStrategies.length === 0) return;

    const equalPercentage = 100 / selectedStrategies.length;
    const updated = selectedStrategies.map((s) => ({
      ...s,
      amount: equalPercentage,
    }));
    onUpdateStrategies(updated);
  };

  const balancePositionsEvenly = () => {
    if (positions.length === 0) return;

    const equalAmount =
      rebalanceMode === "percentage"
        ? 100 / positions.length
        : positions.reduce((sum, pos) => sum + pos.value, 0) / positions.length;

    const updatedRebalanceAmounts: { [key: string]: number } = {};
    positions.forEach((position) => {
      updatedRebalanceAmounts[position.id] = equalAmount;
    });
    setRebalanceAmounts(updatedRebalanceAmounts);
  };

  const resetToCurrentAllocation = () => {
    const currentRebalanceAmounts: { [key: string]: number } = {};
    positions.forEach((position) => {
      currentRebalanceAmounts[position.id] =
        rebalanceMode === "percentage" ? position.percentage : position.value;
    });
    setRebalanceAmounts(currentRebalanceAmounts);
  };

  const updateWithdrawAmount = (positionId: string, amount: number) => {
    setWithdrawAmounts((prev) => ({
      ...prev,
      [positionId]: amount,
    }));
  };

  const updateRebalanceAmount = (positionId: string, amount: number) => {
    setRebalanceAmounts((prev) => ({
      ...prev,
      [positionId]: amount,
    }));
  };

  const totalPercentage = selectedStrategies.reduce(
    (sum, s) => sum + (s.amount || 0),
    0
  );

  const totalWithdrawing = Object.values(withdrawAmounts).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const totalRebalancing = Object.values(rebalanceAmounts).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const estimatedGas = 0.0045;
  const estimatedTime = "2-5 min";

  const availableStrategies = allStrategies.filter(
    (strategy) => !selectedStrategies.find((s) => s.id === strategy.id)
  );

  // Check if rebalance allocation is valid
  const isRebalanceValid = () => {
    if (rebalanceMode === "percentage") {
      return Math.abs(totalRebalancing - 100) < 0.01; // Allow small floating point errors
    } else {
      const totalCurrentValue = positions.reduce(
        (sum, pos) => sum + pos.value,
        0
      );
      return Math.abs(totalRebalancing - totalCurrentValue) < 0.01;
    }
  };

  // Check if rebalance amounts have changed from current allocation
  const hasRebalanceChanged = () => {
    return positions.some((position) => {
      const currentAmount =
        rebalanceMode === "percentage" ? position.percentage : position.value;
      const newAmount = rebalanceAmounts[position.id] || 0;
      return Math.abs(currentAmount - newAmount) > 0.01;
    });
  };

  //-------------------------------------------------------------------
  // Deposit – makeOffer to OfferUp
  //-------------------------------------------------------------------
  const handleConfirmDeposit = () => {
    if (!walletConnection) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
      });
      return;
    }
    if (!ymaxInstance) {
      toast({
        title: "Contract not found",
        description: "ymax instance not available on chain.",
      });
      return;
    }
    if (!brands?.USDC) {
      toast({
        title: "Missing brand",
        description: "Required brand (USDC) is not available.",
      });
      return;
    }
    if (totalDepositAmount === 0n) {
      toast({
        title: "Invalid amount",
        description: "Please enter a non-zero amount.",
      });
      return;
    }

    // Get brand from purses
    // XXX: Workaround for mismatching brand board ID in agoricNames.brand
    // XXX: Remove this once the issue is fixed
    const getPoc26Brand = () => {
      if (!purses) return null;

      // Look for PoC26 purse in the purses
      const poc26Purse = purses.find(
        (purse) => purse.brandPetname?.toLowerCase() === "poc26"
      );

      return poc26Purse?.brand;
    };
    const poc26Brand = getPoc26Brand();
    if (!poc26Brand) {
      toast({
        title: "Missing brand",
        description: "Required brand (PoC26) is not available in purses.",
      });
      return;
    }

    const offerId = Date.now();
    const giveValue = totalDepositAmount;
    const give = {
      USDN: { brand: brands.USDC, value: giveValue },
      Access: { brand: poc26Brand, value: 1n },
    };

    try {
      walletConnection.makeOffer(
        {
          source: "contract",
          instance: ymaxInstance as unknown,
          publicInvitationMaker: "makeOpenPortfolioInvitation",
        },
        { give },
        { usdnOut: (giveValue * 99n) / 100n },
        (update: { status: string; data?: unknown }) => {
          console.log("Deposit offer update", update);
          toast({
            title: `Offer ${update.status}`,
            description: JSON.stringify(update.data ?? {}, null, 2),
          });
        },
        offerId
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Offer error", description: message });
    }
  };

  const WalletConnectPrompt = () => (
    <Card className="bg-slate-800/60 border-slate-700">
      <CardContent className="text-center py-12">
        <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-slate-300 mb-6">
          Connect your wallet to start managing your positions
        </p>
        <WalletConnection />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {!walletConnection ? (
        <WalletConnectPrompt />
      ) : (
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/60 border-slate-700">
            <TabsTrigger
              value="deposit"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Deposit
            </TabsTrigger>
            <TabsTrigger
              value="reallocate"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300"
            >
              Reallocate
            </TabsTrigger>
            <TabsTrigger
              value="withdraw"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-300"
            >
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-6">
            {/* Strategy Selection */}
            <Card className="bg-slate-800/60 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">
                      Select Strategies
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Choose which yield strategies to allocate your funds to
                    </CardDescription>
                  </div>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Strategy
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          Add Strategy
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Choose from available strategies
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {availableStrategies.map((strategy) => (
                          <Button
                            key={strategy.id}
                            variant="outline"
                            className="w-full justify-start bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:text-white"
                            onClick={() => addStrategy(strategy)}
                          >
                            <div className="text-left">
                              <div className="font-medium">
                                {strategy.protocol}
                              </div>
                              <div className="text-sm text-slate-400">
                                {strategy.name} • {strategy.chain} •{" "}
                                {strategy.apy}% APY
                              </div>
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
                  <>
                    {selectedStrategies.length > 1 && (
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={balanceStrategiesEvenly}
                          className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                        >
                          <Scale className="w-4 h-4 mr-2" />
                          Balance Evenly
                        </Button>
                      </div>
                    )}

                    {selectedStrategies.map((strategy) => (
                      <div
                        key={strategy.id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {strategy.protocol} {strategy.name}
                          </div>
                          <div className="text-sm text-slate-400">
                            {strategy.chain} • {strategy.apy}% APY
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={strategy.amount || 0}
                              onChange={(e) =>
                                updateStrategyAmount(
                                  strategy.id,
                                  Number(e.target.value)
                                )
                              }
                              className="w-20 bg-slate-700/50 border-slate-600 text-white text-center"
                              placeholder="0"
                              max={100}
                            />
                            <span className="text-sm text-slate-400">%</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeStrategy(strategy.id)}
                            className="bg-transparent text-red-400 border-red-400 hover:bg-red-400/10 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Funding */}
            <Card className="bg-slate-800/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Add Funds</CardTitle>
                <CardDescription className="text-slate-300">
                  Choose which blockchain your USDC is on and specify the total
                  amount to deposit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="funding-chain" className="text-white">
                    Funding Chain
                  </Label>
                  <Select
                    value={selectedChain}
                    onValueChange={setSelectedChain}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Select a chain" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {supportedChains.map((chain) => (
                        <SelectItem
                          key={chain.id}
                          value={chain.id}
                          className={`${
                            chain.available
                              ? "text-white hover:bg-slate-700"
                              : "text-slate-500 cursor-not-allowed"
                          }`}
                          disabled={!chain.available}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{chain.name}</span>
                            {!chain.available && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deposit-amount" className="text-white">
                    Total Amount (USDC)
                  </Label>
                  <div className="space-y-2">
                    {selectedChain === "agoric" && usdcPurse ? (
                      <>
                        <AmountInput
                          decimalPlaces={6}
                          value={totalDepositAmount}
                          onChange={(value: bigint) =>
                            setTotalDepositAmount(value)
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                        />
                        {isAmountInvalid && (
                          <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 text-sm">
                              Insufficient balance.
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <Input
                        id="deposit-amount"
                        type="number"
                        value={stringifyValue(totalDepositAmount, "nat", 6)}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (!isNaN(value)) {
                            setTotalDepositAmount(
                              BigInt(Math.floor(value * 1_000_000))
                            );
                          }
                        }}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                        placeholder="0"
                      />
                    )}
                    {selectedChain === "agoric" && usdcPurse && (
                      <div>
                        <span className="text-slate-400">
                          Available Balance:{" "}
                        </span>
                        <span className="text-white font-medium">
                          {stringifyValue(
                            usdcPurse.currentAmount.value,
                            "nat",
                            6
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            {selectedStrategies.length > 0 && (
              <Card className="bg-slate-800/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Deposit Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total Deposit:</span>
                    <span className="font-bold text-white">
                      ${stringifyValue(totalDepositAmount, "nat", 6)} USDC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center text-slate-300">
                      <Zap className="w-4 h-4 mr-1" />
                      Est. Gas Cost:
                    </span>
                    <span className="text-slate-300">
                      ${(estimatedGas * 2000).toFixed(2)} (${estimatedGas} ETH)
                    </span>
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
                    disabled={
                      totalDepositAmount === 0n ||
                      selectedStrategies.length === 0 ||
                      totalPercentage !== 100 ||
                      isAmountInvalid
                    }
                    onClick={handleConfirmDeposit}
                  >
                    Confirm Deposit
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  {totalPercentage !== 100 && (
                    <p className="text-red-400 text-sm text-center">
                      Percentages must add up to 100%
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reallocate" className="space-y-6">
            {/* Rebalance Mode Toggle */}
            <Card className="bg-slate-800/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Rebalance Mode</CardTitle>
                <CardDescription className="text-slate-300">
                  Choose how to specify your target allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button
                    variant={
                      rebalanceMode === "percentage" ? "default" : "outline"
                    }
                    onClick={() => setRebalanceMode("percentage")}
                    className={
                      rebalanceMode === "percentage"
                        ? "bg-purple-600 hover:bg-purple-700 text-white border-0"
                        : "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                    }
                  >
                    Percentage
                  </Button>
                  <Button
                    variant={rebalanceMode === "dollar" ? "default" : "outline"}
                    onClick={() => setRebalanceMode("dollar")}
                    className={
                      rebalanceMode === "dollar"
                        ? "bg-purple-600 hover:bg-purple-700 text-white border-0"
                        : "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                    }
                  >
                    Dollar Amount
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Allocation */}
            <Card className="bg-slate-800/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Current Allocation</CardTitle>
                <CardDescription className="text-slate-300">
                  Adjust your current position allocations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {positions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No active positions to reallocate.
                  </div>
                ) : (
                  <>
                    {positions.length > 1 && (
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetToCurrentAllocation}
                          className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset to Current
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={balancePositionsEvenly}
                          className="bg-purple-600 hover:bg-purple-700 text-white border-0"
                        >
                          <Scale className="w-4 h-4 mr-2" />
                          Balance Evenly
                        </Button>
                      </div>
                    )}

                    {positions.map((position) => (
                      <div
                        key={position.id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {position.protocol} {position.name}
                          </div>
                          <div className="text-sm text-slate-400">
                            {position.chain} • {position.apy}% APY • $
                            {position.value.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={rebalanceAmounts[position.id] || 0}
                              onChange={(e) =>
                                updateRebalanceAmount(
                                  position.id,
                                  Number(e.target.value)
                                )
                              }
                              className="w-32 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
                              placeholder="0"
                            />
                            <span className="text-sm text-slate-400">
                              {rebalanceMode === "dollar" ? "USDC" : "%"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {!isRebalanceValid() && (
                      <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm">
                          {rebalanceMode === "percentage"
                            ? `Allocation must equal 100% (currently ${totalRebalancing.toFixed(
                                1
                              )}%)`
                            : `Total must equal current portfolio value (currently ${totalRebalancing.toFixed(
                                2
                              )} USDC)`}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Rebalance Summary */}
            {totalRebalancing > 0 && (
              <Card className="bg-slate-800/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Rebalance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total Target:</span>
                    <span className="font-bold text-white">
                      {rebalanceMode === "dollar"
                        ? `$${totalRebalancing.toFixed(2)} USDC`
                        : `${totalRebalancing.toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center text-slate-300">
                      <Zap className="w-4 h-4 mr-1" />
                      Est. Gas Cost:
                    </span>
                    <span className="text-slate-300">
                      ${(estimatedGas * 2000).toFixed(2)} (${estimatedGas} ETH)
                    </span>
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
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 h-12 text-lg font-semibold text-white border-0"
                    disabled={
                      totalRebalancing === 0 ||
                      !isRebalanceValid() ||
                      !hasRebalanceChanged()
                    }
                  >
                    Confirm Rebalance
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-6">
            {/* Current Positions */}
            <Card className="bg-slate-800/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Current Positions</CardTitle>
                <CardDescription className="text-slate-300">
                  Select how much to withdraw from each position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {positions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No active positions to withdraw from.
                  </div>
                ) : (
                  positions.map((position) => (
                    <div
                      key={position.id}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {position.protocol} {position.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          {position.chain} • {position.apy}% APY • $
                          {position.value.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={withdrawAmounts[position.id] || 0}
                          onChange={(e) =>
                            updateWithdrawAmount(
                              position.id,
                              Number(e.target.value)
                            )
                          }
                          className="w-32 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-red-500"
                          placeholder="0"
                          max={position.value}
                        />
                        <span className="text-sm text-slate-400">USDC</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateWithdrawAmount(position.id, position.value)
                          }
                          className="bg-transparent text-blue-400 border-blue-400 hover:bg-blue-400/10 hover:text-blue-300"
                        >
                          Max
                        </Button>
                      </div>
                    </div>
                  ))
                )}

                {positions.length > 0 && totalWithdrawing > 0 && (
                  <>
                    <Separator className="bg-slate-600" />
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-white">Total Withdrawal:</span>
                      <span className="text-red-400">
                        ${totalWithdrawing.toFixed(2)} USDC
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Withdrawal Summary */}
            {totalWithdrawing > 0 && (
              <Card className="bg-slate-800/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Withdrawal Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total Withdrawal:</span>
                    <span className="font-bold text-white">
                      ${totalWithdrawing.toFixed(2)} USDC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center text-slate-300">
                      <Zap className="w-4 h-4 mr-1" />
                      Est. Gas Cost:
                    </span>
                    <span className="text-slate-300">
                      ${(estimatedGas * 2000).toFixed(2)} (${estimatedGas} ETH)
                    </span>
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
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 h-12 text-lg font-semibold text-white border-0"
                    disabled={totalWithdrawing === 0}
                  >
                    Confirm Withdrawal
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default DepositInterface;
