"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Save, FileText, CheckCircle, ListPlus, Trash2 } from "lucide-react";
import Loading from "@/components/Loading";
import api from "@/lib/axios";
import { API_PATHS } from "@/lib/apiPaths";

export default function AdminDashboard() {
    const { data: session, status } = useSession();

    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // State for Test Creation
    const [testForm, setTestForm] = useState({
        title: "",
        timeLimit: 120,
        difficulty: "medium",
    });
    const [testMessage, setTestMessage] = useState("");

    // State for Question Creation
    const [selectedTestId, setSelectedTestId] = useState("");
    const [questionForm, setQuestionForm] = useState({
        section: "Reading and Writing",
        questionText: "",
        passage: "",
        choices: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
        difficulty: "medium",
        points: 10
    });
    const [questionMessage, setQuestionMessage] = useState("");

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const res = await api.get(API_PATHS.TESTS);
            const data = res.data;
            setTests(data.tests || []);
            if (data.tests?.length > 0 && !selectedTestId) {
                setSelectedTestId(data.tests[0]._id);
            }
        } catch (e) {
            console.error("Failed to fetch tests", e);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) return <Loading />;

    if (!session || session.user.role !== "admin") {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="p-8 text-red-600 font-bold bg-white rounded-lg border border-slate-200">Unauthorized. Admin access required.</div></div>;
    }

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setTestMessage("");

        try {
            const res = await api.post(API_PATHS.TESTS, {
                ...testForm,
                sections: [
                    { name: "Reading and Writing", questionsCount: 27, timeLimit: 32 },
                    { name: "Math", questionsCount: 22, timeLimit: 35 }
                ]
            });

            if (res.status === 200 || res.status === 201) {
                setTestMessage("Test created successfully!");
                setTestForm({ title: "", timeLimit: 120, difficulty: "medium" });
                fetchTests(); // Refresh test list
            } else {
                setTestMessage(`Error: ${res.data.error || "Error creating test."}`);
            }
        } catch (err: any) {
            console.error(err);
            setTestMessage("Network error");
        }
    };

    const handleChoiceChange = (index: number, value: string) => {
        const newChoices = [...questionForm.choices];
        newChoices[index] = value;
        setQuestionForm({ ...questionForm, choices: newChoices });
    };

    const handleCreateQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        setQuestionMessage("");

        if (!selectedTestId) {
            setQuestionMessage("Please select a test first.");
            return;
        }

        // Validation
        if (!questionForm.choices.includes(questionForm.correctAnswer)) {
            setQuestionMessage("The correct answer must exactly match one of the choices.");
            return;
        }

        try {
            const res = await api.post(API_PATHS.QUESTIONS, {
                ...questionForm,
                testId: selectedTestId
            });

            if (res.status === 200 || res.status === 201) {
                setQuestionMessage("Question added successfully!");
                // Reset form but keep section and test selection
                setQuestionForm({
                    ...questionForm,
                    questionText: "",
                    passage: "",
                    choices: ["", "", "", ""],
                    correctAnswer: "",
                    explanation: "",
                });
            } else {
                console.error("Failed to add question:", res.data);
                setQuestionMessage(`Error: ${res.data.error || "Unknown database error"}`);
            }
        } catch (err: any) {
            console.error(err);
            setQuestionMessage("Network error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 pb-24">
            <div className="max-w-5xl mx-auto space-y-8">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Test Creation */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="p-5 border-b border-slate-200 bg-slate-100 flex items-center gap-2 text-slate-800 font-bold">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Step 1: Create Test
                            </div>

                            <form className="p-5 space-y-5" onSubmit={handleCreateTest}>
                                {testMessage && (
                                    <div className={`p-3 rounded-lg font-medium text-sm ${testMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {testMessage}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Test Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={testForm.title}
                                        onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                                        placeholder="e.g. Official Practice Test 1"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-slate-900"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Minutes</label>
                                        <input
                                            type="number"
                                            required
                                            value={Number.isNaN(testForm.timeLimit) ? "" : testForm.timeLimit}
                                            onChange={(e) => setTestForm({ ...testForm, timeLimit: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Difficulty</label>
                                        <select
                                            value={testForm.difficulty}
                                            onChange={(e) => setTestForm({ ...testForm, difficulty: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-slate-900"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex justify-center items-center gap-2 font-medium text-sm"
                                >
                                    <Plus className="w-4 h-4" /> Create Test
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Question Creation */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="p-5 border-b border-slate-200 bg-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-800 font-bold">
                                    <ListPlus className="w-5 h-5 text-blue-600" />
                                    Step 2: Add Questions to Test
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-semibold text-slate-600">Select Test:</label>
                                    <select
                                        value={selectedTestId}
                                        onChange={(e) => setSelectedTestId(e.target.value)}
                                        className="px-3 py-1.5 border border-slate-300 rounded-md font-medium text-sm outline-none bg-white text-slate-900 min-w-[200px]"
                                    >
                                        {tests.map(t => (
                                            <option key={t._id} value={t._id}>{t.title}</option>
                                        ))}
                                        {tests.length === 0 && <option value="">No tests available</option>}
                                    </select>
                                </div>
                            </div>

                            <form className="p-6 space-y-6" onSubmit={handleCreateQuestion}>
                                {questionMessage && (
                                    <div className={`p-4 rounded-lg font-medium text-sm flex items-center gap-2 ${questionMessage.includes('success') ? 'bg-green-50 justify-center text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {questionMessage.includes('success') && <CheckCircle className="w-5 h-5" />}
                                        {questionMessage}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Section</label>
                                        <select
                                            value={questionForm.section}
                                            onChange={(e) => setQuestionForm({ ...questionForm, section: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                                        >
                                            <option value="Reading and Writing">Reading and Writing</option>
                                            <option value="Math">Math</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Difficulty</label>
                                        <select
                                            value={questionForm.difficulty}
                                            onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Points</label>
                                        <input
                                            type="number"
                                            required
                                            value={Number.isNaN(questionForm.points) ? "" : questionForm.points}
                                            onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Passage (Optional)</label>
                                        <textarea
                                            rows={4}
                                            value={questionForm.passage}
                                            onChange={(e) => setQuestionForm({ ...questionForm, passage: e.target.value })}
                                            placeholder="Text passage for reading questions..."
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-serif resize-none bg-white text-slate-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Question Text *</label>
                                        <textarea
                                            rows={3}
                                            required
                                            value={questionForm.questionText}
                                            onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                                            placeholder="The actual question..."
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none bg-white text-slate-900"
                                        />
                                    </div>

                                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <label className="block text-sm font-bold text-slate-800">Multiple Choice Options</label>
                                        {questionForm.choices.map((choice, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="w-8 h-8 flex items-center justify-center bg-slate-200 text-slate-700 font-bold rounded shrink-0">
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                <input
                                                    type="text"
                                                    required
                                                    value={choice}
                                                    onChange={(e) => handleChoiceChange(i, e.target.value)}
                                                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-emerald-700 mb-1">Correct Answer *</label>
                                            <select
                                                required
                                                value={questionForm.correctAnswer}
                                                onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                                                className="w-full px-4 py-2 border border-emerald-300 bg-emerald-50 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                                            >
                                                <option value="" disabled className="">Select correct choice</option>
                                                {questionForm.choices.map((choice, i) => (
                                                    <option key={i} value={choice} disabled={!choice} className="">
                                                        {choice ? `Option ${String.fromCharCode(65 + i)}: ${choice}` : `Option ${String.fromCharCode(65 + i)} (Empty)`}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-slate-500 mt-1">Select from the choices above.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Explanation</label>
                                            <textarea
                                                rows={2}
                                                required
                                                value={questionForm.explanation}
                                                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                                                placeholder="Why is this correct?"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white text-slate-900"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={!selectedTestId || tests.length === 0}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-5 h-5" /> Save Question
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

import { Settings } from "lucide-react";
