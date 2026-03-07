import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useGyro } from "./GyroPermissionProvider";

interface FlipCardProps {
  small?: boolean;
  onAnimationComplete?: () => void;
  autoFlip?: boolean;
}

function useGyroTilt(enabled: boolean, containerRef: React.RefObject<HTMLDivElement | null>) {
  const { hasPermission, orientation: globalOrientation } = useGyro();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const hasGyro = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    if (hasPermission === true) {
      hasGyro.current = true;
      const { beta, gamma } = globalOrientation;

      const tiltX = Math.max(-30, Math.min(30, (beta - 0.7) * 25));
      const tiltY = Math.max(-35, Math.min(35, gamma * 30));

      setTilt({ x: tiltX, y: tiltY });
    } else {
      // Slow auto-drift fallback for when gyro is unavailable/insecure
      const time = Date.now() * 0.001;
      setTilt({
        x: Math.sin(time * 0.5) * 4,
        y: Math.cos(time * 0.7) * 4
      });

      const interval = setInterval(() => {
        const t = Date.now() * 0.001;
        setTilt({
          x: Math.sin(t * 0.5) * 4,
          y: Math.cos(t * 0.7) * 4
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [enabled, hasPermission, globalOrientation]);

  useEffect(() => {
    if (!enabled || hasGyro.current) return;

    // Mouse fallback
    const el = containerRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      const y = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      setTilt({ x: x * 20, y: y * 20 });
    };
    const handleLeave = () => setTilt({ x: 0, y: 0 });

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [enabled, containerRef]);

  return tilt;
}

const FlipCard = ({ small = false, onAnimationComplete, autoFlip = false }: FlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [introComplete, setIntroComplete] = useState(autoFlip);
  const containerRef = useRef<HTMLDivElement>(null);
  const tilt = useGyroTilt(introComplete, containerRef);

  const handleClick = () => {
    setIsFlipped((prev) => !prev);

    // Request gyro permission on first interaction (required for iOS)
    if (!introComplete && typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      (DeviceOrientationEvent as any).requestPermission()
        .then((state: string) => {
          if (state === "granted") {
            // Permission granted, useEffect will handle the rest if needed or we could manually add listener here
            // For simplicity, we just trigger a state change that indicates we can now use gyro
            setIntroComplete(true);
          }
        })
        .catch(console.error);
    }
  };

  const handleAnimComplete = useCallback(() => {
    setIntroComplete(true);
    onAnimationComplete?.();
  }, [onAnimationComplete]);

  const scale = small ? 0.72 : 0.85;

  return (
    <div className="flex flex-col items-center w-full" style={{ perspective: "1400px" }}>
      <div
        className="relative cursor-pointer group"
        ref={containerRef}
        style={{
          width: 460 * scale,
          height: 280 * scale,
          transformStyle: "preserve-3d",
          transform: introComplete ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : undefined,
          transition: introComplete ? "transform 0.15s ease-out" : undefined,
        }}
        onClick={handleClick}
      >
        {/* Shadow removed as per user request */}

        <motion.div
          initial={autoFlip ? { rotateY: 0 } : { rotateY: 360 }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={autoFlip ? { duration: 0.6, ease: "easeInOut" } : { duration: 1.4, ease: [0.25, 0.8, 0.25, 1] }}
          onAnimationComplete={handleAnimComplete}
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Gradient border - rotates with card */}
          <div
            className="absolute rounded-[22px] opacity-60 group-hover:opacity-100 transition-opacity duration-500 gradient-border-spin pointer-events-none"
            style={{
              inset: -2,
              background: "conic-gradient(from var(--border-angle, 0deg), hsl(252 95% 45%), hsl(258 90% 50%), hsl(245 90% 60%), hsl(252 95% 35%), hsl(252 95% 45%))",
              backfaceVisibility: "hidden",
            }}
          />
          <div
            className="absolute rounded-[22px] opacity-60 group-hover:opacity-100 transition-opacity duration-500 gradient-border-spin pointer-events-none"
            style={{
              inset: -2,
              background: "conic-gradient(from var(--border-angle, 0deg), hsl(252 95% 45%), hsl(258 90% 50%), hsl(245 90% 60%), hsl(252 95% 35%), hsl(252 95% 45%))",
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
            }}
          />
          {/* FRONT */}
          <div
            className="absolute inset-0 rounded-[20px] overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              background: "linear-gradient(145deg, hsl(252 95% 22%) 0%, hsl(252 95% 38%) 40%, hsl(252 95% 22%) 100%)",
              boxShadow: `
                0 50px 100px rgba(0,0,0,0.7),
                0 0 0 1px rgba(255,255,255,0.08),
                inset 0 1px 0 rgba(255,255,255,0.15)
              `,
              padding: `${28 * scale}px`,
              color: "white",
            }}
          >
            {/* Diagonal line pattern */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  repeating-linear-gradient(-55deg, transparent 0px, transparent 6px, rgba(255,255,255,0.022) 6px, rgba(255,255,255,0.022) 7px),
                  repeating-linear-gradient(35deg, transparent 0px, transparent 14px, rgba(255,255,255,0.015) 14px, rgba(255,255,255,0.015) 15px)
                `,
              }}
            />

            {/* Shimmer overlay */}
            <div
              className="absolute pointer-events-none shimmer-overlay"
              style={{
                inset: "-100%",
                background: "linear-gradient(105deg, transparent 40%, hsl(var(--primary) / 0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 65%)",
              }}
            />

            {/* Top row */}
            <div className="flex justify-between items-start relative z-[2]">
              <div>
                <div className="font-heading tracking-[3px] leading-none" style={{ fontSize: 20 * scale }}>
                  EIRS
                </div>
                <div className="font-mono text-[hsl(var(--muted-foreground))]" style={{ fontSize: 7 * scale, letterSpacing: "2px", marginTop: 2 }}>
                  ELITE IDENTITY RESERVE SYSTEM
                </div>
              </div>
              <div className="flex items-center gap-[3px] pt-1">
                {[8, 14, 20].map((size, i) => (
                  <span
                    key={i}
                    className="block rounded-full"
                    style={{
                      width: size * scale,
                      height: size * scale,
                      border: `2px solid hsl(var(--primary) / ${0.7 - i * 0.2})`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Chip */}
            <div
              className="absolute z-[3] rounded-[6px] overflow-hidden"
              style={{
                bottom: 64 * scale,
                left: 28 * scale,
                width: 44 * scale,
                height: 32 * scale,
                background: "linear-gradient(135deg, #e8c96c 0%, #b8932a 40%, #f0d998 60%, #c9a840 100%)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              <div
                className="absolute rounded-[3px]"
                style={{
                  inset: 4 * scale,
                  border: "1px solid rgba(139,100,20,0.5)",
                }}
              />
            </div>

            {/* Watermark */}
            <div
              className="absolute pointer-events-none select-none font-heading z-[1]"
              style={{
                bottom: -24 * scale,
                right: -10 * scale,
                fontSize: 120 * scale,
                fontWeight: 800,
                letterSpacing: -4,
                color: "rgba(255,255,255,0.04)",
                lineHeight: 1,
              }}
            >
              EIRS
            </div>

            {/* Bottom */}
            <div
              className="absolute flex justify-between items-end z-[2]"
              style={{
                bottom: 24 * scale,
                left: 28 * scale,
                right: 28 * scale,
              }}
            >
              <div className="font-mono" style={{ fontSize: 11 * scale, letterSpacing: 3, color: "rgba(255,255,255,0.7)" }}>
                •••• •••• •••• 7291
              </div>
              <div className="flex flex-col items-end gap-[3px]">
                <div className="font-heading" style={{ fontSize: 9 * scale, letterSpacing: 2, color: "rgba(255,255,255,0.5)" }}>
                  LOOPAROUND
                </div>
                <div
                  className="rounded-full"
                  style={{
                    width: 7 * scale,
                    height: 7 * scale,
                    background: "hsl(var(--primary))",
                    boxShadow: "0 0 8px hsl(var(--primary))",
                  }}
                />
              </div>
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 rounded-[20px] overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(145deg, hsl(252 95% 16%) 0%, hsl(252 95% 26%) 60%, hsl(252 95% 16%) 100%)",
              boxShadow: `
                0 50px 100px rgba(0,0,0,0.7),
                0 0 0 1px rgba(255,255,255,0.07)
              `,
            }}
          >
            {/* Pattern */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "repeating-linear-gradient(-55deg, transparent 0px, transparent 6px, rgba(255,255,255,0.018) 6px, rgba(255,255,255,0.018) 7px)",
              }}
            />

            {/* Magnetic strip */}
            <div
              className="w-full z-[2] relative"
              style={{
                height: 46 * scale,
                marginTop: 24 * scale,
                background: "linear-gradient(90deg, #050505, #111, #050505)",
              }}
            />

            {/* Signature area */}
            <div
              className="flex items-center gap-3 relative z-[2]"
              style={{ margin: `${18 * scale}px ${24 * scale}px 0` }}
            >
              <div
                className="flex-1 rounded-[3px] flex items-center relative overflow-hidden font-mono italic"
                style={{
                  height: 32 * scale,
                  background: "linear-gradient(90deg, #f5f5f0, #e8e8e3)",
                  padding: `0 ${10 * scale}px`,
                  fontSize: 10 * scale,
                  color: "rgba(0,0,0,0.35)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.03) 4px, rgba(0,0,0,0.03) 5px)",
                  }}
                />
                Authorized User
              </div>
              <div
                className="font-mono font-bold text-white rounded"
                style={{
                  fontSize: 12 * scale,
                  letterSpacing: 3,
                  background: "rgba(255,255,255,0.07)",
                  padding: `${6 * scale}px ${10 * scale}px`,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                291
              </div>
            </div>

            {/* NFC pulse area */}
            <div
              className="absolute flex items-center gap-3 z-[2]"
              style={{ bottom: 20 * scale, left: 24 * scale }}
            >
              <div className="relative flex items-center justify-center" style={{ width: 30 * scale, height: 30 * scale }}>
                <div className="nfc-pulse-ring" style={{ width: 18 * scale, height: 18 * scale }} />
                <div className="nfc-pulse-ring" style={{ width: 28 * scale, height: 28 * scale, animationDelay: "0.5s" }} />
                <div
                  className="rounded-full z-10"
                  style={{
                    width: 8 * scale,
                    height: 8 * scale,
                    background: "hsl(var(--primary))",
                    boxShadow: "0 0 8px hsl(var(--primary))",
                  }}
                />
              </div>
              <div className="font-mono" style={{ fontSize: 8 * scale, letterSpacing: 2, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
                <strong className="block" style={{ color: "rgba(255,255,255,0.65)", fontSize: 9 * scale }}>NFC Active</strong>
                Loop-Secured
              </div>
            </div>

            {/* Back footer */}
            <div
              className="absolute text-right z-[2]"
              style={{ bottom: 22 * scale, right: 24 * scale }}
            >
              <div className="font-heading" style={{ fontSize: 9 * scale, letterSpacing: 3, color: "rgba(255,255,255,0.35)" }}>
                LoopAround
              </div>
              <div className="font-mono" style={{ fontSize: 7 * scale, color: "rgba(255,255,255,0.18)", letterSpacing: 1.5, marginTop: 2 }}>
                Closed-Loop Network
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {!small && (
        <p className="font-mono text-[10px] tracking-[2px] text-muted-foreground/30 mt-8">
          tap to flip
        </p>
      )}
    </div>
  );
};

export default FlipCard;
