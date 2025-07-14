import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { usePortfolioStore } from "@/store";
import { useAgoric } from "@agoric/react-components";
import { formatApy } from "@/lib/utils";

interface Strategy {
  id: string;
  protocol: string;
  name: string;
  apy: number;
}

interface EnterStrategyModalProps {
  strategy: Strategy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSourceId?: string;
  defaultAmount?: number;
}

const EnterStrategyModal: React.FC<EnterStrategyModalProps> = ({
  strategy,
  open,
  onOpenChange,
  defaultSourceId,
  defaultAmount,
}) => {
  const { positions } = usePortfolioStore();
  const { purses } = useAgoric();
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(
    null
  );
  const [amount, setAmount] = useState<string>("");

  // USDN/USDC purse balance helper (assume 6 decimals)
  const getWalletBalance = () => {
    if (!purses) return 0;
    const usdc = purses.find((p) => p.brandPetname?.toLowerCase() === "usdc");
    return usdc ? Number(usdc.currentAmount.value) / 1_000_000 : 0;
  };

  useEffect(() => {
    if (!open) return;
    if (defaultSourceId) {
      setSelectedPositionId(defaultSourceId);
    } else if (positions.length > 0) {
      const lowest = positions.reduce((low, p) => (p.apy < low.apy ? p : low));
      setSelectedPositionId(lowest.id);
    } else {
      setSelectedPositionId("wallet");
    }

    if (defaultAmount !== undefined) {
      setAmount(defaultAmount.toString());
    }
  }, [positions, open, defaultSourceId, defaultAmount]);

  const selectedPosition = positions.find((p) => p.id === selectedPositionId);
  const isWallet = selectedPositionId === "wallet";
  const available = isWallet
    ? getWalletBalance()
    : selectedPosition?.value ?? 0;

  const handleConfirm = () => {
    console.log(
      "Reallocating",
      amount,
      "from",
      selectedPosition?.id,
      "to",
      strategy?.id
    );
    onOpenChange(false);
    setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            Enter {strategy?.protocol}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Reallocate funds from an existing position to this opportunity.
          </DialogDescription>
        </DialogHeader>

        {positions.length === 0 && getWalletBalance() === 0 ? (
          <p className="text-slate-300 text-sm">
            No funding sources available.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-1 block">Select Position</Label>
              <Select
                value={selectedPositionId ?? undefined}
                onValueChange={setSelectedPositionId}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 text-white max-h-64 overflow-y-auto">
                  {/* Wallet Section */}
                  <SelectItem
                    value="wallet"
                    className="flex flex-col text-left py-2"
                  >
                    <span className="mr-2">Agoric Wallet</span>
                    <span className="text-sm text-slate-400">
                      Balance: {getWalletBalance().toLocaleString()} USDC
                    </span>
                  </SelectItem>
                  <div className="h-px bg-slate-700 my-1" />
                  {/* Positions Section */}
                  {positions.map((pos) => (
                    <SelectItem
                      key={pos.id}
                      value={pos.id}
                      className="flex flex-col text-left py-2"
                    >
                      <span className="mr-2">
                        {pos.protocol} {pos.name}
                      </span>
                      <span className="text-sm text-slate-400">
                        APY: {formatApy(pos.apy)} • Balance: $
                        {pos.value.toLocaleString()}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="enter-amount" className="text-white">
                Amount (USDC)
              </Label>
              <Input
                id="enter-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                placeholder="0"
              />
              <p className="text-xs text-slate-400 mt-1">
                Available: ${available.toLocaleString()} USDC
              </p>
            </div>
            <Button
              onClick={handleConfirm}
              disabled={!amount || Number(amount) <= 0 || available === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            >
              Confirm Entry
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnterStrategyModal;
