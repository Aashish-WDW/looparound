import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HaloBackground from "@/components/HaloBackground";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background relative">
      <HaloBackground />
      <Navbar />

      <section className="pt-24 pb-16 px-6 min-h-[100dvh] flex items-center relative z-10">
        <div className="container mx-auto max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-2xl md:text-3xl font-heading gradient-text mb-3">
              Contact Us
            </h1>
            <p className="text-muted-foreground font-subheading text-sm font-semibold">
              Get in touch with LoopAround
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="glass rounded-xl p-7 space-y-5"
          >
            {[
              { label: "Name", type: "text", key: "name" as const },
              { label: "Email", type: "email", key: "email" as const },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-muted-foreground text-xs font-subheading tracking-wider font-bold block mb-2 uppercase">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  required
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body focus:outline-none focus:border-primary focus:neon-glow-sm transition-all duration-300"
                />
              </div>
            ))}
            <div>
              <label className="text-muted-foreground text-xs font-subheading tracking-wider font-bold block mb-2 uppercase">
                Message
              </label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body focus:outline-none focus:border-primary focus:neon-glow-sm transition-all duration-300 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-lg gradient-btn text-primary-foreground font-subheading text-sm font-bold flex items-center justify-center gap-2 neon-glow-sm hover:neon-glow transition-all duration-300 hover:scale-[1.02] tracking-wider uppercase"
            >
              <Send className="w-4 h-4" />
              Send Message
            </button>
          </motion.form>

          <p className="text-center text-muted-foreground text-xs mt-6 font-mono">
            support@looparound.com
          </p>
        </div>
      </section>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Contact;
