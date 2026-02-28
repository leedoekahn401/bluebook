import dbConnect from "@/lib/mongodb";
import Test from "@/lib/models/Test";
import { TestValidationSchema } from "@/lib/validations/test";
import { z } from "zod";

export const testService = {
    async getTests(page: number, limit: number, sortBy: string, sortOrder: string) {
        await dbConnect();

        const skip = (page - 1) * limit;

        const sortObj: any = {};
        sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

        const totalTests = await Test.countDocuments({});
        const tests = await Test.find({}).sort(sortObj).skip(skip).limit(limit);

        return {
            tests,
            pagination: {
                total: totalTests,
                page,
                limit,
                totalPages: Math.ceil(totalTests / limit)
            }
        };
    },

    async createTest(data: any) {
        try {
            const validatedData = TestValidationSchema.parse(data);
            await dbConnect();
            const newTest = await Test.create(validatedData);

            return newTest;
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
