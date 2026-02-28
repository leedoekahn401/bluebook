import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { testService } from "@/lib/services/testService";

export const testController = {
    async getTests(req: Request) {
        try {
            const { searchParams } = new URL(req.url);
            const page = parseInt(searchParams.get("page") || "1");
            const limit = parseInt(searchParams.get("limit") || "10");
            const sortBy = searchParams.get("sortBy") || "createdAt";
            const sortOrder = searchParams.get("sortOrder") || "desc";

            const result = await testService.getTests(page, limit, sortBy, sortOrder);

            return NextResponse.json(result);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    },

    async createTest(req: Request) {
        try {
            const session = await getServerSession(authOptions);
            if (!session || session.user.role !== "admin") {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const body = await req.json();

            try {
                const newTest = await testService.createTest(body);
                return NextResponse.json({ test: newTest }, { status: 201 });
            } catch (error: any) {
                if (error.name === "ZodError") {
                    return NextResponse.json({ error: error.errors }, { status: 400 });
                }
                throw error;
            }
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
};
