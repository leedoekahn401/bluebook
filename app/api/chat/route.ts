import { chatController } from "@/lib/controllers/chatController";

export async function POST(req: Request) {
    return chatController.postMessage(req);
}

export async function GET(req: Request) {
    return chatController.getChat(req);
}
