import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface OrientationData {
    beta: number;
    gamma: number;
}

interface GyroContextType {
    hasPermission: boolean | 'pending' | 'not-supported' | 'insecure';
    orientation: OrientationData;
    requestPermission: () => Promise<void>;
}

const GyroContext = createContext<GyroContextType | undefined>(undefined);

export const GyroPermissionProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const [hasPermission, setHasPermission] = useState<boolean | 'pending' | 'not-supported' | 'insecure'>('pending');
    const [orientation, setOrientation] = useState<OrientationData>({ beta: 0, gamma: 0 });
    const [debugMode, setDebugMode] = useState(false);
    const eventCount = useRef(0);

    const requestPermission = async () => {
        console.log("Gyro: Requesting permission...");
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof (DeviceOrientationEvent as any).requestPermission === "function") {
            try {
                const state = await (DeviceOrientationEvent as any).requestPermission();
                console.log("Gyro: Permission state:", state);
                if (state === "granted") {
                    setHasPermission(true);
                    window.addEventListener("deviceorientation", handleOrientation, true);
                } else {
                    setHasPermission(false);
                }
            } catch (e) {
                console.error("Gyro: Permission request failed:", e);
                setHasPermission(false);
            }
        } else {
            console.log("Gyro: Permission not required (Android/Chrome)");
            setHasPermission(true);
            window.addEventListener("deviceorientation", handleOrientation, true);
        }
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
        eventCount.current++;
        setOrientation({
            beta: (e.beta || 0) * (Math.PI / 180),
            gamma: (e.gamma || 0) * (Math.PI / 180),
        });
    };

    useEffect(() => {
        const isDebug = new URLSearchParams(window.location.search).get('debug') === 'true';
        setDebugMode(isDebug);

        console.log("Gyro: Initializing provider...");

        // Detect if feature exists at all
        if (typeof DeviceOrientationEvent === 'undefined') {
            console.warn("Gyro: DeviceOrientationEvent is NOT supported on this browser.");
            setHasPermission('not-supported');
            return;
        }

        // Check for secure context (HTTPS)
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            console.warn("Gyro: Not in a secure context. Sensors may be blocked.");
            setHasPermission('insecure');

            // Proactively warn the user via toast
            toast({
                title: "Sensors Blocked",
                description: "Device orientation requires a secure (HTTPS) connection to work on mobile.",
                variant: "destructive",
            });
        }

        // Auto-listen if permission isn't required (Chrome/Android/Firefox)
        if (typeof (DeviceOrientationEvent as any).requestPermission !== "function") {
            console.log("Gyro: Permission not required on this platform.");
            setHasPermission(true);
            window.addEventListener("deviceorientation", handleOrientation, true);
        }

        // Setup a one-time global click listener to trigger permission on iOS
        const handleFirstInteraction = () => {
            console.log("Gyro: First interaction detected, triggering permission request...");
            requestPermission();
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
        };

        window.addEventListener('click', handleFirstInteraction);
        window.addEventListener('touchstart', handleFirstInteraction);

        return () => {
            window.removeEventListener("deviceorientation", handleOrientation);
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
        };
    }, []);

    return (
        <GyroContext.Provider value={{ hasPermission, orientation, requestPermission }}>
            {children}
            {debugMode && (
                <div className="fixed top-20 right-4 z-[9999] bg-black/80 p-3 rounded-lg text-[10px] font-mono text-green-400 border border-green-500/30 backdrop-blur-md">
                    <div>Permission: {String(hasPermission)}</div>
                    <div>Events: {eventCount.current}</div>
                    <div>Beta: {orientation.beta.toFixed(3)}</div>
                    <div>Gamma: {orientation.gamma.toFixed(3)}</div>
                    <div className="mt-1 opacity-50">HTTPS: {String(window.isSecureContext)}</div>
                </div>
            )}
        </GyroContext.Provider>
    );
};

export const useGyro = () => {
    const context = useContext(GyroContext);
    if (context === undefined) {
        throw new Error("useGyro must be used within a GyroPermissionProvider");
    }
    return context;
};
