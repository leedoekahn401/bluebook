import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { resultService } from "@/lib/services/resultService";

export const resultController = {
    async createResult(req: Request) {
        try {
            const session = await getServerSession(authOptions);
            if (!session) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const body = await req.json();
            const newResult = await resultService.createResult(session.user.id, body);

            return NextResponse.json({ result: newResult }, { status: 201 });
        } catch (error: any) {
            console.error("Error creating result:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    },

    async getUserResults(req: Request) {
        try {
            const session = await getServerSession(authOptions);
            if (!session) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const url = new URL(req.url);
            const daysQuery = url.searchParams.get("days");
            const days = daysQuery ? parseInt(daysQuery) : undefined;

            const data = await resultService.getUserResults(session.user.id, days);
            return NextResponse.json(data);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
};
