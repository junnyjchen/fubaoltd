import { NextRequest, NextResponse } from "next/server";
import { verifyCode } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/verify - Verify talisman authenticity code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;
    
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, error: "Verification code is required" },
        { status: 400 }
      );
    }
    
    const result = await verifyCode(code.trim().toUpperCase());
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code", found: false },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      found: true,
      data: result,
    });
  } catch (error) {
    console.error("API Error [POST /api/verify]:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
