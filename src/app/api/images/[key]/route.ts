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

// GET /api/images/[key] - Get signed URL for image
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    
    // Decode the key (it may be URL-encoded)
    const decodedKey = decodeURIComponent(key);
    
    // Check if object storage is configured
    const isStorageConfigured = process.env.COZE_BUCKET_ENDPOINT_URL && 
      process.env.COZE_BUCKET_NAME;
    
    if (!isStorageConfigured) {
      // Return a placeholder response when storage is not configured
      return NextResponse.json({
        success: true,
        placeholder: true,
        url: `/placeholder.svg`,
        message: "Object storage not configured. Using placeholder.",
      });
    }
    
    // Check if file exists
    const exists = await storage.fileExists({ fileKey: decodedKey });
    
    if (!exists) {
      // Return placeholder for missing images
      return NextResponse.json({
        success: true,
        placeholder: true,
        url: `/placeholder.svg`,
        message: "Image not found in storage. Using placeholder.",
      });
    }
    
    // Generate signed URL (valid for 1 hour)
    const signedUrl = await storage.generatePresignedUrl({
      key: decodedKey,
      expireTime: 3600,
    });
    
    return NextResponse.json({
      success: true,
      url: signedUrl,
      key: decodedKey,
    });
  } catch (error) {
    console.error("API Error [GET /api/images/[key]]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate image URL" },
      { status: 500 }
    );
  }
}
