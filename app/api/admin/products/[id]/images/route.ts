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
    const body = await request.json();
    const { images } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
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
      imageCount: images.length
    });

    // Upload images one by one
    const uploadedImages = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      // Handle base64 images by converting to file upload
      if (image.src.startsWith('data:')) {
        console.log('Processing base64 image:', i);
        
        try {
          // Extract the base64 data
          const base64Data = image.src.split(',')[1];
          const mimeType = image.src.split(':')[1].split(';')[0];
          
          // Convert base64 to buffer
          const buffer = Buffer.from(base64Data, 'base64');
          
          // For now, we'll skip base64 images and log a message
          // In a production environment, you'd want to:
          // 1. Save the base64 to a temporary file
          // 2. Upload that file to Shopify
          // 3. Clean up the temporary file
          console.log('Base64 image detected - would need file upload implementation');
          console.log('Image size:', buffer.length, 'bytes');
          console.log('MIME type:', mimeType);
          
          // For now, we'll skip these and just log
          continue;
        } catch (error) {
          console.error('Error processing base64 image:', error);
          continue;
        }
      }

      // Handle regular image URLs
      const imageData = {
        image: {
          src: image.src,
          alt: image.alt || '',
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

// DELETE - Delete an image from a product
export async function DELETE(
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
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const baseUrl = SHOPIFY_STORE_DOMAIN.startsWith('https://') 
      ? SHOPIFY_STORE_DOMAIN 
      : `https://${SHOPIFY_STORE_DOMAIN}`;
    
    const endpoint = `${baseUrl}/admin/api/2024-01/products/${productId}/images/${imageId}.json`;

    console.log('Deleting image from product:', endpoint);

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete image:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to delete image: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    console.log('Image deleted successfully');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 