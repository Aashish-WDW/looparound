import { useEffect, useRef } from "react";
import haloBg from "@/assets/halo-bg.jpg";

const PARTICLE_COUNT = 35;
const REDUCED_PARTICLE_COUNT = 10;

const FloatingParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = prefersReducedMotion ? REDUCED_PARTICLE_COUNT : PARTICLE_COUNT;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.2, // Slightly slower for performance
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.3 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.015;

        if (p.x < 0) p.x = canvas.width;
        else if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        else if (p.y > canvas.height) p.y = 0;

        const currentOpacity = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(252, 95%, 65%, ${currentOpacity})`;
        ctx.fill();

        // Subtler Glow - skip if reduced motion to save energy
        if (!prefersReducedMotion) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(252, 95%, 55%, ${currentOpacity * 0.12})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

const HaloBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Base halo image */}
    <img
      src={haloBg}
      alt=""
      className="absolute inset-0 w-full h-full object-cover opacity-[0.12]"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-background/80" />

    {/* Noise grain overlay */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      }}
    />

    {/* Floating particles */}
    <FloatingParticles />

    {/* Orbiting glow - top right */}
    <div
      className="absolute rounded-full animate-float"
      style={{
        top: "5%",
        right: "5%",
        width: 250,
        height: 250,
        background: "radial-gradient(circle, hsl(252 95% 55% / 0.1) 0%, transparent 70%)",
        filter: "blur(60px)",
      }}
    />

    {/* Orbiting glow - bottom left */}
    <div
      className="absolute rounded-full animate-float"
      style={{
        bottom: "10%",
        left: "2%",
        width: 300,
        height: 300,
        background: "radial-gradient(circle, hsl(258 90% 50% / 0.08) 0%, transparent 70%)",
        filter: "blur(70px)",
        animationDelay: "1.5s",
      }}
    />

    {/* Center accent glow */}
    <div
      className="absolute rounded-full"
      style={{
        top: "40%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 450,
        height: 450,
        background: "radial-gradient(circle, hsl(252 95% 55% / 0.04) 0%, transparent 60%)",
        filter: "blur(80px)",
      }}
    />

    {/* Scan line */}
    <div
      className="absolute left-0 right-0 h-px opacity-[0.02]"
      style={{
        background: "linear-gradient(90deg, transparent 0%, hsl(252 95% 55%) 50%, transparent 100%)",
        animation: "scan-line 10s linear infinite",
      }}
    />
  </div>
);

export default HaloBackground;
