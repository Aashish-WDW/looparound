import { useRef, useState, useMemo, useEffect } from "react";
import { useGyro } from "./GyroPermissionProvider";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

interface LoopCardProps {
  onAnimationComplete?: () => void;
  autoRotate?: boolean;
  small?: boolean;
}

const PURPLE = "#4E25F4";
const PURPLE_LIGHT = "#8B5CF6";
const MAGENTA = "#C026D3";

// Hook to get device orientation
function useGyroscope() {
  const { orientation, hasPermission } = useGyro();
  return { orientation, hasPermission: hasPermission === true };
}

// Mouse-based tilt fallback for desktop
function useMouseTilt(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setTilt({ x: y * 0.8, y: x * 1.0 });
    };

    const handleLeave = () => setTilt({ x: 0, y: 0 });

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [containerRef]);

  return tilt;
}

// Shared gyro/mouse state passed into the Three.js scene
const gyroState = { x: 0, y: 0 };

const NeonCard = ({ onAnimationComplete, autoRotate = false, hasPermission = false }: { onAnimationComplete?: () => void; autoRotate?: boolean; hasPermission: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [rotationDone, setRotationDone] = useState(false);
  const totalRotation = useRef(0);
  const targetTilt = useRef({ x: 0, y: 0 });

  const cardTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext("2d")!;

    const bgGrad = ctx.createLinearGradient(0, 0, 512, 320);
    bgGrad.addColorStop(0, "#0A0A12");
    bgGrad.addColorStop(1, "#0E0A1A");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 320);

    // Retro grid
    ctx.strokeStyle = PURPLE;
    ctx.globalAlpha = 0.06;
    ctx.lineWidth = 1;
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 320); ctx.stroke();
    }
    for (let y = 0; y < 320; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Corner cuts
    ctx.fillStyle = PURPLE;
    ctx.fillRect(0, 0, 60, 3); ctx.fillRect(0, 0, 3, 40);
    ctx.fillRect(452, 0, 60, 3); ctx.fillRect(509, 0, 3, 40);
    ctx.fillRect(0, 317, 60, 3); ctx.fillRect(0, 280, 3, 40);
    ctx.fillRect(452, 317, 60, 3); ctx.fillRect(509, 280, 3, 40);

    // Top-left data lines
    ctx.fillStyle = PURPLE_LIGHT;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(20, 25, 80, 1);
    ctx.fillRect(20, 30, 50, 1);
    ctx.globalAlpha = 1;

    // Data marker top-right
    ctx.fillStyle = "#151520";
    ctx.fillRect(400, 20, 40, 40);
    ctx.strokeStyle = PURPLE;
    ctx.lineWidth = 1;
    ctx.strokeRect(400, 20, 40, 40);
    ctx.beginPath();
    ctx.moveTo(420, 20); ctx.lineTo(420, 60);
    ctx.moveTo(400, 40); ctx.lineTo(440, 40);
    ctx.strokeStyle = PURPLE;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Chip
    ctx.fillStyle = "#C4A000";
    ctx.fillRect(30, 70, 55, 40);
    ctx.strokeStyle = "#A08000";
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 70, 55, 40);
    ctx.beginPath();
    ctx.moveTo(57, 70); ctx.lineTo(57, 110);
    ctx.moveTo(30, 90); ctx.lineTo(85, 90);
    ctx.stroke();

    // NFC waves
    ctx.strokeStyle = PURPLE_LIGHT;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(110, 90, 12 + i * 8, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Title
    const titleGrad = ctx.createLinearGradient(150, 155, 370, 175);
    titleGrad.addColorStop(0, PURPLE);
    titleGrad.addColorStop(0.5, PURPLE_LIGHT);
    titleGrad.addColorStop(1, MAGENTA);
    ctx.fillStyle = titleGrad;
    ctx.font = "bold 38px 'Arial', sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = PURPLE;
    ctx.shadowBlur = 25;
    ctx.fillText("LOOPAROUND", 256, 175);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#555566";
    ctx.font = "14px 'Courier New', monospace";
    ctx.fillText("[ CYBERCARD :: NFC WALLET ]", 256, 200);

    // Bottom strip
    ctx.fillStyle = "#0C0C18";
    ctx.fillRect(0, 250, 512, 35);

    const lineGrad = ctx.createLinearGradient(0, 250, 512, 250);
    lineGrad.addColorStop(0, "transparent");
    lineGrad.addColorStop(0.3, PURPLE);
    lineGrad.addColorStop(0.7, MAGENTA);
    lineGrad.addColorStop(1, "transparent");
    ctx.fillStyle = lineGrad;
    ctx.fillRect(0, 249, 512, 1);

    ctx.fillStyle = PURPLE_LIGHT;
    ctx.globalAlpha = 0.5;
    ctx.font = "10px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText("SD2 14512.233", 20, 268);
    ctx.fillText("45.95116.7", 20, 280);
    ctx.textAlign = "right";
    ctx.fillText("PROTOTYPE01", 492, 268);
    ctx.fillText("v2.4.1", 492, 280);
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 5; i++) {
      const barGrad = ctx.createLinearGradient(460, 0, 490, 0);
      barGrad.addColorStop(0, PURPLE);
      barGrad.addColorStop(1, MAGENTA);
      ctx.fillStyle = barGrad;
      ctx.fillRect(460, 130 + i * 8, 30 - i * 5, 4);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = PURPLE;
    ctx.globalAlpha = 0.05;
    ctx.fillRect(0, 290, 512, 30);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = PURPLE_LIGHT;
    ctx.font = "9px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("CLOSED-LOOP PAYMENT SYSTEM // AUTHORIZED ACCESS ONLY", 256, 306);
    ctx.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const backTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext("2d")!;

    const bgGrad = ctx.createLinearGradient(0, 0, 512, 320);
    bgGrad.addColorStop(0, "#080812");
    bgGrad.addColorStop(1, "#0C0A18");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 320);

    ctx.strokeStyle = PURPLE;
    ctx.globalAlpha = 0.04;
    ctx.lineWidth = 1;
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 320); ctx.stroke();
    }
    for (let y = 0; y < 320; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#1A1A28";
    ctx.fillRect(0, 40, 512, 50);

    ctx.fillStyle = PURPLE;
    ctx.fillRect(0, 0, 50, 2); ctx.fillRect(0, 0, 2, 30);
    ctx.fillRect(462, 0, 50, 2); ctx.fillRect(510, 0, 2, 30);
    ctx.fillRect(0, 318, 50, 2); ctx.fillRect(0, 290, 2, 30);
    ctx.fillRect(462, 318, 50, 2); ctx.fillRect(510, 290, 2, 30);

    ctx.fillStyle = "#111120";
    ctx.fillRect(140, 130, 232, 50);
    ctx.strokeStyle = PURPLE;
    ctx.lineWidth = 1;
    ctx.strokeRect(140, 130, 232, 50);

    ctx.fillStyle = PURPLE_LIGHT;
    ctx.font = "10px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.globalAlpha = 0.5;
    ctx.fillText("CARD UID", 256, 148);
    ctx.globalAlpha = 1;
    ctx.font = "16px 'Courier New', monospace";
    ctx.shadowColor = PURPLE;
    ctx.shadowBlur = 10;
    ctx.fillText("04:A3:9F:22:8B", 256, 170);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#444455";
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillText("Closed-Loop NFC Payment System", 256, 240);
    ctx.fillStyle = PURPLE;
    ctx.globalAlpha = 0.3;
    ctx.fillText("DO NOT DUPLICATE // PROPERTY OF LOOPAROUND", 256, 260);
    ctx.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (!rotationDone) {
      // Spin 2 full rotations (4π)
      const speed = 5;
      groupRef.current.rotation.y += delta * speed;
      totalRotation.current += delta * speed;

      if (totalRotation.current >= Math.PI * 4) {
        groupRef.current.rotation.y = 0;
        setRotationDone(true);
        onAnimationComplete?.();
      }
    } else {
      // Gyroscope / mouse tilt - smooth lerp
      const t = _.clock.getElapsedTime();

      // Add subtle drift if no gyro
      const driftX = !hasPermission ? Math.sin(t * 0.5) * 0.05 : 0;
      const driftY = !hasPermission ? Math.cos(t * 0.3) * 0.05 : 0;

      targetTilt.current.x = gyroState.x + driftX;
      targetTilt.current.y = gyroState.y + driftY;

      groupRef.current.rotation.x += (targetTilt.current.x - groupRef.current.rotation.x) * 0.08;
      groupRef.current.rotation.y += (targetTilt.current.y - groupRef.current.rotation.y) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[3.4, 2.1, 0.06]} />
        <meshStandardMaterial map={cardTexture} metalness={0.3} roughness={0.4} attach="material-4" />
        <meshStandardMaterial map={backTexture} metalness={0.3} roughness={0.4} attach="material-5" />
        <meshStandardMaterial color="#0A0A14" metalness={0.8} roughness={0.2} attach="material-0" />
        <meshStandardMaterial color="#0A0A14" metalness={0.8} roughness={0.2} attach="material-1" />
        <meshStandardMaterial color="#0A0A14" metalness={0.8} roughness={0.2} attach="material-2" />
        <meshStandardMaterial color="#0A0A14" metalness={0.8} roughness={0.2} attach="material-3" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.5, 2.2, 0.01]} />
        <meshStandardMaterial
          color={PURPLE}
          emissive={PURPLE}
          emissiveIntensity={0.8}
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
};

