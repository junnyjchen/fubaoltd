import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Initialize Stripe - uses test mode by default
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// POST /api/checkout - Create a Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, email } = body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }
    
    // Check if Stripe is properly configured
    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && 
      !process.env.STRIPE_SECRET_KEY.startsWith("sk_test_placeholder");
    
    if (!isStripeConfigured) {
      // Return a mock checkout session for demo purposes
      const origin = request.headers.get("origin") || "http://localhost:5000";
      return NextResponse.json({
        success: true,
        demo: true,
        message: "Stripe is not configured. Payment will be available soon.",
        checkoutUrl: `${origin}/checkout?status=demo`,
        sessionId: `demo_${Date.now()}`,
      });
    }
    
    const origin = request.headers.get("origin") || "http://localhost:5000";
    
    const lineItems = items.map((item: { slug: string; name: string; price: number; quantity: number }) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          metadata: {
            slug: item.slug,
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/order/[id]?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${origin}/cart?status=cancelled`,
      customer_email: email,
      metadata: {
        items: JSON.stringify(items),
      },
    });
    
    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("API Error [POST /api/checkout]:", error);
    return NextResponse.json(
      { success: false, error: "Checkout failed" },
      { status: 500 }
    );
  }
}

// GET /api/checkout?session_id=xxx - Get checkout session status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 }
      );
    }
    
    // Handle demo sessions
    if (sessionId.startsWith("demo_")) {
      return NextResponse.json({
        success: true,
        data: {
          id: sessionId,
          payment_status: "paid",
          status: "complete",
          demo: true,
        },
      });
    }
    
    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && 
      !process.env.STRIPE_SECRET_KEY.startsWith("sk_test_placeholder");
    
    if (!isStripeConfigured) {
      return NextResponse.json(
        { success: false, error: "Stripe is not configured" },
        { status: 503 }
      );
    }
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        payment_status: session.payment_status,
        status: session.status,
        customer_email: session.customer_email,
        amount_total: session.amount_total,
      },
    });
  } catch (error) {
    console.error("API Error [GET /api/checkout]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
