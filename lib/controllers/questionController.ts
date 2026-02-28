import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { questionService } from "@/lib/services/questionService";

export const questionController = {
    async getQuestions(req: Request) {
        try {
            const { searchParams } = new URL(req.url);
            const testId = searchParams.get("testId");

            const questions = await questionService.getQuestions(testId);
            return NextResponse.json({ questions });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    },

    async createQuestion(req: Request) {
        try {
            const session = await getServerSession(authOptions);
            if (!session || session.user.role !== "admin") {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const body = await req.json();

            try {
                const newQuestion = await questionService.createQuestion(body);
                return NextResponse.json({ question: newQuestion }, { status: 201 });
            } catch (error: any) {
                if (error.name === "ZodError") {
                    return NextResponse.json({ error: error.errors }, { status: 400 });
                }
                if (error.message === "Test not found") {
                    return NextResponse.json({ error: "Test not found" }, { status: 404 });
                }
                throw error;
            }
        } catch (error: any) {
            console.error("POST /api/questions error:", error);
            return NextResponse.json({ error: error.message || "Failed to create question" }, { status: 500 });
        }
    }
};
