import { NextRequest, NextResponse } from "next/server";

// In-memory storage for wishes (replace with database in production)
interface Wish {
  id: string;
  orderId?: string;
  userName: string;
  productName: string;
  content: string;
  mediaType: "text" | "image" | "video";
  mediaUrl?: string;
  rating: number;
  createdAt: string;
  approved: boolean;
}

// Mock data for demonstration
const mockWishes: Wish[] = [
  {
    id: "wish-001",
    orderId: "FB-ORD-001",
    userName: "Sarah M.",
    productName: "Protection Talisman",
    content: "I've been carrying this talisman for three months now. While I don't believe in supernatural powers, it serves as a beautiful reminder of my trip to Hong Kong and the incredible craftsmanship of Taoist art. The cinnabar ink is still vibrant!",
    mediaType: "text",
    rating: 5,
    createdAt: "2025-02-15T10:00:00Z",
    approved: true,
  },
  {
    id: "wish-002",
    orderId: "FB-ORD-002",
    userName: "Michael L.",
    productName: "Home Blessing Talisman",
    content: "Bought this as a housewarming gift for my parents. They loved the cultural significance and the beautiful presentation. The certificate of consecration added a nice touch of authenticity.",
    mediaType: "text",
    rating: 5,
    createdAt: "2025-02-10T14:30:00Z",
    approved: true,
  },
  {
    id: "wish-003",
    orderId: "FB-ORD-003",
    userName: "Emily C.",
    productName: "Energy Blessing Box",
    content: "The gift set exceeded my expectations! The cultural handbook was incredibly informative, and the copper coin pendant is now my favorite accessory. Each piece tells a story of centuries-old traditions.",
    mediaType: "text",
    rating: 4,
    createdAt: "2025-02-05T09:15:00Z",
    approved: true,
  },
  {
    id: "wish-004",
    orderId: "FB-ORD-004",
    userName: "David W.",
    productName: "Career Success Talisman",
    content: "I'm a collector of cultural artifacts, and this talisman is a masterpiece. The hand-drawn details are exquisite. Whether or not you believe in the spiritual aspects, it's undeniably a piece of living cultural heritage.",
    mediaType: "text",
    rating: 5,
    createdAt: "2025-01-28T16:45:00Z",
    approved: true,
  },
  {
    id: "wish-005",
    orderId: "FB-ORD-005",
    userName: "Jennifer K.",
    productName: "Personalized Birth-Chart Talisman",
    content: "The personalized aspect made this extra special. Master Chen took the time to understand my birth chart and create something unique. It's now displayed prominently in my meditation space.",
    mediaType: "text",
    rating: 5,
    createdAt: "2025-01-20T11:20:00Z",
    approved: true,
  },
];

let wishes = [...mockWishes];

// GET - List wishes (with pagination and filtering)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const approved = searchParams.get("approved");

  let filteredWishes = wishes;

  if (approved !== null) {
    filteredWishes = wishes.filter((w) => w.approved === (approved === "true"));
  } else {
    // By default, only show approved wishes to public
    filteredWishes = wishes.filter((w) => w.approved);
  }

  // Sort by creation date (newest first)
  filteredWishes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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

    const newWish: Wish = {
      id: `wish-${Date.now()}`,
      orderId,
      userName,
      productName,
      content,
      mediaType,
      mediaUrl,
      rating: Math.min(5, Math.max(1, rating)),
      createdAt: new Date().toISOString(),
      approved: false, // Requires admin approval
    };

    wishes.push(newWish);

    return NextResponse.json(
      {
        success: true,
        data: newWish,
        message: "Wish submitted successfully. It will be reviewed before publishing.",
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

// PUT - Update wish (for admin approval)
export async function PUT(request: NextRequest) {
  try {
    const { id, approved } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Wish ID is required" },
        { status: 400 }
      );
    }

    const wishIndex = wishes.findIndex((w) => w.id === id);
    if (wishIndex === -1) {
      return NextResponse.json(
        { error: "Wish not found" },
        { status: 404 }
      );
    }

    if (approved !== undefined) {
      wishes[wishIndex].approved = approved;
    }

    return NextResponse.json({
      success: true,
      data: wishes[wishIndex],
    });
  } catch (error) {
    console.error("Update wish error:", error);
    return NextResponse.json(
      { error: "Failed to update wish" },
      { status: 500 }
    );
  }
}