const Card3D = ({ onAnimationComplete, autoRotate = true, small = false }: LoopCardProps) => {
  const height = small ? "240px" : "320px";
  const containerRef = useRef<HTMLDivElement>(null);
  const { orientation, hasPermission } = useGyroscope();
  const mouseTilt = useMouseTilt(containerRef);

  // Update shared gyro state
  useEffect(() => {
    if (hasPermission) {
      // Clamp gyro tilt to even broader range for extreme sensitivity
      gyroState.x = Math.max(-1.0, Math.min(1.0, (orientation.beta - Math.PI / 4) * 1.0));
      gyroState.y = Math.max(-1.2, Math.min(1.2, orientation.gamma * 1.2));
    } else {
      gyroState.x = mouseTilt.x;
      gyroState.y = mouseTilt.y;
    }
  }, [orientation, hasPermission, mouseTilt]);

  return (
    <div ref={containerRef} style={{ width: "100%", height, maxWidth: "420px", margin: "0 auto" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color={PURPLE} />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color={MAGENTA} />
        <spotLight position={[0, 5, 3]} intensity={1} color="#ffffff" />
        <NeonCard onAnimationComplete={onAnimationComplete} autoRotate={autoRotate} hasPermission={hasPermission} />
      </Canvas>
    </div>
  );
};

export default Card3D;
