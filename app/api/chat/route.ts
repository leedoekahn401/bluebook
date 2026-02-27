import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Chat from "@/lib/models/Chat";
import Question from "@/lib/models/Question";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { questionId, message } = await req.json();
        if (!questionId || !message) {
            return NextResponse.json({ error: "Missing questionId or message" }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        await dbConnect();

        // Find or create chat session
        let chat = await Chat.findOne({ userId: session.user.id, questionId });

        // Fetch context (the specific question they are asking about)
        const question = await Question.findById(questionId);

        if (!chat) {
            chat = new Chat({
                userId: session.user.id,
                questionId: questionId,
                messages: []
            });
        }

        // Prepare existing history for Gemini SDK
        const history = chat.messages.map(m => ({
            role: m.role,
            parts: m.parts.map(p => ({ text: p.text })),
        }));

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `You are an expert, encouraging SAT tutor. 
            The student is reviewing a practice question they took.
            The question they are reviewing is: "${question?.questionText || 'Unknown'}".
            The correct answer is: "${question?.correctAnswer || 'Unknown'}".
            Their goal is to understand why they got it wrong or learn the underlying concepts.
            Answer their questions pedagogically—guide them to the answer rather than just giving it away.
            ALWAYS proactively recommend specific Khan Academy topics or search terms they should look up on Khan Academy to master the concept being tested. Format the Khan Academy recommendations clearly in bullet points.`
        });

        const chatSession = model.startChat({
            history: history,
        });

        const result = await chatSession.sendMessage(message);
        const aiResponse = result.response.text();

        // Save new user message
        chat.messages.push({
            role: "user",
            parts: [{ text: message }],
            timestamp: new Date()
        });

        // Save AI response
        chat.messages.push({
            role: "model",
            parts: [{ text: aiResponse }],
            timestamp: new Date()
        });

        await chat.save();

        return NextResponse.json({
            response: aiResponse,
            messages: chat.messages
        });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
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

        await dbConnect();

        const chat = await Chat.findOne({ userId: session.user.id, questionId });

        return NextResponse.json({
            messages: chat ? chat.messages : []
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
