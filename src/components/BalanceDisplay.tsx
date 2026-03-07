import { motion } from "framer-motion";
import { RefreshCw, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { useCardStore } from "@/hooks/useCardStore";
import { toast } from "sonner";

const BalanceDisplay = () => {
  const { balance, transactions, uid, lastUpdated, addTransaction, setBalance } = useCardStore();
  const [displayBalance, setDisplayBalance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let start = displayBalance > 0 ? displayBalance : 0;
    const end = balance;
    const duration = 1200;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;

    if (Math.abs(end - start) < 1) {
      setDisplayBalance(end);
      return;
    }

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setDisplayBalance(end);
        clearInterval(timer);
      } else {
        setDisplayBalance(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [balance]);

  const handleRefresh = () => {
    setRefreshing(true);

    // Simulate API delay and card tap
    setTimeout(() => {
      setRefreshing(false);

      const isRecharge = Math.random() > 0.7;
      const amount = isRecharge ? 200 : -50;
      const label = isRecharge ? "Express Recharge" : "Vending Machine";

      addTransaction({
        label,
        amount,
        time: "Just now"
      });

      toast.success(isRecharge ? "Balance Top-up Successful" : "Payment Successful", {
        description: `${isRecharge ? "+" : ""}₹${Math.abs(amount)} added to your card.`
      });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-sm mx-auto space-y-4 px-2"
    >
      <div className="glass rounded-xl p-7 text-center neon-glow-sm">
        <p className="text-muted-foreground font-subheading text-xs tracking-widest uppercase mb-2 font-bold">
          Available Balance
        </p>
        <h2 className="text-4xl font-heading gradient-text animate-count-up">
          ₹{displayBalance.toLocaleString()}
        </h2>
        <p className="text-muted-foreground text-[10px] mt-3 font-mono">
          Last Updated: {lastUpdated}
        </p>
      </div>

      <div className="glass rounded-lg p-4 text-center">
        <p className="text-muted-foreground text-[10px] font-subheading tracking-wider mb-1 uppercase font-bold">Card UID</p>
        <p className="font-mono text-xs text-primary tracking-[0.3em]">{uid}</p>
      </div>

      <div className="glass rounded-lg p-4">
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground text-[10px] font-subheading font-bold uppercase">Points Remaining</span>
          <span className="text-primary text-[10px] font-mono">760 / 1000</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "76%" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full rounded-full gradient-btn neon-glow-sm"
          />
        </div>
      </div>

      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="w-full glass rounded-lg p-3.5 flex items-center justify-center gap-2 text-primary font-subheading text-xs tracking-wide font-bold glass-hover transition-all duration-300 uppercase disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
        <CreditCard className="w-3.5 h-3.5" />
        {refreshing ? "Scanning Card..." : "Tap again to refresh"}
      </button>

      <div className="space-y-2">
        <h4 className="font-subheading text-xs text-muted-foreground tracking-wider font-bold uppercase mb-3">
          Recent Transactions
        </h4>
        {transactions.map((tx, i) => (
          <motion.div
            key={`${tx.label}-${i}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i < 5 ? 0.5 + i * 0.1 : 0 }}
            className="glass rounded-lg p-4 flex items-center justify-between glass-hover transition-all duration-200"
          >
            <div>
              <p className="text-foreground font-subheading text-xs font-bold">{tx.label}</p>
              <p className="text-muted-foreground text-[10px] font-mono mt-0.5">{tx.time}</p>
            </div>
            <span
              className={`font-mono text-xs ${tx.amount > 0 ? "text-primary" : "text-destructive"
                }`}
            >
              {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BalanceDisplay;
