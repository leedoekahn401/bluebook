import { userController } from "@/lib/controllers/userController";

export async function GET(req: Request) {
    return userController.getUserStats(req);
}
