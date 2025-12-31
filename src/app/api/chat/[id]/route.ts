import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: chatId } = await params;
    console.log(`LOG: GET /api/chat/${chatId} - START`);
    try {
        console.log(`LOG: GET /api/chat/${chatId} - CALLING AUTH()`);
        const { userId } = await auth();
        console.log(`LOG: GET /api/chat/${chatId} - AUTH SUCCESS:`, userId);

        if (!chatId) {
            return Response.json({ error: "Missing chatId" }, { status: 400 });
        }

        console.log(`LOG: GET /api/chat/${chatId} - QUERYING PRISMA`);
        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
                userId: userId || "guest"
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        if (!chat) {
            console.log(`LOG: GET /api/chat/${chatId} - NOT FOUND`);
            return Response.json({ error: "Chat not found" }, { status: 404 });
        }

        console.log(`LOG: GET /api/chat/${chatId} - SUCCESS`);
        return Response.json(chat);
    } catch (error: any) {
        console.error(`LOG: GET /api/chat/${chatId} - ERROR:`, error.message);
        return Response.json({ error: "Failed to fetch chat messages", details: error.message }, { status: 500 });
    }
}
