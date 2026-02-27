import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        if (!name || typeof name !== "string") {
            return NextResponse.json({ error: "Invalid name provided" }, { status: 400 });
        }

        await dbConnect();

        // Update the user's name
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { name },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Profile updated successfully", user: { name: updatedUser.name } }, { status: 200 });

    } catch (error: any) {
        console.error("PUT /api/user/settings error:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
