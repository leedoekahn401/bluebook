import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Test from "@/lib/models/Test";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
    try {
        await dbConnect();
        const tests = await Test.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ tests });
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
        const newTest = await Test.create(body);

        return NextResponse.json({ test: newTest }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
