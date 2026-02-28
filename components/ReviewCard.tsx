import { CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface ReviewCardProps {
    idx: number;
    ans: any;
    loadingExplanation: boolean;
    expandedExplanation?: string;
    isActiveChat: boolean;
    onExpandExplanation: (questionId: string) => void;
    onToggleChat: (questionId: string, questionText: string) => void;
}

export default function ReviewCard({
    idx,
    ans,
    loadingExplanation,
    expandedExplanation,
    isActiveChat,
    onExpandExplanation,
    onToggleChat
}: ReviewCardProps) {
    const isCorrect = ans.isCorrect;
    const q = ans.questionId;

    return (
        <div className={`rounded-lg border overflow-hidden ${isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>

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
                        onClick={() => onExpandExplanation(q._id)}
                        disabled={loadingExplanation}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-red-50 border-t border-red-100 text-sm font-medium text-blue-700 hover:bg-red-100 transition-colors"
                    >
                        <span>{loadingExplanation ? "Loading..." : expandedExplanation ? "Hide Explanation" : "View Explanation"}</span>
                        {expandedExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Explanation Body */}
                    {expandedExplanation && (
                        <div className="px-4 py-3 bg-red-50 border-t border-red-100 text-sm text-slate-700 animate-in slide-in-from-top-1 duration-150">
                            <span className="font-bold text-slate-800">Explanation: </span>
                            {expandedExplanation}
                        </div>
                    )}

                    {/* AI Tutor Button */}
                    <div className="px-4 py-2.5 border-t border-red-100 flex">
                        <button
                            onClick={() => onToggleChat(q._id, q.questionText)}
                            className={`text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${isActiveChat
                                ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                }`}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            {isActiveChat ? "Tutoring this" : "Ask AI Tutor"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
