import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/products/[slug] - Get product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("API Error [GET /api/products/[slug]]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
