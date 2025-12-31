import { auth } from "@clerk/nextjs/server";

export async function GET() {
    console.log("DEBUG: /api/debug-auth - START");
    try {
        console.log("DEBUG: /api/debug-auth - CALLING AUTH()");
        const authData = await auth();
        console.log("DEBUG: /api/debug-auth - AUTH SUCCESS:", authData.userId);
        return Response.json({ status: "success", userId: authData.userId });
    } catch (error: any) {
        console.error("DEBUG: /api/debug-auth - ERROR:", error.message);
        return Response.json({ status: "error", message: error.message }, { status: 500 });
    }
}
