import dbConnect from "@/lib/mongodb";
import Question from "@/lib/models/Question";
import Test from "@/lib/models/Test";
import { QuestionValidationSchema } from "@/lib/schema/question";
import { z } from "zod";

export const questionService = {
    async getQuestions(testId?: string | null) {
        await dbConnect();
        let query = {};
        if (testId) {
            query = { testId };
        }

        const questions = await Question.find(query);
        return questions;
    },

    async createQuestion(data: any) {
        try {
            const validatedData = QuestionValidationSchema.parse(data);
            await dbConnect();

            const test = await Test.findById(validatedData.testId);
            if (!test) {
                throw new Error("Test not found");
            }

            const newQuestion = await Question.create(validatedData);

            // Add question ref to test
            if (!test.questions) {
                test.questions = [];
            }
            test.questions.push(newQuestion._id as any);
            await test.save();

            return newQuestion;
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                const err: any = new Error("Validation Error");
                err.errors = (error as any).errors;
                err.name = "ZodError";
                throw err;
            }
            throw error;
        }
    }
};
