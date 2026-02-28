import { testController } from "@/lib/controllers/testController";

export async function GET(req: Request) {
    return testController.getTests(req);
}

export async function POST(req: Request) {
    return testController.createTest(req);
}
