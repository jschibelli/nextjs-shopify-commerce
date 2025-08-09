import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

// Helper function to extract numeric ID from Shopify ID
function extractNumericId(shopifyId: string): string {
  return shopifyId.replace(/^gid:\/\/shopify\/\w+\//, '');
}

// POST - Upload images to a product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15 compatibility
    const { id } = await params;
    
    // Verify admin authentication
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access denied' },
        { status: 403 }
      );
    }

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Shopify configuration missing' },
        { status: 500 }
      );
    }

    const productId = extractNumericId(id);
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const baseUrl = SHOPIFY_STORE_DOMAIN.startsWith('https://') 
      ? SHOPIFY_STORE_DOMAIN 
      : `https://${SHOPIFY_STORE_DOMAIN}`;
    
    const endpoint = `${baseUrl}/admin/api/2024-01/products/${productId}/images.json`;

    console.log('Uploading images to product:', {
      endpoint,
      productId,
      fileCount: files.length
    });

    // Upload images one by one
    const uploadedImages = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file) {
        console.error('File is undefined at index:', i);
        continue;
      }
      
      try {
        // Convert file to base64 for Shopify API
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = file.type;
        
        const imageData = {
          image: {
            attachment: base64,
            filename: file.name,
            position: i + 1
          }
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(imageData)
        });

        if (response.ok) {
          const data = await response.json();
          uploadedImages.push(data.image);
          console.log('Image uploaded successfully:', data.image.id);
        } else {
          const errorText = await response.text();
          console.error('Failed to upload image:', response.status, errorText);
        }
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }

    return NextResponse.json({
      success: true,
      uploadedImages,
      message: `Successfully uploaded ${uploadedImages.length} images`
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 