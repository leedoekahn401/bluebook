"use client";

import { useState, useEffect } from "react";
import { Clock, EyeOff, Eye, ChevronLeft, ChevronRight, Calculator, Check, Settings, Flag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define simplified props for UI development
interface TestHeaderProps {
    sectionName: string;
    timeRemaining: number; // in seconds
    onTimeUp: () => void;
    isTimerHidden: boolean;
    setIsTimerHidden: (hide: boolean) => void;
}

export function TestHeader({
    sectionName,
    timeRemaining,
    onTimeUp,
    isTimerHidden,
    setIsTimerHidden,
    onToggleCalculator
}: TestHeaderProps & { onToggleCalculator?: () => void }) {

    // Basic timer display formatting
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-50 fixed top-0 w-full left-0 right-0">
            <div className="flex-1 flex items-center">
                <h1 className="font-bold text-lg text-slate-800 tracking-tight">
                    {sectionName}
                </h1>
            </div>

            <div className="flex-1 flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-3">
                        {!isTimerHidden ? (
                            <span className={`text-xl font-mono font-bold tracking-wider ${timeRemaining < 300 ? "text-red-600 animate-pulse" : "text-slate-900"
                                }`}>
                                {formatTime(timeRemaining)}
                            </span>
                        ) : (
                            <span className="text-xl font-mono text-slate-400 tracking-wider">
                                --:--
                            </span>
                        )}

                        <button
                            onClick={() => setIsTimerHidden(!isTimerHidden)}
                            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium p-1.5 rounded bg-slate-100 hover:bg-slate-200"
                        >
                            {isTimerHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            <span className="hidden sm:inline">{isTimerHidden ? "Show" : "Hide"}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex justify-end items-center gap-4">
                {/* Mock calculator button mimicking Bluebook */}
                <button
                    onClick={onToggleCalculator}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm py-1.5 px-3 rounded border border-transparent hover:border-slate-200 hover:bg-slate-50"
                >
                    <Calculator className="w-5 h-5" />
                    <span className="hidden sm:inline">Calculator</span>
                </button>

                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded">
                    <span>End Section</span>
                </button>
            </div>
        </header>
    );
}

interface TestFooterProps {
    currentIndex: number;
    totalQuestions: number;
    onNext: () => void;
    onPrev: () => void;
    onJump: (index: number) => void;
    answers: Record<string, string>;
    flagged: Record<string, boolean>;
    questions: any[];
}

export function TestFooter({
    currentIndex,
    totalQuestions,
    onNext,
    onPrev,
    onJump,
    answers,
    flagged,
    questions
}: TestFooterProps) {
    const [isGridOpen, setIsGridOpen] = useState(false);

    return (
        <>
            {/* Grid overlay */}
            {isGridOpen && (
                <div className="fixed inset-0 bottom-16 bg-white/95 backdrop-blur-sm z-40 border-t border-slate-200 flex flex-col pt-16 mt-16)] transition-all animate-in slide-in-from-bottom-5">
                    <div className="p-8 max-w-5xl mx-auto w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-800 text-center flex-1">Select a Question</h3>
                            <button
                                onClick={() => setIsGridOpen(false)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded"
                            >
                                Close
                            </button>
                        </div>

                        <div className="flex gap-6 mb-8 justify-center text-sm font-medium text-slate-600">
                            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-900 rounded-sm"></div> Current</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 border border-blue-600 bg-blue-50 text-blue-600 flex items-center justify-center rounded-sm"><Check className="w-3 h-3" /></div> Answered</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded-sm hover:border-slate-800"></div> Unanswered</div>
                            <div className="flex items-center gap-2"><Flag className="w-4 h-4 fill-amber-400 text-amber-500" /> For Review</div>
                        </div>

                        <div className="grid grid-cols-10 gap-3 max-w-4xl mx-auto">
                            {questions.map((q, i) => {
                                const isAnswered = !!answers[q._id];
                                const isFlagged = !!flagged[q._id];
                                const isCurrent = i === currentIndex;

                                return (
                                    <button
                                        key={q._id}
                                        onClick={() => {
                                            onJump(i);
                                            setIsGridOpen(false);
                                        }}
                                        className={`
                        relative w-12 h-12 flex items-center justify-center rounded text-sm font-semibold transition-all border-2 
                        ${isCurrent ? 'bg-slate-900 border-slate-900 text-white transform scale-105 z-10' :
                                                isAnswered ? 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-300' :
                                                    'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}
                      `}
                                    >
                                        {isAnswered && !isCurrent && <Check className="w-4 h-4 absolute top-0.5 right-0.5 opacity-50" />}
                                        {i + 1}
                                        {isFlagged && (
                                            <div className="absolute -top-2 -right-2">
                                                <Flag className="w-5 h-5 fill-amber-400 text-amber-500" />
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Persistent Bottom Bar */}
            <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-between px-6 z-50">
                <div className="flex-1 flex items-center">
                    <span className="font-semibold text-slate-700">
                        {sessionStorage.getItem('testName') || "Practice Test"}
                    </span>
                </div>

                <div className="flex-1 flex justify-center items-center">
                    <button
                        onClick={() => setIsGridOpen(!isGridOpen)}
                        className="flex items-center gap-3 px-6 py-2 bg-slate-100 hover:bg-slate-200 rounded-full font-bold text-slate-800"
                    >
                        <span>Question {currentIndex + 1} of {totalQuestions}</span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isGridOpen ? '-rotate-90' : 'rotate-90'}`} />
                    </button>
                </div>

                <div className="flex-1 flex justify-end items-center gap-3">
                    <button
                        onClick={onPrev}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded font-medium"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>

                    <button
                        onClick={onNext}
                        disabled={currentIndex === totalQuestions - 1}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded font-medium"
                    >
                        <span>Next</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </>
    );
}
