import { motion } from "framer-motion";
import { Smartphone, Store, Ticket, CreditCard, Wallet, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HaloBackground from "@/components/HaloBackground";

const galleryItems = [
  { title: "NFC Card Tap", desc: "Seamless tap-and-go payments", icon: <Smartphone className="w-8 h-8 text-primary" /> },
  { title: "Store Integration", desc: "Used across campus stores", icon: <Store className="w-8 h-8 text-primary" /> },
  { title: "Event Access", desc: "Entry passes for events", icon: <Ticket className="w-8 h-8 text-primary" /> },
  { title: "Card Design", desc: "Premium card aesthetics", icon: <CreditCard className="w-8 h-8 text-primary" /> },
  { title: "Mobile Wallet", desc: "Check balance on the go", icon: <Wallet className="w-8 h-8 text-primary" /> },
  { title: "Recharge Station", desc: "Quick top-up kiosks", icon: <Zap className="w-8 h-8 text-primary" /> },
];

const Gallery = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <HaloBackground />
      <Navbar />

      <section className="pt-24 pb-16 px-6 relative z-10">
        <div className="container mx-auto max-w-md md:max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-2xl md:text-3xl font-heading gradient-text mb-3">
              Gallery
            </h1>
            <p className="text-muted-foreground font-subheading text-sm font-semibold">
              Explore the LoopAround ecosystem
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group glass rounded-xl overflow-hidden hover:neon-glow-sm transition-all duration-300 cursor-pointer"
              >
                <div className="aspect-square bg-muted relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                  <div className="opacity-30 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500">
                    {item.icon}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-subheading text-foreground text-xs font-bold mb-1">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-[10px]">{item.desc}</p>
                </div>
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

export default Gallery;
