"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCcw, CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import Loading from "@/components/Loading";
import ReviewChatbot from "@/components/ReviewChatbot";
import api from "@/lib/axios";
import { API_PATHS } from "@/lib/apiPaths";

export default function ReviewPage() {
    const { data: session, status } = useSession();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const [expandedExplanations, setExpandedExplanations] = useState<Record<string, string>>({});
    const [loadingExplanations, setLoadingExplanations] = useState<Record<string, boolean>>({});
    const [activeChat, setActiveChat] = useState<{ questionId: string; questionText: string } | null>(null);
    const [expandedTests, setExpandedTests] = useState<Record<string, boolean>>({});

    const toggleTestExpand = (testId: string) => {
        setExpandedTests((prev) => ({ ...prev, [testId]: !prev[testId] }));
    };

    const handleExpandExplanation = async (questionId: string) => {
        if (expandedExplanations[questionId]) {
            const newExplanations = { ...expandedExplanations };
            delete newExplanations[questionId];
            setExpandedExplanations(newExplanations);
            return;
        }

        setLoadingExplanations((prev) => ({ ...prev, [questionId]: true }));
        try {
            const res = await api.get(API_PATHS.getQuestionExplanation(questionId));
            const data = res.data;
            if (data.explanation) {
                setExpandedExplanations((prev) => ({ ...prev, [questionId]: data.explanation }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingExplanations((prev) => ({ ...prev, [questionId]: false }));
        }
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            window.location.href = "/auth";
        }

        if (session) {
            const fetchResults = async () => {
                try {
                    const res = await api.get(API_PATHS.RESULTS);
                    const data = res.data;
                    setResults(data.results || []);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            };

            fetchResults();
        }
    }, [session, status]);

    if (loading || status === "loading") return <Loading />;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sticky Top Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <Link href="/" className="text-slate-500 hover:text-slate-900 p-2 bg-white rounded-full border border-slate-200">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">Score Reports &amp; Review</h1>
                    {activeChat && (
                        <span className="ml-auto flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Tutor Active
                        </span>
                    )}
                </div>
            </div>

            {/* Main Two-Column Layout */}
            <div className="max-w-7xl mx-auto flex gap-6 p-8">

                {/* Left: Questions */}
                <div className={`flex-1 min-w-0 transition-all duration-300 ${activeChat ? "max-w-[calc(100%-420px)]" : ""}`}>
                    {results.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
                            <RefreshCcw className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-slate-800 mb-2">No attempts yet</h2>
                            <p className="text-slate-500 mb-6">Take a practice test to see your score report and review mistakes here.</p>
                            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                                Return Home
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {results.map((result: any) => (
                                <div key={result._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    {/* Test Result Header */}
                                    <button
                                        onClick={() => toggleTestExpand(result._id)}
                                        className="w-full text-left p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="flex justify-between items-end w-full pr-6">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                                    {new Date(result.date || result.createdAt).toLocaleDateString()}
                                                </p>
                                                <h3 className="text-2xl font-bold text-slate-900">Total Score: {result.score}</h3>
                                                <div className="flex gap-4 mt-2 text-sm text-slate-600 font-medium">
                                                    <span>Reading &amp; Writing: {result.sectionBreakdown?.readingAndWriting || 0}</span>
                                                    <span className="text-slate-300">|</span>
                                                    <span>Math: {result.sectionBreakdown?.math || 0}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-slate-500 font-medium mb-1">Performance Details</p>
                                                <p className="text-lg font-bold">
                                                    <span className="text-emerald-600">{result.answers.filter((a: any) => a.isCorrect).length} Correct</span>
                                                    <span className="mx-2 text-slate-300">/</span>
                                                    <span className="text-red-500">{result.answers.filter((a: any) => !a.isCorrect).length} Incorrect</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-slate-400 shrink-0 border-l border-slate-200 pl-6 h-full flex items-center">
                                            {expandedTests[result._id] ? <ChevronUp className="w-8 h-8" /> : <ChevronDown className="w-8 h-8" />}
                                        </div>
                                    </button>

                                    {/* Expanded Question List */}
                                    {expandedTests[result._id] && (
                                        <div className="p-6 bg-white animate-in slide-in-from-top-2 duration-200">
                                            <h4 className="font-semibold text-slate-800 text-lg mb-4">Question Review</h4>
                                            <div className="space-y-3">
                                                {result.answers.map((ans: any, idx: number) => {
                                                    const isCorrect = ans.isCorrect;
                                                    const q = ans.questionId;

                                                    return (
                                                        <div key={idx} className={`rounded-lg border overflow-hidden ${isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>

                                                            {/* Answer Header */}
                                                            <div className="flex items-start justify-between p-4">
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-white mt-0.5 ${isCorrect ? "bg-emerald-500" : "bg-red-500"}`}>
                                                                        {idx + 1}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-slate-900">
                                                                            Your answer: <span className="font-bold">{ans.userAnswer || "Omitted"}</span>
                                                                        </p>
                                                                        {!isCorrect && q && (
                                                                            <p className="text-sm font-medium text-emerald-700 mt-1">
                                                                                Correct answer: <span className="font-bold">{q.correctAnswer}</span>
                                                                            </p>
                                                                        )}
                                                                        {!isCorrect && q && (
                                                                            <p className="text-xs text-slate-500 mt-2 line-clamp-2">{q.questionText}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="shrink-0 ml-3">
                                                                    {isCorrect ? (
                                                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                                    ) : (
                                                                        <XCircle className="w-5 h-5 text-red-600" />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Actions — wrong answers only */}
                                                            {!isCorrect && q && (
                                                                <>
                                                                    {/* Explanation Toggle Row */}
                                                                    <button
                                                                        onClick={() => handleExpandExplanation(q._id)}
                                                                        disabled={loadingExplanations[q._id]}
                                                                        className="w-full flex items-center justify-between px-4 py-2.5 bg-red-50 border-t border-red-100 text-sm font-medium text-blue-700 hover:bg-red-100 transition-colors"
                                                                    >
                                                                        <span>{loadingExplanations[q._id] ? "Loading..." : expandedExplanations[q._id] ? "Hide Explanation" : "View Explanation"}</span>
                                                                        {expandedExplanations[q._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                                    </button>

                                                                    {/* Explanation Body */}
                                                                    {expandedExplanations[q._id] && (
                                                                        <div className="px-4 py-3 bg-red-50 border-t border-red-100 text-sm text-slate-700 animate-in slide-in-from-top-1 duration-150">
                                                                            <span className="font-bold text-slate-800">Explanation: </span>
                                                                            {expandedExplanations[q._id]}
                                                                        </div>
                                                                    )}

                                                                    {/* AI Tutor Button */}
                                                                    <div className="px-4 py-2.5 border-t border-red-100 flex">
                                                                        <button
                                                                            onClick={() => setActiveChat(
                                                                                activeChat?.questionId === q._id
                                                                                    ? null
                                                                                    : { questionId: q._id, questionText: q.questionText }
                                                                            )}
                                                                            className={`text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${activeChat?.questionId === q._id
                                                                                ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                                                                : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                                                                }`}
                                                                        >
                                                                            <Sparkles className="w-3.5 h-3.5" />
                                                                            {activeChat?.questionId === q._id ? "Tutoring this" : "Ask AI Tutor"}
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Sticky AI Tutor Sidebar */}
                {activeChat && (
                    <div className="w-[400px] shrink-0">
                        <div className="sticky top-[73px] h-[calc(100vh-105px)] flex flex-col rounded-xl border border-indigo-100 shadow-lg overflow-hidden bg-white animate-in slide-in-from-right-4 duration-300">
                            {/* Sidebar Header */}
                            <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-200" />
                                    <div>
                                        <p className="font-bold text-white text-sm">AI Study Tutor</p>
                                        <p className="text-indigo-200 text-xs">Powered by Gemini</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveChat(null)}
                                    className="p-1.5 rounded-full text-indigo-200 hover:text-white hover:bg-indigo-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Context Banner */}
                            <div className="px-4 py-2.5 bg-indigo-50 border-b border-indigo-100 shrink-0">
                                <p className="text-xs text-indigo-600 font-medium">Reviewing question:</p>
                                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{activeChat.questionText}</p>
                            </div>

                            {/* Chatbot */}
                            <ReviewChatbot
                                questionId={activeChat.questionId}
                                questionText={activeChat.questionText}
                                headless
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
