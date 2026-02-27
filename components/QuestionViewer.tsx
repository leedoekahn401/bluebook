"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";

interface QuestionViewerProps {
    question: any;
    userAnswer: string;
    onAnswerSelect: (questionId: string, choice: string) => void;
    isFlagged: boolean;
    onToggleFlag: (questionId: string) => void;
    index: number;
}

export default function QuestionViewer({
    question,
    userAnswer,
    onAnswerSelect,
    isFlagged,
    onToggleFlag,
    index
}: QuestionViewerProps) {
    // Option labels A, B, C, D
    const optionLabels = ["A", "B", "C", "D"];

    // Crossed-out options simulator (strikes out choices you know are wrong)
    const [crossedOut, setCrossedOut] = useState<string[]>([]);

    const toggleCrossOut = (e: React.MouseEvent, choice: string) => {
        e.stopPropagation();
        if (crossedOut.includes(choice)) {
            setCrossedOut(crossedOut.filter(c => c !== choice));
        } else {
            setCrossedOut([...crossedOut, choice]);
        }
    };

    return (
        <div className="flex-1 flex bg-[#f7f8f9] h-[calc(100vh-8rem)] mt-16 mb-16 overflow-hidden">

            {/* Left Panel: Passage Text (if exists) */}
            <div className={`
        ${question.passage ? "w-1/2 border-r border-slate-300" : "hidden"} 
        h-full overflow-y-auto p-8 lg:p-12
      `}>
                {question.passage && (
                    <div className="bg-white p-8 border border-slate-200 text-lg leading-relaxed font-serif text-slate-800 rounded-lg selection:bg-yellow-200 selection:text-black">
                        {/* Real bluebook lets you highlight text here. 
                Using basic CSS selection for now. */}
                        <div dangerouslySetInnerHTML={{ __html: question.passage.replace(/\n/g, '<br/>') }} />
                    </div>
                )}
            </div>

            {/* Right Panel: Question & Answers */}
            <div className={`
        ${question.passage ? "w-1/2" : "w-full max-w-4xl mx-auto"} 
        h-full overflow-y-auto p-8 lg:p-12 bg-white
      `}>
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white w-8 h-8 flex items-center justify-center font-bold text-lg rounded-sm">
                            {index + 1}
                        </div>
                        {isFlagged && <div className="text-sm font-semibold text-amber-600 flex items-center gap-1"><Flag className="w-4 h-4 fill-amber-500" /> Marked for Review</div>}
                    </div>

                    <button
                        onClick={() => onToggleFlag(question._id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold text-sm border ${isFlagged
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <Flag className={`w-4 h-4 ${isFlagged ? "fill-amber-500" : ""}`} />
                        Mark for Review
                    </button>
                </div>

                <div className="prose max-w-none text-xl text-slate-900 mb-8 font-medium leading-relaxed">
                    {question.questionText}
                </div>

                <div className="space-y-4">
                    {question.choices.map((choice: string, i: number) => {
                        const isSelected = userAnswer === choice;
                        const isCrossed = crossedOut.includes(choice);
                        const label = optionLabels[i] || "";

                        return (
                            <div
                                key={i}
                                className={`relative flex items-center group cursor-pointer`}
                                onClick={() => !isCrossed && onAnswerSelect(question._id, choice)}
                            >
                                <button
                                    onClick={(e) => toggleCrossOut(e, choice)}
                                    className="absolute -left-12 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                                    title="Cross out choice"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className={`
                   flex-1 flex items-start gap-4 p-4 border-2 rounded-lg transition-all
                   ${isSelected ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-white hover:border-slate-500"}
                   ${isCrossed ? "opacity-40 grayscale pointer-events-none" : ""}
                 `}>
                                    {/* Radio Button simulating Bluebook bubble */}
                                    <div className="pt-1">
                                        <div className={`
                        w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold
                        ${isSelected ? "border-blue-600 font-bold" : "border-slate-400 text-slate-500"}
                      `}>
                                            {isSelected ? (
                                                <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center rounded-full">
                                                    {label}
                                                </div>
                                            ) : (
                                                label
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 pt-1.5 text-lg text-slate-800 font-medium">
                                        <span className={isCrossed ? "line-through text-slate-400" : ""}>
                                            {choice}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
