import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/products - List all products with optional category filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    
    const products = await getProducts(category || undefined);
    
    return NextResponse.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error) {
    console.error("API Error [GET /api/products]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
