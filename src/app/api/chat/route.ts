// Direct Google SDK Implementation (More Reliable)
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma"; // Prepared for next step

export async function POST(req: Request) {
    console.log("--- CHAT API (NATIVE GOOGLE SDK) ---");
    try {
        const { userId } = await auth();
        const body = await req.json().catch(() => ({}));
        const { messages, chatId } = body;

        if (!messages || !Array.isArray(messages)) {
            return Response.json({ error: "No messages" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing API Key");
        }

        // Initialize Google AI
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // prompt construction (simple concatenation for now or last message)
        // Gemini expects a string prompt or a specific chat history format. 
        // For simplicity/reliability, let's send the last query + minimal context.
        const lastMessage = messages[messages.length - 1].content;

        console.log("DEBUG: Sending to Gemini Native:", lastMessage);
        const result = await model.generateContent(lastMessage);
        const responseText = result.response.text();

        console.log("DEBUG: Native Success. Length:", responseText.length);

        // 3. Database Persistence (Blocking to ensure safety)
        if (chatId) {
            try {
                console.log("DEBUG: Saving to Prisma. ChatID:", chatId);

                // CRITICAL FIX: Ensure Parent Chat exists first!
                await prisma.chat.upsert({
                    where: { id: chatId },
                    create: {
                        id: chatId,
                        userId: userId || "guest", // Default to guest if not authenticated, but middleware should protect if needed
                        title: lastMessage.substring(0, 30) || "New Chat"
                    },
                    update: {} // No updates needed if exists
                });

                // Create User Message
                await prisma.message.create({
                    data: {
                        chatId,
                        role: "user",
                        content: lastMessage,
                    },
                });

                // Create Assistant Message
                await prisma.message.create({
                    data: {
                        chatId,
                        role: "assistant",
                        content: responseText,
                    },
                });
                console.log("DEBUG: Prisma save success");
            } catch (dbError: any) {
                // Log but don't fail the request
                console.error("DEBUG: Prisma save failed:", dbError.message);
            }
        }

        return Response.json({ text: responseText });

    } catch (error: any) {
        console.error("DEBUG: Native SDK Error:", error);
        return new Response(JSON.stringify({
            error: "Native SDK Failure",
            details: error.message
        }), { status: 500 });
    }
}
