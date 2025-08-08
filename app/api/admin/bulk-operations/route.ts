import { getAdminAuth } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== BULK OPERATIONS API CALLED ===');
    
    const adminAuth = getAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !accessToken) {
      return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 });
    }

    // Fetch bulk operations using GraphQL
    const query = `
      query getBulkOperations($first: Int!) {
        bulkOperations(first: $first) {
          edges {
            node {
              id
              status
              errorCode
              createdAt
              completedAt
              objectCount
              fileSize
              url
              partialDataUrl
              rootObjectCount
              type
              query
            }
          }
        }
        currentBulkOperation {
          id
          status
          errorCode
          createdAt
          completedAt
          objectCount
          fileSize
          url
          partialDataUrl
          rootObjectCount
          type
          query
        }
      }
    `;

    const bulkResponse = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { first: 250 }
      }),
    });

    if (!bulkResponse.ok) {
      throw new Error(`Failed to fetch bulk operations: ${bulkResponse.statusText}`);
    }

    const bulkData = await bulkResponse.json();
    let operations = bulkData.data?.bulkOperations?.edges?.map((edge: any) => edge.node) || [];
    const currentOperation = bulkData.data?.currentBulkOperation;

    // Filter by status
    if (status !== 'all') {
      operations = operations.filter((op: any) => op.status === status.toUpperCase());
    }

    // Filter by type
    if (type !== 'all') {
      operations = operations.filter((op: any) => op.type === type.toUpperCase());
    }

    // Calculate statistics
    const stats = {
      total: operations.length,
      running: operations.filter((op: any) => op.status === 'RUNNING').length,
      completed: operations.filter((op: any) => op.status === 'COMPLETED').length,
      failed: operations.filter((op: any) => op.status === 'FAILED').length,
      canceled: operations.filter((op: any) => op.status === 'CANCELED').length,
      totalObjects: operations.reduce((sum: number, op: any) => sum + (op.objectCount || 0), 0),
      totalFileSize: operations.reduce((sum: number, op: any) => sum + (op.fileSize || 0), 0),
      averageCompletionTime: calculateAverageCompletionTime(operations),
      currentOperation: currentOperation,
    };

    // Enrich operations with additional metadata
    const enrichedOperations = operations.map((operation: any) => ({
      ...operation,
      duration: operation.completedAt && operation.createdAt 
        ? Math.floor((new Date(operation.completedAt).getTime() - new Date(operation.createdAt).getTime()) / 1000)
        : null,
      isActive: operation.status === 'RUNNING' || operation.status === 'CREATED',
      objectsPerSecond: operation.completedAt && operation.createdAt && operation.objectCount
        ? operation.objectCount / Math.max(1, Math.floor((new Date(operation.completedAt).getTime() - new Date(operation.createdAt).getTime()) / 1000))
        : null,
      sizeInMB: operation.fileSize ? (operation.fileSize / (1024 * 1024)).toFixed(2) : null,
    }));

    return NextResponse.json({
      bulk_operations: enrichedOperations,
      stats,
      pagination: {
        page: 1,
        limit: 250,
        total: enrichedOperations.length
      }
    });

  } catch (error) {
    console.error('Bulk operations fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch bulk operations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE BULK OPERATION API CALLED ===');
    
    const adminAuth = getAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { query: bulkQuery, type = 'QUERY', webhook_url } = body;

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !accessToken) {
      return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 });
    }

    // Create bulk operation using GraphQL
    const mutation = `
      mutation bulkOperationRunQuery($query: String!, $webhook: WebhookSubscriptionInput) {
        bulkOperationRunQuery(query: $query, webhook: $webhook) {
          bulkOperation {
            id
            status
            query
            rootObjectCount
            type
            createdAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables: any = {
      query: bulkQuery,
    };

    // Add webhook if provided
    if (webhook_url) {
      variables.webhook = {
        topic: 'BULK_OPERATIONS_FINISH',
        callbackUrl: webhook_url,
        format: 'JSON'
      };
    }

    const createResponse = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create bulk operation: ${createResponse.statusText}`);
    }

    const createData = await createResponse.json();

    if (createData.data?.bulkOperationRunQuery?.userErrors?.length > 0) {
      throw new Error(createData.data.bulkOperationRunQuery.userErrors[0].message);
    }

    return NextResponse.json({
      bulk_operation: createData.data?.bulkOperationRunQuery?.bulkOperation,
      success: true,
      message: 'Bulk operation created successfully'
    });

  } catch (error) {
    console.error('Bulk operation creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create bulk operation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !accessToken) {
      return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 });
    }

    if (action === 'cancel_current') {
      // Cancel current bulk operation
      const mutation = `
        mutation bulkOperationCancel {
          bulkOperationCancel {
            bulkOperation {
              id
              status
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const cancelResponse = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: mutation }),
      });

      if (!cancelResponse.ok) {
        throw new Error(`Failed to cancel bulk operation: ${cancelResponse.statusText}`);
      }

      const cancelData = await cancelResponse.json();

      if (cancelData.data?.bulkOperationCancel?.userErrors?.length > 0) {
        throw new Error(cancelData.data.bulkOperationCancel.userErrors[0].message);
      }

      return NextResponse.json({
        bulk_operation: cancelData.data?.bulkOperationCancel?.bulkOperation,
        success: true,
        message: 'Bulk operation canceled successfully'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Bulk operation update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update bulk operation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to calculate average completion time
function calculateAverageCompletionTime(operations: any[]): number | null {
  const completedOps = operations.filter(op => 
    op.status === 'COMPLETED' && op.createdAt && op.completedAt
  );

  if (completedOps.length === 0) return null;

  const totalTime = completedOps.reduce((sum, op) => {
    const duration = new Date(op.completedAt).getTime() - new Date(op.createdAt).getTime();
    return sum + duration;
  }, 0);

  return Math.floor(totalTime / completedOps.length / 1000); // Return in seconds
} 