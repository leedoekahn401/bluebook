import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newPassword, confirmPassword } = body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
        }

        await dbConnect();

        // Get user and explicitly select password field
        const user = await User.findOne({ email: session.user.email }).select("+password");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // If the user registered via a provider and doesn't have a password
        if (!user.password) {
            return NextResponse.json({ error: "Account does not have a password set. You may be using a third-party login provider." }, { status: 400 });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("PUT /api/user/password error:", error);
        return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }
}
