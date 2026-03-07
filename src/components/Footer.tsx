import { CreditCard } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-8">
    <div className="container mx-auto px-6 flex flex-col items-center gap-3 text-center">
      <div className="flex items-center gap-2">
        <CreditCard className="w-3.5 h-3.5 text-primary" />
        <span className="font-heading text-xs text-primary">LoopAround</span>
      </div>
      <p className="text-muted-foreground text-[10px] font-mono">
        support@looparound.com
      </p>
      <p className="text-muted-foreground text-[10px] font-body">
        © 2026 LoopAround. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
