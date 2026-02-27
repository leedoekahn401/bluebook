"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TestHeader, TestFooter } from "@/components/TestLayout";
import QuestionViewer from "@/components/QuestionViewer";
import Loading from "@/components/Loading";
import DesmosCalculator from "@/components/DesmosCalculator";
import api from "@/lib/axios";
import { API_PATHS } from "@/lib/apiPaths";

export default function TestEngine({ testId }: { testId: string }) {
    const router = useRouter();

    // Data State
    const [testStats, setTestStats] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // User Interaction State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [flagged, setFlagged] = useState<Record<string, boolean>>({});

    // Timer State
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTimerHidden, setIsTimerHidden] = useState(false);

    // Tools State
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

    // Load questions
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await api.get(API_PATHS.getQuestionsByTestId(testId));
                const data = res.data;

                // Let's assume there's an API giving us test info as well, or we pass it
                // For now, setting mock test info based on length
                const minutes = 60; // Hardcoded fallback

                setQuestions(data.questions || []);
                setTimeRemaining(minutes * 60);

                // Name stored from dashboard 
                sessionStorage.setItem('testName', 'Practice Test Simulation');
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [testId]);

    // Timer Countdown
    useEffect(() => {
        if (loading || timeRemaining <= 0) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [loading, timeRemaining]);


    const handleAnswerSelect = (questionId: string, choice: string) => {
        setAnswers({ ...answers, [questionId]: choice });
    };

    const toggleFlag = (questionId: string) => {
        setFlagged({ ...flagged, [questionId]: !flagged[questionId] });
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const handleJump = (index: number) => {
        setCurrentIndex(index);
    };

    const handleSubmit = async () => {
        try {
            // Calculate score locally mapping to results format
            const formattedAnswers = questions.map(q => {
                const userAns = answers[q._id] || "";
                return {
                    questionId: q._id,
                    userAnswer: userAns,
                    isCorrect: userAns === q.correctAnswer
                };
            });

            const correctCount = formattedAnswers.filter(a => a.isCorrect).length;
            // Simple mock scoring logic
            const score = 400 + Math.floor((correctCount / questions.length) * 1200);

            const res = await api.post(API_PATHS.RESULTS, {
                testId,
                answers: formattedAnswers,
                score,
                sectionBreakdown: { readingAndWriting: score / 2, math: score / 2 }
            });

            if (res.status === 200 || res.status === 201) {
                router.push("/review");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to submit test");
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loading /></div>;

    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
                <h1 className="text-2xl font-bold mb-4 text-slate-900">No questions found!</h1>
                <button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Return to Dashboard</button>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="min-h-screen flex flex-col bg-white overflow-hidden relative selection:bg-yellow-200">
            <TestHeader
                sectionName={currentQuestion.section || "Section 1"}
                timeRemaining={timeRemaining}
                onTimeUp={handleSubmit}
                isTimerHidden={isTimerHidden}
                setIsTimerHidden={setIsTimerHidden}
                onToggleCalculator={() => setIsCalculatorOpen(!isCalculatorOpen)}
            />

            <DesmosCalculator
                isOpen={isCalculatorOpen}
                onClose={() => setIsCalculatorOpen(false)}
            />

            <main className="flex-1 w-full bg-white relative">
                <QuestionViewer
                    question={currentQuestion}
                    userAnswer={answers[currentQuestion._id]}
                    onAnswerSelect={handleAnswerSelect}
                    isFlagged={!!flagged[currentQuestion._id]}
                    onToggleFlag={toggleFlag}
                    index={currentIndex}
                />
            </main>

            
            <button
                onClick={() => {
                    if (confirm("Are you sure you want to end this section and submit your test?")) {
                        handleSubmit();
                    }
                }}
                className="fixed top-3 right-6 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded z-[60] text-sm"
            >
                Submit Test
            </button>

            <TestFooter
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                onNext={handleNext}
                onPrev={handlePrev}
                onJump={handleJump}
                answers={answers}
                flagged={flagged}
                questions={questions}
            />
        </div>
    );
}
