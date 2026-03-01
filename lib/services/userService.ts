import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export const userService = {
    async getUserStats(userId: string) {
        await dbConnect();

        const user = await User.findById(userId).select("testsTaken highestScore");
        if (!user) {
            throw new Error("User not found");
        }

        return {
            testsTaken: user.testsTaken.length,
            highestScore: user.highestScore
        };
    }
};
