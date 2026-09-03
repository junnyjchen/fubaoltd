import { NextRequest, NextResponse } from "next/server";
import {
  createWish,
  listApprovedWishes,
} from "@/lib/wishes/wish-store";

// Public wish wall API.
// GET  — approved wishes only (paginated, newest first)
// POST — submit a wish for review (approved: false until an admin approves it
//        via /api/admin/wishes; the former unauthenticated PUT approval
//        endpoint was removed — moderation is admin-only now)

// GET - List wishes (with pagination and filtering)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const filteredWishes = listApprovedWishes();

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedWishes = filteredWishes.slice(start, end);

  return NextResponse.json({
    success: true,
    data: {
      wishes: paginatedWishes,
      pagination: {
        page,
        limit,
        total: filteredWishes.length,
        totalPages: Math.ceil(filteredWishes.length / limit),
      },
    },
  });
}

// POST - Create a new wish
export async function POST(request: NextRequest) {
  try {
    const {
      orderId,
      userName,
      productName,
      content,
      mediaType = "text",
      mediaUrl,
      rating = 5,
    } = await request.json();

    if (!userName || !content || !productName) {
      return NextResponse.json(
        { error: "userName, productName, and content are required" },
        { status: 400 }
      );
    }

    const newWish = createWish({
      orderId,
      userName,
      productName,
      content,
      mediaType,
      mediaUrl,
      rating,
    });

    return NextResponse.json(
      {
        success: true,
        data: newWish,
        message:
          "Wish submitted successfully. It will be reviewed before publishing.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create wish error:", error);
    return NextResponse.json(
      { error: "Failed to create wish" },
      { status: 500 }
    );
  }
}
