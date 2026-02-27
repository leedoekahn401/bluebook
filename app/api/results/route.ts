import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Result from "@/lib/models/Result";
import User, { IUser } from "@/lib/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();

        // Save result
        const newResult = await Result.create({
            ...body,
            userId: session.user.id,
        });

        // Update User Stats
        const user = await User.findById(session.user.id);
        if (user) {
            user.testsTaken.push(body.testId);
            if (body.score > user.highestScore) {
                user.highestScore = body.score;
            }
            const now = new Date();
            if (user.lastTestDate) {
                const last = new Date(user.lastTestDate);
                const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
                const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                const diffTime = todayDay.getTime() - lastDay.getTime();
                const diffDays = diffTime / (1000 * 60 * 60 * 24);

                if (diffDays === 1) {
                    user.streak += 1;
                } else if (diffDays > 1) {
                    user.streak = 1;
                }
                // if diffDays === 0, they already took a test today, streak stays the same
            } else {
                user.streak = 1;
            }
            user.lastTestDate = now;

            // Gather wrong question IDs
            const wrongIds = body.answers
                .filter((ans: any) => !ans.isCorrect)
                .map((ans: any) => ans.questionId);

            user.wrongQuestions.push(...wrongIds);

            await user.save();
        }

        return NextResponse.json({ result: newResult }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Ensure Question model is registered before populating
        require("@/lib/models/Question");

        const results = await Result.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'answers.questionId',
                model: 'Question',
                select: 'questionText correctAnswer _id'
            });

        // Get user for streak info
        const user = await User.findById(session.user.id).select('streak lastTestDate');
        let currentStreak = user?.streak || 0;

        // Check if streak is broken
        if (user?.lastTestDate && currentStreak > 0) {
            const last = new Date(user.lastTestDate);
            const today = new Date();
            const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
            const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            const diffTime = todayDay.getTime() - lastDay.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays > 1) {
                currentStreak = 0;
                user.streak = 0;
                await user.save();
            }
        }

        return NextResponse.json({ results, streak: currentStreak });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
