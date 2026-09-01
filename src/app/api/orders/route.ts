import { NextRequest, NextResponse } from "next/server";
import { submitOrder, getOrderById } from "@/lib/api";
import type { OrderItem } from "@/lib/data/types";

export const dynamic = "force-dynamic";

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingInfo, email } = body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must contain at least one item" },
        { status: 400 }
      );
    }
    
    if (!shippingInfo || !email) {
      return NextResponse.json(
        { success: false, error: "Shipping info and email are required" },
        { status: 400 }
      );
    }
    
    const orderItems: OrderItem[] = items.map((item: OrderItem) => ({
      slug: item.slug,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageKey: item.imageKey,
    }));
    
    const order = await submitOrder({
      items: orderItems,
      shippingInfo: {
        fullName: shippingInfo.fullName,
        email: email,
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country,
      },
      email,
    });
    
    return NextResponse.json({
      success: true,
      data: order,
    }, { status: 201 });
  } catch (error) {
    console.error("API Error [POST /api/orders]:", error);
    return NextResponse.json(
      { success: false, error: "Order creation failed" },
      { status: 500 }
    );
  }
}

// GET /api/orders?id=xxx - Get order by ID (query param)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }
    
    const order = await getOrderById(id);
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("API Error [GET /api/orders]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
