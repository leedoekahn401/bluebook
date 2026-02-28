import dbConnect from "@/lib/mongodb";
import Result from "@/lib/models/Result";
import User, { IUser } from "@/lib/models/User";

export const resultService = {
    async createResult(userId: string, data: any) {
        await dbConnect();

        // Save result
        const newResult = await Result.create({
            ...data,
            userId: userId,
        });

        // Update User Stats
        const user = await User.findById(userId);
        if (user) {
            user.testsTaken.push(data.testId);
            if (data.score > user.highestScore) {
                user.highestScore = data.score;
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
            const wrongIds = data.answers
                .filter((ans: any) => !ans.isCorrect)
                .map((ans: any) => ans.questionId);

            user.wrongQuestions.push(...wrongIds);

            await user.save();
        }

        return newResult;
    },

    async getUserResults(userId: string) {
        await dbConnect();

        // Ensure Question model is registered before populating
        require("@/lib/models/Question");

        const results = await Result.find({ userId: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'answers.questionId',
                model: 'Question',
                select: 'questionText correctAnswer _id'
            });

        // Get user for streak info
        const user = await User.findById(userId).select('streak lastTestDate');
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

        return { results, streak: currentStreak };
    }
};
