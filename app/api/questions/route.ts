import { questionController } from "@/lib/controllers/questionController";

export async function GET(req: Request) {
    return questionController.getQuestions(req);
}

export async function POST(req: Request) {
    return questionController.createQuestion(req);
}
