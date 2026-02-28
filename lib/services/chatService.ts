import dbConnect from "@/lib/mongodb";
import Chat from "@/lib/models/Chat";
import Question from "@/lib/models/Question";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const chatService = {
    async getChatHistory(userId: string, questionId: string) {
        await dbConnect();
        const chat = await Chat.findOne({ userId, questionId });
        return chat ? chat.messages : [];
    },

    async processMessage(userId: string, questionId: string, message: string) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Gemini API key not configured");
        }

        await dbConnect();

        let chat = await Chat.findOne({ userId, questionId });
        const question = await Question.findById(questionId);

        if (!chat) {
            chat = new Chat({
                userId,
                questionId,
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

        return {
            response: aiResponse,
            messages: chat.messages
        };
    }
};
