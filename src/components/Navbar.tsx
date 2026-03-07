import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, CreditCard } from "lucide-react";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Gallery", path: "/gallery" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md gradient-btn flex items-center justify-center">
            <CreditCard className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-heading text-sm gradient-text tracking-wider">
            LoopAround
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-subheading text-sm font-bold tracking-wide transition-colors duration-200 uppercase ${
                location.pathname === item.path
                  ? "text-primary neon-text"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/balance"
            className="px-4 py-1.5 rounded-md gradient-btn text-primary-foreground font-subheading text-xs font-bold neon-glow-sm hover:neon-glow transition-all duration-300 tracking-wider uppercase"
          >
            Tap Card
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-primary">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border"
          >
            <div className="flex flex-col p-4 gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`font-subheading text-sm font-bold tracking-wider uppercase ${
                    location.pathname === item.path
                      ? "text-primary neon-text"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/balance"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-md gradient-btn text-primary-foreground font-subheading text-sm text-center font-bold neon-glow-sm tracking-wider uppercase"
              >
                Tap Card
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
