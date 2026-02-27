"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";

interface DesmosCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
}

// Ensure TypeScript knows about the global Desmos object
declare global {
    interface Window {
        Desmos: any;
    }
}

export default function DesmosCalculator({ isOpen, onClose }: DesmosCalculatorProps) {
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [calculator, setCalculator] = useState<any>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isExpanded) return;
        if ((e.target as HTMLElement).closest('button')) return;

        setIsDragging(true);
        dragStart.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || isExpanded) return;
        setPosition({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y
        });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    useEffect(() => {
        if (!isOpen) return;

        // Function to initialize the calculator once the script is loaded
        const initCalculator = () => {
            if (window.Desmos && calculatorRef.current && !calculator) {
                const calc = window.Desmos.GraphingCalculator(calculatorRef.current, {
                    keypad: true,
                    expressions: true,
                    settingsMenu: true,
                    zoomButtons: true,
                    expressionsTopbar: true,
                    lockViewport: false,
                });
                setCalculator(calc);
            }
        };

        // Check if script is already present
        const existingScript = document.getElementById("desmos-script");

        if (existingScript) {
            initCalculator();
        } else {
            // Load the script dynamically if it doesn't exist
            const script = document.createElement("script");
            script.src = "https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";
            script.id = "desmos-script";
            script.async = true;
            script.onload = () => {
                initCalculator();
            };
            document.body.appendChild(script);
        }

        return () => {
            // Cleanup: destroy calculator instance when unmounting hiding
            if (calculator) {
                calculator.destroy();
                setCalculator(null);
            }
        };
    }, [isOpen]);

    // Don't render anything if not open
    if (!isOpen) return null;

    return (
        <div
            className={`fixed bg-white shadow-2xl rounded-lg border border-slate-300 z-50 flex flex-col ${!isDragging ? "transition-all duration-300 ease-in-out" : ""} ${isExpanded
                ? "top-16 left-0 right-0 bottom-16 w-full h-[calc(100vh-8rem)] rounded-none"
                : "top-20 right-6 w-[450px] h-[600px] sm:w-[500px]"
                }`}
            style={{
                transform: isExpanded ? 'none' : `translate(${position.x}px, ${position.y}px)`
            }}
        >
            {/* Header / Drag Handle area */}
            <div
                className="bg-slate-800 text-white p-2 rounded-t-lg flex justify-between items-center cursor-move select-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <span className="font-semibold text-sm pl-2">Desmos Graphing Calculator</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                        title={isExpanded ? "Restore size" : "Maximize"}
                    >
                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-700 hover:text-red-400 rounded transition-colors"
                        title="Close calculator"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calculator Container */}
            <div
                ref={calculatorRef}
                className="flex-1 w-full rounded-b-lg overflow-hidden"
            >
                {/* Desmos will inject its DOM here */}
            </div>
        </div>
    );
}
