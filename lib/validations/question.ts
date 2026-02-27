import { z } from "zod";

export const QuestionValidationSchema = z.object({
    testId: z.string().min(1, "Test ID is required"),
    section: z.string().min(1, "Section is required"),
    questionText: z.string().min(1, "Question text is required"),
    passage: z.string().optional(),
    choices: z.array(z.string()).min(2, "At least two choices are required"),
    correctAnswer: z.string().min(1, "Correct answer is required"),
    explanation: z.string().min(1, "Explanation is required"),
    difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
    points: z.number().min(1).default(10),
});

export type QuestionInput = z.infer<typeof QuestionValidationSchema>;
