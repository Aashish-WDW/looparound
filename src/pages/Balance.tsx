import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio } from "lucide-react";
import FlipCard from "@/components/FlipCard";
import BalanceDisplay from "@/components/BalanceDisplay";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HaloBackground from "@/components/HaloBackground";

const Balance = () => {
  const [phase, setPhase] = useState<"detecting" | "card" | "balance">("detecting");

  useEffect(() => {
    if (phase === "detecting") {
      const timer = setTimeout(() => setPhase("card"), 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div className="min-h-screen bg-background relative">
      <HaloBackground />
      <Navbar />

      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 pt-20 pb-10 relative z-10">
        <AnimatePresence mode="wait">
          {phase === "detecting" && (
            <motion.div
              key="detecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ripple" />
                <div className="absolute inset-2 rounded-full border-2 border-primary/50 animate-ripple" style={{ animationDelay: "0.3s" }} />
                <div className="absolute inset-4 rounded-full border-2 border-primary animate-ripple" style={{ animationDelay: "0.6s" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Radio className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h2 className="font-heading text-lg text-primary neon-text mb-2">Card Detected</h2>
              <p className="text-muted-foreground font-subheading text-sm font-semibold">
                Connecting to LoopAround...
              </p>
            </motion.div>
          )}

          {phase === "card" && (
            <motion.div
              key="card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm"
            >
              <FlipCard small onAnimationComplete={() => setPhase("balance")} />
            </motion.div>
          )}

          {phase === "balance" && (
            <motion.div
              key="balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <FlipCard small autoFlip />
              <div className="mt-6">
                <BalanceDisplay />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Balance;
