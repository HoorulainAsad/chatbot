import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";

export async function GET() {
    console.log("LOG: GET /api/chats - START");
    try {
        console.log("LOG: GET /api/chats - CALLING AUTH()");
        const { userId } = await auth();
        console.log("LOG: GET /api/chats - AUTH SUCCESS:", userId);

        if (!userId) {
            console.log("LOG: GET /api/chats - UNAUTHORIZED");
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("LOG: GET /api/chats - QUERYING PRISMA");
        const chats = await prisma.chat.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                updatedAt: 'desc'
            },
            select: {
                id: true,
                title: true,
                updatedAt: true
            }
        });
        console.log("LOG: GET /api/chats - QUERY SUCCESS. COUNT:", chats.length);

        return Response.json(chats);
    } catch (error: any) {
        console.error("LOG: GET /api/chats - ERROR:", error.message);
        return Response.json({ error: "Failed to fetch chats", details: error.message }, { status: 500 });
    }
}
