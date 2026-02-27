import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestion extends Document {
    testId: mongoose.Types.ObjectId;
    section: string;
    questionText: string;
    passage?: string; // Optional
    choices: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: "easy" | "medium" | "hard";
    points: number;
}

const QuestionSchema: Schema<IQuestion> = new Schema(
    {
        testId: { type: Schema.Types.ObjectId, ref: "Test", required: true },
        section: { type: String, required: true },
        questionText: { type: String, required: true },
        passage: { type: String, required: false },
        choices: [{ type: String, required: true }],
        correctAnswer: { type: String, required: true },
        explanation: { type: String, required: true },
        difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
        points: { type: Number, default: 10 },
    },
    { timestamps: true }
);

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);
export default Question;
