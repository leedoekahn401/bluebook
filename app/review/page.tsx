"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCcw, CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import Loading from "@/components/Loading";
import ReviewChatbot from "@/components/ReviewChatbot";
import ReviewCard from "@/components/ReviewCard";
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
            {/* Main Two-Column Layout */}
            <div className="bg-slate-50 pl-20 pt-10 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">Score Reports &amp; Review</h1>
                </div>
            </div>
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
                                        className="w-full text-left p-6 border-b border-slate-100 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors"
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
                                                {result.answers.map((ans: any, idx: number) => (
                                                    <ReviewCard
                                                        key={idx}
                                                        idx={idx}
                                                        ans={ans}
                                                        loadingExplanation={!!(ans.questionId && loadingExplanations[ans.questionId._id])}
                                                        expandedExplanation={ans.questionId ? expandedExplanations[ans.questionId._id] : undefined}
                                                        isActiveChat={!!(ans.questionId && ans.questionId._id === activeChat?.questionId)}
                                                        onExpandExplanation={handleExpandExplanation}
                                                        onToggleChat={(questionId, questionText) => {
                                                            setActiveChat(
                                                                activeChat?.questionId === questionId
                                                                    ? null
                                                                    : { questionId, questionText }
                                                            );
                                                        }}
                                                    />
                                                ))}
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
