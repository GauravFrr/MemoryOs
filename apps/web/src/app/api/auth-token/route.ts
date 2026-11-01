import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const token = await session.getToken();
    
    const origin = req.headers.get("origin") || "https://claude.ai";
    
    if (!token) {
      const response = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      return response;
    }
    
    const response = NextResponse.json({ token });
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: `Internal error: ${err.message}` }, { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "https://claude.ai";
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}
