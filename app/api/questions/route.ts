import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Question from "@/lib/models/Question";
import Test from "@/lib/models/Test";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const testId = searchParams.get("testId");

        await dbConnect();
        let query = {};
        if (testId) {
            query = { testId };
        }

        const questions = await Question.find(query);
        return NextResponse.json({ questions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();

        // Verify test exists
        const test = await Test.findById(body.testId);
        if (!test) {
            return NextResponse.json({ error: "Test not found" }, { status: 404 });
        }

        const newQuestion = await Question.create(body);

        // Add question ref to test
        if (!test.questions) {
            test.questions = [];
        }
        test.questions.push(newQuestion._id as any);
        await test.save();

        return NextResponse.json({ question: newQuestion }, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/questions error:", error);
        return NextResponse.json({ error: error.message || "Failed to create question" }, { status: 500 });
    }
}
