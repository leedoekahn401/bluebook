import Link from "next/link";
import { Clock, BookOpen, GraduationCap } from "lucide-react";

interface Test {
    _id: string;
    title: string;
    timeLimit: number;
    difficulty: string;
    sections: any[];
}

export default function TestCard({ test }: { test: Test }) {
    // Simple heuristic for total questions based on sections
    const totalQuestions =
        test.sections?.reduce((acc, sec) => acc + sec.questionsCount, 0) || 0;

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-200 transition-all group flex flex-col h-full">
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700">
                        {test.title}
                    </h3>
                    <span
                        className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${test.difficulty === "easy"
                                ? "bg-green-100 text-green-700"
                                : test.difficulty === "hard"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                            }`}
                    >
                        {test.difficulty}
                    </span>
                </div>

                <div className="space-y-2 mt-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{test.timeLimit} Minutes Total</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span>{test.sections?.length || 0} Sections</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <span>{totalQuestions} Questions</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                <Link
                    href={`/test/${test._id}`}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                    Start Practice
                </Link>
            </div>
        </div>
    );
}
