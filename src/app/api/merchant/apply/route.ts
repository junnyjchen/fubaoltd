// Merchant onboarding application endpoint.
// POST /api/merchant/apply — submit an application (public).

import { NextRequest, NextResponse } from 'next/server';
import { createMerchantApplication } from '@/lib/merchant/merchant-store';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const shopName = String(body.shopName ?? '').trim();
    const contactName = String(body.contactName ?? '').trim();
    const contactEmail = String(body.contactEmail ?? '').trim();
    const contactPhone = String(body.contactPhone ?? '').trim();
    const country = String(body.country ?? '').trim();
    const city = String(body.city ?? '').trim();
    const specialties = Array.isArray(body.specialties)
      ? (body.specialties as string[]).map((s) => String(s))
      : [];
    const businessDescription = String(body.businessDescription ?? '').trim();

    // Defensive validation
    if (!shopName || shopName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Shop name is required (min 2 characters)' },
        { status: 400 }
      );
    }
    if (!contactName) {
      return NextResponse.json(
        { success: false, error: 'Contact name is required' },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return NextResponse.json(
        { success: false, error: 'A valid contact email is required' },
        { status: 400 }
      );
    }
    if (!country || !city) {
      return NextResponse.json(
        { success: false, error: 'Country and city are required' },
        { status: 400 }
      );
    }
    if (businessDescription.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Business description must be at least 20 characters' },
        { status: 400 }
      );
    }

    const application = createMerchantApplication({
      shopName,
      contactName,
      contactEmail,
      contactPhone,
      country,
      city,
      specialties,
      businessDescription,
    });

    return NextResponse.json(
      {
        success: true,
        data: application,
        message:
          'Application submitted. Our team reviews new merchants within 3 business days.',
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
