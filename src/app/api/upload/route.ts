import { NextRequest, NextResponse } from "next/server";
import { S3Storage } from "coze-coding-dev-sdk";

export const dynamic = "force-dynamic";

// Initialize S3 Storage
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: "",
  secretKey: "",
  bucketName: process.env.COZE_BUCKET_NAME,
  region: "cn-beijing",
});

// POST /api/upload - Upload image to object storage
export async function POST(request: NextRequest) {
  try {
    // Check if storage is configured
    const isStorageConfigured = process.env.COZE_BUCKET_ENDPOINT_URL && 
      process.env.COZE_BUCKET_NAME;
    
    if (!isStorageConfigured) {
      return NextResponse.json(
        { success: false, error: "Object storage not configured" },
        { status: 503 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate a safe filename
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `products/${Date.now()}_${safeFileName}`;
    
    // Upload file
    const key = await storage.uploadFile({
      fileContent: buffer,
      fileName,
      contentType: file.type,
    });
    
    // Generate signed URL (valid for 1 hour)
    const signedUrl = await storage.generatePresignedUrl({
      key,
      expireTime: 3600,
    });
    
    return NextResponse.json({
      success: true,
      data: {
        key,
        url: signedUrl,
        fileName: file.name,
        size: file.size,
        type: file.type,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("API Error [POST /api/upload]:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
