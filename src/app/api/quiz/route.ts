import { NextRequest, NextResponse } from "next/server";
import { getQuizResult } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/quiz - Get Five Elements quiz result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthYear, birthSeason, gender, focus } = body;
    
    if (!birthYear || !birthSeason || !gender || !focus) {
      return NextResponse.json(
        { success: false, error: "All quiz fields are required" },
        { status: 400 }
      );
    }
    
    const result = await getQuizResult({
      birthYear: Number(birthYear),
      birthSeason,
      gender,
      focus,
    });
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("API Error [POST /api/quiz]:", error);
    return NextResponse.json(
      { success: false, error: "Quiz processing failed" },
      { status: 500 }
    );
  }
}
