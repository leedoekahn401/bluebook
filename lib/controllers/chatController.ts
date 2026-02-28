import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { chatService } from "@/lib/services/chatService";

export const chatController = {
    async getChat(req: Request) {
        try {
            const session = await getServerSession(authOptions);
            if (!session) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const { searchParams } = new URL(req.url);
            const questionId = searchParams.get('questionId');

            if (!questionId) {
                return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
            }

            const messages = await chatService.getChatHistory(session.user.id, questionId);

            return NextResponse.json({ messages });

        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    },

    async postMessage(req: Request) {
        try {
            const session = await getServerSession(authOptions);
            if (!session) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const { questionId, message } = await req.json();
            if (!questionId || !message) {
                return NextResponse.json({ error: "Missing questionId or message" }, { status: 400 });
            }

            const result = await chatService.processMessage(session.user.id, questionId, message);

            return NextResponse.json(result);

        } catch (error: any) {
            console.error("Chat API Error:", error);
            if (error.message === "Gemini API key not configured") {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
};
