import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Smartphone, CreditCard, RefreshCw } from "lucide-react";
import FlipCard from "@/components/FlipCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HaloBackground from "@/components/HaloBackground";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <HaloBackground />
      <Navbar />

      <section className="min-h-[100dvh] flex flex-col items-center justify-center px-6 pt-20 pb-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl md:text-5xl font-heading gradient-text tracking-wider mb-2">
            LoopAround
          </h1>
          <p className="font-subheading text-base md:text-lg text-muted-foreground tracking-[0.4em] font-semibold">
            Tap &bull; Pay &bull; Loop
          </p>
        </motion.div>

        <FlipCard small />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-8 z-10"
        >
          <p className="text-muted-foreground font-body max-w-xs mx-auto mb-8 text-sm leading-relaxed">
            A seamless closed-loop payment system powered by NFC technology.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
            <Link
              to="/balance"
              className="px-6 py-3.5 rounded-lg gradient-btn text-primary-foreground font-subheading text-sm font-bold neon-glow hover:neon-glow-lg transition-all duration-300 hover:scale-105 text-center tracking-wider uppercase"
            >
              Check Card Balance
            </Link>
            <Link
              to="/gallery"
              className="px-6 py-3.5 rounded-lg glass font-subheading text-sm font-bold text-primary glass-hover transition-all duration-300 hover:scale-105 text-center tracking-wider uppercase"
            >
              Explore
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="py-20 px-6 relative z-10">
        <div className="container mx-auto max-w-md md:max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl font-heading text-center gradient-text mb-10"
          >
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: <Smartphone className="w-7 h-7 text-primary" />, title: "Tap", desc: "Tap your NFC card on any compatible device" },
              { icon: <CreditCard className="w-7 h-7 text-primary" />, title: "Pay", desc: "Instant payment from your LoopAround balance" },
              { icon: <RefreshCw className="w-7 h-7 text-primary" />, title: "Loop", desc: "Recharge and keep your balance flowing" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-xl p-7 text-center hover:neon-glow-sm transition-all duration-300 hover:scale-105 cursor-default flex flex-col items-center"
              >
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-heading text-sm text-primary mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-xs font-body leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
